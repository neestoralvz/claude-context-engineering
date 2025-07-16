'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface LoadingState {
  isLoading: boolean
  loadedSections: Set<string>
  loadingProgress: number
  contextLevel: 'core' | 'standard' | 'deep' | 'complete'
}

interface ProgressiveLoadingContextType {
  loadingState: LoadingState
  loadSection: (sectionId: string) => Promise<void>
  setContextLevel: (level: LoadingState['contextLevel']) => void
  triggerAutoLoad: (triggers: string[]) => void
}

const ProgressiveLoadingContext = createContext<ProgressiveLoadingContextType | undefined>(undefined)

interface ProgressiveLoadingProviderProps {
  children: ReactNode
}

export function ProgressiveLoadingProvider({ children }: ProgressiveLoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadedSections: new Set(['philosophical-core']), // Always loaded
    loadingProgress: 0,
    contextLevel: 'core'
  })

  const loadSection = useCallback(async (sectionId: string) => {
    setLoadingState(prev => ({ ...prev, isLoading: true }))
    
    try {
      // Simulate progressive loading with realistic delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200))
      
      setLoadingState(prev => {
        const newLoadedSections = new Set(prev.loadedSections)
        newLoadedSections.add(sectionId)
        return {
          ...prev,
          isLoading: false,
          loadedSections: newLoadedSections,
          loadingProgress: Math.min(100, newLoadedSections.size * 10)
        }
      })
    } catch (error) {
      console.error(`Failed to load section: ${sectionId}`, error)
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const setContextLevel = useCallback((level: LoadingState['contextLevel']) => {
    setLoadingState(prev => ({ ...prev, contextLevel: level }))
    
    // Auto-load sections based on context level
    const levelSections = {
      core: ['philosophical-foundations'],
      standard: ['command-registry', 'auto-triggers'],
      deep: ['full-command-system', 'metrics'],
      complete: ['documentation', 'analysis', 'admin']
    }
    
    levelSections[level].forEach(section => {
      if (!loadingState.loadedSections.has(section)) {
        loadSection(section)
      }
    })
  }, [loadSection, loadingState.loadedSections])

  const triggerAutoLoad = useCallback((triggers: string[]) => {
    // Auto-loading logic based on triggers
    const triggerMap = {
      'low-confidence': ['basic-principles'],
      'routing-needed': ['decision-engine'],
      'command-invocation': ['specific-command'],
      'mcp-detection': ['context7-hooks']
    }
    
    triggers.forEach(trigger => {
      const sections = triggerMap[trigger as keyof typeof triggerMap] || []
      sections.forEach(section => {
        if (!loadingState.loadedSections.has(section)) {
          loadSection(section)
        }
      })
    })
  }, [loadSection, loadingState.loadedSections])

  const value: ProgressiveLoadingContextType = {
    loadingState,
    loadSection,
    setContextLevel,
    triggerAutoLoad
  }

  return (
    <ProgressiveLoadingContext.Provider value={value}>
      {children}
    </ProgressiveLoadingContext.Provider>
  )
}

export function useProgressiveLoading() {
  const context = useContext(ProgressiveLoadingContext)
  if (context === undefined) {
    throw new Error('useProgressiveLoading must be used within a ProgressiveLoadingProvider')
  }
  return context
}