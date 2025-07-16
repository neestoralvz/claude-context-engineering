'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MathFormula } from '@/components/ui/MathFormula';
import { MathCalculator, MATH_CALCULATORS } from '@/components/ui/MathCalculator';
import { 
  CATEGORY_CONFIG, 
  PrincipleCategory, 
  PrincipleProcessor,
  DetailedPrinciple 
} from '@/lib/principles';

interface PrinciplePageProps {
  params: {
    category: string;
    principle: string;
  };
}

function getCategoryFromSlug(slug: string): PrincipleCategory | null {
  const mapping: Record<string, PrincipleCategory> = {
    'philosophical-foundations': PrincipleCategory.PHILOSOPHICAL,
    'operational-excellence': PrincipleCategory.OPERATIONAL,
    'technical-standards': PrincipleCategory.TECHNICAL,
    'mathematical-rigor': PrincipleCategory.MATHEMATICAL,
    'validation-protocols': PrincipleCategory.VALIDATION,
    'cognitive-optimization': PrincipleCategory.COGNITIVE,
    'intelligent-adaptation': PrincipleCategory.ADAPTATION
  };
  
  return mapping[slug] || null;
}

function findPrincipleBySlug(categorySlug: string, principleSlug: string): DetailedPrinciple | null {
  const category = getCategoryFromSlug(categorySlug);
  if (!category) return null;
  
  const principles = PrincipleProcessor.getPrinciplesByCategory(category);
  return principles.find(p => p.slug === principleSlug) || null;
}

export default function PrinciplePage({ params }: PrinciplePageProps) {
  const principle = findPrincipleBySlug(params.category, params.principle);
  
  if (!principle) {
    notFound();
  }

  const categoryConfig = CATEGORY_CONFIG[principle.category];
  
  // Find related calculator if this principle has a formula
  const relatedCalculator = principle.formula ? 
    MATH_CALCULATORS.find(calc => calc.name.toLowerCase().includes(principle.name.toLowerCase())) 
    : null;

  const relatedPrinciples = principle.crossReferences?.map(ref => 
    PrincipleProcessor.getPrincipleById(ref.principleId)
  ).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/principles" className="hover:text-blue-600 dark:hover:text-blue-400">
                Principles
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link 
                href={`/principles/${params.category}`} 
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {categoryConfig.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              {principle.title}
            </li>
          </ol>
        </nav>

        {/* Principle Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{categoryConfig.emoji}</span>
              <Badge variant="outline" className="text-lg font-mono">
                #{principle.id}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {categoryConfig.name}
              </Badge>
              {principle.automation?.autoActivation && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Auto-activated
                </Badge>
              )}
              {principle.metrics && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Metrics tracked
                </Badge>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {principle.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {principle.definition}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Implementation Steps */}
            {principle.implementation && principle.implementation.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Implementation
                </h2>
                <ol className="space-y-3">
                  {principle.implementation.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Protocol */}
            {principle.protocol && principle.protocol.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Protocol
                </h2>
                <div className="space-y-3">
                  {principle.protocol.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-sm font-semibold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Process */}
            {principle.process && principle.process.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Process
                </h2>
                <div className="space-y-3">
                  {principle.process.map((step, index) => (
                    <div key={index} className="text-gray-700 dark:text-gray-300">
                      {step}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Mathematical Formula */}
            {principle.formula && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Mathematical Formula
                </h2>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <MathFormula formula={principle.formula} />
                </div>
                
                {/* Interactive Calculator */}
                {relatedCalculator && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Interactive Calculator
                    </h3>
                    <MathCalculator calculator={relatedCalculator} />
                  </div>
                )}
              </Card>
            )}

            {/* Thresholds */}
            {principle.thresholds && Object.keys(principle.thresholds).length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Thresholds
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(principle.thresholds).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {typeof value === 'number' && value < 1 ? `${(value * 100).toFixed(0)}%` : value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Components/Requirements/Framework */}
            {(principle.components || principle.requirements || principle.framework) && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {principle.components ? 'Components' : 
                   principle.requirements ? 'Requirements' : 'Framework'}
                </h2>
                <ul className="space-y-2">
                  {(principle.components || principle.requirements || principle.framework || []).map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Visual Format */}
            {principle.visualFormat && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Visual Format
                </h2>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {principle.visualFormat}
                </pre>
              </Card>
            )}

            {/* Automation */}
            {principle.automation && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Automation Configuration
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${principle.automation.autoActivation ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Auto-activation: {principle.automation.autoActivation ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  {principle.automation.triggers && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Triggers:</h4>
                      <div className="flex flex-wrap gap-2">
                        {principle.automation.triggers.map((trigger, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {principle.automation.conditions && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions:</h4>
                      <ul className="space-y-1">
                        {principle.automation.conditions.map((condition, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            • {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Cross-references */}
            {principle.crossReferences && principle.crossReferences.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Related Principles
                </h2>
                <div className="space-y-4">
                  {principle.crossReferences.map((ref, index) => {
                    const relatedPrinciple = PrincipleProcessor.getPrincipleById(ref.principleId);
                    if (!relatedPrinciple) return null;
                    
                    return (
                      <Link 
                        key={index}
                        href={`/principles/${relatedPrinciple.categorySlug}/${relatedPrinciple.slug}`}
                        className="block group"
                      >
                        <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span className="text-xl">{CATEGORY_CONFIG[ref.category].emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                #{relatedPrinciple.id}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {ref.relationship}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {relatedPrinciple.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {ref.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                  <div className="mt-1">
                    <Link 
                      href={`/principles/${principle.categorySlug}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      {categoryConfig.emoji} {categoryConfig.name}
                    </Link>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Principle ID:</span>
                  <div className="mt-1 font-mono text-lg">#{principle.id}</div>
                </div>

                {principle.crossReferences && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Connections:</span>
                    <div className="mt-1">{principle.crossReferences.length} related principles</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Metrics */}
            {principle.metrics && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Metrics
                </h3>
                <div className="space-y-3">
                  {principle.metrics.successRate !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate:</span>
                      <Badge variant="outline">
                        {(principle.metrics.successRate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                  
                  {principle.metrics.targetThreshold !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Target:</span>
                      <Badge variant="outline">
                        {typeof principle.metrics.targetThreshold === 'number' && principle.metrics.targetThreshold < 1 ? 
                          `${(principle.metrics.targetThreshold * 100).toFixed(0)}%` : 
                          principle.metrics.targetThreshold}
                      </Badge>
                    </div>
                  )}
                  
                  {principle.metrics.unit && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unit:</span>
                      <span className="text-sm font-mono">{principle.metrics.unit}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Navigation */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Navigation
              </h3>
              <div className="space-y-2">
                <Link 
                  href={`/principles/${principle.categorySlug}`}
                  className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
                >
                  ← Back to {categoryConfig.name}
                </Link>
                <Link 
                  href="/principles"
                  className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
                >
                  ← All Principles
                </Link>
                <Link 
                  href="/commands"
                  className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
                >
                  → View Commands
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}