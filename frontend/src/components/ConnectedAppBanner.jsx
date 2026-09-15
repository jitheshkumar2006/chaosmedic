import React from 'react'

export default function ConnectedAppBanner({ app, health, onDisconnect }) {
  if (!app) return null

  const isHealthy = health?.status === 'healthy' && health?.demo_app_healthy
  const isDemo = app.is_demo_app

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-3 h-3 rounded-full shrink-0 ${isHealthy ? 'bg-[#10B981] animate-pulse-green' : 'bg-[#EF4444] animate-pulse-red'}`}></div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9893A8]">
              MONITORED TARGET:
            </span>
            <span className="text-xs font-bold text-[#F5F3FF]">
              {app.name || 'Target Application'}
            </span>
            {isDemo && (
              <span className="text-[10px] bg-[#7C3AED]/15 text-[#A855F7] px-2 py-0.5 rounded font-mono font-bold border border-[#7C3AED]/30">
                AUTONOMOUS DEMO RUNTIME
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#9893A8] font-mono mt-1 flex-wrap">
            <span className="text-[#A855F7]/80">{app.url}</span>
            <span className="text-[#352B4D]">•</span>
            <span className={isHealthy ? 'text-[#10B981] font-semibold' : 'text-[#EF4444] font-semibold'}>
              {isHealthy ? '● STATUS: 200 OK' : '● STATUS: 500 CRITICAL'}
            </span>
            {app.response_time_ms && (
              <>
                <span className="text-[#352B4D]">•</span>
                <span className="text-[#9893A8]">LATENCY: <strong className="text-[#F5F3FF]">{app.response_time_ms} ms</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
        <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 bg-[#151020] border border-[#261E3B] rounded text-[#10B981]">Runtime ✓</span>
          <span className="px-2 py-1 bg-[#151020] border border-[#261E3B] rounded text-[#10B981]">Telemetry ✓</span>
          <span className={`px-2 py-1 bg-[#151020] border rounded ${isDemo ? 'border-[#261E3B] text-[#10B981]' : 'border-amber-500/30 text-amber-400'}`}>
            {isDemo ? 'Code AST ✓' : 'Code AST ⚠'}
          </span>
          <span className={`px-2 py-1 bg-[#151020] border rounded ${isDemo ? 'border-[#261E3B] text-[#10B981]' : 'border-amber-500/30 text-amber-400'}`}>
            {isDemo ? 'Sandbox ✓' : 'Sandbox ⚠'}
          </span>
        </div>

        <button
          onClick={onDisconnect}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#151020] hover:bg-[#221936] text-[#9893A8] hover:text-[#F5F3FF] border border-[#261E3B] hover:border-[#7C3AED]/40 transition-all font-mono flex items-center gap-1.5 cursor-pointer"
          title="Disconnect target application"
        >
          <span>⏏</span>
          <span>DISCONNECT</span>
        </button>
      </div>
    </div>
  )
}
