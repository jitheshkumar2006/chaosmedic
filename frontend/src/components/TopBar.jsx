import React from 'react'

export default function TopBar({ connected, health, connectedApp, activeIncident }) {
  const isHealthy = health?.status === 'healthy'
  const isIncident = !isHealthy || !!activeIncident

  return (
    <header className="w-full bg-[#0D0B14] py-3 px-6 flex flex-wrap justify-between items-center border-b border-[#241D35] z-30 shadow-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center shadow-glow-violet-sm border border-[#A855F7]/30">
            <span className="text-white text-base">🛡️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-[#F5F3FF]">
                CHAOSMEDIC
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#7C3AED]/15 text-[#A855F7] border border-[#7C3AED]/30 font-bold">
                SRE CORE
              </span>
            </div>
            <p className="text-[10px] font-medium tracking-[0.18em] text-[#9893A8] uppercase">
              Autonomous Infrastructure Self-Healing
            </p>
          </div>
        </div>
      </div>

      {/* Command Strip Telemetry Badges */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Environment Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#151020] border border-[#261E3B] px-3 py-1.5 rounded-lg text-[#9893A8]">
          <span className="text-zinc-500">ENV:</span>
          <span className="text-[#F5F3FF] font-semibold">
            {health?.demo_mode ? 'LOCAL-SANDBOX' : 'PRODUCTION'}
          </span>
        </div>

        {/* Connected Application Badge */}
        {connectedApp && (
          <div className="hidden md:flex items-center gap-2 bg-[#151020] border border-[#261E3B] px-3 py-1.5 rounded-lg text-[#9893A8]">
            <span className="text-zinc-500">TARGET:</span>
            <span className="text-[#A855F7] font-semibold truncate max-w-[140px]" title={connectedApp.url}>
              {connectedApp.name || 'Demo App'}
            </span>
          </div>
        )}

        {/* Incident Status */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#151020] border border-[#261E3B] px-3 py-1.5 rounded-lg">
          <span className="text-zinc-500">STATE:</span>
          <span className={`font-bold uppercase ${isIncident ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
            {activeIncident ? activeIncident.status : 'STANDBY'}
          </span>
        </div>

        {/* System Health Pulse */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold ${
          isHealthy 
            ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' 
            : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444] animate-pulse-red'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#10B981] animate-pulse-green' : 'bg-[#EF4444]'}`}></div>
          <span className="tracking-wide">
            {isHealthy ? '● SYSTEM OPERATIONAL' : '● CRITICAL INCIDENT'}
          </span>
        </div>

        {/* WebSocket Stream Indicator */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151020] border border-[#261E3B] text-[#9893A8]"
          title={connected ? 'Live WebSocket stream active' : 'WebSocket connecting'}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#7C3AED] shadow-glow-violet-sm' : 'bg-zinc-600'}`}></div>
          <span className="text-[10px] hidden xl:inline text-zinc-400">TELEMETRY</span>
        </div>
      </div>
    </header>
  )
}
