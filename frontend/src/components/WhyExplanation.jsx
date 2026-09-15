import React, { useState } from 'react'

export default function WhyExplanation({ text }) {
  const [open, setOpen] = useState(false)

  if (!text) return null

  return (
    <div className="relative inline-block">
      <button 
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-[10px] text-accent-blue underline underline-offset-2 hover:text-white"
      >
        Why?
      </button>
      
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface-lighter border border-white/10 rounded shadow-xl p-2 z-50 animate-slide-in">
          <p className="text-xs text-zinc-200 leading-tight">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-lighter"></div>
        </div>
      )}
    </div>
  )
}
