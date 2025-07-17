import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, BarChart3, Clock, Target, Star, AlertCircle, RefreshCw, Download, Filter } from 'lucide-react'
import { apiService } from '@/services/api'

interface PerformanceData {
  agent_id: string
  agent_name?: string
  task_category: string
  task_complexity: number
  execution_time_ms: number
  success_rate: number
  quality_score: number
  efficiency_metrics: {
    tokens_per_task?: number
    context_switches?: number
    avg_response_time?: number
  }
  comparative_baseline: number
  optimization_opportunities: string[]
  total_tasks: number
  avg_execution_time: number
  avg_success_rate: number
  avg_quality_score: number
}

interface ComparisonData {
  performance: PerformanceData[]
  insights: {
    totalAgents: number
    taskCategories: number
    topPerformers: PerformanceData[]
    averageMetrics: {
      executionTime: number
      successRate: number
      qualityScore: number
    }
  }
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

type ComparisonView = 'overview' | 'detailed' | 'trends' | 'optimization'
type SortField = 'success_rate' | 'quality_score' | 'execution_time' | 'efficiency'

export function AgentPerformanceComparison() {
  const [data, setData] = useState<ComparisonData>({
    performance: [],
    insights: {
      totalAgents: 0,
      taskCategories: 0,
      topPerformers: [],
      averageMetrics: {
        executionTime: 0,
        successRate: 0,
        qualityScore: 0
      }
    },
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const [viewMode, setViewMode] = useState<ComparisonView>('overview')
  const [sortField, setSortField] = useState<SortField>('success_rate')
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [showOptimizations, setShowOptimizations] = useState(true)

  useEffect(() => {
    loadPerformanceData()
  }, [timeRange, selectedCategory])

  const loadPerformanceData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await apiService.getAgentPerformance(timeRange)

      // Process and enhance the data
      const performanceData = (response.performance || []).map((perf: any) => ({
        ...perf,
        agent_name: perf.agent_name || perf.agent_id,
        efficiency_metrics: perf.efficiency_metrics ? 
          JSON.parse(perf.efficiency_metrics) : {},
        optimization_opportunities: perf.optimization_opportunities ?
          JSON.parse(perf.optimization_opportunities) : []
      }))

      // Filter by category if selected
      const filteredData = selectedCategory === 'all' 
        ? performanceData 
        : performanceData.filter((p: any) => p.task_category === selectedCategory)

      setData({
        performance: filteredData,
        insights: response.insights || {
          totalAgents: 0,
          taskCategories: 0,
          topPerformers: [],
          averageMetrics: {
            executionTime: 0,
            successRate: 0,
            qualityScore: 0
          }
        },
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('Failed to load performance data:', error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }

  const sortedPerformance = [...data.performance].sort((a, b) => {
    switch (sortField) {
      case 'success_rate':
        return b.avg_success_rate - a.avg_success_rate
      case 'quality_score':
        return b.avg_quality_score - a.avg_quality_score
      case 'execution_time':
        return a.avg_execution_time - b.avg_execution_time
      case 'efficiency':
        return b.comparative_baseline - a.comparative_baseline
      default:
        return 0
    }
  })

  const getPerformanceColor = (value: number, field: SortField) => {
    if (field === 'execution_time') {
      // Lower is better for execution time
      if (value < 1000) return 'text-green-600'
      if (value < 5000) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      // Higher is better for other metrics
      if (value > 80) return 'text-green-600'
      if (value > 60) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getPerformanceBadge = (value: number, field: SortField) => {
    if (field === 'execution_time') {
      if (value < 1000) return 'bg-green-100 text-green-800'
      if (value < 5000) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    } else {
      if (value > 80) return 'bg-green-100 text-green-800'
      if (value > 60) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }
  }

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedPerformance.slice(0, 6).map((agent) => (
            <Card key={agent.agent_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100">
                    {agent.agent_name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {agent.total_tasks} tasks
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Success Rate:</span>
                    <span className={`font-medium ${getPerformanceColor(agent.avg_success_rate, 'success_rate')}`}>
                      {agent.avg_success_rate.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Quality Score:</span>
                    <span className={`font-medium ${getPerformanceColor(agent.avg_quality_score, 'quality_score')}`}>
                      {agent.avg_quality_score.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Avg Time:</span>
                    <span className={`font-medium ${getPerformanceColor(agent.avg_execution_time, 'execution_time')}`}>
                      {(agent.avg_execution_time / 1000).toFixed(1)}s
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">vs Baseline:</span>
                    <span className={`font-medium ${agent.comparative_baseline > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {agent.comparative_baseline > 0 ? '+' : ''}{(agent.comparative_baseline * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {agent.optimization_opportunities.length > 0 && showOptimizations && (
                  <div className="mt-3 pt-3 border-t border-secondary-200">
                    <div className="flex items-center gap-1 text-xs text-secondary-600 mb-1">
                      <Target className="w-3 h-3" />
                      Optimization Opportunities
                    </div>
                    <div className="text-xs text-secondary-700 space-y-1">
                      {agent.optimization_opportunities.slice(0, 2).map((opp, index) => (
                        <div key={index} className="flex items-start gap-1">
                          <span className="w-1 h-1 bg-secondary-400 rounded-full mt-1.5 flex-shrink-0" />
                          <span className="line-clamp-2">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Ranking */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-4">
              Performance Ranking
            </h4>
            
            <div className="space-y-3">
              {sortedPerformance.map((agent, index) => (
                <div key={agent.agent_id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{agent.agent_name}</div>
                      <div className="text-sm text-secondary-600">
                        {agent.task_category} • {agent.total_tasks} tasks
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{agent.avg_success_rate.toFixed(1)}%</div>
                      <div className="text-xs text-secondary-600">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{agent.avg_quality_score.toFixed(1)}%</div>
                      <div className="text-xs text-secondary-600">Quality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{(agent.avg_execution_time / 1000).toFixed(1)}s</div>
                      <div className="text-xs text-secondary-600">Time</div>
                    </div>
                    <Badge className={getPerformanceBadge(agent.avg_success_rate, 'success_rate')}>
                      {agent.comparative_baseline > 0 ? 'Above' : 'Below'} Baseline
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDetailedComparison = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left p-3 font-semibold text-primary-900">Agent</th>
                    <th className="text-left p-3 font-semibold text-primary-900">Category</th>
                    <th className="text-left p-3 font-semibold text-primary-900">Tasks</th>
                    <th className="text-left p-3 font-semibold text-primary-900">Success Rate</th>
                    <th className="text-left p-3 font-semibold text-primary-900">Quality Score</th>
                    <th className="text-left p-3 font-semibold text-primary-900">Avg Time</th>
                    <th className="text-left p-3 font-semibold text-primary-900">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPerformance.map((agent) => (
                    <tr key={agent.agent_id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="p-3">
                        <div className="font-medium">{agent.agent_name}</div>
                        <div className="text-sm text-secondary-600">{agent.agent_id}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {agent.task_category}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{agent.total_tasks}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${agent.avg_success_rate > 80 ? 'bg-green-500' : agent.avg_success_rate > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${agent.avg_success_rate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{agent.avg_success_rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${agent.avg_quality_score > 80 ? 'bg-green-500' : agent.avg_quality_score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${agent.avg_quality_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{agent.avg_quality_score.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${getPerformanceColor(agent.avg_execution_time, 'execution_time')}`}>
                          {(agent.avg_execution_time / 1000).toFixed(1)}s
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={`${agent.comparative_baseline > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {agent.comparative_baseline > 0 ? '+' : ''}{(agent.comparative_baseline * 100).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderOptimizations = () => {
    const agentsWithOptimizations = data.performance.filter(agent => agent.optimization_opportunities.length > 0)
    
    return (
      <div className="space-y-6">
        {agentsWithOptimizations.map((agent) => (
          <Card key={agent.agent_id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100">
                    {agent.agent_name}
                  </h4>
                  <p className="text-sm text-secondary-600">
                    {agent.task_category} • {agent.total_tasks} tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={agent.comparative_baseline > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {agent.comparative_baseline > 0 ? '+' : ''}{(agent.comparative_baseline * 100).toFixed(1)}% vs baseline
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-primary-800 dark:text-primary-200 mb-3">
                    Current Performance
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Success Rate:</span>
                      <span className="font-medium">{agent.avg_success_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Quality Score:</span>
                      <span className="font-medium">{agent.avg_quality_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Avg Execution Time:</span>
                      <span className="font-medium">{(agent.avg_execution_time / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-primary-800 dark:text-primary-200 mb-3">
                    Optimization Opportunities
                  </h5>
                  <div className="space-y-2">
                    {agent.optimization_opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900 rounded">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800 dark:text-blue-200">{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'overview': return renderOverview()
      case 'detailed': return renderDetailedComparison()
      case 'optimization': return renderOptimizations()
      default: return renderOverview()
    }
  }

  if (data.error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Failed to Load Performance Data</h3>
              <p className="text-sm">{data.error}</p>
              <button 
                onClick={loadPerformanceData}
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
            <TrendingUp className="w-5 h-5" />
            Agent Performance Comparison
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Comparative analysis of agent performance and optimization opportunities
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              <option value="coding">Coding</option>
              <option value="analysis">Analysis</option>
              <option value="documentation">Documentation</option>
              <option value="debugging">Debugging</option>
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
            onClick={loadPerformanceData}
            disabled={data.isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${data.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Mode Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-secondary-600">View:</span>
              <div className="flex items-center gap-2">
                {[
                  { value: 'overview', label: 'Overview', icon: BarChart3 },
                  { value: 'detailed', label: 'Detailed', icon: TrendingUp },
                  { value: 'optimization', label: 'Optimization', icon: Target }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setViewMode(value as ComparisonView)}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === value
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
                <span className="text-sm text-secondary-600">Sort by:</span>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded px-2 py-1"
                >
                  <option value="success_rate">Success Rate</option>
                  <option value="quality_score">Quality Score</option>
                  <option value="execution_time">Execution Time</option>
                  <option value="efficiency">Efficiency</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-optimizations"
                  checked={showOptimizations}
                  onChange={(e) => setShowOptimizations(e.target.checked)}
                />
                <label htmlFor="show-optimizations" className="text-sm text-secondary-600">
                  Show optimizations
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Total Agents</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.insights.totalAgents}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Avg Success Rate</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.insights.averageMetrics.successRate.toFixed(1)}%
                </p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Avg Quality</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {data.insights.averageMetrics.qualityScore.toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Avg Exec Time</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                  {(data.insights.averageMetrics.executionTime / 1000).toFixed(1)}s
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {data.isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : data.performance.length === 0 ? (
        <div className="text-center py-12 text-secondary-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No performance data available</p>
          <p className="text-sm">Performance comparison data will appear here when available</p>
        </div>
      ) : (
        renderContent()
      )}
      
      {data.lastUpdated && (
        <p className="text-xs text-secondary-500 text-center">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}