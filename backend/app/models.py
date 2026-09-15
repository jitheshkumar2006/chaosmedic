from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class IncidentStatus(str, Enum):
    DETECTED = 'detected'
    INVESTIGATING = 'investigating'
    DIAGNOSING = 'diagnosing'
    GENERATING = 'generating'
    PLANNING = 'planning'
    VALIDATING = 'validating'
    RECOVERING = 'recovering'
    VERIFYING = 'verifying'
    RESOLVED = 'resolved'
    FAILED = 'failed'

class Severity(str, Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'

class AgentStatus(str, Enum):
    WAITING = 'waiting'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'

class PlanStatus(str, Enum):
    PENDING = 'pending'
    TESTING = 'testing'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    SELECTED = 'selected'

class AgentEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_id: str
    agent: str
    status: AgentStatus
    message: str
    data: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RecoveryPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_id: str
    plan_number: int
    name: str
    description: str
    change_description: str
    expected_result: str
    risk_level: str = 'low'
    status: PlanStatus = PlanStatus.PENDING
    before_code: str = ''
    after_code: str = ''
    patch_diff: str = ''
    test_total: int = 0
    test_passed: int = 0
    test_failed: int = 0
    health_check_passed: bool = False
    is_recommended: bool = False
    rejection_reason: str = ''
    why_selected: str = ''
    why_rejected: str = ''

class RootCause(BaseModel):
    error_type: str
    error_message: str
    file: str
    line: int
    probable_cause: str
    confidence: float  # 0.0 - 1.0
    stack_trace: str
    relevant_code: str = ''

class Incident(BaseModel):
    id: str = Field(default_factory=lambda: f'CM-{uuid.uuid4().hex[:4].upper()}')
    service: str = 'User API'
    status: IncidentStatus = IncidentStatus.DETECTED
    severity: Severity = Severity.CRITICAL
    http_status: int = 500
    error_message: str = ''
    stack_trace: str = ''
    root_cause: Optional[RootCause] = None
    recovery_plans: List[RecoveryPlan] = []
    selected_plan_id: Optional[str] = None
    events: List[AgentEvent] = []
    agents: Dict[str, AgentStatus] = Field(default_factory=lambda: {
        'detection': AgentStatus.WAITING,
        'diagnosis': AgentStatus.WAITING,
        'patch_generation': AgentStatus.WAITING,
        'recovery_planning': AgentStatus.WAITING,
        'validation': AgentStatus.WAITING,
        'recovery': AgentStatus.WAITING,
        'verification': AgentStatus.WAITING,
    })
    similar_incident_id: Optional[str] = None
    recovery_duration: Optional[float] = None  # seconds
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class FailureMemory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    error_signature: str  # hash of error_type + file + line
    error_type: str
    file: str
    line: int
    root_cause: str
    selected_plan_name: str
    patch_diff: str
    incident_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SystemHealth(BaseModel):
    status: str  # 'healthy', 'incident_detected', 'recovering'
    demo_app_healthy: bool
    active_incidents: int
    total_services: int = 3
    demo_mode: bool = False

class ApplicationConnectRequest(BaseModel):
    url: str

class ApplicationAccessStatus(BaseModel):
    runtime: bool = True
    monitoring: bool = True
    source_code: bool = False
    deployment: bool = False

class ConnectedApplication(BaseModel):
    connected: bool = True
    url: str
    name: str = 'Application'
    status_code: int = 200
    response_time_ms: float = 0.0
    health: str = 'healthy'
    monitoring_available: bool = True
    code_access_required_for_repair: bool = True
    is_demo_app: bool = False
    access: ApplicationAccessStatus = Field(default_factory=ApplicationAccessStatus)
    connected_at: datetime = Field(default_factory=datetime.utcnow)

