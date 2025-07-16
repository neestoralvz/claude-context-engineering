'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_CONFIG, PrincipleCategory, PRINCIPLES_DATA, PrincipleProcessor } from '@/lib/principles';

export default function PrinciplesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrincipleCategory | 'all'>('all');

  const filteredPrinciples = useMemo(() => {
    let principles = PRINCIPLES_DATA;

    // Filter by category
    if (selectedCategory !== 'all') {
      principles = principles.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      principles = PrincipleProcessor.searchPrinciples(searchQuery);
    }

    return principles.sort((a, b) => a.id - b.id);
  }, [searchQuery, selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats = Object.values(PrincipleCategory).map(category => {
      const categoryPrinciples = PRINCIPLES_DATA.filter(p => p.category === category);
      const config = CATEGORY_CONFIG[category];
      return {
        category,
        config,
        count: categoryPrinciples.length,
        principles: categoryPrinciples
      };
    });
    return stats;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Context Engineering Principles
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore all 56 principles organized across 7 categories that form the foundation of the Context Engineering methodology.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search principles by name, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PrincipleCategory | 'all')}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Object.values(PrincipleCategory).map(category => (
                  <option key={category} value={category}>
                    {CATEGORY_CONFIG[category].emoji} {CATEGORY_CONFIG[category].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Overview Cards */}
          {selectedCategory === 'all' && !searchQuery && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryStats.map(({ category, config, count }) => (
                <Card 
                  key={category}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{config.emoji}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {config.name}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {count} principles
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {config.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? `Found ${filteredPrinciples.length} principles` : 
               selectedCategory !== 'all' ? 
                 `${CATEGORY_CONFIG[selectedCategory].emoji} ${CATEGORY_CONFIG[selectedCategory].name} - ${filteredPrinciples.length} principles` :
                 `All ${filteredPrinciples.length} principles`}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Principles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrinciples.map((principle) => (
            <Link 
              key={principle.id} 
              href={`/principles/${principle.categorySlug}/${principle.slug}`}
              className="group"
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{principle.categoryEmoji}</span>
                    <Badge variant="outline" className="text-xs">
                      #{principle.id}
                    </Badge>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="text-xs bg-gray-100 dark:bg-gray-700"
                  >
                    {principle.categoryName}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {principle.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {principle.definition}
                </p>

                {/* Principle Features */}
                <div className="space-y-2 text-xs">
                  {principle.implementation && principle.implementation.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Implementation: 
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        {principle.implementation.length} steps
                      </span>
                    </div>
                  )}

                  {principle.automation?.autoActivation && (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        Auto-activated
                      </span>
                    </div>
                  )}

                  {principle.metrics && (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">
                        Metrics tracked
                      </span>
                    </div>
                  )}

                  {principle.formula && (
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span className="text-purple-700 dark:text-purple-400 font-medium">
                        Mathematical formula
                      </span>
                    </div>
                  )}
                </div>

                {/* Cross-references count */}
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

        {/* Empty State */}
        {filteredPrinciples.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No principles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search terms or category filter
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View all principles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}