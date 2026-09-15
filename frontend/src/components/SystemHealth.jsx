import React from 'react'

export default function SystemHealth({ health }) {
  const isHealthy = health?.status === 'healthy'
  
  return (
    <div className={`bg-[#0D0B14] border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 shadow-panel ${
      isHealthy ? 'border-[#241D35]' : 'border-[#EF4444]/40 shadow-glow-red'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          isHealthy ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]' : 'bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444] animate-pulse-red'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></div>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className={`text-base font-bold tracking-wide font-mono ${isHealthy ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {isHealthy ? 'SYSTEM OPERATIONAL' : 'INCIDENT ACTIVE — SERVICE DEGRADED'}
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              isHealthy ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
            }`}>
              {isHealthy ? 'NOMINAL' : 'ALERT'}
            </span>
          </div>
          <div className="text-xs text-[#9893A8] font-mono mt-1 flex items-center gap-3">
            <span>{health?.total_services || 3} Monitored Services</span>
            <span className="text-[#352B4D]">•</span>
            <span>
              {health?.active_incidents ? (
                <strong className="text-[#EF4444]">{health.active_incidents} Active Incident</strong>
              ) : (
                <span className="text-[#10B981]">0 Unresolved Issues</span>
              )}
            </span>
            <span className="text-[#352B4D]">•</span>
            <span className="text-zinc-500">Autonomous Healing Standby</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-center font-mono">
        {health?.demo_mode && (
          <div className="text-[11px] text-[#A855F7] bg-[#7C3AED]/15 px-3 py-1.5 rounded-lg border border-[#7C3AED]/30 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"></span>
            <span>AUTONOMOUS ENGINE ONLINE</span>
          </div>
        )}
      </div>
    </div>
  )
}
