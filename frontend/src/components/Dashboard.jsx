import React, { useState, useCallback } from 'react'
import { useIncident } from '../hooks/useIncident'
import { triggerFailure, resetDemo, connectApplication } from '../utils/api'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import SystemHealth from './SystemHealth'
import IncidentPanel from './IncidentPanel'
import AgentActivity from './AgentActivity'
import RootCausePanel from './RootCausePanel'
import RecoveryPlanComparison from './RecoveryPlanComparison'
import CodeDiff from './CodeDiff'
import SandboxStatus from './SandboxStatus'
import RecoveryProgress from './RecoveryProgress'
import IncidentReplay from './IncidentReplay'
import IncidentReport from './IncidentReport'
import IncidentHistory from './IncidentHistory'
import RecoveryMemory from './RecoveryMemory'
import ConnectScreen from './ConnectScreen'
import ConnectionResult from './ConnectionResult'
import ConnectedAppBanner from './ConnectedAppBanner'
import IncidentLanding from './IncidentLanding'
import ConnectionSequence from './ConnectionSequence'

export default function Dashboard() {
  const {
    health,
    incident,
    incidents,
    memories,
    connectedApp,
    updateConnectedApp,
    disconnectApp,
    setIncident,
    clearIncident,
    refreshMemories,
    connected
  } = useIncident()

  const [activePage, setActivePage] = useState('overview')
  // viewMode: 'landing' | 'connecting' | 'connect' | 'result' | 'command-center'
  const [viewMode, setViewMode] = useState(() => {
    return connectedApp ? 'command-center' : 'landing'
  })

  const handleConnected = (appData) => {
    updateConnectedApp(appData)
    setViewMode('result')
  }

  const handleDisconnect = async () => {
    await disconnectApp()
    clearIncident()
    setViewMode('landing')
  }

  const [triggering, setTriggering] = useState(false)

  const handleTrigger = async () => {
    if (triggering) return
    setTriggering(true)
    try {
      await triggerFailure()
      setActivePage('overview')
    } catch (e) {
      console.error('Failed to trigger chaos:', e)
    } finally {
      setTimeout(() => setTriggering(false), 2500)
    }
  }

  const handleRunIncidentTest = async () => {
    setViewMode('command-center')
    setActivePage('overview')
    try {
      await triggerFailure()
    } catch (e) {
      console.error('Failed to run incident test:', e)
    }
  }

  const handleReset = async () => {
    try { 
      await resetDemo()
      clearIncident()
    } catch (e) {
      console.error('Failed to reset demo:', e)
    }
  }

  // New: handle the "CONNECT CHAOSMEDIC" button from the landing page
  const handleConnectChaosMedic = useCallback(() => {
    setViewMode('connecting')
  }, [])

  // New: when the connection sequence animation completes
  const handleConnectionComplete = useCallback(async () => {
    try {
      // Auto-connect to the demo app, trigger failure, and go straight to command center
      const result = await connectApplication('http://localhost:8001')
      updateConnectedApp(result)
      setViewMode('command-center')
      setActivePage('overview')
      // Trigger the incident automatically so the pipeline starts
      await triggerFailure()
    } catch (e) {
      console.error('Auto-connect failed:', e)
      // Fallback to manual connect screen if auto-connect fails
      setViewMode('connect')
    }
  }, [updateConnectedApp])

  // 0. NEW: Incident Landing page (realistic failure screen)
  if (viewMode === 'landing') {
    return <IncidentLanding onConnectChaosMedic={handleConnectChaosMedic} />
  }

  // 0.5. NEW: Connection sequence animation
  if (viewMode === 'connecting') {
    return <ConnectionSequence onComplete={handleConnectionComplete} />
  }

  // 1. If not connected, show ConnectScreen (fallback / manual mode)
  if (viewMode === 'connect' || !connectedApp) {
    return <ConnectScreen onConnected={handleConnected} />
  }

  // 2. If just connected, show ConnectionResult
  if (viewMode === 'result') {
    return (
      <ConnectionResult
        app={connectedApp}
        onOpenCommandCenter={() => setViewMode('command-center')}
        onRunIncidentTest={handleRunIncidentTest}
      />
    )
  }

  // 3. Main Command Center View
  const selectedPlan = incident?.recovery_plans?.find(p => p.status === 'selected') || 
                       incident?.recovery_plans?.find(p => p.status === 'testing') ||
                       incident?.recovery_plans?.[0]

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-[#07070B] text-[#F5F3FF]">
      {/* Top Command Strip Navigation */}
      <TopBar 
        connected={connected} 
        health={health} 
        connectedApp={connectedApp} 
        activeIncident={incident} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Operational Sidebar */}
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        
        {/* Main Command Center Dashboard */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 scroll-smooth bg-[#07070B]">
          <div className="max-w-7xl mx-auto space-y-5 pb-16">
            
            {/* OVERVIEW TAB */}
            {activePage === 'overview' && (
              <>
                <ConnectedAppBanner
                  app={connectedApp}
                  health={health}
                  onDisconnect={handleDisconnect}
                />

                <SystemHealth health={health} />
                
                {/* Tactical Action Trigger Bar */}
                <div className="flex flex-col sm:flex-row gap-3 font-mono">
                  <button 
                    onClick={handleTrigger}
                    disabled={triggering}
                    className="flex-1 py-3 px-6 rounded-xl bg-[#EF4444] hover:bg-red-600 disabled:opacity-70 text-white shadow-glow-red font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-400/40"
                  >
                    <span>🚨</span>
                    <span>{triggering ? 'TRIGGERING INCIDENT TEST...' : 'RUN INCIDENT TEST (TRIGGER FAILURE)'}</span>
                  </button>
                  <button 
                    onClick={handleReset}
                    className="sm:w-56 py-3 px-5 rounded-xl bg-[#151020] hover:bg-[#221936] text-[#9893A8] hover:text-[#F5F3FF] border border-[#261E3B] hover:border-[#7C3AED]/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    <span>RESET ENVIRONMENT</span>
                  </button>
                </div>

                {/* ACTIVE INCIDENT TRANSFORMATION */}
                {incident && (
                  <div className="space-y-5 animate-slide-in">
                    <RecoveryProgress status={incident.status} duration={incident.recovery_duration} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-2 space-y-5">
                        <IncidentPanel incident={incident} />
                        {incident.root_cause && <RootCausePanel rootCause={incident.root_cause} />}
                      </div>
                      <div className="lg:col-span-1">
                        <AgentActivity agents={incident.agents} events={incident.events} />
                      </div>
                    </div>

                    {incident.recovery_plans?.length > 0 && (
                      <RecoveryPlanComparison plans={incident.recovery_plans} />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-1">
                         {selectedPlan && <SandboxStatus plan={selectedPlan} />}
                      </div>
                      <div className="lg:col-span-2">
                         {selectedPlan && <CodeDiff plan={selectedPlan} />}
                      </div>
                    </div>

                    <IncidentReport incident={incident} />
                  </div>
                )}
              </>
            )}

            {/* INCIDENTS TAB */}
            {activePage === 'incidents' && (
              <div className="space-y-5">
                {incident && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-[#A855F7] uppercase tracking-wider mb-2">
                      CURRENT ACTIVE INCIDENT
                    </h3>
                    <IncidentPanel incident={incident} />
                  </div>
                )}
                <IncidentHistory 
                  incidents={incidents} 
                  onSelect={(inc) => { setIncident(inc); setActivePage('overview') }} 
                />
              </div>
            )}

            {/* RECOVERY TAB */}
            {activePage === 'recovery' && (
              <div className="space-y-5">
                {incident ? (
                  <>
                    <RecoveryProgress status={incident.status} duration={incident.recovery_duration} />
                    {incident.recovery_plans?.length > 0 ? (
                      <RecoveryPlanComparison plans={incident.recovery_plans} />
                    ) : (
                      <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-8 text-center text-[#9893A8] font-mono">
                        <span>Recovery plans will generate once diagnosis is complete.</span>
                      </div>
                    )}
                    {selectedPlan && <CodeDiff plan={selectedPlan} />}
                  </>
                ) : (
                  <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-8 text-center text-[#9893A8] font-mono">
                    <span className="text-2xl block mb-2">🛡️</span>
                    <span>No active recovery running. Trigger an incident test from the Overview tab.</span>
                  </div>
                )}
              </div>
            )}

            {/* VALIDATION TAB */}
            {activePage === 'validation' && (
              <div className="space-y-5">
                {selectedPlan ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-1">
                        <SandboxStatus plan={selectedPlan} />
                      </div>
                      <div className="lg:col-span-2">
                        <CodeDiff plan={selectedPlan} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[#0D0B14] border border-[#241D35] rounded-xl p-8 text-center text-[#9893A8] font-mono">
                    <span className="text-2xl block mb-2">🧪</span>
                    <span>No active sandbox validation. Run an incident test to see multi-process sandbox isolation.</span>
                  </div>
                )}
              </div>
            )}

            {/* MEMORY TAB */}
            {activePage === 'memory' && (
              <RecoveryMemory memories={memories} onRefresh={refreshMemories} />
            )}

            {/* REPORTS TAB */}
            {activePage === 'reports' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center font-mono px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A855F7]">📄</span>
                    <h2 className="text-sm font-bold text-[#F5F3FF] tracking-wider uppercase">
                      POST-INCIDENT REVIEW (PIR) REPORTS HUB
                    </h2>
                  </div>
                </div>

                {incident && incident.status === 'resolved' && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider mb-2">
                      LATEST RESOLVED INCIDENT
                    </h3>
                    <IncidentReport incident={incident} />
                  </div>
                )}

                <IncidentHistory 
                  incidents={incidents} 
                  onSelect={(inc) => { setIncident(inc); setActivePage('overview') }} 
                />
              </div>
            )}

            {/* REPLAY TAB */}
            {activePage === 'replay' && (
              <IncidentReplay incidentId={incident?.id || (incidents.length > 0 ? incidents[0].id : null)} />
            )}
            
          </div>
        </main>
      </div>
    </div>
  )
}
