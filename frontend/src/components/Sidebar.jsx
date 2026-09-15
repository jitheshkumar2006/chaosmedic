import React from 'react'

export default function Sidebar({ activePage, onPageChange }) {
  const navSections = [
    {
      category: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Overview', icon: '⚡', desc: 'Mission Control' },
        { id: 'incidents', label: 'Incidents', icon: '🚨', desc: 'Active & Historical' },
        { id: 'recovery', label: 'Recovery', icon: '🛡️', desc: 'Self-Healing Engine' },
        { id: 'validation', label: 'Validation', icon: '🧪', desc: 'Sandbox Matrix' },
      ]
    },
    {
      category: 'INTELLIGENCE',
      items: [
        { id: 'memory', label: 'Memory', icon: '🧠', desc: 'Failure Patterns' },
        { id: 'reports', label: 'Reports', icon: '📄', desc: 'Audit PIR Documents' }
      ]
    }
  ]

  return (
    <aside className="w-60 bg-[#0D0B14] border-r border-[#241D35] flex flex-col justify-between h-[calc(100vh-61px)] shrink-0 select-none z-20">
      <div className="py-5 px-3 space-y-6 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.category}>
            <div className="px-3 mb-2 text-[10px] font-mono font-bold text-[#9893A8]/70 tracking-[0.2em] uppercase">
              {section.category}
            </div>
            <div className="space-y-1">
              {section.items.map(item => {
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-3 cursor-pointer group relative ${
                      isActive
                        ? 'bg-[#151020] text-[#F5F3FF] border-l-[3px] border-[#7C3AED] shadow-sm'
                        : 'text-[#9893A8] hover:bg-[#151020]/60 hover:text-[#F5F3FF] border-l-[3px] border-transparent'
                    }`}
                  >
                    <span className={`text-sm transition-transform duration-150 ${isActive ? 'scale-110 text-[#A855F7]' : 'opacity-70 group-hover:opacity-100'}`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{item.label}</div>
                      <div className="text-[10px] text-[#666075] font-normal truncate group-hover:text-[#9893A8]">
                        {item.desc}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-glow-violet-sm"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="p-4 border-t border-[#241D35] bg-[#07070B]/60">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9893A8] mb-1.5">
          <span>PIPELINE ENGINE</span>
          <span className="text-[#10B981] font-bold">7 AGENTS</span>
        </div>
        <div className="w-full bg-[#151020] h-1.5 rounded-full overflow-hidden border border-[#261E3B]">
          <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#10B981] w-full"></div>
        </div>
        <div className="text-[10px] text-[#666075] mt-2 flex justify-between items-center font-mono">
          <span>CHAOSMEDIC CORE</span>
          <span className="text-[#A855F7]">v2.4.0</span>
        </div>
      </div>
    </aside>
  )
}
