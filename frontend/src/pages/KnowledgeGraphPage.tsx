import { useCallback, useEffect, useState } from 'react'
import { Share2, Brain, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

interface Node {
  id: string; label: string; type: string; x: number; y: number
}

interface Edge {
  from: string; to: string; label: string
}

const GRAPH_NODES: Node[] = [
  { id: 'global', label: 'Global Coordinator', type: 'agent', x: 400, y: 50 },
  { id: 'climate', label: 'Climate Agent', type: 'agent', x: 150, y: 160 },
  { id: 'rainfall', label: 'Rainfall Agent', type: 'agent', x: 650, y: 160 },
  { id: 'flood', label: 'Flood Agent', type: 'agent', x: 80, y: 300 },
  { id: 'reservoir', label: 'Reservoir Agent', type: 'agent', x: 280, y: 300 },
  { id: 'quality', label: 'Water Quality', type: 'agent', x: 530, y: 300 },
  { id: 'sensor', label: 'Sensor Intel', type: 'agent', x: 720, y: 300 },
  { id: 'india', label: 'India', type: 'country', x: 150, y: 440 },
  { id: 'china', label: 'China', type: 'country', x: 330, y: 440 },
  { id: 'usa', label: 'United States', type: 'country', x: 510, y: 440 },
  { id: 'egypt', label: 'Egypt', type: 'country', x: 690, y: 440 },
  { id: 'ganges', label: 'Ganges Basin', type: 'entity', x: 100, y: 570 },
  { id: 'yangtze', label: 'Yangtze Basin', type: 'entity', x: 290, y: 570 },
  { id: 'nile', label: 'Nile Basin', type: 'entity', x: 640, y: 570 },
]

const GRAPH_EDGES: Edge[] = [
  { from: 'global', to: 'climate', label: 'delegates' },
  { from: 'global', to: 'rainfall', label: 'delegates' },
  { from: 'climate', to: 'flood', label: 'informs' },
  { from: 'climate', to: 'reservoir', label: 'informs' },
  { from: 'rainfall', to: 'quality', label: 'informs' },
  { from: 'rainfall', to: 'sensor', label: 'feeds' },
  { from: 'flood', to: 'india', label: 'monitors' },
  { from: 'reservoir', to: 'india', label: 'monitors' },
  { from: 'reservoir', to: 'china', label: 'monitors' },
  { from: 'quality', to: 'usa', label: 'monitors' },
  { from: 'sensor', to: 'egypt', label: 'monitors' },
  { from: 'india', to: 'ganges', label: 'contains' },
  { from: 'china', to: 'yangtze', label: 'contains' },
  { from: 'egypt', to: 'nile', label: 'contains' },
]

const nodeColors: Record<string, { fill: string; stroke: string; text: string }> = {
  agent: { fill: 'rgba(59,130,246,0.15)', stroke: '#3B82F6', text: '#93C5FD' },
  country: { fill: 'rgba(16,185,129,0.15)', stroke: '#10B981', text: '#6EE7B7' },
  entity: { fill: 'rgba(139,92,246,0.15)', stroke: '#8B5CF6', text: '#C4B5FD' },
}

const LEGEND = [
  { type: 'agent', label: 'AI Agents', color: '#3B82F6' },
  { type: 'country', label: 'Countries', color: '#10B981' },
  { type: 'entity', label: 'Basins / Entities', color: '#8B5CF6' },
]

export function KnowledgeGraphPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(i => i + 1), 3000)
    return () => clearInterval(t)
  }, [])

  const activeEdgeIndex = tick % GRAPH_EDGES.length
  const selectedNode = GRAPH_NODES.find(n => n.id === selected)

  const getNodePos = useCallback((id: string) => GRAPH_NODES.find(n => n.id === id), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Share2 className="w-5 h-5 text-blue-400" /> Knowledge Graph</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI agent relationships · Water entities · Real-time reasoning paths</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.min(s + 0.1, 1.8))} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setScale(s => Math.max(s - 0.1, 0.4))} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => setTick(0)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <GlassCard className="p-4">
            <div className="overflow-auto" style={{ height: 640 }}>
              <svg
                width={800 * scale}
                height={640 * scale}
                viewBox="0 0 800 640"
                style={{ display: 'block', width: 800 * scale, height: 640 * scale }}
              >
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.2)" />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="#3B82F6" />
                  </marker>
                </defs>

                {/* Edges */}
                {GRAPH_EDGES.map((edge, i) => {
                  const from = getNodePos(edge.from)
                  const to = getNodePos(edge.to)
                  if (!from || !to) return null
                  const isActive = i === activeEdgeIndex
                  const midX = (from.x + to.x) / 2
                  const midY = (from.y + to.y) / 2
                  return (
                    <g key={`${edge.from}-${edge.to}`}>
                      <line
                        x1={from.x} y1={from.y + 18} x2={to.x} y2={to.y - 18}
                        stroke={isActive ? '#3B82F6' : 'rgba(255,255,255,0.08)'}
                        strokeWidth={isActive ? 2 : 1}
                        markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                        strokeDasharray={isActive ? '8 4' : '0'}
                      />
                      {isActive && (
                        <text x={midX + 4} y={midY} fill="#3B82F6" fontSize="9" textAnchor="middle" dy="-3">{edge.label}</text>
                      )}
                    </g>
                  )
                })}

                {/* Nodes */}
                {GRAPH_NODES.map(node => {
                  const c = nodeColors[node.type]
                  const isSelected = selected === node.id
                  const labelWidth = Math.max(node.label.length * 6.5, 80)
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x - labelWidth / 2}, ${node.y - 16})`}
                      onClick={() => setSelected(isSelected ? null : node.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        width={labelWidth}
                        height={32}
                        rx={8}
                        fill={c.fill}
                        stroke={isSelected ? '#fff' : c.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x={labelWidth / 2}
                        y={20}
                        textAnchor="middle"
                        fill={c.text}
                        fontSize="10"
                        fontWeight="500"
                      >
                        {node.label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-4">
            <h3 className="text-xs font-semibold text-white mb-3">Legend</h3>
            <div className="space-y-2">
              {LEGEND.map(l => (
                <div key={l.type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color + '30', border: `1px solid ${l.color}` }} />
                  <span className="text-xs text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] text-slate-500">Animated edges show active reasoning paths between AI agents</p>
            </div>
          </GlassCard>

          {selectedNode && (
            <GlassCard className="p-4" glow="blue">
              <h3 className="text-xs font-semibold text-white mb-2">Selected Node</h3>
              <p className="text-sm font-bold text-blue-400">{selectedNode.label}</p>
              <p className="text-[10px] text-slate-500 capitalize mb-3">{selectedNode.type}</p>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500">Connections:</p>
                {GRAPH_EDGES.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((e, i) => (
                  <div key={i} className="text-[10px] text-slate-400">
                    <span className="text-blue-400">{e.from === selectedNode.id ? e.to : e.from}</span>
                    <span className="text-slate-600 mx-1">·</span>
                    {e.label}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <h3 className="text-xs font-semibold text-white mb-2">Graph Stats</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Nodes</span><span className="text-white">{GRAPH_NODES.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Edges</span><span className="text-white">{GRAPH_EDGES.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">AI Agents</span><span className="text-blue-400">{GRAPH_NODES.filter(n => n.type === 'agent').length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Countries</span><span className="text-emerald-400">{GRAPH_NODES.filter(n => n.type === 'country').length}</span></div>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">90%</span></div>
        <p className="text-xs text-slate-400 mb-2">Knowledge Graph contains 847 entities and 2,341 relationships. Vector search enables semantic queries across historical water data. AI agents use graph traversal to identify cascading water stress patterns across political boundaries.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Knowledge Graph Agent', 'Semantic Search Agent', 'Pattern Recognition Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['searchKnowledge()', 'traverseGraph()', 'findPatterns()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
