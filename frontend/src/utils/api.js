const API_BASE = '/api'

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('Failed to fetch health')
  return res.json()
}

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`)
  if (!res.ok) throw new Error('Failed to fetch incidents')
  return res.json()
}

export async function fetchActiveIncident() {
  const res = await fetch(`${API_BASE}/incidents/active/current`)
  if (res.status === 200) {
    return res.json()
  }
  return null
}

export async function fetchIncident(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}`)
  if (!res.ok) throw new Error('Failed to fetch incident')
  return res.json()
}

export async function fetchIncidentEvents(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}/events`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function triggerFailure() {
  const res = await fetch(`${API_BASE}/demo/trigger-failure`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to trigger chaos')
  return res.json()
}

export async function resetDemo() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to reset demo')
  return res.json()
}

export function getReportUrl(id, disposition = 'inline') {
  return `${API_BASE}/incidents/${id}/report?disposition=${disposition}`
}

export async function fetchReportStatus(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}/report/status`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to fetch report status (${res.status})`)
  }
  return res.json()
}

export async function downloadReport(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}/report?disposition=attachment`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to download report (${res.status})`)
  }
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ChaosMedic_Incident_${id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => window.URL.revokeObjectURL(url), 2000)
  return true
}

export async function viewReport(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}/report?disposition=inline`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to open report (${res.status})`)
  }
  const blob = await res.blob()
  const fileBlob = new Blob([blob], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(fileBlob)
  const newTab = window.open(url, '_blank')
  if (!newTab) {
    // If popup blocked, fallback to normal window.location
    window.location.href = url
  }
  setTimeout(() => window.URL.revokeObjectURL(url), 60000)
  return true
}

export async function fetchMemories() {
  const res = await fetch(`${API_BASE}/memory`)
  if (!res.ok) throw new Error('Failed to fetch failure memories')
  return res.json()
}

export async function connectApplication(url) {
  const res = await fetch(`${API_BASE}/applications/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to connect to application')
  }
  return data
}

export async function disconnectApplication() {
  const res = await fetch(`${API_BASE}/applications/disconnect`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to disconnect application')
  return res.json()
}

export async function fetchApplicationStatus() {
  const res = await fetch(`${API_BASE}/applications/status`)
  if (!res.ok) throw new Error('Failed to fetch application status')
  return res.json()
}

