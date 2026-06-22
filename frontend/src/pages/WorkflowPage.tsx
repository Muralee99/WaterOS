import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node, Edge, addEdge, Connection, useNodesState, useEdgesState,
  Background, Controls, MiniMap, MarkerType, Handle, Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { Bot, Play, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { agentApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import toast from 'react-hot-toast'

const AGENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  rainfall_agent: { bg: '#1e3a8a', border: '#3B82F6', text: '#93C5FD' },
  reservoir_agent: { bg: '#164e63', border: '#06B6D4', text: '#67E8F9' },
  flood_agent: { bg: '#7f1d1d', border: '#EF4444', text: '#FCA5A5' },
  water_quality_agent: { bg: '#064e3b', border: '#10B981', text: '#6EE7B7' },
  leak_detection_agent: { bg: '#78350f', border: '#F59E0B', text: '#FCD34D' },
  emergency_agent: { bg: '#7f1d1d', border: '#DC2626', text: '#FCA5A5' },
  decision_agent: { bg: '#3b0764', border: '#8B5CF6', text: '#C4B5FD' },
}

function AgentNode({ data }: { data: { label: string; agentId: string; status: string; confidence?: number } }) {
  const colors = AGENT_COLORS[data.agentId] ?? AGENT_COLORS.rainfall_agent

  return (
    <div
      className="px-4 py-3 rounded-xl text-center min-w-[140px]"
      style={{
        background: `${colors.bg}cc`,
        border: `1.5px solid ${colors.border}60`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: colors.border, border: 'none', width: 8, height: 8 }} />
      <div className="flex items-center justify-center gap-2 mb-1">
        <Bot className="w-3.5 h-3.5" style={{ color: colors.text }} />
        {data.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" style={{ color: colors.text }} />}
        {data.status === 'completed' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
      </div>
      <p className="text-xs font-semibold" style={{ color: colors.text }}>{data.label}</p>
      {data.confidence && (
        <p className="text-[10px] mt-1" style={{ color: `${colors.text}80` }}>
          {(data.confidence * 100).toFixed(0)}% conf.
        </p>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: colors.border, border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes = { agentNode: AgentNode }

const INITIAL_NODES: Node[] = [
  { id: 'rainfall_agent', type: 'agentNode', position: { x: 80, y: 20 }, data: { label: 'Rainfall Agent', agentId: 'rainfall_agent', status: 'idle' } },
  { id: 'reservoir_agent', type: 'agentNode', position: { x: 320, y: 20 }, data: { label: 'Reservoir Agent', agentId: 'reservoir_agent', status: 'idle' } },
  { id: 'water_quality_agent', type: 'agentNode', position: { x: 560, y: 20 }, data: { label: 'Water Quality', agentId: 'water_quality_agent', status: 'idle' } },
  { id: 'flood_agent', type: 'agentNode', position: { x: 200, y: 160 }, data: { label: 'Flood Agent', agentId: 'flood_agent', status: 'idle' } },
  { id: 'leak_detection_agent', type: 'agentNode', position: { x: 460, y: 160 }, data: { label: 'Leak Detection', agentId: 'leak_detection_agent', status: 'idle' } },
  { id: 'emergency_agent', type: 'agentNode', position: { x: 330, y: 300 }, data: { label: 'Emergency Agent', agentId: 'emergency_agent', status: 'idle' } },
  { id: 'decision_agent', type: 'agentNode', position: { x: 330, y: 440 }, data: { label: 'Decision Agent', agentId: 'decision_agent', status: 'idle' } },
]

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'rainfall_agent', target: 'flood_agent', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#3B82F640', strokeWidth: 1.5 } },
  { id: 'e2', source: 'reservoir_agent', target: 'flood_agent', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#06B6D440', strokeWidth: 1.5 } },
  { id: 'e3', source: 'flood_agent', target: 'emergency_agent', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#EF444440', strokeWidth: 1.5 } },
  { id: 'e4', source: 'water_quality_agent', target: 'emergency_agent', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#10B98140', strokeWidth: 1.5 } },
  { id: 'e5', source: 'leak_detection_agent', target: 'emergency_agent', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#F59E0B40', strokeWidth: 1.5 } },
  { id: 'e6', source: 'emergency_agent', target: 'decision_agent', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#DC262640', strokeWidth: 2 } },
]

export function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  const updateNodeStatus = (agentId: string, status: string, confidence?: number) => {
    setNodes((nds) =>
      nds.map((n) => n.id === agentId ? { ...n, data: { ...n.data, status, confidence } } : n)
    )
  }

  const animateEdge = (edgeId: string, active: boolean) => {
    setEdges((eds) =>
      eds.map((e) => e.id === edgeId ? {
        ...e,
        animated: active,
        style: { ...e.style, stroke: active ? '#3B82F6' : `${e.style?.stroke?.substring(0, 7) ?? '#3B82F6'}40`, strokeWidth: active ? 2.5 : 1.5 }
      } : e)
    )
  }

  const runWorkflowMutation = useMutation({
    mutationFn: () => agentApi.run('decision_agent', {}).then((r) => r.data),
    onSuccess: (data) => {
      setIsExecuting(false)
      setExecutionLog((prev) => [...prev, `✓ Decision Agent completed (${data.latency_ms}ms, confidence: ${(data.confidence * 100).toFixed(0)}%)`])
      updateNodeStatus('decision_agent', 'completed', data.confidence)
      toast.success('Full agent workflow completed!')
    },
    onError: () => {
      setIsExecuting(false)
      toast.error('Workflow execution failed')
    },
  })

  const runWorkflow = async () => {
    setIsExecuting(true)
    setExecutionLog([])

    const sequence = [
      { id: 'rainfall_agent', edges: ['e1'], delay: 0 },
      { id: 'reservoir_agent', edges: ['e2'], delay: 800 },
      { id: 'water_quality_agent', edges: ['e4'], delay: 1200 },
      { id: 'flood_agent', edges: ['e3'], delay: 2000 },
      { id: 'leak_detection_agent', edges: ['e5'], delay: 2400 },
      { id: 'emergency_agent', edges: ['e6'], delay: 3500 },
      { id: 'decision_agent', edges: [], delay: 4800 },
    ]

    for (const step of sequence) {
      await new Promise((res) => setTimeout(res, step.delay === 0 ? 0 : step.delay - (sequence[sequence.indexOf(step) - 1]?.delay ?? 0)))
      updateNodeStatus(step.id, 'running')
      step.edges.forEach((eid) => animateEdge(eid, true))
      setExecutionLog((prev) => [...prev, `→ ${step.id.replace('_', ' ')} started`])
      await new Promise((res) => setTimeout(res, 600))
      updateNodeStatus(step.id, 'completed', Math.random() * 0.2 + 0.78)
      setExecutionLog((prev) => [...prev, `✓ ${step.id.replace('_', ' ')} completed`])
    }

    runWorkflowMutation.mutate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">AI Collaboration View</h1>
          <p className="text-sm text-slate-500">Visualize agent-to-agent communication and reasoning flow</p>
        </div>
        <button
          onClick={runWorkflow}
          disabled={isExecuting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isExecuting ? 'Executing...' : 'Run Full Workflow'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <GlassCard className="overflow-hidden" style={{ height: '520px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#1e293b" gap={20} size={1} />
              <Controls className="glass rounded-lg" />
              <MiniMap
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}
                nodeColor={(node) => AGENT_COLORS[node.id]?.border ?? '#3B82F6'}
              />
            </ReactFlow>
          </GlassCard>
        </div>

        <GlassCard className="p-4 flex flex-col h-[520px]">
          <h3 className="text-sm font-semibold text-white mb-3">Execution Log</h3>
          <div className="flex-1 overflow-y-auto space-y-1.5 font-mono">
            {executionLog.length === 0 && (
              <p className="text-xs text-slate-600 text-center mt-8">Run workflow to see execution log</p>
            )}
            {executionLog.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs px-2 py-1 rounded ${log.startsWith('→') ? 'text-blue-400 bg-blue-500/5' : 'text-emerald-400 bg-emerald-500/5'}`}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
