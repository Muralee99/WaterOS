import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { forecastApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { CloudRain, Thermometer, Wind, Droplets } from 'lucide-react'

const MOCK_FORECAST = {
  days: 7,
  temperature:   [34.2, 33.8, 36.1, 38.4, 37.9, 35.2, 33.6],
  rainfall_mm:   [92,   87,  124,   78,   68,   84,   57 ],
  humidity_pct:  [78,   82,   91,   74,   69,   76,   80 ],
  storm_probability: 78,
  drought_risk: 'medium',
}

export function ForecastPage() {
  const { data: apiData } = useQuery({
    queryKey: ['forecast'],
    queryFn: () => forecastApi.get('India', 7).then((r) => r.data),
    retry: false,
  })

  const forecast = apiData ?? MOCK_FORECAST

  const chartData = forecast
    ? Array.from({ length: forecast.days }, (_, i) => ({
        day: `Day ${i + 1}`,
        temp: forecast.temperature[i],
        rain: forecast.rainfall_mm[i],
        humidity: forecast.humidity_pct[i],
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Climate & Forecast</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-powered rainfall, temperature and drought predictions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Storm Probability', value: `${forecast?.storm_probability ?? 0}%`, icon: CloudRain, color: 'text-blue-400' },
          { label: 'Drought Risk', value: forecast?.drought_risk ?? 'low', icon: Droplets, color: 'text-amber-400' },
          { label: 'Avg Temperature', value: `${(forecast?.temperature?.reduce((s: number, v: number) => s + v, 0) / 7 || 0).toFixed(1)}°C`, icon: Thermometer, color: 'text-orange-400' },
          { label: 'Total Rainfall', value: `${(forecast?.rainfall_mm?.reduce((s: number, v: number) => s + v, 0) || 0).toFixed(0)}mm`, icon: Wind, color: 'text-cyan-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard hover className="p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-lg font-bold text-white capitalize">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">7-Day Rainfall Forecast (mm)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="rain" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line type="monotone" dataKey="rain" stroke="#06B6D4" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Temperature & Humidity Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="temp" stroke="#F59E0B" fill="url(#tempGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="humidity" stroke="#06B6D4" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  )
}
