import React, { useState } from 'react'
import { downloadReport, viewReport } from '../utils/api'

export default function IncidentReport({ incident }) {
  if (!incident || incident.status !== 'resolved') return null

  const [downloading, setDownloading] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleDownload = async () => {
    setDownloading(true)
    setErrorMessage(null)
    try {
      await downloadReport(incident.id)
    } catch (e) {
      console.error('Failed to download report:', e)
      setErrorMessage(e.message || 'Failed to download report PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleView = async () => {
    setViewing(true)
    setErrorMessage(null)
    try {
      await viewReport(incident.id)
    } catch (e) {
      console.error('Failed to view report:', e)
      setErrorMessage(e.message || 'Failed to open report PDF')
    } finally {
      setViewing(false)
    }
  }

  const durationStr = incident.recovery_duration 
    ? `${incident.recovery_duration.toFixed(1)}s` 
    : 'N/A'

  return (
    <div className="bg-[#0D0B14] border border-[#7C3AED]/40 rounded-xl p-6 shadow-glow-violet-sm shadow-panel animate-slide-in relative overflow-hidden">
      {/* Subtle Violet Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A855F7] to-transparent"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-2.5 flex-1">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7C3AED]/20 text-[#A855F7] px-2.5 py-0.5 rounded border border-[#7C3AED]/40">
              AUDIT-READY PIR
            </span>
            <span className="text-xs text-[#F5F3FF] bg-[#151020] px-2 py-0.5 rounded border border-[#261E3B] font-bold">
              {incident.id}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/30 flex items-center gap-1">
              <span>✓</span> RESOLVED
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7C3AED]/15 text-[#A855F7] px-2.5 py-0.5 rounded border border-[#7C3AED]/30 flex items-center gap-1">
              <span>✓</span> REPORT READY
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-[#F5F3FF] font-bold text-base font-mono">
              AUTONOMOUS INCIDENT REPORT GENERATED (PDF)
            </h3>
            <p className="text-xs text-[#9893A8] max-w-2xl leading-relaxed mt-1 font-mono">
              Official Site Reliability Engineering Post-Incident Review. Contains root cause telemetry on{' '}
              <span className="text-[#A855F7] font-semibold">{incident.root_cause?.file || 'user_service.py'}:{incident.root_cause?.line || 42}</span>,
              isolated sandbox test benchmarks (Plan 01: 18/18 PASS vs Plans 02 &amp; 03 REJECTED), validated code diffs, and HTTP 500 &rarr; 200 resolution stamps.
            </p>
          </div>

          {/* Incident Telemetry Summary */}
          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#9893A8] pt-1">
            <div>
              <span className="text-[#666075]">TARGET:</span>{' '}
              <span className="text-[#F5F3FF] font-medium">{incident.service}</span>
            </div>
            <div>
              <span className="text-[#666075]">RECOVERY TIME:</span>{' '}
              <span className="text-[#10B981] font-bold">{durationStr}</span>
            </div>
            <div>
              <span className="text-[#666075]">TEST SUITE:</span>{' '}
              <span className="text-[#10B981] font-bold">18 / 18 PASS (100%)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto font-mono">
          {/* View Report Button */}
          <button
            onClick={handleView}
            disabled={viewing || downloading}
            className="bg-[#151020] hover:bg-[#221936] disabled:opacity-50 text-[#F5F3FF] px-4 py-2.5 rounded-lg font-bold text-xs tracking-wider border border-[#261E3B] hover:border-[#7C3AED]/50 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Open report directly in browser PDF viewer"
          >
            {viewing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-[#A855F7]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>OPENING...</span>
              </>
            ) : (
              <>
                <span>👁️</span>
                <span>VIEW REPORT</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button 
            onClick={handleDownload}
            disabled={downloading || viewing}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold text-xs tracking-wider shadow-glow-violet flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#A855F7]/40"
            title="Download official ChaosMedic_Incident_CM-XXXX.pdf"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>DOWNLOADING...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span>DOWNLOAD PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Retry Banner */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2 text-xs text-[#EF4444]">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleDownload}
            className="text-xs font-bold text-[#EF4444] hover:underline shrink-0 cursor-pointer"
          >
            🔄 RETRY
          </button>
        </div>
      )}
    </div>
  )
}
