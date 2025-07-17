import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { BarChart3, TrendingUp, AlertTriangle, Cpu, HardDrive, Wifi, RefreshCw, Settings, Filter } from 'lucide-react'
import { apiService } from '@/services/api'

interface ResourceData {
  id: number
  agent_id: string
  resource_type: string
  resource_value: number
  resource_unit: string
  utilization_percentage: number
  efficiency_score: number
  bottleneck_detected: boolean
  timestamp: string
}

interface ResourceStats {
  totalDataPoints: number
  resourceTypes: Record<string, {
    count: number
    avgUtilization: number
    avgEfficiency: number
  }>
  averageUtilization: number
  averageEfficiency: number
  bottleneckCount: number
}

interface ChartData {
  resources: ResourceData[]
  stats: ResourceStats
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

type ChartType = 'utilization' | 'efficiency' | 'trend' | 'distribution'
type ResourceType = 'all' | 'memory' | 'tokens' | 'context' | 'cpu' | 'disk_io' | 'network'

export function ResourceUtilizationChart() {
  const [data, setData] = useState<ChartData>({
    resources: [],
    stats: {
      totalDataPoints: 0,
      resourceTypes: {},
      averageUtilization: 0,
      averageEfficiency: 0,
      bottleneckCount: 0
    },
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const [chartType, setChartType] = useState<ChartType>('utilization')
  const [resourceFilter, setResourceFilter] = useState<ResourceType>('all')
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string>('all')

  useEffect(() => {
    loadResourceData()
    
    if (autoRefresh) {
      const interval = setInterval(loadResourceData, 15000) // 15 seconds for resource data
      return () => clearInterval(interval)
    }
  }, [timeRange, resourceFilter, selectedAgent, autoRefresh])

  const loadResourceData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await apiService.getAgentResources(
        selectedAgent === 'all' ? undefined : selectedAgent,
        timeRange,
        resourceFilter === 'all' ? undefined : resourceFilter
      )

      setData({
        resources: response.resources || [],
        stats: response.statistics || {
          totalDataPoints: 0,
          resourceTypes: {},
          averageUtilization: 0,
          averageEfficiency: 0,
          bottleneckCount: 0
        },
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to load resource data:', error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'memory': return <HardDrive className="w-4 h-4" />
      case 'cpu': return <Cpu className="w-4 h-4" />
      case 'network': return <Wifi className="w-4 h-4" />
      case 'tokens': case 'context': return <BarChart3 className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  const getUtilizationColor = (utilization: number, bottleneck: boolean) => {
    if (bottleneck) return 'bg-red-500'
    if (utilization > 80) return 'bg-red-400'
    if (utilization > 60) return 'bg-amber-400'
    if (utilization > 40) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency > 80) return 'bg-green-500'
    if (efficiency > 60) return 'bg-yellow-500'
    if (efficiency > 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const renderUtilizationChart = () => {
    const resourceTypes = Object.keys(data.stats.resourceTypes)
    
    return (
      <div className="space-y-4">
        {resourceTypes.map(type => {
          const typeData = data.stats.resourceTypes[type]
          const typeResources = data.resources.filter(r => r.resource_type === type)
          
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getResourceIcon(type)}
                  <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                  <Badge variant="outline" className="text-xs">
                    {typeData.count} events
                  </Badge>
                </div>
                <div className="text-sm text-secondary-600">
                  Avg: {typeData.avgUtilization.toFixed(1)}%
                </div>
              </div>
              
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getUtilizationColor(typeData.avgUtilization, false)}`}
                  style={{ width: `${Math.min(typeData.avgUtilization, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                  {typeData.avgUtilization.toFixed(1)}%
                </div>
              </div>
              
              {/* Recent alerts for this resource type */}
              {showAlerts && (
                <div className="flex flex-wrap gap-2">
                  {typeResources
                    .filter(r => r.bottleneck_detected || r.utilization_percentage > 80)
                    .slice(0, 3)
                    .map(resource => (
                      <div
                        key={resource.id}
                        className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {resource.agent_id}: {resource.utilization_percentage.toFixed(1)}%
                      </div>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderEfficiencyChart = () => {
    const resourceTypes = Object.keys(data.stats.resourceTypes)
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceTypes.map(type => {
          const typeData = data.stats.resourceTypes[type]
          
          return (
            <div key={type} className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getResourceIcon(type)}
                  <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                </div>
                <Badge className={`text-xs ${getEfficiencyColor(typeData.avgEfficiency)} text-white`}>
                  {typeData.avgEfficiency.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization:</span>
                  <span>{typeData.avgUtilization.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Efficiency:</span>
                  <span>{typeData.avgEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Events:</span>
                  <span>{typeData.count}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderTrendChart = () => {
    // Group resources by time periods for trend analysis
    const timeGroups = data.resources.reduce((groups, resource) => {
      const time = new Date(resource.timestamp)
      const timeKey = time.toISOString().substring(0, 13) // Group by hour
      
      if (!groups[timeKey]) {
        groups[timeKey] = []
      }
      groups[timeKey].push(resource)
      return groups
    }, {} as Record<string, ResourceData[]>)

    const trendData = Object.keys(timeGroups)
      .sort()
      .map(timeKey => {
        const resources = timeGroups[timeKey]
        const avgUtilization = resources.reduce((sum, r) => sum + r.utilization_percentage, 0) / resources.length
        const avgEfficiency = resources.reduce((sum, r) => sum + r.efficiency_score, 0) / resources.length
        const bottleneckCount = resources.filter(r => r.bottleneck_detected).length
        
        return {
          time: new Date(timeKey).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          utilization: avgUtilization,
          efficiency: avgEfficiency,
          bottlenecks: bottleneckCount
        }
      })

    return (
      <div className="space-y-4">
        <div className="h-64 flex items-end justify-between gap-1">
          {trendData.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full h-48 bg-gray-200 rounded-t">
                <div
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-300"
                  style={{ height: `${(point.utilization / 100) * 100}%` }}
                />
                <div
                  className="absolute bottom-0 w-full bg-green-500 opacity-60 rounded-t transition-all duration-300"
                  style={{ height: `${(point.efficiency / 100) * 100}%` }}
                />
              </div>
              <div className="text-xs text-secondary-600 mt-1 text-center">
                {point.time}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Utilization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Efficiency</span>
          </div>
        </div>
      </div>
    )
  }

  const renderDistributionChart = () => {
    const agents = [...new Set(data.resources.map(r => r.agent_id))]
    
    return (
      <div className="space-y-4">
        {agents.map(agentId => {
          const agentResources = data.resources.filter(r => r.agent_id === agentId)
          const avgUtilization = agentResources.reduce((sum, r) => sum + r.utilization_percentage, 0) / agentResources.length
          const avgEfficiency = agentResources.reduce((sum, r) => sum + r.efficiency_score, 0) / agentResources.length
          const bottleneckCount = agentResources.filter(r => r.bottleneck_detected).length
          
          return (
            <div key={agentId} className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{agentId}</span>
                <div className="flex items-center gap-2">
                  {bottleneckCount > 0 && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {bottleneckCount} alerts
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {agentResources.length} events
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-secondary-600 mb-1">Utilization</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getUtilizationColor(avgUtilization, bottleneckCount > 0)}`}
                      style={{ width: `${Math.min(avgUtilization, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-secondary-600 mt-1">
                    {avgUtilization.toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-secondary-600 mb-1">Efficiency</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getEfficiencyColor(avgEfficiency)}`}
                      style={{ width: `${Math.min(avgEfficiency, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-secondary-600 mt-1">
                    {avgEfficiency.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'utilization': return renderUtilizationChart()
      case 'efficiency': return renderEfficiencyChart()
      case 'trend': return renderTrendChart()
      case 'distribution': return renderDistributionChart()
      default: return renderUtilizationChart()
    }
  }

  if (data.error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Failed to Load Resource Data</h3>
              <p className="text-sm">{data.error}</p>
              <button 
                onClick={loadResourceData}
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
            <BarChart3 className="w-5 h-5" />
            Resource Utilization Monitor
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Real-time resource usage tracking with bottleneck detection
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-600" />
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value as ResourceType)}
              className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
            >
              <option value="all">All Resources</option>
              <option value="memory">Memory</option>
              <option value="cpu">CPU</option>
              <option value="tokens">Tokens</option>
              <option value="context">Context</option>
              <option value="network">Network</option>
              <option value="disk_io">Disk I/O</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
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
            onClick={loadResourceData}
            disabled={data.isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${data.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Chart Type Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-secondary-600">Chart Type:</span>
              <div className="flex items-center gap-2">
                {[
                  { value: 'utilization', label: 'Utilization', icon: BarChart3 },
                  { value: 'efficiency', label: 'Efficiency', icon: TrendingUp },
                  { value: 'trend', label: 'Trend', icon: TrendingUp },
                  { value: 'distribution', label: 'Distribution', icon: BarChart3 }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setChartType(value as ChartType)}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      chartType === value
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-alerts"
                  checked={showAlerts}
                  onChange={(e) => setShowAlerts(e.target.checked)}
                />
                <label htmlFor="show-alerts" className="text-sm text-secondary-600">
                  Show alerts
                </label>
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.stats.averageUtilization.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.stats.averageEfficiency.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Bottlenecks</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.stats.bottleneckCount}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${data.stats.bottleneckCount > 0 ? 'text-red-600' : 'text-secondary-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Data Points</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.stats.totalDataPoints}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-accent-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardContent className="p-6">
          {data.isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : data.resources.length === 0 ? (
            <div className="text-center py-12 text-secondary-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No resource data available</p>
              <p className="text-sm">Resource monitoring data will appear here when available</p>
            </div>
          ) : (
            renderChart()
          )}
          
          {data.lastUpdated && (
            <p className="text-xs text-secondary-500 mt-4">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}