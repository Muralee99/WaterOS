import { create } from 'zustand'
import type { AgentResult, AgentInfo } from '@/types'

interface AgentStore {
  agents: AgentInfo[]
  executions: Record<string, AgentResult>
  activeAgentId: string | null
  isRunning: boolean
  setAgents: (agents: AgentInfo[]) => void
  setExecution: (agentId: string, result: AgentResult) => void
  setActiveAgent: (id: string | null) => void
  setRunning: (running: boolean) => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  executions: {},
  activeAgentId: null,
  isRunning: false,
  setAgents: (agents) => set({ agents }),
  setExecution: (agentId, result) =>
    set((state) => ({ executions: { ...state.executions, [agentId]: result } })),
  setActiveAgent: (id) => set({ activeAgentId: id }),
  setRunning: (running) => set({ isRunning: running }),
}))
