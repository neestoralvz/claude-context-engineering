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
  Code
} from 'lucide-react'

interface DemoStep {
  id: string
  title: string
  description: string
  visualization: React.ReactNode
  interactiveElements?: React.ReactNode
  explanation: string
  duration: number
  keyInsights: string[]
}

interface MethodologyDemo {
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

interface DemoState {
  currentDemo: MethodologyDemo | null
  currentStep: number
  isPlaying: boolean
  progress: number
  insights: string[]
  completedSteps: Set<string>
}

export function MethodologyDemos() {
  const [demoState, setDemoState] = useState<DemoState>({
    currentDemo: null,
    currentStep: 0,
    isPlaying: false,
    progress: 0,
    insights: [],
    completedSteps: new Set()
  })

  const [demos] = useState<MethodologyDemo[]>(generateMethodologyDemos())
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
    ? demos 
    : demos.filter(demo => demo.category === selectedCategory)

  const currentStep = demoState.currentDemo?.steps[demoState.currentStep]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🎯 Interactive Methodology Demos
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Hands-on demonstrations of core Context Engineering concepts with interactive 
          visualizations, step-by-step explanations, and real-time insights.
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
              {['all', 'core', 'optimization', 'thinking', 'automation'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize
                    ${selectedCategory === category
                      ? 'bg-blue-600 text-white'
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
              <Card className="p-6 h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-blue-600 dark:text-blue-400">
                      {demo.icon}
                    </div>
                    <Badge className={getDifficultyColor(demo.difficulty)}>
                      {demo.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
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
                             bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Demo Player */}
      {demoState.currentDemo && (
        <div className="space-y-6">
          {/* Demo Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-blue-600 dark:text-blue-400">
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

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(((demoState.currentStep + 1) / demoState.currentDemo.steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((demoState.currentStep + 1) / demoState.currentDemo.steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {demoState.currentDemo.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-colors
                    ${index === demoState.currentStep 
                      ? 'bg-blue-500' 
                      : demoState.completedSteps.has(step.id)
                      ? 'bg-green-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                />
              ))}
            </div>
          </Card>

          {/* Current Step */}
          {currentStep && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Step Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Step Info */}
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
                        <span className="text-slate-600 dark:text-slate-400">Step Progress</span>
                        <span className="text-slate-900 dark:text-slate-100">{Math.round(demoState.progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${demoState.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Controls */}
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
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {demoState.isPlaying ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Running...
                            </>
                          ) : demoState.completedSteps.has(currentStep.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Run Step
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
                      Interactive Visualization
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

                {/* Explanation */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <h6 className="font-medium text-slate-900 dark:text-slate-100">
                      Detailed Explanation
                    </h6>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-slate-700 dark:text-slate-300">
                        {currentStep.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Insights Panel */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    <h6 className="font-medium text-slate-900 dark:text-slate-100">
                      Key Insights
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
                          className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-orange-800 dark:text-orange-200">
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
                          Run the step to see insights
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Summary */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                      Progress Summary
                    </h6>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Steps Completed:</span>
                        <span className="text-slate-900 dark:text-slate-100">
                          {demoState.completedSteps.size} / {demoState.currentDemo.steps.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Insights Gained:</span>
                        <span className="text-slate-900 dark:text-slate-100">
                          {demoState.insights.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Current Step:</span>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {currentStep.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function generateMethodologyDemos(): MethodologyDemo[] {
  return [
    {
      id: 'context-optimization',
      title: 'Context Optimization Fundamentals',
      description: 'Learn how intelligent lazy loading achieves 78% context reduction while maintaining 98% accuracy',
      icon: <Gauge className="w-6 h-6" />,
      difficulty: 'beginner',
      estimatedTime: '8 min',
      category: 'optimization',
      tags: ['context', 'optimization', 'performance', 'lazy-loading'],
      steps: [
        {
          id: 'context-baseline',
          title: 'Context Baseline Measurement',
          description: 'Understanding initial context size and usage patterns',
          explanation: 'Before optimization, we measure the full context size (typically ~15K tokens) and analyze which components are actually used during execution. This baseline helps us identify optimization opportunities.',
          duration: 3000,
          keyInsights: [
            'Most context goes unused in typical interactions (~85%)',
            'Loading everything upfront creates unnecessary overhead',
            'Different tasks require different context subsets'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">15,247</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Tokens (Baseline)</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="h-6 bg-red-200 dark:bg-red-800 rounded opacity-30"></div>
                ))}
              </div>
              <div className="text-xs text-center text-slate-500">
                Full context loaded - high memory usage
              </div>
            </div>
          )
        },
        {
          id: 'smart-loading',
          title: 'Smart Loading Implementation',
          description: 'Implementing intelligent context loading based on triggers',
          explanation: 'Smart loading uses mathematical triggers to determine what context to load. When complexity ≥ 0.9, load principles. When confidence < 0.7, load additional context. This selective approach dramatically reduces memory usage.',
          duration: 4000,
          keyInsights: [
            'Mathematical triggers determine loading requirements',
            'Context loaded incrementally based on actual needs',
            'Memory usage drops by ~78% on average'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">3,354</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Tokens (Optimized)</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`h-6 rounded ${
                    i < 4 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}></div>
                ))}
              </div>
              <div className="text-xs text-center text-slate-500">
                Only essential context loaded - 78% reduction
              </div>
              <MathFormula formula="\\text{Efficiency} = \\frac{\\text{Used Context}}{\\text{Total Available}} \\times 100" />
            </div>
          )
        },
        {
          id: 'accuracy-validation',
          title: 'Accuracy Preservation',
          description: 'Validating that optimization maintains output quality',
          explanation: 'The key challenge is reducing context without sacrificing accuracy. Through careful analysis and validation, we maintain 98% accuracy while achieving significant efficiency gains.',
          duration: 3500,
          keyInsights: [
            'Accuracy maintained at 98% despite 78% context reduction',
            'Quality metrics show no significant degradation',
            'Response time improved by 65% average'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">98%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy Maintained</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">78%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Context Reduced</div>
                </div>
              </div>
              <div className="h-24 flex items-end gap-2">
                <div className="flex-1 bg-green-500 rounded-t" style={{height: '98%'}}></div>
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '78%'}}></div>
                <div className="flex-1 bg-purple-500 rounded-t" style={{height: '65%'}}></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-center text-slate-500">
                <span>Accuracy</span>
                <span>Reduction</span>
                <span>Speed Gain</span>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'decision-engine',
      title: 'Decision Engine Mathematics',
      description: 'Explore the mathematical foundations of intelligent routing and auto-triggers',
      icon: <GitBranch className="w-6 h-6" />,
      difficulty: 'intermediate',
      estimatedTime: '12 min',
      category: 'core',
      tags: ['decision-engine', 'mathematics', 'routing', 'automation'],
      steps: [
        {
          id: 'threshold-calculation',
          title: 'Mathematical Threshold Calculation',
          description: 'Understanding how confidence and complexity scores determine routing',
          explanation: 'The decision engine uses precise mathematical formulas to calculate when to trigger different pathways. Complexity thresholds, confidence scoring, and contextual variables all contribute to intelligent routing decisions.',
          duration: 4500,
          keyInsights: [
            'Mathematical precision ensures consistent routing decisions',
            'Multiple variables contribute to threshold calculations',
            'Adaptive thresholds improve over time through machine learning'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <MathFormula formula="\\text{Route} = \\begin{cases} 
                  \\text{Progressive} & \\text{if } C \\geq 0.9 \\land \\text{conf} < 0.7 \\\\
                  \\text{Standard} & \\text{if } C < 0.9 \\land \\text{conf} \\geq 0.7 \\\\
                  \\text{Guided} & \\text{otherwise}
                \\end{cases}" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0.9</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Complexity Threshold</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0.7</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Confidence Threshold</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">92%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Routing Accuracy</div>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'auto-trigger-logic',
          title: 'Auto-Trigger Logic Implementation',
          description: 'How the system automatically determines when to load additional context',
          explanation: 'Auto-triggers use conditional logic based on real-time analysis. When specific conditions are met (low confidence, high complexity, or specific command patterns), the system automatically loads additional context without user intervention.',
          duration: 5000,
          keyInsights: [
            'Automated decision-making reduces cognitive load',
            'Conditional logic ensures optimal resource utilization',
            'Real-time adaptation improves user experience'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm">Complexity ≥ 0.9 → Load Progressive Thinking</span>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm">Confidence &lt; 0.7 → Load Principles</span>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm">Command Chain → Load Dependencies</span>
                  <Clock className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  3 Active Triggers
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Monitoring system state continuously
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'progressive-thinking',
      title: 'Progressive Thinking Methodology',
      description: '4-stage cognitive process: Surface Analysis → Pattern Recognition → Deep Synthesis → Strategic Integration',
      icon: <Brain className="w-6 h-6" />,
      difficulty: 'advanced',
      estimatedTime: '15 min',
      category: 'thinking',
      tags: ['progressive-thinking', 'cognition', 'analysis', 'synthesis'],
      steps: [
        {
          id: 'surface-analysis',
          title: 'Stage 1: Surface Analysis',
          description: 'Initial problem understanding and context gathering',
          explanation: 'Surface analysis establishes the foundational understanding of the problem space. This stage focuses on gathering explicit information, identifying constraints, and mapping the known elements before diving deeper.',
          duration: 4000,
          keyInsights: [
            'Systematic information gathering prevents oversight',
            'Clear problem definition guides subsequent analysis',
            'Initial constraints shape solution boundaries'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Stage 1</div>
                <div className="text-lg text-slate-900 dark:text-slate-100">Surface Analysis</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
                  <div className="h-3 bg-blue-300 dark:bg-blue-700 rounded animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="h-3 bg-blue-400 dark:bg-blue-600 rounded animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Gathering information...</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Identifying constraints...</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Mapping problem space...</div>
                </div>
              </div>
              <MathFormula formula="S = \\sum_{i=1}^{n} w_i \\cdot c_i" />
            </div>
          )
        },
        {
          id: 'pattern-recognition',
          title: 'Stage 2: Pattern Recognition',
          description: 'Identifying underlying patterns and relationships',
          explanation: 'Pattern recognition looks beyond surface information to identify recurring themes, hidden relationships, and structural similarities. This stage leverages both explicit data and implicit connections.',
          duration: 5000,
          keyInsights: [
            'Hidden patterns often reveal key insights',
            'Cross-domain similarities provide new perspectives',
            'Structural analysis uncovers fundamental relationships'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Stage 2</div>
                <div className="text-lg text-slate-900 dark:text-slate-100">Pattern Recognition</div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`h-8 rounded ${
                      [0, 2, 4, 6, 8].includes(i) 
                        ? 'bg-purple-400 dark:bg-purple-600' 
                        : 'bg-purple-200 dark:bg-purple-800'
                    }`}></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-semibold">Pattern Detected</div>
                </div>
              </div>
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                5/9 elements show recurring pattern
              </div>
            </div>
          )
        },
        {
          id: 'deep-synthesis',
          title: 'Stage 3: Deep Synthesis',
          description: 'Connecting disparate elements for breakthrough insights',
          explanation: 'Deep synthesis is where breakthrough insights emerge. By connecting previously unrelated elements, challenging assumptions, and exploring novel combinations, this stage often produces paradigm-shifting discoveries.',
          duration: 6000,
          keyInsights: [
            'Breakthrough insights emerge from unexpected connections',
            'Challenging assumptions opens new possibilities',
            'Synthesis transcends individual component analysis'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">Stage 3</div>
                <div className="text-lg text-slate-900 dark:text-slate-100">Deep Synthesis</div>
              </div>
              <div className="relative h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-orange-500 animate-pulse" />
                </div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
              </div>
              <div className="text-center text-sm text-orange-600 dark:text-orange-400 font-semibold">
                🌟 Breakthrough Insight Detected!
              </div>
            </div>
          )
        },
        {
          id: 'strategic-integration',
          title: 'Stage 4: Strategic Integration',
          description: 'Synthesizing insights into actionable strategies',
          explanation: 'Strategic integration transforms insights into concrete, actionable strategies. This final stage ensures that breakthrough discoveries become practical implementations with clear next steps and measurable outcomes.',
          duration: 4500,
          keyInsights: [
            'Insights must translate into actionable strategies',
            'Implementation planning ensures practical application',
            'Strategic frameworks enable systematic execution'
          ],
          visualization: (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Stage 4</div>
                <div className="text-lg text-slate-900 dark:text-slate-100">Strategic Integration</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <div className="text-xs">Strategy A</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <div className="text-xs">Strategy B</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <Activity className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <div className="text-xs">Strategy C</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  3 Actionable Strategies Generated
                </div>
              </div>
            </div>
          )
        }
      ]
    },
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
        }
      ]
    }
  ]
}