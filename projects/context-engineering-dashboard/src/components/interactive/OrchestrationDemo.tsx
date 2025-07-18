'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula } from '@/components/ui/MathFormula'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  Zap, 
  Target, 
  Layers, 
  Gauge,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Settings,
  Eye,
  GitBranch,
  Activity,
  Sparkles,
  RefreshCw,
  Code,
  Network,
  Share2,
  Workflow
} from 'lucide-react'

export interface DemoStep {
  id: string
  title: string
  description: string
  visualization: React.ReactNode
  interactiveElements?: React.ReactNode
  explanation: string
  duration: number
  keyInsights: string[]
}

export interface MethodologyDemo {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: DemoStep[]
  category: 'core' | 'optimization' | 'thinking' | 'automation'
  tags: string[]
}

export interface DemoState {
  currentDemo: MethodologyDemo | null
  currentStep: number
  isPlaying: boolean
  progress: number
  insights: string[]
  completedSteps: Set<string>
}

interface OrchestrationDemoProps {
  onDemoComplete?: (demo: MethodologyDemo) => void
}

export function OrchestrationDemo({ onDemoComplete }: OrchestrationDemoProps) {
  const [demoState, setDemoState] = useState<DemoState>({
    currentDemo: null,
    currentStep: 0,
    isPlaying: false,
    progress: 0,
    insights: [],
    completedSteps: new Set()
  })

  const [orchestrationDemos] = useState<MethodologyDemo[]>(generateOrchestrationDemos())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const startDemo = (demo: MethodologyDemo) => {
    setDemoState({
      currentDemo: demo,
      currentStep: 0,
      isPlaying: false,
      progress: 0,
      insights: [],
      completedSteps: new Set()
    })
  }

  const playDemo = useCallback(async () => {
    if (!demoState.currentDemo || demoState.isPlaying) return

    setDemoState(prev => ({ ...prev, isPlaying: true }))

    const step = demoState.currentDemo.steps[demoState.currentStep]
    const progressInterval = 100
    const totalSteps = step.duration / progressInterval

    for (let i = 0; i <= totalSteps; i++) {
      const progress = (i / totalSteps) * 100

      setDemoState(prev => ({ ...prev, progress }))

      // Add insights at specific progress points
      if (i === Math.floor(totalSteps * 0.3)) {
        setDemoState(prev => ({ 
          ...prev, 
          insights: [...prev.insights, step.keyInsights[0]] 
        }))
      } else if (i === Math.floor(totalSteps * 0.7)) {
        setDemoState(prev => ({ 
          ...prev, 
          insights: [...prev.insights, step.keyInsights[1]] 
        }))
      }

      await new Promise(resolve => setTimeout(resolve, progressInterval))
    }

    // Mark step as completed
    setDemoState(prev => ({
      ...prev,
      isPlaying: false,
      progress: 100,
      completedSteps: new Set([...prev.completedSteps, step.id]),
      insights: [...prev.insights, ...step.keyInsights.slice(2)]
    }))
  }, [demoState.currentDemo, demoState.currentStep, demoState.isPlaying])

  const nextStep = () => {
    if (!demoState.currentDemo) return

    if (demoState.currentStep < demoState.currentDemo.steps.length - 1) {
      setDemoState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        progress: 0,
        insights: []
      }))
    } else {
      // Demo completed
      if (onDemoComplete && demoState.currentDemo) {
        onDemoComplete(demoState.currentDemo)
      }
    }
  }

  const previousStep = () => {
    if (demoState.currentStep > 0) {
      setDemoState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        progress: 0,
        insights: []
      }))
    }
  }

  const resetDemo = () => {
    setDemoState(prev => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
      progress: 0,
      insights: [],
      completedSteps: new Set()
    }))
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredDemos = selectedCategory === 'all' 
    ? orchestrationDemos 
    : orchestrationDemos.filter(demo => demo.category === selectedCategory)

  const currentStep = demoState.currentDemo?.steps[demoState.currentStep]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🎼 Orchestration Methodology Demos
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Command orchestration and coordination demonstrations with workflow automation,
          dependency management, and parallel execution patterns.
        </p>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Category:
            </span>
            <div className="flex gap-2">
              {['all', 'core', 'automation', 'coordination', 'workflow'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize
                    ${selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            {filteredDemos.length} demos
          </Badge>
        </div>
      </Card>

      {/* Demo Selection */}
      {!demoState.currentDemo && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDemos.map((demo) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="p-6 h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-indigo-600 dark:text-indigo-400">
                      {demo.icon}
                    </div>
                    <Badge className={getDifficultyColor(demo.difficulty)}>
                      {demo.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                      {demo.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {demo.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Duration:</span>
                      <span className="text-slate-700 dark:text-slate-300">{demo.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Steps:</span>
                      <span className="text-slate-700 dark:text-slate-300">{demo.steps.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {demo.tags.slice(0, 3).map(tag => (
                      <Badge 
                        key={tag} 
                        className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <button
                    onClick={() => startDemo(demo)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Demo
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Demo Player - Orchestration Specialized UI */}
      {demoState.currentDemo && currentStep && (
        <div className="space-y-6">
          {/* Demo Header */}
          <Card className="p-6 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-indigo-600 dark:text-indigo-400">
                  {demoState.currentDemo.icon}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {demoState.currentDemo.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Step {demoState.currentStep + 1} of {demoState.currentDemo.steps.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDemoState(prev => ({ ...prev, currentDemo: null }))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 
                           rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Exit Demo
                </button>
              </div>
            </div>

            {/* Orchestration Progress Visualization */}
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Orchestration Progress</span>
                <span>{Math.round(((demoState.currentStep + 1) / demoState.currentDemo.steps.length) * 100)}%</span>
              </div>
              
              {/* Orchestration Stages */}
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-3 rounded-full flex items-center justify-center ${
                  demoState.currentStep >= 0 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                }`} title="Planning">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <div className={`flex-1 h-3 rounded-full flex items-center justify-center ${
                  demoState.currentStep >= 1 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                }`} title="Coordination">
                  <Network className="w-3 h-3 text-white" />
                </div>
                <div className={`flex-1 h-3 rounded-full flex items-center justify-center ${
                  demoState.currentStep >= 2 ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'
                }`} title="Execution">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>🧠 Plan</span>
                <span>🔗 Coordinate</span>
                <span>⚡ Execute</span>
              </div>
            </div>
          </Card>

          {/* Current Step with Orchestration Focus */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Step Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {currentStep.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      {demoState.completedSteps.has(currentStep.id) && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400">
                    {currentStep.description}
                  </p>

                  {/* Step Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Orchestration Progress</span>
                      <span className="text-slate-900 dark:text-slate-100">{Math.round(demoState.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${demoState.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Orchestration Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      {demoState.currentStep > 0 && (
                        <button
                          onClick={previousStep}
                          className="flex items-center gap-1 px-3 py-2 border border-slate-300 dark:border-slate-600 
                                   text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          Previous
                        </button>
                      )}

                      <button
                        onClick={resetDemo}
                        className="p-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 
                                 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={playDemo}
                        disabled={demoState.isPlaying || demoState.completedSteps.has(currentStep.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg 
                                 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {demoState.isPlaying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Orchestrating...
                          </>
                        ) : demoState.completedSteps.has(currentStep.id) ? (
                          <>
                            <Network className="w-4 h-4" />
                            Coordinated
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Run Orchestration
                          </>
                        )}
                      </button>

                      {demoState.currentStep < demoState.currentDemo.steps.length - 1 && (
                        <button
                          onClick={nextStep}
                          disabled={!demoState.completedSteps.has(currentStep.id)}
                          className="flex items-center gap-1 px-4 py-2 border border-slate-300 dark:border-slate-600 
                                   text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Visualization */}
              <Card className="p-6">
                <div className="space-y-4">
                  <h6 className="font-medium text-slate-900 dark:text-slate-100">
                    Orchestration Visualization
                  </h6>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                    {currentStep.visualization}
                  </div>
                  
                  {currentStep.interactiveElements && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                        Interactive Elements
                      </h6>
                      {currentStep.interactiveElements}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Orchestration Insights Panel */}
            <Card className="p-6 border-2 border-indigo-200 dark:border-indigo-800">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-500" />
                  <h6 className="font-medium text-slate-900 dark:text-slate-100">
                    Orchestration Insights
                  </h6>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {demoState.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            {insight}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {demoState.insights.length === 0 && (
                    <div className="text-center py-8">
                      <Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        Run orchestration to see insights
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function generateOrchestrationDemos(): MethodologyDemo[] {
  return [
    {
      id: 'command-orchestration',
      title: 'Command Orchestration Patterns',
      description: 'Learn how commands chain together for complex workflows and automation',
      icon: <Layers className="w-6 h-6" />,
      difficulty: 'intermediate',
      estimatedTime: '10 min',
      category: 'automation',
      tags: ['commands', 'orchestration', 'workflow', 'automation'],
      steps: [
        {
          id: 'command-chaining',
          title: 'Basic Command Chaining',
          description: 'Understanding how commands connect and pass data between stages',
          explanation: 'Command chaining allows complex workflows to be built from simple, reusable components. Each command outputs data that becomes input for the next command, creating powerful automation pipelines.',
          duration: 4000,
          keyInsights: [
            'Modular commands enable flexible workflow composition',
            'Data flows seamlessly between chained commands',
            'Error handling prevents cascade failures'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Code className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <div className="text-xs">/analyze</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <div className="text-xs">/synthesize</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <div className="text-xs">/execute</div>
                </div>
              </div>
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                3-stage pipeline with data flow
              </div>
            </div>
          )
        },
        {
          id: 'parallel-coordination',
          title: 'Parallel Command Coordination',
          description: 'Orchestrating multiple commands to run simultaneously',
          explanation: 'Parallel coordination allows multiple independent commands to execute simultaneously, significantly improving performance. The orchestrator manages dependencies and ensures proper synchronization.',
          duration: 5000,
          keyInsights: [
            'Parallel execution improves performance by 300%',
            'Dependency analysis prevents execution conflicts',
            'Synchronization ensures consistent results'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Parallel Execution</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">3 commands running simultaneously</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                  <Workflow className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                  <div className="text-xs">Process A</div>
                  <div className="mt-2 h-2 bg-indigo-200 dark:bg-indigo-800 rounded">
                    <div className="h-full bg-indigo-500 rounded animate-pulse" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                  <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                  <div className="text-xs">Process B</div>
                  <div className="mt-2 h-2 bg-indigo-200 dark:bg-indigo-800 rounded">
                    <div className="h-full bg-indigo-500 rounded animate-pulse" style={{width: '60%', animationDelay: '0.5s'}}></div>
                  </div>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                  <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                  <div className="text-xs">Process C</div>
                  <div className="mt-2 h-2 bg-indigo-200 dark:bg-indigo-800 rounded">
                    <div className="h-full bg-indigo-500 rounded animate-pulse" style={{width: '90%', animationDelay: '1s'}}></div>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-indigo-600 dark:text-indigo-400">
                Synchronized parallel execution
              </div>
            </div>
          )
        },
        {
          id: 'dependency-management',
          title: 'Dependency Management',
          description: 'Managing complex dependencies between orchestrated commands',
          explanation: 'Dependency management ensures that commands execute in the correct order while maximizing parallelization opportunities. The system automatically resolves dependencies and optimizes execution paths.',
          duration: 4500,
          keyInsights: [
            'Automatic dependency resolution optimizes execution order',
            'Circular dependency detection prevents infinite loops',
            'Dynamic scheduling adapts to changing conditions'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Dependency Graph</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Optimized execution order</div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Network className="w-32 h-32 text-green-300 dark:text-green-700" />
                </div>
                <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Command A (Ready)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Command B (Ready)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Command C (Waiting)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Command D (Waiting)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-green-600 dark:text-green-400">
                Dependencies resolved automatically
              </div>
            </div>
          )
        }
      ]
    }
  ]
}