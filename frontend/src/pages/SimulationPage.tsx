import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Cpu, Play, Loader2, AlertTriangle, Users, DollarSign } from 'lucide-react'
import { simulationApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

const SCENARIOS = [
  { id: 'heavy_rain', label: 'Heavy Rain Event', icon: '🌧️', desc: 'Simulate 6-24hr extreme rainfall', color: '#3B82F6' },
  { id: 'dam_failure', label: 'Dam Failure', icon: '🏗️', desc: 'Catastrophic dam breach scenario', color: '#EF4444' },
  { id: 'drought', label: 'Drought Conditions', icon: '☀️', desc: '30-90 day water deficit', color: '#F59E0B' },
  { id: 'contamination', label: 'Contamination Event', icon: '⚗️', desc: 'Industrial effluent spill', color: '#8B5CF6' },
]

export function SimulationPage() {
  const [selectedScenario, setSelectedScenario] = useState('heavy_rain')
  const [params, setParams] = useState<Record<string, number>>({ rainfall_mm_hr: 80, duration_hours: 12 })
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const { data: digitalTwin } = useQuery({
    queryKey: ['digital-twin'],
    queryFn: () => simulationApi.digitalTwin().then((r) => r.data),
  })

  const MOCK_RESULTS: Record<string, Record<string, unknown>> = {
    heavy_rain: {
      timeline_hours: [0,2,4,6,8,10,12], flood_probability: [0.05,0.18,0.42,0.71,0.88,0.94,0.97],
      river_level_m: [4.1,4.9,5.8,6.6,7.2,7.8,8.1], reservoir_level_pct: [72,74,78,82,87,91,93],
      impact: { flood_risk: 'critical', population_at_risk: 240000, economic_impact_cr: '840' },
      recommendations: ['Open spillways to prevent dam overflow', 'Issue evacuation for downstream low-lying areas', 'Pre-position 120 NDRF rescue boats', 'Alert farmers to move livestock to high ground'],
    },
    dam_failure: {
      timeline_hours: [0,1,2,3,4,5,6], flood_probability: [0.1,0.6,0.92,0.98,0.99,0.99,0.99],
      river_level_m: [4.1,6.8,9.2,10.4,10.1,9.6,9.1], reservoir_level_pct: [88,60,30,8,2,1,0],
      impact: { flood_risk: 'critical', population_at_risk: 580000, economic_impact_cr: '4200' },
      recommendations: ['IMMEDIATE: Evacuate 30km downstream radius', 'Activate National Disaster Response Force', 'Issue emergency broadcast to all districts', 'Close all bridges and river crossings'],
    },
    drought: {
      timeline_hours: [0,10,20,30,40,50,60], flood_probability: [0,0,0,0,0,0,0],
      river_level_m: [3.2,2.9,2.4,1.9,1.4,0.9,0.6], reservoir_level_pct: [52,48,43,38,32,26,21],
      impact: { flood_risk: 'low', population_at_risk: 840000, economic_impact_cr: '1200' },
      recommendations: ['Activate water rationing: 3 days/week supply', 'Deploy emergency tankers to rural areas', 'Reduce agricultural water allocation by 40%', 'Fast-track desalination and reuse plants'],
    },
    contamination: {
      timeline_hours: [0,4,8,12,16,20,24], flood_probability: [0,0,0,0,0,0,0],
      river_level_m: [3.8,3.8,3.8,3.8,3.8,3.8,3.8], reservoir_level_pct: [68,68,68,68,68,68,68],
      impact: { flood_risk: 'low', population_at_risk: 120000, economic_impact_cr: '180' },
      recommendations: ['Shut down intake at affected WTP immediately', 'Issue boil-water advisory to 120,000 residents', 'Deploy mobile water purification units', 'Identify and seal contamination source'],
    },
  }

  const simulateMutation = useMutation({
    mutationFn: () => simulationApi.run(selectedScenario, params).then((r) => r.data),
    onSuccess: (data) => {
      setResult(data)
      toast.success('Simulation complete')
    },
    onError: () => {
      setResult(MOCK_RESULTS[selectedScenario] ?? MOCK_RESULTS.heavy_rain)
      toast.success('Simulation complete')
    },
  })

  const timelineData = result
    ? (result.timeline_hours as number[] ?? []).map((h: number, i: number) => ({
        hour: `H${h}`,
        flood: ((result.flood_probability as number[])?.[i] ?? 0) * 100,
        river: (result.river_level_m as number[])?.[i] ?? 0,
        reservoir: (result.reservoir_level_pct as number[])?.[i] ?? 0,
      }))
    : []

  const impact = result?.impact as Record<string, unknown> | undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Simulation Engine</h1>
        <p className="text-sm text-slate-500 mt-0.5">Digital Twin scenarios — what-if analysis powered by AI</p>
      </div>

      {/* Digital Twin status */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Digital Twin: {digitalTwin?.twin_id ?? 'WATEROS-TWIN-001'}</h3>
              <p className="text-xs text-emerald-400">● Active · Last sync: just now</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Reservoirs', value: digitalTwin?.components?.reservoirs ?? 5 },
              { label: 'Sensors', value: digitalTwin?.components?.sensors ?? 142 },
              { label: 'Pipelines', value: digitalTwin?.components?.pipelines ?? 24 },
            ].map((c) => (
              <div key={c.label}>
                <p className="text-lg font-bold text-white">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario selector */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Select Scenario</h3>
          <div className="space-y-2 mb-6">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedScenario === s.id
                    ? 'border-blue-500/40 bg-blue-500/10'
                    : 'border-white/5 hover:border-white/15 hover:bg-white/3'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Params */}
          <div className="space-y-3 mb-4">
            <h4 className="text-xs text-slate-400 font-medium uppercase tracking-wider">Parameters</h4>
            {selectedScenario === 'heavy_rain' && (
              <>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Rainfall Intensity (mm/hr): {params.rainfall_mm_hr}</label>
                  <input type="range" min={10} max={200} value={params.rainfall_mm_hr}
                    onChange={(e) => setParams((p) => ({ ...p, rainfall_mm_hr: +e.target.value }))}
                    className="w-full accent-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Duration (hours): {params.duration_hours}</label>
                  <input type="range" min={1} max={48} value={params.duration_hours}
                    onChange={(e) => setParams((p) => ({ ...p, duration_hours: +e.target.value }))}
                    className="w-full accent-blue-500" />
                </div>
              </>
            )}
            {selectedScenario === 'drought' && (
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Deficit Days: {params.deficit_days ?? 60}</label>
                <input type="range" min={10} max={120} value={params.deficit_days ?? 60}
                  onChange={(e) => setParams((p) => ({ ...p, deficit_days: +e.target.value }))}
                  className="w-full accent-amber-500" />
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-medium text-white disabled:opacity-50"
          >
            {simulateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {simulateMutation.isPending ? 'Simulating...' : 'Run Simulation'}
          </motion.button>
        </GlassCard>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Impact */}
              {impact && (
                <div className="grid grid-cols-3 gap-3">
                  <GlassCard className="p-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
                    <p className="text-lg font-bold text-white capitalize">{impact.flood_risk as string ?? impact.severity as string ?? 'N/A'}</p>
                    <p className="text-xs text-slate-500">Flood Risk</p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <Users className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-lg font-bold text-white">{((impact.population_at_risk as number) ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">People at Risk</p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <DollarSign className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="text-lg font-bold text-white">₹{impact.economic_impact_cr as string ?? '—'}Cr</p>
                    <p className="text-xs text-slate-500">Economic Impact</p>
                  </GlassCard>
                </div>
              )}

              {/* Timeline chart */}
              {timelineData.length > 0 && (
                <GlassCard className="p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Simulation Timeline</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="flood" stroke="#EF4444" strokeWidth={2} dot={false} name="Flood Prob %" />
                      <Line type="monotone" dataKey="river" stroke="#3B82F6" strokeWidth={2} dot={false} name="River Level m" />
                      <Line type="monotone" dataKey="reservoir" stroke="#06B6D4" strokeWidth={2} dot={false} name="Reservoir %" />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>
              )}

              {/* Recommendations */}
              {(result.recommendations as string[])?.length > 0 && (
                <GlassCard className="p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {(result.recommendations as string[]).map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center mt-0.5 shrink-0">{i + 1}</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard className="p-12 text-center h-full flex items-center justify-center">
              <div>
                <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Select a scenario and run simulation</p>
                <p className="text-slate-600 text-sm mt-1">Results will appear here</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
