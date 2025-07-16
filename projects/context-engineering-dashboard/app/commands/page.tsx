'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingCard } from '@/components/ui/LoadingCard';
import { 
  CommandProcessor, 
  Command, 
  CommandType, 
  CommandStatistics,
  COMMAND_CATEGORIES 
} from '@/lib/commands';

export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [statistics, setStatistics] = useState<CommandStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CommandType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [commandsData, statsData] = await Promise.all([
          CommandProcessor.getAllCommands(),
          CommandProcessor.getStatistics()
        ]);
        setCommands(commandsData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Failed to load command data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCommands = useMemo(() => {
    let filtered = commands;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(cmd => cmd.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cmd => cmd.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cmd =>
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.aliases?.some(alias => alias.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [commands, searchQuery, selectedType, selectedCategory]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.9) return 'bg-green-500';
    if (rate >= 0.8) return 'bg-blue-500';
    if (rate >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 0.5) return 'text-green-600 dark:text-green-400';
    if (complexity <= 1.0) return 'text-blue-600 dark:text-blue-400';
    if (complexity <= 1.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getComplexityLabel = (complexity: number) => {
    if (complexity <= 0.5) return 'Simple';
    if (complexity <= 1.0) return 'Moderate';
    if (complexity <= 1.5) return 'Complex';
    return 'Advanced';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Context Engineering Commands
            </h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Context Engineering Commands
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore all {statistics?.totalCommands || 0} commands in the Context Engineering system with real-time metrics and performance data.
          </p>
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {statistics.totalCommands}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Commands
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {(statistics.overallSuccessRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Success Rate
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {statistics.totalUsageCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Executions
              </div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {statistics.averageConfidenceScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Confidence
              </div>
            </Card>
          </div>
        )}

        {/* Command Type Distribution */}
        {statistics && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.atomicCommands}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Atomic</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {statistics.orchestratorCommands}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Orchestrators</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {statistics.metaCommands}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Meta</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {statistics.systemCommands}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System</div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search commands by name, description, or aliases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as CommandType | 'all')}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value={CommandType.ATOMIC}>Atomic</option>
                <option value={CommandType.ORCHESTRATOR}>Orchestrator</option>
                <option value={CommandType.META}>Meta</option>
                <option value={CommandType.SYSTEM}>System</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Object.entries(COMMAND_CATEGORIES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.emoji} {config.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all' ? 
                `Found ${filteredCommands.length} commands` : 
                `All ${filteredCommands.length} commands`}
            </p>
            {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Commands Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCommands.map((command) => (
            <Card key={command.name} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-mono ${
                        command.type === CommandType.ATOMIC ? 'text-blue-600 border-blue-300' :
                        command.type === CommandType.ORCHESTRATOR ? 'text-green-600 border-green-300' :
                        command.type === CommandType.META ? 'text-purple-600 border-purple-300' :
                        'text-orange-600 border-orange-300'
                      }`}
                    >
                      {command.type}
                    </Badge>
                    {command.principle && (
                      <Badge variant="outline" className="text-xs">
                        #{command.principle}
                      </Badge>
                    )}
                  </div>
                  
                  {command.category && COMMAND_CATEGORIES[command.category as keyof typeof COMMAND_CATEGORIES] && (
                    <span className="text-lg" title={COMMAND_CATEGORIES[command.category as keyof typeof COMMAND_CATEGORIES].name}>
                      {COMMAND_CATEGORIES[command.category as keyof typeof COMMAND_CATEGORIES].emoji}
                    </span>
                  )}
                </div>

                {/* Command Name */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    /{command.name}
                  </h3>
                  {command.aliases && command.aliases.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aliases: {command.aliases.join(', ')}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {command.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Success:</span>
                    <div className="flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${getSuccessRateColor(command.metrics.successRate)}`}></span>
                      <span className="font-mono text-xs">
                        {(command.metrics.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uses:</span>
                    <span className="font-mono text-xs">
                      {command.metrics.usageCount}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                    <span className={`font-mono text-xs ${getComplexityColor(command.complexity)}`}>
                      {command.complexity.toFixed(1)} ({getComplexityLabel(command.complexity)})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                    <span className="font-mono text-xs">
                      {command.metrics.confidenceScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="flex flex-wrap gap-1">
                  {command.metrics.successRate >= 0.9 && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      High Performance
                    </Badge>
                  )}
                  
                  {command.scriptIntegration?.integrationStatus === 'active' && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Script Integrated
                    </Badge>
                  )}
                  
                  {command.enhancements && command.enhancements.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Enhanced
                    </Badge>
                  )}
                  
                  {command.metrics.usageCount === 0 && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                      Unused
                    </Badge>
                  )}
                </div>

                {/* Command Chains (for orchestrators) */}
                {command.chains && command.chains.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Chains: {command.chains.length} commands
                    </span>
                  </div>
                )}

                {/* Last Used */}
                {command.metrics.lastUsed && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last used: {new Date(command.metrics.lastUsed).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCommands.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No commands found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View all commands
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link 
            href="/principles"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Principles →
          </Link>
        </div>
      </div>
    </div>
  );
}