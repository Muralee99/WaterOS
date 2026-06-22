import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Settings, Key, Bot, Users, Shield, Database } from 'lucide-react'

export function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">System configuration and API management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Google Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Model Selection</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* API Keys */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Key className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">API Keys</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">Your API Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey || 'wateros_sk_xxxxxxxxxxxxx'}
                  readOnly
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none"
                />
                <button className="px-3 py-2 glass rounded-xl text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">
                  Copy
                </button>
              </div>
            </div>
            <button className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:border-blue-500/30 hover:text-blue-400 transition-colors">
              + Generate New API Key
            </button>
          </div>
        </GlassCard>

        {/* Database */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Database Status</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: 'PostgreSQL', status: 'connected', detail: 'Primary database · 5 tables' },
              { name: 'Redis', status: 'connected', detail: 'Cache & sessions' },
              { name: 'Qdrant', status: 'connected', detail: 'Vector memory · 1,247 embeddings' },
              { name: 'Kafka', status: 'connected', detail: 'Event streaming · 6 topics' },
            ].map((db) => (
              <div key={db.name} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{db.name}</p>
                  <p className="text-xs text-slate-500">{db.detail}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {db.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Security</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'JWT Authentication', enabled: true },
              { label: 'Rate Limiting', enabled: true },
              { label: 'Prompt Injection Detection', enabled: true },
              { label: 'Audit Logging', enabled: true },
              { label: 'API Key Auth', enabled: true },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{feature.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${feature.enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                  {feature.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
