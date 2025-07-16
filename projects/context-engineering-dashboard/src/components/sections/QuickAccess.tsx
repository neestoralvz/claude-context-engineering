import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function QuickAccess() {
  const workflows = [
    {
      title: 'Explore',
      command: '/explore',
      description: 'Pattern recognition → Knowledge discovery',
      category: 'discovery'
    },
    {
      title: 'Plan',
      command: '/planning-workflow',
      description: 'Objective decomposition → TDD approach',
      category: 'methodology'
    },
    {
      title: 'Implement',
      command: '/execution-workflow',
      description: 'Parallel execution → Verification loops',
      category: 'execution'
    },
    {
      title: 'Validate',
      command: '/verification-workflow',
      description: 'Mathematical rigor → System integrity',
      category: 'verification'
    },
    {
      title: 'Document',
      command: '/living-documentation',
      description: 'Auto-updates → Pattern crystallization',
      category: 'documentation'
    },
    {
      title: 'Optimize',
      command: '/thinking',
      description: 'Deep analysis → Intelligent adaptation',
      category: 'optimization'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Objective-Based Workflows */}
      <Card className="principle-card">
        <CardHeader className="principle-card-header">
          <CardTitle className="flex items-center space-x-2">
            <span>Smart Pathways</span>
            <Badge variant="mathematical">Auto-Routing via /decision</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="principle-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow, index) => (
              <Card key={index} className="border-l-4 border-l-primary-900 hover:shadow-sm transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary-900 dark:text-primary-100">{workflow.title}</h4>
                      <div className="command-interface inline-block text-xs">
                        <span className="command-prompt">{workflow.command}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{workflow.category}</Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {workflow.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Universal Command */}
      <Card className="principle-card bg-primary-50 dark:bg-primary-900/10 border-primary-900">
        <CardHeader className="principle-card-header">
          <CardTitle className="flex items-center space-x-2">
            <span>Universal Access</span>
            <Badge variant="primary">All Systems</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="principle-card-content text-center">
          <div className="space-y-4">
            <div className="command-interface inline-block text-lg">
              <span className="command-prompt">/context-eng</span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300">
              Activates all 62 commands + 56 principles + intelligent auto-loading
            </p>
            
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Original long names like <code>/context-engineering</code>, <code>/progressive-thinking</code> still work as aliases
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Shortcuts */}
      <Card className="principle-card">
        <CardHeader className="principle-card-header">
          <CardTitle>Implementation Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="principle-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Quick Start</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Start Project</div>
                    <div className="text-xs text-slate-500">Auto-loads all systems</div>
                  </div>
                  <div className="command-interface text-sm">
                    <span className="command-prompt">/context-eng</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Find Command</div>
                    <div className="text-xs text-slate-500">Registry search</div>
                  </div>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    command-registry.json
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">System Operations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Debug Issues</div>
                    <div className="text-xs text-slate-500">System integrity validation</div>
                  </div>
                  <div className="command-interface text-sm">
                    <span className="command-prompt">/verify-mathematics</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Update Docs</div>
                    <div className="text-xs text-slate-500">Auto-sync all references</div>
                  </div>
                  <div className="command-interface text-sm">
                    <span className="command-prompt">/living-documentation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}