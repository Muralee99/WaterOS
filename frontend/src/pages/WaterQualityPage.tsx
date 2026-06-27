import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { waterQualityApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'
import type { WaterQualityReading } from '@/types'

const MOCK_QUALITY: WaterQualityReading[] = [
  { id: '1', location: 'Mumbai — Bhandup WTP',          latitude: 19.17, longitude: 72.94, ph: 7.2,  turbidity_ntu: 1.8,  chlorine_mg_l: 0.8, dissolved_oxygen: 7.4, safety_score: 92, status: 'safe',    last_updated: '2 min ago' },
  { id: '2', location: 'Delhi — Sonia Vihar WTP',       latitude: 28.73, longitude: 77.27, ph: 8.1,  turbidity_ntu: 6.4,  chlorine_mg_l: 0.4, dissolved_oxygen: 5.8, safety_score: 61, status: 'warning', last_updated: '5 min ago' },
  { id: '3', location: 'Guwahati — Brahmaputra Intake', latitude: 26.18, longitude: 91.73, ph: 7.8,  turbidity_ntu: 12.1, chlorine_mg_l: 0.2, dissolved_oxygen: 4.9, safety_score: 44, status: 'unsafe',  last_updated: '8 min ago' },
  { id: '4', location: 'Jaipur — Bisalpur WTP',         latitude: 26.91, longitude: 75.79, ph: 7.5,  turbidity_ntu: 2.1,  chlorine_mg_l: 1.1, dissolved_oxygen: 7.1, safety_score: 88, status: 'safe',    last_updated: '3 min ago' },
  { id: '5', location: 'Houston — Lake Houston WTP',    latitude: 29.97, longitude: -95.1, ph: 7.1,  turbidity_ntu: 0.9,  chlorine_mg_l: 1.4, dissolved_oxygen: 8.2, safety_score: 96, status: 'safe',    last_updated: '1 min ago' },
  { id: '6', location: 'Los Angeles — Jensen WTP',      latitude: 34.07, longitude: -118.3,ph: 7.4,  turbidity_ntu: 1.2,  chlorine_mg_l: 1.2, dissolved_oxygen: 7.9, safety_score: 94, status: 'safe',    last_updated: '4 min ago' },
  { id: '7', location: 'Munich — Mangfall WTP',         latitude: 48.14, longitude: 11.58, ph: 7.0,  turbidity_ntu: 0.4,  chlorine_mg_l: 0.5, dissolved_oxygen: 9.1, safety_score: 98, status: 'safe',    last_updated: '2 min ago' },
  { id: '8', location: 'Cairo — El-Salam WTP',          latitude: 30.06, longitude: 31.24, ph: 7.9,  turbidity_ntu: 4.8,  chlorine_mg_l: 0.6, dissolved_oxygen: 6.2, safety_score: 72, status: 'warning', last_updated: '10 min ago' },
]

function StatusIcon({ status }: { status: string }) {
  if (status === 'safe') return <CheckCircle className="w-4 h-4 text-emerald-400" />
  if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />
  return <XCircle className="w-4 h-4 text-red-400" />
}

export function WaterQualityPage() {
  const { data: apiData } = useQuery({
    queryKey: ['water-quality'],
    queryFn: () => waterQualityApi.list().then((r) => r.data),
    retry: false,
  })

  const readings: WaterQualityReading[] = (Array.isArray(apiData) && apiData.length > 0) ? apiData : MOCK_QUALITY
  const avgScore = readings.reduce((s, r) => s + r.safety_score, 0) / readings.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Water Quality Monitoring</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI analysis of pH, turbidity, chlorine, heavy metals, and more</p>
      </div>

      {/* Overall score */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={avgScore > 80 ? '#10B981' : avgScore > 60 ? '#F59E0B' : '#EF4444'}
                strokeWidth="10"
                strokeDasharray={`${(avgScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{avgScore?.toFixed(0)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Overall Water Safety Score</h2>
            <p className={cn('text-sm font-medium mt-1', avgScore > 80 ? 'text-emerald-400' : avgScore > 60 ? 'text-amber-400' : 'text-red-400')}>
              {avgScore > 80 ? 'Safe for consumption' : avgScore > 60 ? 'Caution advised' : 'Unsafe — treatment required'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Based on WHO drinking water standards · {readings.length} monitoring stations</p>
          </div>
        </div>
      </GlassCard>

      {/* Station cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {readings.map((r: WaterQualityReading, i: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">{r.location}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Station {r.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={r.status} />
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                      r.status === 'safe' ? 'bg-emerald-500/15 text-emerald-400' :
                      r.status === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    )}>
                      {r.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'pH', value: r.ph, unit: '', safe: r.ph >= 6.5 && r.ph <= 8.5 },
                    { label: 'Turbidity', value: r.turbidity_ntu, unit: 'NTU', safe: r.turbidity_ntu <= 4 },
                    { label: 'Chlorine', value: r.chlorine_mg_l, unit: 'mg/L', safe: r.chlorine_mg_l >= 0.2 && r.chlorine_mg_l <= 2 },
                    { label: 'DO', value: r.dissolved_oxygen, unit: 'mg/L', safe: r.dissolved_oxygen >= 6 },
                    { label: 'Safety', value: r.safety_score, unit: '%', safe: r.safety_score >= 80 },
                  ].map((param) => (
                    <div key={param.label} className="bg-white/3 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500 mb-0.5">{param.label}</p>
                      <p className={cn('text-sm font-bold', param.safe ? 'text-emerald-400' : 'text-amber-400')}>
                        {param.value} <span className="text-[10px] font-normal text-slate-500">{param.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
        ))}
      </div>
    </div>
  )
}
