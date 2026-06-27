import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, CheckCircle2, XCircle, Clock, Zap, Brain,
  Wrench, Database, RefreshCw, Trash2, ChevronDown, ChevronRight,
  Bot, MemoryStick, BarChart3, Radio, AlertTriangle, TrendingUp, Circle
} from 'lucide-react'
import { agentApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'
import { useAgentSessionStore } from '@/store/agentSessionStore'
import toast from 'react-hot-toast'

// ── Mock data ────────────────────────────────────────────────────────────────

const AGENT_COLORS: Record<string, string> = {
  flood_agent: '#EF4444', rainfall_agent: '#3B82F6', reservoir_agent: '#06B6D4',
  water_quality_agent: '#10B981', leak_detection_agent: '#F59E0B',
  climate_agent: '#F97316', emergency_agent: '#DC2626', country_agent: '#0EA5E9',
  groundwater_agent: '#84CC16', decision_agent: '#8B5CF6',
  global_coordinator: '#6366F1', infrastructure_agent: '#64748B',
  sensor_intelligence: '#22D3EE', report_generation_agent: '#A855F7',
}

const ALL_AGENTS = [
  { id: 'flood_agent',            name: 'Flood Agent',            category: 'emergency' },
  { id: 'rainfall_agent',         name: 'Rainfall Agent',         category: 'environmental' },
  { id: 'reservoir_agent',        name: 'Reservoir Agent',        category: 'infrastructure' },
  { id: 'water_quality_agent',    name: 'Water Quality Agent',    category: 'quality' },
  { id: 'leak_detection_agent',   name: 'Leak Detection Agent',   category: 'infrastructure' },
  { id: 'climate_agent',          name: 'Climate Agent',          category: 'environmental' },
  { id: 'emergency_agent',        name: 'Emergency Agent',        category: 'emergency' },
  { id: 'country_agent',          name: 'Country Agent',          category: 'geographic' },
  { id: 'groundwater_agent',      name: 'Groundwater Agent',      category: 'environmental' },
  { id: 'decision_agent',         name: 'Decision Agent',         category: 'orchestrator' },
  { id: 'global_coordinator',     name: 'Global Coordinator',     category: 'orchestrator' },
  { id: 'infrastructure_agent',   name: 'Infrastructure Agent',   category: 'infrastructure' },
  { id: 'sensor_intelligence',    name: 'Sensor Intelligence',    category: 'operations' },
  { id: 'report_generation_agent',name: 'Report Generation',      category: 'operations' },
]

const MOCK_TIMELINE = [
  { id: '1', agent_id: 'decision_agent',         agent_name: 'Decision Agent',         status: 'completed', latency_ms: 1247, confidence: 0.88, tools_called: ['runMCDA()', 'weighTradeoffs()'],                started_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: '2', agent_id: 'flood_agent',            agent_name: 'Flood Agent',            status: 'completed', latency_ms: 892,  confidence: 0.91, tools_called: ['predictFloodCrest()', 'calculateDischarge()'],    started_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '3', agent_id: 'rainfall_agent',         agent_name: 'Rainfall Agent',         status: 'completed', latency_ms: 967,  confidence: 0.87, tools_called: ['fetchSatelliteRainfall()', 'detectAnomalies()'], started_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '4', agent_id: 'reservoir_agent',        agent_name: 'Reservoir Agent',        status: 'completed', latency_ms: 743,  confidence: 0.93, tools_called: ['monitorReservoirLevel()', 'optimizeOutflow()'],   started_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: '5', agent_id: 'water_quality_agent',    agent_name: 'Water Quality Agent',    status: 'completed', latency_ms: 624,  confidence: 0.95, tools_called: ['analyzeSensorReadings()', 'checkWHOCompliance()'],started_at: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: '6', agent_id: 'emergency_agent',        agent_name: 'Emergency Agent',        status: 'failed',    latency_ms: 312,  confidence: 0,    tools_called: [],                                                 started_at: new Date(Date.now() - 24 * 60000).toISOString() },
  { id: '7', agent_id: 'leak_detection_agent',   agent_name: 'Leak Detection Agent',   status: 'completed', latency_ms: 1082, confidence: 0.87, tools_called: ['detectLeaks()', 'assessPipeCondition()'],         started_at: new Date(Date.now() - 31 * 60000).toISOString() },
  { id: '8', agent_id: 'climate_agent',          agent_name: 'Climate Agent',          status: 'completed', latency_ms: 1340, confidence: 0.89, tools_called: ['fetchClimateData()', 'modelWaterCycle()'],         started_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: '9', agent_id: 'country_agent',          agent_name: 'Country Agent',          status: 'completed', latency_ms: 876,  confidence: 0.86, tools_called: ['aggregateNationalData()', 'benchmarkGlobally()'],  started_at: new Date(Date.now() - 58 * 60000).toISOString() },
  { id:'10', agent_id: 'global_coordinator',     agent_name: 'Global Coordinator',     status: 'completed', latency_ms: 2140, confidence: 0.94, tools_called: ['coordinateAgents()', 'synthesizeInsights()'],      started_at: new Date(Date.now() - 72 * 60000).toISOString() },
]

const MOCK_OBS = {
  total_runs: 47,
  completed_runs: 45,
  failed_runs: 2,
  success_rate: 95.7,
  avg_latency_ms: 924,
  avg_confidence: 0.891,
  per_agent: ALL_AGENTS.map((a, i) => ({
    agent_id: a.id,
    agent_name: a.name,
    runs: Math.max(1, 8 - i),
    avg_latency_ms: Math.round(600 + Math.random() * 1200),
    avg_confidence: parseFloat((0.82 + Math.random() * 0.15).toFixed(3)),
  })),
  timeline: MOCK_TIMELINE,
}

const MOCK_AGENT_STATUS = ALL_AGENTS.map(a => ({
  agent_id: a.id,
  name: a.name,
  status: 'idle' as 'idle' | 'running' | 'completed' | 'error',
  last_run: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  confidence: parseFloat((0.82 + Math.random() * 0.15).toFixed(2)),
}))

const MOCK_MEMORY: Record<string, { content: string; context: Record<string, unknown>; importance: number; created_at: string }[]> = {
  flood_agent:          [{ content: 'Last run for Assam: completed — MEDIUM flood risk, Brahmaputra at 5.2m', context: { scope: 'Assam', confidence: 0.91 }, importance: 0.91, created_at: new Date(Date.now() - 5 * 60000).toISOString() }],
  rainfall_agent:       [{ content: 'Last run for Assam: completed — 112mm/7day, +18% anomaly', context: { scope: 'Assam', confidence: 0.87 }, importance: 0.87, created_at: new Date(Date.now() - 8 * 60000).toISOString() }],
  decision_agent:       [{ content: 'Last run for Assam: completed — Pipe replacement recommended, CBR 4.2:1', context: { scope: 'Assam', confidence: 0.88 }, importance: 0.88, created_at: new Date(Date.now() - 2 * 60000).toISOString() }],
  water_quality_agent:  [{ content: 'Last run for Mumbai: completed — WQI 84, all WHO params OK', context: { scope: 'Mumbai', confidence: 0.95 }, importance: 0.95, created_at: new Date(Date.now() - 18 * 60000).toISOString() }],
  reservoir_agent:      [{ content: 'Last run for India: completed — 74.3% capacity, inflow 124.5 m³/s', context: { scope: 'India', confidence: 0.93 }, importance: 0.93, created_at: new Date(Date.now() - 12 * 60000).toISOString() }],
  leak_detection_agent: [{ content: 'Last run for Mumbai: completed — 284 leak zones, 3 critical', context: { scope: 'Mumbai', confidence: 0.87 }, importance: 0.87, created_at: new Date(Date.now() - 31 * 60000).toISOString() }],
}

const MOCK_TOOL_USAGE = [
  { tool: 'predictFloodCrest()',      calls: 12, agents: ['flood_agent'] },
  { tool: 'analyzeSensorReadings()',  calls: 10, agents: ['water_quality_agent', 'sensor_intelligence'] },
  { tool: 'monitorReservoirLevel()',  calls: 9,  agents: ['reservoir_agent'] },
  { tool: 'detectLeaks()',            calls: 8,  agents: ['leak_detection_agent'] },
  { tool: 'fetchSatelliteRainfall()', calls: 7,  agents: ['rainfall_agent'] },
  { tool: 'coordinateAgents()',       calls: 6,  agents: ['global_coordinator', 'decision_agent'] },
  { tool: 'assessPipeCondition()',    calls: 6,  agents: ['leak_detection_agent', 'infrastructure_agent'] },
  { tool: 'fetchClimateData()',       calls: 5,  agents: ['climate_agent'] },
  { tool: 'calculateDischarge()',     calls: 5,  agents: ['flood_agent'] },
  { tool: 'runMCDA()',                calls: 4,  agents: ['decision_agent'] },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <GlassCard className="p-4">
      <div className={cn('flex items-center gap-2 mb-2', color)}>{icon}<span className="text-[10px] uppercase tracking-wider font-medium">{label}</span></div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </GlassCard>
  )
}

// ── Page component ───────────────────────────────────────────────────────────

export function AgentObservabilityPage() {
  const qc = useQueryClient()
  const { sessions, clearSessions } = useAgentSessionStore()
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [liveStatuses, setLiveStatuses] = useState(MOCK_AGENT_STATUS)
  const wsRef = useRef<WebSocket | null>(null)

  // ── Backend queries (fall back to mock) ───────────────────────────────────
  const { data: obs, refetch: refetchObs, isFetching } = useQuery({
    queryKey: ['obs-page'],
    queryFn: async () => { try { return await agentApi.observability().then(r => r.data) } catch { return MOCK_OBS } },
    refetchInterval: 15000,
  })

  const { data: backendSessions } = useQuery({
    queryKey: ['obs-sessions'],
    queryFn: async () => { try { return await agentApi.sessions(50).then(r => r.data) } catch { return [] } },
    refetchInterval: 20000,
  })

  const clearMutation = useMutation({
    mutationFn: async () => { try { await agentApi.clearSessions() } catch {} },
    onSuccess: () => {
      clearSessions()
      qc.invalidateQueries({ queryKey: ['obs-page'] })
      qc.invalidateQueries({ queryKey: ['obs-sessions'] })
      toast.success('Session history cleared')
    },
  })

  // ── WebSocket for live agent status ───────────────────────────────────────
  useEffect(() => {
    let ws: WebSocket
    try {
      ws = new WebSocket('ws://localhost:8000/ws/agents')
      wsRef.current = ws
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'agent_status' && Array.isArray(data.agents)) {
            setLiveStatuses(prev => prev.map(a => {
              const live = data.agents.find((d: { agent_id: string }) => d.agent_id === a.agent_id)
              return live ? { ...a, status: live.status, confidence: live.confidence, last_run: live.last_run } : a
            }))
          }
        } catch {}
      }
    } catch {}
    return () => { try { ws?.close() } catch {} }
  }, [])

  // ── Derived data ──────────────────────────────────────────────────────────
  const obsData = obs ?? MOCK_OBS
  const timeline = (backendSessions ?? []).length > 0 ? backendSessions : (sessions.length > 0 ? sessions.map(s => ({
    id: s.id, agent_id: s.agentId, agent_name: s.agentName, status: s.status,
    latency_ms: s.latency_ms, confidence: s.result?.confidence ?? 0,
    tools_called: s.tools_called ?? [], started_at: s.startedAt,
  })) : MOCK_TIMELINE)

  const totalTools = obsData.per_agent?.reduce((acc: number, a: { runs: number; avg_latency_ms: number }) => acc + a.runs, 0) ?? 0
  const maxLatency = Math.max(...(obsData.per_agent ?? MOCK_OBS.per_agent).map((a: { avg_latency_ms: number }) => a.avg_latency_ms))

  const statusColor: Record<string, string> = {
    idle: 'text-slate-500', running: 'text-blue-400', completed: 'text-emerald-400', error: 'text-red-400',
  }
  const statusDot: Record<string, string> = {
    idle: 'bg-slate-600', running: 'bg-blue-400 animate-pulse', completed: 'bg-emerald-400', error: 'bg-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Agent Observability
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time intelligence across all 14 agents · Sessions, memory, performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { refetchObs(); qc.invalidateQueries({ queryKey: ['obs-sessions'] }) }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 transition-colors">
            <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} /> Refresh
          </button>
          <button onClick={() => clearMutation.mutate()}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total Runs"    value={obsData.total_runs}                      icon={<Activity className="w-3.5 h-3.5" />}    color="text-blue-400" />
        <StatCard label="Completed"     value={obsData.completed_runs}                  icon={<CheckCircle2 className="w-3.5 h-3.5" />} color="text-emerald-400" />
        <StatCard label="Failed"        value={obsData.failed_runs}                     icon={<XCircle className="w-3.5 h-3.5" />}      color="text-red-400" />
        <StatCard label="Success Rate"  value={`${obsData.success_rate}%`}              icon={<TrendingUp className="w-3.5 h-3.5" />}   color="text-cyan-400" />
        <StatCard label="Avg Latency"   value={`${obsData.avg_latency_ms}ms`}           icon={<Clock className="w-3.5 h-3.5" />}        color="text-amber-400" />
        <StatCard label="Avg Confidence"value={`${((obsData.avg_confidence ?? 0) * 100).toFixed(1)}%`} icon={<Brain className="w-3.5 h-3.5" />} color="text-purple-400" />
        <StatCard label="Agents"        value="14"  sub="all registered"                icon={<Bot className="w-3.5 h-3.5" />}          color="text-slate-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Live Agent Status */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Live Agent Status</h2>
            <span className="ml-auto text-[10px] text-slate-500">via WebSocket</span>
          </div>
          <div className="space-y-1.5">
            {liveStatuses.map(agent => {
              const color = AGENT_COLORS[agent.agent_id] ?? '#3B82F6'
              return (
                <div key={agent.agent_id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Bot className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white font-medium truncate">{agent.name}</p>
                    <p className="text-[10px] text-slate-500">{timeAgo(agent.last_run)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={cn('w-1.5 h-1.5 rounded-full', statusDot[agent.status])} />
                    <span className={cn('text-[10px] font-medium capitalize', statusColor[agent.status])}>{agent.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Middle: Execution Timeline */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Execution Timeline</h2>
            <span className="ml-auto text-[10px] text-slate-500">{timeline.length} runs</span>
          </div>
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            <AnimatePresence>
              {timeline.slice(0, 20).map((s: { id: string; agent_id: string; agent_name: string; status: string; latency_ms: number; confidence: number; tools_called: string[]; started_at: string }, i: number) => {
                const color = AGENT_COLORS[s.agent_id] ?? '#3B82F6'
                const isOpen = expandedSession === (s.id ?? String(i))
                return (
                  <motion.div key={s.id ?? i} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <div
                      className="p-2.5 rounded-xl bg-white/3 hover:bg-white/5 cursor-pointer transition-colors border border-white/5"
                      onClick={() => setExpandedSession(isOpen ? null : (s.id ?? String(i)))}
                    >
                      <div className="flex items-center gap-2">
                        {s.status === 'completed'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white font-medium truncate">{s.agent_name}</p>
                          <p className="text-[10px] text-slate-500">{s.latency_ms}ms · {timeAgo(s.started_at)}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {s.confidence > 0 && (
                            <span className="text-[10px] font-medium" style={{ color }}>{(s.confidence * 100).toFixed(0)}%</span>
                          )}
                          {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                        </div>
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                <span className="text-[10px] text-slate-400 capitalize">{s.status}</span>
                                {s.confidence > 0 && <span className="text-[10px] text-slate-500">· confidence {(s.confidence * 100).toFixed(1)}%</span>}
                              </div>
                              {(s.tools_called ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(s.tools_called ?? []).map((t: string, ti: number) => (
                                    <span key={ti} className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400">{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {timeline.length === 0 && (
              <div className="text-center text-xs text-slate-600 py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No runs yet</p>
                <p className="text-slate-700 mt-1">Go to Agent Console and run an agent</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Right: Tool Usage + Memory */}
        <div className="space-y-4">
          {/* Tool Usage */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Tool Usage</h2>
              <span className="ml-auto text-[10px] text-slate-500">{MOCK_TOOL_USAGE.reduce((a, t) => a + t.calls, 0)} total calls</span>
            </div>
            <div className="space-y-2">
              {MOCK_TOOL_USAGE.slice(0, 7).map(tool => {
                const pct = Math.round((tool.calls / MOCK_TOOL_USAGE[0].calls) * 100)
                return (
                  <div key={tool.tool}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-300 font-mono truncate max-w-[70%]">{tool.tool}</span>
                      <span className="text-[10px] text-purple-400 font-bold shrink-0">{tool.calls}×</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" />
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Agent Memory */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MemoryStick className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Agent Memory</h2>
              <span className="ml-auto text-[10px] text-slate-500">episodic</span>
            </div>
            <div className="space-y-2">
              {Object.entries(MOCK_MEMORY).map(([agentId, memories]) => {
                const color = AGENT_COLORS[agentId] ?? '#3B82F6'
                const agentName = ALL_AGENTS.find(a => a.id === agentId)?.name ?? agentId
                const isOpen = expandedMemory === agentId
                return (
                  <div key={agentId}>
                    <button
                      onClick={() => setExpandedMemory(isOpen ? null : agentId)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[11px] text-white font-medium flex-1 text-left truncate">{agentName}</span>
                      <span className="text-[10px] text-amber-400">{memories.length} mem</span>
                      {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          {memories.map((m, mi) => (
                            <div key={mi} className="ml-4 mt-1 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                              <p className="text-[10px] text-slate-300 leading-relaxed">{m.content}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] text-amber-400">importance {(m.importance * 100).toFixed(0)}%</span>
                                <span className="text-[9px] text-slate-600">· {timeAgo(m.created_at)}</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Per-Agent Performance Bar Chart */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Per-Agent Performance</h2>
          <span className="ml-auto text-[10px] text-slate-500">latency · confidence · run count</span>
        </div>
        <div className="space-y-3">
          {(obsData.per_agent ?? MOCK_OBS.per_agent).slice(0, 14).map((a: { agent_id: string; agent_name: string; runs: number; avg_latency_ms: number; avg_confidence: number }) => {
            const color = AGENT_COLORS[a.agent_id] ?? '#3B82F6'
            const latPct = Math.round((a.avg_latency_ms / maxLatency) * 100)
            const confPct = Math.round((a.avg_confidence ?? 0) * 100)
            return (
              <div key={a.agent_id} className="grid grid-cols-[180px_1fr_60px_60px] items-center gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[11px] text-slate-300 truncate">{a.agent_name}</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  {/* Latency bar */}
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${latPct}%` }} transition={{ duration: 0.5 }}
                      className="h-full rounded-full" style={{ background: color, opacity: 0.7 }} />
                  </div>
                  {/* Confidence bar */}
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${confPct}%` }} transition={{ duration: 0.5, delay: 0.1 }}
                      className="h-full bg-emerald-500/60 rounded-full" />
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 text-right font-mono">{a.avg_latency_ms}ms</span>
                <span className="text-[10px] text-slate-500 text-right">{a.runs}× runs</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-blue-500/60" /><span className="text-[10px] text-slate-500">Latency</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full bg-emerald-500/60" /><span className="text-[10px] text-slate-500">Confidence</span></div>
        </div>
      </GlassCard>

      {/* Alert Panel — failed runs */}
      {obsData.failed_runs > 0 && (
        <GlassCard className="p-4 border border-red-500/15">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-red-300">Failed Executions</h2>
          </div>
          <div className="space-y-2">
            {timeline.filter((s: { status: string }) => s.status === 'failed').map((s: { id: string; agent_id: string; agent_name: string; status: string; latency_ms: number; started_at: string }, i: number) => (
              <div key={s.id ?? i} className="flex items-center gap-3 p-2.5 bg-red-500/5 rounded-xl border border-red-500/10">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-red-300 font-medium">{s.agent_name}</p>
                  <p className="text-[10px] text-slate-500">{s.latency_ms}ms · {timeAgo(s.started_at)}</p>
                </div>
                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">failed</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
