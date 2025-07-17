import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Activity, RefreshCw, Zap, Users, BarChart3, AlertCircle, Settings } from 'lucide-react'
import { apiService } from '@/services/api'

interface AgentNode {
  id: string
  name: string
  type: string
  role: string
  status: string
  x?: number
  y?: number
  connections: number
}

interface CoordinationLink {
  source: string
  target: string
  type: string
  strength: number
  status: string
  performance_impact?: number
  recent: boolean
}

interface MatrixData {
  nodes: AgentNode[]
  links: CoordinationLink[]
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

export function AgentCoordinationMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<MatrixData>({
    nodes: [],
    links: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  })
  
  const [viewMode, setViewMode] = useState<'network' | 'matrix'>('network')
  const [timeRange, setTimeRange] = useState('6h')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadCoordinationData()
    
    if (autoRefresh) {
      const interval = setInterval(loadCoordinationData, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  useEffect(() => {
    if (viewMode === 'network' && data.nodes.length > 0) {
      drawNetworkVisualization()
    }
  }, [data, viewMode, selectedNode])

  const loadCoordinationData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      const [agentsResponse, coordinationResponse] = await Promise.all([
        apiService.getActiveAgents(),
        apiService.getAgentCoordination(timeRange)
      ])

      // Build nodes from active agents
      const nodes: AgentNode[] = (agentsResponse.agents || []).map((agent: any) => ({
        id: agent.agent_id,
        name: agent.agent_name || agent.agent_id,
        type: agent.agent_type || 'claude-code',
        role: agent.coordination_role || 'primary',
        status: agent.status || 'active',
        connections: 0
      }))

      // Build links from coordination events
      const links: CoordinationLink[] = []
      const connectionCounts = new Map<string, number>()

      ;(coordinationResponse.events || []).forEach((event: any) => {
        const source = event.primary_agent_id
        const target = event.secondary_agent_id
        
        // Count connections for each agent
        connectionCounts.set(source, (connectionCounts.get(source) || 0) + 1)
        connectionCounts.set(target, (connectionCounts.get(target) || 0) + 1)

        // Create link
        const recentThreshold = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
        const eventTime = new Date(event.start_time)
        
        links.push({
          source,
          target,
          type: event.coordination_type,
          strength: Math.abs(event.performance_impact || 0.5),
          status: event.status || 'active',
          performance_impact: event.performance_impact,
          recent: eventTime > recentThreshold
        })
      })

      // Update connection counts on nodes
      nodes.forEach(node => {
        node.connections = connectionCounts.get(node.id) || 0
      })

      setData({
        nodes,
        links,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to load coordination data:', error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }

  const drawNetworkVisualization = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const width = rect.width
    const height = rect.height

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    if (data.nodes.length === 0) {
      // Draw empty state
      ctx.fillStyle = '#9ca3af'
      ctx.font = '16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('No active agents', width / 2, height / 2)
      return
    }

    // Simple force layout positioning
    if (!data.nodes[0].x) {
      positionNodes(width, height)
    }

    // Draw links first (behind nodes)
    data.links.forEach(link => {
      const sourceNode = data.nodes.find(n => n.id === link.source)
      const targetNode = data.nodes.find(n => n.id === link.target)
      
      if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) return

      // Link style based on type and status
      ctx.strokeStyle = getLinkColor(link)
      ctx.lineWidth = link.recent ? 3 : 1
      ctx.setLineDash(link.status === 'active' ? [] : [5, 5])

      ctx.beginPath()
      ctx.moveTo(sourceNode.x, sourceNode.y)
      ctx.lineTo(targetNode.x, targetNode.y)
      ctx.stroke()

      // Draw arrow for direction
      drawArrow(ctx, sourceNode.x, sourceNode.y, targetNode.x, targetNode.y, getLinkColor(link))
    })

    // Draw nodes
    data.nodes.forEach(node => {
      if (!node.x || !node.y) return

      const isSelected = selectedNode === node.id
      const radius = 20 + (node.connections * 3)

      // Node background
      ctx.fillStyle = getNodeColor(node)
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
      ctx.fill()

      // Selection highlight
      if (isSelected) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Node border
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.stroke()

      // Node label
      ctx.fillStyle = '#374151'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(node.name.substring(0, 8), node.x, node.y + 4)

      // Connection count
      if (node.connections > 0) {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(node.x + radius - 5, node.y - radius + 5, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.fillStyle = '#ffffff'
        ctx.font = '10px system-ui'
        ctx.fillText(node.connections.toString(), node.x + radius - 5, node.y - radius + 8)
      }
    })
  }

  const positionNodes = (width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    data.nodes.forEach((node, index) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
    })
  }

  const getLinkColor = (link: CoordinationLink): string => {
    if (link.recent) return '#22c55e' // Green for recent
    
    switch (link.type) {
      case 'handoff': return '#3b82f6' // Blue
      case 'collaboration': return '#8b5cf6' // Purple  
      case 'resource_sharing': return '#f59e0b' // Amber
      case 'conflict_resolution': return '#ef4444' // Red
      default: return '#6b7280' // Gray
    }
  }

  const getNodeColor = (node: AgentNode): string => {
    switch (node.status) {
      case 'active': return '#22c55e' // Green
      case 'paused': return '#f59e0b' // Amber
      case 'completed': return '#3b82f6' // Blue
      case 'failed': return '#ef4444' // Red
      default: return '#6b7280' // Gray
    }
  }

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const headLength = 10
    const angle = Math.atan2(toY - fromY, toX - fromX)
    
    // Calculate arrow position (closer to target node)
    const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2)
    const arrowX = toX - Math.cos(angle) * 25 // 25px from node edge
    const arrowY = toY - Math.sin(angle) * 25

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(arrowX, arrowY)
    ctx.lineTo(
      arrowX - headLength * Math.cos(angle - Math.PI / 6),
      arrowY - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.lineTo(
      arrowX - headLength * Math.cos(angle + Math.PI / 6),
      arrowY - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.closePath()
    ctx.fill()
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked node
    const clickedNode = data.nodes.find(node => {
      if (!node.x || !node.y) return false
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      const radius = 20 + (node.connections * 3)
      return distance <= radius
    })

    setSelectedNode(clickedNode ? clickedNode.id : null)
  }

  const renderMatrixView = () => {
    const agentIds = data.nodes.map(n => n.id)
    const matrix = agentIds.map(sourceId => 
      agentIds.map(targetId => {
        const link = data.links.find(l => 
          (l.source === sourceId && l.target === targetId) ||
          (l.source === targetId && l.target === sourceId)
        )
        return link || null
      })
    )

    return (
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-secondary-300"></th>
              {agentIds.map(id => (
                <th key={id} className="p-2 border border-secondary-300 text-xs font-medium text-secondary-600">
                  {data.nodes.find(n => n.id === id)?.name.substring(0, 8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agentIds.map((sourceId, rowIndex) => (
              <tr key={sourceId}>
                <td className="p-2 border border-secondary-300 text-xs font-medium text-secondary-600">
                  {data.nodes.find(n => n.id === sourceId)?.name.substring(0, 8)}
                </td>
                {matrix[rowIndex].map((link, colIndex) => (
                  <td key={colIndex} className="p-1 border border-secondary-300 text-center">
                    {link ? (
                      <div 
                        className={`w-6 h-6 rounded mx-auto ${
                          link.recent ? 'bg-green-500' :
                          link.type === 'handoff' ? 'bg-blue-500' :
                          link.type === 'collaboration' ? 'bg-purple-500' :
                          link.type === 'resource_sharing' ? 'bg-amber-500' :
                          link.type === 'conflict_resolution' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        title={`${link.type} - ${link.status}`}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded mx-auto bg-gray-100" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const selectedNodeData = selectedNode ? data.nodes.find(n => n.id === selectedNode) : null
  const selectedNodeLinks = data.links.filter(l => l.source === selectedNode || l.target === selectedNode)

  if (data.error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Failed to Load Coordination Data</h3>
              <p className="text-sm">{data.error}</p>
              <button 
                onClick={loadCoordinationData}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Agent Coordination Matrix
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Visual mapping of agent interactions and coordination patterns
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary-600">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'network' | 'matrix')}
              className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
            >
              <option value="network">Network</option>
              <option value="matrix">Matrix</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary-600">Time:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
            >
              <option value="1h">1 hour</option>
              <option value="6h">6 hours</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
            </select>
          </div>

          <button
            onClick={loadCoordinationData}
            disabled={data.isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${data.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-secondary-600">Coordination Types:</span>
              <Badge className="bg-blue-100 text-blue-800">Handoff</Badge>
              <Badge className="bg-purple-100 text-purple-800">Collaboration</Badge>
              <Badge className="bg-amber-100 text-amber-800">Resource Sharing</Badge>
              <Badge className="bg-red-100 text-red-800">Conflict Resolution</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary-600">Status:</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active</span>
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Paused</span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Failed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {viewMode === 'network' ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full h-96 border border-secondary-200 rounded cursor-pointer"
                    style={{ width: '100%', height: '384px' }}
                  />
                  {data.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 overflow-auto">
                  {renderMatrixView()}
                </div>
              )}
              
              {data.lastUpdated && (
                <p className="text-xs text-secondary-500 mt-2">
                  Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-4">
                {selectedNodeData ? 'Agent Details' : 'Select an Agent'}
              </h4>
              
              {selectedNodeData ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-primary-800 dark:text-primary-200">
                      {selectedNodeData.name}
                    </h5>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Type:</span>
                        <span className="font-medium">{selectedNodeData.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Role:</span>
                        <span className="font-medium">{selectedNodeData.role}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Status:</span>
                        <Badge className={`${
                          selectedNodeData.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedNodeData.status === 'paused' ? 'bg-amber-100 text-amber-800' :
                          selectedNodeData.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedNodeData.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Connections:</span>
                        <span className="font-medium">{selectedNodeData.connections}</span>
                      </div>
                    </div>
                  </div>

                  {selectedNodeLinks.length > 0 && (
                    <div>
                      <h6 className="font-medium text-primary-800 dark:text-primary-200 mb-2">
                        Recent Coordination
                      </h6>
                      <div className="space-y-2">
                        {selectedNodeLinks.slice(0, 5).map((link, index) => (
                          <div key={index} className="text-sm p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium capitalize">
                                {link.type.replace('_', ' ')}
                              </span>
                              {link.recent && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Recent</Badge>
                              )}
                            </div>
                            <div className="text-secondary-600">
                              {link.source === selectedNode ? `→ ${link.target}` : `← ${link.source}`}
                            </div>
                            {link.performance_impact !== undefined && (
                              <div className={`text-xs ${
                                link.performance_impact > 0 ? 'text-green-600' : 
                                link.performance_impact < 0 ? 'text-red-600' : 'text-secondary-600'
                              }`}>
                                Impact: {(link.performance_impact * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click on an agent in the visualization to see details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}