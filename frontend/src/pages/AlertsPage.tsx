import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, MapPin, Shield } from 'lucide-react'
import { alertApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import type { Alert } from '@/types'

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
  high: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  warning: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
}

export function AlertsPage() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertApi.list().then((r) => r.data),
    refetchInterval: 15000,
  })

  const activeAlerts = (alerts ?? []).filter((a: Alert) => a.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Alerts & Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time AI-generated water incident alerts</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-red-400">{activeAlerts.length} active alerts</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: activeAlerts.filter((a: Alert) => a.severity === 'critical').length, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'High', count: activeAlerts.filter((a: Alert) => a.severity === 'high').length, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Warning', count: activeAlerts.filter((a: Alert) => a.severity === 'warning').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Active Total', count: activeAlerts.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((s) => (
          <GlassCard key={s.label} className={cn('p-4', s.bg)}>
            <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="glass rounded-xl h-24 animate-pulse" />)}
          </div>
        ) : activeAlerts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-medium">No active alerts</p>
            <p className="text-slate-500 text-sm mt-1">All water systems operating normally</p>
          </GlassCard>
        ) : (
          activeAlerts.map((alert: Alert, i: number) => {
            const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard hover className={cn('p-4 border', config.border, config.bg)}>
                  <div className="flex items-start gap-4">
                    <div className={cn('p-2 rounded-lg bg-white/5 mt-0.5')}>
                      <AlertTriangle className={cn('w-4 h-4', config.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize font-medium bg-white/5', config.text)}>
                          {alert.severity}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 capitalize">
                          {alert.alert_type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.created_at ? formatDistanceToNow(new Date(alert.created_at), { addSuffix: true }) : 'Just now'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {alert.confidence ? `${(alert.confidence * 100).toFixed(0)}% confidence` : 'AI detected'}
                        </span>
                      </div>
                    </div>
                    <button className="shrink-0 px-3 py-1.5 glass rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                      Acknowledge
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
