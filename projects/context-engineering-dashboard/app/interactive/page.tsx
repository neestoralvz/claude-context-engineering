'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CommandSimulator } from '@/components/interactive/CommandSimulator'
import { DecisionEngineVisualization } from '@/components/interactive/DecisionEngineVisualization'
import { ProgressiveThinkingDemo } from '@/components/interactive/ProgressiveThinkingDemo'
import { LiveMetricsDashboard } from '@/components/interactive/LiveMetricsDashboard'
import { UserOnboardingFlow } from '@/components/interactive/UserOnboardingFlow'
import { AdvancedSearch } from '@/components/interactive/AdvancedSearch'
import { MethodologyDemos } from '@/components/interactive/MethodologyDemos'
import { 
  Sparkles, 
  Terminal, 
  Brain, 
  TrendingUp, 
  Search, 
  Compass, 
  Target,
  Play,
  Activity,
  Zap
} from 'lucide-react'

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ReactNode
  category: 'core' | 'analytics' | 'learning' | 'exploration'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  keyFeatures: string[]
}

export default function InteractivePage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const features: FeatureCard[] = [
    {
      id: 'onboarding',
      title: 'Interactive Onboarding',
      description: 'Guided tours and personalized learning paths to get started with Context Engineering',
      icon: <Compass className="w-6 h-6" />,
      component: <UserOnboardingFlow />,
      category: 'learning',
      difficulty: 'beginner',
      estimatedTime: '5-15 min',
      keyFeatures: [
        'Personalized learning tracks',
        'Interactive guided tours',
        'Step-by-step walkthroughs',
        'Progress tracking'
      ]
    },
    {
      id: 'command-simulator',
      title: 'Command Simulator',
      description: 'Practice command execution with real-time preview and step-by-step analysis',
      icon: <Terminal className="w-6 h-6" />,
      component: <CommandSimulator />,
      category: 'core',
      difficulty: 'intermediate',
      estimatedTime: '10-20 min',
      keyFeatures: [
        'Real command execution flows',
        'Syntax highlighting',
        'Performance insights',
        'Interactive previews'
      ]
    },
    {
      id: 'decision-engine',
      title: 'Decision Engine Visualization',
      description: 'Explore mathematical decision trees and intelligent routing mechanisms',
      icon: <Brain className="w-6 h-6" />,
      component: <DecisionEngineVisualization />,
      category: 'core',
      difficulty: 'intermediate',
      estimatedTime: '8-15 min',
      keyFeatures: [
        'Interactive decision trees',
        'Mathematical thresholds',
        'Scenario simulation',
        'Path analysis'
      ]
    },
    {
      id: 'progressive-thinking',
      title: 'Progressive Thinking Demo',
      description: '4-stage cognitive methodology with breakthrough insight generation',
      icon: <Sparkles className="w-6 h-6" />,
      component: <ProgressiveThinkingDemo />,
      category: 'core',
      difficulty: 'advanced',
      estimatedTime: '15-25 min',
      keyFeatures: [
        '4-stage thinking process',
        'Breakthrough insights',
        'Interactive scenarios',
        'Cognitive optimization'
      ]
    },
    {
      id: 'live-metrics',
      title: 'Live Metrics Dashboard',
      description: 'Real-time system performance monitoring with predictive analytics',
      icon: <TrendingUp className="w-6 h-6" />,
      component: <LiveMetricsDashboard />,
      category: 'analytics',
      difficulty: 'intermediate',
      estimatedTime: '5-10 min',
      keyFeatures: [
        'Real-time monitoring',
        'Performance analytics',
        'Predictive insights',
        'Health indicators'
      ]
    },
    {
      id: 'advanced-search',
      title: 'AI-Powered Search',
      description: 'Intelligent search across all content with contextual recommendations',
      icon: <Search className="w-6 h-6" />,
      component: <AdvancedSearch />,
      category: 'exploration',
      difficulty: 'beginner',
      estimatedTime: '3-8 min',
      keyFeatures: [
        'AI-powered recommendations',
        'Multi-type search',
        'Smart filtering',
        'Contextual suggestions'
      ]
    },
    {
      id: 'methodology-demos',
      title: 'Methodology Demos',
      description: 'Interactive demonstrations of core Context Engineering concepts',
      icon: <Target className="w-6 h-6" />,
      component: <MethodologyDemos />,
      category: 'learning',
      difficulty: 'intermediate',
      estimatedTime: '8-20 min',
      keyFeatures: [
        'Concept visualizations',
        'Interactive learning',
        'Step-by-step guides',
        'Key insights'
      ]
    }
  ]

  const categories = [
    { id: 'all', name: 'All Features', count: features.length },
    { id: 'core', name: 'Core Features', count: features.filter(f => f.category === 'core').length },
    { id: 'learning', name: 'Learning', count: features.filter(f => f.category === 'learning').length },
    { id: 'analytics', name: 'Analytics', count: features.filter(f => f.category === 'analytics').length },
    { id: 'exploration', name: 'Exploration', count: features.filter(f => f.category === 'exploration').length }
  ]

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      core: <Zap className="w-4 h-4" />,
      learning: <Brain className="w-4 h-4" />,
      analytics: <Activity className="w-4 h-4" />,
      exploration: <Search className="w-4 h-4" />
    }
    return icons[category as keyof typeof icons] || <Target className="w-4 h-4" />
  }

  if (activeFeature) {
    const feature = features.find(f => f.id === activeFeature)
    if (feature) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveFeature(null)}
                  className="p-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 
                           rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  ← Back to Features
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(feature.difficulty)}>
                  {feature.difficulty}
                </Badge>
                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  {feature.estimatedTime}
                </Badge>
              </div>
            </div>

            {/* Feature Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {feature.component}
            </motion.div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              🎮 Interactive Features
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Experience Context Engineering through hands-on demonstrations, interactive visualizations, 
              and guided learning experiences designed to showcase advanced AI interaction methodologies.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Interactive Features</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">4</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Core Demos</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">3</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Learning Paths</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">∞</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Possibilities</div>
            </div>
          </motion.div>
        </div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by Category:
                </span>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                        ${selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                      {category.id !== 'all' && getCategoryIcon(category.id)}
                      {category.name}
                      <Badge className="bg-white bg-opacity-20 text-current text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                {filteredFeatures.length} feature{filteredFeatures.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="p-6 h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <div className="space-y-4">
                  {/* Feature Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div className="text-slate-500">
                        {getCategoryIcon(feature.category)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(feature.difficulty)}>
                        {feature.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {/* Feature Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {feature.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Estimated Time:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{feature.estimatedTime}</span>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Key Features:</span>
                      <div className="space-y-1">
                        {feature.keyFeatures.slice(0, 3).map((keyFeature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            <span>{keyFeature}</span>
                          </div>
                        ))}
                        {feature.keyFeatures.length > 3 && (
                          <div className="text-xs text-slate-500">
                            +{feature.keyFeatures.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={() => setActiveFeature(feature.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 
                             bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                             group-hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Launch Interactive Demo
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Compass className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  New to Context Engineering?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Start with the Interactive Onboarding to get a personalized introduction, 
                  then explore the Command Simulator for hands-on practice.
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setActiveFeature('onboarding')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg 
                           hover:bg-blue-700 transition-colors"
                >
                  <Compass className="w-5 h-5" />
                  Start Onboarding
                </button>
                
                <button
                  onClick={() => setActiveFeature('command-simulator')}
                  className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 
                           dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Terminal className="w-5 h-5" />
                  Try Command Simulator
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}