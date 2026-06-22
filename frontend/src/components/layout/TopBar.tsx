import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, MessageSquare, BellRing, Send, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { agentApi } from '@/services/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED = [
  'Show drought risk countries',
  'Predict reservoir overflow',
  'Explain flood risk increase',
]

const MOCK_RESPONSES: Record<string, string> = {
  default: 'Based on current sensor data and AI analysis, I can provide insights across 195 monitored countries. Our 14 active agents are processing real-time data streams. Would you like me to run a specific analysis?',
  drought: 'Currently 18 countries show elevated drought risk. Critical areas: India (Rajasthan), Australia (Queensland), Egypt (Nile Delta). The Climate Agent projects a 23% increase in water stress over the next 6 months based on rainfall deficit trends.',
  reservoir: 'Analyzing 12,840 reservoirs globally. 3 reservoirs show overflow risk within 72 hours: Hirakud (91% capacity, +8% inflow), Three Gorges (88% capacity), Aswan High (84% capacity). Recommend controlled release protocols.',
  flood: 'Flood risk has increased 34% in South Asia due to early monsoon onset. The Rainfall Agent detected 340mm precipitation anomaly in Bangladesh. Emergency Agent has issued pre-emptive alerts to 12 districts. Confidence: 87.3%.',
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('drought')) return MOCK_RESPONSES.drought
  if (lower.includes('reservoir') || lower.includes('overflow')) return MOCK_RESPONSES.reservoir
  if (lower.includes('flood')) return MOCK_RESPONSES.flood
  return MOCK_RESPONSES.default
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/global': 'Global Intelligence',
  '/countries': 'Countries',
  '/states': 'States',
  '/cities': 'Cities',
  '/rivers': 'River Basins',
  '/reservoirs': 'Reservoirs',
  '/pipelines': 'Pipelines',
  '/sensors': 'Sensors',
  '/water-quality': 'Water Quality',
  '/climate': 'Climate',
  '/forecast': 'Forecast',
  '/agents': 'Agent Console',
  '/workflow': 'AI Collaboration',
  '/knowledge-graph': 'Knowledge Graph',
  '/digital-twin': 'Digital Twin',
  '/simulation': 'Simulation',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function TopBar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const pageLabel = Object.entries(routeLabels).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] ?? 'WaterOS'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    try {
      const res = await agentApi.chat(text)
      const reply = res.data?.response ?? getMockResponse(text)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
      }, 800)
    } catch {
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, { role: 'assistant', content: getMockResponse(text), timestamp: new Date() }])
      }, 800)
    }
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.username?.[0]?.toUpperCase() ?? 'A'

  return (
    <>
      <div className="h-13 flex items-center justify-between px-5 border-b border-white/5 bg-[#080d14]/90 backdrop-blur-sm shrink-0" style={{ height: '52px' }}>
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xs">WaterOS</span>
          <span className="text-slate-700 text-xs">/</span>
          <span className="text-white text-xs font-semibold">{pageLabel}</span>
        </div>

        {/* Center: search */}
        <div className="flex-1 max-w-sm mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search countries, reservoirs, agents..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">All Systems Operational</span>
          </div>

          {/* AI Chat */}
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Chat</span>
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <BellRing className="w-4 h-4 text-slate-400" />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
          </button>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer">
            {initials}
          </div>
        </div>
      </div>

      {/* AI Chat Slide-over */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-96 bg-[#0d1117] border-l border-white/10 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">WaterOS AI Assistant</p>
                    <p className="text-[10px] text-slate-500">Powered by Gemini</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Suggested queries */}
              {messages.length === 0 && (
                <div className="p-4 border-b border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Suggested Queries</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-[11px] px-2.5 py-1 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/20 rounded-full text-blue-400 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                      msg.role === 'user'
                        ? 'bg-blue-600/30 border border-blue-500/30 text-white'
                        : 'bg-white/5 border border-white/10 text-slate-300'
                    }`}>
                      {msg.content}
                      <p className="text-[9px] text-slate-600 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                    placeholder="Ask about water systems..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
