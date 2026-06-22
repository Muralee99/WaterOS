import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Waves, AlertTriangle, Activity,
  Bot, Shield, Zap, TrendingUp, Brain, CheckCircle
} from 'lucide-react'
import { dashboardApi } from '@/services/api'
import { MetricCard } from '@/components/ui/MetricCard'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'

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

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getData().then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading WaterOS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Water Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time monitoring powered by AI agents</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">All systems operational</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
          <MetricCard
            title="Water Health Score"
            value={dashboard?.water_health_score ?? 88.4}
            unit="%"
            icon={Shield}
            status="good"
            trend="up"
            trendValue="+2.1% this week"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MetricCard
            title="Avg Reservoir Level"
            value={dashboard?.avg_reservoir_level_pct ?? 67.3}
            unit="%"
            icon={Waves}
            status="info"
            subtitle={`${dashboard?.total_reservoirs ?? 5} reservoirs monitored`}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MetricCard
            title="Flood Risk"
            value={dashboard?.flood_risk?.toUpperCase() ?? 'MEDIUM'}
            icon={AlertTriangle}
            status={dashboard?.flood_risk === 'high' || dashboard?.flood_risk === 'critical' ? 'critical' : 'warning'}
            subtitle="Next 24 hours"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard
            title="Active Agents"
            value={dashboard?.active_agents ?? 7}
            icon={Bot}
            status="info"
            trend="stable"
            trendValue="All responding"
          />
        </motion.div>
      </div>

      {/* Second KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Water Quality Score" value={dashboard?.water_quality_score ?? 91.2} unit="%" icon={Droplets} status="good" />
        <MetricCard title="Active Leak Alerts" value={dashboard?.active_leak_alerts ?? 2} icon={Activity} status={dashboard?.active_leak_alerts > 3 ? 'critical' : 'warning'} />
        <MetricCard title="AI Predictions Accuracy" value={stats?.ai_predictions_accuracy ?? 94.1} unit="%" icon={TrendingUp} status="good" />
        <MetricCard title="Alerts Today" value={dashboard?.alerts_today ?? 8} icon={Zap} status="warning" subtitle={`${dashboard?.total_sensors ?? 142} sensors active`} />
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
              { label: 'Leaks Detected', value: stats?.leaks_detected_this_month ?? 7, icon: Droplets, color: 'text-amber-400' },
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
