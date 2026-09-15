import React from 'react'
import RecoveryPlanCard from './RecoveryPlanCard'

export default function RecoveryPlanComparison({ plans }) {
  if (!plans || plans.length === 0) return null

  return (
    <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-5 shadow-panel col-span-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5 pb-3 border-b border-[#241D35]">
        <div className="flex items-center gap-2">
          <span className="text-[#A855F7]">⚖️</span>
          <div>
            <h3 className="text-xs font-mono font-bold text-[#F5F3FF] uppercase tracking-[0.15em]">
              CANDIDATE RECOVERY STRATEGIES EVALUATION
            </h3>
            <p className="text-[11px] font-mono text-[#9893A8]">
              Parallel execution in isolated ephemeral sandbox environments
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-[#A855F7] bg-[#7C3AED]/15 px-2.5 py-1 rounded border border-[#7C3AED]/30 font-bold">
          3 PLANS BENCHMARKED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, idx) => (
          <RecoveryPlanCard key={plan.id || idx} plan={plan} />
        ))}
      </div>
    </div>
  )
}
