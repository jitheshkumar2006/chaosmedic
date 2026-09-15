import React from 'react'
import { downloadReport, viewReport } from '../utils/api'

export default function IncidentHistory({ incidents, onSelect }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-8 text-center text-[#9893A8] font-mono">
        <span className="text-2xl block mb-2">📋</span>
        <span>No historical incidents recorded in database.</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#A855F7]">📜</span>
          <h2 className="text-sm font-bold text-[#F5F3FF] tracking-wider uppercase">
            INCIDENT AUDIT LOG
          </h2>
        </div>
        <span className="text-xs text-[#9893A8] bg-[#151020] px-2.5 py-1 rounded border border-[#261E3B]">
          {incidents.length} RECORDED INCIDENT(S)
        </span>
      </div>

      <div className="space-y-2.5">
        {incidents.map(inc => {
          const isResolved = inc.status === 'resolved'
          return (
            <div 
              key={inc.id} 
              className="bg-[#0D0B14] border border-[#241D35] hover:border-[#352B4D] hover:bg-[#151020]/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm font-mono"
            >
              <div 
                onClick={() => onSelect(inc)}
                className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${isResolved ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F5F3FF]">{inc.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isResolved ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#9893A8] truncate mt-0.5">
                    {inc.service} • {inc.error_message ? inc.error_message.substring(0, 50) + '...' : 'Internal Server Error'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                <div className="text-right text-xs">
                  <div className="text-zinc-400">
                    {new Date(inc.created_at).toLocaleTimeString()}
                  </div>
                  <div className="text-[10px] text-[#666075]">
                    Duration: {inc.recovery_duration ? `${inc.recovery_duration.toFixed(1)}s` : 'N/A'}
                  </div>
                </div>

                {isResolved && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        viewReport(inc.id)
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#151020] hover:bg-[#221936] text-[#F5F3FF] border border-[#261E3B] hover:border-[#7C3AED]/50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="View PDF Incident Report in browser"
                    >
                      <span>👁️</span>
                      <span>View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadReport(inc.id)
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#7C3AED]/20 hover:bg-[#7C3AED]/40 text-[#A855F7] border border-[#7C3AED]/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Download ChaosMedic_Incident_CM-XXXX.pdf"
                    >
                      <span>📥</span>
                      <span>PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
