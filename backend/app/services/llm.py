import logging
from app.config import LLM_API_KEY, LLM_MODEL, LLM_PROVIDER, DEMO_MODE

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.demo_mode = DEMO_MODE
        self.llm = None
        if not self.demo_mode:
            try:
                self._init_llm()
            except Exception as e:
                logger.warning(f'Failed to initialize LLM, falling back to DEMO MODE: {e}')
                self.demo_mode = True
    
    def _init_llm(self):
        if LLM_PROVIDER == 'google':
            from langchain_google_genai import ChatGoogleGenerativeAI
            self.llm = ChatGoogleGenerativeAI(model=LLM_MODEL, google_api_key=LLM_API_KEY)
        elif LLM_PROVIDER == 'openai':
            from langchain_openai import ChatOpenAI
            self.llm = ChatOpenAI(model=LLM_MODEL, api_key=LLM_API_KEY)
        elif LLM_PROVIDER == 'anthropic':
            from langchain_anthropic import ChatAnthropic
            self.llm = ChatAnthropic(model=LLM_MODEL, api_key=LLM_API_KEY)
    
    async def analyze(self, prompt: str, fallback_response: dict = None) -> str:
        if self.demo_mode:
            return fallback_response if fallback_response else 'DEMO MODE: No LLM available'
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            logger.error(f'LLM call failed: {e}')
            if fallback_response:
                return fallback_response
            return f'LLM Error: {str(e)}'

llm_service = LLMService()
