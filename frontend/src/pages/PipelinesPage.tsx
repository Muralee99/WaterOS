import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCommit, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

const PIPELINE_INSIGHTS: Record<string, { confidence: number; analysis: string; recommendations: string[]; agents: string[]; tools: string[]; metrics: { label: string; value: string; color: string }[] }> = {
  p001: { confidence: 92, analysis: 'Mumbai Central Trunk in POOR condition after 38 years of service. 78% leak probability — Infrastructure Agent has detected 3 major fracture points in Dharavi sector using acoustic sensors and pressure differential analysis. Pressure drop of 1.8 bar across 12km section indicates significant undetected losses. Estimated 680 MLD daily water loss from this pipe alone.', recommendations: ['URGENT: Isolation valve closure at Dharavi fracture zones (sectors 7, 12, 19)', 'Replace 84km high-risk sections with ductile iron — estimated ₹420 crore', 'Install permanent acoustic monitoring nodes every 2km along trunk main'], agents: ['Infrastructure Agent', 'Leak Detection Agent', 'Maintenance Agent'], tools: ['detectLeaks()', 'assessPipeCondition()', 'predictFailure()'], metrics: [{ label: 'Leak Probability', value: '78%', color: 'text-red-400' }, { label: 'Pressure', value: '4.2 bar', color: 'text-amber-400' }, { label: 'Flow Rate', value: '89%', color: 'text-amber-400' }, { label: 'Age', value: '38 years', color: 'text-red-400' }] },
  p005: { confidence: 97, analysis: 'CRITICAL — Nile Delta Network at imminent failure risk. 55-year-old asbestos cement pipes exceeding service life by 25 years. 91% leak probability with 3 confirmed major burst events in past 60 days. Pressure at only 2.8 bar indicates multiple major losses. 250,000 households at risk of total supply disruption.', recommendations: ['EMERGENCY: Deploy mobile water bowsers to 12 districts with <2 bar supply', 'Fast-track emergency pipe replacement for 180km priority sections — ₹890M budget', 'Asbestos disposal safety protocol required for all replacement works'], agents: ['Infrastructure Agent', 'Emergency Agent', 'Leak Detection Agent'], tools: ['assessCriticalFailure()', 'modelReplacement()', 'detectLeaks()'], metrics: [{ label: 'Leak Probability', value: '91%', color: 'text-red-400' }, { label: 'Pressure', value: '2.8 bar', color: 'text-red-400' }, { label: 'Flow Rate', value: '67%', color: 'text-red-400' }, { label: 'Age', value: '55 years', color: 'text-red-400' }] },
  p007: { confidence: 95, analysis: 'CRITICAL — Dhaka Old City Main has the highest failure risk in the network. 62-year-old cast iron pipes with 94% leak probability. Pressure at dangerous 1.9 bar — minimum safe supply is 3.0 bar. Multiple live failure zones generating waterborne contamination risk. 380,000 residents receiving compromised supply.', recommendations: ['IMMEDIATE: Issue boil-water advisory for Old Dhaka districts', 'Emergency contractor mobilization for 94km critical section replacement', 'Install 400 pressure monitoring nodes for real-time failure detection'], agents: ['Emergency Agent', 'Infrastructure Agent', 'Water Quality Agent'], tools: ['assessCriticalRisk()', 'monitorContamination()', 'prioritizeMaintenance()'], metrics: [{ label: 'Leak Probability', value: '94%', color: 'text-red-400' }, { label: 'Pressure', value: '1.9 bar', color: 'text-red-400' }, { label: 'Flow Rate', value: '54%', color: 'text-red-400' }, { label: 'Age', value: '62 years', color: 'text-red-400' }] },
  p002: { confidence: 84, analysis: 'Delhi Ring Main in FAIR condition at 22 years. 42% leak probability with 631 identified leak zones contributing to 920 MLD daily water loss. Ductile iron degradation accelerating due to high chlorine dosing for Yamuna source treatment. Acoustic survey completed — 38 zones require immediate attention within 90 days.', recommendations: ['Prioritize repair of 38 high-risk leak zones in South and East Delhi sectors', 'Reduce chlorine dosing — corrosion inhibitor programme reduces iron pipe degradation', 'Schedule 2026 Q3 CCTV inspection campaign for remaining network sections'], agents: ['Infrastructure Agent', 'Leak Detection Agent', 'Maintenance Agent'], tools: ['detectLeaks()', 'modelCorrosion()', 'scheduleMaintenance()'], metrics: [{ label: 'Leak Probability', value: '42%', color: 'text-amber-400' }, { label: 'Pressure', value: '5.1 bar', color: 'text-blue-400' }, { label: 'Flow Rate', value: '94%', color: 'text-emerald-400' }, { label: 'Priority Zones', value: '38', color: 'text-amber-400' }] },
  p003: { confidence: 78, analysis: 'LA Aqueduct South in GOOD condition with only 12% leak probability. 15-year-old steel pipeline meeting all performance benchmarks. Infrastructure Agent monitoring confirms nominal pressure at 6.8 bar throughout the 891km route. Cathodic protection system functioning at 98% efficiency. Minor corrosion flagged at 3 river crossing locations.', recommendations: ['Schedule routine inspection of 3 river crossing sections flagged for micro-corrosion', 'Verify cathodic protection anode replacement schedule — last replaced 2021', 'Continue excellent maintenance practices — current performance is benchmark standard'], agents: ['Infrastructure Agent', 'Sensor Intelligence', 'Maintenance Agent'], tools: ['monitorCathodicProtection()', 'assessCrossings()', 'predictMaintenance()'], metrics: [{ label: 'Leak Probability', value: '12%', color: 'text-emerald-400' }, { label: 'Pressure', value: '6.8 bar', color: 'text-emerald-400' }, { label: 'Flow Rate', value: '98%', color: 'text-emerald-400' }, { label: 'Protection', value: '98%', color: 'text-emerald-400' }] },
  p004: { confidence: 96, analysis: 'Three Gorges Distribution is the highest-performing pipeline in the network. HDPE construction at only 8 years with 0.04 (4%) leak probability. Pressure at 7.2 bar — optimal for 1,204km route. Modern smart sensor array provides 100% coverage with 2-minute fault detection latency. Setting global infrastructure standard.', recommendations: ['Apply smart-sensor retrofit programme learnings to upgrade older Indian and Egyptian networks', 'Commission independent technical audit to document best practices for WHO guidelines', 'Plan proactive liner inspection at 10-year mark (2028) per HDPE standards'], agents: ['Sensor Intelligence', 'Infrastructure Agent', 'Maintenance Agent'], tools: ['monitorSmartSensors()', 'assessHDPECondition()', 'predictMaintenance()'], metrics: [{ label: 'Leak Probability', value: '4%', color: 'text-emerald-400' }, { label: 'Pressure', value: '7.2 bar', color: 'text-emerald-400' }, { label: 'Flow Rate', value: '99%', color: 'text-emerald-400' }, { label: 'Sensor Cover', value: '100%', color: 'text-emerald-400' }] },
  p006: { confidence: 82, analysis: 'Paris Water Ring in GOOD condition. 12-year-old PVC construction with 8% leak probability — well below the 15% EU benchmark. Smart meter network provides real-time pressure telemetry across 449km route. 99.8% WHO parameter compliance maintained. Two minor joint failures repaired in April maintenance cycle.', recommendations: ['Continue quarterly joint inspection programme — maintaining current excellence', 'Evaluate lining application for oldest 28km section (pre-2014 construction)', 'Share Paris ring main design blueprints via EU Water Infrastructure Exchange'], agents: ['Infrastructure Agent', 'Sensor Intelligence', 'Water Quality Agent'], tools: ['monitorSmartMeters()', 'assessJointIntegrity()', 'trackCompliance()'], metrics: [{ label: 'Leak Probability', value: '8%', color: 'text-emerald-400' }, { label: 'Pressure', value: '6.4 bar', color: 'text-emerald-400' }, { label: 'Flow Rate', value: '97%', color: 'text-emerald-400' }, { label: 'WHO Comply', value: '99.8%', color: 'text-emerald-400' }] },
  p008: { confidence: 80, analysis: 'São Paulo Metropolitan pipeline in FAIR condition at 18 years. 35% leak probability linked to settlement cracks in expansive clay soil zones. 340km flagged for replacement over 5-year capital programme. Dry season pressure management critical — demand spikes cause low-pressure events in peripheral zones.', recommendations: ['Prioritize clay-zone pipe replacement in Guarulhos and São Mateus sectors', 'Install pressure reduction valves at 12 network junctions to reduce stress cracking', 'Accelerate Cantareira secondary feed to reduce pressure variance in northern zones'], agents: ['Infrastructure Agent', 'Leak Detection Agent', 'Maintenance Agent'], tools: ['detectLeaks()', 'modelSoilSettlement()', 'managePressureZones()'], metrics: [{ label: 'Leak Probability', value: '35%', color: 'text-amber-400' }, { label: 'Pressure', value: '5.3 bar', color: 'text-blue-400' }, { label: 'Flow Rate', value: '91%', color: 'text-blue-400' }, { label: 'Flagged km', value: '340 km', color: 'text-amber-400' }] },
}

const conditionColors: Record<string, string> = {
  Excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Good: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Fair: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Poor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const leakColor = (prob: number) => prob > 0.7 ? '#EF4444' : prob > 0.4 ? '#F59E0B' : '#10B981'

export function PipelinesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
  const selectedPipeline = pipelines.find((p: typeof mockPipelines[0]) => p.id === selectedId) ?? null
  const insight = selectedId ? (PIPELINE_INSIGHTS[selectedId] ?? null) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><GitCommit className="w-5 h-5 text-blue-400" /> Pipelines</h1>
          <p className="text-sm text-slate-500 mt-0.5">Water distribution infrastructure · Leak detection · Click a row for AI analysis</p>
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

      <AnimatePresence mode="wait">
        {selectedPipeline && insight ? (
          <motion.div key={selectedId} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">AI Insights — {selectedPipeline.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-400">{insight.confidence}%</span>
                    <p className="text-[10px] text-slate-500">confidence</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${conditionColors[selectedPipeline.condition]}`}>{selectedPipeline.condition}</span>
                  <button onClick={() => setSelectedId(null)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 transition-colors">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1.5">Infrastructure Agent Analysis</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{insight.analysis}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {insight.metrics.map(m => (
                      <div key={m.label} className="bg-white/3 rounded-lg p-2 border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${m.color}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Recommended Actions</p>
                    <div className="space-y-1.5">
                      {insight.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {selectedPipeline.condition === 'Critical' || selectedPipeline.condition === 'Poor'
                            ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                            : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />}
                          <p className="text-xs text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Active Agents</p>
                    <div className="space-y-1.5">
                      {insight.agents.map(a => (
                        <div key={a} className="flex items-center gap-2 p-2 bg-white/3 rounded-lg border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-xs text-white font-medium">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.tools.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="generic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-4" glow="blue">
              <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">93%</span></div>
              <p className="text-xs text-slate-400 mb-2">Infrastructure Agents identified 2 pipelines with imminent failure risk. Predictive maintenance models forecast 94% leak reduction if recommended replacements are executed within 90 days. <span className="text-blue-400">Click any pipeline row below for detailed AI analysis.</span></p>
              <div className="flex flex-wrap gap-1.5">
                {['Infrastructure Agent', 'Leak Detection Agent', 'Maintenance Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
                {['detectLeaks()', 'predictMaintenance()', 'assessPipeCondition()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

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
            {pipelines.map((p: typeof mockPipelines[0], i: number) => {
              const isSelected = selectedId === p.id
              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10' : 'hover:bg-white/3'}`}
                  onClick={() => setSelectedId(prev => prev === p.id ? null : p.id)}
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-white flex items-center gap-1.5">
                      {p.name}
                      {isSelected && <span className="text-[9px] text-blue-400 font-normal">● selected</span>}
                    </p>
                  </td>
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
              )
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
