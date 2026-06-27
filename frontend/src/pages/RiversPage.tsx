import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Waves, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

const RIVER_INSIGHTS: Record<string, { confidence: number; analysis: string; recommendations: string[]; agents: string[]; tools: string[]; metrics: { label: string; value: string; color: string }[] }> = {
  brahmaputra: { confidence: 96, analysis: 'CRITICAL FLOOD ALERT: Brahmaputra at 7.2m — 1.2m above flood threshold at Guwahati gauge. Crest of 7.8–8.1m expected within 6 hours. Monsoon low-pressure system adding 180mm/day in Arunachal Pradesh headwaters. Mandatory evacuation initiated for 240,000 residents across 4 Assam districts.', recommendations: ['IMMEDIATE: Evacuate all residents below 8m contour in Kamrup, Morigaon, Nagaon, Barpeta', 'Deploy 120 NDRF inflatable rescue boats to Guwahati riverside', 'Issue pre-positioned emergency food/water for 72h to 60 relief camps'], agents: ['Flood Agent', 'Rainfall Agent', 'Emergency Agent'], tools: ['predictFloodCrest()', 'calculateDischarge()', 'issueEvacuationOrder()'], metrics: [{ label: 'River Level', value: '7.2 m', color: 'text-red-400' }, { label: 'Flood Threshold', value: '6.0 m', color: 'text-orange-400' }, { label: 'Discharge', value: '19,800 m³/s', color: 'text-red-400' }, { label: 'Crest ETA', value: '6 hours', color: 'text-red-400' }] },
  yangtze: { confidence: 89, analysis: 'Yangtze discharge 22% above seasonal average (30,150 m³/s vs 24,600 expected). Three Gorges reservoir at 89% — controlled release protocol active, releasing 28,000 m³/s while receiving 32,000 m³/s inflow. Ecosystem under stress: habitat fragmentation documented in 3 middle-river sections.', recommendations: ['Maintain controlled release at 28,000 m³/s — alert Yichang and Wuhan downstream communities', 'Increase ecological flow corridor in Three Gorges bypasses to 15% of release', 'Activate early warning system for downstream provinces: Hubei, Anhui, Jiangsu'], agents: ['River Basin Agent', 'Reservoir Agent', 'Flood Agent'], tools: ['monitorThreeGorges()', 'calculateEcologicalFlow()', 'predictDownstreamImpact()'], metrics: [{ label: 'Discharge', value: '30,150 m³/s', color: 'text-orange-400' }, { label: 'Three Gorges', value: '89%', color: 'text-orange-400' }, { label: 'Above Average', value: '+22%', color: 'text-orange-400' }, { label: 'Eco Health', value: '64.7', color: 'text-amber-400' }] },
  'murray-darling': { confidence: 94, analysis: 'CRITICAL LOW FLOW: Murray-Darling at record low 767 m³/s — only 18% of historical mean. Third consecutive below-average rainfall year. Lake Hume at 18.4% capacity; at current deficit rate Brisbane water security at risk in 142 days. 31 fish species face acute habitat loss.', recommendations: ['Activate Stage 4 water restrictions across Murray-Darling Basin (household + agriculture)', 'Suspend irrigation allocations in NSW and Victorian sections immediately', 'Emergency environmental flows: release 150 GL from Hume Dam for fish passage corridors'], agents: ['Climate Agent', 'River Basin Agent', 'Emergency Agent'], tools: ['forecastDroughtImpact()', 'modelEcologicalFlow()', 'assessWaterSecurity()'], metrics: [{ label: 'Discharge', value: '767 m³/s', color: 'text-red-400' }, { label: 'vs Average', value: '-82%', color: 'text-red-400' }, { label: 'Lake Hume', value: '18.4%', color: 'text-red-400' }, { label: 'Eco Health', value: '44.1', color: 'text-red-400' }] },
  nile: { confidence: 85, analysis: "Nile discharge reduced to 2,830 m³/s — impacts intensifying as GERD continues filling operations. Egypt's water share 9% below 1959 Nile Waters Agreement baseline. Blue Nile contribution at 11-year low. Aswan High Dam compensating at cost of sediment starvation downstream.", recommendations: ['Engage tripartite negotiations (Egypt-Sudan-Ethiopia) on GERD release schedule', 'Fast-track Egyptian desalination capacity to offset Nile shortfall by 2028', 'Implement precision irrigation across Nile Delta to cut agricultural water use 20%'], agents: ['River Basin Agent', 'Climate Agent', 'Country Agent'], tools: ['monitorGERDImpact()', 'calculateNileShare()', 'forecastNileFlow()'], metrics: [{ label: 'Discharge', value: '2,830 m³/s', color: 'text-amber-400' }, { label: 'vs Baseline', value: '-9%', color: 'text-amber-400' }, { label: 'GERD Fill', value: '74%', color: 'text-orange-400' }, { label: 'Eco Health', value: '58.1', color: 'text-amber-400' }] },
  ganges: { confidence: 88, analysis: 'Ganges at normal flow (11,000 m³/s) but critically polluted — WQI 38 at Varanasi, lowest in 8 years. Coliform count 3,400× WHO safe limit near Kanpur industrial discharge points. Himalayan glacier recession reducing dry-season base flow by 2.3%/yr. 400M people depend on Ganga basin.', recommendations: ['Accelerate Namami Gange Phase 3 sewage treatment plants in 12 priority cities', 'Shut down 84 non-compliant industrial effluent discharge points immediately', 'Establish Gangotri glacier monitoring network for long-term flow forecasting'], agents: ['Water Quality Agent', 'River Basin Agent', 'Climate Agent'], tools: ['monitorPollution()', 'trackGlacierRetreat()', 'assessEcosystemHealth()'], metrics: [{ label: 'WQI Varanasi', value: '38', color: 'text-red-400' }, { label: 'Coliform', value: '3,400× limit', color: 'text-red-400' }, { label: 'Glacier Loss', value: '2.3%/yr', color: 'text-orange-400' }, { label: 'Eco Health', value: '48.7', color: 'text-red-400' }] },
  amazon: { confidence: 82, analysis: 'Amazon maintaining healthy flow at 209,000 m³/s — the world\'s largest discharge. Ecosystem health at 82.4 despite 2024 deforestation increase. Western headwaters (Peru/Ecuador) showing 12% reduced rainfall correlated with Andean warming. Mangrove expansion along delta continues positively.', recommendations: ['Increase INPE deforestation alert response time from 30 to 7 days', 'Establish 3 new biological corridors connecting fragmented Andean headwater forests', 'Joint Peru-Colombia-Brazil enforcement of protected buffer zones'], agents: ['River Basin Agent', 'Climate Agent', 'Sensor Intelligence'], tools: ['monitorDeforestation()', 'trackMangroveExpansion()', 'assessHeadwaterHealth()'], metrics: [{ label: 'Discharge', value: '209,000 m³/s', color: 'text-emerald-400' }, { label: 'Eco Health', value: '82.4', color: 'text-emerald-400' }, { label: 'Deforestation', value: '+8%', color: 'text-orange-400' }, { label: 'Mangrove', value: '+4.2%', color: 'text-emerald-400' }] },
  mekong: { confidence: 87, analysis: 'Mekong at Low status (16,000 m³/s) — upstream dam operations in China reducing seasonal pulse by 34%. Critically impacts Tonle Sap Lake reverse-flow mechanism, threatening Southeast Asia\'s most productive freshwater fishery (2.5M tonnes/yr). Sediment trapping by 11 upstream dams at 74% efficiency.', recommendations: ['Demand China Mekong River Commission data transparency on dam operations', 'Establish international Mekong Environmental Flow Agreement for dry season minimums', 'Emergency support for Cambodian and Vietnamese Mekong Delta fishing communities'], agents: ['River Basin Agent', 'Climate Agent', 'Country Agent'], tools: ['monitorTonleSap()', 'trackSedimentLoad()', 'modelDamImpact()'], metrics: [{ label: 'Discharge', value: '16,000 m³/s', color: 'text-amber-400' }, { label: 'vs Natural', value: '-34%', color: 'text-red-400' }, { label: 'Sediment Trap', value: '74%', color: 'text-orange-400' }, { label: 'Eco Health', value: '65.4', color: 'text-amber-400' }] },
  mississippi: { confidence: 79, analysis: 'Mississippi at normal flow with medium flood risk. Nutrient loading from agricultural runoff creating hypoxic Dead Zone in Gulf of Mexico (23,000 km² this year). Upper river batture restoration showing positive results — sediment retention up 18%. 3 lock-and-dam structures flagged for urgent maintenance.', recommendations: ['Expand riparian buffer strips in Iowa and Illinois to reduce nitrogen runoff by 40%', 'Conduct emergency structural assessment of Lock & Dam 10, 14, and 21', 'Increase Mississippi River Tributaries Project funding for levee improvements'], agents: ['River Basin Agent', 'Water Quality Agent', 'Infrastructure Agent'], tools: ['monitorNutrientLoad()', 'assessLockStructure()', 'predictHypoxia()'], metrics: [{ label: 'Discharge', value: '16,800 m³/s', color: 'text-emerald-400' }, { label: 'Dead Zone', value: '23,000 km²', color: 'text-red-400' }, { label: 'N Runoff', value: '1.8M tonnes', color: 'text-orange-400' }, { label: 'Eco Health', value: '74.2', color: 'text-blue-400' }] },
  congo: { confidence: 91, analysis: 'Congo River maintaining excellent ecosystem health (88.9) — second largest discharge globally at 41,000 m³/s. Congo Basin holds 18% of world\'s freshwater reserves. Inga Falls potential: 40 GW hydroelectric capacity largely untapped. Minimal agricultural pressure due to basin geography.', recommendations: ['Protect Congo Basin peatlands — store 30 billion tonnes CO₂', 'Regulate artisanal mining operations affecting Kasai River tributary quality', 'Advance Grand Inga Hydroelectric Project with strict environmental safeguards'], agents: ['River Basin Agent', 'Climate Agent', 'Sensor Intelligence'], tools: ['monitorPeatlands()', 'assessMiningImpact()', 'trackDischarge()'], metrics: [{ label: 'Discharge', value: '41,000 m³/s', color: 'text-emerald-400' }, { label: 'Eco Health', value: '88.9', color: 'text-emerald-400' }, { label: 'Peatland CO₂', value: '30B tonnes', color: 'text-blue-400' }, { label: 'Hydro Pot.', value: '40 GW', color: 'text-emerald-400' }] },
  danube: { confidence: 84, analysis: 'Danube at normal flow with excellent EU Water Framework Directive compliance (93%). International river commission coordination between 19 countries functioning well. Microplastic levels rising — 4,800 particles/m³ detected at Vienna. Iron Gate reservoir sedimentation at 3.1%/yr needs monitoring.', recommendations: ['Accelerate EU-funded wastewater upgrades for 8 non-compliant Balkan riparian cities', 'Establish microplastic filtration mandate for all Danube municipal water intakes by 2027', 'Commission Iron Gate I/II reservoir sediment management plan'], agents: ['River Basin Agent', 'Water Quality Agent', 'Country Agent'], tools: ['monitorWFDCompliance()', 'trackMicroplastics()', 'assessSedimentLoad()'], metrics: [{ label: 'Discharge', value: '6,500 m³/s', color: 'text-emerald-400' }, { label: 'WFD Score', value: '93%', color: 'text-emerald-400' }, { label: 'Microplastics', value: '4,800/m³', color: 'text-amber-400' }, { label: 'Eco Health', value: '78.6', color: 'text-blue-400' }] },
}

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
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['rivers'],
    queryFn: async () => {
      try {
        const r = await riversApi.list()
        const raw = r.data?.rivers ?? r.data
        if (!Array.isArray(raw) || !raw[0]) return mockRivers
        return raw.map((rv: Record<string, unknown>): typeof mockRivers[0] => ({
          id: String(rv.id ?? ''), name: String(rv.name ?? ''),
          countries: [String(rv.country_id ?? 'Unknown').toUpperCase()],
          length_km: (rv.length_km as number) ?? 0,
          discharge_m3s: (rv.discharge_m3s as number) ?? Math.round(((rv.speed_mps as number) ?? 1) * ((rv.basin_area_km2 as number) ?? 1000000) * 0.001),
          basin_area_km2: (rv.basin_area_km2 as number) ?? 0,
          flow_status: rv.status === 'flood' ? 'Flood' : rv.status === 'drought' ? 'Critical' : rv.status === 'warning' ? 'High' : 'Normal',
          flood_risk: ((rv.flood_probability_pct as number) ?? 0) > 60 ? 'Critical' : ((rv.flood_probability_pct as number) ?? 0) > 40 ? 'High' : ((rv.flood_probability_pct as number) ?? 0) > 20 ? 'Medium' : 'Low',
          ecosystem_health: (rv.ecosystem_health as number) ?? Math.round(55 + Math.random() * 35),
        }))
      }
      catch { return mockRivers }
    },
  })
  const rivers = data ?? mockRivers
  const selectedRiver = rivers.find((r: typeof mockRivers[0]) => r.id === selectedId) ?? null
  const insight = selectedId ? (RIVER_INSIGHTS[selectedId] ?? null) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Waves className="w-5 h-5 text-blue-400" /> River Basins</h1>
        <p className="text-sm text-slate-500 mt-0.5">Major river systems · Flow monitoring · Click a row for AI analysis</p>
      </div>

      <AnimatePresence mode="wait">
        {selectedRiver && insight ? (
          <motion.div key={selectedId} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">AI Insights — {selectedRiver.name} River</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-400">{insight.confidence}%</span>
                    <p className="text-[10px] text-slate-500">confidence</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium border border-white/10 bg-white/5 ${riskColors[selectedRiver.flood_risk]}`}>{selectedRiver.flood_risk} Risk</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1.5">River Basin Agent Analysis</p>
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
                          {selectedRiver.flood_risk === 'Critical' || selectedRiver.flood_risk === 'High'
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
              <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">91%</span></div>
              <p className="text-xs text-slate-400 mb-2">River Basin Agents detect critical low-flow in Murray-Darling and elevated flood risk in Brahmaputra. Cross-border coordination alerts issued for 3 transboundary systems. <span className="text-blue-400">Click any river row below for detailed AI analysis.</span></p>
              <div className="flex flex-wrap gap-1.5">
                {['Rainfall Agent', 'Flood Agent', 'River Basin Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
                {['predictFlood()', 'calculateDischarge()', 'monitorEcosystem()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

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
              const isSelected = selectedId === r.id
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/10' : 'hover:bg-white/3'}`}
                  onClick={() => setSelectedId(prev => prev === r.id ? null : r.id)}
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {r.name}
                      {isSelected && <span className="text-[9px] text-blue-400 font-normal">● selected</span>}
                    </p>
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
    </div>
  )
}
