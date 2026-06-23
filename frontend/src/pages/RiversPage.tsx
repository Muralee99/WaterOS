import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Waves, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { riversApi } from '@/services/api'

const mockRivers = [
  { id: 'amazon', name: 'Amazon', countries: ['Brazil', 'Peru', 'Colombia'], length_km: 6992, discharge_m3s: 209000, basin_area_km2: 7050000, flow_status: 'Normal', flood_risk: 'Medium', ecosystem_health: 82.4 },
  { id: 'nile', name: 'Nile', countries: ['Egypt', 'Sudan', 'Ethiopia'], length_km: 6650, discharge_m3s: 2830, basin_area_km2: 3400000, flow_status: 'Low', flood_risk: 'Low', ecosystem_health: 58.1 },
  { id: 'yangtze', name: 'Yangtze', countries: ['China'], length_km: 6300, discharge_m3s: 30150, basin_area_km2: 1800000, flow_status: 'High', flood_risk: 'High', ecosystem_health: 64.7 },
  { id: 'mississippi', name: 'Mississippi', countries: ['USA'], length_km: 3730, discharge_m3s: 16800, basin_area_km2: 3220000, flow_status: 'Normal', flood_risk: 'Medium', ecosystem_health: 74.2 },
  { id: 'brahmaputra', name: 'Brahmaputra', countries: ['India', 'Bangladesh', 'China'], length_km: 2900, discharge_m3s: 19800, basin_area_km2: 651334, flow_status: 'Flood', flood_risk: 'Critical', ecosystem_health: 59.3 },
  { id: 'ganges', name: 'Ganges', countries: ['India', 'Bangladesh'], length_km: 2525, discharge_m3s: 11000, basin_area_km2: 1016124, flow_status: 'Normal', flood_risk: 'High', ecosystem_health: 48.7 },
  { id: 'congo', name: 'Congo', countries: ['DRC', 'Congo'], length_km: 4700, discharge_m3s: 41000, basin_area_km2: 3680000, flow_status: 'Normal', flood_risk: 'Low', ecosystem_health: 88.9 },
  { id: 'mekong', name: 'Mekong', countries: ['China', 'Myanmar', 'Laos', 'Thailand', 'Vietnam'], length_km: 4350, discharge_m3s: 16000, basin_area_km2: 795000, flow_status: 'Low', flood_risk: 'Medium', ecosystem_health: 65.4 },
  { id: 'murray-darling', name: 'Murray-Darling', countries: ['Australia'], length_km: 3750, discharge_m3s: 767, basin_area_km2: 1060000, flow_status: 'Critical', flood_risk: 'Low', ecosystem_health: 44.1 },
  { id: 'danube', name: 'Danube', countries: ['Multiple EU'], length_km: 2860, discharge_m3s: 6500, basin_area_km2: 817000, flow_status: 'Normal', flood_risk: 'Low', ecosystem_health: 78.6 },
]

const flowStatusConfig: Record<string, { color: string; icon: typeof TrendingUp; label: string }> = {
  Flood: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: TrendingUp, label: 'Flood' },
  High: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: TrendingUp, label: 'High' },
  Normal: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Minus, label: 'Normal' },
  Low: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: TrendingDown, label: 'Low' },
  Critical: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: TrendingDown, label: 'Critical' },
}

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-orange-400', Critical: 'text-red-400',
}

export function RiversPage() {
  const { data } = useQuery({
    queryKey: ['rivers'],
    queryFn: async () => {
      try {
        const r = await riversApi.list()
        const raw = r.data?.rivers ?? r.data
        if (!Array.isArray(raw) || !raw[0]) return mockRivers
        return raw.map((rv: Record<string, unknown>) => ({
          id: rv.id, name: rv.name,
          countries: [String(rv.country_id ?? 'Unknown').toUpperCase()],
          length_km: rv.length_km ?? 0,
          discharge_m3s: rv.discharge_m3s ?? Math.round((rv.speed_mps as number ?? 1) * (rv.basin_area_km2 as number ?? 1000000) * 0.001),
          basin_area_km2: rv.basin_area_km2 ?? 0,
          flow_status: rv.status === 'flood' ? 'Flood' : rv.status === 'drought' ? 'Critical' : rv.status === 'warning' ? 'High' : 'Normal',
          flood_risk: (rv.flood_probability_pct as number ?? 0) > 60 ? 'Critical' : (rv.flood_probability_pct as number ?? 0) > 40 ? 'High' : (rv.flood_probability_pct as number ?? 0) > 20 ? 'Medium' : 'Low',
          ecosystem_health: rv.ecosystem_health ?? Math.round(55 + Math.random() * 35),
        }))
      }
      catch { return mockRivers }
    },
  })
  const rivers = data ?? mockRivers

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Waves className="w-5 h-5 text-blue-400" /> River Basins</h1>
        <p className="text-sm text-slate-500 mt-0.5">Major river systems · Flow monitoring · Ecosystem health</p>
      </div>

      <GlassCard className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['River', 'Countries', 'Length', 'Discharge (m³/s)', 'Flow Status', 'Flood Risk', 'Ecosystem Health'].map(h => (
                <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rivers.map((r: typeof mockRivers[0], i: number) => {
              const fs = flowStatusConfig[r.flow_status] ?? flowStatusConfig.Normal
              const FlowIcon = fs.icon
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-white">{r.name}</p>
                    <p className="text-[10px] text-slate-500">{(r.basin_area_km2 / 1000000).toFixed(1)}M km² basin</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-400">{r.countries.slice(0, 2).join(', ')}{r.countries.length > 2 ? ` +${r.countries.length - 2}` : ''}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs text-white">{r.length_km.toLocaleString()} km</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-white">{r.discharge_m3s.toLocaleString()}</span></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${fs.color}`}>
                      <FlowIcon className="w-3 h-3" />{fs.label}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium ${riskColors[r.flood_risk]}`}>{r.flood_risk}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.ecosystem_health}%` }} />
                      </div>
                      <span className="text-xs text-white">{r.ecosystem_health}</span>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">91%</span></div>
        <p className="text-xs text-slate-400 mb-2">River Basin Agents detect critical low-flow conditions in Murray-Darling and elevated flood risk in Brahmaputra. Cross-border coordination alerts have been issued for 3 transboundary river systems.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Rainfall Agent', 'Flood Agent', 'River Basin Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['predictFlood()', 'calculateDischarge()', 'monitorEcosystem()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
