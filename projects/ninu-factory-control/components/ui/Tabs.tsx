'use client'

import { ReactNode, useState, createContext, useContext } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component')
  }

  const { value: activeValue, onValueChange } = context
  const isActive = activeValue === value

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
        isActive
          ? 'bg-white text-ninu-primary shadow-sm'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component')
  }

  const { value: activeValue } = context

  if (activeValue !== value) {
    return null
  }

  return (
    <div className={`mt-6 ${className}`}>
      {children}
    </div>
  )
}