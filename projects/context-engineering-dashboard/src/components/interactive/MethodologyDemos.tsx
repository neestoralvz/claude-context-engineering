'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Brain, 
  Code, 
  Shield, 
  Network,
  BookOpen,
  Lightbulb,
  Target,
  Activity
} from 'lucide-react'

// Import specialized demo components
import { TDDDemo, type MethodologyDemo } from './TDDDemo'
import { ValidationDemo } from './ValidationDemo'
import { OrchestrationDemo } from './OrchestrationDemo'

type DemoCategory = 'tdd' | 'validation' | 'orchestration' | 'all'

interface DemoSummary {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: DemoCategory
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  component: React.ComponentType<any>
}

const demoSummaries: DemoSummary[] = [
  {
    id: 'tdd-methodology',
    title: 'Test-Driven Development',
    description: 'Interactive TDD demonstrations with Red-Green-Refactor cycle, automated testing patterns, and quality assurance strategies.',
    icon: <Code className="w-6 h-6" />,
    category: 'tdd',
    estimatedTime: '10-15 min',
    difficulty: 'beginner',
    tags: ['tdd', 'testing', 'red-green-refactor', 'quality'],
    component: TDDDemo
  },
  {
    id: 'validation-methodology',
    title: 'Validation & Verification',
    description: 'Mathematical validation frameworks, quality assurance patterns, and comprehensive verification strategies.',
    icon: <Shield className="w-6 h-6" />,
    category: 'validation',
    estimatedTime: '12-18 min',
    difficulty: 'intermediate',
    tags: ['validation', 'verification', 'mathematics', 'quality'],
    component: ValidationDemo
  },
  {
    id: 'orchestration-methodology',
    title: 'Command Orchestration',
    description: 'Advanced orchestration patterns, workflow automation, dependency management, and parallel execution.',
    icon: <Network className="w-6 h-6" />,
    category: 'orchestration',
    estimatedTime: '10-15 min',
    difficulty: 'intermediate',
    tags: ['orchestration', 'workflow', 'automation', 'parallel'],
    component: OrchestrationDemo
  }
]

export function MethodologyDemos() {
  const [selectedCategory, setSelectedCategory] = useState<DemoCategory>('all')
  const [activeDemo, setActiveDemo] = useState<DemoSummary | null>(null)
  const [completedDemos, setCompletedDemos] = useState<Set<string>>(new Set())

  const handleDemoComplete = (demo: MethodologyDemo) => {
    setCompletedDemos(prev => new Set([...prev, demo.id]))
    // Could show completion notification or update progress
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
    ? demoSummaries 
    : demoSummaries.filter(demo => demo.category === selectedCategory)

  if (activeDemo) {
    const DemoComponent = activeDemo.component
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveDemo(null)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            ← Back to Demo Selection
          </button>
          <div className="flex items-center gap-2">
            <div className="text-blue-600 dark:text-blue-400">
              {activeDemo.icon}
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {activeDemo.title}
            </h2>
          </div>
        </div>

        {/* Render Active Demo Component */}
        <DemoComponent onDemoComplete={handleDemoComplete} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🎯 Interactive Methodology Demos
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Hands-on demonstrations of core Context Engineering methodologies with interactive 
          visualizations, step-by-step explanations, and real-time insights.
        </p>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Methodology:
            </span>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', icon: <BookOpen className="w-4 h-4" /> },
                { key: 'tdd', label: 'TDD', icon: <Code className="w-4 h-4" /> },
                { key: 'validation', label: 'Validation', icon: <Shield className="w-4 h-4" /> },
                { key: 'orchestration', label: 'Orchestration', icon: <Network className="w-4 h-4" /> }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as DemoCategory)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors
                    ${selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {category.icon}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
              {filteredDemos.length} methodologies
            </Badge>
            {completedDemos.size > 0 && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {completedDemos.size} completed
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Demo Selection Grid */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(demo.difficulty)}>
                      {demo.difficulty}
                    </Badge>
                    {completedDemos.has(demo.id) && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
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
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-700 dark:text-slate-300 capitalize">{demo.category}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {demo.tags.slice(0, 4).map(tag => (
                    <Badge 
                      key={tag} 
                      className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <button
                  onClick={() => setActiveDemo(demo)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
                           bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  {completedDemos.has(demo.id) ? 'Review Demo' : 'Start Demo'}
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      {completedDemos.size > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-green-600 dark:text-green-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Learning Progress
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  You've completed {completedDemos.size} of {demoSummaries.length} methodology demonstrations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {Math.round((completedDemos.size / demoSummaries.length) * 100)}% Complete
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}