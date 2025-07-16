'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula } from '@/components/ui/MathFormula'
import { 
  Brain, 
  GitBranch, 
  Calculator, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Info,
  TrendingUp,
  Settings,
  Play,
  RotateCcw
} from 'lucide-react'

interface DecisionNode {
  id: string
  type: 'condition' | 'action' | 'result'
  label: string
  formula?: string
  threshold?: number
  value?: number
  confidence?: number
  children?: string[]
  parents?: string[]
  status: 'pending' | 'evaluating' | 'passed' | 'failed' | 'completed'
  explanation?: string
  recommendations?: string[]
}

interface DecisionPath {
  id: string
  nodes: string[]
  probability: number
  outcome: string
  confidence: number
  explanation: string
}

interface DecisionScenario {
  id: string
  name: string
  description: string
  complexity: number
  confidence: number
  context: string
  variables: Record<string, number>
}

export function DecisionEngineVisualization() {
  const [selectedScenario, setSelectedScenario] = useState<DecisionScenario | null>(null)
  const [decisionTree, setDecisionTree] = useState<Record<string, DecisionNode>>({})
  const [activePath, setActivePath] = useState<DecisionPath | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [scenarios] = useState<DecisionScenario[]>(generateScenarios())

  const [variables, setVariables] = useState({
    complexity: 0.8,
    confidence: 0.7,
    context_size: 0.6,
    user_experience: 0.5,
    time_pressure: 0.3
  })

  useEffect(() => {
    if (selectedScenario) {
      initializeDecisionTree(selectedScenario)
    }
  }, [selectedScenario])

  const initializeDecisionTree = useCallback((scenario: DecisionScenario) => {
    const tree: Record<string, DecisionNode> = {
      'complexity-check': {
        id: 'complexity-check',
        type: 'condition',
        label: 'Complexity Analysis',
        formula: 'C = \\sqrt{(complexity^2 + context\\_size^2)} \\geq 0.9',
        threshold: 0.9,
        value: Math.sqrt(Math.pow(scenario.complexity, 2) + Math.pow(variables.context_size, 2)),
        status: 'pending',
        children: ['progressive-thinking', 'standard-processing'],
        explanation: 'Determines if progressive thinking is required based on complexity and context size'
      },
      'confidence-check': {
        id: 'confidence-check',
        type: 'condition',
        label: 'Confidence Validation',
        formula: 'confidence < 0.7',
        threshold: 0.7,
        value: scenario.confidence,
        status: 'pending',
        children: ['load-principles', 'direct-execution'],
        explanation: 'Evaluates if additional principle loading is needed based on confidence level'
      },
      'experience-check': {
        id: 'experience-check',
        type: 'condition',
        label: 'User Experience Assessment',
        formula: 'UX = user\\_experience \\times (1 - time\\_pressure)',
        threshold: 0.4,
        value: variables.user_experience * (1 - variables.time_pressure),
        status: 'pending',
        children: ['guided-mode', 'expert-mode'],
        explanation: 'Determines appropriate interaction mode based on user experience and time constraints'
      },
      'progressive-thinking': {
        id: 'progressive-thinking',
        type: 'action',
        label: 'Activate Progressive Thinking',
        status: 'pending',
        parents: ['complexity-check'],
        children: ['deep-analysis'],
        explanation: 'Engages 4-stage progressive thinking for complex scenarios',
        recommendations: ['Use /thinking command', 'Enable detailed logging', 'Allocate additional processing time']
      },
      'standard-processing': {
        id: 'standard-processing',
        type: 'action',
        label: 'Standard Processing',
        status: 'pending',
        parents: ['complexity-check'],
        children: ['quick-execution'],
        explanation: 'Uses standard command processing for simpler scenarios'
      },
      'load-principles': {
        id: 'load-principles',
        type: 'action',
        label: 'Load Relevant Principles',
        status: 'pending',
        parents: ['confidence-check'],
        children: ['principle-integration'],
        explanation: 'Loads appropriate principle categories to boost confidence',
        recommendations: ['Load philosophical foundations', 'Include relevant technical standards', 'Apply mathematical rigor']
      },
      'direct-execution': {
        id: 'direct-execution',
        type: 'action',
        label: 'Direct Execution',
        status: 'pending',
        parents: ['confidence-check'],
        children: ['validation'],
        explanation: 'Proceeds with execution using existing context'
      },
      'guided-mode': {
        id: 'guided-mode',
        type: 'action',
        label: 'Guided Interaction Mode',
        status: 'pending',
        parents: ['experience-check'],
        children: ['onboarding-flow'],
        explanation: 'Provides step-by-step guidance and explanations'
      },
      'expert-mode': {
        id: 'expert-mode',
        type: 'action',
        label: 'Expert Mode',
        status: 'pending',
        parents: ['experience-check'],
        children: ['advanced-tools'],
        explanation: 'Enables advanced features and minimal guidance'
      },
      'deep-analysis': {
        id: 'deep-analysis',
        type: 'result',
        label: 'Deep Analysis Complete',
        status: 'pending',
        parents: ['progressive-thinking'],
        explanation: 'Comprehensive analysis with breakthrough insights'
      },
      'quick-execution': {
        id: 'quick-execution',
        type: 'result',
        label: 'Quick Execution',
        status: 'pending',
        parents: ['standard-processing'],
        explanation: 'Efficient processing with standard outputs'
      },
      'principle-integration': {
        id: 'principle-integration',
        type: 'result',
        label: 'Principles Integrated',
        status: 'pending',
        parents: ['load-principles'],
        explanation: 'Enhanced context with relevant principles'
      },
      'validation': {
        id: 'validation',
        type: 'result',
        label: 'Validation Complete',
        status: 'pending',
        parents: ['direct-execution'],
        explanation: 'Standard validation and verification'
      },
      'onboarding-flow': {
        id: 'onboarding-flow',
        type: 'result',
        label: 'Guided Experience',
        status: 'pending',
        parents: ['guided-mode'],
        explanation: 'User-friendly guided workflow'
      },
      'advanced-tools': {
        id: 'advanced-tools',
        type: 'result',
        label: 'Advanced Tools Enabled',
        status: 'pending',
        parents: ['expert-mode'],
        explanation: 'Full feature access for expert users'
      }
    }

    setDecisionTree(tree)
  }, [variables])

  const evaluateDecisionTree = async () => {
    if (!selectedScenario) return

    setIsProcessing(true)
    setCurrentStep(0)

    const evaluationOrder = [
      'complexity-check',
      'confidence-check', 
      'experience-check'
    ]

    const path: string[] = []
    let currentNodes = evaluationOrder

    for (let i = 0; i < currentNodes.length; i++) {
      const nodeId = currentNodes[i]
      setCurrentStep(i + 1)

      // Update node status to evaluating
      setDecisionTree(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], status: 'evaluating' }
      }))

      await new Promise(resolve => setTimeout(resolve, 1000))

      const node = decisionTree[nodeId]
      let passed = false

      // Evaluate condition
      if (node.formula && node.threshold !== undefined && node.value !== undefined) {
        if (node.formula.includes('≥') || node.formula.includes('>=')) {
          passed = node.value >= node.threshold
        } else if (node.formula.includes('<')) {
          passed = node.value < node.threshold
        } else {
          passed = node.value > node.threshold
        }
      }

      // Update node status and path
      const status = passed ? 'passed' : 'failed'
      setDecisionTree(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], status }
      }))

      path.push(nodeId)

      // Determine next nodes based on evaluation
      if (node.children) {
        const nextNodeId = passed ? node.children[0] : node.children[1]
        if (nextNodeId) {
          path.push(nextNodeId)
          
          // Update next node status
          setDecisionTree(prev => ({
            ...prev,
            [nextNodeId]: { ...prev[nextNodeId], status: 'evaluating' }
          }))

          await new Promise(resolve => setTimeout(resolve, 800))

          setDecisionTree(prev => ({
            ...prev,
            [nextNodeId]: { ...prev[nextNodeId], status: 'completed' }
          }))

          // Find final result
          const nextNode = decisionTree[nextNodeId]
          if (nextNode.children) {
            const finalNodeId = nextNode.children[0]
            path.push(finalNodeId)
            
            setDecisionTree(prev => ({
              ...prev,
              [finalNodeId]: { ...prev[finalNodeId], status: 'completed' }
            }))
          }
        }
      }
    }

    // Generate decision path
    const finalPath: DecisionPath = {
      id: Date.now().toString(),
      nodes: path,
      probability: calculatePathProbability(path),
      outcome: determineOutcome(path),
      confidence: calculatePathConfidence(path),
      explanation: generatePathExplanation(path)
    }

    setActivePath(finalPath)
    setIsProcessing(false)
  }

  const calculatePathProbability = (path: string[]): number => {
    return Math.random() * 0.3 + 0.7 // 70-100%
  }

  const calculatePathConfidence = (path: string[]): number => {
    let confidence = 0.8
    path.forEach(nodeId => {
      const node = decisionTree[nodeId]
      if (node.type === 'condition' && node.status === 'passed') {
        confidence += 0.05
      }
    })
    return Math.min(confidence, 0.99)
  }

  const determineOutcome = (path: string[]): string => {
    const lastNode = path[path.length - 1]
    const node = decisionTree[lastNode]
    return node.label
  }

  const generatePathExplanation = (path: string[]): string => {
    const conditions = path.filter(nodeId => decisionTree[nodeId].type === 'condition')
    const actions = path.filter(nodeId => decisionTree[nodeId].type === 'action')
    const result = path.find(nodeId => decisionTree[nodeId].type === 'result')

    return `Based on ${conditions.length} condition evaluations, the system determined that ${actions.map(id => decisionTree[id].label.toLowerCase()).join(' and ')} leading to ${decisionTree[result || '']?.label.toLowerCase() || 'completion'}.`
  }

  const resetDecisionTree = () => {
    setActivePath(null)
    setCurrentStep(0)
    setIsProcessing(false)
    
    if (selectedScenario) {
      initializeDecisionTree(selectedScenario)
    }
  }

  const getNodeColor = (node: DecisionNode): string => {
    switch (node.status) {
      case 'evaluating': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'passed': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      case 'failed': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'completed': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
      default: return 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
    }
  }

  const getNodeIcon = (node: DecisionNode) => {
    if (node.status === 'evaluating') return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
    if (node.status === 'passed') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (node.status === 'failed') return <AlertTriangle className="w-4 h-4 text-orange-500" />
    if (node.status === 'completed') return <Target className="w-4 h-4 text-purple-500" />
    
    switch (node.type) {
      case 'condition': return <GitBranch className="w-4 h-4 text-slate-500" />
      case 'action': return <Zap className="w-4 h-4 text-slate-500" />
      case 'result': return <Target className="w-4 h-4 text-slate-500" />
      default: return <Info className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🧠 Decision Engine Visualization
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Explore how the Context Engineering decision engine evaluates conditions, 
          applies mathematical thresholds, and routes to optimal execution paths.
        </p>
      </div>

      <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-6">
        {/* Scenario Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Scenarios
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
                    {scenario.name}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {scenario.description}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">
                      C: {scenario.complexity.toFixed(1)}
                    </span>
                    <span className="text-slate-500">
                      Conf: {(scenario.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Variable Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                Variables
              </h5>
              <div className="space-y-3">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {value.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={value}
                      onChange={(e) => setVariables(prev => ({
                        ...prev,
                        [key]: parseFloat(e.target.value)
                      }))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={evaluateDecisionTree}
                disabled={!selectedScenario || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                         bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Evaluate'}
              </button>
              <button
                onClick={resetDecisionTree}
                disabled={isProcessing}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 
                         text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                         dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Decision Tree Visualization */}
        <div className="xl:col-span-2 lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="space-y-4 h-full">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Decision Tree
                </h4>
                {isProcessing && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Step {currentStep}
                  </Badge>
                )}
              </div>

              {selectedScenario && (
                <div className="h-full overflow-y-auto">
                  <div className="space-y-4">
                    {/* Condition Nodes */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Conditions
                      </h5>
                      {Object.values(decisionTree).filter(node => node.type === 'condition').map(node => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border ${getNodeColor(node)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNodeIcon(node)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium text-slate-900 dark:text-slate-100">
                                  {node.label}
                                </h6>
                                {node.value !== undefined && node.threshold !== undefined && (
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {node.value.toFixed(2)} {node.value >= node.threshold ? '≥' : '<'} {node.threshold}
                                  </div>
                                )}
                              </div>
                              
                              {node.formula && (
                                <div className="mb-2">
                                  <MathFormula formula={node.formula} className="text-sm" />
                                </div>
                              )}
                              
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {node.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Nodes */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Actions
                      </h5>
                      {Object.values(decisionTree).filter(node => node.type === 'action').map(node => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border ${getNodeColor(node)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNodeIcon(node)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h6 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                {node.label}
                              </h6>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                {node.explanation}
                              </p>
                              {node.recommendations && (
                                <div className="space-y-1">
                                  {node.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs text-slate-500">
                                      <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                      {rec}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Result Nodes */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Results
                      </h5>
                      {Object.values(decisionTree).filter(node => node.type === 'result').map(node => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border ${getNodeColor(node)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNodeIcon(node)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h6 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                {node.label}
                              </h6>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {node.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Path Analysis */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Path Analysis
              </h4>
            </div>

            {activePath ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Path Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Outcome:</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {activePath.outcome}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Probability:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {(activePath.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Confidence:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {(activePath.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Path Explanation */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Decision Path
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activePath.explanation}
                  </p>
                </div>

                {/* Path Nodes */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Execution Flow
                  </h5>
                  <div className="space-y-1">
                    {activePath.nodes.map((nodeId, index) => {
                      const node = decisionTree[nodeId]
                      if (!node) return null
                      
                      return (
                        <div key={nodeId} className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 flex items-center justify-center text-slate-500">
                            {index + 1}
                          </div>
                          <div className="flex-shrink-0">
                            {getNodeIcon(node)}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">
                            {node.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Select a scenario and run evaluation to see decision path analysis
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function generateScenarios(): DecisionScenario[] {
  return [
    {
      id: 'complex-analysis',
      name: 'Complex Analysis Task',
      description: 'High complexity scenario requiring deep analysis',
      complexity: 2.3,
      confidence: 0.6,
      context: 'User requests comprehensive system analysis with multiple variables',
      variables: { complexity: 2.3, confidence: 0.6, context_size: 0.8 }
    },
    {
      id: 'simple-query',
      name: 'Simple Query',
      description: 'Straightforward information request',
      complexity: 0.4,
      confidence: 0.9,
      context: 'User asks for basic information lookup',
      variables: { complexity: 0.4, confidence: 0.9, context_size: 0.2 }
    },
    {
      id: 'uncertain-context',
      name: 'Uncertain Context',
      description: 'Moderate complexity with low confidence',
      complexity: 1.1,
      confidence: 0.4,
      context: 'Ambiguous request requiring clarification',
      variables: { complexity: 1.1, confidence: 0.4, context_size: 0.6 }
    },
    {
      id: 'expert-workflow',
      name: 'Expert Workflow',
      description: 'Advanced user with complex requirements',
      complexity: 1.8,
      confidence: 0.85,
      context: 'Expert user requesting advanced functionality',
      variables: { complexity: 1.8, confidence: 0.85, context_size: 0.7 }
    },
    {
      id: 'beginner-guidance',
      name: 'Beginner Guidance',
      description: 'New user needing comprehensive support',
      complexity: 0.7,
      confidence: 0.5,
      context: 'Beginner user requiring step-by-step guidance',
      variables: { complexity: 0.7, confidence: 0.5, context_size: 0.3 }
    }
  ]
}