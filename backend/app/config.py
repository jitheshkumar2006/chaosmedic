import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
PROJECT_ROOT = BASE_DIR.parent  # chaosmedic/
DEMO_APP_DIR = PROJECT_ROOT / 'demo-app'
REPORTS_DIR = BASE_DIR / 'reports'
REPORTS_DIR.mkdir(exist_ok=True, parents=True)
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True, parents=True)

# LLM Configuration
LLM_API_KEY = os.getenv('LLM_API_KEY', '')
LLM_MODEL = os.getenv('LLM_MODEL', 'gemini-2.0-flash')
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'google')  # google, openai, anthropic

# Demo app
DEMO_APP_URL = os.getenv('DEMO_APP_URL', 'http://localhost:8001')
DEMO_APP_HOST = os.getenv('DEMO_APP_HOST', '127.0.0.1')
DEMO_APP_PORT = int(os.getenv('DEMO_APP_PORT', '8001'))

# Backend
BACKEND_HOST = os.getenv('BACKEND_HOST', '127.0.0.1')
BACKEND_PORT = int(os.getenv('BACKEND_PORT', '8000'))

# Monitoring
HEALTH_CHECK_INTERVAL = int(os.getenv('HEALTH_CHECK_INTERVAL', '3'))  # seconds

# Database
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR}/chaosmedic.db')

# Demo mode
DEMO_MODE = not bool(LLM_API_KEY)

# Sandbox
SANDBOX_TIMEOUT = int(os.getenv('SANDBOX_TIMEOUT', '30'))  # seconds
SANDBOX_BASE_PORT = int(os.getenv('SANDBOX_BASE_PORT', '9000'))
