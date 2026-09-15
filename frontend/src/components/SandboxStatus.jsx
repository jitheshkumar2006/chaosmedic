import React from 'react'

export default function SandboxStatus({ plan }) {
  if (!plan) return null

  const isApproved = plan.status === 'selected' || plan.status === 'approved'
  const isRejected = plan.status === 'rejected'

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-5 shadow-panel flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#241D35]">
          <div className="flex items-center gap-2">
            <span className="text-[#A855F7]">🧪</span>
            <h3 className="text-xs font-mono font-bold text-[#F5F3FF] uppercase tracking-[0.15em]">
              SANDBOX ISOLATION
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#A855F7] bg-[#7C3AED]/15 px-2 py-0.5 rounded border border-[#7C3AED]/30 font-bold">
            ZERO CONTAMINATION
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Production Shield Guard */}
          <div className="border border-dashed border-[#241D35] bg-[#07070B] rounded-lg p-2.5 text-center relative font-mono">
            <span className="text-[11px] font-bold text-[#9893A8] tracking-widest flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>PRODUCTION WORKLOAD ISOLATED</span>
            </span>
            <div className="text-[9px] text-[#666075] mt-0.5">
              Live traffic shielded from candidate patches
            </div>
          </div>

          {/* Ephemeral Sandbox Environment */}
          <div className="bg-[#151020] border border-[#7C3AED]/40 rounded-xl p-4 shadow-glow-violet-sm">
            <div className="text-[#A855F7] font-bold text-xs font-mono mb-3 text-center flex items-center justify-center gap-2">
              <span>🐳</span>
              <span>EPHEMERAL RUNTIME SANDBOX</span>
            </div>
            
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-[#F5F3FF] pb-1 border-b border-[#261E3B]">
                <span className="text-[#9893A8]">Patch Injection:</span>
                <span className="text-[#10B981] font-bold">✓ Complete</span>
              </div>
              
              <div className="bg-[#07070B] rounded-lg p-2.5 border border-[#261E3B]">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[#9893A8]">Pytest Regression Suite</span>
                  <span className={`font-bold ${plan.test_failed > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    {plan.test_passed}/{plan.test_total} Passed
                  </span>
                </div>
                <div className="w-full bg-[#151020] h-1.5 rounded-full overflow-hidden border border-[#241D35]">
                  <div 
                    className={`h-full transition-all duration-300 ${plan.test_failed > 0 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`} 
                    style={{ width: plan.test_total ? `${(plan.test_passed / plan.test_total) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-[#F5F3FF] pt-1">
                <span className="text-[#9893A8]">Health Check Probe:</span>
                <span className={`font-bold ${plan.health_check_passed ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {plan.health_check_passed ? '✓ 200 OK PASS' : '✕ 500 FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Output Pill */}
      <div className="mt-4 pt-3 border-t border-[#241D35] flex items-center justify-center font-mono">
        <div className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-center w-full ${
          isApproved 
            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 shadow-glow-green/20' 
            : isRejected 
            ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40' 
            : 'bg-[#151020] text-[#9893A8] border border-[#261E3B]'
        }`}>
          {isApproved ? '✓ SANDBOX PASSED (100%)' : isRejected ? '✕ SANDBOX FAILED' : 'BENCHMARKING...'}
        </div>
      </div>
    </div>
  )
}
