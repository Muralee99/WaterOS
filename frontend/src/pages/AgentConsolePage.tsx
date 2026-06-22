import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Play, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight,
  Brain, Zap, MessageSquare, Terminal, Loader2, Send
} from 'lucide-react'
import { agentApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'
import type { AgentResult, ReasoningStep } from '@/types'
import toast from 'react-hot-toast'

const AGENT_COLORS: Record<string, string> = {
  rainfall_agent: '#3B82F6',
  reservoir_agent: '#06B6D4',
  flood_agent: '#EF4444',
  water_quality_agent: '#10B981',
  leak_detection_agent: '#F59E0B',
  emergency_agent: '#DC2626',
  decision_agent: '#8B5CF6',
  global_coordinator: '#F59E0B',
  climate_agent: '#06B6D4',
  sensor_intelligence: '#10B981',
  infrastructure_agent: '#EC4899',
  country_agent: '#14B8A6',
  river_basin_agent: '#3B82F6',
  report_generation_agent: '#A855F7',
}

const BUILTIN_AGENTS = [
  { agent_id: 'global_coordinator', name: 'Global Coordinator', description: 'Orchestrates all water intelligence agents. Delegates tasks, synthesizes insights, and coordinates emergency responses across 195 countries.', category: 'coordination', tier: 'Global' },
  { agent_id: 'climate_agent', name: 'Climate Agent', description: 'Analyzes climate patterns, temperature anomalies, and long-term water cycle projections. Powers drought and heat stress forecasting.', category: 'analysis', tier: 'Global' },
  { agent_id: 'rainfall_agent', name: 'Rainfall Agent', description: 'Monitors precipitation levels and detects anomalies in real-time. Feeds flood and reservoir agents with hydrological data.', category: 'monitoring', tier: 'Country' },
  { agent_id: 'reservoir_agent', name: 'Reservoir Agent', description: 'Monitors reservoir levels across 12,840 sites. Generates optimized outflow recommendations and overflow risk assessments.', category: 'monitoring', tier: 'Country' },
  { agent_id: 'flood_agent', name: 'Flood Agent', description: 'Predicts flood events using ML models trained on 50 years of historical data. Issues early warnings with 87%+ accuracy.', category: 'emergency', tier: 'Country' },
  { agent_id: 'water_quality_agent', name: 'Water Quality Agent', description: 'Analyzes chemical composition across 284K sensor points. Detects contamination events and tracks WHO compliance levels.', category: 'analysis', tier: 'State' },
  { agent_id: 'sensor_intelligence', name: 'Sensor Intelligence', description: 'Processes 284K real-time IoT feeds. Detects anomalies, manages calibration alerts, and orchestrates sensor network health.', category: 'infrastructure', tier: 'Global' },
  { agent_id: 'infrastructure_agent', name: 'Infrastructure Agent', description: 'Models pipe networks, predicts failures using material degradation algorithms, and prioritizes maintenance for critical infrastructure.', category: 'infrastructure', tier: 'City' },
  { agent_id: 'leak_detection_agent', name: 'Leak Detection Agent', description: 'Uses acoustic sensor data and pressure differentials to localize pipeline leaks. Currently tracking 847 suspected leak zones.', category: 'monitoring', tier: 'City' },
  { agent_id: 'emergency_agent', name: 'Emergency Agent', description: 'Coordinates rapid response to water crises. Issues government alerts, activates emergency protocols, and tracks incident resolution.', category: 'emergency', tier: 'Global' },
  { agent_id: 'country_agent', name: 'Country Agent', description: 'Aggregates national water intelligence, generates country-level dashboards, and coordinates with government water authorities.', category: 'analysis', tier: 'Country' },
  { agent_id: 'river_basin_agent', name: 'River Basin Agent', description: 'Monitors transboundary river systems, tracks discharge rates, ecosystem health, and coordinates cross-border water agreements.', category: 'monitoring', tier: 'State' },
  { agent_id: 'decision_agent', name: 'Decision Agent', description: 'Multi-criteria decision analysis engine. Weighs tradeoffs in water allocation, infrastructure investment, and emergency response strategies.', category: 'coordination', tier: 'Global' },
  { agent_id: 'report_generation_agent', name: 'Report Generation Agent', description: 'Synthesizes multi-agent findings into executive reports, technical analyses, and scientific publications using Gemini 1.5 Pro.', category: 'analysis', tier: 'Global' },
]

const TIERS = ['All', 'Global', 'Country', 'State', 'City']

function AgentCard({ agent, onRun, result, isRunning }: {
  agent: { agent_id: string; name: string; description: string; category: string }
  onRun: () => void
  result?: AgentResult
  isRunning: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const color = AGENT_COLORS[agent.agent_id] ?? '#3B82F6'

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Bot className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-slate-500 capitalize">{agent.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              result.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            )}>
              {result.confidence ? `${(result.confidence * 100).toFixed(0)}% conf.` : result.status}
            </span>
          )}
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-medium transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{agent.description}</p>

      {result && (
        <div className="border-t border-white/5 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            View reasoning ({result.reasoning_chain?.length ?? 0} steps · {result.latency_ms}ms)
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {/* Result preview */}
                  <div className="bg-black/30 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-x-auto max-h-40 overflow-y-auto">
                    <pre>{JSON.stringify(result.result, null, 2)}</pre>
                  </div>
                  {/* Reasoning chain */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500 font-medium">Reasoning Chain:</p>
                    {result.reasoning_chain?.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 text-xs font-mono mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-xs text-slate-400">{step.step}</p>
                      </div>
                    ))}
                  </div>
                  {/* Tools called */}
                  {result.tools_called?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.tools_called.map((tool, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </GlassCard>
  )
}

export function AgentConsolePage() {
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string; metadata?: unknown }[]>([])
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())
  const [agentResults, setAgentResults] = useState<Record<string, AgentResult>>({})
  const [tierFilter, setTierFilter] = useState('All')

  const { data: fetchedAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      try { return await agentApi.list().then((r) => r.data) }
      catch { return BUILTIN_AGENTS }
    },
  })

  const agents = (fetchedAgents && fetchedAgents.length > 0 ? fetchedAgents : BUILTIN_AGENTS)
    .filter((a: { tier?: string }) => tierFilter === 'All' || a.tier === tierFilter)

  const runMutation = useMutation({
    mutationFn: ({ agentId, context }: { agentId: string; context: Record<string, unknown> }) =>
      agentApi.run(agentId, context).then((r) => r.data),
    onSuccess: (data, variables) => {
      setAgentResults((prev) => ({ ...prev, [variables.agentId]: data }))
      setRunningAgents((prev) => { const s = new Set(prev); s.delete(variables.agentId); return s })
      toast.success(`${variables.agentId.replace('_', ' ')} completed`)
    },
    onError: (_, variables) => {
      setRunningAgents((prev) => { const s = new Set(prev); s.delete(variables.agentId); return s })
      toast.error('Agent execution failed')
    },
  })

  const chatMutation = useMutation({
    mutationFn: ({ message, agentId }: { message: string; agentId: string }) =>
      agentApi.chat(message, agentId).then((r) => r.data),
    onSuccess: (data) => {
      setChatHistory((prev) => [...prev, {
        role: 'assistant',
        content: typeof data.response === 'object'
          ? (data.response as Record<string, unknown>)?.final_recommendation as string ?? JSON.stringify(data.response)
          : String(data.response),
        metadata: data,
      }])
    },
  })

  const handleRunAgent = (agentId: string) => {
    setRunningAgents((prev) => new Set(prev).add(agentId))
    runMutation.mutate({ agentId, context: {} })
  }

  const handleChat = () => {
    if (!chatInput.trim()) return
    setChatHistory((prev) => [...prev, { role: 'user', content: chatInput }])
    chatMutation.mutate({ message: chatInput, agentId: 'decision_agent' })
    setChatInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-blue-400" />Agent Console</h1>
          <p className="text-sm text-slate-500 mt-0.5">14 AI agents · Global→Country→State→City hierarchy · Gemini-powered</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {TIERS.map(t => (
              <button key={t} onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${tierFilter === t ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
              >{t}</button>
            ))}
          </div>
          <button
            onClick={() => agents?.forEach((a: { agent_id: string }) => handleRunAgent(a.agent_id))}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Run All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(agents ?? []).map((agent: { agent_id: string; name: string; description: string; category: string }) => (
              <AgentCard
                key={agent.agent_id}
                agent={agent}
                onRun={() => handleRunAgent(agent.agent_id)}
                result={agentResults[agent.agent_id]}
                isRunning={runningAgents.has(agent.agent_id)}
              />
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <GlassCard className="flex flex-col h-[600px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Decision Agent Chat</h3>
              <p className="text-xs text-slate-500">Ask anything about water systems</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-xs text-slate-600 mt-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Ask the Decision Agent about</p>
                <p>flood risk, reservoir status, water quality...</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-xs leading-relaxed max-w-[90%]',
                  msg.role === 'user'
                    ? 'bg-blue-600/20 text-blue-200 ml-auto'
                    : 'bg-white/5 text-slate-300'
                )}
              >
                {msg.content}
              </motion.div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 w-fit">
                <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                <span className="text-xs text-slate-400">Reasoning...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask about water conditions..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleChat}
              disabled={chatMutation.isPending || !chatInput.trim()}
              className="p-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-xl text-blue-400 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
