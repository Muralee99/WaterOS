import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Brain, Droplets, Users, CheckCircle2, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { citiesApi } from '@/services/api'

const mockCities = [
  { id: 'mumbai', name: 'Mumbai', country: 'India', population: 21.6, water_score: 62.4, supply_deficit: 18, treatment_capacity: 71, status: 'Warning' },
  { id: 'delhi', name: 'Delhi', country: 'India', population: 32.9, water_score: 58.1, supply_deficit: 24, treatment_capacity: 64, status: 'Warning' },
  { id: 'los-angeles', name: 'Los Angeles', country: 'USA', population: 4.0, water_score: 74.3, supply_deficit: 8, treatment_capacity: 88, status: 'Good' },
  { id: 'beijing', name: 'Beijing', country: 'China', population: 21.5, water_score: 69.7, supply_deficit: 14, treatment_capacity: 79, status: 'Good' },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', population: 23.2, water_score: 44.8, supply_deficit: 38, treatment_capacity: 48, status: 'Critical' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', population: 21.3, water_score: 51.6, supply_deficit: 31, treatment_capacity: 55, status: 'Critical' },
  { id: 'paris', name: 'Paris', country: 'France', population: 11.0, water_score: 89.2, supply_deficit: 2, treatment_capacity: 96, status: 'Excellent' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', population: 37.4, water_score: 91.8, supply_deficit: 1, treatment_capacity: 98, status: 'Excellent' },
  { id: 'sao-paulo-city', name: 'São Paulo', country: 'Brazil', population: 22.4, water_score: 66.3, supply_deficit: 16, treatment_capacity: 74, status: 'Good' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', population: 5.1, water_score: 49.2, supply_deficit: 33, treatment_capacity: 52, status: 'Critical' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', population: 3.8, water_score: 88.9, supply_deficit: 2, treatment_capacity: 95, status: 'Excellent' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', population: 34.5, water_score: 55.1, supply_deficit: 27, treatment_capacity: 59, status: 'Warning' },
]

const CITY_INSIGHTS: Record<string, { confidence: number; analysis: string; recommendations: string[]; agents: string[]; tools: string[]; metrics: { label: string; value: string; color: string }[] }> = {
  mumbai: {
    confidence: 87,
    analysis: 'Infrastructure Agent identifies 284 active leak zones costing 680 MLD daily. Powai Lake at 91.2% with overflow risk in 48h. Bhandup WTP operating at 97% rated capacity — surge buffer critically low.',
    recommendations: ['Immediately dispatch repair teams to 3 Dharavi trunk main fractures', 'Pre-release 120 MCM from Powai Lake to create surge capacity', 'Issue boil-water advisory for Zone 7 (elevated turbidity: 8.4 NTU)'],
    agents: ['Infrastructure Agent', 'Leak Detection Agent', 'Water Quality Agent'],
    tools: ['detectLeaks()', 'assessPipeNetwork()', 'monitorTurbidity()'],
    metrics: [{ label: 'WQI Score', value: '74.2', color: 'text-amber-400' }, { label: 'Leak Zones', value: '284', color: 'text-red-400' }, { label: 'Daily Loss', value: '680 MLD', color: 'text-orange-400' }, { label: 'WTP Capacity', value: '97%', color: 'text-red-400' }],
  },
  delhi: {
    confidence: 84,
    analysis: 'Yamuna WQI at 51 — unsafe for bathing, borderline for treatment. 631 active leak zones losing 920 MLD (36% of supply). Per capita supply 172 LPCD vs WHO target 270 LPCD. 12 zones on alternate-day schedule.',
    recommendations: ['Prioritize Yamuna bank filtration upgrades to improve intake quality', 'Deploy acoustic leak detectors across the 631 identified loss zones', 'Fast-track DJB pipeline replacement programme in south Delhi'],
    agents: ['Infrastructure Agent', 'Water Quality Agent', 'Emergency Agent'],
    tools: ['monitorYamuna()', 'detectLeaks()', 'assessSupplyGap()'],
    metrics: [{ label: 'Yamuna WQI', value: '51', color: 'text-red-400' }, { label: 'Leak Zones', value: '631', color: 'text-red-400' }, { label: 'Per Capita', value: '172 LPCD', color: 'text-orange-400' }, { label: 'Daily Loss', value: '920 MLD', color: 'text-red-400' }],
  },
  dhaka: {
    confidence: 91,
    analysis: 'CRITICAL: Dhaka faces the highest urban water stress index (0.89) globally. Aging cast-iron pipes averaging 62 years are failing. Groundwater extraction 3× recharge rate has caused 4m land subsidence. 38% supply deficit affects 8.8M residents.',
    recommendations: ['Declare water emergency — activate WASA emergency response protocol', 'Replace all 1960s-era cast-iron mains in Old Dhaka within 18 months', 'Halt new groundwater extraction permits immediately'],
    agents: ['Emergency Agent', 'Infrastructure Agent', 'Groundwater Agent'],
    tools: ['assessCrisis()', 'modelSubsidence()', 'detectLeaks()'],
    metrics: [{ label: 'Stress Index', value: '0.89', color: 'text-red-400' }, { label: 'Pipe Age', value: '62 yr avg', color: 'text-red-400' }, { label: 'Deficit', value: '38%', color: 'text-red-400' }, { label: 'Subsidence', value: '4m', color: 'text-orange-400' }],
  },
  cairo: {
    confidence: 83,
    analysis: 'Nile River dependent city under severe water stress. Population growth (2.1%/yr) outpacing infrastructure upgrades. Treatment capacity insufficient to serve 31% of peripheral zones. Agricultural-urban competition intensifying under GERD filling effects.',
    recommendations: ['Expand desalination capacity along Mediterranean coast by 500 MLD', 'Negotiate Nile water quota under Grand Ethiopian Renaissance Dam framework', 'Implement demand management: 30% reduction target in agricultural use'],
    agents: ['River Basin Agent', 'Climate Agent', 'Country Agent'],
    tools: ['monitorNileFlow()', 'forecastDemand()', 'assessWaterSecurity()'],
    metrics: [{ label: 'Nile Flow', value: '2,830 m³/s', color: 'text-amber-400' }, { label: 'Treatment Gap', value: '31%', color: 'text-red-400' }, { label: 'Pop Growth', value: '2.1%/yr', color: 'text-orange-400' }, { label: 'WQI', value: '58.4', color: 'text-amber-400' }],
  },
  paris: {
    confidence: 96,
    analysis: 'Paris Water Authority operating at benchmark efficiency. 96% treatment coverage, 99.8% WHO compliance across 1,400 parameters. Smart meter network covers 98% of connections, reducing losses to 2%. Seine River turbidity within safe limits.',
    recommendations: ['Maintain current excellence — schedule Q3 pipe lining for 4 remaining legacy mains', 'Expand greywater recycling systems in 6th–8th arrondissements', 'Continue investing in real-time digital twin infrastructure'],
    agents: ['Infrastructure Agent', 'Water Quality Agent', 'Sensor Intelligence'],
    tools: ['monitorCompliance()', 'optimizeDistribution()', 'predictMaintenance()'],
    metrics: [{ label: 'WHO Compliance', value: '99.8%', color: 'text-emerald-400' }, { label: 'Water Loss', value: '2%', color: 'text-emerald-400' }, { label: 'Smart Meters', value: '98%', color: 'text-emerald-400' }, { label: 'WQI', value: '97.4', color: 'text-emerald-400' }],
  },
  tokyo: {
    confidence: 98,
    analysis: 'Tokyo Waterworks Bureau ranks 1st globally in water quality and infrastructure efficiency. Non-revenue water loss of 1% — best in world. Disaster-hardened dual-ring distribution prevents single points of failure. Tama River intake quality score 99.1.',
    recommendations: ['Continue seismic pipe replacement programme (target 2030 completion)', 'Expand advanced membrane filtration to address emerging contaminants', 'Share Tokyo water management best practices through WHO collaboration'],
    agents: ['Sensor Intelligence', 'Water Quality Agent', 'Infrastructure Agent'],
    tools: ['monitorTamaIntake()', 'detectAnomalies()', 'assessSeismicRisk()'],
    metrics: [{ label: 'NRW Loss', value: '1%', color: 'text-emerald-400' }, { label: 'WQI', value: '99.1', color: 'text-emerald-400' }, { label: 'Seismic Rating', value: 'A+', color: 'text-emerald-400' }, { label: 'Coverage', value: '100%', color: 'text-emerald-400' }],
  },
  'los-angeles': {
    confidence: 79,
    analysis: 'LA Aqueduct operating normally at 4.2 bar. Drought Stage 2 restrictions reduced demand 18%. Lake Mead at 38% affects Colorado River entitlement by 21%. Recycled water programme ramping: 32% of supply now reclaimed, targeting 40% by 2027.',
    recommendations: ['Accelerate Purple Pipe recycled water network expansion to San Fernando Valley', 'Implement tiered pricing to further reduce outdoor irrigation by 25%', 'Fast-track Groundwater Replenishment System Phase 3 (600 MLD capacity)'],
    agents: ['Reservoir Agent', 'Leak Detection Agent', 'Water Quality Agent'],
    tools: ['monitorAqueduct()', 'trackRecycledWater()', 'modelDroughtImpact()'],
    metrics: [{ label: 'Lake Mead', value: '38%', color: 'text-red-400' }, { label: 'Recycled %', value: '32%', color: 'text-blue-400' }, { label: 'Demand Cut', value: '18%', color: 'text-emerald-400' }, { label: 'Pressure', value: '4.2 bar', color: 'text-emerald-400' }],
  },
  nairobi: {
    confidence: 88,
    analysis: 'CRITICAL: Nairobi Water faces acute infrastructure deficit. Only 52% treated coverage — 2.4M residents rely on informal vendors at 10× official tariff. Thika Dam at 61% but distribution network unable to reach 40% of city. Pipe age average 55 years.',
    recommendations: ['Emergency UN-Habitat water access programme for informal settlements', 'Fast-track Ruiru Dam water treatment expansion (+200 MLD)', 'Install 2,000 community water kiosks with solar-powered pumping'],
    agents: ['Emergency Agent', 'Infrastructure Agent', 'Country Agent'],
    tools: ['assessAccessGap()', 'modelDistribution()', 'prioritizeMaintenance()'],
    metrics: [{ label: 'Coverage', value: '52%', color: 'text-red-400' }, { label: 'Thika Dam', value: '61%', color: 'text-amber-400' }, { label: 'Informal %', value: '40%', color: 'text-red-400' }, { label: 'Pipe Age', value: '55 yr', color: 'text-red-400' }],
  },
  jakarta: {
    confidence: 82,
    analysis: 'Jakarta at critical risk: only 40% piped water access; 60% use groundwater causing 25cm/yr subsidence. Parts of North Jakarta now 5m below sea level, increasing flood vulnerability. Citarum River contamination severely limits surface water intake quality.',
    recommendations: ['Halt all groundwater extraction in Central and North Jakarta', 'Expand Jatiluhur reservoir pipeline network to cut groundwater dependency by 50%', 'Deploy rapid-deployment flood barriers in North Jakarta coastal zone'],
    agents: ['Infrastructure Agent', 'Flood Agent', 'River Basin Agent'],
    tools: ['monitorSubsidence()', 'assessFloodRisk()', 'trackGroundwater()'],
    metrics: [{ label: 'Piped Access', value: '40%', color: 'text-red-400' }, { label: 'Subsidence', value: '25cm/yr', color: 'text-red-400' }, { label: 'Sea Level', value: '-5m', color: 'text-red-400' }, { label: 'WQI', value: '55.1', color: 'text-orange-400' }],
  },
  beijing: {
    confidence: 86,
    analysis: 'South-North Water Diversion Project delivering 1.1B m³/yr to Beijing, supplementing Miyun Reservoir (currently at 73%). Air quality improvements have reduced acid deposition on watershed. Smart metering covers 89% of connections.',
    recommendations: ['Continue groundwater recharge programme in Chaoyang District', 'Expand wastewater reuse for industrial cooling — target 35% reclaim rate', 'Upgrade Miyun watershed protection zones against agricultural runoff'],
    agents: ['Reservoir Agent', 'River Basin Agent', 'Infrastructure Agent'],
    tools: ['monitorMiyun()', 'trackDiversion()', 'modelRechargRate()'],
    metrics: [{ label: 'Miyun Level', value: '73%', color: 'text-emerald-400' }, { label: 'Diversion', value: '1.1B m³/yr', color: 'text-blue-400' }, { label: 'Smart Meters', value: '89%', color: 'text-blue-400' }, { label: 'WQI', value: '71.3', color: 'text-blue-400' }],
  },
  'sao-paulo-city': {
    confidence: 81,
    analysis: 'Cantareira System at 67% — recovering from 2014–15 crisis. 16% supply deficit concentrated in peripheral zones. Tietê River receiving reduced industrial discharge following compliance crackdowns. 340 km of water mains flagged for replacement.',
    recommendations: ['Accelerate Linha 18 wastewater collection expansion in São Mateus', 'Reactivate Guarapiranga emergency supply protocols for peak season', 'Complete Tietê River cleanup phase 3 to enable future intake use'],
    agents: ['Reservoir Agent', 'Infrastructure Agent', 'Water Quality Agent'],
    tools: ['monitorCantareira()', 'detectLeaks()', 'analyzeTieteQuality()'],
    metrics: [{ label: 'Cantareira', value: '67%', color: 'text-blue-400' }, { label: 'Deficit', value: '16%', color: 'text-orange-400' }, { label: 'Main Pipes', value: '340 km', color: 'text-amber-400' }, { label: 'WQI', value: '66.3', color: 'text-blue-400' }],
  },
  berlin: {
    confidence: 95,
    analysis: 'Berlin operates 100% on natural bank filtration — no chemical addition needed for primary purification. Spree River bank filtration providing 70% of supply at very low cost. Water cycle closed: 100% wastewater treated, 30% reclaimed for industrial use.',
    recommendations: ['Monitor PFAS contamination risk from Tegeler See catchment area', 'Continue lead pipe removal programme — 98% complete, final 2% by 2027', 'Expand heat-pump water heating to reduce thermal pollution in Spree'],
    agents: ['Water Quality Agent', 'Infrastructure Agent', 'Sensor Intelligence'],
    tools: ['monitorBankFiltration()', 'trackPFAS()', 'assessSpreeHealth()'],
    metrics: [{ label: 'Chemical Use', value: 'Zero', color: 'text-emerald-400' }, { label: 'Reclaim %', value: '30%', color: 'text-emerald-400' }, { label: 'Lead Pipes', value: '2% remain', color: 'text-amber-400' }, { label: 'WQI', value: '96.1', color: 'text-emerald-400' }],
  },
}

const statusColors: Record<string, string> = {
  Excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Good: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const scoreColor = (score: number) => score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : score >= 45 ? '#F59E0B' : '#EF4444'

export function CitiesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      try {
        const r = await citiesApi.list()
        const raw = r.data?.cities ?? r.data
        if (!Array.isArray(raw) || !raw[0]) return mockCities
        const countryFromState = (sid: string) => {
          const m: Record<string,string> = { 'in-': 'India', 'us-': 'USA', 'br-': 'Brazil', 'cn-': 'China', 'de-': 'Germany', 'fr-': 'France', 'jp-': 'Japan', 'au-': 'Australia' }
          return Object.entries(m).find(([k]) => sid?.startsWith(k))?.[1] ?? 'Unknown'
        }
        return raw.map((c: Record<string, unknown>): typeof mockCities[0] => {
          const score = (c.water_quality_score ?? c.water_score ?? 65) as number
          const status = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Warning' : 'Critical'
          return {
            id: String(c.id ?? ''), name: String(c.name ?? ''),
            country: countryFromState(String(c.state_id ?? '')),
            population: Math.round(((c.population as number ?? 5000000) / 1e6) * 10) / 10,
            water_score: score,
            supply_deficit: Math.round(((c.leak_count as number ?? 0) / ((c.water_consumption_mld as number ?? 1000) + 1)) * 100),
            treatment_capacity: (c.pipeline_health_pct ?? c.treatment_capacity ?? 70) as number,
            status,
          }
        })
      }
      catch { return mockCities }
    },
  })
  const cities = data ?? mockCities
  const selectedCity = cities.find((c: typeof mockCities[0]) => c.id === selectedId) ?? null
  const insight = selectedId ? (CITY_INSIGHTS[selectedId] ?? null) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-400" /> Cities</h1>
        <p className="text-sm text-slate-500 mt-0.5">Urban water infrastructure — click a city for AI analysis</p>
      </div>

      <AnimatePresence mode="wait">
        {selectedCity && insight ? (
          <motion.div key={selectedId} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">AI Insights — {selectedCity.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-400">{insight.confidence}%</span>
                    <p className="text-[10px] text-slate-500">confidence</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${statusColors[selectedCity.status]}`}>{selectedCity.status}</span>
                  <button onClick={() => setSelectedId(null)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 transition-colors">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1.5">Agent Analysis</p>
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
                          {selectedCity.status === 'Excellent' || selectedCity.status === 'Good'
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
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
              <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">86%</span></div>
              <p className="text-xs text-slate-400 mb-2">City-level analysis identifies 5 megacities with critical supply-demand imbalances. Infrastructure Agents modeling pipe upgrade priorities and demand forecasting for urban areas serving 130M+ residents in deficit. <span className="text-blue-400">Click any city card below for detailed AI analysis.</span></p>
              <div className="flex flex-wrap gap-1.5">
                {['City Agent', 'Infrastructure Agent', 'Demand Forecasting Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
                {['predictWaterDemand()', 'modelPipeNetwork()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cities.map((city: typeof mockCities[0], i: number) => (
          <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard
              hover
              className={`p-4 cursor-pointer transition-all ${selectedId === city.id ? 'border border-blue-500/40 bg-blue-500/5' : ''}`}
              onClick={() => setSelectedId(prev => prev === city.id ? null : city.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">{city.name}</p>
                  <p className="text-[10px] text-slate-500">{city.country}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {selectedId === city.id && <span className="text-[10px] text-blue-400 font-medium">● Selected</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[city.status]}`}>{city.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke={scoreColor(city.water_score)} strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 28 * city.water_score / 100} ${2 * Math.PI * 28}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{city.water_score.toFixed(0)}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />Population</span>
                      <span className="text-white">{city.population}M</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-500 flex items-center gap-1"><Droplets className="w-3 h-3" />Treatment</span>
                      <span className="text-white">{city.treatment_capacity}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${city.treatment_capacity}%` }} />
                    </div>
                  </div>
                  {city.supply_deficit > 0 && (
                    <div className="text-[10px] text-red-400">Supply deficit: {city.supply_deficit}%</div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
