import React, { useState, useEffect } from 'react'

export default function IncidentLanding({ onConnectChaosMedic }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [pulseVisible, setPulseVisible] = useState(true)
  const [glitchIndex, setGlitchIndex] = useState(-1)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const pulse = setInterval(() => {
      setPulseVisible(v => !v)
    }, 800)
    return () => clearInterval(pulse)
  }, [])

  // Subtle glitch effect on error lines
  useEffect(() => {
    const glitch = setInterval(() => {
      setGlitchIndex(Math.floor(Math.random() * 6))
      setTimeout(() => setGlitchIndex(-1), 120)
    }, 4000)
    return () => clearInterval(glitch)
  }, [])

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour12: false })
  const dateStr = currentTime.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  const traceLines = [
    'File "user_service.py", line 62, in get_users',
    '    formatted_users.append(format_user(u))',
    'File "user_service.py", line 42, in format_user',
    '    formatted_name = user[\'name\'].upper()',
    'TypeError: \'NoneType\' object is not subscriptable',
  ]

  return (
    <div className="min-h-screen bg-[#07070B] flex flex-col items-center justify-center px-4 relative overflow-hidden font-mono selection:bg-red-500/30">
      
      {/* Background red ambient glow */}
      <div className="absolute w-[800px] h-[800px] bg-[#EF4444]/[0.03] rounded-full blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }}>
      </div>

      {/* Top status bar */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-[#0A0810]/90 backdrop-blur-sm border-b border-red-500/20 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full bg-[#EF4444] ${pulseVisible ? 'opacity-100' : 'opacity-30'} transition-opacity`}></span>
          <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">SERVICE INCIDENT ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#9893A8]">{dateStr}</span>
          <span className="text-[10px] text-[#F5F3FF] font-bold tabular-nums">{timeStr}</span>
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Main incident card */}
        <div className="bg-[#0D0B14] border border-red-500/25 rounded-2xl relative overflow-hidden shadow-2xl shadow-red-950/20">
          {/* Red top accent */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#EF4444] to-transparent"></div>
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-red-500/10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">CRITICAL INCIDENT</span>
                </div>
                <h1 className="text-2xl font-black text-[#F5F3FF] tracking-wide">USER API</h1>
                <p className="text-xs text-[#9893A8] mt-1">user-service • production cluster</p>
              </div>
              <div className="text-right">
                <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 inline-block">
                  <span className="text-xs font-bold text-[#EF4444]">SEV-1</span>
                </div>
              </div>
            </div>

            {/* HTTP 500 display */}
            <div className="bg-[#0A0810] rounded-xl border border-red-500/15 p-6 mb-0">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-5xl font-black text-[#EF4444] tracking-tight leading-none">500</span>
                <span className="text-sm font-bold text-red-300/80 uppercase tracking-wider">Internal Server Error</span>
              </div>
              <p className="text-xs text-[#9893A8] mt-3">The application is currently unavailable. All requests to the affected endpoint are failing.</p>
            </div>
          </div>

          {/* Error details */}
          <div className="px-8 py-6 space-y-5">
            {/* Error message */}
            <div>
              <span className="text-[10px] font-bold text-[#9893A8] uppercase tracking-[0.15em] block mb-2.5">EXCEPTION</span>
              <div className="bg-[#0A0810] rounded-lg border border-red-500/10 px-4 py-3">
                <code className="text-sm text-[#EF4444] font-mono font-bold">
                  TypeError: 'NoneType' object is not subscriptable
                </code>
              </div>
            </div>

            {/* Stack trace */}
            <div>
              <span className="text-[10px] font-bold text-[#9893A8] uppercase tracking-[0.15em] block mb-2.5">TRACEBACK</span>
              <div className="bg-[#0A0810] rounded-lg border border-[#1a1525] overflow-hidden">
                {traceLines.map((line, i) => (
                  <div
                    key={i}
                    className={`px-4 py-1.5 text-[11px] border-b border-[#1a1525] last:border-b-0 flex items-center gap-3 ${
                      i === traceLines.length - 1
                        ? 'bg-red-500/[0.07] text-[#EF4444] font-bold'
                        : 'text-[#9893A8]'
                    } ${glitchIndex === i ? 'translate-x-[1px] opacity-80' : ''} transition-all duration-75`}
                  >
                    <span className="text-[9px] text-[#666075] w-3 text-right shrink-0">{i + 1}</span>
                    <code className="font-mono">{line}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#0A0810] rounded-lg border border-[#1a1525] px-3 py-2.5">
                <span className="text-[9px] font-bold text-[#666075] uppercase block mb-1">SERVICE</span>
                <span className="text-[11px] text-[#F5F3FF] font-bold">user-service</span>
              </div>
              <div className="bg-[#0A0810] rounded-lg border border-[#1a1525] px-3 py-2.5">
                <span className="text-[9px] font-bold text-[#666075] uppercase block mb-1">ENDPOINT</span>
                <span className="text-[11px] text-[#F5F3FF] font-bold">GET /users</span>
              </div>
              <div className="bg-[#0A0810] rounded-lg border border-[#1a1525] px-3 py-2.5">
                <span className="text-[9px] font-bold text-[#666075] uppercase block mb-1">STATUS</span>
                <span className="text-[11px] text-[#EF4444] font-bold">500 ERROR</span>
              </div>
              <div className="bg-[#0A0810] rounded-lg border border-[#1a1525] px-3 py-2.5">
                <span className="text-[9px] font-bold text-[#666075] uppercase block mb-1">DETECTED</span>
                <span className="text-[11px] text-[#F5F3FF] font-bold tabular-nums">{timeStr}</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="mx-8 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent"></div>

          {/* ChaosMedic CTA section */}
          <div className="px-8 py-7">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-lg bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center">
                <span className="text-xs">🛡️</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#F5F3FF] tracking-wider uppercase">CHAOSMEDIC</span>
                <span className="text-[10px] text-[#9893A8] ml-2">Autonomous recovery is available</span>
              </div>
            </div>

            <button
              onClick={onConnectChaosMedic}
              className="w-full py-4 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] text-white font-bold text-sm tracking-[0.15em] uppercase shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:shadow-[0_0_40px_rgba(124,58,237,0.35)] flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer border border-[#A855F7]/30 group"
            >
              <svg className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>CONNECT CHAOSMEDIC</span>
            </button>

            <p className="text-[10px] text-[#666075] text-center mt-3 leading-relaxed">
              AI-powered root cause analysis • automated patch generation • sandboxed validation • zero-downtime recovery
            </p>
          </div>
        </div>

        {/* Bottom status */}
        <div className="mt-5 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full bg-[#EF4444] ${pulseVisible ? 'opacity-100' : 'opacity-40'} transition-opacity`}></span>
            <span className="text-[9px] text-[#666075] uppercase tracking-widest">Incident Duration: Active</span>
          </div>
          <span className="text-[9px] text-[#666075] tracking-widest">CHAOSMEDIC v2.4</span>
        </div>
      </div>
    </div>
  )
}
