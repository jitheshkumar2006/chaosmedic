import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchHealth, fetchActiveIncident, fetchIncidents, fetchMemories, disconnectApplication, fetchApplicationStatus } from '../utils/api'
import { useWebSocket } from './useWebSocket'

export function useIncident() {
  const [health, setHealth] = useState({
    status: 'healthy',
    demo_app_healthy: true,
    active_incidents: 0,
    demo_mode: true
  })
  const [incident, setIncident] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [memories, setMemories] = useState([])
  const pollRef = useRef(null)

  const onWsMessage = useCallback((msg) => {
    if (msg.type === 'incident_update') {
      const updated = msg.data
      setIncident(updated)
      
      // Update health state
      if (updated.status === 'resolved') {
        setHealth(h => ({
          ...h,
          status: 'healthy',
          demo_app_healthy: true,
          active_incidents: 0
        }))
      } else if (updated.status !== 'failed') {
        setHealth(h => ({
          ...h,
          status: 'incident_detected',
          demo_app_healthy: false,
          active_incidents: 1
        }))
      }
    } else if (msg.type === 'agent_event') {
      setIncident(prev => {
        if (!prev) return prev
        const existingEvents = prev.events || []
        // Avoid duplicate events
        if (existingEvents.some(e => e.id === msg.data.id)) return prev
        return {
          ...prev,
          events: [...existingEvents, msg.data]
        }
      })
    }
  }, [])

  const { connected } = useWebSocket(onWsMessage)

  // Polling fallback / periodic sync
  const syncData = useCallback(async () => {
    try {
      const [h, active, allIncidents, mems] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchActiveIncident().catch(() => null),
        fetchIncidents().catch(() => []),
        fetchMemories().catch(() => [])
      ])

      if (h) setHealth(h)
      if (active) {
        setIncident(active)
      } else if (incident && incident.status === 'resolved') {
        // Keep resolved incident in view until user triggers or resets
      }
      if (allIncidents) setIncidents(allIncidents)
      if (mems) setMemories(mems)
    } catch (e) {
      // Backend might be restarting
    }
  }, [incident])

  useEffect(() => {
    syncData()
    pollRef.current = setInterval(syncData, connected ? 4000 : 1500)
    return () => clearInterval(pollRef.current)
  }, [syncData, connected])

  const refreshMemories = useCallback(async () => {
    try {
      const m = await fetchMemories()
      setMemories(m)
    } catch (e) {}
  }, [])

  const [connectedApp, setConnectedApp] = useState(() => {
    try {
      const stored = sessionStorage.getItem('chaosmedic_connected_app')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const updateConnectedApp = useCallback((appData) => {
    setConnectedApp(appData)
    try {
      if (appData) {
        sessionStorage.setItem('chaosmedic_connected_app', JSON.stringify(appData))
      } else {
        sessionStorage.removeItem('chaosmedic_connected_app')
      }
    } catch {}
  }, [])

  const disconnectApp = useCallback(async () => {
    try {
      await disconnectApplication()
    } catch {}
    updateConnectedApp(null)
  }, [updateConnectedApp])

  const clearIncident = useCallback(() => {
    setIncident(null)
    setHealth(h => ({
      ...h,
      status: 'healthy',
      demo_app_healthy: true,
      active_incidents: 0
    }))
  }, [])

  // Sync app status with backend on mount
  useEffect(() => {
    fetchApplicationStatus().then(status => {
      if (status && status.connected) {
        updateConnectedApp(status)
      }
    }).catch(() => {})
  }, [updateConnectedApp])

  return {
    health,
    incident,
    incidents,
    memories,
    connectedApp,
    updateConnectedApp,
    disconnectApp,
    setIncident,
    clearIncident,
    refreshMemories,
    connected,
    syncData
  }
}
