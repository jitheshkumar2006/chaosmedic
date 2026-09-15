import React, { useState } from 'react'

export default function RootCausePanel({ rootCause }) {
  const [showTrace, setShowTrace] = useState(false)

  if (!rootCause) return null

  const confidencePct = Math.round((rootCause.confidence || 0) * 100)

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-5 shadow-panel">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#241D35]">
        <div className="flex items-center gap-2">
          <span className="text-[#A855F7]">🔍</span>
          <h3 className="text-xs font-mono font-bold text-[#F5F3FF] uppercase tracking-[0.15em]">
            ROOT CAUSE DIAGNOSIS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 font-bold">
          AST VERIFIED
        </span>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-[#151020] border border-[#261E3B] p-3.5 rounded-lg">
          <div className="text-[10px] font-mono uppercase font-bold text-[#9893A8] mb-1">EXCEPTION TYPE</div>
          <div className="font-mono text-[#EF4444] text-xs font-bold break-all">
            {rootCause.error_type || 'Unknown'}
          </div>
        </div>
        <div className="bg-[#151020] border border-[#261E3B] p-3.5 rounded-lg">
          <div className="text-[10px] font-mono uppercase font-bold text-[#9893A8] mb-1">FAULT LOCATION</div>
          <div className="font-mono text-[#F5F3FF] text-xs font-bold flex items-center gap-1.5">
            <span className="text-[#A855F7]">{rootCause.file}</span>
            <span className="text-[#9893A8]">:</span>
            <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
              Line {rootCause.line}
            </span>
          </div>
        </div>
      </div>

      {/* Probable Cause Statement */}
      <div className="bg-[#151020] border border-[#261E3B] p-3.5 rounded-lg mb-4">
        <div className="text-[10px] font-mono uppercase font-bold text-[#9893A8] mb-1.5">
          PROBABLE ROOT CAUSE
        </div>
        <p className="text-xs text-[#F5F3FF] leading-relaxed">
          {rootCause.probable_cause}
        </p>
      </div>

      {/* Confidence Score Meter */}
      <div className="mb-4 bg-[#151020] border border-[#261E3B] p-3 rounded-lg">
        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
          <span className="text-[10px] font-bold text-[#9893A8] uppercase">DIAGNOSTIC CONFIDENCE</span>
          <span className="text-[#10B981] font-bold">{confidencePct}%</span>
        </div>
        <div className="w-full bg-[#07070B] h-2 rounded-full overflow-hidden border border-[#241D35]">
          <div 
            className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#10B981] transition-all duration-500 rounded-full" 
            style={{ width: `${confidencePct}%` }}
          ></div>
        </div>
      </div>

      {/* Stack Trace Collapsible */}
      {rootCause.stack_trace && (
        <div className="pt-1">
          <button 
            onClick={() => setShowTrace(!showTrace)}
            className="text-xs font-mono text-[#A855F7] hover:text-[#F5F3FF] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{showTrace ? '▼' : '▶'}</span>
            <span>{showTrace ? 'Hide Stack Trace' : 'View Runtime Stack Trace'}</span>
          </button>
          {showTrace && (
            <div className="mt-3 rounded-lg overflow-hidden border border-[#261E3B] shadow-inner">
              <div className="bg-[#151020] px-3 py-1.5 border-b border-[#261E3B] text-[10px] font-mono text-[#9893A8] flex justify-between">
                <span>TERMINAL DUMP</span>
                <span>PYTHON TRACEBACK</span>
              </div>
              <pre className="p-4 bg-[#07070B] text-[11px] font-mono text-[#9893A8] overflow-x-auto leading-relaxed max-h-60 m-0">
                {rootCause.stack_trace}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
