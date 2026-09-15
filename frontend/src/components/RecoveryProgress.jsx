import React from 'react'

export default function RecoveryProgress({ status, duration }) {
  const steps = [
    { key: 'detected', label: 'DETECT' },
    { key: 'diagnosing', label: 'DIAGNOSE' },
    { key: 'generating', label: 'GENERATE' },
    { key: 'planning', label: 'PLANS' },
    { key: 'validating', label: 'VALIDATE' },
    { key: 'recovering', label: 'RECOVER' },
    { key: 'verifying', label: 'VERIFY' },
    { key: 'resolved', label: 'RESOLVED' }
  ]

  let currentIndex = steps.findIndex(s => s.key === status)
  if (currentIndex === -1) currentIndex = 0
  if (status === 'investigating') currentIndex = 1

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-5 shadow-panel col-span-full">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#241D35]">
        <div className="flex items-center gap-2">
          <span className="text-[#A855F7]">🛡️</span>
          <h3 className="text-xs font-mono font-bold text-[#F5F3FF] uppercase tracking-[0.15em]">
            AUTONOMOUS RECOVERY PIPELINE
          </h3>
        </div>
        {duration && status === 'resolved' && (
          <span className="text-xs font-mono bg-[#10B981]/15 text-[#10B981] px-2.5 py-1 rounded border border-[#10B981]/30 font-bold flex items-center gap-1.5">
            <span>⚡ RECOVERY DURATION:</span>
            <span>{typeof duration === 'number' ? duration.toFixed(1) : duration}s</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 relative w-full overflow-x-auto pb-2 select-none">
        {/* Progress Track Line */}
        <div className="absolute top-[17px] left-4 right-4 h-0.5 bg-[#1E172E] z-0"></div>
        <div 
          className="absolute top-[17px] left-4 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#10B981] z-0 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, (currentIndex / (steps.length - 1)) * 100))}%` }}
        ></div>
        
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || status === 'resolved'
          const isCurrent = idx === currentIndex && status !== 'resolved'
          
          let bubbleClass = 'bg-[#0D0B14] border-[#2E2640] text-[#666075]'
          let labelClass = 'text-[#666075]'

          if (isCompleted) {
            bubbleClass = 'bg-[#10B981] border-[#10B981] text-[#07070B] font-bold shadow-glow-green/20'
            labelClass = 'text-[#10B981] font-semibold'
          } else if (isCurrent) {
            bubbleClass = 'bg-[#151020] border-[#A855F7] text-[#A855F7] shadow-glow-violet animate-pulse-violet'
            labelClass = 'text-[#A855F7] font-bold'
          } else if (status === 'failed' && isCurrent) {
            bubbleClass = 'bg-[#151020] border-[#EF4444] text-[#EF4444]'
            labelClass = 'text-[#EF4444] font-bold'
          }

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 px-1 shrink-0">
              <div className={`w-8 h-8 rounded-full border-[2px] flex items-center justify-center text-xs font-mono transition-all duration-300 ${bubbleClass}`}>
                {isCompleted ? '✓' : isCurrent ? '●' : idx + 1}
              </div>
              <span className={`text-[10px] font-mono tracking-wider ${labelClass}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
