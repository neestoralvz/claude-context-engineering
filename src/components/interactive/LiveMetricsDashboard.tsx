'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula } from '@/components/ui/MathFormula'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react'

interface MetricValue {
  current: number
  previous: number
  trend: 'up' | 'down' | 'stable'
  change: number
  unit: string
  target?: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

interface SystemMetric {
  id: string
  name: string
  description: string
  value: MetricValue
  formula?: string
  category: 'performance' | 'quality' | 'usage' | 'efficiency'
  history: number[]
  lastUpdated: Date
}

interface MetricCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  metrics: SystemMetric[]
  overallHealth: number
}

interface AlertItem {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  metric?: string
  value?: number
  threshold?: number
}

export function LiveMetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricCategory[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isLive, setIsLive] = useState(false)
  const [updateInterval, setUpdateInterval] = useState(2000)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')

  const initializeMetrics = useCallback(() => {
    const categories: MetricCategory[] = [
      {
        id: 'performance',
        name: 'Performance Metrics',
        description: 'System execution and response time metrics',
        icon: <Zap className="w-5 h-5" />,
        overallHealth: 0.88,
        metrics: [
          {
            id: 'success-rate',
            name: 'Command Success Rate',
            description: 'Percentage of successfully executed commands',
            category: 'performance',
            formula: '\\frac{\\text{successful executions}}{\\text{total executions}} \\times 100',
            value: {
              current: 88.48,
              previous: 87.23,
              trend: 'up',
              change: 1.25,
              unit: '%',
              target: 90,
              status: 'good'
            },
            history: generateHistoryData(88.48, 20),
            lastUpdated: new Date()
          },
          {
            id: 'avg-execution-time',
            name: 'Average Execution Time',
            description: 'Mean command execution duration',
            category: 'performance',
            formula: '\\bar{t} = \\frac{1}{n} \\sum_{i=1}^{n} t_i',
            value: {
              current: 190,
              previous: 250,
              trend: 'down',
              change: -24.0,
              unit: 'ms',
              target: 200,
              status: 'excellent'
            },
            history: generateHistoryData(190, 20),
            lastUpdated: new Date()
          },
          {
            id: 'confidence-score',
            name: 'Average Confidence Score',
            description: 'Mean confidence level across all commands',
            category: 'performance',
            formula: '\\text{Confidence} = \\frac{\\sum w_i \\cdot c_i}{\\sum w_i}',
            value: {
              current: 9.395,
              previous: 9.12,
              trend: 'up',
              change: 2.75,
              unit: '/10',
              target: 9.5,
              status: 'good'
            },
            history: generateHistoryData(9.395, 20),
            lastUpdated: new Date()
          }
        ]
      },
      {
        id: 'quality',
        name: 'Quality Metrics',
        description: 'Output quality and reliability indicators',
        icon: <Target className="w-5 h-5" />,
        overallHealth: 0.92,
        metrics: [
          {
            id: 'context-optimization',
            name: 'Context Optimization',
            description: 'Efficiency of context usage and reduction',
            category: 'quality',
            formula: '\\text{Optimization} = 1 - \\frac{\\text{used context}}{\\text{total context}}',
            value: {
              current: 78,
              previous: 75,
              trend: 'up',
              change: 3.0,
              unit: '%',
              target: 80,
              status: 'good'
            },
            history: generateHistoryData(78, 20),
            lastUpdated: new Date()
          },
          {
            id: 'accuracy-maintained',
            name: 'Accuracy Maintained',
            description: 'Quality preservation during optimization',
            category: 'quality',
            formula: '\\text{Accuracy} = \\frac{\\text{correct outputs}}{\\text{total outputs}}',
            value: {
              current: 98,
              previous: 97.5,
              trend: 'up',
              change: 0.5,
              unit: '%',
              target: 95,
              status: 'excellent'
            },
            history: generateHistoryData(98, 20),
            lastUpdated: new Date()
          },
          {
            id: 'breakthrough-rate',
            name: 'Breakthrough Insights',
            description: 'Rate of generating breakthrough insights',
            category: 'quality',
            formula: '\\text{Breakthrough Rate} = \\frac{\\text{breakthroughs}}{\\text{thinking sessions}}',
            value: {
              current: 23,
              previous: 18,
              trend: 'up',
              change: 27.8,
              unit: '%',
              target: 25,
              status: 'good'
            },
            history: generateHistoryData(23, 20),
            lastUpdated: new Date()
          }
        ]
      },
      {
        id: 'usage',
        name: 'Usage Analytics',
        description: 'Command usage patterns and frequency',
        icon: <BarChart3 className="w-5 h-5" />,
        overallHealth: 0.85,
        metrics: [
          {
            id: 'total-executions',
            name: 'Total Executions',
            description: 'Cumulative command execution count',
            category: 'usage',
            value: {
              current: 226,
              previous: 198,
              trend: 'up',
              change: 14.1,
              unit: 'executions',
              status: 'good'
            },
            history: generateHistoryData(226, 20),
            lastUpdated: new Date()
          },
          {
            id: 'active-commands',
            name: 'Active Commands',
            description: 'Number of currently active commands',
            category: 'usage',
            value: {
              current: 62,
              previous: 60,
              trend: 'up',
              change: 3.3,
              unit: 'commands',
              target: 65,
              status: 'good'
            },
            history: generateHistoryData(62, 20),
            lastUpdated: new Date()
          },
          {
            id: 'crystallization-events',
            name: 'Pattern Crystallization',
            description: 'Number of patterns crystallized into commands',
            category: 'usage',
            formula: '\\text{Crystallization} = \\sum_{p} \\mathbb{1}[\\text{usage}(p) \\geq 3 \\land \\text{success}(p) \\geq 0.85]',
            value: {
              current: 7,
              previous: 5,
              trend: 'up',
              change: 40.0,
              unit: 'patterns',
              status: 'excellent'
            },
            history: generateHistoryData(7, 20),
            lastUpdated: new Date()
          }
        ]
      },
      {
        id: 'efficiency',
        name: 'Efficiency Metrics',
        description: 'Resource utilization and optimization indicators',
        icon: <Gauge className="w-5 h-5" />,
        overallHealth: 0.91,
        metrics: [
          {
            id: 'load-time-improvement',
            name: 'Load Time Improvement',
            description: 'Performance gain from lazy loading',
            category: 'efficiency',
            formula: '\\text{Improvement} = \\frac{t_{\\text{before}} - t_{\\text{after}}}{t_{\\text{before}}} \\times 100',
            value: {
              current: 65,
              previous: 62,
              trend: 'up',
              change: 4.8,
              unit: '%',
              target: 70,
              status: 'good'
            },
            history: generateHistoryData(65, 20),
            lastUpdated: new Date()
          },
          {
            id: 'memory-efficiency',
            name: 'Memory Efficiency',
            description: 'Context memory utilization optimization',
            category: 'efficiency',
            value: {
              current: 84,
              previous: 81,
              trend: 'up',
              change: 3.7,
              unit: '%',
              target: 85,
              status: 'good'
            },
            history: generateHistoryData(84, 20),
            lastUpdated: new Date()
          },
          {
            id: 'cognitive-load-reduction',
            name: 'Cognitive Load Reduction',
            description: 'Reduction in mental steps required',
            category: 'efficiency',
            formula: '\\text{Reduction} = \\frac{\\text{steps}_{\\text{before}} - \\text{steps}_{\\text{after}}}{\\text{steps}_{\\text{before}}}',
            value: {
              current: 67,
              previous: 64,
              trend: 'up',
              change: 4.7,
              unit: '%',
              target: 70,
              status: 'good'
            },
            history: generateHistoryData(67, 20),
            lastUpdated: new Date()
          }
        ]
      }
    ]

    setMetrics(categories)
    
    // Generate initial alerts
    const initialAlerts: AlertItem[] = [
      {
        id: '1',
        type: 'success',
        message: 'Command success rate improved by 1.25% - exceeding optimization targets',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        metric: 'success-rate',
        value: 88.48
      },
      {
        id: '2',
        type: 'info',
        message: 'Pattern crystallization detected - 2 new command candidates identified',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        metric: 'crystallization-events'
      },
      {
        id: '3',
        type: 'warning',
        message: 'Context optimization approaching target threshold - consider adjustment',
        timestamp: new Date(Date.now() - 22 * 60 * 1000),
        metric: 'context-optimization',
        value: 78,
        threshold: 80
      }
    ]
    
    setAlerts(initialAlerts)
  }, [])

  useEffect(() => {
    initializeMetrics()
  }, [initializeMetrics])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLive) {
      interval = setInterval(() => {
        updateMetrics()
      }, updateInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive, updateInterval])

  const updateMetrics = useCallback(() => {
    setMetrics(prevMetrics => 
      prevMetrics.map(category => ({
        ...category,
        metrics: category.metrics.map(metric => {
          const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
          const newValue = metric.value.current * (1 + variation)
          const change = ((newValue - metric.value.current) / metric.value.current) * 100
          
          // Update history
          const newHistory = [...metric.history.slice(1), newValue]
          
          // Determine trend
          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (Math.abs(change) > 0.1) {
            trend = change > 0 ? 'up' : 'down'
          }

          // Determine status
          let status: MetricValue['status'] = 'good'
          if (metric.value.target) {
            const targetDiff = Math.abs(newValue - metric.value.target) / metric.value.target
            if (targetDiff < 0.05) status = 'excellent'
            else if (targetDiff < 0.15) status = 'good'
            else if (targetDiff < 0.25) status = 'warning'
            else status = 'critical'
          }

          return {
            ...metric,
            value: {
              ...metric.value,
              previous: metric.value.current,
              current: Number(newValue.toFixed(metric.value.unit === '%' ? 1 : 3)),
              change: Number(change.toFixed(2)),
              trend,
              status
            },
            history: newHistory,
            lastUpdated: new Date()
          }
        })
      }))
    )

    // Occasionally add new alerts
    if (Math.random() > 0.85) {
      const newAlert: AlertItem = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'info' : 'success',
        message: generateRandomAlertMessage(),
        timestamp: new Date()
      }
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]) // Keep last 10 alerts
    }
  }, [])

  const generateRandomAlertMessage = (): string => {
    const messages = [
      'Progressive thinking session completed with 3 breakthrough insights',
      'Decision engine optimization improved routing efficiency by 5%',
      'New command pattern detected - /analyze-complexity showing high success rate',
      'Context loading speed improved by 12ms average',
      'Mathematical verification passed all integrity checks',
      'Living documentation updated with 2 new crystallized patterns',
      'Command chain optimization reduced execution time by 8%',
      'Auto-loading rules triggered successfully - context reduced by 3%'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getStatusColor = (status: MetricValue['status']): string => {
    const colors = {
      excellent: 'text-primary-900 dark:text-primary-100',
      good: 'text-secondary-700 dark:text-secondary-300',
      warning: 'text-accent-600 dark:text-accent-400',
      critical: 'text-mathematical-600 dark:text-mathematical-400'
    }
    return colors[status]
  }

  const getStatusBadgeColor = (status: MetricValue['status']): string => {
    const colors = {
      excellent: 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100',
      good: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
      warning: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
      critical: 'bg-mathematical-100 text-mathematical-800 dark:bg-mathematical-900 dark:text-mathematical-200'
    }
    return colors[status]
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-primary-900 dark:text-primary-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-mathematical-600 dark:text-mathematical-400" />
      default: return <Activity className="w-4 h-4 text-slate-500" />
    }
  }

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-primary-900 dark:text-primary-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-accent-600 dark:text-accent-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-mathematical-600 dark:text-mathematical-400" />
      default: return <Activity className="w-4 h-4 text-secondary-700 dark:text-secondary-400" />
    }
  }

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(category => category.id === selectedCategory)

  const overallSystemHealth = metrics.reduce((sum, category) => sum + category.overallHealth, 0) / metrics.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
          Live Metrics Dashboard
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Real-time monitoring of Context Engineering system performance, quality metrics, 
          and usage analytics with mathematical precision and predictive insights.
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200
                ${isLive 
                  ? 'bg-secondary-700 text-white hover:bg-secondary-800' 
                  : 'bg-primary-900 text-white hover:bg-primary-800'
                }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isLive ? 'Stop Live Updates' : 'Start Live Updates'}
            </button>

            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLive ? 'animate-spin' : ''}`} />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {isLive ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                       text-sm focus:ring-2 focus:ring-primary-900"
            >
              <option value="all">All Categories</option>
              {metrics.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Update Interval */}
            <select
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                       text-sm focus:ring-2 focus:ring-primary-900"
            >
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
            </select>
          </div>
        </div>
      </Card>

      {/* System Health Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            System Health Overview
          </h4>
          <Badge className={getStatusBadgeColor(overallSystemHealth > 0.9 ? 'excellent' : overallSystemHealth > 0.8 ? 'good' : 'warning')}>
            {(overallSystemHealth * 100).toFixed(1)}% Health
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(category => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-slate-600 dark:text-slate-400">
                  {category.icon}
                </div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">
                  {category.name}
                </h5>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {(category.overallHealth * 100).toFixed(0)}%
                </span>
                <div className="text-right">
                  <div className="text-xs text-slate-500">
                    {category.metrics.length} metrics
                  </div>
                  <Badge className={getStatusBadgeColor(category.overallHealth > 0.9 ? 'excellent' : category.overallHealth > 0.8 ? 'good' : 'warning')}>
                    {category.overallHealth > 0.9 ? 'Excellent' : category.overallHealth > 0.8 ? 'Good' : 'Warning'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-6">
        {/* Metrics Display */}
        <div className="xl:col-span-3 lg:col-span-2 space-y-6">
          {filteredMetrics.map(category => (
            <Card key={category.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-slate-600 dark:text-slate-400">
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {category.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {category.metrics.map(metric => (
                    <motion.div
                      key={metric.id}
                      layout
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="space-y-3">
                        {/* Metric Header */}
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-slate-900 dark:text-slate-100">
                            {metric.name}
                          </h5>
                          <Badge className={getStatusBadgeColor(metric.value.status)}>
                            {metric.value.status}
                          </Badge>
                        </div>

                        {/* Current Value */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getStatusColor(metric.value.status)}`}>
                              {metric.value.current}
                            </span>
                            <span className="text-sm text-slate-500">
                              {metric.value.unit}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {getTrendIcon(metric.value.trend)}
                            <span className={`text-sm font-medium 
                              ${metric.value.trend === 'up' ? 'text-primary-900 dark:text-primary-400' : 
                                metric.value.trend === 'down' ? 'text-mathematical-600 dark:text-mathematical-400' : 
                                'text-slate-500'}`}
                            >
                              {metric.value.trend === 'up' ? '+' : metric.value.trend === 'down' ? '' : ''}
                              {metric.value.change.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Target Progress */}
                        {metric.value.target && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-400">Target</span>
                              <span className="text-slate-900 dark:text-slate-100">
                                {metric.value.target}{metric.value.unit}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                              <motion.div
                                className="bg-primary-900 dark:bg-primary-400 h-1 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${Math.min((metric.value.current / metric.value.target) * 100, 100)}%` 
                                }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Formula */}
                        {metric.formula && (
                          <div className="p-2 bg-white dark:bg-slate-900 rounded border">
                            <MathFormula formula={metric.formula} className="text-xs" />
                          </div>
                        )}

                        {/* Mini Chart */}
                        <div className="h-12 flex items-end gap-1">
                          {metric.history.slice(-12).map((value, index) => {
                            const max = Math.max(...metric.history)
                            const min = Math.min(...metric.history)
                            const height = ((value - min) / (max - min)) * 100
                            
                            return (
                              <motion.div
                                key={index}
                                className="flex-1 bg-secondary-700 dark:bg-secondary-400 rounded-sm opacity-70"
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              />
                            )
                          })}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {metric.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Alerts & Activity */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Live Activity
              </h4>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {alerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                          {alert.metric && (
                            <Badge className="text-xs bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              {alert.metric}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {alerts.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No recent activity. Start live updates to see real-time alerts.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function generateHistoryData(currentValue: number, points: number): number[] {
  const data: number[] = []
  let value = currentValue
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
    value = value * (1 + variation)
    data.push(Number(value.toFixed(3)))
  }
  
  return data
}