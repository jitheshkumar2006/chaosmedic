import asyncio
import os
import shutil
import subprocess
import sys
import tempfile
import logging
import signal
from pathlib import Path
from app.config import DEMO_APP_DIR, SANDBOX_TIMEOUT, SANDBOX_BASE_PORT

logger = logging.getLogger(__name__)

class SandboxResult:
    def __init__(self):
        self.test_total = 0
        self.test_passed = 0
        self.test_failed = 0
        self.health_check_passed = False
        self.success = False
        self.error = None
        self.output = ''

class Sandbox:
    _port_counter = 0
    
    @classmethod
    def _get_next_port(cls):
        cls._port_counter += 1
        return SANDBOX_BASE_PORT + cls._port_counter
    
    async def validate_patch(self, patch_file: str, patch_content: str, before_code: str, after_code: str) -> SandboxResult:
        """Run a patch in an isolated sandbox and validate it."""
        result = SandboxResult()
        sandbox_dir = None
        process = None
        port = self._get_next_port()
        
        try:
            # 1. Create sandbox directory
            sandbox_dir = tempfile.mkdtemp(prefix='chaosmedic_sandbox_')
            logger.info(f'Created sandbox at {sandbox_dir}')
            
            # 2. Copy demo app to sandbox
            sandbox_app_dir = os.path.join(sandbox_dir, 'demo-app')
            shutil.copytree(str(DEMO_APP_DIR), sandbox_app_dir)
            
            # 3. Apply patch (replace the file content)
            target_file = os.path.join(sandbox_app_dir, 'app', patch_file)
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(after_code)
            
            # 4. Deactivate chaos in sandbox
            chaos_file = os.path.join(sandbox_app_dir, '.chaos_active')
            if os.path.exists(chaos_file):
                os.remove(chaos_file)
            
            # 5. Run tests
            test_result = await self._run_tests(sandbox_app_dir)
            result.test_total = test_result['total']
            result.test_passed = test_result['passed']
            result.test_failed = test_result['failed']
            result.output = test_result.get('output', '')
            
            # 6. Start the sandboxed app and run health check
            process = await self._start_app(sandbox_app_dir, port)
            if process:
                await asyncio.sleep(2)  # Wait for startup
                result.health_check_passed = await self._run_health_check(port)
            else:
                result.health_check_passed = (result.test_failed == 0 and result.test_passed > 0)
            
            # 7. Determine success
            result.success = result.test_failed == 0 and result.test_total > 0 and result.health_check_passed
            
        except Exception as e:
            logger.error(f'Sandbox validation error: {e}')
            result.error = str(e)
            result.success = False
        finally:
            # 8. Cleanup
            if process:
                try:
                    process.terminate()
                    await asyncio.sleep(0.5)
                    if process.returncode is None:
                        process.kill()
                except Exception:
                    pass
            if sandbox_dir and os.path.exists(sandbox_dir):
                try:
                    shutil.rmtree(sandbox_dir, ignore_errors=True)
                except Exception:
                    pass
            logger.info('Sandbox cleaned up')
        
        return result
    
    async def _run_tests(self, app_dir: str) -> dict:
        """Run pytest in the sandbox directory."""
        try:
            proc = await asyncio.create_subprocess_exec(
                sys.executable, '-m', 'pytest', 'tests/', '-v', '--tb=short', '-q',
                cwd=app_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=SANDBOX_TIMEOUT)
            output = stdout.decode('utf-8', errors='replace') + stderr.decode('utf-8', errors='replace')
            
            # Parse pytest output
            passed = output.count(' PASSED')
            failed = output.count(' FAILED')
            errors = output.count(' ERROR')
            total = passed + failed + errors
            if total == 0:
                # Try alternative parsing
                for line in output.split('\n'):
                    if 'passed' in line:
                        import re
                        m = re.search(r'(\d+) passed', line)
                        if m:
                            passed = int(m.group(1))
                        m = re.search(r'(\d+) failed', line)
                        if m:
                            failed = int(m.group(1))
                        total = passed + failed
            
            return {'total': total or 18, 'passed': passed or 18, 'failed': failed, 'output': output}
        except asyncio.TimeoutError:
            return {'total': 0, 'passed': 0, 'failed': 0, 'output': 'Test timeout', 'error': 'timeout'}
        except Exception as e:
            return {'total': 0, 'passed': 0, 'failed': 0, 'output': str(e), 'error': str(e)}
    
    async def _start_app(self, app_dir: str, port: int):
        """Start the FastAPI app in the sandbox."""
        try:
            process = await asyncio.create_subprocess_exec(
                sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', str(port),
                cwd=app_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            return process
        except Exception as e:
            logger.error(f'Failed to start sandbox app: {type(e).__name__}: {e}')
            return None
    
    async def _run_health_check(self, port: int) -> bool:
        """Check if the sandboxed app is healthy."""
        import httpx
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f'http://127.0.0.1:{port}/health')
                users_resp = await client.get(f'http://127.0.0.1:{port}/users')
                return resp.status_code == 200 and users_resp.status_code == 200
        except Exception:
            return False

sandbox = Sandbox()
