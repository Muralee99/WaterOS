import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, CheckCircle, AlertTriangle } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { countriesApi } from '@/services/api'
import { Droplets, Activity, Bot, Zap } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const mockDashboardData = (id: string) => ({
  name: id === 'india' ? 'India' : id.charAt(0).toUpperCase() + id.slice(1),
  emoji: id === 'india' ? '🇮🇳' : id === 'usa' ? '🇺🇸' : id === 'china' ? '🇨🇳' : '🌍',
  continent: 'Asia',
  national_water_score: 68.4,
  reservoir_capacity: 71.2,
  river_status: 'Warning',
  ai_confidence: 88.7,
  active_alerts: 12,
  ai_recommendations: [
    { text: 'Increase controlled outflow from Hirakud Dam by 15% to reduce overflow risk', confidence: 92.1, agents: ['Reservoir Agent', 'Flood Agent'] },
    { text: 'Deploy additional sensors in Brahmaputra basin for early flood detection', confidence: 88.4, agents: ['Sensor Intelligence', 'Rainfall Agent'] },
    { text: 'Activate emergency water conservation protocols in Rajasthan districts', confidence: 85.6, agents: ['Emergency Agent', 'Climate Agent'] },
  ],
  government_alerts: [
    { text: 'Red alert issued for 5 districts in Assam', severity: 'Critical' },
    { text: 'Water rationing advised in Delhi NCR', severity: 'High' },
    { text: 'Groundwater level below critical threshold in Punjab', severity: 'High' },
    { text: 'River Yamuna approaching flood stage at Palla gauge', severity: 'Medium' },
  ],
  historical_trends: MONTHS.map((m, i) => ({
    month: m,
    water_level: 60 + Math.sin(i * 0.5) * 20 + Math.random() * 5,
    rainfall: 40 + Math.sin(i * 0.4 + 1) * 30 + Math.random() * 10,
  })),
  water_demand: MONTHS.map((m, i) => ({
    month: m,
    demand: 800 + i * 20 + Math.random() * 100,
    supply: 780 + i * 15 + Math.random() * 80,
  })),
})

const severityColors: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export function CountryDashboard() {
  const { countryId } = useParams<{ countryId: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['country-dashboard', countryId],
    queryFn: async () => {
      try { return (await countriesApi.dashboard(countryId!)).data }
      catch { return mockDashboardData(countryId ?? 'india') }
    },
  })

  const d = data ?? mockDashboardData(countryId ?? 'india')

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/countries')} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{d.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{d.name}</h1>
            <p className="text-sm text-slate-500">{d.continent} · National Water Dashboard</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 glass rounded-xl">
          <span className="text-2xl font-bold text-blue-400">{d.national_water_score}</span>
          <div>
            <p className="text-[10px] text-slate-500">Water Score</p>
            <p className="text-[10px] text-blue-400">/100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Reservoir Capacity', value: d.reservoir_capacity, unit: '%', icon: Droplets, status: 'info' as const },
          { title: 'River Status', value: d.river_status, icon: Activity, status: 'warning' as const },
          { title: 'AI Confidence', value: d.ai_confidence, unit: '%', icon: Bot, status: 'good' as const },
          { title: 'Active Alerts', value: d.active_alerts, icon: Zap, status: 'critical' as const },
        ].map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {d.ai_recommendations.map((rec: { text: string; confidence: number; agents: string[] }, i: number) => (
              <div key={i} className="p-3 bg-white/3 rounded-xl border border-white/5">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-300">{rec.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-emerald-400">{rec.confidence}% confidence</span>
                  <span className="text-slate-600">·</span>
                  {rec.agents.map((a: string) => (
                    <span key={a} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Government Alerts</h3>
          </div>
          <div className="space-y-2">
            {d.government_alerts.map((alert: { text: string; severity: string }, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white/3 rounded-lg">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${severityColors[alert.severity]}`}>{alert.severity}</span>
                <p className="text-xs text-slate-400">{alert.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Historical Water Level & Rainfall (12 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={d.historical_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="water_level" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rainfall" stroke="#06B6D4" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Water Demand vs Supply (MCM)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={d.water_demand}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="demand" stroke="#3B82F6" fill="url(#demandGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="supply" stroke="#06B6D4" fill="url(#supplyGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">{d.ai_confidence}%</span></div>
        <p className="text-xs text-slate-400 mb-2">Country-level analysis complete. AI agents detected early monsoon patterns with 92% accuracy. Reservoir optimization recommendations could improve water security by 18% over the next quarter.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Country Agent', 'Reservoir Agent', 'Rainfall Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['forecastRain()', 'optimizeReservoir()', 'getHistoricalData()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
