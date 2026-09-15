import React from 'react'

export default function ConnectionResult({ app, onOpenCommandCenter, onRunIncidentTest }) {
  if (!app) return null

  const isDemo = app.is_demo_app

  return (
    <div className="min-h-screen bg-[#07070B] flex flex-col justify-center items-center px-4 py-12 font-mono">
      <div className="w-full max-w-2xl bg-[#0D0B14] border border-[#241D35] rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-2xl animate-slide-in">
        {/* Top Green/Violet Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent"></div>

        {/* Success Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#241D35]">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] text-lg font-bold shadow-glow-green/20">
            ✓
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F3FF] tracking-wider uppercase">
              APPLICATION ENDPOINT CONNECTED
            </h2>
            <p className="text-xs text-[#9893A8]">
              Initial health probe verified • Real-time telemetry monitoring initialized
            </p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 bg-[#151020] p-4 rounded-xl border border-[#261E3B]">
          <div className="flex items-center gap-2 text-xs text-[#F5F3FF]">
            <span className="text-[#10B981] font-bold">✓</span>
            <span>Target endpoint reachable</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#F5F3FF]">
            <span className="text-[#10B981] font-bold">✓</span>
            <span>HTTP handshake accepted</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#F5F3FF]">
            <span className="text-[#10B981] font-bold">✓</span>
            <span>Health check 200 OK verified</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#F5F3FF]">
            <span className="text-[#10B981] font-bold">✓</span>
            <span>Autonomous monitor engaged</span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#151020] p-3.5 rounded-xl border border-[#261E3B]">
            <span className="text-[10px] uppercase font-bold text-[#9893A8] block mb-1">TARGET URL</span>
            <span className="text-xs font-bold text-[#F5F3FF] truncate block" title={app.url}>
              {app.url}
            </span>
          </div>
          <div className="bg-[#151020] p-3.5 rounded-xl border border-[#261E3B]">
            <span className="text-[10px] uppercase font-bold text-[#9893A8] block mb-1">PROBE STATUS</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="text-xs font-bold text-[#10B981]">{app.status_code || 200} OK</span>
            </div>
          </div>
          <div className="bg-[#151020] p-3.5 rounded-xl border border-[#261E3B]">
            <span className="text-[10px] uppercase font-bold text-[#9893A8] block mb-1">ROUND-TRIP</span>
            <span className="text-xs font-bold text-[#A855F7]">{app.response_time_ms} ms</span>
          </div>
          <div className="bg-[#151020] p-3.5 rounded-xl border border-[#261E3B]">
            <span className="text-[10px] uppercase font-bold text-[#9893A8] block mb-1">SYSTEM STATE</span>
            <span className="text-xs font-bold text-[#10B981] uppercase">{app.health || 'Healthy'}</span>
          </div>
        </div>

        {/* Application Capabilities Matrix */}
        <div className="mb-6 p-4 rounded-xl bg-[#151020]/60 border border-[#261E3B]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9893A8] mb-3 flex items-center justify-between">
            <span>PERMISSIONS &amp; CAPABILITIES MATRIX</span>
            {isDemo ? (
              <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-bold uppercase">
                AUTHORIZED DEMO ENVIRONMENT
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">
                EXTERNAL MONITORED SERVICE
              </span>
            )}
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#241D35]">
              <span className="text-[#9893A8]">Runtime Network Reachability</span>
              <span className="text-[#10B981] font-bold">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#241D35]">
              <span className="text-[#9893A8]">Real-time Health &amp; Error Telemetry</span>
              <span className="text-[#10B981] font-bold">✓ Streaming</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#241D35]">
              <span className="text-[#9893A8]">Source Code Access (AST Analysis)</span>
              {isDemo ? (
                <span className="text-[#10B981] font-bold">✓ Authorized</span>
              ) : (
                <span className="text-amber-400 font-medium">⚠ Authorized Repo Link Needed</span>
              )}
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#9893A8]">Ephemeral Sandbox Containerization</span>
              {isDemo ? (
                <span className="text-[#10B981] font-bold">✓ Active</span>
              ) : (
                <span className="text-amber-400 font-medium">⚠ Staging Cluster Required</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onOpenCommandCenter}
            className="flex-1 py-3 px-5 rounded-xl bg-[#151020] hover:bg-[#221936] text-[#F5F3FF] border border-[#261E3B] hover:border-[#7C3AED]/50 flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-xs tracking-wider"
          >
            <span>📊</span>
            <span>ENTER MISSION CONTROL</span>
          </button>

          {isDemo ? (
            <button
              onClick={onRunIncidentTest}
              className="flex-1 py-3 px-5 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white shadow-glow-red flex items-center justify-center gap-2 transition-all font-bold text-xs tracking-wider cursor-pointer border border-red-400/40"
            >
              <span>🚨</span>
              <span>RUN INCIDENT TEST</span>
            </button>
          ) : (
            <button
              disabled
              title="Incident testing is restricted to authorized sandbox targets"
              className="flex-1 py-3 px-5 rounded-xl bg-[#151020] text-[#666075] border border-[#261E3B] flex items-center justify-center gap-2 cursor-not-allowed text-xs font-bold"
            >
              <span>🔒</span>
              <span>INCIDENT TEST (DEMO ONLY)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
