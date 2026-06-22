import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Droplets, Radio, Bot, AlertTriangle, CloudRain, Activity, Zap, Brain } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { globalApi } from '@/services/api'

const mockDashboard = {
  water_health_score: 74.2, ai_confidence: 89.3, countries_monitored: 195,
  reservoirs: 12840, sensors_online: 284000, active_agents: 14,
  flood_risks: 23, drought_risks: 18, water_quality_index: 74.2,
  leak_detection_count: 847, emergency_incidents: 3,
}

const CONTINENTS = [
  { name: 'Asia', water_health: 71.2, reservoir_capacity: 68, flood_risk: 'High', emoji: '🌏' },
  { name: 'Africa', water_health: 58.4, reservoir_capacity: 45, flood_risk: 'Critical', emoji: '🌍' },
  { name: 'Americas', water_health: 79.1, reservoir_capacity: 72, flood_risk: 'Medium', emoji: '🌎' },
  { name: 'Europe', water_health: 85.3, reservoir_capacity: 81, flood_risk: 'Low', emoji: '🌍' },
  { name: 'Oceania', water_health: 76.8, reservoir_capacity: 63, flood_risk: 'Medium', emoji: '🌏' },
  { name: 'Antarctica', water_health: 94.1, reservoir_capacity: 99, flood_risk: 'Low', emoji: '🧊' },
]

const agentActions = [
  { agent: 'Global Coordinator', action: 'Coordinating flood response across South Asia', confidence: 94.2 },
  { agent: 'Rainfall Agent', action: 'Detected 340mm anomaly in Bangladesh', confidence: 91.5 },
  { agent: 'Reservoir Agent', action: 'Optimizing release schedule for Hirakud Dam', confidence: 88.7 },
  { agent: 'Climate Agent', action: 'Updated 6-month drought projection for Sahel', confidence: 86.3 },
  { agent: 'Emergency Agent', action: 'Issued pre-emptive alert to 12 districts', confidence: 92.1 },
  { agent: 'Sensor Intelligence', action: 'Processing 284K real-time sensor feeds', confidence: 95.1 },
  { agent: 'Water Quality Agent', action: 'Ganges basin chemical analysis complete', confidence: 85.6 },
]

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export function GlobalPage() {
  const [feed, setFeed] = useState(agentActions.slice(0, 5))
  const [feedIdx, setFeedIdx] = useState(5)

  const { data } = useQuery({
    queryKey: ['global-dashboard'],
    queryFn: async () => {
      try { return (await globalApi.dashboard()).data }
      catch { return mockDashboard }
    },
    refetchInterval: 30000,
  })

  const dash = data ?? mockDashboard

  useEffect(() => {
    const interval = setInterval(() => {
      setFeed(prev => {
        const next = agentActions[feedIdx % agentActions.length]
        setFeedIdx(i => i + 1)
        return [{ ...next, timestamp: new Date().toISOString() }, ...prev.slice(0, 4)]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [feedIdx])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" /> Global Intelligence Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time planetary water intelligence powered by 14 AI agents</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Live · {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { title: 'Water Health Score', value: dash.water_health_score, unit: '/100', icon: Activity, status: 'good' as const },
          { title: 'Countries Monitored', value: dash.countries_monitored, icon: Globe, status: 'info' as const },
          { title: 'Active AI Agents', value: dash.active_agents, icon: Bot, status: 'info' as const },
          { title: 'Flood Risks', value: dash.flood_risks, icon: CloudRain, status: 'warning' as const },
          { title: 'Drought Risks', value: dash.drought_risks, icon: AlertTriangle, status: 'warning' as const },
          { title: 'Emergency Incidents', value: dash.emergency_incidents, icon: Zap, status: 'critical' as const },
        ].map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* AI Confidence gauge */}
        <GlassCard className="p-5 flex flex-col items-center justify-center" glow="blue">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">AI Confidence</p>
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#3B82F6" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34 * dash.ai_confidence / 100} ${2 * Math.PI * 34}`}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <span className="text-xl font-bold text-white">{dash.ai_confidence.toFixed(0)}%</span>
          </div>
          <p className="text-xs text-blue-400 mt-1">Gemini 1.5 Pro</p>
        </GlassCard>
        <MetricCard title="Sensors Online" value={`${(dash.sensors_online / 1000).toFixed(0)}K`} icon={Radio} status="good" />
        <MetricCard title="Reservoirs" value={`${(dash.reservoirs / 1000).toFixed(1)}K`} icon={Droplets} status="info" />
        <MetricCard title="Water Quality Index" value={dash.water_quality_index} unit="/100" icon={Activity} status="good" />
      </div>

      {/* Live Feed + Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live AI Reasoning Feed */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Live AI Reasoning Feed</h3>
            <span className="ml-auto text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 animate-pulse">LIVE</span>
          </div>
          <div className="space-y-2 h-52 overflow-hidden">
            <AnimatePresence initial={false}>
              {feed.map((item, i) => (
                <motion.div
                  key={`${item.agent}-${i}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 p-2.5 bg-white/3 rounded-lg border border-white/5"
                >
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-400">{item.agent}</p>
                    <p className="text-xs text-slate-400 truncate">{item.action}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 shrink-0">{item.confidence}%</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Agent Decisions Table */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Agent Decisions</h3>
          <div className="space-y-2">
            {agentActions.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                <div className="w-6 h-6 rounded-md bg-blue-600/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{item.agent}</p>
                  <p className="text-[10px] text-slate-500 truncate">{item.action}</p>
                </div>
                <span className="text-[10px] text-emerald-400 shrink-0">{item.confidence}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Continent Overview */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Continent Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CONTINENTS.map((c) => (
            <div key={c.name} className="bg-white/3 rounded-xl p-3 border border-white/5 hover:border-blue-500/20 transition-colors">
              <div className="text-2xl mb-2">{c.emoji}</div>
              <p className="text-xs font-semibold text-white">{c.name}</p>
              <p className="text-lg font-bold text-blue-400 mt-1">{c.water_health}</p>
              <p className="text-[10px] text-slate-500">Water Health</p>
              <div className="mt-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500">Reservoir</span>
                  <span className="text-slate-300">{c.reservoir_capacity}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.reservoir_capacity}%` }} />
                </div>
              </div>
              <span className={`mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${riskColors[c.flood_risk]}`}>
                {c.flood_risk}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI Insights */}
      <GlassCard className="p-5" glow="blue">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          <span className="ml-auto text-2xl font-bold text-blue-400">{dash.ai_confidence}%</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Global water intelligence analysis indicates moderate stress conditions across South Asia and Sub-Saharan Africa.
          AI agents project 18% improvement in reservoir optimization with recommended outflow adjustments.
          Climate models show early monsoon onset increasing flood probability by 34% in Bangladesh and Myanmar.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Global Coordinator', 'Climate Agent', 'Flood Agent', 'Reservoir Agent'].map(a => (
            <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>
          ))}
          {['forecastRain()', 'predictFlood()', 'optimizeReservoir()'].map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
