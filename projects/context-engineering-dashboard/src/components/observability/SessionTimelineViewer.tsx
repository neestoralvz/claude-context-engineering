import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Clock, Activity, ZoomIn, ZoomOut, Download, RefreshCw, Filter, Calendar } from 'lucide-react'
import { apiService } from '@/services/api'

interface TimelineEvent {
  id: string
  type: 'session_start' | 'session_end' | 'coordination' | 'resource_alert' | 'performance_milestone'
  timestamp: string
  agent_id: string
  agent_name: string
  title: string
  description: string
  status: 'active' | 'completed' | 'failed' | 'warning'
  metadata?: any
}

interface TimelineData {
  events: TimelineEvent[]
  sessions: Array<{
    agent_id: string
    agent_name: string
    start_time: string
    end_time?: string
    status: string
    resource_allocation: number
  }>
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

export function SessionTimelineViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<TimelineData>({
    events: [],
    sessions: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const [timeRange, setTimeRange] = useState('24h')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: Date; end: Date } | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'coordination' | 'alerts' | 'sessions'>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline')

  useEffect(() => {
    loadTimelineData()
    
    if (autoRefresh) {
      const interval = setInterval(loadTimelineData, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  useEffect(() => {
    if (data.events.length > 0) {
      drawTimeline()
    }
  }, [data, zoomLevel, selectedTimeRange, filterType, viewMode])

  const loadTimelineData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      const [agentsResponse, coordinationResponse, resourcesResponse] = await Promise.all([
        apiService.getActiveAgents(),
        apiService.getAgentCoordination(timeRange),
        apiService.getAgentResources(undefined, timeRange)
      ])

      // Build timeline events from various sources
      const events: TimelineEvent[] = []

      // Add session events
      ;(agentsResponse.agents || []).forEach((agent: any) => {
        events.push({
          id: `session-start-${agent.agent_id}`,
          type: 'session_start',
          timestamp: agent.start_time,
          agent_id: agent.agent_id,
          agent_name: agent.agent_name || agent.agent_id,
          title: 'Session Started',
          description: `Agent ${agent.agent_name} started with ${agent.coordination_role} role`,
          status: 'active',
          metadata: { resource_allocation: agent.resource_allocation }
        })

        if (agent.end_time) {
          events.push({
            id: `session-end-${agent.agent_id}`,
            type: 'session_end',
            timestamp: agent.end_time,
            agent_id: agent.agent_id,
            agent_name: agent.agent_name || agent.agent_id,
            title: 'Session Ended',
            description: `Agent ${agent.agent_name} session completed`,
            status: agent.status === 'failed' ? 'failed' : 'completed',
            metadata: { final_status: agent.status }
          })
        }
      })

      // Add coordination events
      ;(coordinationResponse.events || []).forEach((event: any) => {
        events.push({
          id: `coordination-${event.id}`,
          type: 'coordination',
          timestamp: event.start_time,
          agent_id: event.primary_agent_id,
          agent_name: event.primary_agent_id,
          title: `${event.coordination_type.replace('_', ' ')} with ${event.secondary_agent_id}`,
          description: `${event.coordination_type} coordination between ${event.primary_agent_id} and ${event.secondary_agent_id}`,
          status: event.outcome === 'success' ? 'completed' : 
                 event.outcome === 'failure' ? 'failed' : 'active',
          metadata: { 
            performance_impact: event.performance_impact,
            coordination_type: event.coordination_type,
            secondary_agent: event.secondary_agent_id
          }
        })
      })

      // Add resource alerts
      ;(resourcesResponse.resources || []).forEach((resource: any) => {
        if (resource.bottleneck_detected || resource.utilization_percentage > 80) {
          events.push({
            id: `resource-alert-${resource.id}`,
            type: 'resource_alert',
            timestamp: resource.timestamp,
            agent_id: resource.agent_id || 'system',
            agent_name: resource.agent_id || 'System',
            title: `${resource.resource_type} Alert`,
            description: `${resource.resource_type} utilization at ${resource.utilization_percentage?.toFixed(1)}%`,
            status: resource.bottleneck_detected ? 'failed' : 'warning',
            metadata: { 
              resource_type: resource.resource_type,
              utilization: resource.utilization_percentage,
              bottleneck: resource.bottleneck_detected
            }
          })
        }
      })

      // Sort events by timestamp
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      setData({
        events,
        sessions: agentsResponse.agents || [],
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to load timeline data:', error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }

  const drawTimeline = () => {
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

    if (data.events.length === 0) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('No timeline events', width / 2, height / 2)
      return
    }

    // Filter events based on selected filter
    const filteredEvents = data.events.filter(event => {
      if (filterType === 'all') return true
      if (filterType === 'coordination') return event.type === 'coordination'
      if (filterType === 'alerts') return event.type === 'resource_alert'
      if (filterType === 'sessions') return event.type === 'session_start' || event.type === 'session_end'
      return true
    })

    // Calculate time bounds
    const timeSpan = getTimeSpan(filteredEvents)
    if (!timeSpan) return

    const margin = { top: 40, right: 40, bottom: 60, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Draw background and grid
    drawTimeGrid(ctx, margin, chartWidth, chartHeight, timeSpan)

    if (viewMode === 'gantt') {
      drawGanttChart(ctx, margin, chartWidth, chartHeight, timeSpan)
    } else {
      drawTimelineEvents(ctx, margin, chartWidth, chartHeight, timeSpan, filteredEvents)
    }
  }

  const getTimeSpan = (events: TimelineEvent[]) => {
    if (events.length === 0) return null

    const timestamps = events.map(e => new Date(e.timestamp).getTime())
    const minTime = Math.min(...timestamps)
    const maxTime = Math.max(...timestamps)
    
    // Add some padding
    const padding = (maxTime - minTime) * 0.1
    return {
      start: new Date(minTime - padding),
      end: new Date(maxTime + padding)
    }
  }

  const drawTimeGrid = (ctx: CanvasRenderingContext2D, margin: any, width: number, height: number, timeSpan: { start: Date; end: Date }) => {
    const timeRange = timeSpan.end.getTime() - timeSpan.start.getTime()
    const timeStep = timeRange / 10 // 10 grid lines

    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // Vertical time grid lines
    for (let i = 0; i <= 10; i++) {
      const time = timeSpan.start.getTime() + (timeStep * i)
      const x = margin.left + (i / 10) * width
      
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, margin.top + height)
      ctx.stroke()

      // Time labels
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      const timeLabel = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ctx.fillText(timeLabel, x, margin.top + height + 20)
    }

    // Horizontal axis
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top + height)
    ctx.lineTo(margin.left + width, margin.top + height)
    ctx.stroke()
  }

  const drawTimelineEvents = (ctx: CanvasRenderingContext2D, margin: any, width: number, height: number, timeSpan: { start: Date; end: Date }, events: TimelineEvent[]) => {
    const timeRange = timeSpan.end.getTime() - timeSpan.start.getTime()
    const agents = [...new Set(events.map(e => e.agent_id))]
    const laneHeight = height / Math.max(agents.length, 1)

    // Draw agent lanes
    agents.forEach((agentId, index) => {
      const y = margin.top + (index * laneHeight)
      
      // Lane background
      ctx.fillStyle = index % 2 === 0 ? '#f9fafb' : '#ffffff'
      ctx.fillRect(margin.left, y, width, laneHeight)

      // Agent label
      ctx.fillStyle = '#374151'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'right'
      const agentName = events.find(e => e.agent_id === agentId)?.agent_name || agentId
      ctx.fillText(agentName.substring(0, 12), margin.left - 10, y + laneHeight / 2 + 4)

      // Lane separator
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(margin.left, y + laneHeight)
      ctx.lineTo(margin.left + width, y + laneHeight)
      ctx.stroke()
    })

    // Draw events
    events.forEach(event => {
      const agentIndex = agents.indexOf(event.agent_id)
      if (agentIndex === -1) return

      const eventTime = new Date(event.timestamp).getTime()
      const x = margin.left + ((eventTime - timeSpan.start.getTime()) / timeRange) * width
      const y = margin.top + (agentIndex * laneHeight) + laneHeight / 2

      // Event marker
      ctx.fillStyle = getEventColor(event)
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()

      // Event border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Event line (if coordination)
      if (event.type === 'coordination' && event.metadata?.secondary_agent) {
        const secondaryAgentIndex = agents.indexOf(event.metadata.secondary_agent)
        if (secondaryAgentIndex !== -1) {
          const secondaryY = margin.top + (secondaryAgentIndex * laneHeight) + laneHeight / 2
          
          ctx.strokeStyle = getEventColor(event)
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, secondaryY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    })
  }

  const drawGanttChart = (ctx: CanvasRenderingContext2D, margin: any, width: number, height: number, timeSpan: { start: Date; end: Date }) => {
    const timeRange = timeSpan.end.getTime() - timeSpan.start.getTime()
    const laneHeight = height / Math.max(data.sessions.length, 1)

    data.sessions.forEach((session, index) => {
      const y = margin.top + (index * laneHeight)
      const startTime = new Date(session.start_time).getTime()
      const endTime = session.end_time ? new Date(session.end_time).getTime() : Date.now()
      
      const startX = margin.left + ((startTime - timeSpan.start.getTime()) / timeRange) * width
      const endX = margin.left + ((endTime - timeSpan.start.getTime()) / timeRange) * width
      const barWidth = Math.max(endX - startX, 2)

      // Session bar
      ctx.fillStyle = getSessionColor(session.status)
      ctx.fillRect(startX, y + 10, barWidth, laneHeight - 20)

      // Session label
      ctx.fillStyle = '#374151'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText(session.agent_name.substring(0, 12), margin.left - 10, y + laneHeight / 2 + 4)

      // Resource allocation indicator
      const allocWidth = barWidth * session.resource_allocation
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(startX, y + laneHeight - 5, allocWidth, 3)
    })
  }

  const getEventColor = (event: TimelineEvent): string => {
    switch (event.type) {
      case 'session_start': return '#22c55e'
      case 'session_end': return '#3b82f6'
      case 'coordination': return '#8b5cf6'
      case 'resource_alert': return event.status === 'failed' ? '#ef4444' : '#f59e0b'
      case 'performance_milestone': return '#06b6d4'
      default: return '#6b7280'
    }
  }

  const getSessionColor = (status: string): string => {
    switch (status) {
      case 'active': return '#22c55e'
      case 'paused': return '#f59e0b'
      case 'completed': return '#3b82f6'
      case 'failed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 10))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.1))
  }

  const handleExport = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `timeline-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  if (data.error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <Activity className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Failed to Load Timeline Data</h3>
              <p className="text-sm">{data.error}</p>
              <button 
                onClick={loadTimelineData}
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
            <Clock className="w-5 h-5" />
            Session Timeline Viewer
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Interactive timeline of agent activities and coordination events
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
            >
              <option value="all">All Events</option>
              <option value="coordination">Coordination</option>
              <option value="alerts">Alerts</option>
              <option value="sessions">Sessions</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary-600" />
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

          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1 text-secondary-600 hover:text-primary-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-secondary-600 hover:text-primary-600"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExport}
            className="p-1 text-secondary-600 hover:text-primary-600"
            title="Export Timeline"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={loadTimelineData}
            disabled={data.isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${data.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="timeline-view"
                  name="viewMode"
                  value="timeline"
                  checked={viewMode === 'timeline'}
                  onChange={(e) => setViewMode(e.target.value as any)}
                />
                <label htmlFor="timeline-view" className="text-sm">Timeline View</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="gantt-view"
                  name="viewMode"
                  value="gantt"
                  checked={viewMode === 'gantt'}
                  onChange={(e) => setViewMode(e.target.value as any)}
                />
                <label htmlFor="gantt-view" className="text-sm">Gantt View</label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <label htmlFor="auto-refresh" className="text-sm text-secondary-600">
                Auto-refresh
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-96 border border-secondary-200 rounded"
              style={{ width: '100%', height: '384px' }}
            />
            {data.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            )}
          </div>
          
          {data.lastUpdated && (
            <p className="text-xs text-secondary-500 mt-2">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Event Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                {data.events.filter(e => e.type === 'session_start').length}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Active Sessions
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                {data.events.filter(e => e.type === 'coordination').length}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Coordination Events
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                {data.events.filter(e => e.type === 'resource_alert').length}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Resource Alerts
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                {Math.round(zoomLevel * 100)}%
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                Zoom Level
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}