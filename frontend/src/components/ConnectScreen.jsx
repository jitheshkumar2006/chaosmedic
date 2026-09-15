import React, { useState } from 'react'
import { connectApplication } from '../utils/api'

export default function ConnectScreen({ onConnected }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConnect = async (targetUrl = url) => {
    const trimmed = targetUrl.trim()
    if (!trimmed) {
      setError('Please enter a valid application URL.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await connectApplication(trimmed)
      onConnected(result)
    } catch (err) {
      setError(err.message || 'Application could not be reached. Please verify the URL and ensure the service is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseDemo = () => {
    const demoUrl = 'http://localhost:8001'
    setUrl(demoUrl)
    handleConnect(demoUrl)
  }

  return (
    <div className="min-h-screen bg-[#07070B] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-mono">
      {/* Background Ambient Violet Glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none -top-40 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none -bottom-40 -right-40"></div>

      <div className="w-full max-w-xl bg-[#0D0B14] border border-[#241D35] rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-2xl z-10">
        {/* Top Violet Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#151020] border border-[#7C3AED]/30 shadow-glow-violet-sm mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-[#F5F3FF] mb-1.5">
            CHAOSMEDIC
          </h1>
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#A855F7] uppercase mb-3">
            Autonomous Infrastructure Self-Healing Engine
          </p>
          <p className="text-xs text-[#9893A8] leading-relaxed max-w-md mx-auto">
            Connect an application or microservice endpoint to initiate real-time health probing, multi-agent root cause diagnosis, and sandbox validation.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs flex items-start gap-3 animate-slide-in">
            <span className="text-[#EF4444] font-bold text-base leading-none">⚠</span>
            <div className="flex-1 text-[#F5F3FF]">
              <span className="font-bold text-[#EF4444]">Connection Error:</span> {error}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleConnect()
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="app-url" className="block text-[10px] font-bold text-[#9893A8] uppercase tracking-[0.15em] mb-2">
              TARGET APPLICATION URL
            </label>
            <div className="relative">
              <input
                id="app-url"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="http://localhost:8001 or https://api.your-system.com"
                disabled={loading}
                className="w-full px-4 py-3.5 rounded-xl bg-[#151020] border border-[#261E3B] text-[#F5F3FF] placeholder-[#666075] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-xs font-mono transition-all disabled:opacity-50"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 top-3.5 text-[#666075] hover:text-[#F5F3FF] text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-xs tracking-wider shadow-glow-violet flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#A855F7]/30"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>PROBING ENDPOINT HEALTH...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>CONNECT &amp; INITIATE PROBE</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleUseDemo}
              disabled={loading}
              className="text-xs text-[#A855F7] hover:text-[#F5F3FF] transition-colors font-medium cursor-pointer"
            >
              &rarr; Load Demo Application (Local User API :8001)
            </button>
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-[#241D35] text-[11px] text-[#9893A8] leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-[#A855F7]">ℹ️</span>
            <div>
              <strong className="text-[#F5F3FF]">Architecture Note:</strong> Real-time HTTP polling verifies reachability, latency, and status codes. For autonomous code-level repair, the target service runs with instrumented source access and an isolated sandbox execution layer.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-[#666075] tracking-widest">
        CHAOSMEDIC • AUTONOMOUS SRE INFRASTRUCTURE CORE v2.4
      </div>
    </div>
  )
}
