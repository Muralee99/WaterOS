import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Waves, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { reservoirApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/utils/cn'
import type { Reservoir } from '@/types'

const RISK_COLORS = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' }
const RISK_BG = { low: 'bg-emerald-500/10', medium: 'bg-amber-500/10', high: 'bg-orange-500/10', critical: 'bg-red-500/10' }

export function ReservoirsPage() {
  const { data: reservoirs, isLoading } = useQuery({
    queryKey: ['reservoirs'],
    queryFn: () => reservoirApi.list().then((r) => r.data),
    refetchInterval: 60000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Reservoir Intelligence</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-powered monitoring and optimization of water storage</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(reservoirs ?? []).map((r: Reservoir, i: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{r.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.location}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full capitalize font-medium',
                    RISK_BG[r.overflow_risk as keyof typeof RISK_BG],
                    RISK_COLORS[r.overflow_risk as keyof typeof RISK_COLORS]
                  )}>
                    {r.overflow_risk} risk
                  </span>
                </div>

                {/* Fill gauge */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Fill Level</span>
                    <span className="text-white font-bold">{r.fill_percentage?.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.fill_percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: r.fill_percentage > 85 ? 'linear-gradient(90deg, #EF4444, #F97316)' :
                                    r.fill_percentage > 70 ? 'linear-gradient(90deg, #F59E0B, #EAB308)' :
                                    'linear-gradient(90deg, #3B82F6, #06B6D4)',
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/3 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-slate-500">Inflow</span>
                    </div>
                    <p className="text-sm font-bold text-white">{r.inflow_rate} <span className="text-xs text-slate-500">m³/s</span></p>
                  </div>
                  <div className="bg-white/3 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingDown className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-slate-500">Outflow</span>
                    </div>
                    <p className="text-sm font-bold text-white">{r.outflow_rate} <span className="text-xs text-slate-500">m³/s</span></p>
                  </div>
                </div>

                {/* Mini sparkline */}
                {r.history && (
                  <ResponsiveContainer width="100%" height={50}>
                    <AreaChart data={r.history.slice(-10).map((v: number, i: number) => ({ i, v }))}>
                      <defs>
                        <linearGradient id={`g${r.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#3B82F6" fill={`url(#g${r.id})`} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                <div className="flex items-center gap-1.5 mt-2">
                  <Waves className="w-3 h-3 text-blue-400" />
                  <p className="text-xs text-slate-500">
                    {r.current_level_mcm?.toFixed(0)} / {r.capacity_mcm} MCM
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
