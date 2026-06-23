import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flag, LayoutGrid, List, Brain } from 'lucide-react'
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
                  onClick={() => navigate(`/countries/${c.id}`)}
                  className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
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
              <GlassCard hover className="p-4 cursor-pointer" onClick={() => navigate(`/countries/${c.id}`)}>
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

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">89%</span></div>
        <p className="text-xs text-slate-400 mb-2">Country-level AI analysis shows 3 nations in critical water stress requiring immediate intervention. Global Coordinator Agent is delegating region-specific response strategies to Country Agents.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Global Coordinator', 'Country Agent', 'Climate Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['searchKnowledge()', 'analyzeWaterQuality()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
