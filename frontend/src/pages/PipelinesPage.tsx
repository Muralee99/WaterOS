import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { GitCommit, Brain, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { pipelinesApi } from '@/services/api'
import { Activity, Droplets } from 'lucide-react'

const mockPipelines = [
  { id: 'p001', name: 'Mumbai Central Trunk', region: 'India', length_km: 342, material: 'Cast Iron', age_years: 38, condition: 'Poor', pressure_bar: 4.2, flow_rate: 89, leak_probability: 0.78, last_inspection: '2025-11-12' },
  { id: 'p002', name: 'Delhi Ring Main', region: 'India', length_km: 518, material: 'Ductile Iron', age_years: 22, condition: 'Fair', pressure_bar: 5.1, flow_rate: 94, leak_probability: 0.42, last_inspection: '2026-01-08' },
  { id: 'p003', name: 'LA Aqueduct South', region: 'USA', length_km: 891, material: 'Steel', age_years: 15, condition: 'Good', pressure_bar: 6.8, flow_rate: 98, leak_probability: 0.12, last_inspection: '2026-03-22' },
  { id: 'p004', name: 'Three Gorges Distribution', region: 'China', length_km: 1204, material: 'HDPE', age_years: 8, condition: 'Excellent', pressure_bar: 7.2, flow_rate: 99, leak_probability: 0.04, last_inspection: '2026-05-14' },
  { id: 'p005', name: 'Nile Delta Network', region: 'Egypt', length_km: 723, material: 'Asbestos Cement', age_years: 55, condition: 'Critical', pressure_bar: 2.8, flow_rate: 67, leak_probability: 0.91, last_inspection: '2024-09-30' },
  { id: 'p006', name: 'Paris Water Ring', region: 'France', length_km: 449, material: 'PVC', age_years: 12, condition: 'Good', pressure_bar: 6.4, flow_rate: 97, leak_probability: 0.08, last_inspection: '2026-04-17' },
  { id: 'p007', name: 'Dhaka Old City Main', region: 'Bangladesh', length_km: 187, material: 'Cast Iron', age_years: 62, condition: 'Critical', pressure_bar: 1.9, flow_rate: 54, leak_probability: 0.94, last_inspection: '2024-06-15' },
  { id: 'p008', name: 'São Paulo Metropolitan', region: 'Brazil', length_km: 634, material: 'Ductile Iron', age_years: 18, condition: 'Fair', pressure_bar: 5.3, flow_rate: 91, leak_probability: 0.35, last_inspection: '2026-02-28' },
]

const conditionColors: Record<string, string> = {
  Excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Good: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Fair: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Poor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const leakColor = (prob: number) => prob > 0.7 ? '#EF4444' : prob > 0.4 ? '#F59E0B' : '#10B981'

export function PipelinesPage() {
  const { data } = useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      try { const r = await pipelinesApi.list(); return r.data?.pipelines ?? r.data }
      catch { return mockPipelines }
    },
  })
  const pipelines = data ?? mockPipelines
  const criticalCount = pipelines.filter((p: typeof mockPipelines[0]) => p.condition === 'Critical').length
  const avgLeakProb = pipelines.reduce((a: number, p: typeof mockPipelines[0]) => a + p.leak_probability, 0) / pipelines.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><GitCommit className="w-5 h-5 text-blue-400" /> Pipelines</h1>
          <p className="text-sm text-slate-500 mt-0.5">Water distribution infrastructure · Leak detection · Condition monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400">{criticalCount} Critical</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Pipeline Length" value={`${(pipelines.reduce((a: number, p: typeof mockPipelines[0]) => a + p.length_km, 0) / 1000).toFixed(0)}K km`} icon={GitCommit} status="info" />
        <MetricCard title="Critical Sections" value={criticalCount} icon={AlertTriangle} status="critical" />
        <MetricCard title="Avg Leak Probability" value={`${(avgLeakProb * 100).toFixed(0)}%`} icon={Droplets} status="warning" />
        <MetricCard title="Avg Flow Rate" value={`${(pipelines.reduce((a: number, p: typeof mockPipelines[0]) => a + p.flow_rate, 0) / pipelines.length).toFixed(0)}%`} icon={Activity} status="good" />
      </div>

      <GlassCard className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Pipeline', 'Region', 'Length', 'Material', 'Age', 'Condition', 'Flow', 'Leak Risk', 'Last Inspection'].map(h => (
                <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pipelines.map((p: typeof mockPipelines[0], i: number) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="px-4 py-3"><p className="text-xs font-medium text-white">{p.name}</p></td>
                <td className="px-4 py-3"><span className="text-xs text-slate-400">{p.region}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-white">{p.length_km} km</span></td>
                <td className="px-4 py-3"><span className="text-xs text-slate-400">{p.material}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-white">{p.age_years}yr</span></td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${conditionColors[p.condition]}`}>{p.condition}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.flow_rate}%` }} />
                    </div>
                    <span className="text-xs text-white">{p.flow_rate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.leak_probability * 100}%`, backgroundColor: leakColor(p.leak_probability) }} />
                    </div>
                    <span className="text-xs" style={{ color: leakColor(p.leak_probability) }}>{(p.leak_probability * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-[10px] text-slate-500">{p.last_inspection}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">93%</span></div>
        <p className="text-xs text-slate-400 mb-2">Infrastructure Agents identified 2 pipelines with imminent failure risk. Predictive maintenance models forecast 94% leak reduction if recommended replacements are executed within 90 days.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Infrastructure Agent', 'Leak Detection Agent', 'Maintenance Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['detectLeaks()', 'predictMaintenance()', 'assessPipeCondition()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
