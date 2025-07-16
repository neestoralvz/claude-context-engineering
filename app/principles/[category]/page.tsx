'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MathCalculatorGrid } from '@/components/ui/MathCalculator';
import { 
  CATEGORY_CONFIG, 
  PrincipleCategory, 
  PrincipleProcessor,
  DetailedPrinciple 
} from '@/lib/principles';

interface CategoryPageProps {
  params: {
    category: string;
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

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryFromSlug(params.category);
  
  if (!category) {
    notFound();
  }

  const categoryConfig = CATEGORY_CONFIG[category];
  const principles = PrincipleProcessor.getPrinciplesByCategory(category);
  
  // Get mathematical formulas for this category
  const categoryFormulas = principles.filter(p => p.formula);
  
  // Get cross-references from this category to others
  const crossReferences = principles.flatMap(p => p.crossReferences || []);
  const referencedCategories = Array.from(new Set(crossReferences.map(ref => ref.category)));

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
            <li className="text-gray-900 dark:text-white font-medium">
              {categoryConfig.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{categoryConfig.emoji}</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryConfig.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            {categoryConfig.description}
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {principles.length} principles
          </Badge>
        </div>

        {/* Category Statistics */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {principles.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Principles
            </div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {principles.filter(p => p.automation?.autoActivation).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Auto-Activated
            </div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {crossReferences.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Cross-References
            </div>
          </Card>
        </div>

        {/* Mathematical Calculators (for Mathematical Rigor category) */}
        {category === PrincipleCategory.MATHEMATICAL && categoryFormulas.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Interactive Mathematical Calculators
            </h2>
            <MathCalculatorGrid />
          </div>
        )}

        {/* Principles List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Principles in this Category
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {principles.map((principle) => (
              <Link 
                key={principle.id}
                href={`/principles/${principle.categorySlug}/${principle.slug}`}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline" className="font-mono">
                      #{principle.id}
                    </Badge>
                    {principle.automation?.autoActivation && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Auto-activated
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {principle.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {principle.definition}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-2">
                    {principle.implementation && principle.implementation.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Implementation: 
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          {principle.implementation.length} steps
                        </span>
                      </div>
                    )}

                    {principle.protocol && principle.protocol.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Protocol: 
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          {principle.protocol.length} steps
                        </span>
                      </div>
                    )}

                    {principle.formula && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="text-purple-700 dark:text-purple-400 font-medium">
                          Mathematical formula included
                        </span>
                      </div>
                    )}

                    {principle.thresholds && Object.keys(principle.thresholds).length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="text-orange-700 dark:text-orange-400 font-medium">
                          {Object.keys(principle.thresholds).length} threshold{Object.keys(principle.thresholds).length !== 1 ? 's' : ''} defined
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cross-references */}
                  {principle.crossReferences && principle.crossReferences.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Connected to {principle.crossReferences.length} other principle{principle.crossReferences.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Cross-Category Connections */}
        {referencedCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Connected Categories
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {referencedCategories.map((refCategory) => {
                const refConfig = CATEGORY_CONFIG[refCategory];
                const connectionCount = crossReferences.filter(ref => ref.category === refCategory).length;
                
                return (
                  <Link
                    key={refCategory}
                    href={`/principles/${refCategory}`}
                    className="group"
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow group-hover:scale-[1.02]">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{refConfig.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {refConfig.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Link 
            href="/principles"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to All Principles
          </Link>
        </div>
      </div>
    </div>
  );
}