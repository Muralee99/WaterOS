import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Waves, AlertTriangle, Activity,
  Bot, Shield, Zap, TrendingUp, Brain, CheckCircle, ChevronDown, Check
} from 'lucide-react'
import { dashboardApi } from '@/services/api'
import { MetricCard } from '@/components/ui/MetricCard'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const COUNTRIES = [
  { id: 'india',      name: 'India',         emoji: '🇮🇳', water_score: 68.4, reservoirs: 5,  sensors: 142, flood_risk: 'High',   quality: 71.2, leaks: 4,  alerts: 12, agents: 7,  reservoir_pct: 71, ai_acc: 92.1 },
  { id: 'usa',        name: 'United States',  emoji: '🇺🇸', water_score: 82.1, reservoirs: 8,  sensors: 284, flood_risk: 'Medium', quality: 88.4, leaks: 2,  alerts: 5,  agents: 6,  reservoir_pct: 79, ai_acc: 95.3 },
  { id: 'china',      name: 'China',          emoji: '🇨🇳', water_score: 72.3, reservoirs: 12, sensors: 310, flood_risk: 'High',   quality: 74.6, leaks: 6,  alerts: 18, agents: 9,  reservoir_pct: 81, ai_acc: 91.8 },
  { id: 'brazil',     name: 'Brazil',         emoji: '🇧🇷', water_score: 76.8, reservoirs: 4,  sensors: 98,  flood_risk: 'Medium', quality: 79.2, leaks: 3,  alerts: 7,  agents: 5,  reservoir_pct: 74, ai_acc: 90.2 },
  { id: 'australia',  name: 'Australia',      emoji: '🇦🇺', water_score: 70.5, reservoirs: 3,  sensors: 74,  flood_risk: 'Low',    quality: 83.1, leaks: 1,  alerts: 4,  agents: 5,  reservoir_pct: 52, ai_acc: 94.7 },
  { id: 'egypt',      name: 'Egypt',          emoji: '🇪🇬', water_score: 54.2, reservoirs: 2,  sensors: 38,  flood_risk: 'Low',    quality: 58.9, leaks: 8,  alerts: 22, agents: 4,  reservoir_pct: 41, ai_acc: 87.3 },
  { id: 'germany',    name: 'Germany',        emoji: '🇩🇪', water_score: 88.4, reservoirs: 6,  sensors: 118, flood_risk: 'Low',    quality: 92.7, leaks: 1,  alerts: 2,  agents: 5,  reservoir_pct: 85, ai_acc: 96.8 },
  { id: 'japan',      name: 'Japan',          emoji: '🇯🇵', water_score: 84.7, reservoirs: 7,  sensors: 162, flood_risk: 'Medium', quality: 90.3, leaks: 1,  alerts: 3,  agents: 6,  reservoir_pct: 78, ai_acc: 95.9 },
  { id: 'canada',     name: 'Canada',         emoji: '🇨🇦', water_score: 91.2, reservoirs: 9,  sensors: 132, flood_risk: 'Low',    quality: 94.1, leaks: 0,  alerts: 1,  agents: 5,  reservoir_pct: 88, ai_acc: 97.2 },
  { id: 'nigeria',    name: 'Nigeria',        emoji: '🇳🇬', water_score: 49.8, reservoirs: 2,  sensors: 28,  flood_risk: 'High',   quality: 51.4, leaks: 11, alerts: 31, agents: 4,  reservoir_pct: 38, ai_acc: 84.6 },
  { id: 'russia',     name: 'Russia',         emoji: '🇷🇺', water_score: 79.3, reservoirs: 11, sensors: 198, flood_risk: 'Low',    quality: 81.7, leaks: 3,  alerts: 6,  agents: 7,  reservoir_pct: 82, ai_acc: 93.4 },
  { id: 'indonesia',  name: 'Indonesia',      emoji: '🇮🇩', water_score: 65.1, reservoirs: 3,  sensors: 64,  flood_risk: 'High',   quality: 67.8, leaks: 7,  alerts: 14, agents: 5,  reservoir_pct: 61, ai_acc: 88.9 },
  { id: 'bangladesh', name: 'Bangladesh',     emoji: '🇧🇩', water_score: 52.7, reservoirs: 1,  sensors: 32,  flood_risk: 'Critical',quality: 54.3,leaks: 9,  alerts: 28, agents: 4,  reservoir_pct: 44, ai_acc: 86.1 },
  { id: 'france',     name: 'France',         emoji: '🇫🇷', water_score: 86.9, reservoirs: 5,  sensors: 104, flood_risk: 'Low',    quality: 91.4, leaks: 1,  alerts: 2,  agents: 5,  reservoir_pct: 83, ai_acc: 96.1 },
  { id: 'argentina',  name: 'Argentina',      emoji: '🇦🇷', water_score: 74.6, reservoirs: 4,  sensors: 68,  flood_risk: 'Medium', quality: 76.9, leaks: 4,  alerts: 9,  agents: 5,  reservoir_pct: 68, ai_acc: 91.0 },
]

const AI_FEED = [
  { agent: 'Global Coordinator', action: 'Coordinating flood response across South Asia', confidence: 94.2 },
  { agent: 'Rainfall Agent', action: 'Detected 340mm anomaly in Bangladesh — elevated flood risk', confidence: 91.5 },
  { agent: 'Reservoir Agent', action: 'Recommending controlled release for Hirakud Dam', confidence: 88.7 },
  { agent: 'Climate Agent', action: 'Updated 6-month drought projection for Sahel region', confidence: 86.3 },
  { agent: 'Emergency Agent', action: 'Pre-emptive alert issued to 12 districts in Assam', confidence: 92.1 },
  { agent: 'Sensor Intelligence', action: 'Anomaly pattern detected in 3 groundwater sensors', confidence: 85.6 },
  { agent: 'Water Quality Agent', action: 'Ganges basin turbidity within WHO limits — safe', confidence: 97.2 },
]

const SYSTEM_SERVICES = [
  { name: 'FastAPI Backend', status: 'Online', uptime: '99.8%', latency: '28ms' },
  { name: 'PostgreSQL', status: 'Online', uptime: '100%', latency: '4ms' },
  { name: 'Redis Cache', status: 'Online', uptime: '100%', latency: '1ms' },
  { name: 'Qdrant Vector DB', status: 'Online', uptime: '99.9%', latency: '12ms' },
  { name: 'Kafka Streams', status: 'Online', uptime: '99.7%', latency: '8ms' },
  { name: 'Gemini API', status: 'Online', uptime: '99.5%', latency: '420ms' },
]

const RESERVOIR_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  level: 55 + Math.sin(i * 0.3) * 15 + Math.random() * 5,
  inflow: 200 + Math.random() * 300,
  outflow: 180 + Math.random() * 250,
}))

const QUALITY_DATA = [
  { name: 'pH', value: 7.2, fill: '#3B82F6' },
  { name: 'DO', value: 8.5, fill: '#06B6D4' },
  { name: 'Chlorine', value: 0.8, fill: '#10B981' },
  { name: 'Turbidity', value: 2.1, fill: '#F59E0B' },
]

export function DashboardPage() {
  const [feed, setFeed] = useState(AI_FEED.slice(0, 4))
  const [feedIdx, setFeedIdx] = useState(4)
  const [selectedCountryId, setSelectedCountryId] = useState('india')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const country = COUNTRIES.find(c => c.id === selectedCountryId) ?? COUNTRIES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setFeed(prev => {
        const next = AI_FEED[feedIdx % AI_FEED.length]
        setFeedIdx(i => i + 1)
        return [next, ...prev.slice(0, 3)]
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [feedIdx])

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', selectedCountryId],
    queryFn: async () => {
      try { return await dashboardApi.getData().then((r) => r.data) }
      catch { return null }
    },
    refetchInterval: 30000,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      try { return await dashboardApi.getStats().then((r) => r.data) }
      catch { return null }
    },
    refetchInterval: 60000,
  })

  const d = {
    water_health_score:      dashboard?.water_health_score      ?? country.water_score,
    avg_reservoir_level_pct: dashboard?.avg_reservoir_level_pct ?? country.reservoir_pct,
    flood_risk:              dashboard?.flood_risk               ?? country.flood_risk,
    active_agents:           dashboard?.active_agents            ?? country.agents,
    water_quality_score:     dashboard?.water_quality_score      ?? country.quality,
    active_leak_alerts:      dashboard?.active_leak_alerts       ?? country.leaks,
    alerts_today:            dashboard?.alerts_today             ?? country.alerts,
    total_sensors:           dashboard?.total_sensors            ?? country.sensors,
    total_reservoirs:        dashboard?.total_reservoirs         ?? country.reservoirs,
    ai_accuracy:             stats?.ai_predictions_accuracy      ?? country.ai_acc,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">{country.emoji}</span>
            {country.name} — Water Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time monitoring powered by AI agents</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Country selector — custom dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-xl px-4 py-2 text-sm text-white transition-colors min-w-[180px]"
            >
              <span className="text-base">{country.emoji}</span>
              <span className="flex-1 text-left">{country.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-52 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="max-h-72 overflow-y-auto py-1">
                    {COUNTRIES.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCountryId(c.id); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-blue-600/20 ${c.id === selectedCountryId ? 'bg-blue-600/15 text-blue-300' : 'text-slate-300'}`}
                      >
                        <span className="text-base">{c.emoji}</span>
                        <span className="flex-1">{c.name}</span>
                        {c.id === selectedCountryId && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">All systems operational</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
          <MetricCard
            title="Water Health Score"
            value={d.water_health_score}
            unit="%"
            icon={Shield}
            status={d.water_health_score >= 80 ? 'good' : d.water_health_score >= 60 ? 'warning' : 'critical'}
            trend="up"
            trendValue="+2.1% this week"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MetricCard
            title="Avg Reservoir Level"
            value={d.avg_reservoir_level_pct}
            unit="%"
            icon={Waves}
            status="info"
            subtitle={`${d.total_reservoirs} reservoirs monitored`}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MetricCard
            title="Flood Risk"
            value={String(d.flood_risk).toUpperCase()}
            icon={AlertTriangle}
            status={String(d.flood_risk).toLowerCase() === 'critical' || String(d.flood_risk).toLowerCase() === 'high' ? 'critical' : 'warning'}
            subtitle="Next 24 hours"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard
            title="Active Agents"
            value={d.active_agents}
            icon={Bot}
            status="info"
            trend="stable"
            trendValue="All responding"
          />
        </motion.div>
      </div>

      {/* Second KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Water Quality Score" value={d.water_quality_score} unit="%" icon={Droplets} status={d.water_quality_score >= 80 ? 'good' : 'warning'} />
        <MetricCard title="Active Leak Alerts" value={d.active_leak_alerts} icon={Activity} status={d.active_leak_alerts > 3 ? 'critical' : 'warning'} />
        <MetricCard title="AI Predictions Accuracy" value={d.ai_accuracy} unit="%" icon={TrendingUp} status="good" />
        <MetricCard title="Alerts Today" value={d.alerts_today} icon={Zap} status="warning" subtitle={`${d.total_sensors} sensors active`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservoir History */}
        <GlassCard className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Reservoir Level History (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={RESERVOIR_HISTORY}>
              <defs>
                <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="level" stroke="#3B82F6" fill="url(#levelGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Water Quality Radial */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Water Quality Parameters</h3>
          <div className="space-y-3">
            {[
              { label: 'pH Level', value: 7.2, max: 14, color: '#3B82F6', safe: '6.5-8.5' },
              { label: 'Turbidity (NTU)', value: 2.1, max: 10, color: '#06B6D4', safe: '<4' },
              { label: 'Chlorine (mg/L)', value: 0.8, max: 2, color: '#10B981', safe: '0.2-2.0' },
              { label: 'Dissolved O₂', value: 8.5, max: 14, color: '#F59E0B', safe: '>6' },
            ].map((param) => (
              <div key={param.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{param.label}</span>
                  <span className="text-white font-medium">{param.value}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(param.value / param.max) * 100}%`, background: param.color }}
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5">WHO safe range: {param.safe}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Flow and AI Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Reservoir Inflow vs Outflow (30 days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={RESERVOIR_HISTORY.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="inflow" fill="#3B82F6" radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="outflow" fill="#06B6D4" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">System Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Agent Executions Today', value: stats?.agent_executions_today ?? 147, icon: Bot, color: 'text-blue-400' },
              { label: 'Avg Response Time', value: `${stats?.avg_response_time_ms ?? 280}ms`, icon: Activity, color: 'text-cyan-400' },
              { label: 'Leaks Detected', value: stats?.leaks_detected_this_month ?? d.active_leak_alerts, icon: Droplets, color: 'text-amber-400' },
              { label: 'Water Saved (MCM)', value: stats?.water_saved_mcm ?? 284, icon: TrendingUp, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/3 rounded-lg p-3">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Reasoning Feed + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Live AI Reasoning Feed</h3>
            <span className="ml-auto text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 animate-pulse">LIVE</span>
          </div>
          <div className="space-y-2 h-44 overflow-hidden">
            <AnimatePresence initial={false}>
              {feed.map((item, i) => (
                <motion.div
                  key={`${item.agent}-${i}`}
                  initial={{ opacity: 0, y: -16 }}
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

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
          <div className="space-y-2">
            {SYSTEM_SERVICES.map(svc => (
              <div key={svc.name} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs text-white flex-1">{svc.name}</p>
                <span className="text-[10px] text-slate-500">{svc.uptime}</span>
                <span className="text-[10px] text-slate-500">{svc.latency}</span>
                <span className="text-[10px] text-emerald-400 font-medium">{svc.status}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
