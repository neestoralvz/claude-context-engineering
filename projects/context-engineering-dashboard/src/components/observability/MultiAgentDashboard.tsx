import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Activity, Users, Zap, TrendingUp, AlertCircle, Clock, Cpu, BarChart3 } from 'lucide-react'
import { apiService } from '@/services/api'

interface AgentSession {
  id: number
  session_id: string
  agent_id: string
  agent_name: string
  agent_type: string
  coordination_role: string
  start_time: string
  status: string
  resource_allocation: number
  metadata: any
}

interface CoordinationEvent {
  id: number
  coordination_type: string
  primary_agent_id: string
  secondary_agent_id: string
  start_time: string
  status: string
  outcome?: string
  performance_impact?: number
}

interface ResourceStats {
  averageUtilization: number
  averageEfficiency: number
  bottleneckCount: number
  resourceTypes: Record<string, {
    count: number
    avgUtilization: number
    avgEfficiency: number
  }>
}

interface MultiAgentData {
  activeAgents: AgentSession[]
  coordination: CoordinationEvent[]
  resourceStats: ResourceStats
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

export function MultiAgentDashboard() {
  const [data, setData] = useState<MultiAgentData>({
    activeAgents: [],
    coordination: [],
    resourceStats: {
      averageUtilization: 0,
      averageEfficiency: 0,
      bottleneckCount: 0,
      resourceTypes: {}
    },
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMultiAgentData()
    
    if (autoRefresh) {
      const interval = setInterval(loadMultiAgentData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const loadMultiAgentData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      // Load data in parallel
      const [agentsResponse, coordinationResponse, resourcesResponse] = await Promise.all([
        apiService.request('/agents/active'),
        apiService.request('/agents/coordination?timeRange=24h'),
        apiService.request('/agents/resources?timeRange=24h')
      ])

      setData({
        activeAgents: agentsResponse.agents || [],
        coordination: coordinationResponse.events || [],
        resourceStats: resourcesResponse.statistics || {
          averageUtilization: 0,
          averageEfficiency: 0,
          bottleneckCount: 0,
          resourceTypes: {}
        },
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to load multi-agent data:', error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCoordinationTypeIcon = (type: string) => {
    switch (type) {
      case 'handoff': return <Zap className="w-4 h-4" />
      case 'collaboration': return <Users className="w-4 h-4" />
      case 'resource_sharing': return <BarChart3 className="w-4 h-4" />
      case 'conflict_resolution': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  if (data.error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-2">
            Multi-Agent Dashboard
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            Real-time monitoring of Claude Code agent coordination
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Failed to Load Agent Data</h3>
                <p className="text-sm">{data.error}</p>
                <button 
                  onClick={loadMultiAgentData}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge variant="mathematical" className="text-sm px-6 py-2 rounded-full bg-accent-100 text-primary-900 dark:bg-accent-900 dark:text-accent-100 font-bold">
            Multi-Agent Observability
          </Badge>
        </div>
        
        <h2 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
          Agent Coordination Dashboard
        </h2>
        
        <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
          Real-time monitoring of Claude Code agent sessions, coordination events, and resource utilization
        </p>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-secondary-600 dark:text-secondary-400">
              Auto-refresh
            </label>
          </div>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>

          <button
            onClick={loadMultiAgentData}
            disabled={data.isLoading}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {data.isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {data.lastUpdated && (
          <p className="text-xs text-secondary-500 dark:text-secondary-500">
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Active Agents
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.activeAgents.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Coordination Events
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.coordination.length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Avg Efficiency
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.resourceStats.averageEfficiency.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Bottlenecks
                </p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.resourceStats.bottleneckCount}
                </p>
              </div>
              <AlertCircle className={`w-8 h-8 ${data.resourceStats.bottleneckCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-secondary-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Agents */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Agent Sessions
          </h3>
          
          {data.activeAgents.length === 0 ? (
            <div className="text-center py-8 text-secondary-500 dark:text-secondary-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active agent sessions</p>
              <p className="text-sm">Start multiple Claude Code sessions to see agent coordination</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.activeAgents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-primary-900 dark:text-primary-100">
                        {agent.agent_name}
                      </span>
                    </div>
                    
                    <Badge className={getAgentStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    
                    <Badge variant="outline">
                      {agent.coordination_role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(agent.start_time)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Cpu className="w-4 h-4" />
                      {(agent.resource_allocation * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Coordination Events */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Coordination Events
          </h3>
          
          {data.coordination.length === 0 ? (
            <div className="text-center py-8 text-secondary-500 dark:text-secondary-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No coordination events in the last 24 hours</p>
              <p className="text-sm">Agent coordination events will appear here when they occur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.coordination.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getCoordinationTypeIcon(event.coordination_type)}
                      <span className="font-medium text-primary-900 dark:text-primary-100 capitalize">
                        {event.coordination_type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      {event.primary_agent_id} → {event.secondary_agent_id}
                    </div>
                    
                    {event.outcome && (
                      <Badge className={event.outcome === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {event.outcome}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                    {event.performance_impact !== undefined && (
                      <div className={`flex items-center gap-1 ${
                        event.performance_impact > 0 ? 'text-green-600' : 
                        event.performance_impact < 0 ? 'text-red-600' : 'text-secondary-600'
                      }`}>
                        {event.performance_impact > 0 ? '↗' : event.performance_impact < 0 ? '↘' : '→'}
                        {(event.performance_impact * 100).toFixed(1)}%
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(event.start_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Utilization Summary */}
      {Object.keys(data.resourceStats.resourceTypes).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resource Utilization by Type
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.resourceStats.resourceTypes).map(([type, stats]) => (
                <div key={type} className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                  <h4 className="font-medium text-primary-900 dark:text-primary-100 capitalize mb-2">
                    {type.replace('_', ' ')}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Utilization:</span>
                      <span className="font-medium">{stats.avgUtilization.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Efficiency:</span>
                      <span className="font-medium">{stats.avgEfficiency.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Events:</span>
                      <span className="font-medium">{stats.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}