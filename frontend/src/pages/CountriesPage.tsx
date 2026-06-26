import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, LayoutGrid, List, Brain, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { countriesApi } from '@/services/api'

const mockCountries = [
  { id: 'india', name: 'India', emoji: '🇮🇳', continent: 'Asia', water_score: 68.4, drought_risk: 'High', flood_risk: 'High', reservoir_capacity: 71, sensors: 42000, status: 'Warning' },
  { id: 'usa', name: 'United States', emoji: '🇺🇸', continent: 'Americas', water_score: 82.1, drought_risk: 'Medium', flood_risk: 'Low', reservoir_capacity: 79, sensors: 58000, status: 'Good' },
  { id: 'china', name: 'China', emoji: '🇨🇳', continent: 'Asia', water_score: 72.3, drought_risk: 'Medium', flood_risk: 'High', reservoir_capacity: 81, sensors: 51000, status: 'Warning' },
  { id: 'brazil', name: 'Brazil', emoji: '🇧🇷', continent: 'Americas', water_score: 76.8, drought_risk: 'Low', flood_risk: 'Medium', reservoir_capacity: 74, sensors: 28000, status: 'Good' },
  { id: 'australia', name: 'Australia', emoji: '🇦🇺', continent: 'Oceania', water_score: 70.5, drought_risk: 'Critical', flood_risk: 'Low', reservoir_capacity: 52, sensors: 19000, status: 'Critical' },
  { id: 'egypt', name: 'Egypt', emoji: '🇪🇬', continent: 'Africa', water_score: 54.2, drought_risk: 'Critical', flood_risk: 'Low', reservoir_capacity: 41, sensors: 8200, status: 'Critical' },
  { id: 'germany', name: 'Germany', emoji: '🇩🇪', continent: 'Europe', water_score: 88.4, drought_risk: 'Low', flood_risk: 'Low', reservoir_capacity: 85, sensors: 22000, status: 'Good' },
  { id: 'japan', name: 'Japan', emoji: '🇯🇵', continent: 'Asia', water_score: 84.7, drought_risk: 'Low', flood_risk: 'Medium', reservoir_capacity: 78, sensors: 31000, status: 'Good' },
  { id: 'canada', name: 'Canada', emoji: '🇨🇦', continent: 'Americas', water_score: 91.2, drought_risk: 'Low', flood_risk: 'Low', reservoir_capacity: 88, sensors: 24000, status: 'Excellent' },
  { id: 'nigeria', name: 'Nigeria', emoji: '🇳🇬', continent: 'Africa', water_score: 49.8, drought_risk: 'High', flood_risk: 'High', reservoir_capacity: 38, sensors: 6400, status: 'Critical' },
  { id: 'russia', name: 'Russia', emoji: '🇷🇺', continent: 'Europe', water_score: 79.3, drought_risk: 'Low', flood_risk: 'Medium', reservoir_capacity: 82, sensors: 33000, status: 'Good' },
  { id: 'indonesia', name: 'Indonesia', emoji: '🇮🇩', continent: 'Asia', water_score: 65.1, drought_risk: 'Medium', flood_risk: 'High', reservoir_capacity: 61, sensors: 14000, status: 'Warning' },
  { id: 'bangladesh', name: 'Bangladesh', emoji: '🇧🇩', continent: 'Asia', water_score: 52.7, drought_risk: 'Medium', flood_risk: 'Critical', reservoir_capacity: 44, sensors: 7800, status: 'Critical' },
  { id: 'france', name: 'France', emoji: '🇫🇷', continent: 'Europe', water_score: 86.9, drought_risk: 'Low', flood_risk: 'Low', reservoir_capacity: 83, sensors: 19000, status: 'Good' },
  { id: 'argentina', name: 'Argentina', emoji: '🇦🇷', continent: 'Americas', water_score: 74.6, drought_risk: 'Medium', flood_risk: 'Medium', reservoir_capacity: 68, sensors: 12000, status: 'Good' },
]

type CountryInsight = {
  confidence: number
  risk: string
  insights: string[]
  alerts: string[]
  agents: string[]
  tools: string[]
}

const COUNTRY_INSIGHTS: Record<string, CountryInsight> = {
  india: {
    confidence: 94, risk: 'High',
    insights: [
      'Brahmaputra at 7.2m — CRITICAL flood risk, 240K people at risk across 4 Assam districts',
      'Monsoon onset 2 weeks early; northeast received 312mm in 7 days (2.1× seasonal average)',
      'Groundwater depletion: 12cm/year in NW India; Rajasthan aquifer at 42m depth (critical threshold)',
      'National reservoir aggregate: 73.8% across 91 major dams — Hirakud at 91.2% (overflow alert)',
      'Non-revenue water: ~40% NRW (₹18B/year) — 12,840 pipeline leak zones being monitored',
    ],
    alerts: [
      'RED ALERT: Brahmaputra CRITICAL — crest in 6h at Guwahati, evacuation advisory active',
      'Hirakud Reservoir at 91.2% — controlled release 480 m³/s underway',
      'Emergency: Water rationing enforced in 12 Rajasthan districts (groundwater depth 42m)',
    ],
    agents: ['Country Agent', 'Flood Agent', 'Rainfall Agent', 'Reservoir Agent', 'Groundwater Agent'],
    tools: ['analyzeFloodRisk()', 'forecastRain()', 'optimizeReservoir()', 'monitorGroundwater()'],
  },
  usa: {
    confidence: 89, risk: 'Medium',
    insights: [
      'Lake Mead at 38% — Tier 2 shortage declared under Colorado River Compact (7-state impact)',
      'California D3 Extreme Drought: 41% of state area; Shasta at 54.1% (below 68% seasonal avg)',
      'Infrastructure aging: 240,000 water main breaks annually — estimated 14% non-revenue water loss',
      '45 public water systems flagged for PFAS contamination across 18 states (EPA enforcement active)',
      'Desalination expansion: +420 MLD planned in Southern California by 2027',
    ],
    alerts: [
      'Drought emergency: Colorado River Basin — Tier 2 restrictions enforced for 40M people',
      'PFAS advisory: 45 water systems under EPA remediation order in 18 states',
    ],
    agents: ['Country Agent', 'Reservoir Agent', 'Water Quality Agent', 'Climate Agent'],
    tools: ['monitorDrought()', 'analyzeWaterQuality()', 'forecastDemand()', 'detectContaminants()'],
  },
  china: {
    confidence: 91, risk: 'High',
    insights: [
      'Three Gorges Reservoir at 89.1% of 39,300 MCM capacity — highest since 2020, overflow risk HIGH',
      'North-South Water Diversion Project: 14.8B m³ transferred this year (record annual transfer)',
      'Yangtze River flow 22% above seasonal average — 3 downstream provinces on flood watch',
      'Yellow River Basin: groundwater deficit 8.5B m³/year; 23 cities facing supply stress by 2030',
      '51,000 sensors active across 98 major reservoirs; dam safety AI running real-time structural analysis',
    ],
    alerts: [
      'Warning: Three Gorges overflow risk HIGH — recommended outflow 22,000 m³/s',
      'Flood watch: Yangtze downstream (Hubei, Anhui, Jiangsu provinces)',
    ],
    agents: ['Country Agent', 'Flood Agent', 'River Basin Agent', 'Reservoir Agent'],
    tools: ['monitorReservoir()', 'analyzeRiverFlow()', 'forecastFlood()'],
  },
  bangladesh: {
    confidence: 96, risk: 'Critical',
    insights: [
      'Buriganga River at 6.8m — 1.3m above 5.5m flood threshold; 890K people in 3 districts at risk',
      '84% storm probability over 48 hours; 427mm 7-day precipitation forecast (Open-Meteo)',
      'Padma–Brahmaputra discharge 22% above seasonal average — downstream crest in 24–36 hours',
      'Dhaka water quality CRITICAL: turbidity 18.2 NTU, chlorine 0.12 mg/L, 3 WHO violations active',
      'Groundwater arsenic contamination affects 20M people — 64% of tube wells exceed WHO limit',
    ],
    alerts: [
      'RED ALERT: Buriganga flood CRITICAL — 890K at risk, 120 rescue boats deployed',
      'Water DANGER: Dhaka Buriganga intake — 3 WHO violations, boil-water mandatory',
      'Cyclone advisory: Bay of Bengal — 72h landfall probability 61%',
    ],
    agents: ['Country Agent', 'Flood Agent', 'Water Quality Agent', 'Emergency Agent'],
    tools: ['analyzeFloodRisk()', 'monitorWaterQuality()', 'triggerEmergency()', 'forecastRain()'],
  },
  australia: {
    confidence: 87, risk: 'Critical',
    insights: [
      'Murray-Darling Basin: Lake Wivenhoe at 18.4% — critical shortage risk for SE Queensland (3.7M people)',
      'Drought conditions: D3-D4 across 38% of continent; Murray River flow at 40-year low',
      'Desalination capacity: Perth (144 GL/yr) and Sydney Gold Coast plants running at 85% to compensate',
      '19,000 IoT sensors active; Bureau of Meteorology AI integration tracking La Niña transition',
      'Water trading markets: Murray-Darling allocation prices at A$620/ML (record high)',
    ],
    alerts: [
      'Drought CRITICAL: Murray-Darling — 38% continent coverage, water restrictions Stage 3',
      'Lake Wivenhoe 18.4% — shortage risk; SE Queensland emergency supply protocols active',
    ],
    agents: ['Country Agent', 'Climate Agent', 'Reservoir Agent', 'Groundwater Agent'],
    tools: ['monitorDrought()', 'forecastRainfall()', 'analyzeReservoir()'],
  },
  egypt: {
    confidence: 88, risk: 'Critical',
    insights: [
      'Nile freshwater per capita: 560 m³/year — below the UN absolute scarcity threshold of 500 m³',
      'Lake Nasser (Aswan) at 68.4% — Nile flow restricted by Grand Ethiopian Renaissance Dam (GERD)',
      'GERD dispute: Ethiopia filling reduces downstream flow estimate by 8–11B m³/year',
      'Groundwater: Nubian Sandstone Aquifer (non-renewable) — 8 extraction sites approaching depletion',
      'Agricultural water efficiency: 45% irrigation loss; drip irrigation mandate covers only 12% of area',
    ],
    alerts: [
      'Scarcity CRITICAL: Per-capita water <500 m³ — UN absolute water scarcity threshold breached',
      'GERD impact advisory: 8–11B m³/year Nile flow reduction forecast',
    ],
    agents: ['Country Agent', 'Climate Agent', 'River Basin Agent', 'Groundwater Agent'],
    tools: ['analyzeWaterStress()', 'monitorGroundwater()', 'forecastRiverFlow()'],
  },
  nigeria: {
    confidence: 82, risk: 'High',
    insights: [
      'Niger Delta: 5,000+ oil spills since 1976 have contaminated 2,500 km² of water sources',
      'Northern Nigeria: Lake Chad has shrunk 90% since 1960 — 30M people affected by water access loss',
      'Urban water access: Only 29% of Lagos population has piped water; rest rely on informal vendors',
      'Flooding: 33 of 36 states experienced floods in 2024; 1.2M displaced, 600 deaths',
      '6,400 sensors deployed; AI Water Quality Agent detecting E. coli in 38% of open water sources',
    ],
    alerts: [
      'Flood HIGH: 33 states affected — 1.2M displaced, emergency response active',
      'Contamination: 38% of surface water sources have E. coli above WHO limit',
    ],
    agents: ['Country Agent', 'Flood Agent', 'Water Quality Agent', 'Emergency Agent'],
    tools: ['analyzeContamination()', 'monitorFlood()', 'triggerEmergency()'],
  },
  germany: {
    confidence: 96, risk: 'Low',
    insights: [
      'Rhine River flow at seasonal normal — all 22 monitoring gauges within safe operating range',
      'Groundwater recharge rate positive across all 16 federal states; no depletion alerts',
      'Water treatment: 99.8% WHO compliance across 6,200 public water utilities',
      'NRW (non-revenue water): 5.8% — among the lowest globally (vs India 40%, USA 14%)',
      'Climate adaptation: €8.2B invested in flood resilience infrastructure since 2021',
    ],
    alerts: [],
    agents: ['Country Agent', 'Water Quality Agent', 'Climate Agent'],
    tools: ['analyzeWaterQuality()', 'monitorGroundwater()', 'forecastClimate()'],
  },
  japan: {
    confidence: 94, risk: 'Low',
    insights: [
      'Tokyo Reservoir complex at 84.1% — stable, seasonal normal; no supply risk',
      'Water quality: 98.7 WQI average across 4,800 utilities — 99.9% WHO compliance',
      'Typhoon preparedness: 18 flood gates operational; 2024 season impact mitigated to 0.3% of GDP',
      'NRW: 3.2% — world-class infrastructure with avg pipe age of 21 years (vs 45yr in USA)',
      'AI-driven demand forecasting: 94% accuracy, saving 8.4B litres annually in Tokyo Metro',
    ],
    alerts: [],
    agents: ['Country Agent', 'Reservoir Agent', 'Water Quality Agent'],
    tools: ['analyzeWaterQuality()', 'forecastDemand()', 'optimizeDistribution()'],
  },
  canada: {
    confidence: 97, risk: 'Low',
    insights: [
      'Canada holds 7% of world\'s renewable freshwater — 2,902 BCM/year renewable supply',
      'Great Lakes water levels at seasonal normal; Ottawa River flow within ±8% of 30-year average',
      'British Columbia: record snowpack at 124% of normal — reservoirs filling ahead of schedule',
      'First Nations water advisories: 28 communities still under long-term boil advisories (ongoing)',
      '24,000 sensors monitoring; water quality compliance at 99.4% for municipal systems',
    ],
    alerts: [
      'Advisory: 28 First Nations communities under long-term boil water advisories (federal action required)',
    ],
    agents: ['Country Agent', 'Reservoir Agent', 'Water Quality Agent'],
    tools: ['monitorWaterQuality()', 'analyzeSnowpack()', 'forecastFlow()'],
  },
  france: {
    confidence: 95, risk: 'Low',
    insights: [
      'Seine River within normal range; all 12 Paris WTP plants operating at 82% capacity',
      'Mediterranean drought risk: 2024 deficit of 18% below LPA in southern regions',
      'NRW: 20.5% (improving from 26% in 2020 — €1.8B infrastructure investment programme)',
      'Nuclear cooling water: 56 reactors using river water — Rhine/Rhône temperature alerts active in summer',
      '19,000 sensors monitoring; SANDRE national water database updated in real time',
    ],
    alerts: [],
    agents: ['Country Agent', 'Climate Agent', 'Water Quality Agent'],
    tools: ['analyzeWaterQuality()', 'monitorRiverFlow()', 'forecastDrought()'],
  },
  brazil: {
    confidence: 90, risk: 'Medium',
    insights: [
      'Amazon River: 209,000 m³/s discharge at Manaus — 8% above seasonal average',
      'Itaipu Reservoir at 78.3% of 29,000 MCM — hydropower generation at 98% capacity',
      'São Paulo: Cantareira System at 71.2% — recovered from 2014 crisis (was 5% at worst)',
      'Cerrado deforestation: 50% of aquifer recharge zones cleared — groundwater stress emerging',
      '28,000 sensors; SNIRH national water resource system integrated with WaterOS',
    ],
    alerts: [],
    agents: ['Country Agent', 'River Basin Agent', 'Reservoir Agent', 'Climate Agent'],
    tools: ['monitorAmazon()', 'analyzeHydropower()', 'forecastRainfall()'],
  },
  indonesia: {
    confidence: 85, risk: 'High',
    insights: [
      'Jakarta: Ciliwung River flood risk MEDIUM — 6.2m (threshold 7.0m) with 61% storm probability',
      'Java groundwater: 50% of Jakarta\'s aquifer volume depleted; city sinking 25cm/year',
      'Water quality: Ciliwung industrial discharge — Lead 9.8 ppb, DO 5.2 mg/L (WHO violations)',
      'Kalimantan deforestation: 2.1M ha/year forest loss increasing runoff and erosion risk',
      '14,000 sensors deployed; BMKG weather integration providing 6-hour flood early warnings',
    ],
    alerts: [
      'Flood watch: Jakarta — Ciliwung 6.2m, storm probability 61%',
      'Water quality WARNING: Ciliwung Lead 9.8 ppb exceeds WHO limit',
    ],
    agents: ['Country Agent', 'Flood Agent', 'Water Quality Agent', 'Climate Agent'],
    tools: ['analyzeFloodRisk()', 'monitorWaterQuality()', 'forecastRain()'],
  },
  russia: {
    confidence: 88, risk: 'Low',
    insights: [
      'Volga River at seasonal normal — all 11 cascade reservoirs within operating range',
      'Lake Baikal water level: -0.3m below normal — Mongolian upstream development under review',
      'Arctic permafrost thaw releasing methane and threatening northern water infrastructure',
      'Water stress concentrated in Central Asia-border regions (Aral Sea basin)',
      '33,000 sensors; Roshydromet integration providing real-time basin monitoring',
    ],
    alerts: [],
    agents: ['Country Agent', 'Climate Agent', 'River Basin Agent'],
    tools: ['monitorRiverFlow()', 'analyzePermafrost()', 'forecastClimate()'],
  },
  argentina: {
    confidence: 86, risk: 'Medium',
    insights: [
      'Paraná River: 18,000 m³/s — 12% below seasonal average due to La Niña pattern',
      'Cuyo aquifers (Mendoza): depletion accelerating — 3.2m decline in 5 years',
      'Buenos Aires: Río de la Plata WTP treating 5.1B litres/day; quality at 94.2 WQI',
      'Pampas drought: 28% of agricultural area in D2-D3 conditions; soy/wheat yield impact',
      '12,000 sensors; INA (national water institute) data feed integrated with WaterOS',
    ],
    alerts: [
      'Drought watch: Pampas region — D2-D3 conditions across 28% of agricultural area',
    ],
    agents: ['Country Agent', 'Climate Agent', 'Groundwater Agent'],
    tools: ['analyzeWaterStress()', 'monitorGroundwater()', 'forecastDrought()'],
  },
}

const GLOBAL_INSIGHT: CountryInsight = {
  confidence: 91, risk: 'Elevated',
  insights: [
    '3 nations in CRITICAL water stress (Bangladesh, Egypt, Nigeria) requiring immediate intervention',
    '287 extreme weather events in 2025 — up 34% vs 2020; flood and drought frequency accelerating',
    'Global average reservoir fill: 67.3% across 12,840 monitored sites; 7 reservoirs above 90%',
    '284K sensors globally; 91% online — WaterOS Sensor Intelligence Agent processing live feeds',
    'Global NRW loss: estimated 346B litres/day — equivalent to 4× India\'s daily water demand',
  ],
  alerts: [
    'Bangladesh flood CRITICAL — 890K at risk, Buriganga 6.8m above threshold',
    'Egypt water scarcity CRITICAL — below UN absolute scarcity threshold of 500 m³/capita',
    'Assam/India flood CRITICAL — Brahmaputra 7.2m, 240K evacuation advisory',
  ],
  agents: ['Global Coordinator', 'Country Agent', 'Climate Agent', 'Emergency Agent'],
  tools: ['searchKnowledge()', 'analyzeWaterQuality()', 'forecastRain()', 'triggerEmergency()'],
}

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  High: 'text-orange-400 bg-orange-500/10',
  Critical: 'text-red-400 bg-red-500/10',
}
const statusColors: Record<string, string> = {
  Excellent: 'text-emerald-400', Good: 'text-emerald-400',
  Warning: 'text-amber-400', Critical: 'text-red-400',
}

export function CountriesPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [riskFilter, setRiskFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      try { const r = await countriesApi.list(); return r.data?.countries ?? r.data }
      catch { return mockCountries }
    },
  })

  const countries = (data ?? mockCountries).filter((c: typeof mockCountries[0]) =>
    riskFilter === 'All' || c.drought_risk === riskFilter || c.flood_risk === riskFilter
  )

  const selectedCountry = mockCountries.find(c => c.id === selectedId)
  const insight = selectedId ? (COUNTRY_INSIGHTS[selectedId] ?? GLOBAL_INSIGHT) : GLOBAL_INSIGHT

  const handleRowClick = (id: string) => {
    setSelectedId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Flag className="w-5 h-5 text-blue-400" /> Countries</h1>
          <p className="text-sm text-slate-500 mt-0.5">195 countries monitored · Hierarchical AI water intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {['All', 'Low', 'Medium', 'High', 'Critical'].map(r => <option key={r} value={r}>{r} Risk</option>)}
          </select>
          <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5'}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5'}`}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <GlassCard className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Country', 'Water Score', 'Drought Risk', 'Flood Risk', 'Reservoir', 'Sensors', 'Status'].map(h => (
                  <th key={h} className="text-left text-[10px] text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map((c: typeof mockCountries[0], i: number) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleRowClick(c.id)}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${selectedId === c.id ? 'bg-blue-500/10' : 'hover:bg-white/3'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.emoji}</span>
                      <div>
                        <p className="text-xs font-medium text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.continent}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-16">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${c.water_score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-white">{c.water_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${riskColors[c.drought_risk]}`}>{c.drought_risk}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${riskColors[c.flood_risk]}`}>{c.flood_risk}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-white">{c.reservoir_capacity}%</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-slate-400">{(c.sensors / 1000).toFixed(0)}K</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.map((c: typeof mockCountries[0], i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard hover className={`p-4 cursor-pointer border ${selectedId === c.id ? 'border-blue-500/40' : 'border-transparent'}`}
                onClick={() => handleRowClick(c.id)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{c.emoji}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${riskColors[c.drought_risk]}`}>{c.drought_risk}</span>
                </div>
                <p className="text-sm font-semibold text-white">{c.name}</p>
                <p className="text-[10px] text-slate-500 mb-2">{c.continent}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.water_score}%` }} />
                  </div>
                  <span className="text-xs font-bold text-blue-400">{c.water_score}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Insights — updates when a country is selected */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId ?? 'global'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <GlassCard className="p-5" glow="blue">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    AI Insights — {selectedCountry ? `${selectedCountry.emoji} ${selectedCountry.name}` : 'Global Overview'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {selectedCountry ? 'Country-specific agent intelligence' : 'Click a country row for detailed analysis'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-400">{insight.confidence}%</p>
                  <p className="text-[10px] text-slate-500">confidence</p>
                </div>
                {selectedCountry && (
                  <button
                    onClick={() => navigate(`/countries/${selectedId}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-medium transition-colors"
                  >
                    Full Report <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Insights */}
              <div className="lg:col-span-2 space-y-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Agent Intelligence</p>
                {insight.insights.map((ins, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 p-2.5 bg-white/3 rounded-lg border border-white/5">
                    <CheckCircle className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">{ins}</p>
                  </motion.div>
                ))}

                {insight.alerts.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Active Alerts</p>
                    {insight.alerts.map((alert, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2 p-2 bg-red-500/5 rounded-lg border border-red-500/20">
                        <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-300">{alert}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agents + Tools */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Active Agents</p>
                  <div className="space-y-1.5">
                    {insight.agents.map((a, i) => (
                      <motion.div key={a} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-2 p-2 bg-white/3 rounded-lg border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-xs text-white">{a}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Tools Called</p>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.tools.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
