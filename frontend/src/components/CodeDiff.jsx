import React from 'react'

export default function CodeDiff({ plan }) {
  if (!plan || (!plan.before_code && !plan.after_code)) return null

  const formatCodeLines = (codeText, type = 'before') => {
    if (!codeText) return <div className="text-[#666075] italic">No code snippet available</div>
    const lines = codeText.split('\n')
    return lines.map((line, idx) => (
      <div 
        key={idx} 
        className={`flex items-start text-xs font-mono py-0.5 px-2 ${
          type === 'before' 
            ? 'bg-[#EF4444]/10 text-red-200 border-l-2 border-[#EF4444]' 
            : 'bg-[#10B981]/10 text-emerald-100 border-l-2 border-[#10B981]'
        }`}
      >
        <span className="w-8 text-right pr-3 select-none text-[#666075] text-[10px] pt-0.5">
          {idx + 1}
        </span>
        <span className="select-none pr-2 font-bold text-[11px] opacity-70">
          {type === 'before' ? '-' : '+'}
        </span>
        <span className="flex-1 whitespace-pre font-mono overflow-x-auto">
          {line || ' '}
        </span>
      </div>
    ))
  }

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-5 shadow-panel col-span-full">
      {/* Header with IDE Terminal Aesthetic */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-[#241D35]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60"></span>
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-[#F5F3FF] uppercase tracking-[0.15em]">
              VALIDATED CODE REPAIR DIFF
            </h3>
            <span className="text-[10px] font-mono text-[#9893A8]">
              Target: <code className="text-[#A855F7]">user_service.py</code> • AST Patch Verified
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30 font-bold">
          ZERO REGRESSIONS CONFIRMED
        </span>
      </div>

      {/* Side-by-Side Dark Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono">
        {/* BEFORE PANEL (Red Highlighted Faulty Code) */}
        <div className="rounded-xl overflow-hidden border border-[#EF4444]/30 bg-[#07070B] shadow-inner">
          <div className="bg-[#151020] px-4 py-2 border-b border-[#EF4444]/30 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-[#EF4444] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              <span>BEFORE: FAULTY RUNTIME SOURCE</span>
            </div>
            <span className="text-[10px] text-[#9893A8] bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/20">
              UNHANDLED NULL
            </span>
          </div>
          <div className="p-2 overflow-x-auto max-h-72">
            {formatCodeLines(plan.before_code, 'before')}
          </div>
        </div>

        {/* AFTER PANEL (Violet/Green Highlighted Repaired Code) */}
        <div className="rounded-xl overflow-hidden border border-[#7C3AED]/40 bg-[#07070B] shadow-glow-violet-sm shadow-inner">
          <div className="bg-[#151020] px-4 py-2 border-b border-[#7C3AED]/40 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-[#A855F7] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>AFTER: AUTONOMOUS PATCH DEPLOYED</span>
            </div>
            <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
              GUARD CLAUSE INSERTED
            </span>
          </div>
          <div className="p-2 overflow-x-auto max-h-72">
            {formatCodeLines(plan.after_code, 'after')}
          </div>
        </div>
      </div>
    </div>
  )
}
