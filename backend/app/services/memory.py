import hashlib
from typing import Optional
from app.database import db
from app.models import FailureMemory
import logging

logger = logging.getLogger(__name__)

class MemoryService:
    def make_signature(self, error_type: str, file: str, line: int) -> str:
        return hashlib.md5(f'{error_type}:{file}:{line}'.encode()).hexdigest()
    
    def find_similar(self, error_type: str, file: str, line: int) -> Optional[FailureMemory]:
        return db.find_similar_failure(error_type, file, line)
    
    def remember(self, incident_id: str, error_type: str, file: str, line: int, 
                 root_cause: str, plan_name: str, patch_diff: str):
        memory = FailureMemory(
            error_signature=self.make_signature(error_type, file, line),
            error_type=error_type,
            file=file,
            line=line,
            root_cause=root_cause,
            selected_plan_name=plan_name,
            patch_diff=patch_diff,
            incident_id=incident_id,
        )
        db.save_failure_memory(memory)
        logger.info(f'Remembered failure pattern: {error_type} at {file}:{line}')

memory_service = MemoryService()
