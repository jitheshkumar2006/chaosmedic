// Client-side simulation engine for ChaosMedic
// Automatically takes over when backend is offline or when running on GitHub Pages

const DEFAULT_STACK_TRACE = `Traceback (most recent call last):
  File "main.py", line 37, in read_users
    users = get_users()
  File "user_service.py", line 62, in get_users
    formatted_users.append(format_user(u))
  File "user_service.py", line 42, in format_user
    formatted_name = user['name'].upper()
TypeError: 'NoneType' object is not subscriptable`

const PLAN_01_BEFORE = `def format_user(user):
    formatted_name = user['name'].upper()
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"],
        "active": user.get("active", True)
    }`

const PLAN_01_AFTER = `def format_user(user):
    if user is None:
        return {
            "id": 0,
            "name": "UNKNOWN",
            "email": "unknown@example.com",
            "role": "guest",
            "active": False
        }
    formatted_name = user['name'].upper()
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"],
        "active": user.get("active", True)
    }`

const PLAN_02_BEFORE = PLAN_01_BEFORE
const PLAN_02_AFTER = `def format_user(user):
    try:
        formatted_name = user['name'].upper()
    except (TypeError, KeyError):
        return None
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"]
    }`

const PLAN_03_BEFORE = PLAN_01_BEFORE
const PLAN_03_AFTER = `def format_user(user):
    if not isinstance(user, dict) or not user.get('active'):
        return {}
    formatted_name = user['name'].upper()
    return {
        "id": user["id"],
        "name": formatted_name,
        "email": user["email"],
        "role": user["role"]
    }`

class DemoEngine {
  constructor() {
    this.activeIncident = null
    this.incidents = []
    this.memories = []
    this.listeners = []
    this.timer = null
    this.isSimulating = false
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notify(event, data) {
    this.listeners.forEach(l => l(event, data))
  }

  getHealth() {
    return {
      status: this.activeIncident ? (this.activeIncident.status === 'resolved' ? 'healthy' : 'incident_detected') : 'healthy',
      demo_app_healthy: !this.activeIncident || this.activeIncident.status === 'resolved',
      active_incidents: this.activeIncident && this.activeIncident.status !== 'resolved' ? 1 : 0,
      total_services: 3,
      demo_mode: true
    }
  }

  getActiveIncident() {
    return this.activeIncident
  }

  getIncidents() {
    return this.incidents
  }

  getMemories() {
    return this.memories
  }

  reset() {
    if (this.timer) clearTimeout(this.timer)
    this.isSimulating = false
    this.activeIncident = null
    this.notify('incident_update', null)
  }

  startSimulation() {
    if (this.isSimulating) return
    this.isSimulating = true

    const id = `CM-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`
    const now = new Date()

    const incident = {
      id,
      service: 'User API',
      status: 'detected',
      severity: 'critical',
      http_status: 500,
      error_message: "'NoneType' object is not subscriptable",
      stack_trace: DEFAULT_STACK_TRACE,
      root_cause: null,
      recovery_plans: [],
      selected_plan_id: null,
      events: [
        {
          id: `ev-1`,
          incident_id: id,
          agent: 'detection',
          status: 'running',
          message: 'Failure detected: HTTP 500 on User API',
          timestamp: now.toISOString()
        }
      ],
      agents: {
        detection: 'running',
        diagnosis: 'waiting',
        patch_generation: 'waiting',
        recovery_planning: 'waiting',
        validation: 'waiting',
        recovery: 'waiting',
        verification: 'waiting'
      },
      similar_incident_id: null,
      recovery_duration: null,
      created_at: now.toISOString(),
      resolved_at: null
    }

    this.activeIncident = incident
    this.notify('incident_update', incident)

    // Stage 1: Detection Complete -> Diagnosis
    setTimeout(() => {
      incident.agents.detection = 'completed'
      incident.agents.diagnosis = 'running'
      incident.status = 'diagnosing'
      incident.events.push({
        id: `ev-2`,
        incident_id: id,
        agent: 'detection',
        status: 'completed',
        message: `Incident ${id} created. Service: User API, Status: HTTP 500, Severity: CRITICAL`,
        timestamp: new Date().toISOString()
      })
      incident.events.push({
        id: `ev-3`,
        incident_id: id,
        agent: 'diagnosis',
        status: 'running',
        message: 'Analyzing stack trace and source code AST...',
        timestamp: new Date().toISOString()
      })
      this.notify('incident_update', incident)
    }, 1200)

    // Stage 2: Diagnosis Complete -> Patch Gen
    setTimeout(() => {
      incident.agents.diagnosis = 'completed'
      incident.agents.patch_generation = 'running'
      incident.status = 'generating'
      incident.root_cause = {
        error_type: 'TypeError',
        error_message: "'NoneType' object is not subscriptable",
        file: 'user_service.py',
        line: 42,
        probable_cause: "A null user object was passed to format_user() without validation. Accessing user['name'] raised TypeError on NoneType.",
        confidence: 0.94,
        stack_trace: DEFAULT_STACK_TRACE,
        relevant_code: PLAN_01_BEFORE
      }
      incident.events.push({
        id: `ev-4`,
        incident_id: id,
        agent: 'diagnosis',
        status: 'completed',
        message: 'Root cause identified: user_service.py:42 with 94% confidence',
        timestamp: new Date().toISOString()
      })
      incident.events.push({
        id: `ev-5`,
        incident_id: id,
        agent: 'patch_generation',
        status: 'running',
        message: 'Synthesizing candidate recovery patches...',
        timestamp: new Date().toISOString()
      })
      this.notify('incident_update', incident)
    }, 2800)

    // Stage 3: Patch Gen -> Recovery Planning
    setTimeout(() => {
      incident.agents.patch_generation = 'completed'
      incident.agents.recovery_planning = 'running'
      incident.status = 'planning'

      incident.recovery_plans = [
        {
          id: `${id}-plan-1`,
          incident_id: id,
          plan_number: 1,
          name: 'Null Guard with Safe Default',
          description: 'Add an explicit null check before formatting. If user is None, return a default guest dictionary.',
          change_description: 'Added `if user is None: return {...}` check at line 42',
          expected_result: 'Prevents TypeError, guarantees non-null dict output',
          risk_level: 'low',
          status: 'pending',
          before_code: PLAN_01_BEFORE,
          after_code: PLAN_01_AFTER,
          patch_diff: '@@ -42,3 +42,10 @@\n+    if user is None:\n+        return {"id": 0, "name": "UNKNOWN", "email": "unknown@example.com", "role": "guest", "active": False}',
          test_total: 18,
          test_passed: 0,
          test_failed: 0,
          health_check_passed: false,
          is_recommended: true,
          why_selected: 'Passed 100% of regression tests and satisfies all API contracts.',
          why_rejected: ''
        },
        {
          id: `${id}-plan-2`,
          incident_id: id,
          plan_number: 2,
          name: 'Exception Handler with None Return',
          description: 'Wrap attribute access in try-except block and return None on failure.',
          change_description: 'Wrapped in try/except (TypeError, KeyError)',
          expected_result: 'Swallows exception but returns None to caller',
          risk_level: 'medium',
          status: 'pending',
          before_code: PLAN_02_BEFORE,
          after_code: PLAN_02_AFTER,
          patch_diff: '@@ -42,3 +42,8 @@\n-    formatted_name = user[\'name\'].upper()\n+    try:\n+        formatted_name = user[\'name\'].upper()\n+    except (TypeError, KeyError):\n+        return None',
          test_total: 18,
          test_passed: 0,
          test_failed: 0,
          health_check_passed: false,
          is_recommended: false,
          why_selected: '',
          why_rejected: 'Failed downstream consumers expecting dictionary rather than None.'
        },
        {
          id: `${id}-plan-3`,
          incident_id: id,
          plan_number: 3,
          name: 'Strict Schema Filter',
          description: 'Drop inactive or non-dict users completely.',
          change_description: 'Filter out inactive or malformed users',
          expected_result: 'Drops invalid records from list',
          risk_level: 'high',
          status: 'pending',
          before_code: PLAN_03_BEFORE,
          after_code: PLAN_03_AFTER,
          patch_diff: '@@ -42,3 +42,6 @@\n+    if not isinstance(user, dict) or not user.get(\'active\'):\n+        return {}',
          test_total: 18,
          test_passed: 0,
          test_failed: 0,
          health_check_passed: false,
          is_recommended: false,
          why_selected: '',
          why_rejected: 'Drops inactive users causing 3 regression test failures.'
        }
      ]

      incident.events.push({
        id: `ev-6`,
        incident_id: id,
        agent: 'patch_generation',
        status: 'completed',
        message: 'Generated 3 competing recovery plans with distinct risk profiles',
        timestamp: new Date().toISOString()
      })
      this.notify('incident_update', incident)
    }, 4400)

    // Stage 4: Validation (Sandbox testing)
    setTimeout(() => {
      incident.agents.recovery_planning = 'completed'
      incident.agents.validation = 'running'
      incident.status = 'validating'

      incident.events.push({
        id: `ev-7`,
        incident_id: id,
        agent: 'validation',
        status: 'running',
        message: 'Spawning isolated multi-process sandbox environments...',
        timestamp: new Date().toISOString()
      })
      this.notify('incident_update', incident)
    }, 5600)

    // Stage 5: Sandbox results & Selection
    setTimeout(() => {
      // Plan 1 passes
      incident.recovery_plans[0].test_passed = 18
      incident.recovery_plans[0].test_failed = 0
      incident.recovery_plans[0].health_check_passed = true
      incident.recovery_plans[0].status = 'selected'
      incident.selected_plan_id = incident.recovery_plans[0].id

      // Plan 2 partial fail
      incident.recovery_plans[1].test_passed = 14
      incident.recovery_plans[1].test_failed = 4
      incident.recovery_plans[1].health_check_passed = true
      incident.recovery_plans[1].status = 'rejected'

      // Plan 3 fail
      incident.recovery_plans[2].test_passed = 11
      incident.recovery_plans[2].test_failed = 7
      incident.recovery_plans[2].health_check_passed = false
      incident.recovery_plans[2].status = 'rejected'

      incident.agents.validation = 'completed'
      incident.agents.recovery = 'running'
      incident.status = 'recovering'

      incident.events.push({
        id: `ev-8`,
        incident_id: id,
        agent: 'validation',
        status: 'completed',
        message: 'Validation complete. Plan 01 approved (18/18 tests passed, health check OK)',
        timestamp: new Date().toISOString()
      })
      incident.events.push({
        id: `ev-9`,
        incident_id: id,
        agent: 'recovery',
        status: 'running',
        message: 'Deploying Plan 01 patch to live target user_service.py...',
        timestamp: new Date().toISOString()
      })
      this.notify('incident_update', incident)
    }, 7800)

    // Stage 6: Recovery applied -> Verification
    setTimeout(() => {
      incident.agents.recovery = 'completed'
      incident.agents.verification = 'running'
      incident.status = 'verifying'

      incident.events.push({
        id: `ev-10`,
        incident_id: id,
        agent: 'recovery',
        status: 'completed',
        message: 'Patch applied successfully. Live process hot-reloaded.',
        timestamp: new Date().toISOString()
      })
      incident.events.push({
        id: `ev-11`,
        incident_id: id,
        agent: 'verification',
        status: 'running',
        message: 'Executing post-recovery verification probes across /health and /users...',
        timestamp: new Date().toISOString()
      })
      this.notify('incident_update', incident)
    }, 9600)

    // Stage 7: Verification Complete -> RESOLVED
    setTimeout(() => {
      const resolvedAt = new Date()
      incident.agents.verification = 'completed'
      incident.status = 'resolved'
      incident.recovery_duration = 11.4
      incident.resolved_at = resolvedAt.toISOString()

      incident.events.push({
        id: `ev-12`,
        incident_id: id,
        agent: 'verification',
        status: 'completed',
        message: 'Verification PASSED: HTTP 200 OK verified on all endpoints.',
        timestamp: resolvedAt.toISOString()
      })

      // Store in memory
      this.memories.unshift({
        id: `mem-${id}`,
        error_signature: 'TypeError:user_service.py:42',
        error_type: 'TypeError',
        file: 'user_service.py',
        line: 42,
        root_cause: "A null user object was passed to format_user() without validation.",
        selected_plan_name: 'Null Guard with Safe Default',
        patch_diff: incident.recovery_plans[0].patch_diff,
        incident_id: id,
        created_at: resolvedAt.toISOString()
      })

      // Add to history
      this.incidents.unshift({ ...incident })
      this.isSimulating = false

      this.notify('incident_update', incident)
    }, 11500)
  }
}

export const demoEngine = new DemoEngine()
