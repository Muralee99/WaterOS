import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  status?: 'good' | 'warning' | 'critical' | 'info'
  iconColor?: string
  subtitle?: string
}

const statusColors = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
  info: 'text-blue-400',
}

const statusBg = {
  good: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
  critical: 'bg-red-500/10',
  info: 'bg-blue-500/10',
}

export function MetricCard({
  title, value, unit, icon: Icon, trend, trendValue, status = 'info', iconColor, subtitle
}: MetricCardProps) {
  return (
    <GlassCard hover className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trendValue && (
            <div className={cn('flex items-center gap-1 mt-1.5 text-xs',
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            )}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl', statusBg[status])}>
          <Icon className={cn('w-5 h-5', iconColor ?? statusColors[status])} />
        </div>
      </div>
    </GlassCard>
  )
}
