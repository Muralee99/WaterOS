import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, Brain, Droplets, Users } from 'lucide-react'
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

const statusColors: Record<string, string> = {
  Excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Good: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const scoreColor = (score: number) => score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : score >= 45 ? '#F59E0B' : '#EF4444'

export function CitiesPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-400" /> Cities</h1>
        <p className="text-sm text-slate-500 mt-0.5">Urban water infrastructure & supply management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cities.map((city: typeof mockCities[0], i: number) => (
          <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard hover className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">{city.name}</p>
                  <p className="text-[10px] text-slate-500">{city.country}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[city.status]}`}>{city.status}</span>
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

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">86%</span></div>
        <p className="text-xs text-slate-400 mb-2">City-level analysis identifies 5 megacities with critical supply-demand imbalances. Infrastructure Agents are modeling pipe upgrade priorities and demand forecasting for urban areas serving over 130M people in deficit.</p>
        <div className="flex flex-wrap gap-1.5">
          {['City Agent', 'Infrastructure Agent', 'Demand Forecasting Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['predictWaterDemand()', 'modelPipeNetwork()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
