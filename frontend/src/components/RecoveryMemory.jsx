import React, { useEffect } from 'react'

export default function RecoveryMemory({ memories, onRefresh }) {
  useEffect(() => {
    onRefresh()
  }, [onRefresh])

  if (!memories || memories.length === 0) {
    return (
      <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-8 text-center text-[#9893A8] font-mono">
        <span className="text-2xl block mb-2">🧠</span>
        <span>Memory bank is empty. No recurring failure patterns cached yet.</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-mono">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="text-[#A855F7]">🧠</span>
          <h2 className="text-sm font-bold text-[#F5F3FF] tracking-wider uppercase">
            FAILURE INTELLIGENCE MEMORY BANK
          </h2>
        </div>
        <button 
          onClick={onRefresh} 
          className="text-xs text-[#A855F7] hover:text-[#F5F3FF] bg-[#151020] px-3 py-1 rounded border border-[#261E3B] transition-colors cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="space-y-3">
        {memories.map(mem => (
          <div 
            key={mem.id} 
            className="bg-[#0D0B14] border border-[#241D35] hover:border-[#7C3AED]/40 rounded-xl p-5 shadow-panel transition-all"
          >
            <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#241D35]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/20">
                  {mem.error_type}
                </span>
                <span className="text-xs text-[#F5F3FF] font-semibold">
                  {mem.file}:{mem.line}
                </span>
              </div>
              <span className="text-[10px] bg-[#151020] px-2 py-0.5 rounded text-[#9893A8] border border-[#261E3B]">
                Origin: {mem.incident_id}
              </span>
            </div>
            
            {/* Signature Hash */}
            <div className="text-[11px] text-[#A855F7] bg-[#07070B] p-2.5 rounded-lg border border-[#241D35] break-all mb-3">
              <span className="text-[#666075] select-none mr-2">SIG:</span>
              {mem.error_signature}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
              <div className="bg-[#151020] p-2.5 rounded border border-[#261E3B]">
                <span className="text-[#666075] text-[10px] block mb-0.5 uppercase">VERIFIED REPAIR PLAN</span>
                <span className="text-[#10B981] font-bold">{mem.selected_plan_name || 'Guard Clause Fix'}</span>
              </div>
              <div className="bg-[#151020] p-2.5 rounded border border-[#261E3B]">
                <span className="text-[#666075] text-[10px] block mb-0.5 uppercase">LEARNING STATE</span>
                <span className="text-[#A855F7] font-semibold">Instant-Recall Active</span>
              </div>
            </div>
            
            <div className="bg-[#151020] p-2.5 rounded border border-[#261E3B]">
              <span className="text-[#666075] text-[10px] block mb-0.5 uppercase">DIAGNOSED ROOT CAUSE</span>
              <p className="text-xs text-[#9893A8] leading-relaxed">{mem.root_cause}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
