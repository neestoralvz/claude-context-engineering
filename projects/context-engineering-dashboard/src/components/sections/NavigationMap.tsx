import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function NavigationMap() {
  return (
    <div className="space-y-6">
      {/* 3-Step Access Rule */}
      <Card className="principle-card">
        <CardHeader className="principle-card-header">
          <CardTitle className="flex items-center space-x-2">
            <span>3-Step Access Rule</span>
            <Badge variant="mathematical">≤3 Cognitive Steps</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="principle-card-content">
          <p className="text-center text-lg mb-6 text-slate-600 dark:text-slate-300">
            Maximum 3 cognitive steps to reach any system component
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary-900 dark:bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-white dark:text-primary-900">CORE</span>
              </div>
              <div className="font-medium">Philosophical Core</div>
              <Badge variant="primary" className="text-xs">PERMANENT</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-secondary-700 dark:bg-secondary-300 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-white dark:text-secondary-900">CMD</span>
              </div>
              <div className="font-medium">Command Engine</div>
              <Badge variant="secondary" className="text-xs">ON-DEMAND</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-accent-600 dark:bg-accent-400 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-white dark:text-accent-900">DEC</span>
              </div>
              <div className="font-medium">Decision Engine</div>
              <Badge variant="accent" className="text-xs">AUTO-TRIGGER</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-mathematical-600 dark:bg-mathematical-400 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-white dark:text-mathematical-900">THINK</span>
              </div>
              <div className="font-medium">Progressive Thinking</div>
              <Badge variant="mathematical" className="text-xs">INTELLIGENT</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Map */}
      <Card className="principle-card">
        <CardHeader className="principle-card-header">
          <CardTitle>Optimized Architecture</CardTitle>
        </CardHeader>
        <CardContent className="principle-card-content">
          <div className="space-y-4">
            {/* Current Location */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border-l-4 border-primary-900">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary-900 dark:text-primary-100">Context Engineering Hub (CLAUDE.md)</span>
                <Badge variant="primary" className="text-xs">Current Location</Badge>
              </div>
            </div>

            {/* Permanent Core */}
            <div className="ml-4 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-mathematical-700 dark:text-mathematical-300">
                  PERMANENT CORE (always loaded ~0.8K)
                </span>
              </div>
              
              <div className="ml-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-primary-900 text-white px-2 py-1 rounded">PHI</span>
                  <span>Philosophical Foundations (5 principles)</span>
                  <span className="text-slate-500">← Meta-principle + cognitive framework</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-mathematical-600 text-white px-2 py-1 rounded">INT</span>
                  <span>Progressive Thinking Integration</span>
                  <span className="text-slate-500">← Auto-activation triggers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-accent-600 text-white px-2 py-1 rounded">ENT</span>
                  <span>Universal Entry Points</span>
                  <span className="text-slate-500">← /context-eng, /decision, /thinking</span>
                </div>
              </div>
            </div>

            {/* Dynamic Loading */}
            <div className="ml-4 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-secondary-700 dark:text-secondary-300">
                  DYNAMIC LOADING (on-demand)
                </span>
              </div>
              
              <div className="ml-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-secondary-700 text-white px-2 py-1 rounded">CAT</span>
                  <span>Principle Categories (7 files)</span>
                  <span className="text-slate-500">← Operational, Technical, Mathematical, etc.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-mathematical-600 text-white px-2 py-1 rounded">CMD</span>
                  <span>Command System (62 commands)</span>
                  <span className="text-slate-500">← 8 thematic directories</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-accent-600 text-white px-2 py-1 rounded">TOOL</span>
                  <span>Implementation Tools</span>
                  <span className="text-slate-500">← Templates, automation, validation</span>
                </div>
              </div>
            </div>

            {/* Admin Level */}
            <div className="ml-4 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-accent-700 dark:text-accent-300">
                  ADMIN LEVEL (complete system)
                </span>
              </div>
              
              <div className="ml-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-primary-900 text-white px-2 py-1 rounded">MET</span>
                  <span>Full Metrics & Analytics</span>
                  <span className="text-slate-500">← Performance data, usage patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-secondary-700 text-white px-2 py-1 rounded">TEST</span>
                  <span>Testing & Validation</span>
                  <span className="text-slate-500">← System integrity, automation testing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-accent-600 text-white px-2 py-1 rounded">ADM</span>
                  <span>Advanced Configuration</span>
                  <span className="text-slate-500">← Registry, scripts, deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Efficiency Stats */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-primary-600 dark:text-primary-400">96%</div>
                <div className="text-slate-500">Navigation Efficiency</div>
              </div>
              <div>
                <div className="font-bold text-mathematical-600 dark:text-mathematical-400">95%</div>
                <div className="text-slate-500">Context Density</div>
              </div>
              <div>
                <div className="font-bold text-cognitive-600 dark:text-cognitive-400">85%</div>
                <div className="text-slate-500">Cross-Category Coverage</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}