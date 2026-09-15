import React, { useState, useEffect, useRef } from 'react'
import { fetchIncidentEvents } from '../utils/api'

export default function IncidentReplay({ incidentId }) {
  const [events, setEvents] = useState([])
  const [playing, setPlaying] = useState(false)
  const [visibleEvents, setVisibleEvents] = useState([])
  const endRef = useRef(null)

  useEffect(() => {
    if (!incidentId) return
    const loadEvents = async () => {
      try {
        const data = await fetchIncidentEvents(incidentId)
        setEvents(data)
        setVisibleEvents(data)
      } catch (e) {
        console.error("Failed to fetch events", e)
      }
    }
    loadEvents()
  }, [incidentId])

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [visibleEvents])

  const handlePlay = () => {
    setPlaying(true)
    setVisibleEvents([])
    let i = 0
    const interval = setInterval(() => {
      if (i < events.length) {
        setVisibleEvents(prev => [...prev, events[i]])
        i++
      } else {
        clearInterval(interval)
        setPlaying(false)
      }
    }, 400)
  }

  if (!incidentId) {
    return (
      <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-8 text-center text-[#9893A8] font-mono">
        <span className="text-2xl block mb-2">📼</span>
        <span>No incident selected for telemetry replay. Trigger an incident first.</span>
      </div>
    )
  }

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl overflow-hidden flex flex-col h-full max-h-[700px] shadow-panel font-mono">
      {/* Terminal Replay Header */}
      <div className="bg-[#151020] p-4 border-b border-[#241D35] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
          </div>
          <span className="text-xs font-bold text-[#F5F3FF]">
            TELEMETRY REPLAY: <span className="text-[#A855F7]">{incidentId}</span>
          </span>
        </div>

        <button 
          onClick={handlePlay} 
          disabled={playing || events.length === 0}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-glow-violet-sm cursor-pointer flex items-center gap-1.5 border border-[#A855F7]/30"
        >
          <span>{playing ? '⏳' : '▶'}</span>
          <span>{playing ? 'REPLAYING STREAM...' : 'REPLAY AUDIT TRAIL'}</span>
        </button>
      </div>

      {/* Terminal Log Console */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#07070B] text-xs space-y-2.5 border-t border-black">
        {visibleEvents.map((evt, idx) => {
          let dotColor = 'bg-[#666075]'
          let agentBadge = 'bg-[#7C3AED]/20 text-[#A855F7] border-[#7C3AED]/30'
          if (evt.status === 'completed') dotColor = 'bg-[#10B981]'
          if (evt.status === 'running') dotColor = 'bg-[#A855F7] animate-ping'
          if (evt.status === 'failed') {
            dotColor = 'bg-[#EF4444]'
            agentBadge = 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
          }
          
          return (
            <div key={idx} className="flex items-start gap-3 text-[#F5F3FF] animate-slide-in p-1 rounded hover:bg-[#151020]/40">
              <span className="text-[#666075] text-[11px] shrink-0 pt-0.5">
                {evt.timestamp ? evt.timestamp.split('T')[1].substring(0, 8) : '00:00:00'}
              </span>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`}></div>
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold mr-2 uppercase ${agentBadge}`}>
                  {evt.agent}
                </span>
                <span className={evt.status === 'failed' ? 'text-[#EF4444]' : 'text-zinc-300'}>
                  {evt.message}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
    </div>
  )
}
