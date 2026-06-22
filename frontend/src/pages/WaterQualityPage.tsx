import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Droplets, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { waterQualityApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { cn } from '@/utils/cn'
import type { WaterQualityReading } from '@/types'

function StatusIcon({ status }: { status: string }) {
  if (status === 'safe') return <CheckCircle className="w-4 h-4 text-emerald-400" />
  if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />
  return <XCircle className="w-4 h-4 text-red-400" />
}

export function WaterQualityPage() {
  const { data: readings, isLoading } = useQuery({
    queryKey: ['water-quality'],
    queryFn: () => waterQualityApi.list().then((r) => r.data),
    refetchInterval: 30000,
  })

  const avgScore = readings?.reduce((s: number, r: WaterQualityReading) => s + r.safety_score, 0) / (readings?.length || 1)

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
            <p className="text-xs text-slate-500 mt-1">Based on WHO drinking water standards · {readings?.length ?? 0} monitoring stations</p>
          </div>
        </div>
      </GlassCard>

      {/* Station cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="glass rounded-xl h-48 animate-pulse" />)
        ) : (
          (readings ?? []).map((r: WaterQualityReading, i: number) => (
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
          ))
        )}
      </div>
    </div>
  )
}
