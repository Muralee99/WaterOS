import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CloudSun, Brain, Thermometer, Wind, CloudRain, Sun } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { climateApi } from '@/services/api'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const mockGlobalClimate = {
  avg_temperature_c: 15.2,
  temperature_anomaly_c: 1.4,
  global_rainfall_mm: 1248,
  drought_index: 0.32,
  sea_level_rise_mm: 3.7,
  ice_coverage_pct: 62.1,
  co2_ppm: 421.8,
  heat_stress_countries: 28,
}

const tempTrend = MONTHS.map((m, i) => ({
  month: m,
  temperature: 13 + Math.sin(i * 0.5) * 6 + Math.random() * 1.5,
  anomaly: 0.8 + Math.random() * 1.2,
}))

const rainfallData = MONTHS.map((m, i) => ({
  month: m,
  rainfall: 80 + Math.sin(i * 0.6) * 50 + Math.random() * 20,
  evaporation: 55 + Math.sin(i * 0.4) * 30 + Math.random() * 15,
}))

const droughtData = [
  { region: 'Sub-Saharan Africa', index: 0.78 },
  { region: 'Australian Outback', index: 0.71 },
  { region: 'Middle East', index: 0.68 },
  { region: 'Southwest USA', index: 0.54 },
  { region: 'South Asia', index: 0.47 },
  { region: 'Mediterranean', index: 0.39 },
  { region: 'South America', index: 0.31 },
]

const projections = [
  { year: '2025', safe: 4.2, stress: 2.1, critical: 0.8 },
  { year: '2030', safe: 3.8, stress: 2.5, critical: 1.1 },
  { year: '2035', safe: 3.4, stress: 2.8, critical: 1.4 },
  { year: '2040', safe: 3.1, stress: 2.9, critical: 1.7 },
  { year: '2050', safe: 2.6, stress: 3.1, critical: 2.1 },
]

export function ClimatePage() {
  const { data } = useQuery({
    queryKey: ['climate-global'],
    queryFn: async () => {
      try { const r = await climateApi.global(); const d = r.data; return d?.avg_temperature_c != null ? d : mockGlobalClimate }
      catch { return mockGlobalClimate }
    },
    refetchInterval: 60000,
  })
  const climate = data ?? mockGlobalClimate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><CloudSun className="w-5 h-5 text-blue-400" /> Climate Intelligence</h1>
        <p className="text-sm text-slate-500 mt-0.5">Global climate analysis · Impact on water resources · AI projections</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Avg Global Temp', value: `${climate.avg_temperature_c}°C`, icon: Thermometer, status: 'warning' as const },
          { title: 'Temp Anomaly', value: `+${climate.temperature_anomaly_c}°C`, icon: Sun, status: 'warning' as const },
          { title: 'Global Rainfall', value: `${climate.global_rainfall_mm}mm`, icon: CloudRain, status: 'info' as const },
          { title: 'Heat Stress Nations', value: climate.heat_stress_countries, icon: Wind, status: 'critical' as const },
        ].map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Drought Index</p>
          <p className="text-3xl font-bold text-amber-400">{climate.drought_index}</p>
          <p className="text-[10px] text-slate-500 mt-1">0=none · 1=severe</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Sea Level Rise</p>
          <p className="text-3xl font-bold text-blue-400">+{climate.sea_level_rise_mm}mm</p>
          <p className="text-[10px] text-slate-500 mt-1">Per year</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ice Coverage</p>
          <p className="text-3xl font-bold text-cyan-400">{climate.ice_coverage_pct}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Polar coverage</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">CO₂ Concentration</p>
          <p className="text-3xl font-bold text-orange-400">{climate.co2_ppm}</p>
          <p className="text-[10px] text-slate-500 mt-1">ppm</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Global Temperature Trend (°C)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={tempTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} name="Temperature °C" />
              <Line type="monotone" dataKey="anomaly" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Anomaly °C" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Rainfall vs Evaporation (mm)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={rainfallData}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="evapoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="rainfall" stroke="#3B82F6" fill="url(#rainGrad)" strokeWidth={2} name="Rainfall mm" />
              <Area type="monotone" dataKey="evaporation" stroke="#F59E0B" fill="url(#evapoGrad)" strokeWidth={2} name="Evaporation mm" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Regional Drought Index</h3>
          <div className="space-y-3">
            {droughtData.map((d) => (
              <div key={d.region} className="flex items-center gap-3">
                <p className="text-xs text-slate-400 w-40 shrink-0">{d.region}</p>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${d.index * 100}%`,
                    backgroundColor: d.index > 0.6 ? '#EF4444' : d.index > 0.4 ? '#F59E0B' : '#10B981'
                  }} />
                </div>
                <span className="text-xs font-bold text-white w-8 text-right">{d.index}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Global Water Security Projections (Bn people)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={projections} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="safe" stackId="a" fill="#10B981" name="Water Secure" />
              <Bar dataKey="stress" stackId="a" fill="#F59E0B" name="Water Stress" />
              <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Water Crisis" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Climate Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">88%</span></div>
        <p className="text-xs text-slate-400 mb-2">Climate Agent analysis predicts 23% increase in drought-affected regions by 2030. Temperature anomalies of +1.4°C are accelerating glacial melt, threatening freshwater supply for 2.1B people in mountain-dependent river basins.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Climate Agent', 'Seasonal Prediction Agent', 'Drought Analysis Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['forecastClimate()', 'analyzeDrought()', 'predictGlacialMelt()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
