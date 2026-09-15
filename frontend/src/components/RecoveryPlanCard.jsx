import React from 'react'
import WhyExplanation from './WhyExplanation'

export default function RecoveryPlanCard({ plan }) {
  const isSelected = plan.status === 'selected' || plan.status === 'approved'
  const isRejected = plan.status === 'rejected'
  
  let riskBadge = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
  if (plan.risk_level === 'medium') riskBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  if (plan.risk_level === 'high') riskBadge = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'

  const testProgress = plan.test_total > 0 ? (plan.test_passed / plan.test_total) * 100 : 0

  return (
    <div className={`rounded-xl p-5 border transition-all duration-200 relative flex flex-col justify-between ${
      isSelected 
        ? 'bg-[#151020] border-[#7C3AED] shadow-glow-violet-sm ring-1 ring-[#7C3AED]/50' 
        : isRejected
        ? 'bg-[#0D0B14] border-[#241D35] opacity-80 hover:opacity-100 hover:border-[#352B4D]'
        : 'bg-[#0D0B14] border-[#241D35] hover:border-[#352B4D]'
    }`}>
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#261E3B]">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              isSelected ? 'bg-[#7C3AED]/20 text-[#A855F7] border border-[#7C3AED]/40' : 'bg-[#1D172E] text-[#9893A8]'
            }`}>
              PLAN {plan.plan_number ? String(plan.plan_number).padStart(2, '0') : '01'}
            </span>
            {isSelected && (
              <span className="text-[10px] font-mono text-[#10B981] font-bold">
                🏆 WINNER
              </span>
            )}
          </div>
          <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${riskBadge}`}>
            {plan.risk_level || 'low'} Risk
          </div>
        </div>
        
        {/* Title & Description */}
        <h4 className="font-bold text-xs text-[#F5F3FF] mb-1 leading-snug">
          {plan.name || 'Candidate Patch Strategy'}
        </h4>
        <p className="text-[11px] text-[#9893A8] mb-4 line-clamp-2 leading-relaxed font-mono">
          {plan.description}
        </p>
        
        {/* Sandbox Metrics Matrix */}
        <div className="space-y-3 mb-4 bg-[#07070B] p-3 rounded-lg border border-[#241D35]">
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-[#9893A8]">SANDBOX REGRESSION TESTS</span>
              <span className={`font-bold ${isSelected ? 'text-[#10B981]' : plan.test_failed > 0 ? 'text-[#EF4444]' : 'text-[#F5F3FF]'}`}>
                {plan.test_passed}/{plan.test_total} PASS
              </span>
            </div>
            <div className="w-full bg-[#151020] h-1.5 rounded-full overflow-hidden border border-[#261E3B]">
              <div 
                className={`h-full transition-all duration-300 ${
                  plan.test_failed > 0 ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                }`}
                style={{ width: `${testProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[11px] font-mono pt-1">
            <span className="text-[#9893A8]">HEALTH CHECK PROBE</span>
            <span className={`font-bold ${plan.health_check_passed ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {plan.health_check_passed ? '✓ 200 OK PASS' : '✕ 500 FAIL'}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Footer */}
      <div className="pt-3 border-t border-[#261E3B] flex justify-between items-center text-xs font-mono">
        <div>
          {isSelected ? (
            <span className="font-bold text-[#10B981] flex items-center gap-1">
              <span>✓</span> APPROVED &amp; DEPLOYED
            </span>
          ) : isRejected ? (
            <span className="font-bold text-[#EF4444]/80 flex items-center gap-1">
              <span>✕</span> REJECTED
            </span>
          ) : (
            <span className="text-[#9893A8] uppercase">{plan.status}</span>
          )}
        </div>
        
        {(plan.why_selected || plan.why_rejected) && (
          <WhyExplanation text={plan.why_selected || plan.why_rejected} />
        )}
      </div>
    </div>
  )
}
