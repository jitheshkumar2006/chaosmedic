import { useEffect, useRef, useCallback, useState } from 'react'

export function useWebSocket(onMessage) {
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setConnected(true)
        console.log('[ChaosMedic WS] Connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (onMessage) onMessage(data)
        } catch (e) {
          console.error('[ChaosMedic WS] Parse error:', e)
        }
      }
      
      ws.onclose = () => {
        setConnected(false)
        console.log('[ChaosMedic WS] Disconnected. Reconnecting in 2s...')
        reconnectTimer.current = setTimeout(connect, 2000)
      }
      
      ws.onerror = (err) => {
        console.error('[ChaosMedic WS] Error:', err)
        ws.close()
      }
      
      wsRef.current = ws
    } catch (e) {
      console.error('[ChaosMedic WS] Connection setup error:', e)
      reconnectTimer.current = setTimeout(connect, 2000)
    }
  }, [onMessage])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect])

  return { connected }
}
