import React, { useState, useEffect, useRef } from 'react'

const SEQUENCE_STEPS = [
  { id: 'connect', label: 'CONNECTING TO APPLICATION', detail: 'Establishing secure channel to user-service...', duration: 1800 },
  { id: 'capture', label: 'CAPTURING INCIDENT', detail: 'Extracting error telemetry, stack trace, and service state...', duration: 1600 },
  { id: 'analyze', label: 'ANALYZING FAILURE', detail: 'Initializing multi-agent diagnostic pipeline...', duration: 1400 },
  { id: 'online', label: 'CHAOSMEDIC ONLINE', detail: 'All autonomous recovery systems operational.', duration: 1200 },
]

const TERMINAL_EVENTS = [
  { delay: 200, text: '> Probing target endpoint http://localhost:8001...', type: 'cmd' },
  { delay: 600, text: '  HTTP GET /health → 200 OK (12ms)', type: 'ok' },
  { delay: 900, text: '  HTTP GET /users → 500 INTERNAL SERVER ERROR', type: 'error' },
  { delay: 1400, text: '> Incident signature detected: TypeError at user_service.py:42', type: 'cmd' },
  { delay: 1800, text: '> Capturing traceback... done', type: 'cmd' },
  { delay: 2200, text: '  Exception: \'NoneType\' object is not subscriptable', type: 'error' },
  { delay: 2800, text: '> Initializing agent pipeline...', type: 'cmd' },
  { delay: 3200, text: '  [DETECTION]    ● armed', type: 'agent' },
  { delay: 3400, text: '  [DIAGNOSIS]    ● armed', type: 'agent' },
  { delay: 3600, text: '  [PATCH-GEN]    ● armed', type: 'agent' },
  { delay: 3800, text: '  [VALIDATION]   ● armed', type: 'agent' },
  { delay: 4000, text: '  [RECOVERY]     ● armed', type: 'agent' },
  { delay: 4200, text: '  [VERIFICATION] ● armed', type: 'agent' },
  { delay: 4800, text: '> CHAOSMEDIC autonomous recovery system is ONLINE', type: 'success' },
  { delay: 5200, text: '> Entering Incident Command Center...', type: 'cmd' },
]

export default function ConnectionSequence({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [terminalLines, setTerminalLines] = useState([])
  const [scanLinePos, setScanLinePos] = useState(0)
  const [showFinalFlash, setShowFinalFlash] = useState(false)
  const terminalRef = useRef(null)

  // Scan line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLinePos(p => (p + 1) % 100)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  // Step progression
  useEffect(() => {
    let totalDelay = 0
    const timers = SEQUENCE_STEPS.map((step, i) => {
      const timer = setTimeout(() => {
        setActiveStep(i)
        if (i > 0) {
          setCompletedSteps(prev => [...prev, i - 1])
        }
      }, totalDelay)
      totalDelay += step.duration
      return timer
    })

    // Complete last step
    const finalTimer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, SEQUENCE_STEPS.length - 1])
    }, totalDelay)

    // Flash and transition
    const flashTimer = setTimeout(() => {
      setShowFinalFlash(true)
    }, totalDelay + 400)

    const transitionTimer = setTimeout(() => {
      onComplete()
    }, totalDelay + 1000)

    return () => {
      timers.forEach(t => clearTimeout(t))
      clearTimeout(finalTimer)
      clearTimeout(flashTimer)
      clearTimeout(transitionTimer)
    }
  }, [onComplete])

  // Terminal event playback
  useEffect(() => {
    const timers = TERMINAL_EVENTS.map((event) => {
      return setTimeout(() => {
        setTerminalLines(prev => [...prev, event])
      }, event.delay)
    })
    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  const getLineColor = (type) => {
    switch (type) {
      case 'error': return 'text-[#EF4444]'
      case 'ok': return 'text-[#10B981]'
      case 'success': return 'text-[#10B981] font-bold'
      case 'agent': return 'text-[#A855F7]'
      default: return 'text-[#9893A8]'
    }
  }

  return (
    <div className="min-h-screen bg-[#07070B] flex flex-col items-center justify-center px-4 relative overflow-hidden font-mono">
      {/* Scan line */}
      <div
        className="fixed left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED]/40 to-transparent pointer-events-none z-50 transition-none"
        style={{ top: `${scanLinePos}%` }}
      ></div>

      {/* Background violet glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#7C3AED]/[0.04] rounded-full blur-[100px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      {/* Final flash */}
      {showFinalFlash && (
        <div className="fixed inset-0 bg-[#7C3AED]/10 pointer-events-none z-40 animate-[flash_600ms_ease-out_forwards]"></div>
      )}

      <div className="w-full max-w-xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#151020] border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.15)] mb-4">
            <span className="text-xl">🛡️</span>
          </div>
          <h1 className="text-xl font-black tracking-[0.2em] text-[#F5F3FF]">CHAOSMEDIC</h1>
        </div>

        {/* Step indicators */}
        <div className="bg-[#0D0B14] border border-[#241D35] rounded-2xl overflow-hidden shadow-2xl mb-6">
          <div className="px-6 py-5 space-y-0">
            {SEQUENCE_STEPS.map((step, i) => {
              const isActive = activeStep === i && !completedSteps.includes(i)
              const isCompleted = completedSteps.includes(i)
              const isPending = activeStep < i

              return (
                <div key={step.id} className="relative">
                  {/* Connector line */}
                  {i < SEQUENCE_STEPS.length - 1 && (
                    <div className="absolute left-[11px] top-[28px] w-[2px] h-[calc(100%-16px)]">
                      <div className={`w-full h-full transition-all duration-500 ${
                        isCompleted ? 'bg-[#10B981]' : isActive ? 'bg-[#7C3AED]' : 'bg-[#241D35]'
                      }`}></div>
                    </div>
                  )}

                  <div className={`flex items-start gap-4 py-3 transition-all duration-300 ${
                    isPending ? 'opacity-30' : 'opacity-100'
                  }`}>
                    {/* Status dot */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#10B981]/20 border-2 border-[#10B981]'
                        : isActive
                          ? 'bg-[#7C3AED]/20 border-2 border-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                          : 'bg-[#151020] border-2 border-[#241D35]'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-3 h-3 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isActive ? (
                        <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#241D35]"></div>
                      )}
                    </div>

                    {/* Label */}
                    <div>
                      <span className={`text-xs font-bold tracking-[0.1em] uppercase block transition-colors duration-300 ${
                        isCompleted ? 'text-[#10B981]' : isActive ? 'text-[#F5F3FF]' : 'text-[#666075]'
                      }`}>
                        {step.label}
                      </span>
                      {(isActive || isCompleted) && (
                        <span className={`text-[10px] mt-0.5 block ${
                          isCompleted ? 'text-[#10B981]/60' : 'text-[#9893A8]'
                        }`}>
                          {step.detail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="h-[2px] bg-[#151020]">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#10B981] transition-all duration-700 ease-out"
              style={{ width: `${((completedSteps.length) / SEQUENCE_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Terminal window */}
        <div className="bg-[#0D0B14] border border-[#241D35] rounded-2xl overflow-hidden shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0810] border-b border-[#241D35]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60"></span>
            </div>
            <span className="text-[9px] text-[#666075] ml-2 tracking-widest uppercase">chaosmedic — connection log</span>
          </div>

          {/* Terminal content */}
          <div
            ref={terminalRef}
            className="px-4 py-3 h-52 overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className={`text-[11px] leading-relaxed font-mono ${getLineColor(line.type)} animate-[fadeSlideIn_200ms_ease-out]`}
              >
                {line.text}
              </div>
            ))}
            {/* Cursor */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] text-[#666075]">{'>'}</span>
              <span className="w-[6px] h-[14px] bg-[#7C3AED] animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
