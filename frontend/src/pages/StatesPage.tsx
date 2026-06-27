import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, ChevronDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { statesApi } from '@/services/api'
import { AgentWorkflowPanel } from '@/components/AgentWorkflowPanel'

const mockStates = [
  { id: 'assam',          name: 'Assam',          country: 'India',         emoji: '🇮🇳', water_score: 58.4, reservoir_capacity: 69, drought_risk: 'High',     sensors: 1800 },
  { id: 'maharashtra',    name: 'Maharashtra',    country: 'India',         emoji: '🇮🇳', water_score: 65.2, reservoir_capacity: 72, drought_risk: 'High',     sensors: 4200 },
  { id: 'rajasthan',      name: 'Rajasthan',      country: 'India',         emoji: '🇮🇳', water_score: 41.8, reservoir_capacity: 31, drought_risk: 'Critical', sensors: 2100 },
  { id: 'odisha',         name: 'Odisha',         country: 'India',         emoji: '🇮🇳', water_score: 61.3, reservoir_capacity: 88, drought_risk: 'Medium',   sensors: 1600 },
  { id: 'west-bengal',    name: 'West Bengal',    country: 'India',         emoji: '🇮🇳', water_score: 55.7, reservoir_capacity: 63, drought_risk: 'High',     sensors: 2400 },
  { id: 'california',     name: 'California',     country: 'United States', emoji: '🇺🇸', water_score: 71.4, reservoir_capacity: 58, drought_risk: 'High',     sensors: 8400 },
  { id: 'texas',          name: 'Texas',          country: 'United States', emoji: '🇺🇸', water_score: 76.9, reservoir_capacity: 74, drought_risk: 'Medium',   sensors: 7200 },
  { id: 'sao-paulo',      name: 'São Paulo',      country: 'Brazil',        emoji: '🇧🇷', water_score: 68.3, reservoir_capacity: 61, drought_risk: 'Medium',   sensors: 3100 },
  { id: 'xinjiang',       name: 'Xinjiang',       country: 'China',         emoji: '🇨🇳', water_score: 55.7, reservoir_capacity: 48, drought_risk: 'High',     sensors: 2800 },
  { id: 'queensland',     name: 'Queensland',     country: 'Australia',     emoji: '🇦🇺', water_score: 62.1, reservoir_capacity: 44, drought_risk: 'Critical', sensors: 1900 },
  { id: 'bavaria',        name: 'Bavaria',        country: 'Germany',       emoji: '🇩🇪', water_score: 90.2, reservoir_capacity: 87, drought_risk: 'Low',      sensors: 2600 },
  { id: 'sindh',          name: 'Sindh',          country: 'Pakistan',      emoji: '🇵🇰', water_score: 44.6, reservoir_capacity: 37, drought_risk: 'Critical', sensors: 900  },
]

const riskColors: Record<string, string> = {
  Low:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const scoreColor = (s: number) =>
  s >= 75 ? 'from-emerald-600 to-emerald-400' :
  s >= 55 ? 'from-blue-600 to-cyan-500' :
  s >= 40 ? 'from-amber-600 to-orange-400' :
            'from-red-600 to-red-400'

export function StatesPage() {
  const [selectedId, setSelectedId] = useState<string | null>('assam')

  const { data } = useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      try { const r = await statesApi.list(); return r.data?.states ?? r.data }
      catch { return mockStates }
    },
  })

  const states = (data ?? mockStates) as typeof mockStates
  const selected = states.find(s => s.id === selectedId) ?? null

  const handleSelect = (id: string) => setSelectedId(prev => prev === id ? null : id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-400" /> States & Provinces
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Select a state to activate the AI intelligence pipeline · {states.length} regions monitored
        </p>
      </div>

      {/* State grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {states.map((s, i) => {
          const isSelected = selectedId === s.id
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <button
                onClick={() => handleSelect(s.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-400/50 shadow-blue-500/10 shadow-lg'
                    : 'bg-white/3 border-white/6 hover:bg-white/6 hover:border-white/12'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{s.name}</p>
                      <p className="text-[9px] text-slate-500">{s.country}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border shrink-0 ${riskColors[s.drought_risk]}`}>
                    {s.drought_risk}
                  </span>
                </div>

                <div className="mb-1.5">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-slate-500">Water Score</span>
                    <span className={`font-bold ${s.water_score >= 75 ? 'text-emerald-400' : s.water_score >= 55 ? 'text-blue-400' : s.water_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.water_score}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r rounded-full transition-all ${scoreColor(s.water_score)}`} style={{ width: `${s.water_score}%` }} />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-600">
                  <span>Res: <span className="text-slate-400">{s.reservoir_capacity}%</span></span>
                  <span>{(s.sensors / 1000).toFixed(1)}K sensors</span>
                </div>

                {isSelected && (
                  <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-blue-500/20">
                    <span className="text-[9px] text-blue-400">AI Pipeline Active</span>
                    <ChevronDown className="w-3 h-3 text-blue-400" />
                  </div>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Agent workflow panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <AgentWorkflowPanel stateId={selected.id} stateName={selected.name} />
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <GlassCard className="p-8 text-center">
          <Map className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Select a state above to activate the AI intelligence pipeline</p>
          <p className="text-xs text-slate-600 mt-1">Each state runs 4–6 specialised agents with full reasoning transparency</p>
        </GlassCard>
      )}
    </div>
  )
}
