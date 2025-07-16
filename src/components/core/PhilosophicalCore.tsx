'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula } from '@/components/ui/MathFormula'

export function PhilosophicalCore() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-xs">
              🧠 PERMANENT CORE
            </Badge>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Context Engineering Hub
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-mathematical-600 dark:text-mathematical-400">≤3</span>
              <span className="text-slate-500">cognitive steps</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-primary-600 dark:text-primary-400">78%</span>
              <span className="text-slate-500">context reduction</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-secondary-600 dark:text-secondary-400">88%</span>
              <span className="text-slate-500">success rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhilosophicalFoundationsCard() {
  return (
    <Card className="principle-card">
      <CardHeader className="principle-card-header">
        <CardTitle className="flex items-center space-x-2">
          <span>🌟 Philosophical Foundations</span>
          <Badge variant="secondary" className="text-xs">Principle #1-#6</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="principle-card-content space-y-4">
        <div className="space-y-3">
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-semibold text-primary-700 dark:text-primary-300">
              Meta-Principle
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              "Stop trying to control the model. Enable it."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h5 className="font-medium text-mathematical-700 dark:text-mathematical-300">
                Core Cognitive Framework:
              </h5>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>1. Intelligence as Natural Phenomenon</li>
                <li>2. Context &gt; Commands &gt; Prompts</li>
                <li>3. Enable, Don't Control</li>
                <li>4. Natural Language Commands</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-cognitive-700 dark:text-cognitive-300">
                Evolution Formula:
              </h5>
              <MathFormula 
                formula="VARIATION \rightarrow SELECTION \rightarrow REPLICATION" 
                className="text-center"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}