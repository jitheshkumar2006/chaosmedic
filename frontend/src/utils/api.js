import { demoEngine } from './demoEngine'

const API_BASE = '/api'

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) throw new Error('Failed to fetch health')
    return await res.json()
  } catch (e) {
    return demoEngine.getHealth()
  }
}

export async function fetchIncidents() {
  try {
    const res = await fetch(`${API_BASE}/incidents`)
    if (!res.ok) throw new Error('Failed to fetch incidents')
    return await res.json()
  } catch (e) {
    return demoEngine.getIncidents()
  }
}

export async function fetchActiveIncident() {
  try {
    const res = await fetch(`${API_BASE}/incidents/active/current`)
    if (res.status === 200) {
      return await res.json()
    }
    return null
  } catch (e) {
    return demoEngine.getActiveIncident()
  }
}

export async function fetchIncident(id) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`)
    if (!res.ok) throw new Error('Failed to fetch incident')
    return await res.json()
  } catch (e) {
    return demoEngine.getIncidents().find(i => i.id === id) || null
  }
}

export async function fetchIncidentEvents(id) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/events`)
    if (!res.ok) throw new Error('Failed to fetch events')
    return await res.json()
  } catch (e) {
    const inc = demoEngine.getActiveIncident()
    return inc ? inc.events : []
  }
}

export async function triggerFailure() {
  try {
    const res = await fetch(`${API_BASE}/demo/trigger-failure`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to trigger chaos')
    return await res.json()
  } catch (e) {
    demoEngine.startSimulation()
    return { status: 'chaos_activated' }
  }
}

export async function resetDemo() {
  try {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to reset demo')
    return await res.json()
  } catch (e) {
    demoEngine.reset()
    return { status: 'reset_complete' }
  }
}

export function getReportUrl(id, disposition = 'inline') {
  return `${API_BASE}/incidents/${id}/report?disposition=${disposition}`
}

export async function fetchReportStatus(id) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/report/status`)
    if (!res.ok) throw new Error('Failed to fetch report status')
    return await res.json()
  } catch (e) {
    return { exists: true, ready: true, status: 'ready' }
  }
}

export async function downloadReport(id) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/report?disposition=attachment`)
    if (!res.ok) throw new Error('Failed to download from backend')
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
  } catch (e) {
    // Client-side fallback PDF generation for GitHub Pages and offline demo
    const { generateClientIncidentPDF } = await import('./clientPdf')
    const inc = demoEngine.getActiveIncident() || demoEngine.getIncidents().find(i => i.id === id)
    const doc = generateClientIncidentPDF(inc || { id })
    doc.save(`ChaosMedic_Incident_${id}.pdf`)
    return true
  }
}

export async function viewReport(id) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/report?disposition=inline`)
    if (!res.ok) throw new Error('Failed to open from backend')
    const blob = await res.blob()
    const fileBlob = new Blob([blob], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(fileBlob)
    const newTab = window.open(url, '_blank')
    if (!newTab) window.location.href = url
    setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    return true
  } catch (e) {
    // Client-side fallback PDF preview for GitHub Pages and offline demo
    const { generateClientIncidentPDF } = await import('./clientPdf')
    const inc = demoEngine.getActiveIncident() || demoEngine.getIncidents().find(i => i.id === id)
    const doc = generateClientIncidentPDF(inc || { id })
    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    window.open(url, '_blank')
    return true
  }
}

export async function fetchMemories() {
  try {
    const res = await fetch(`${API_BASE}/memory`)
    if (!res.ok) throw new Error('Failed to fetch failure memories')
    return await res.json()
  } catch (e) {
    return demoEngine.getMemories()
  }
}

export async function connectApplication(url) {
  try {
    const res = await fetch(`${API_BASE}/applications/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to connect')
    return data
  } catch (e) {
    return {
      connected: true,
      url: url || 'http://localhost:8001',
      is_demo_app: true,
      status_code: 200,
      response_time_ms: 18,
      health: 'Healthy'
    }
  }
}

export async function disconnectApplication() {
  try {
    const res = await fetch(`${API_BASE}/applications/disconnect`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to disconnect')
    return await res.json()
  } catch (e) {
    return { status: 'disconnected' }
  }
}

export async function fetchApplicationStatus() {
  try {
    const res = await fetch(`${API_BASE}/applications/status`)
    if (!res.ok) throw new Error('Failed to fetch status')
    return await res.json()
  } catch (e) {
    return null
  }
}
