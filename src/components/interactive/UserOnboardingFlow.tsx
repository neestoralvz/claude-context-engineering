'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Star, 
  BookOpen, 
  Zap, 
  Target, 
  Brain,
  Play,
  MapPin,
  Lightbulb,
  ChevronRight,
  X,
  Settings,
  User,
  Rocket,
  Flag,
  Eye,
  SkipForward,
  Clock
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  content: string
  target?: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'highlight' | 'interact' | 'explain' | 'demo'
  duration?: number
  skippable: boolean
  interactive?: boolean
  demoComponent?: React.ReactNode
}

interface UserProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  goals: string[]
  hasCompletedTour: boolean
  lastTourStep: string
  preferences: {
    tooltips: boolean
    autoProgress: boolean
    detailedExplanations: boolean
  }
}

interface OnboardingTrack {
  id: string
  name: string
  description: string
  targetAudience: string
  estimatedTime: string
  steps: TourStep[]
  icon: React.ReactNode
}

export function UserOnboardingFlow() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState<OnboardingTrack | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [tracks] = useState<OnboardingTrack[]>(generateOnboardingTracks())
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [autoProgress, setAutoProgress] = useState(false)

  // Refs for positioning
  const overlayRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  const initializeUserProfile = useCallback(() => {
    // In a real app, this would come from localStorage or user data
    const defaultProfile: UserProfile = {
      experienceLevel: 'beginner',
      interests: [],
      goals: [],
      hasCompletedTour: false,
      lastTourStep: '',
      preferences: {
        tooltips: true,
        autoProgress: false,
        detailedExplanations: true
      }
    }
    setUserProfile(defaultProfile)
  }, [])

  useEffect(() => {
    initializeUserProfile()
  }, [initializeUserProfile])

  const startTour = (track: OnboardingTrack) => {
    setSelectedTrack(track)
    setCurrentStep(0)
    setIsActive(true)
    setCompletedSteps(new Set())
  }

  const nextStep = useCallback(() => {
    if (!selectedTrack) return

    const currentStepData = selectedTrack.steps[currentStep]
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))

    if (currentStep < selectedTrack.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }, [selectedTrack, currentStep])

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipStep = () => {
    if (selectedTrack?.steps[currentStep]?.skippable) {
      nextStep()
    }
  }

  const completeTour = () => {
    setIsActive(false)
    setSelectedTrack(null)
    setCurrentStep(0)
    
    if (userProfile) {
      setUserProfile(prev => prev ? {
        ...prev,
        hasCompletedTour: true,
        lastTourStep: selectedTrack?.steps[currentStep]?.id || ''
      } : null)
    }
  }

  const exitTour = () => {
    setIsActive(false)
    setSelectedTrack(null)
    setCurrentStep(0)
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : null)
  }

  // Auto-progress functionality
  useEffect(() => {
    if (!isActive || !autoProgress || !selectedTrack) return

    const currentStepData = selectedTrack.steps[currentStep]
    if (currentStepData.duration) {
      const timer = setTimeout(() => {
        nextStep()
      }, currentStepData.duration)

      return () => clearTimeout(timer)
    }
  }, [isActive, autoProgress, selectedTrack, currentStep, nextStep])

  const getStepPosition = (step: TourStep) => {
    const baseClasses = "fixed z-50 max-w-sm p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700"
    
    switch (step.position) {
      case 'top':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`
      case 'bottom':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
      case 'left':
        return `${baseClasses} left-4 top-1/2 transform -translate-y-1/2`
      case 'right':
        return `${baseClasses} right-4 top-1/2 transform -translate-y-1/2`
      case 'center':
      default:
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`
    }
  }

  const currentStepData = selectedTrack?.steps[currentStep]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🚀 Interactive Onboarding Experience
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Get started with Context Engineering through guided tours, interactive demonstrations, 
          and personalized learning paths tailored to your experience level.
        </p>
      </div>

      {/* User Profile Setup */}
      {!userProfile?.hasCompletedTour && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Personalize Your Experience
              </h4>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={userProfile?.experienceLevel || 'beginner'}
                  onChange={(e) => updateUserProfile({ 
                    experienceLevel: e.target.value as UserProfile['experienceLevel'] 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Interest
                </label>
                <select
                  onChange={(e) => updateUserProfile({ 
                    interests: [e.target.value] 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select interest</option>
                  <option value="commands">Command System</option>
                  <option value="principles">Principles</option>
                  <option value="thinking">Progressive Thinking</option>
                  <option value="metrics">Performance Metrics</option>
                  <option value="automation">Automation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Learning Goal
                </label>
                <select
                  onChange={(e) => updateUserProfile({ 
                    goals: [e.target.value] 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select goal</option>
                  <option value="overview">System Overview</option>
                  <option value="hands-on">Hands-on Practice</option>
                  <option value="deep-dive">Deep Technical Understanding</option>
                  <option value="integration">Integration Guide</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Onboarding Tracks */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Card className="p-6 h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 dark:text-blue-400">
                    {track.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {track.name}
                  </h4>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {track.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target:</span>
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                      {track.targetAudience}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Duration:</span>
                    <span className="text-slate-700 dark:text-slate-300">{track.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Steps:</span>
                    <span className="text-slate-700 dark:text-slate-300">{track.steps.length}</span>
                  </div>
                </div>

                <button
                  onClick={() => startTour(track)}
                  disabled={isActive}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
                           bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Tour
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tour Progress */}
      {isActive && selectedTrack && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">
                  {selectedTrack.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedTrack.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Step {currentStep + 1} of {selectedTrack.steps.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoProgress(!autoProgress)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors
                    ${autoProgress 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                >
                  Auto-progress: {autoProgress ? 'On' : 'Off'}
                </button>
                <button
                  onClick={exitTour}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / selectedTrack.steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2">
              {selectedTrack.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors
                    ${index === currentStep 
                      ? 'bg-blue-500' 
                      : completedSteps.has(step.id)
                      ? 'bg-green-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tour Overlay */}
      <AnimatePresence>
        {isActive && currentStepData && (
          <>
            {/* Dark Overlay */}
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={exitTour}
            />

            {/* Tour Step */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={getStepPosition(currentStepData)}
            >
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {currentStep + 1}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                        {currentStepData.title}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {currentStepData.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={exitTour}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Step Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300">
                    {currentStepData.content}
                  </p>
                </div>

                {/* Demo Component */}
                {currentStepData.demoComponent && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {currentStepData.demoComponent}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <button
                        onClick={previousStep}
                        className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 
                                 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}

                    {currentStepData.skippable && (
                      <button
                        onClick={skipStep}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 
                                 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <SkipForward className="w-4 h-4" />
                        Skip
                      </button>
                    )}
                  </div>

                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 transition-colors"
                  >
                    {currentStep === selectedTrack.steps.length - 1 ? (
                      <>
                        <Check className="w-4 h-4" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Auto-progress Timer */}
                {autoProgress && currentStepData.duration && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      Auto-advancing in {Math.ceil(currentStepData.duration / 1000)}s
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                      <motion.div
                        className="bg-blue-500 h-1 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: currentStepData.duration / 1000, ease: 'linear' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function generateOnboardingTracks(): OnboardingTrack[] {
  return [
    {
      id: 'quick-start',
      name: 'Quick Start Guide',
      description: 'Essential overview for getting started with Context Engineering in 5 minutes',
      targetAudience: 'All Users',
      estimatedTime: '5 min',
      icon: <Rocket className="w-6 h-6" />,
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Context Engineering',
          description: 'Introduction to the methodology',
          content: 'Context Engineering is an intelligent framework that enables sophisticated AI interactions through structured context management, mathematical rigor, and progressive thinking methodologies.',
          position: 'center',
          action: 'explain',
          duration: 4000,
          skippable: true,
          interactive: false
        },
        {
          id: 'commands-intro',
          title: 'Command System Overview',
          description: 'Understanding the 62-command ecosystem',
          content: 'The command system provides 62 specialized commands organized into 8 categories. Each command is mathematically validated and optimized for specific use cases.',
          position: 'top',
          action: 'highlight',
          duration: 5000,
          skippable: true,
          interactive: false,
          demoComponent: (
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">62</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Commands</div>
            </div>
          )
        },
        {
          id: 'principles-intro',
          title: 'Foundational Principles',
          description: 'Core principles that guide the system',
          content: 'The system is built on 56 principles across 7 categories, providing a solid philosophical and technical foundation for all operations.',
          position: 'right',
          action: 'explain',
          duration: 4000,
          skippable: true,
          interactive: false
        },
        {
          id: 'navigation',
          title: 'Smart Navigation',
          description: 'Efficient system navigation',
          content: 'Navigate the entire system in ≤3 cognitive steps using intelligent routing, auto-loading, and contextual optimization.',
          position: 'bottom',
          action: 'demo',
          duration: 3000,
          skippable: true,
          interactive: true
        },
        {
          id: 'next-steps',
          title: 'Ready to Explore',
          description: 'Your journey begins now',
          content: 'You now have a foundation understanding. Explore the interactive demos, try the command simulator, or dive deeper into specific principles.',
          position: 'center',
          action: 'explain',
          skippable: false,
          interactive: false
        }
      ]
    },
    {
      id: 'deep-dive',
      name: 'Technical Deep Dive',
      description: 'Comprehensive exploration of advanced features and mathematical foundations',
      targetAudience: 'Advanced Users',
      estimatedTime: '15 min',
      icon: <Brain className="w-6 h-6" />,
      steps: [
        {
          id: 'mathematical-foundations',
          title: 'Mathematical Rigor',
          description: 'Understanding the mathematical underpinnings',
          content: 'Context Engineering employs rigorous mathematical formulations for optimization, decision-making, and performance measurement. Every metric is precisely calculated and validated.',
          position: 'center',
          action: 'explain',
          duration: 6000,
          skippable: true,
          interactive: false
        },
        {
          id: 'progressive-thinking',
          title: 'Progressive Thinking Methodology',
          description: '4-stage cognitive process',
          content: 'Progressive thinking evolves through Surface Analysis → Pattern Recognition → Deep Synthesis → Strategic Integration, enabling breakthrough insights.',
          position: 'left',
          action: 'demo',
          duration: 8000,
          skippable: true,
          interactive: true
        },
        {
          id: 'decision-engine',
          title: 'Decision Engine Architecture',
          description: 'Intelligent routing and auto-triggers',
          content: 'The decision engine uses mathematical thresholds and confidence scores to route requests optimally, trigger auto-loading, and ensure efficient execution.',
          position: 'right',
          action: 'highlight',
          duration: 7000,
          skippable: true,
          interactive: false
        },
        {
          id: 'performance-optimization',
          title: 'Performance Optimization',
          description: 'System efficiency and metrics',
          content: 'Achieve 78% context reduction, 65% speed improvement, and 88% success rate through intelligent lazy loading and optimization strategies.',
          position: 'bottom',
          action: 'demo',
          duration: 6000,
          skippable: true,
          interactive: true
        }
      ]
    },
    {
      id: 'hands-on',
      name: 'Hands-On Practice',
      description: 'Interactive exercises and real command execution practice',
      targetAudience: 'Intermediate',
      estimatedTime: '10 min',
      icon: <Target className="w-6 h-6" />,
      steps: [
        {
          id: 'command-simulator',
          title: 'Command Simulator',
          description: 'Practice with real command execution',
          content: 'Use the command simulator to experiment with different commands, see execution flows, and understand the step-by-step process.',
          position: 'center',
          action: 'interact',
          duration: 10000,
          skippable: false,
          interactive: true
        },
        {
          id: 'decision-practice',
          title: 'Decision Engine Practice',
          description: 'Interactive decision tree exploration',
          content: 'Explore different scenarios in the decision engine visualization to understand how mathematical thresholds guide execution paths.',
          position: 'top',
          action: 'interact',
          duration: 8000,
          skippable: false,
          interactive: true
        },
        {
          id: 'metrics-exploration',
          title: 'Live Metrics Dashboard',
          description: 'Understanding system performance',
          content: 'Explore the live metrics dashboard to understand system health, performance indicators, and optimization opportunities.',
          position: 'bottom',
          action: 'demo',
          duration: 6000,
          skippable: true,
          interactive: true
        }
      ]
    }
  ]
}