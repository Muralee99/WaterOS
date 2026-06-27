import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, MapPin, Shield, Bell } from 'lucide-react'
import { alertApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'
import type { Alert } from '@/types'

const MOCK_ALERTS: Alert[] = [
  { id: '1', title: 'Brahmaputra CRITICAL Flood Alert',         message: 'River at 7.2m — 1.2m above flood threshold. Crest 7.8–8.1m expected in 6 hours. Mandatory evacuation for 240,000 residents in 4 Assam districts.', severity: 'critical', alert_type: 'flood',        location: 'Assam, India',        is_active: true, confidence: 0.96, created_at: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: '2', title: 'Bay of Bengal Cyclone Warning',            message: 'Low-pressure system 14°N 89°E tracking NE at 18 km/h. 61% landfall probability within 72 hours. Fishermen must not enter sea.', severity: 'critical', alert_type: 'cyclone',      location: 'Bay of Bengal',       is_active: true, confidence: 0.88, created_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: '3', title: 'Rajasthan Drought Emergency D3',           message: 'Bisalpur reservoir at 41.3% — 38 days of supply remaining. Groundwater at record 42m depth. Water rationing activated in 12 districts.', severity: 'critical', alert_type: 'drought',      location: 'Rajasthan, India',    is_active: true, confidence: 0.94, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '4', title: 'Hirakud Reservoir High Overflow Risk',     message: 'Fill level 91.2% (7,420 MCM). Inflow 480 m³/s exceeds outflow 320 m³/s. Controlled release protocol activated. Alert downstream communities.', severity: 'high',     alert_type: 'reservoir',    location: 'Odisha, India',       is_active: true, confidence: 0.91, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '5', title: 'Guwahati Water Quality Unsafe',            message: 'Brahmaputra intake turbidity 12.1 NTU (WHO limit 4 NTU) — flood runoff contamination. Safety score 44%. Boil-water advisory for 380,000 residents.', severity: 'high',     alert_type: 'quality',      location: 'Guwahati, Assam',     is_active: true, confidence: 0.89, created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: '6', title: 'Lake Mead Storage Critical Low',           message: 'Storage at 38% capacity — lowest since filling. At current deficit rate, compact water deliveries at risk. Tier 2 restrictions in effect.', severity: 'high',     alert_type: 'drought',      location: 'Nevada/Arizona, USA', is_active: true, confidence: 0.92, created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: '7', title: 'Delhi Water Supply Deficit',               message: 'Yamuna WQI 51 — borderline safe. 631 active leak zones losing 920 MLD daily. 12 zones on alternate-day supply schedule.', severity: 'warning',  alert_type: 'infrastructure', location: 'Delhi, India',        is_active: true, confidence: 0.84, created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '8', title: 'Queensland Reservoir Critically Low',      message: 'Wivenhoe Dam at 18.4% capacity. At current rate, Brisbane water security risk in 142 days. Stage 4 water restrictions recommended.', severity: 'warning',  alert_type: 'drought',      location: 'Queensland, Australia',is_active: true, confidence: 0.87, created_at: new Date(Date.now() - 10 * 3600000).toISOString() },
]

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
  high: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  warning: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
}

export function AlertsPage() {
  const { data: apiData } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertApi.list().then((r) => r.data),
    retry: false,
  })

  const allAlerts: Alert[] = (Array.isArray(apiData) && apiData.length > 0) ? apiData : MOCK_ALERTS
  const activeAlerts = allAlerts.filter((a: Alert) => a.is_active)

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
        {activeAlerts.length === 0 ? (
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
                          {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
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
