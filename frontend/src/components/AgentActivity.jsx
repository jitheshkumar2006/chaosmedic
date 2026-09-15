import React from 'react'

export default function AgentActivity({ agents, events }) {
  if (!agents) return null

  const agentOrder = [
    { key: 'detection', label: 'Detection', desc: 'Failure capture & triage' },
    { key: 'diagnosis', label: 'Diagnosis', desc: 'Traceback & AST inspection' },
    { key: 'patch_generation', label: 'Patch Generation', desc: 'Synthesizing 3 fix strategies' },
    { key: 'recovery_planning', label: 'Recovery Planning', desc: 'Risk ranking & validation' },
    { key: 'validation', label: 'Validation', desc: 'Ephemeral sandbox isolation' },
    { key: 'recovery', label: 'Recovery', desc: 'Live zero-downtime deployment' },
    { key: 'verification', label: 'Verification', desc: 'End-to-end health probe' }
  ]

  const getLatestMessage = (agentKey) => {
    if (!events) return null
    const agentEvents = events.filter(e => e.agent === agentKey)
    if (agentEvents.length === 0) return null
    return agentEvents[agentEvents.length - 1].message
  }

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-5 shadow-panel h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#241D35]">
        <h3 className="text-xs font-mono font-bold text-[#F5F3FF] uppercase tracking-[0.15em] flex items-center gap-2">
          <span className="text-[#A855F7]">⚡</span>
          <span>7-AGENT AUTONOMOUS PIPELINE</span>
        </h3>
        <span className="text-[10px] font-mono text-[#7C3AED] bg-[#7C3AED]/15 px-2 py-0.5 rounded border border-[#7C3AED]/30 font-bold">
          PARALLEL SRE
        </span>
      </div>

      <div className="relative flex-1">
        {/* Vertical Pipeline Connector Line */}
        <div className="absolute left-[13px] top-3 bottom-4 w-[2px] bg-[#1E172E] z-0"></div>

        <div className="flex flex-col gap-3.5 relative z-10">
          {agentOrder.map(({ key, label, desc }, idx) => {
            const status = agents[key] || 'waiting'
            const isCompleted = status === 'completed'
            const isRunning = status === 'running'
            const isFailed = status === 'failed'
            const isWaiting = status === 'waiting'

            let dotClasses = 'bg-[#151020] border-[#2E2640] text-[#666075]'
            let textClasses = 'text-[#9893A8]'
            let icon = <span className="text-[10px] font-mono text-[#666075]">{idx + 1}</span>

            if (isCompleted) {
              dotClasses = 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] shadow-glow-green/30'
              textClasses = 'text-[#F5F3FF]'
              icon = <span className="text-xs font-bold">✓</span>
            } else if (isRunning) {
              dotClasses = 'bg-[#7C3AED] border-[#A855F7] text-white shadow-glow-violet animate-pulse-violet'
              textClasses = 'text-[#F5F3FF] font-bold'
              icon = <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            } else if (isFailed) {
              dotClasses = 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] shadow-glow-red/30'
              textClasses = 'text-[#EF4444]'
              icon = <span className="text-xs font-bold">✕</span>
            }

            const message = getLatestMessage(key)

            return (
              <div 
                key={key} 
                className={`flex items-start gap-3 p-2 rounded-lg transition-all duration-200 ${
                  isRunning 
                    ? 'bg-[#151020] border border-[#7C3AED]/40 shadow-sm' 
                    : isCompleted 
                    ? 'hover:bg-[#151020]/40' 
                    : 'opacity-70'
                }`}
              >
                {/* Status Indicator Bubble */}
                <div className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${dotClasses}`}>
                  {icon}
                </div>

                {/* Agent Information */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-mono font-medium truncate ${textClasses}`}>
                      {label}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                      isCompleted 
                        ? 'bg-[#10B981]/10 text-[#10B981]' 
                        : isRunning 
                        ? 'bg-[#7C3AED]/20 text-[#A855F7] animate-pulse' 
                        : isFailed 
                        ? 'bg-[#EF4444]/20 text-[#EF4444]' 
                        : 'text-[#666075]'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#9893A8]/70 truncate font-mono">
                    {desc}
                  </div>

                  {isRunning && message && (
                    <div className="text-[11px] text-[#A855F7] bg-[#07070B] p-1.5 rounded border border-[#7C3AED]/30 mt-1.5 font-mono truncate animate-slide-in">
                      &gt; {message}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
