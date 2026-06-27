import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Globe, Flag, Map, Building2, Waves, Droplets,
  Radio, FlaskConical, CloudSun, TrendingUp, Bot, Network, Share2,
  Layers, Play, Bell, FileText, Settings, LogOut, GitCommit, Cpu, Activity
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/global', icon: Globe, label: 'Global Intelligence' },
    ],
  },
  {
    label: 'GEOGRAPHY',
    items: [
      { path: '/countries', icon: Flag, label: 'Countries' },
      { path: '/states', icon: Map, label: 'States' },
      { path: '/cities', icon: Building2, label: 'Cities' },
      { path: '/rivers', icon: Waves, label: 'River Basins' },
      { path: '/reservoirs', icon: Droplets, label: 'Reservoirs' },
      { path: '/pipelines', icon: GitCommit, label: 'Pipelines' },
      { path: '/sensors', icon: Radio, label: 'Sensors' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { path: '/water-quality', icon: FlaskConical, label: 'Water Quality' },
      { path: '/climate', icon: CloudSun, label: 'Climate' },
      { path: '/forecast', icon: TrendingUp, label: 'Forecast' },
    ],
  },
  {
    label: 'AI SYSTEMS',
    items: [
      { path: '/agents', icon: Bot, label: 'Agent Console' },
      { path: '/observability', icon: Activity, label: 'Observability' },
      { path: '/workflow', icon: Network, label: 'AI Collaboration' },
      { path: '/knowledge-graph', icon: Share2, label: 'Knowledge Graph' },
      { path: '/digital-twin', icon: Cpu, label: 'Digital Twin' },
      { path: '/simulation', icon: Play, label: 'Simulation' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { path: '/alerts', icon: Bell, label: 'Alerts', badge: 3 },
      { path: '/reports', icon: FileText, label: 'Reports' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export function Sidebar() {
  const { logout, user } = useAuthStore()
  const location = useLocation()

  return (
    <div className="w-64 h-screen flex flex-col bg-[#080d14] border-r border-white/5 shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center glow-blue shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">WaterOS</h1>
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-semibold">v2.0</span>
            </div>
            <p className="text-[10px] text-blue-400/60 uppercase tracking-widest">AI Water Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                return (
                  <NavLink key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.1 }}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all duration-150',
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      )}
                    >
                      <item.icon className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-blue-400' : '')} />
                      <span className="font-medium flex-1">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className="text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="w-1 h-1 rounded-full bg-blue-400 shrink-0"
                        />
                      )}
                    </motion.div>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.full_name ?? user?.username ?? 'Admin'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}
