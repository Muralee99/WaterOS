import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Waves, TrendingUp, TrendingDown, AlertTriangle, Droplets, Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { reservoirApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Reservoir } from '@/types'

// ─── Mock data (matches our PostgreSQL sample data) ────────────────────────
const MOCK_RESERVOIRS: Reservoir[] = [
  { id: '1', name: 'Hirakud Reservoir',               location: 'Odisha, India',         latitude: 21.52, longitude: 83.87, capacity_mcm: 8136,   current_level_mcm: 7420,  fill_percentage: 91.2, inflow_rate: 480,  outflow_rate: 320, overflow_risk: 'high',     last_updated: '2 min ago', history: [78,80,82,84,85,86,88,89,90,91] },
  { id: '2', name: 'Tansa–Vaitarna Complex',          location: 'Maharashtra, India',    latitude: 19.83, longitude: 73.38, capacity_mcm: 168,    current_level_mcm: 153,   fill_percentage: 91.1, inflow_rate: 24,   outflow_rate: 18,  overflow_risk: 'high',     last_updated: '5 min ago', history: [76,79,82,84,86,88,89,90,91,91] },
  { id: '3', name: 'Khadakwasla Reservoir',           location: 'Pune, Maharashtra',     latitude: 18.44, longitude: 73.77, capacity_mcm: 35,     current_level_mcm: 31,    fill_percentage: 88.6, inflow_rate: 18,   outflow_rate: 14,  overflow_risk: 'high',     last_updated: '8 min ago', history: [71,74,77,79,81,83,85,86,87,89] },
  { id: '4', name: 'Kopili Reservoir',                location: 'Assam, India',          latitude: 25.91, longitude: 93.02, capacity_mcm: 402,    current_level_mcm: 351,   fill_percentage: 87.3, inflow_rate: 120,  outflow_rate: 80,  overflow_risk: 'high',     last_updated: '3 min ago', history: [68,72,75,78,80,82,84,85,86,87] },
  { id: '5', name: 'Three Gorges Dam',                location: 'Hubei, China',          latitude: 30.82, longitude: 111.0, capacity_mcm: 39300,  current_level_mcm: 35080, fill_percentage: 89.3, inflow_rate: 3200, outflow_rate: 2800,overflow_risk: 'high',     last_updated: '1 min ago', history: [82,83,85,86,87,88,88,89,89,89] },
  { id: '6', name: 'Shasta Lake',                    location: 'California, USA',        latitude: 40.72, longitude: -122.4,capacity_mcm: 4552,   current_level_mcm: 2462,  fill_percentage: 54.1, inflow_rate: 310,  outflow_rate: 290, overflow_risk: 'low',      last_updated: '10 min ago',history: [62,61,59,58,57,56,56,55,54,54] },
  { id: '7', name: 'Lake Mead',                      location: 'Nevada/Arizona, USA',    latitude: 36.01, longitude: -114.7,capacity_mcm: 36703,  current_level_mcm: 13947, fill_percentage: 38.0, inflow_rate: 420,  outflow_rate: 460, overflow_risk: 'low',      last_updated: '15 min ago',history: [45,44,43,42,41,40,40,39,38,38] },
  { id: '8', name: 'Lake Wivenhoe',                  location: 'Queensland, Australia',  latitude: -27.4, longitude: 152.6, capacity_mcm: 1165,   current_level_mcm: 214,   fill_percentage: 18.4, inflow_rate: 12,   outflow_rate: 22,  overflow_risk: 'low',      last_updated: '20 min ago',history: [28,26,25,24,23,22,21,20,19,18] },
  { id: '9', name: 'Lake Nasser',                    location: 'Aswan, Egypt',           latitude: 22.97, longitude: 32.88, capacity_mcm: 132000, current_level_mcm: 90288, fill_percentage: 68.4, inflow_rate: 1240, outflow_rate: 1180,overflow_risk: 'medium',   last_updated: '30 min ago',history: [65,66,66,67,67,68,68,68,68,68] },
  { id: '10',name: 'Itaipu Reservoir',               location: 'Brazil/Paraguay',        latitude: -25.4, longitude: -54.6, capacity_mcm: 29000,  current_level_mcm: 22670, fill_percentage: 78.2, inflow_rate: 2800, outflow_rate: 2600,overflow_risk: 'medium',   last_updated: '5 min ago', history: [74,75,75,76,77,77,78,78,78,78] },
  { id: '11',name: 'Bhakra–Nangal',                  location: 'Himachal Pradesh, India',latitude: 31.41, longitude: 76.43, capacity_mcm: 7501,   current_level_mcm: 5626,  fill_percentage: 75.0, inflow_rate: 680,  outflow_rate: 620, overflow_risk: 'medium',   last_updated: '12 min ago',history: [68,69,70,71,72,73,73,74,75,75] },
  { id: '12',name: 'Bisalpur Dam',                   location: 'Rajasthan, India',       latitude: 25.93, longitude: 75.18, capacity_mcm: 1086,   current_level_mcm: 449,   fill_percentage: 41.3, inflow_rate: 42,   outflow_rate: 68,  overflow_risk: 'low',      last_updated: '25 min ago',history: [55,53,51,49,48,46,45,43,42,41] },
  { id: '13',name: 'Rappbode Reservoir',             location: 'Saxony-Anhalt, Germany', latitude: 51.73, longitude: 11.05, capacity_mcm: 113,    current_level_mcm: 98,    fill_percentage: 86.7, inflow_rate: 8,    outflow_rate: 7,   overflow_risk: 'medium',   last_updated: '18 min ago',history: [82,83,84,84,85,85,86,86,86,87] },
  { id: '14',name: 'Okutama Lake',                   location: 'Tokyo, Japan',           latitude: 35.79, longitude: 139.0, capacity_mcm: 185,    current_level_mcm: 161,   fill_percentage: 87.1, inflow_rate: 22,   outflow_rate: 20,  overflow_risk: 'medium',   last_updated: '7 min ago', history: [83,84,84,85,85,86,86,86,87,87] },
  { id: '15',name: 'Gardiner Dam (Lake Diefenbaker)', location: 'Saskatchewan, Canada',  latitude: 51.13, longitude: -106.7,capacity_mcm: 9420,   current_level_mcm: 7065,  fill_percentage: 75.0, inflow_rate: 480,  outflow_rate: 460, overflow_risk: 'medium',   last_updated: '22 min ago',history: [72,73,73,74,74,75,75,75,75,75] },
]

const RISK_CONFIG = {
  low:      { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Low Risk'      },
  medium:   { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     label: 'Med Risk'      },
  high:     { text: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',   label: 'High Risk'     },
  critical: { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         label: 'CRITICAL'      },
}

const fillColor = (pct: number) =>
  pct > 85 ? 'linear-gradient(90deg,#EF4444,#F97316)' :
  pct > 70 ? 'linear-gradient(90deg,#F59E0B,#EAB308)' :
  pct > 45 ? 'linear-gradient(90deg,#3B82F6,#06B6D4)' :
             'linear-gradient(90deg,#64748b,#94a3b8)'

function ReservoirCard({ r, index }: { r: Reservoir; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const risk = RISK_CONFIG[r.overflow_risk]
  const chartData = (r.history ?? []).map((v, i) => ({ i: `D-${9 - i}`, v }))
  const trend = r.inflow_rate > r.outflow_rate ? 'rising' : r.inflow_rate < r.outflow_rate ? 'falling' : 'stable'
  const trendColor = trend === 'rising' ? 'text-orange-400' : trend === 'falling' ? 'text-emerald-400' : 'text-slate-400'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <GlassCard className="p-4 hover:bg-white/6 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{r.name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{r.location}</p>
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded-full border shrink-0 ml-2 ${risk.bg} ${risk.text}`}>
            {risk.label}
          </span>
        </div>

        {/* Fill gauge */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Fill Level</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] ${trendColor}`}>
                {trend === 'rising' ? '▲ rising' : trend === 'falling' ? '▼ falling' : '━ stable'}
              </span>
              <span className="text-white font-bold">{r.fill_percentage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${r.fill_percentage}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.04 }}
              className="h-full rounded-full"
              style={{ background: fillColor(r.fill_percentage) }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>{r.current_level_mcm.toLocaleString()} MCM</span>
            <span>{r.capacity_mcm.toLocaleString()} MCM capacity</span>
          </div>
        </div>

        {/* Inflow / Outflow */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/3 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-slate-500">Inflow</span>
            </div>
            <p className="text-sm font-bold text-white">{r.inflow_rate} <span className="text-[9px] text-slate-500">m³/s</span></p>
          </div>
          <div className="bg-white/3 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingDown className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] text-slate-500">Outflow</span>
            </div>
            <p className="text-sm font-bold text-white">{r.outflow_rate} <span className="text-[9px] text-slate-500">m³/s</span></p>
          </div>
        </div>

        {/* Sparkline */}
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`g${r.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={r.fill_percentage > 85 ? '#EF4444' : '#3B82F6'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={r.fill_percentage > 85 ? '#EF4444' : '#3B82F6'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={r.fill_percentage > 85 ? '#F97316' : '#3B82F6'}
              fill={`url(#g${r.id})`} strokeWidth={1.5} dot={false} />
            <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '10px' }}
              formatter={(v: number) => [`${v}%`, 'Fill']} labelFormatter={() => ''} />
          </AreaChart>
        </ResponsiveContainer>

        {/* AI insight toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-blue-400" />
            <span>AI Recommendation</span>
          </div>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-2">
              <p className="text-[10px] text-slate-400 leading-relaxed p-2 bg-blue-500/5 rounded-lg border border-blue-500/15">
                {r.overflow_risk === 'high' || r.overflow_risk === 'critical'
                  ? `⚠ Overflow risk HIGH (${r.fill_percentage.toFixed(0)}%). Recommend increasing outflow to ${Math.round(r.inflow_rate * 1.2)} m³/s. Alert downstream communities. Monitor every 30 minutes.`
                  : r.fill_percentage < 40
                  ? `⚡ Storage critically low (${r.fill_percentage.toFixed(0)}%). At current deficit of ${r.outflow_rate - r.inflow_rate} m³/s, dry in ~${Math.round(r.current_level_mcm / ((r.outflow_rate - r.inflow_rate) * 86400 / 1e6))} days. Reduce outflow. Activate drought protocol.`
                  : r.fill_percentage < 60
                  ? `ℹ Storage below seasonal average (${r.fill_percentage.toFixed(0)}%). Net flow: ${r.inflow_rate > r.outflow_rate ? '+' : ''}${r.inflow_rate - r.outflow_rate} m³/s. Continue monitoring. Consider demand-side conservation.`
                  : `✓ Reservoir operating within normal parameters (${r.fill_percentage.toFixed(0)}%). Net flow balanced at ${r.inflow_rate - r.outflow_rate > 0 ? '+' : ''}${r.inflow_rate - r.outflow_rate} m³/s. No action required.`
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-2 text-[9px] text-slate-600">
          <div className="flex items-center gap-1">
            <Waves className="w-2.5 h-2.5 text-blue-400" />
            <span>Updated {r.last_updated}</span>
          </div>
          {r.overflow_risk === 'high' && <AlertTriangle className="w-3 h-3 text-orange-400" />}
          {r.overflow_risk === 'critical' && <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />}
        </div>
      </GlassCard>
    </motion.div>
  )
}

export function ReservoirsPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'low'>('all')

  const { data: apiData } = useQuery({
    queryKey: ['reservoirs'],
    queryFn: () => reservoirApi.list().then(r => r.data),
    retry: false,
  })

  const raw: Reservoir[] = (Array.isArray(apiData) && apiData.length > 0) ? apiData : MOCK_RESERVOIRS

  const reservoirs = raw.filter(r =>
    filter === 'all'  ? true :
    filter === 'high' ? (r.overflow_risk === 'high' || r.overflow_risk === 'critical') :
                        r.fill_percentage < 50
  )

  const stats = {
    total: raw.length,
    highRisk: raw.filter(r => r.overflow_risk === 'high' || r.overflow_risk === 'critical').length,
    avgFill: Math.round(raw.reduce((s, r) => s + r.fill_percentage, 0) / raw.length),
    totalCapacity: Math.round(raw.reduce((s, r) => s + r.capacity_mcm, 0) / 1000),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" /> Reservoir Intelligence
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-powered monitoring and optimisation across {stats.total} reservoirs</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Reservoirs',  value: stats.total,           unit: '',    color: 'text-blue-400'    },
          { label: 'High Risk',         value: stats.highRisk,        unit: '',    color: 'text-orange-400'  },
          { label: 'Avg Fill Level',    value: `${stats.avgFill}`,    unit: '%',   color: 'text-cyan-400'    },
          { label: 'Total Capacity',    value: stats.totalCapacity,   unit: 'BCM', color: 'text-emerald-400' },
        ].map(s => (
          <GlassCard key={s.label} className="p-3">
            <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}<span className="text-sm ml-1 text-slate-400">{s.unit}</span></p>
          </GlassCard>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([['all', 'All Reservoirs'], ['high', 'High Risk'], ['low', 'Low Storage']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filter === id ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/3 border-white/5 text-slate-500 hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-slate-600 self-center">{reservoirs.length} showing</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reservoirs.map((r, i) => <ReservoirCard key={r.id} r={r} index={i} />)}
      </div>
    </div>
  )
}
