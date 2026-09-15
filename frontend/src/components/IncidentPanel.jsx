import React from 'react'

export default function IncidentPanel({ incident }) {
  if (!incident) return null

  const isResolved = incident.status === 'resolved'
  const isFailed = incident.status === 'failed'
  const statusColor = isResolved 
    ? 'text-[#10B981]' 
    : isFailed 
    ? 'text-[#EF4444]' 
    : 'text-[#A855F7]'

  const badgeBg = isResolved
    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
    : isFailed
    ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
    : 'bg-[#7C3AED]/20 text-[#A855F7] border-[#7C3AED]/40'

  return (
    <div className={`bg-[#0D0B14] rounded-xl p-6 border transition-all duration-300 shadow-panel relative overflow-hidden ${
      isResolved 
        ? 'border-[#10B981]/30' 
        : 'border-[#EF4444]/60 shadow-glow-red'
    }`}>
      {/* Top Incident Status Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-[#241D35]">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${
            isResolved ? 'bg-[#10B981]' : 'bg-[#EF4444] animate-pulse-red'
          }`}></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider text-[#9893A8] uppercase">
                ACTIVE INCIDENT
              </span>
              <span className="font-mono text-base font-black text-[#F5F3FF]">
                {incident.id || 'CM-XXXX'}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                incident.severity === 'critical' || incident.severity === 'CRITICAL'
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {incident.severity || 'CRITICAL'} SEVERITY
              </span>
            </div>
            <div className="text-xs text-[#9893A8] font-mono mt-0.5">
              Service Target: <strong className="text-[#F5F3FF]">{incident.service || 'User API'}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center font-mono text-right">
          <div>
            <div className="text-2xl font-black tracking-tight text-[#EF4444] flex items-center gap-1.5 justify-end">
              <span className="text-xs font-semibold text-[#9893A8]">HTTP</span>
              <span>{incident.http_status || 500}</span>
            </div>
            <div className={`text-[11px] font-bold uppercase ${statusColor}`}>
              ● {incident.status || 'investigating'}
            </div>
          </div>
        </div>
      </div>

      {/* Captured Exception Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9893A8]">
          <span>CAPTURED RUNTIME EXCEPTION</span>
          <span className="text-zinc-500">Autonomous Telemetry Probe</span>
        </div>
        <div className="bg-[#07070B] p-4 rounded-lg font-mono text-xs text-[#EF4444] border border-[#EF4444]/20 break-words leading-relaxed shadow-inner">
          <span className="text-[#9893A8] select-none mr-2">&gt;</span>
          {incident.error_message || 'Unhandled runtime exception triggered 500 status on /users endpoint.'}
        </div>
      </div>

      {/* Similar Incident Recalled from Memory */}
      {incident.similar_incident_id && (
        <div className="mt-4 text-xs font-mono text-[#A855F7] bg-[#7C3AED]/10 border border-[#7C3AED]/30 p-3 rounded-lg flex items-center gap-2">
          <span>🧠</span>
          <span><strong>Memory Match:</strong> Similar historical failure pattern recognized: <strong className="text-[#F5F3FF]">{incident.similar_incident_id}</strong></span>
        </div>
      )}
    </div>
  )
}
