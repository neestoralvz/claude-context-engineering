import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula } from '@/components/ui/MathFormula'

export function PhilosophicalFoundations() {
  return (
    <div className="space-y-6">
      {/* Meta-Principle Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🌟 Meta-Principle</span>
            <Badge variant="secondary">Always Loaded</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <blockquote className="text-lg font-medium text-center italic text-slate-700 dark:text-slate-300 border-l-4 border-slate-500 pl-4">
            "Stop trying to control the model. Enable it."
          </blockquote>
        </CardContent>
      </Card>

      {/* Core Cognitive Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🧠 Core Cognitive Framework</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="text-xs mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold">Intelligence as Natural Phenomenon</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Evolution through variation, selection, and replication
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="text-xs mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold">Context &gt; Commands &gt; Prompts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Rich context enables autonomous excellence
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="text-xs mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold">Enable, Don't Control</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Provide context + objectives, allow autonomous execution
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="text-xs mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold">Natural Language Commands</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Simple, clear, human-readable instructions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔄 Evolution Formula</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <MathFormula 
                  formula="VARIATION \\rightarrow SELECTION \\rightarrow REPLICATION" 
                  display
                />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="border-l-4 border-cognitive-500 pl-3">
                  <h5 className="font-semibold text-cognitive-700 dark:text-cognitive-300">
                    Variation
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300">
                    Generate diverse approaches and solutions
                  </p>
                </div>
                
                <div className="border-l-4 border-mathematical-500 pl-3">
                  <h5 className="font-semibold text-mathematical-700 dark:text-mathematical-300">
                    Selection
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300">
                    Evaluate and choose optimal strategies
                  </p>
                </div>
                
                <div className="border-l-4 border-primary-500 pl-3">
                  <h5 className="font-semibold text-primary-700 dark:text-primary-300">
                    Replication
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300">
                    Crystallize successful patterns
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progressive Thinking Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎯 Progressive Thinking Integration</span>
            <Badge variant="secondary">Auto-Activates</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-cognitive-600 dark:text-cognitive-400">
                <MathFormula formula="complexity \\geq 0.9" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                High Complexity Threshold
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-mathematical-600 dark:text-mathematical-400">
                <MathFormula formula="confidence < 0.7" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Low Confidence Trigger
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                Analysis Required
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Deep Strategic Analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}