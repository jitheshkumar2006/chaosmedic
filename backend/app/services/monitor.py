import asyncio
import httpx
import logging
from app.config import DEMO_APP_URL, HEALTH_CHECK_INTERVAL

logger = logging.getLogger(__name__)

class HealthMonitor:
    def __init__(self):
        self.running = False
        self.demo_app_healthy = True
        self.last_error = None
        self.on_failure_detected = None  # callback
        self._task = None
    
    async def start(self):
        self.running = True
        self._task = asyncio.create_task(self._monitor_loop())
        logger.info('Health monitor started')
    
    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info('Health monitor stopped')
    
    async def _monitor_loop(self):
        while self.running:
            try:
                await self._check_health()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f'Monitor error: {e}')
            await asyncio.sleep(HEALTH_CHECK_INTERVAL)
    
    async def _check_health(self):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Check health endpoint
                health_resp = await client.get(f'{DEMO_APP_URL}/health')
                # Also check the critical endpoint
                users_resp = await client.get(f'{DEMO_APP_URL}/users')
                
                if health_resp.status_code == 200 and users_resp.status_code == 200:
                    if not self.demo_app_healthy:
                        logger.info('Demo app recovered')
                    self.demo_app_healthy = True
                    self.last_error = None
                else:
                    error_data = None
                    if users_resp.status_code >= 500:
                        try:
                            error_data = users_resp.json()
                        except:
                            error_data = {'error': users_resp.text}
                    await self._handle_failure(users_resp.status_code, error_data)
        except httpx.ConnectError:
            logger.warning('Demo app not reachable')
            self.demo_app_healthy = False
        except Exception as e:
            logger.error(f'Health check error: {e}')
    
    async def _handle_failure(self, status_code: int, error_data: dict = None, force: bool = False):
        from app.database import db
        active = db.get_active_incident()
        if (self.demo_app_healthy and not active) or force:
            self.demo_app_healthy = False
            self.last_error = error_data
            logger.warning(f'Failure detected! HTTP {status_code}')
            if self.on_failure_detected:
                asyncio.create_task(self.on_failure_detected(status_code, error_data))
    
    async def check_once(self) -> dict:
        """Single health check, returns status dict."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                health_resp = await client.get(f'{DEMO_APP_URL}/health')
                users_resp = await client.get(f'{DEMO_APP_URL}/users')
                return {
                    'healthy': health_resp.status_code == 200 and users_resp.status_code == 200,
                    'health_status': health_resp.status_code,
                    'users_status': users_resp.status_code,
                }
        except Exception as e:
            return {'healthy': False, 'error': str(e)}

monitor = HealthMonitor()
