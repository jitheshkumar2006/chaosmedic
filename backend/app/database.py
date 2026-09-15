from typing import Dict, List, Optional
from app.models import Incident, FailureMemory, AgentEvent, ConnectedApplication
from app.config import DATA_DIR
import hashlib
import json
import os
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.incidents: Dict[str, Incident] = {}
        self.failure_memories: List[FailureMemory] = []
        self.connected_application: Optional[ConnectedApplication] = None
        self._incidents_file = DATA_DIR / 'incidents.json'
        self._memories_file = DATA_DIR / 'memories.json'
        self._load_persisted()
    
    def _load_persisted(self):
        """Load persisted incidents and memories from disk."""
        try:
            if self._incidents_file.exists():
                with open(self._incidents_file, 'r', encoding='utf-8') as f:
                    raw = json.load(f)
                    for item in raw:
                        try:
                            inc = Incident.model_validate(item)
                            self.incidents[inc.id] = inc
                        except Exception as e:
                            logger.warning(f'Failed to validate stored incident: {e}')
            if self._memories_file.exists():
                with open(self._memories_file, 'r', encoding='utf-8') as f:
                    raw = json.load(f)
                    for item in raw:
                        try:
                            mem = FailureMemory.model_validate(item)
                            self.failure_memories.append(mem)
                        except Exception as e:
                            logger.warning(f'Failed to validate stored memory: {e}')
        except Exception as e:
            logger.error(f'Error loading persisted data: {e}')
    
    def _persist_incidents(self):
        """Save incidents dict to disk."""
        try:
            data = [inc.model_dump(mode='json') for inc in self.incidents.values()]
            with open(self._incidents_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f'Error persisting incidents: {e}')

    def _persist_memories(self):
        """Save failure memories to disk."""
        try:
            data = [mem.model_dump(mode='json') for mem in self.failure_memories]
            with open(self._memories_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f'Error persisting memories: {e}')
    
    def set_connected_application(self, app: Optional[ConnectedApplication]):
        self.connected_application = app
        
    def get_connected_application(self) -> Optional[ConnectedApplication]:
        return self.connected_application
    
    def save_incident(self, incident: Incident):
        self.incidents[incident.id] = incident
        self._persist_incidents()
    
    def get_incident(self, incident_id: str) -> Optional[Incident]:
        return self.incidents.get(incident_id)
    
    def get_all_incidents(self) -> List[Incident]:
        return list(self.incidents.values())
    
    def get_active_incident(self) -> Optional[Incident]:
        for inc in self.incidents.values():
            status_val = inc.status.value if hasattr(inc.status, 'value') else inc.status
            if status_val not in ('resolved', 'failed'):
                return inc
        return None
    
    def save_failure_memory(self, memory: FailureMemory):
        self.failure_memories.append(memory)
        self._persist_memories()
    
    def find_similar_failure(self, error_type: str, file: str, line: int) -> Optional[FailureMemory]:
        sig = self._make_signature(error_type, file, line)
        for mem in self.failure_memories:
            if mem.error_signature == sig:
                return mem
        return None
    
    def _make_signature(self, error_type: str, file: str, line: int) -> str:
        return hashlib.md5(f'{error_type}:{file}:{line}'.encode()).hexdigest()
    
    def clear(self):
        """Reset active/in-progress incident without destroying historical resolved records."""
        from app.models import IncidentStatus
        for inc in list(self.incidents.values()):
            if inc.status not in (IncidentStatus.RESOLVED, IncidentStatus.FAILED, 'resolved', 'failed'):
                inc.status = IncidentStatus.FAILED
        self._persist_incidents()

db = Database()
