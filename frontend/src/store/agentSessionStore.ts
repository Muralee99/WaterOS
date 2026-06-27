import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentResult } from '@/types'

export interface AgentSession {
  id: string
  agentId: string
  agentName: string
  context: Record<string, unknown>
  result: AgentResult
  startedAt: string
  completedAt: string
  latency_ms: number
  status: 'completed' | 'failed'
  tools_called: string[]
}

export interface PersistedChatMessage {
  role: string
  content: string
  timestamp: string
  metadata?: unknown
}

interface AgentSessionStore {
  sessions: AgentSession[]
  chatHistory: PersistedChatMessage[]
  sessionId: string
  addSession: (session: AgentSession) => void
  clearSessions: () => void
  addChatMessage: (msg: PersistedChatMessage) => void
  clearChat: () => void
  resetSessionId: () => void
}

const newSessionId = () => `ses_${Date.now().toString(36)}`

export const useAgentSessionStore = create<AgentSessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      chatHistory: [],
      sessionId: newSessionId(),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 200),
        })),

      clearSessions: () => set({ sessions: [], sessionId: newSessionId() }),

      addChatMessage: (msg) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, msg].slice(-100),
        })),

      clearChat: () => set({ chatHistory: [] }),

      resetSessionId: () => set({ sessionId: newSessionId() }),
    }),
    { name: 'wateros-agent-sessions' }
  )
)
