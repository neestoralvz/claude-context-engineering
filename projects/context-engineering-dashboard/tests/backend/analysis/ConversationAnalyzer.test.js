/**
 * TDD Test Suite for ConversationAnalyzer Backend Component
 * Following Principles #9, #85, #86 - Mandatory TDD enforcement
 * 
 * Test Coverage Requirements:
 * - Pattern analysis, metrics extraction, and data processing
 * - Conversation data analysis and insight generation
 * - Usage pattern detection and classification
 * - Performance metrics calculation and aggregation
 * - Database integration and result storage
 */

const ConversationAnalyzer = require('../../../server/src/analysis/ConversationAnalyzer');
const JSONLProcessor = require('../../../server/src/analysis/JSONLProcessor');

// Mock dependencies
jest.mock('../../../server/src/analysis/JSONLProcessor');

describe('ConversationAnalyzer Backend Component', () => {
  let analyzer;
  let mockDbManager;
  let mockProcessor;

  beforeEach(() => {
    // Mock database manager
    mockDbManager = {
      saveAnalysisResults: jest.fn().mockResolvedValue(true),
      getAnalysisHistory: jest.fn().mockResolvedValue([]),
      updateMetrics: jest.fn().mockResolvedValue(true),
      query: jest.fn().mockResolvedValue([])
    };

    // Mock JSONL processor
    mockProcessor = {
      discoverConversationFiles: jest.fn(),
      processMultipleFiles: jest.fn(),
      parseConversationFile: jest.fn()
    };

    JSONLProcessor.mockImplementation(() => mockProcessor);

    analyzer = new ConversationAnalyzer(mockDbManager);
    
    jest.clearAllMocks();
  });

  describe('Initialization and Configuration', () => {
    test('should initialize with database manager and processor', () => {
      expect(analyzer.dbManager).toBe(mockDbManager);
      expect(analyzer.processor).toBeDefined();
      expect(analyzer.analysisCache).toBeInstanceOf(Map);
    });

    test('should initialize with empty analysis cache', () => {
      expect(analyzer.analysisCache.size).toBe(0);
    });
  });

  describe('Conversation Discovery and Processing', () => {
    test('should analyze all conversations and extract patterns', async () => {
      // Mock conversation files discovery
      mockProcessor.discoverConversationFiles.mockResolvedValue([
        { path: '/test/conv1.jsonl', size: 1024 },
        { path: '/test/conv2.jsonl', size: 2048 }
      ]);

      // Mock file processing results
      const mockResults = [
        {
          fileName: 'conv1.jsonl',
          conversation: {
            messages: [
              { type: 'user', content: 'Hello', timestamp: '2024-01-01T10:00:00Z' },
              { type: 'assistant', content: 'Hi there!', timestamp: '2024-01-01T10:00:01Z' }
            ],
            metadata: { totalTokens: 50, duration: 1000 },
            messageCount: 2
          }
        },
        {
          fileName: 'conv2.jsonl',
          conversation: {
            messages: [
              { type: 'user', content: 'Can you help with coding?', timestamp: '2024-01-01T11:00:00Z' },
              { type: 'assistant', content: 'Of course! What do you need?', timestamp: '2024-01-01T11:00:01Z' }
            ],
            metadata: { totalTokens: 75, duration: 1500 },
            messageCount: 2
          }
        }
      ];

      mockProcessor.processMultipleFiles.mockResolvedValue({
        results: mockResults,
        errors: []
      });

      const analysis = await analyzer.analyzeAllConversations();

      expect(mockProcessor.discoverConversationFiles).toHaveBeenCalled();
      expect(mockProcessor.processMultipleFiles).toHaveBeenCalled();
      expect(analysis.conversations).toHaveLength(2);
      expect(analysis.patterns).toBeDefined();
      expect(analysis.insights).toBeDefined();
    });

    test('should handle empty conversation directory gracefully', async () => {
      mockProcessor.discoverConversationFiles.mockResolvedValue([]);

      const analysis = await analyzer.analyzeAllConversations();

      expect(analysis.conversations).toEqual([]);
      expect(analysis.patterns).toEqual({});
      expect(analysis.insights).toEqual({});
    });

    test('should track processing progress', async () => {
      mockProcessor.discoverConversationFiles.mockResolvedValue([
        { path: '/test/conv1.jsonl' }
      ]);

      const mockProgressCallback = jest.fn();
      mockProcessor.processMultipleFiles.mockImplementation(async (files, options) => {
        // Simulate progress callback
        options.onProgress({ fileName: 'conv1.jsonl' }, 1, 1);
        return { results: [], errors: [] };
      });

      await analyzer.analyzeAllConversations({ 
        onProgress: mockProgressCallback 
      });

      expect(mockProcessor.processMultipleFiles).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          onProgress: expect.any(Function)
        })
      );
    });

    test('should handle processing errors gracefully', async () => {
      mockProcessor.discoverConversationFiles.mockResolvedValue([
        { path: '/test/conv1.jsonl' }
      ]);

      mockProcessor.processMultipleFiles.mockResolvedValue({
        results: [],
        errors: [
          { file: '/test/conv1.jsonl', error: 'Parse error' }
        ]
      });

      const analysis = await analyzer.analyzeAllConversations();

      expect(analysis.conversations).toEqual([]);
      expect(analysis.errors).toHaveLength(1);
    });
  });

  describe('Usage Pattern Analysis', () => {
    test('should analyze conversation patterns and classify interactions', () => {
      const mockConversations = [
        {
          messages: [
            { type: 'user', content: 'Write a Python function', timestamp: '2024-01-01T10:00:00Z' },
            { type: 'assistant', content: 'def hello():\n    print("Hello")', timestamp: '2024-01-01T10:00:01Z' }
          ],
          metadata: { totalTokens: 100, duration: 2000 }
        },
        {
          messages: [
            { type: 'user', content: 'Explain quantum physics', timestamp: '2024-01-01T11:00:00Z' },
            { type: 'assistant', content: 'Quantum physics is...', timestamp: '2024-01-01T11:00:01Z' }
          ],
          metadata: { totalTokens: 200, duration: 3000 }
        }
      ];

      const patterns = analyzer.analyzeUsagePatterns(mockConversations);

      expect(patterns.taskCategories).toBeDefined();
      expect(patterns.taskCategories.coding).toBeGreaterThan(0);
      expect(patterns.taskCategories.explanation).toBeGreaterThan(0);
      expect(patterns.averageTokensPerConversation).toBe(150);
      expect(patterns.averageDuration).toBe(2500);
    });

    test('should detect conversation complexity levels', () => {
      const simpleConversation = {
        messages: [
          { type: 'user', content: 'Hello' },
          { type: 'assistant', content: 'Hi' }
        ],
        metadata: { totalTokens: 20, duration: 500 }
      };

      const complexConversation = {
        messages: Array.from({ length: 20 }, (_, i) => ({
          type: i % 2 === 0 ? 'user' : 'assistant',
          content: `Complex message ${i} with detailed content`,
          timestamp: new Date(Date.now() + i * 1000).toISOString()
        })),
        metadata: { totalTokens: 2000, duration: 30000 }
      };

      const patterns = analyzer.analyzeUsagePatterns([simpleConversation, complexConversation]);

      expect(patterns.complexityDistribution.simple).toBe(1);
      expect(patterns.complexityDistribution.complex).toBe(1);
      expect(patterns.averageComplexity).toBeGreaterThan(0);
    });

    test('should identify time-based usage patterns', () => {
      const morningConversation = {
        messages: [
          { type: 'user', content: 'Morning task', timestamp: '2024-01-01T08:00:00Z' }
        ],
        metadata: { totalTokens: 50 }
      };

      const eveningConversation = {
        messages: [
          { type: 'user', content: 'Evening task', timestamp: '2024-01-01T20:00:00Z' }
        ],
        metadata: { totalTokens: 75 }
      };

      const patterns = analyzer.analyzeUsagePatterns([morningConversation, eveningConversation]);

      expect(patterns.timeDistribution).toBeDefined();
      expect(patterns.timeDistribution.morning).toBe(1);
      expect(patterns.timeDistribution.evening).toBe(1);
      expect(patterns.peakUsageHours).toBeDefined();
    });

    test('should calculate conversation flow metrics', () => {
      const conversation = {
        messages: [
          { type: 'user', content: 'Question 1', timestamp: '2024-01-01T10:00:00Z' },
          { type: 'assistant', content: 'Answer 1', timestamp: '2024-01-01T10:00:05Z' },
          { type: 'user', content: 'Follow-up question', timestamp: '2024-01-01T10:00:30Z' },
          { type: 'assistant', content: 'Follow-up answer', timestamp: '2024-01-01T10:00:35Z' }
        ]
      };

      const patterns = analyzer.analyzeUsagePatterns([conversation]);

      expect(patterns.averageResponseTime).toBeDefined();
      expect(patterns.conversationLength.average).toBe(4);
      expect(patterns.userEngagement.averageFollowUps).toBeGreaterThan(0);
    });
  });

  describe('Insight Generation', () => {
    test('should generate actionable insights from conversation patterns', () => {
      const mockPatterns = {
        taskCategories: { coding: 60, explanation: 30, general: 10 },
        averageTokensPerConversation: 150,
        averageDuration: 2500,
        complexityDistribution: { simple: 40, medium: 35, complex: 25 },
        timeDistribution: { morning: 30, afternoon: 45, evening: 25 },
        userEngagement: { averageFollowUps: 2.5, satisfactionScore: 0.85 }
      };

      const insights = analyzer.generateInsights([], mockPatterns);

      expect(insights.topUseCases).toContain('coding');
      expect(insights.efficiencyMetrics.averageTokenUsage).toBe(150);
      expect(insights.recommendations).toHaveLength.greaterThan(0);
      expect(insights.trendAnalysis).toBeDefined();
    });

    test('should identify optimization opportunities', () => {
      const highTokenPatterns = {
        averageTokensPerConversation: 2000, // High token usage
        averageResponseTime: 15000, // Slow responses
        complexityDistribution: { simple: 10, medium: 20, complex: 70 } // Mostly complex
      };

      const insights = analyzer.generateInsights([], highTokenPatterns);

      expect(insights.optimizationOpportunities).toContain('token_efficiency');
      expect(insights.optimizationOpportunities).toContain('response_speed');
      expect(insights.recommendations.some(r => r.includes('token'))).toBe(true);
    });

    test('should calculate user satisfaction metrics', () => {
      const conversationsWithOutcomes = [
        {
          messages: [{ type: 'user', content: 'Task completed successfully' }],
          metadata: { outcome: 'success', userRating: 5 }
        },
        {
          messages: [{ type: 'user', content: 'Had some issues' }],
          metadata: { outcome: 'partial', userRating: 3 }
        }
      ];

      const insights = analyzer.generateInsights(conversationsWithOutcomes, {});

      expect(insights.satisfactionMetrics.averageRating).toBe(4);
      expect(insights.satisfactionMetrics.successRate).toBe(0.5);
      expect(insights.satisfactionMetrics.issueRate).toBe(0.5);
    });

    test('should provide comparative analysis against baselines', () => {
      const currentPatterns = {
        averageTokensPerConversation: 200,
        averageResponseTime: 3000,
        complexityDistribution: { simple: 50, medium: 30, complex: 20 }
      };

      // Mock historical baseline data
      analyzer.baselineMetrics = {
        averageTokensPerConversation: 150,
        averageResponseTime: 4000,
        complexityDistribution: { simple: 40, medium: 40, complex: 20 }
      };

      const insights = analyzer.generateInsights([], currentPatterns);

      expect(insights.comparison.tokenUsageChange).toBeCloseTo(33.33, 1); // 33% increase
      expect(insights.comparison.responseTimeImprovement).toBe(true); // Faster responses
      expect(insights.trends.complexity).toBeDefined();
    });
  });

  describe('Database Integration and Storage', () => {
    test('should store analysis results in database', async () => {
      const mockResults = [
        {
          fileName: 'test.jsonl',
          conversation: { messages: [], metadata: {} },
          analysis: { patterns: {}, insights: {} }
        }
      ];

      await analyzer.storeAnalysisResults(mockResults);

      expect(mockDbManager.saveAnalysisResults).toHaveBeenCalledWith(mockResults);
    });

    test('should retrieve historical analysis data', async () => {
      const mockHistoricalData = [
        { date: '2024-01-01', patterns: {}, insights: {} },
        { date: '2024-01-02', patterns: {}, insights: {} }
      ];

      mockDbManager.getAnalysisHistory.mockResolvedValue(mockHistoricalData);

      const history = await analyzer.getAnalysisHistory({ days: 7 });

      expect(mockDbManager.getAnalysisHistory).toHaveBeenCalledWith({ days: 7 });
      expect(history).toEqual(mockHistoricalData);
    });

    test('should update metrics incrementally', async () => {
      const newMetrics = {
        totalConversations: 100,
        averageTokens: 150,
        lastAnalysis: new Date().toISOString()
      };

      await analyzer.updateMetrics(newMetrics);

      expect(mockDbManager.updateMetrics).toHaveBeenCalledWith(newMetrics);
    });

    test('should handle database errors gracefully', async () => {
      mockDbManager.saveAnalysisResults.mockRejectedValue(new Error('Database error'));

      const mockResults = [{ fileName: 'test.jsonl' }];

      await expect(analyzer.storeAnalysisResults(mockResults))
        .rejects.toThrow('Database error');
    });
  });

  describe('Performance and Caching', () => {
    test('should cache analysis results for performance', async () => {
      const cacheKey = 'analysis_2024-01-01';
      const cachedResult = { patterns: {}, insights: {} };

      analyzer.analysisCache.set(cacheKey, cachedResult);

      const result = analyzer.getCachedAnalysis(cacheKey);

      expect(result).toEqual(cachedResult);
    });

    test('should invalidate cache when new data is processed', async () => {
      analyzer.analysisCache.set('old_analysis', { data: 'old' });

      expect(analyzer.analysisCache.size).toBe(1);

      await analyzer.invalidateCache();

      expect(analyzer.analysisCache.size).toBe(0);
    });

    test('should handle large dataset analysis efficiently', async () => {
      // Mock large number of conversations
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        fileName: `conv${i}.jsonl`,
        conversation: {
          messages: [
            { type: 'user', content: `Message ${i}` },
            { type: 'assistant', content: `Response ${i}` }
          ],
          metadata: { totalTokens: 50 + i, duration: 1000 + i * 10 }
        }
      }));

      mockProcessor.processMultipleFiles.mockResolvedValue({
        results: largeDataset,
        errors: []
      });

      const startTime = Date.now();
      const analysis = await analyzer.analyzeAllConversations({ 
        concurrency: 5 
      });
      const endTime = Date.now();

      expect(analysis.conversations).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should manage memory usage during analysis', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Process moderately large dataset
      const dataset = Array.from({ length: 500 }, (_, i) => ({
        conversation: {
          messages: Array.from({ length: 20 }, (_, j) => ({
            type: j % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i}-${j}`
          })),
          metadata: { totalTokens: 200 }
        }
      }));

      const patterns = analyzer.analyzeUsagePatterns(dataset);
      const insights = analyzer.generateInsights(dataset, patterns);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Real-time Analysis and Monitoring', () => {
    test('should support real-time conversation analysis', async () => {
      const newConversation = {
        messages: [
          { type: 'user', content: 'Real-time question' },
          { type: 'assistant', content: 'Real-time answer' }
        ],
        metadata: { totalTokens: 50, timestamp: Date.now() }
      };

      const analysis = await analyzer.analyzeConversationRealTime(newConversation);

      expect(analysis.classification).toBeDefined();
      expect(analysis.metrics.tokenCount).toBe(50);
      expect(analysis.predictions.responseTime).toBeDefined();
    });

    test('should update running statistics with new conversations', () => {
      analyzer.runningStats = {
        totalConversations: 100,
        totalTokens: 15000,
        averageLength: 150
      };

      const newConversation = {
        metadata: { totalTokens: 200 }
      };

      analyzer.updateRunningStats(newConversation);

      expect(analyzer.runningStats.totalConversations).toBe(101);
      expect(analyzer.runningStats.totalTokens).toBe(15200);
      expect(analyzer.runningStats.averageLength).toBeCloseTo(150.5, 1);
    });

    test('should detect anomalies in conversation patterns', () => {
      const normalConversations = Array.from({ length: 100 }, () => ({
        metadata: { totalTokens: 100 + Math.random() * 50, duration: 2000 + Math.random() * 1000 }
      }));

      const anomalousConversation = {
        metadata: { totalTokens: 5000, duration: 60000 } // Unusually large
      };

      const isAnomaly = analyzer.detectAnomaly(anomalousConversation, normalConversations);

      expect(isAnomaly).toBe(true);
    });
  });

  describe('Export and Reporting', () => {
    test('should export analysis results in multiple formats', async () => {
      const analysisData = {
        patterns: { coding: 60, explanation: 40 },
        insights: { topUseCase: 'coding' },
        metadata: { timestamp: Date.now() }
      };

      const csvExport = await analyzer.exportToCsv(analysisData);
      const jsonExport = await analyzer.exportToJson(analysisData);

      expect(csvExport).toContain('coding,60');
      expect(jsonExport).toBe(JSON.stringify(analysisData, null, 2));
    });

    test('should generate comprehensive analysis reports', async () => {
      const mockData = {
        conversations: [{ messages: [] }],
        patterns: { coding: 60 },
        insights: { recommendations: ['Optimize token usage'] }
      };

      const report = await analyzer.generateReport(mockData, {
        format: 'detailed',
        includeCharts: true
      });

      expect(report.summary).toBeDefined();
      expect(report.recommendations).toHaveLength.greaterThan(0);
      expect(report.charts).toBeDefined();
    });
  });
});