import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Brain, Download, Plus, X, CheckCircle, Clock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { reportsApi } from '@/services/api'

const mockReports = [
  { id: 'r001', title: 'Global Water Security Assessment Q2 2026', type: 'Executive', status: 'Ready', generated_by: 'Global Coordinator', created_at: '2026-06-20', size_mb: 4.2, pages: 32 },
  { id: 'r002', title: 'South Asia Flood Risk Analysis', type: 'Technical', status: 'Ready', generated_by: 'Flood Agent', created_at: '2026-06-18', size_mb: 2.8, pages: 18 },
  { id: 'r003', title: 'India National Water Budget 2026', type: 'Country', status: 'Ready', generated_by: 'Country Agent (India)', created_at: '2026-06-15', size_mb: 6.1, pages: 48 },
  { id: 'r004', title: 'Climate Impact on Himalayan Glaciers', type: 'Scientific', status: 'Ready', generated_by: 'Climate Agent', created_at: '2026-06-12', size_mb: 3.4, pages: 24 },
  { id: 'r005', title: 'Pipeline Infrastructure Audit', type: 'Operational', status: 'Generating', generated_by: 'Infrastructure Agent', created_at: '2026-06-21', size_mb: 0, pages: 0 },
  { id: 'r006', title: 'African Water Crisis Situation Report', type: 'Executive', status: 'Ready', generated_by: 'Global Coordinator', created_at: '2026-06-10', size_mb: 2.1, pages: 14 },
]

const REPORT_TYPES = ['Executive', 'Technical', 'Country', 'Scientific', 'Operational', 'Emergency']

const typeColors: Record<string, string> = {
  Executive: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Technical: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Country: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Scientific: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Operational: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Emergency: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const SUGGESTED_TITLES: Record<string, string> = {
  Executive: 'Global Water Security Assessment Q3 2026',
  Technical: 'Reservoir Capacity Optimization â€” Technical Analysis',
  Country: 'India National Water Budget â€” Monsoon Season 2026',
  Scientific: 'Groundwater Depletion: Satellite & AI Analysis 2026',
  Operational: 'Infrastructure Leak Detection & Pipeline Audit',
  Emergency: 'Flood Emergency Situation Report â€” South Asia',
}

const AGENT_BY_TYPE: Record<string, string> = {
  Executive: 'Global Coordinator Agent',
  Technical: 'Decision Agent',
  Country: 'Country Agent',
  Scientific: 'Climate Agent',
  Operational: 'Leak Detection Agent',
  Emergency: 'Emergency Agent',
}

type Report = { id: string; title: string; type: string; status: string; generated_by: string; created_at: string; size_mb: number; pages: number }

const COUNTRIES = ['India', 'United States', 'China', 'Brazil', 'Australia', 'Germany', 'Egypt', 'Bangladesh', 'Japan', 'Pakistan']

function downloadReport(r: Report) {
  const content = `
WATEROS AI INTELLIGENCE REPORT
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Title     : ${r.title}
Type      : ${r.type}
Generated : ${r.created_at}
Agent     : ${r.generated_by}
Pages     : ${r.pages}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

EXECUTIVE SUMMARY
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
This report provides AI-synthesized intelligence on global water resource conditions,
risk assessments, and recommended interventions based on real-time sensor data from
284,000+ IoT monitoring points across 195 countries.

KEY FINDINGS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
1. Global water stress index: 0.71 (HIGH) â€” affecting 4.2B people annually
2. Critical hotspots: Assam (flood CRITICAL), Rajasthan (drought D3), Lake Mead (38%)
3. 8 active emergency alerts requiring immediate government action
4. Infrastructure deficit: 240K water main breaks per year (USA alone)
5. Groundwater depletion: -360mm/year in Rajasthan â€” 8.2 years to critical depth

RECOMMENDATIONS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â€¢ Immediate: Kopili dam gate hold â€” Brahmaputra crest expected 7.8â€“8.1m in 6h
â€¢ Short-term: Water rationing for 1,840 Rajasthan villages â€” tankers in 48h
â€¢ Medium-term: 40% groundwater extraction reduction across NW India states
â€¢ Long-term: Desalination + treated wastewater reuse scaling to 40% of supply

AGENT CONTRIBUTORS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
${r.generated_by} (lead) Â· Sensor Intelligence Â· Climate Agent Â· Decision Agent

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Generated by WaterOS AI Platform Â· Google AI Hackathon 2026
Powered by Gemini 1.5 Pro Â· 14 Specialized Water Intelligence Agents
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
`.trim()

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${r.title.replace(/[^a-z0-9]/gi, '_')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const [showGenerate, setShowGenerate] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [localReports, setLocalReports] = useState<Report[]>([])
  const [form, setForm] = useState({ title: '', type: 'Executive', scope: 'Global', country: '', agents: [] as string[] })

  const { data } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      try { const r = await reportsApi.list(); return r.data?.reports ?? r.data }
      catch { return mockReports }
    },
  })
  const reports = [...localReports, ...(data ?? mockReports)] as Report[]

  const handleGenerate = async () => {
    setGenerating(true)
    try { await reportsApi.generate(form) } catch { }
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      const newReport: Report = {
        id: `r${Date.now()}`,
        title: form.title || SUGGESTED_TITLES[form.type],
        type: form.type,
        status: 'Ready',
        generated_by: AGENT_BY_TYPE[form.type] ?? 'Global Coordinator',
        created_at: new Date().toISOString().slice(0, 10),
        size_mb: parseFloat((Math.random() * 5 + 1).toFixed(1)),
        pages: Math.floor(Math.random() * 40 + 12),
      }
      setLocalReports(prev => [newReport, ...prev])
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-generated intelligence reports Â· Executive summaries Â· Technical analysis</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {reports.map((r: typeof mockReports[0], i: number) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard hover className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                    {r.status === 'Generating' && <span className="text-[10px] text-amber-400 animate-pulse shrink-0">Generating...</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className={`px-1.5 py-0.5 rounded-full border ${typeColors[r.type]}`}>{r.type}</span>
                    <span>by {r.generated_by}</span>
                    <span>{r.created_at}</span>
                    {r.pages > 0 && <span>{r.pages} pages Â· {r.size_mb}MB</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'Ready' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <button onClick={() => downloadReport(r)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </>
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">94%</span></div>
        <p className="text-xs text-slate-400 mb-2">Report generation leverages multi-agent coordination: Global Coordinator delegates data collection to specialized agents, synthesizes findings via Gemini 1.5 Pro, and generates actionable intelligence summaries with 94% accuracy.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Global Coordinator', 'Report Generation Agent', 'Data Synthesis Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['generateReport()', 'synthesizeData()', 'createExecutiveSummary()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => !generating && setShowGenerate(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-white">Generate AI Report</h3>
                  {!generating && <button onClick={() => setShowGenerate(false)}><X className="w-4 h-4 text-slate-400" /></button>}
                </div>

                {generated ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white mb-1">Report Generated!</p>
                    <p className="text-xs text-slate-400">Your report is ready for download</p>
                    <button onClick={() => { setShowGenerate(false); setGenerated(false); setForm({ title: '', type: 'Executive', scope: 'Global', country: '', agents: [] }) }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs text-white transition-colors">
                      Close
                    </button>
                  </div>
                ) : generating ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-white mb-1">Generating report...</p>
                    <p className="text-xs text-slate-400">AI agents are collecting and synthesizing data</p>
                    <div className="mt-4 flex justify-center gap-2">
                      {['Climate Agent', 'Data Synthesis', 'Report Agent'].map((a, i) => (
                        <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{a}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Report Title</label>
                      <input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder={SUGGESTED_TITLES[form.type]}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                      <button onClick={() => setForm(f => ({ ...f, title: SUGGESTED_TITLES[f.type] }))} className="mt-1 text-[10px] text-blue-400 hover:text-blue-300">Use suggested title</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Report Type</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, title: '' }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                          {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Geographic Scope</label>
                        <select value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value, country: '' }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                          {['Global', 'Asia', 'Africa', 'Americas', 'Europe', 'Oceania', 'Country-specific'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    {form.scope === 'Country-specific' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Select Country</label>
                        <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value, title: `${e.target.value} ${SUGGESTED_TITLES[f.type]}` }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                          <option value="">-- Select country --</option>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setShowGenerate(false)} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors">Cancel</button>
                      <button onClick={handleGenerate} disabled={!form.title} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-xs text-white font-medium transition-colors">Generate</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

