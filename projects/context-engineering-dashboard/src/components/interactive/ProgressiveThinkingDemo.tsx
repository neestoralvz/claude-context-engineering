'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula } from '@/components/ui/MathFormula'
import { 
  Brain, 
  Lightbulb, 
  Zap, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  TrendingUp,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react'

interface ThinkingStage {
  id: string
  name: string
  description: string
  formula?: string
  duration: number
  insights: string[]
  outputs: string[]
  connections: string[]
  status: 'pending' | 'active' | 'completed'
  progress: number
  breakthrough?: boolean
}

interface ThinkingSession {
  id: string
  problem: string
  complexity: number
  stages: ThinkingStage[]
  totalInsights: number
  breakthroughs: number
  finalSynthesis: string
  confidence: number
  nextSteps: string[]
}

interface DemoScenario {
  id: string
  title: string
  problem: string
  complexity: number
  description: string
  expectedInsights: number
  domain: string
}

export function ProgressiveThinkingDemo() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null)
  const [session, setSession] = useState<ThinkingSession | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [scenarios] = useState<DemoScenario[]>(generateScenarios())

  const initializeSession = useCallback((scenario: DemoScenario) => {
    const stages: ThinkingStage[] = [
      {
        id: 'surface-analysis',
        name: '🔍 Surface Analysis',
        description: 'Initial problem understanding and context gathering',
        formula: 'S = \\sum_{i=1}^{n} w_i \\cdot c_i',
        duration: 3000,
        insights: [],
        outputs: [],
        connections: [],
        status: 'pending',
        progress: 0
      },
      {
        id: 'pattern-recognition',
        name: '🧩 Pattern Recognition',
        description: 'Identifying underlying patterns and relationships',
        formula: 'P = \\frac{\\text{patterns found}}{\\text{total elements}} \\times \\text{relevance}',
        duration: 4000,
        insights: [],
        outputs: [],
        connections: [],
        status: 'pending',
        progress: 0
      },
      {
        id: 'deep-synthesis',
        name: '⚡ Deep Synthesis',
        description: 'Connecting disparate elements for breakthrough insights',
        formula: 'D = \\sqrt{\\text{connections}^2 + \\text{novelty}^2}',
        duration: 5000,
        insights: [],
        outputs: [],
        connections: [],
        status: 'pending',
        progress: 0,
        breakthrough: true
      },
      {
        id: 'strategic-integration',
        name: '🎯 Strategic Integration',
        description: 'Synthesizing insights into actionable strategies',
        formula: 'I = \\int_{0}^{t} \\text{insight}(t) \\cdot \\text{applicability}(t) \\, dt',
        duration: 3500,
        insights: [],
        outputs: [],
        connections: [],
        status: 'pending',
        progress: 0
      }
    ]

    const newSession: ThinkingSession = {
      id: Date.now().toString(),
      problem: scenario.problem,
      complexity: scenario.complexity,
      stages,
      totalInsights: 0,
      breakthroughs: 0,
      finalSynthesis: '',
      confidence: 0,
      nextSteps: []
    }

    setSession(newSession)
    setCurrentStageIndex(0)
  }, [])

  useEffect(() => {
    if (selectedScenario) {
      initializeSession(selectedScenario)
    }
  }, [selectedScenario, initializeSession])

  const runProgressiveThinking = async () => {
    if (!session || isRunning) return

    setIsRunning(true)

    for (let stageIndex = 0; stageIndex < session.stages.length; stageIndex++) {
      setCurrentStageIndex(stageIndex)
      
      // Update stage status to active
      setSession(prev => {
        if (!prev) return prev
        const newStages = [...prev.stages]
        newStages[stageIndex] = { ...newStages[stageIndex], status: 'active' }
        return { ...prev, stages: newStages }
      })

      // Simulate stage processing with progress updates
      const stage = session.stages[stageIndex]
      const progressInterval = 100
      const steps = stage.duration / progressInterval

      for (let step = 0; step <= steps; step++) {
        if (!autoPlay && isRunning) {
          await new Promise(resolve => {
            const checkPlay = () => {
              if (autoPlay || !isRunning) resolve(undefined)
              else setTimeout(checkPlay, 100)
            }
            checkPlay()
          })
        }

        const progress = step / steps
        
        setSession(prev => {
          if (!prev) return prev
          const newStages = [...prev.stages]
          newStages[stageIndex] = { 
            ...newStages[stageIndex], 
            progress: progress * 100 
          }
          return { ...prev, stages: newStages }
        })

        // Generate insights at specific progress points
        if (step === Math.floor(steps * 0.3)) {
          await generateStageInsights(stageIndex, 'early')
        } else if (step === Math.floor(steps * 0.7)) {
          await generateStageInsights(stageIndex, 'middle')
        }

        if (isRunning) {
          await new Promise(resolve => setTimeout(resolve, progressInterval))
        }
      }

      // Complete the stage
      await generateStageInsights(stageIndex, 'final')
      
      setSession(prev => {
        if (!prev) return prev
        const newStages = [...prev.stages]
        newStages[stageIndex] = { 
          ...newStages[stageIndex], 
          status: 'completed',
          progress: 100
        }
        return { ...prev, stages: newStages }
      })

      // Brief pause between stages
      if (stageIndex < session.stages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Generate final synthesis
    await generateFinalSynthesis()
    setIsRunning(false)
  }

  const generateStageInsights = async (stageIndex: number, phase: 'early' | 'middle' | 'final') => {
    const stage = session?.stages[stageIndex]
    if (!stage || !selectedScenario) return

    const insightSets = {
      'surface-analysis': {
        early: [`Identified core problem: ${selectedScenario.problem}`, 'Establishing baseline understanding'],
        middle: ['Mapping initial constraints and variables', 'Cataloging known approaches and limitations'],
        final: ['Problem space fully characterized', 'Ready for deeper pattern analysis']
      },
      'pattern-recognition': {
        early: ['Detecting recurring themes and structures', 'Cross-referencing similar problem domains'],
        middle: ['Identifying non-obvious connections', 'Recognizing emerging patterns in data'],
        final: ['Pattern matrix complete', 'Key relationships mapped and validated']
      },
      'deep-synthesis': {
        early: ['🌟 Breakthrough: Novel connection discovered!', 'Synthesizing disparate elements'],
        middle: ['🔥 Critical insight: Hidden assumption identified', 'Paradigm shift emerging'],
        final: ['⚡ Major breakthrough: Revolutionary approach found', 'Synthesis crystallizing into actionable framework']
      },
      'strategic-integration': {
        early: ['Translating insights into strategic options', 'Evaluating implementation pathways'],
        middle: ['Optimizing resource allocation strategies', 'Risk-benefit analysis in progress'],
        final: ['Strategic framework complete', 'Implementation roadmap finalized']
      }
    }

    const outputs = {
      'surface-analysis': [
        'Problem decomposition matrix',
        'Constraint analysis report',
        'Baseline metrics established'
      ],
      'pattern-recognition': [
        'Pattern correlation map',
        'Similarity clustering analysis',
        'Anomaly detection results'
      ],
      'deep-synthesis': [
        '🎯 Breakthrough innovation framework',
        '⭐ Novel solution architecture',
        '🚀 Paradigm-shifting approach'
      ],
      'strategic-integration': [
        'Implementation strategy document',
        'Resource optimization plan',
        'Success metrics framework'
      ]
    }

    const newInsights = insightSets[stage.id as keyof typeof insightSets]?.[phase] || []
    const newOutputs = phase === 'final' ? outputs[stage.id as keyof typeof outputs] || [] : []

    setSession(prev => {
      if (!prev) return prev
      const newStages = [...prev.stages]
      const currentStage = newStages[stageIndex]
      
      newStages[stageIndex] = {
        ...currentStage,
        insights: [...currentStage.insights, ...newInsights],
        outputs: [...currentStage.outputs, ...newOutputs],
        connections: [...currentStage.connections, ...generateConnections(stageIndex)]
      }
      
      return { 
        ...prev, 
        stages: newStages,
        totalInsights: prev.totalInsights + newInsights.length,
        breakthroughs: prev.breakthroughs + (stage.breakthrough && phase === 'middle' ? 1 : 0)
      }
    })
  }

  const generateConnections = (stageIndex: number): string[] => {
    const connections = [
      ['Previous experience', 'Current analysis'],
      ['Domain expertise', 'Novel patterns'],
      ['Theoretical framework', 'Practical constraints'],
      ['Historical precedents', 'Future possibilities'],
      ['Cross-domain insights', 'Specific applications']
    ]
    
    return [connections[stageIndex] || ['Element A', 'Element B']].map(conn => conn.join(' ↔ '))
  }

  const generateFinalSynthesis = async () => {
    if (!session || !selectedScenario) return

    const synthesis = `Progressive thinking analysis of "${selectedScenario.problem}" revealed ${session.totalInsights} key insights across ${session.stages.length} cognitive stages. 

🧠 **Breakthrough Insights**: ${session.breakthroughs} paradigm-shifting discoveries
🎯 **Strategic Framework**: Multi-layered approach with ${Math.floor(Math.random() * 5 + 3)} implementation vectors
⚡ **Innovation Potential**: ${(session.complexity * 85 + 15).toFixed(0)}% improvement over conventional approaches

The synthesis integrates surface-level analysis with deep pattern recognition, culminating in strategically actionable insights that transcend traditional problem-solving boundaries.`

    const nextSteps = [
      'Implement breakthrough framework in pilot project',
      'Validate strategic assumptions through targeted testing',
      'Scale successful patterns across related domains',
      'Document learnings for future progressive thinking sessions'
    ]

    setSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        finalSynthesis: synthesis,
        confidence: Math.min(0.85 + (prev.breakthroughs * 0.05), 0.98),
        nextSteps
      }
    })
  }

  const resetSession = () => {
    setIsRunning(false)
    setCurrentStageIndex(0)
    if (selectedScenario) {
      initializeSession(selectedScenario)
    }
  }

  const togglePlayPause = () => {
    setAutoPlay(!autoPlay)
  }

  const getStageIcon = (stage: ThinkingStage) => {
    if (stage.status === 'active') {
      return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
    }
    if (stage.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    
    const icons = {
      'surface-analysis': <Eye className="w-5 h-5 text-slate-500" />,
      'pattern-recognition': <Layers className="w-5 h-5 text-slate-500" />,
      'deep-synthesis': <Sparkles className="w-5 h-5 text-slate-500" />,
      'strategic-integration': <Target className="w-5 h-5 text-slate-500" />
    }
    
    return icons[stage.id as keyof typeof icons] || <Brain className="w-5 h-5 text-slate-500" />
  }

  const getStageColor = (stage: ThinkingStage): string => {
    if (stage.status === 'active') {
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
    if (stage.status === 'completed') {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    }
    return 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🧠 Progressive Thinking Demonstration
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Experience the 4-stage progressive thinking methodology in action. Watch as surface analysis 
          evolves through pattern recognition and deep synthesis into strategic integration.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scenario Selection & Controls */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Demo Scenarios
              </h4>
            </div>

            <div className="space-y-2">
              {scenarios.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedScenario?.id === scenario.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {scenario.title}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {scenario.description}
                  </p>
                  <div className="flex justify-between text-xs">
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                      {scenario.domain}
                    </Badge>
                    <span className="text-slate-500">
                      C: {scenario.complexity.toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Session Info */}
            {session && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Current Session
                </h5>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Insights:</span>
                    <span className="text-slate-900 dark:text-slate-100">{session.totalInsights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Breakthroughs:</span>
                    <span className="text-orange-600 dark:text-orange-400">{session.breakthroughs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Stage:</span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {currentStageIndex + 1} / {session.stages.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={runProgressiveThinking}
                disabled={!selectedScenario || isRunning}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                         bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Start Thinking'}
              </button>
              
              {isRunning && (
                <button
                  onClick={togglePlayPause}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 
                           text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                           dark:hover:bg-slate-800 transition-colors"
                >
                  {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              
              <button
                onClick={resetSession}
                disabled={isRunning}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                         dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Thinking Stages */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Thinking Process
                </h4>
              </div>

              {session && (
                <div className="space-y-4">
                  {/* Problem Statement */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Problem Statement
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {session.problem}
                    </p>
                  </div>

                  {/* Stages */}
                  <div className="space-y-4">
                    {session.stages.map((stage, index) => (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${getStageColor(stage)}`}
                      >
                        <div className="space-y-3">
                          {/* Stage Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStageIcon(stage)}
                              <div>
                                <h6 className="font-medium text-slate-900 dark:text-slate-100">
                                  {stage.name}
                                </h6>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {stage.description}
                                </p>
                              </div>
                            </div>
                            
                            {stage.status === 'active' && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                  {stage.progress.toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Formula */}
                          {stage.formula && (
                            <div className="p-3 bg-white dark:bg-slate-900 rounded border">
                              <MathFormula formula={stage.formula} className="text-sm" />
                            </div>
                          )}

                          {/* Progress Bar */}
                          {stage.status !== 'pending' && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <motion.div
                                className="bg-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}

                          {/* Insights */}
                          <AnimatePresence>
                            {stage.insights.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  💡 Insights
                                </h6>
                                <div className="space-y-1">
                                  {stage.insights.map((insight, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                      <span className={
                                        insight.includes('🌟') || insight.includes('🔥') || insight.includes('⚡')
                                          ? 'text-orange-600 dark:text-orange-400 font-medium'
                                          : 'text-slate-600 dark:text-slate-400'
                                      }>
                                        {insight}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Outputs */}
                          <AnimatePresence>
                            {stage.outputs.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  📊 Outputs
                                </h6>
                                <div className="grid grid-cols-1 gap-1">
                                  {stage.outputs.map((output, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="p-2 bg-white dark:bg-slate-900 rounded border text-xs"
                                    >
                                      <span className={
                                        output.includes('🎯') || output.includes('⭐') || output.includes('🚀')
                                          ? 'text-purple-600 dark:text-purple-400 font-medium'
                                          : 'text-slate-700 dark:text-slate-300'
                                      }>
                                        {output}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Connections */}
                          <AnimatePresence>
                            {stage.connections.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  🔗 Connections
                                </h6>
                                <div className="space-y-1">
                                  {stage.connections.map((connection, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="text-xs text-slate-600 dark:text-slate-400 
                                               bg-white dark:bg-slate-900 p-2 rounded border"
                                    >
                                      {connection}
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Final Synthesis */}
                  <AnimatePresence>
                    {session.finalSynthesis && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-primary-50 dark:bg-primary-900/20 
                                 rounded-lg border border-primary-200 dark:border-primary-800"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              🧠 Progressive Thinking Synthesis
                            </h5>
                          </div>
                          
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
                              {session.finalSynthesis}
                            </pre>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  Confidence: {(session.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-blue-500" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  Next Steps: {session.nextSteps.length}
                                </span>
                              </div>
                            </div>
                          </div>

                          {session.nextSteps.length > 0 && (
                            <div className="space-y-2">
                              <h6 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                🎯 Recommended Next Steps
                              </h6>
                              <div className="grid gap-1">
                                {session.nextSteps.map((step, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                                  >
                                    <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                    <span>{step}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function generateScenarios(): DemoScenario[] {
  return [
    {
      id: 'system-optimization',
      title: 'System Architecture Optimization',
      problem: 'Design a scalable, efficient architecture for a complex distributed system handling millions of requests',
      complexity: 2.4,
      description: 'Multi-layered optimization requiring performance, scalability, and reliability analysis',
      expectedInsights: 12,
      domain: 'Architecture'
    },
    {
      id: 'strategic-planning',
      title: 'Strategic Business Planning',
      problem: 'Develop a 5-year strategic plan for digital transformation in a traditional industry',
      complexity: 2.1,
      description: 'Complex business strategy requiring market analysis and change management',
      expectedInsights: 15,
      domain: 'Strategy'
    },
    {
      id: 'creative-innovation',
      title: 'Creative Problem Innovation',
      problem: 'Design an innovative solution for reducing urban traffic congestion using emerging technologies',
      complexity: 2.6,
      description: 'Cross-disciplinary innovation requiring creative synthesis of multiple domains',
      expectedInsights: 18,
      domain: 'Innovation'
    },
    {
      id: 'scientific-research',
      title: 'Scientific Research Design',
      problem: 'Structure a research methodology to validate a novel hypothesis in computational biology',
      complexity: 2.8,
      description: 'Rigorous scientific approach requiring hypothesis validation and experimental design',
      expectedInsights: 14,
      domain: 'Research'
    },
    {
      id: 'product-development',
      title: 'Product Development Strategy',
      problem: 'Launch a disruptive product in a saturated market with limited resources',
      complexity: 2.2,
      description: 'Market penetration strategy requiring competitive analysis and resource optimization',
      expectedInsights: 13,
      domain: 'Product'
    }
  ]
}