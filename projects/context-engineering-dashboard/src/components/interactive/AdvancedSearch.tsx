'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Brain,
  BookOpen,
  Code,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Tag,
  Hash,
  ExternalLink
} from 'lucide-react'
import { CommandProcessor, Command, CommandType } from '@/lib/commands'

interface SearchResult {
  id: string
  type: 'command' | 'principle' | 'concept' | 'pattern'
  title: string
  description: string
  relevanceScore: number
  category?: string
  tags: string[]
  path?: string
  lastUsed?: Date
  usageCount?: number
  successRate?: number
  complexity?: number
  relatedItems?: string[]
  snippet?: string
}

interface SearchFilters {
  types: string[]
  categories: string[]
  complexity: [number, number]
  successRate: [number, number]
  dateRange: 'all' | '7d' | '30d' | '90d'
  sortBy: 'relevance' | 'usage' | 'success' | 'recent'
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'query' | 'filter' | 'command'
  confidence: number
  reasoning: string
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  confidence: number
  reasoning: string
  type: 'next-step' | 'related' | 'optimization' | 'learning'
  actionItems: string[]
  estimatedValue: number
}

export function AdvancedSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    categories: [],
    complexity: [0, 3],
    successRate: [0, 1],
    dateRange: 'all',
    sortBy: 'relevance'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load popular searches and trending topics
      const trendingSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          text: 'progressive thinking workflow',
          type: 'query',
          confidence: 0.95,
          reasoning: 'High engagement and proven effectiveness'
        },
        {
          id: '2', 
          text: 'command success rate optimization',
          type: 'query',
          confidence: 0.92,
          reasoning: 'Popular among intermediate users'
        },
        {
          id: '3',
          text: '/context-eng',
          type: 'command',
          confidence: 0.98,
          reasoning: 'Most frequently executed meta command'
        },
        {
          id: '4',
          text: 'mathematical verification principles',
          type: 'query',
          confidence: 0.88,
          reasoning: 'Foundation knowledge for advanced usage'
        }
      ]
      
      setSuggestions(trendingSuggestions)
      
      // Generate initial recommendations
      generateRecommendations('')
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    try {
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)])
      }

      // Simulate search with various data sources
      const searchResults = await Promise.all([
        searchCommands(searchQuery),
        searchPrinciples(searchQuery),
        searchConcepts(searchQuery),
        searchPatterns(searchQuery)
      ])

      const allResults = searchResults.flat()
      const scoredResults = scoreAndRankResults(allResults, searchQuery)
      const filteredResults = applyFilters(scoredResults, filters)
      
      setResults(filteredResults)
      
      // Generate contextual suggestions
      generateSearchSuggestions(searchQuery, filteredResults)
      
      // Generate AI recommendations
      generateRecommendations(searchQuery, filteredResults)
      
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [filters, searchHistory])

  const searchCommands = async (query: string): Promise<SearchResult[]> => {
    try {
      const commands = await CommandProcessor.searchCommands(query)
      
      return commands.map(cmd => ({
        id: `cmd-${cmd.name}`,
        type: 'command' as const,
        title: cmd.name,
        description: cmd.description,
        relevanceScore: calculateRelevance(query, cmd.name + ' ' + cmd.description),
        category: cmd.category || 'general',
        tags: [cmd.type, `complexity-${Math.floor(cmd.complexity)}`, 'command'],
        path: cmd.path,
        lastUsed: new Date(cmd.metrics.lastUsed),
        usageCount: cmd.metrics.usageCount,
        successRate: cmd.metrics.successRate,
        complexity: cmd.complexity,
        relatedItems: cmd.chains || [],
        snippet: `/${cmd.name} - ${cmd.description.substring(0, 100)}...`
      }))
    } catch (error) {
      console.error('Command search failed:', error)
      return []
    }
  }

  const searchPrinciples = async (query: string): Promise<SearchResult[]> => {
    // Mock principle search - in real app would search principle files
    const mockPrinciples = [
      {
        id: 'principle-1',
        title: 'Philosophical Foundations',
        description: 'Core meta-principles: Intelligence as natural phenomenon, context over commands',
        category: 'philosophical',
        tags: ['principle', 'foundation', 'meta']
      },
      {
        id: 'principle-15',
        title: 'Mathematical Rigor',
        description: 'Quantifiable metrics, mathematical validation, and precision measurement',
        category: 'mathematical',
        tags: ['principle', 'mathematics', 'validation']
      },
      {
        id: 'principle-53',
        title: 'Intelligent Lazy Loading',
        description: 'Context optimization through progressive loading and smart caching',
        category: 'optimization',
        tags: ['principle', 'optimization', 'performance']
      }
    ]

    return mockPrinciples
      .filter(principle => 
        principle.title.toLowerCase().includes(query.toLowerCase()) ||
        principle.description.toLowerCase().includes(query.toLowerCase())
      )
      .map(principle => ({
        id: principle.id,
        type: 'principle' as const,
        title: principle.title,
        description: principle.description,
        relevanceScore: calculateRelevance(query, principle.title + ' ' + principle.description),
        category: principle.category,
        tags: principle.tags,
        path: `/principles/${principle.category}/${principle.id}`,
        snippet: principle.description.substring(0, 150) + '...'
      }))
  }

  const searchConcepts = async (query: string): Promise<SearchResult[]> => {
    // Mock concept search
    const concepts = [
      {
        id: 'concept-progressive-thinking',
        title: 'Progressive Thinking',
        description: '4-stage cognitive methodology: Surface Analysis → Pattern Recognition → Deep Synthesis → Strategic Integration',
        tags: ['concept', 'methodology', 'thinking']
      },
      {
        id: 'concept-decision-engine',
        title: 'Decision Engine',
        description: 'Mathematical threshold-based routing system with confidence scoring and auto-triggers',
        tags: ['concept', 'engine', 'automation']
      },
      {
        id: 'concept-context-optimization',
        title: 'Context Optimization',
        description: 'Intelligent context reduction achieving 78% efficiency while maintaining 98% accuracy',
        tags: ['concept', 'optimization', 'performance']
      }
    ]

    return concepts
      .filter(concept => 
        concept.title.toLowerCase().includes(query.toLowerCase()) ||
        concept.description.toLowerCase().includes(query.toLowerCase())
      )
      .map(concept => ({
        id: concept.id,
        type: 'concept' as const,
        title: concept.title,
        description: concept.description,
        relevanceScore: calculateRelevance(query, concept.title + ' ' + concept.description),
        category: 'methodology',
        tags: concept.tags,
        snippet: concept.description
      }))
  }

  const searchPatterns = async (query: string): Promise<SearchResult[]> => {
    // Mock pattern search
    const patterns = [
      {
        id: 'pattern-command-chain',
        title: 'Command Chain Optimization',
        description: 'Pattern for chaining commands efficiently: /meta-core → /decision → /execution',
        usageCount: 15,
        successRate: 0.94
      },
      {
        id: 'pattern-context-loading',
        title: 'Progressive Context Loading',
        description: 'Load context incrementally based on complexity and confidence thresholds',
        usageCount: 8,
        successRate: 0.89
      }
    ]

    return patterns
      .filter(pattern => 
        pattern.title.toLowerCase().includes(query.toLowerCase()) ||
        pattern.description.toLowerCase().includes(query.toLowerCase())
      )
      .map(pattern => ({
        id: pattern.id,
        type: 'pattern' as const,
        title: pattern.title,
        description: pattern.description,
        relevanceScore: calculateRelevance(query, pattern.title + ' ' + pattern.description),
        category: 'automation',
        tags: ['pattern', 'automation', 'optimization'],
        usageCount: pattern.usageCount,
        successRate: pattern.successRate,
        snippet: pattern.description
      }))
  }

  const calculateRelevance = (query: string, text: string): number => {
    const queryTerms = query.toLowerCase().split(' ')
    const textLower = text.toLowerCase()
    
    let score = 0
    queryTerms.forEach(term => {
      if (textLower.includes(term)) {
        score += term.length / text.length * 100
      }
    })
    
    return Math.min(score, 100)
  }

  const scoreAndRankResults = (results: SearchResult[], query: string): SearchResult[] => {
    return results.sort((a, b) => {
      if (filters.sortBy === 'relevance') return b.relevanceScore - a.relevanceScore
      if (filters.sortBy === 'usage') return (b.usageCount || 0) - (a.usageCount || 0)
      if (filters.sortBy === 'success') return (b.successRate || 0) - (a.successRate || 0)
      if (filters.sortBy === 'recent') {
        const aDate = a.lastUsed?.getTime() || 0
        const bDate = b.lastUsed?.getTime() || 0
        return bDate - aDate
      }
      return 0
    })
  }

  const applyFilters = (results: SearchResult[], filters: SearchFilters): SearchResult[] => {
    return results.filter(result => {
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(result.type)) {
        return false
      }
      
      // Category filter
      if (filters.categories.length > 0 && result.category && !filters.categories.includes(result.category)) {
        return false
      }
      
      // Complexity filter
      if (result.complexity !== undefined) {
        if (result.complexity < filters.complexity[0] || result.complexity > filters.complexity[1]) {
          return false
        }
      }
      
      // Success rate filter
      if (result.successRate !== undefined) {
        if (result.successRate < filters.successRate[0] || result.successRate > filters.successRate[1]) {
          return false
        }
      }
      
      // Date range filter
      if (filters.dateRange !== 'all' && result.lastUsed) {
        const daysAgo = {
          '7d': 7,
          '30d': 30,
          '90d': 90
        }[filters.dateRange] || 0
        
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
        
        if (result.lastUsed < cutoffDate) {
          return false
        }
      }
      
      return true
    })
  }

  const generateSearchSuggestions = (query: string, results: SearchResult[]) => {
    const suggestions: SearchSuggestion[] = []
    
    // Query refinement suggestions
    if (results.length > 10) {
      suggestions.push({
        id: 'refine-1',
        text: `${query} high success rate`,
        type: 'filter',
        confidence: 0.85,
        reasoning: 'Narrow down to high-performing items'
      })
    }
    
    if (results.length === 0) {
      suggestions.push({
        id: 'expand-1',
        text: query.split(' ')[0], // First word only
        type: 'query',
        confidence: 0.75,
        reasoning: 'Try a broader search term'
      })
    }
    
    // Related concept suggestions
    const categoriesSet = new Set(results.map(r => r.category).filter(Boolean))
    const categories = Array.from(categoriesSet)
    categories.forEach(category => {
      suggestions.push({
        id: `cat-${category}`,
        text: `${category} concepts`,
        type: 'query',
        confidence: 0.8,
        reasoning: `Explore more ${category} topics`
      })
    })
    
    setSuggestions(suggestions.slice(0, 6))
  }

  const generateRecommendations = (query: string, results: SearchResult[] = []) => {
    const recommendations: AIRecommendation[] = []
    
    if (query.includes('progressive') || query.includes('thinking')) {
      recommendations.push({
        id: 'rec-progressive',
        title: 'Try Progressive Thinking Demo',
        description: 'Experience the 4-stage methodology with interactive simulation',
        confidence: 0.92,
        reasoning: 'Based on your interest in progressive thinking',
        type: 'next-step',
        actionItems: ['Open Progressive Thinking Demo', 'Try a complex analysis scenario', 'Review breakthrough insights'],
        estimatedValue: 0.85
      })
    }
    
    if (query.includes('command') || results.some(r => r.type === 'command')) {
      recommendations.push({
        id: 'rec-simulator',
        title: 'Practice with Command Simulator',
        description: 'Hands-on experience with real command execution flows',
        confidence: 0.89,
        reasoning: 'Command-related search suggests practical interest',
        type: 'learning',
        actionItems: ['Try command simulator', 'Practice with different complexity levels', 'Review execution insights'],
        estimatedValue: 0.78
      })
    }
    
    if (query.includes('performance') || query.includes('metric')) {
      recommendations.push({
        id: 'rec-dashboard',
        title: 'Explore Live Metrics Dashboard',
        description: 'Real-time system performance and optimization insights',
        confidence: 0.91,
        reasoning: 'Performance focus indicates analytical approach',
        type: 'optimization',
        actionItems: ['View live metrics', 'Analyze performance trends', 'Identify optimization opportunities'],
        estimatedValue: 0.82
      })
    }
    
    // General recommendations
    if (results.length > 0) {
      recommendations.push({
        id: 'rec-explore',
        title: 'Explore Related Commands',
        description: 'Discover commands related to your search results',
        confidence: 0.76,
        reasoning: 'Found relevant results - deeper exploration recommended',
        type: 'related',
        actionItems: ['Review command relationships', 'Check usage patterns', 'Try related workflows'],
        estimatedValue: 0.65
      })
    }
    
    setRecommendations(recommendations.slice(0, 4))
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      command: <Code className="w-4 h-4" />,
      principle: <BookOpen className="w-4 h-4" />,
      concept: <Brain className="w-4 h-4" />,
      pattern: <Target className="w-4 h-4" />
    }
    return icons[type as keyof typeof icons] || <Search className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      command: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      principle: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      concept: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      pattern: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const filteredResults = useMemo(() => results, [results])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          🔍 Advanced Search & AI Recommendations
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Intelligent search across commands, principles, concepts, and patterns with 
          AI-powered suggestions and contextual recommendations.
        </p>
      </div>

      {/* Search Interface */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search commands, principles, concepts, patterns..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  performSearch(e.target.value)
                }}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-slate-400"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 
                         text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
            
            {isLoading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {!query && suggestions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Trending Searches
              </h5>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      setQuery(suggestion.text)
                      performSearch(suggestion.text)
                    }}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 
                             rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {!query && searchHistory.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Recent Searches
              </h5>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      performSearch(search)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-slate-800 
                             text-slate-600 dark:text-slate-400 rounded-full text-sm 
                             hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200 dark:border-slate-700 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Content Type
                    </label>
                    <div className="space-y-1">
                      {['command', 'principle', 'concept', 'pattern'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, types: [...prev.types, type] }))
                              } else {
                                setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }))
                              }
                            }}
                            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 
                                     focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        sortBy: e.target.value as SearchFilters['sortBy'] 
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="usage">Usage Count</option>
                      <option value="success">Success Rate</option>
                      <option value="recent">Most Recent</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: e.target.value as SearchFilters['dateRange'] 
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                               bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                               focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Quick Actions
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setFilters({
                          types: [],
                          categories: [],
                          complexity: [0, 3],
                          successRate: [0, 1],
                          dateRange: 'all',
                          sortBy: 'relevance'
                        })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 
                                 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 
                                 dark:hover:bg-slate-800 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2 space-y-4">
          {query && (
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Search Results
              </h4>
              <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {filteredResults.length} found
              </Badge>
            </div>
          )}

          {isLoading && (
            <Card className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Searching...</p>
              </div>
            </Card>
          )}

          <AnimatePresence>
            {filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-3">
                    {/* Result Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-600 dark:text-slate-400">
                          {getTypeIcon(result.type)}
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-900 dark:text-slate-100">
                            {result.title}
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {result.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {result.relevanceScore.toFixed(0)}% match
                        </span>
                      </div>
                    </div>

                    {/* Snippet */}
                    {result.snippet && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <code className="text-sm text-slate-700 dark:text-slate-300">
                          {result.snippet}
                        </code>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {result.usageCount !== undefined && (
                          <span>Used {result.usageCount} times</span>
                        )}
                        {result.successRate !== undefined && (
                          <span>{(result.successRate * 100).toFixed(0)}% success</span>
                        )}
                        {result.complexity !== undefined && (
                          <span>Complexity: {result.complexity.toFixed(1)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-xs"
                          >
                            <Hash className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {query && filteredResults.length === 0 && !isLoading && (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h5 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No results found
              </h5>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Try adjusting your search terms or filters
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 
                           rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Adjust Filters
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              AI Recommendations
            </h4>
          </div>

          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100">
                        {rec.title}
                      </h5>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {(rec.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rec.description}
                    </p>
                    
                    <div className="text-xs text-slate-500 italic">
                      💡 {rec.reasoning}
                    </div>
                    
                    <div className="space-y-1">
                      {rec.actionItems.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ArrowRight className="w-3 h-3" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 
                                     bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      <ExternalLink className="w-4 h-4" />
                      Try This
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {recommendations.length === 0 && (
            <Card className="p-6 text-center">
              <Brain className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Start searching to get personalized AI recommendations
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}