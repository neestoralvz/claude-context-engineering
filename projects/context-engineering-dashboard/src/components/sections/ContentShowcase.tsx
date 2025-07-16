'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MathCalculator, MATH_CALCULATORS } from '@/components/ui/MathCalculator';
import { PrincipleNetworkGraph } from '@/components/ui/PrincipleNetworkGraph';
import { 
  CATEGORY_CONFIG, 
  PrincipleCategory, 
  PRINCIPLES_DATA,
  PrincipleProcessor,
  getCategorySlug
} from '@/lib/principles';

export function ContentShowcase() {
  const [selectedTab, setSelectedTab] = useState<'principles' | 'commands' | 'formulas' | 'network'>('principles');

  // Get some sample data for showcase
  const samplePrinciples = PRINCIPLES_DATA.slice(0, 6);
  const automatedPrinciples = PrincipleProcessor.getAutomatedPrinciples();
  const categoryStats = Object.values(PrincipleCategory).map(category => ({
    category,
    config: CATEGORY_CONFIG[category],
    count: PrincipleProcessor.getPrinciplesByCategory(category).length
  }));

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Content Integration Showcase
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explore the complete Context Engineering system with 56 principles, 63 commands, 
          mathematical calculators, and interactive relationship mapping.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'principles', label: 'Principles', count: PRINCIPLES_DATA.length },
            { id: 'commands', label: 'Commands', count: 63 },
            { id: 'formulas', label: '🧮 Calculators', count: MATH_CALCULATORS.length },
            { id: 'network', label: '🕸️ Network', count: 'Interactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs"
              >
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {selectedTab === 'principles' && (
          <div className="space-y-8">
            {/* Category Overview */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Principle Categories
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {categoryStats.map(({ category, config, count }) => (
                  <Link 
                    key={category}
                    href={`/principles/${getCategorySlug(category)}`}
                    className="group"
                  >
                    <Card className="p-6 text-center transition-all duration-300">
                      <div className="text-3xl mb-2">{config.emoji}</div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {config.name}
                      </h4>
                      <Badge variant="secondary" className="mb-2">
                        {count} principles
                      </Badge>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {config.description.split('.')[0]}...
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Principles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Featured Principles
                </h3>
                <Link 
                  href="/principles"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {samplePrinciples.map((principle) => (
                  <Link 
                    key={principle.id}
                    href={`/principles/${principle.categorySlug}/${principle.slug}`}
                    className="group"
                  >
                    <Card className="p-6 h-full transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">#{principle.id}</Badge>
                        <span className="text-xl">{principle.categoryEmoji}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {principle.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {principle.definition}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {principle.automation?.autoActivation && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Auto-activated
                          </Badge>
                        )}
                        {principle.formula && (
                          <Badge variant="mathematical" className="text-xs">
                            Formula
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Automated Principles Highlight */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Auto-Activated Principles
              </h3>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {automatedPrinciples.length} principles automatically activate based on mathematical triggers
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Intelligent Automation
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {automatedPrinciples.slice(0, 8).map((principle) => (
                    <Link
                      key={principle.id}
                      href={`/principles/${principle.categorySlug}/${principle.slug}`}
                      className="group"
                    >
                      <Badge 
                        variant="outline" 
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 group-hover:border-blue-300 transition-colors"
                      >
                        #{principle.id} {principle.title}
                      </Badge>
                    </Link>
                  ))}
                  {automatedPrinciples.length > 8 && (
                    <Badge variant="secondary" className="text-gray-600 dark:text-gray-400">
                      +{automatedPrinciples.length - 8} more
                    </Badge>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'commands' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Command Registry Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                63 active commands with real-time metrics and performance tracking
              </p>
            </div>

            {/* Command Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-1">63</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Commands</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-1">88.5%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-1">226</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Executions</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-1">9.4</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Avg Confidence</div>
              </Card>
            </div>

            {/* Command Types */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Command Types
              </h4>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { type: 'Atomic', count: 46, color: 'blue', description: 'Single-purpose commands' },
                  { type: 'Orchestrator', count: 6, color: 'green', description: 'Multi-command workflows' },
                  { type: 'Meta', count: 1, color: 'purple', description: 'System-wide activation' },
                  { type: 'System', count: 10, color: 'orange', description: 'Infrastructure commands' }
                ].map((item) => (
                  <Card key={item.type} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100">{item.type}</h5>
                      <Badge 
                        variant="secondary"
                        className={`bg-${item.color}-100 text-${item.color}-800 dark:bg-${item.color}-900/30 dark:text-${item.color}-300`}
                      >
                        {item.count}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/commands"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore All Commands →
              </Link>
            </div>
          </div>
        )}

        {selectedTab === 'formulas' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Interactive Mathematical Calculators
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Real-time calculators for Context Engineering mathematical formulas
              </p>
            </div>

            {/* Featured Calculator */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Try the Confidence Score Calculator
              </h4>
              <MathCalculator calculator={MATH_CALCULATORS[0]} />
            </div>

            {/* Other Calculators */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Calculators
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                {MATH_CALCULATORS.slice(1).map((calculator) => (
                  <Card key={calculator.id} className="p-6">
                    <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {calculator.name}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {calculator.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {calculator.variables.length} parameters
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'network' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Principle Relationship Network
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Interactive visualization of connections between Context Engineering principles
              </p>
            </div>

            <PrincipleNetworkGraph 
              width={800} 
              height={500}
              className="mx-auto"
            />

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each node represents a principle, with size indicating connection count. 
                Hover and click nodes to explore relationships.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <Card className="p-8 bg-slate-50 dark:bg-slate-800">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Ready to Explore?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Dive deep into the complete Context Engineering system with interactive tools, 
            comprehensive documentation, and real-time data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/principles"
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Browse Principles
            </Link>
            <Link 
              href="/commands"
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              View Commands
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ContentShowcase;