'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Play, Terminal, Clock, CheckCircle, AlertCircle, Zap, Code2, Eye } from 'lucide-react'
import { CommandProcessor, Command, CommandType } from '@/lib/commands'

interface ExecutionStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'executing' | 'completed' | 'error'
  duration?: number
  output?: string
  confidence?: number
}

interface SimulationResult {
  success: boolean
  executionTime: number
  confidence: number
  output: string
  insights: string[]
  nextRecommendations: string[]
}

export function CommandSimulator() {
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null)
  const [commands, setCommands] = useState<Command[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const allCommands = await CommandProcessor.getAllCommands()
        setCommands(allCommands)
        if (allCommands.length > 0) {
          setSelectedCommand(allCommands[0])
        }
      } catch (error) {
        console.error('Failed to load commands:', error)
        // Fallback with mock commands
        const mockCommands = generateMockCommands()
        setCommands(mockCommands)
        setSelectedCommand(mockCommands[0])
      }
    }
    loadCommands()
  }, [])

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const generateExecutionSteps = useCallback((command: Command): ExecutionStep[] => {
    const baseSteps: ExecutionStep[] = [
      {
        id: 'validation',
        name: 'Input Validation',
        description: 'Validating command parameters and context',
        status: 'pending'
      },
      {
        id: 'context-loading',
        name: 'Context Loading',
        description: 'Loading required context and dependencies',
        status: 'pending'
      }
    ]

    // Add type-specific steps
    if (command.type === CommandType.ORCHESTRATOR) {
      baseSteps.push({
        id: 'chain-resolution',
        name: 'Chain Resolution',
        description: 'Resolving command chain dependencies',
        status: 'pending'
      })
    }

    if (command.complexity > 1.0) {
      baseSteps.push({
        id: 'analysis',
        name: 'Deep Analysis',
        description: 'Performing complex analysis and decision-making',
        status: 'pending'
      })
    }

    baseSteps.push(
      {
        id: 'execution',
        name: 'Core Execution',
        description: 'Executing primary command logic',
        status: 'pending'
      },
      {
        id: 'validation-output',
        name: 'Output Validation',
        description: 'Validating results and generating insights',
        status: 'pending'
      }
    )

    return baseSteps
  }, [])

  const simulateExecution = async () => {
    if (!selectedCommand) return

    setIsSimulating(true)
    setSimulationResult(null)
    
    const steps = generateExecutionSteps(selectedCommand)
    setExecutionSteps(steps)

    // Simulate step-by-step execution
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Update to executing
      setExecutionSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'executing' } : s
      ))

      // Simulate execution time
      const executionTime = Math.random() * 1000 + 500
      await new Promise(resolve => setTimeout(resolve, executionTime))

      // Update to completed
      setExecutionSteps(prev => prev.map((s, idx) => 
        idx === i ? { 
          ...s, 
          status: 'completed', 
          duration: executionTime,
          output: generateStepOutput(step, selectedCommand),
          confidence: Math.random() * 0.3 + 0.7
        } : s
      ))
    }

    // Generate final result
    const result: SimulationResult = {
      success: Math.random() > 0.1, // 90% success rate
      executionTime: steps.reduce((total, step) => total + (step.duration || 0), 0),
      confidence: selectedCommand.metrics.confidenceScore / 10,
      output: generateCommandOutput(selectedCommand),
      insights: generateInsights(selectedCommand),
      nextRecommendations: generateRecommendations(selectedCommand)
    }

    setSimulationResult(result)
    setIsSimulating(false)
  }

  const generateStepOutput = (step: ExecutionStep, command: Command): string => {
    const outputs: Record<string, string> = {
      'validation': `✓ Command '${command.name}' validated\n✓ Parameters within acceptable ranges\n✓ Context compatibility confirmed`,
      'context-loading': `📚 Loading principle #${command.principle}\n🔄 Context reduction: 78%\n⚡ Load time: ${Math.floor(Math.random() * 200 + 50)}ms`,
      'chain-resolution': `🔗 Resolving ${command.chains?.length || 0} command chains\n✓ Dependencies satisfied\n📊 Chain optimization: 92%`,
      'analysis': `🧠 Complexity level: ${command.complexity.toFixed(2)}\n🎯 Confidence threshold: ${(command.metrics.confidenceScore / 10).toFixed(2)}\n📈 Analysis depth: Advanced`,
      'execution': `⚡ Executing core logic\n🎯 Success probability: ${(command.metrics.successRate * 100).toFixed(1)}%\n🔄 Real-time processing active`,
      'validation-output': `✅ Output validation complete\n📊 Quality score: ${(Math.random() * 0.2 + 0.8).toFixed(2)}\n🎯 Insights generated: ${Math.floor(Math.random() * 3 + 2)}`
    }
    return outputs[step.id] || 'Processing...'
  }

  const generateCommandOutput = (command: Command): string => {
    return `Command '${command.name}' executed successfully.

📊 Execution Summary:
• Type: ${command.type}
• Complexity: ${command.complexity.toFixed(2)}
• Success Rate: ${(command.metrics.successRate * 100).toFixed(1)}%
• Confidence: ${(command.metrics.confidenceScore / 10).toFixed(2)}

🎯 Key Results:
• Context optimization applied
• Performance metrics updated
• Decision pathways analyzed
• Output validated and verified

🔗 Integration Points:
• Principle #${command.principle} activated
• Auto-loading rules triggered
• Living documentation updated`
  }

  const generateInsights = (command: Command): string[] => {
    const insights = [
      `Command demonstrates ${command.metrics.successRate > 0.9 ? 'exceptional' : 'strong'} reliability`,
      `Complexity level ${command.complexity > 1.5 ? 'requires advanced context' : 'suitable for standard workflows'}`,
      `Integration with ${command.chains?.length || 0} related commands available`,
    ]

    if (command.type === CommandType.ORCHESTRATOR) {
      insights.push('Orchestrator pattern enables powerful workflow automation')
    }

    if (command.metrics.usageCount > 10) {
      insights.push('High usage frequency indicates proven utility')
    }

    return insights
  }

  const generateRecommendations = (command: Command): string[] => {
    const recommendations = []

    if (command.complexity > 1.0) {
      recommendations.push('Consider using /progressive-thinking for complex scenarios')
    }

    if (command.type === CommandType.ORCHESTRATOR) {
      recommendations.push('Explore related command chains for workflow optimization')
    }

    recommendations.push('Review principle documentation for deeper understanding')

    if (command.metrics.successRate < 0.8) {
      recommendations.push('Validate prerequisites before execution')
    }

    return recommendations
  }

  const getCommandTypeColor = (type: CommandType): string => {
    const colors = {
      [CommandType.ATOMIC]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [CommandType.ORCHESTRATOR]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [CommandType.META]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [CommandType.SYSTEM]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getStepIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />
      case 'executing': return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🎮 Interactive Command Simulator
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Experience real command execution flows with live preview, step-by-step analysis, 
          and interactive demonstrations of the Context Engineering methodology.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Command Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Select Command
              </h4>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg 
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Command List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCommands.map((command) => (
                <motion.div
                  key={command.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedCommand?.name === command.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  onClick={() => setSelectedCommand(command)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-slate-900 dark:text-slate-100">
                          {command.name}
                        </code>
                        <Badge className={getCommandTypeColor(command.type)}>
                          {command.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {command.description}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-green-600 dark:text-green-400">
                        {(command.metrics.successRate * 100).toFixed(0)}%
                      </div>
                      <div className="text-slate-500">
                        C: {command.complexity.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Simulation Controls */}
            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={simulateExecution}
                disabled={!selectedCommand || isSimulating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                         bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                {isSimulating ? 'Simulating...' : 'Simulate Execution'}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                disabled={!selectedCommand}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                         dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Execution Preview */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Execution Preview
              </h4>
            </div>

            {selectedCommand && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Command Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-lg font-mono text-slate-900 dark:text-slate-100">
                      {selectedCommand.name}
                    </code>
                    <Badge className={getCommandTypeColor(selectedCommand.type)}>
                      {selectedCommand.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {selectedCommand.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Success Rate:</span>
                      <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                        {(selectedCommand.metrics.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Complexity:</span>
                      <span className="ml-1 text-orange-600 dark:text-orange-400 font-medium">
                        {selectedCommand.complexity.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Usage Count:</span>
                      <span className="ml-1 text-blue-600 dark:text-blue-400 font-medium">
                        {selectedCommand.metrics.usageCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Principle:</span>
                      <span className="ml-1 text-purple-600 dark:text-purple-400 font-medium">
                        #{selectedCommand.principle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Execution Steps */}
                {executionSteps.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Execution Steps
                    </h5>
                    
                    <AnimatePresence>
                      {executionSteps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-start gap-3 p-3 rounded-lg border
                            ${step.status === 'executing' 
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                              : step.status === 'completed'
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                              : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                            }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getStepIcon(step.status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {step.name}
                              </h6>
                              {step.duration && (
                                <span className="text-xs text-slate-500">
                                  {step.duration.toFixed(0)}ms
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {step.description}
                            </p>
                            
                            {step.output && step.status === 'completed' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 p-2 bg-slate-900 dark:bg-slate-950 rounded text-xs font-mono text-green-400 overflow-hidden"
                              >
                                <pre className="whitespace-pre-wrap">{step.output}</pre>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      {/* Simulation Results */}
      <AnimatePresence>
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Simulation Results
                  </h4>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Execution Summary */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Execution Summary
                    </h5>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                        <Badge className={simulationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {simulationResult.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Duration:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {simulationResult.executionTime.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Confidence:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {(simulationResult.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 dark:bg-slate-950 rounded-lg">
                      <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                        {simulationResult.output}
                      </pre>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Key Insights
                    </h5>
                    
                    <div className="space-y-2">
                      {simulationResult.insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{insight}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Next Steps
                    </h5>
                    
                    <div className="space-y-2">
                      {simulationResult.nextRecommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{rec}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mock commands for fallback
function generateMockCommands(): Command[] {
  return [
    {
      name: '/context-eng',
      path: '/.claude/commands/meta/context-eng.md',
      principle: 1,
      complexity: 2.5,
      description: 'Activates all 62 commands and 56 principles for comprehensive context engineering',
      aliases: ['/context-engineering'],
      status: 'active' as const,
      type: CommandType.META,
      activatesAll: true,
      metrics: {
        successRate: 0.92,
        usageCount: 45,
        lastUsed: '2025-07-15T15:30:00Z',
        averageExecutionTime: 1200,
        confidenceScore: 9.2
      }
    },
    {
      name: '/decision',
      path: '/.claude/commands/01-core-intelligence/decision.md',
      principle: 2,
      complexity: 1.8,
      description: 'Intelligent routing with mathematical triggers and auto-selection',
      aliases: ['/decision-engine'],
      status: 'active' as const,
      type: CommandType.ORCHESTRATOR,
      chains: ['/mathematical-verification', '/pattern-recognition'],
      metrics: {
        successRate: 0.89,
        usageCount: 67,
        lastUsed: '2025-07-15T14:45:00Z',
        averageExecutionTime: 800,
        confidenceScore: 8.9
      }
    },
    {
      name: '/thinking',
      path: '/.claude/commands/01-core-intelligence/thinking.md',
      principle: 3,
      complexity: 2.2,
      description: 'Deep strategic analysis with breakthrough insights and progressive reasoning',
      aliases: ['/progressive-thinking'],
      status: 'active' as const,
      type: CommandType.ORCHESTRATOR,
      metrics: {
        successRate: 0.94,
        usageCount: 32,
        lastUsed: '2025-07-15T16:15:00Z',
        averageExecutionTime: 1500,
        confidenceScore: 9.4
      }
    },
    {
      name: '/explore',
      path: '/.claude/commands/03-discovery-exploration/explore.md',
      principle: 12,
      complexity: 1.5,
      description: 'Pattern recognition and knowledge discovery through systematic exploration',
      status: 'active' as const,
      type: CommandType.ATOMIC,
      metrics: {
        successRate: 0.85,
        usageCount: 23,
        lastUsed: '2025-07-15T13:20:00Z',
        averageExecutionTime: 600,
        confidenceScore: 8.5
      }
    },
    {
      name: '/verify-mathematics',
      path: '/.claude/commands/02-mathematical-verification/verify-mathematics.md',
      principle: 15,
      complexity: 1.3,
      description: 'Mathematical rigor validation and system integrity checking',
      status: 'active' as const,
      type: CommandType.SYSTEM,
      metrics: {
        successRate: 0.96,
        usageCount: 18,
        lastUsed: '2025-07-15T12:10:00Z',
        averageExecutionTime: 450,
        confidenceScore: 9.6
      }
    }
  ]
}