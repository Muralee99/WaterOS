import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, Brain } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { statesApi } from '@/services/api'

const mockStates = [
  { id: 'maharashtra', name: 'Maharashtra', country: 'India', emoji: '🇮🇳', water_score: 65.2, reservoir_capacity: 72, drought_risk: 'High', sensors: 4200 },
  { id: 'rajasthan', name: 'Rajasthan', country: 'India', emoji: '🇮🇳', water_score: 41.8, reservoir_capacity: 31, drought_risk: 'Critical', sensors: 2100 },
  { id: 'california', name: 'California', country: 'United States', emoji: '🇺🇸', water_score: 71.4, reservoir_capacity: 58, drought_risk: 'High', sensors: 8400 },
  { id: 'texas', name: 'Texas', country: 'United States', emoji: '🇺🇸', water_score: 76.9, reservoir_capacity: 74, drought_risk: 'Medium', sensors: 7200 },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', emoji: '🇧🇷', water_score: 68.3, reservoir_capacity: 61, drought_risk: 'Medium', sensors: 3100 },
  { id: 'xinjiang', name: 'Xinjiang', country: 'China', emoji: '🇨🇳', water_score: 55.7, reservoir_capacity: 48, drought_risk: 'High', sensors: 2800 },
  { id: 'queensland', name: 'Queensland', country: 'Australia', emoji: '🇦🇺', water_score: 62.1, reservoir_capacity: 44, drought_risk: 'Critical', sensors: 1900 },
  { id: 'bavaria', name: 'Bavaria', country: 'Germany', emoji: '🇩🇪', water_score: 90.2, reservoir_capacity: 87, drought_risk: 'Low', sensors: 2600 },
  { id: 'assam', name: 'Assam', country: 'India', emoji: '🇮🇳', water_score: 58.4, reservoir_capacity: 69, drought_risk: 'Medium', sensors: 1800 },
  { id: 'sindh', name: 'Sindh', country: 'Pakistan', emoji: '🇵🇰', water_score: 44.6, reservoir_capacity: 37, drought_risk: 'Critical', sensors: 900 },
  { id: 'ile-de-france', name: 'Île-de-France', country: 'France', emoji: '🇫🇷', water_score: 83.7, reservoir_capacity: 79, drought_risk: 'Low', sensors: 2200 },
  { id: 'hokkaido', name: 'Hokkaido', country: 'Japan', emoji: '🇯🇵', water_score: 88.9, reservoir_capacity: 84, drought_risk: 'Low', sensors: 3100 },
]

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  High: 'text-orange-400 bg-orange-500/10',
  Critical: 'text-red-400 bg-red-500/10',
}

export function StatesPage() {
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      try { return (await statesApi.list()).data }
      catch { return mockStates }
    },
  })

  const states = data ?? mockStates

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Map className="w-5 h-5 text-blue-400" /> States & Provinces</h1>
        <p className="text-sm text-slate-500 mt-0.5">Sub-national water management units · AI-monitored</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {states.map((s: typeof mockStates[0], i: number) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <GlassCard hover className="p-4 cursor-pointer" onClick={() => navigate(`/states/${s.id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-500">{s.country}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${riskColors[s.drought_risk]}`}>{s.drought_risk}</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500">Water Score</span>
                    <span className="text-blue-400 font-bold">{s.water_score}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all" style={{ width: `${s.water_score}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Reservoir: <span className="text-white">{s.reservoir_capacity}%</span></span>
                <span>Sensors: <span className="text-white">{(s.sensors / 1000).toFixed(1)}K</span></span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">87%</span></div>
        <p className="text-xs text-slate-400 mb-2">State-level AI analysis reveals 4 provinces in critical water stress. Country Agents are coordinating with State Agents for localized interventions and cross-border water sharing agreements.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Country Agent', 'State Agent', 'Climate Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['analyzeWaterQuality()', 'forecastDrought()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
