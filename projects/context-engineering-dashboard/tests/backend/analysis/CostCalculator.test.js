/**
 * TDD Test Suite for CostCalculator Backend Component
 * Following Principles #9, #85, #86 - Mandatory TDD enforcement
 * 
 * Test Coverage Requirements:
 * - Cost calculation algorithms and optimization recommendations
 * - Model-specific pricing and token cost analysis
 * - Optimization opportunity detection and recommendations
 * - Usage pattern cost analysis and forecasting
 * - Cost efficiency metrics and reporting
 */

const CostCalculator = require('../../../server/src/analysis/CostCalculator');

describe('CostCalculator Backend Component', () => {
  let calculator;

  beforeEach(() => {
    calculator = new CostCalculator();
  });

  describe('Initialization and Configuration', () => {
    test('should initialize with correct model pricing structure', () => {
      expect(calculator.modelPricing).toBeDefined();
      expect(calculator.modelPricing['claude-3-sonnet-20240229']).toEqual({
        input: 3.00,
        output: 15.00
      });
      expect(calculator.modelPricing['claude-3-opus-20240229']).toEqual({
        input: 15.00,
        output: 75.00
      });
      expect(calculator.modelPricing['claude-3-haiku-20240307']).toEqual({
        input: 0.25,
        output: 1.25
      });
    });

    test('should have cost optimization thresholds configured', () => {
      expect(calculator.costOptimizationThresholds).toBeDefined();
      expect(calculator.costOptimizationThresholds.high_cost_session).toBe(1.00);
      expect(calculator.costOptimizationThresholds.inefficient_token_ratio).toBe(0.1);
      expect(calculator.costOptimizationThresholds.expensive_model_usage).toBe(0.5);
    });

    test('should include default fallback pricing', () => {
      expect(calculator.modelPricing.default).toEqual({
        input: 3.00,
        output: 15.00
      });
    });
  });

  describe('Single Conversation Cost Calculation', () => {
    test('should calculate cost for conversation with Claude 3 Sonnet', () => {
      const conversation = {
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: 1000,
          output_tokens: 500
        },
        messages: [
          { type: 'user', content: 'Test question' },
          { type: 'assistant', content: 'Test response' }
        ]
      };

      const cost = calculator.calculateConversationCost(conversation);

      // Expected: (1000/1000000) * 3.00 + (500/1000000) * 15.00 = 0.003 + 0.0075 = 0.0105
      expect(cost.totalCost).toBeCloseTo(0.0105, 4);
      expect(cost.inputCost).toBeCloseTo(0.003, 4);
      expect(cost.outputCost).toBeCloseTo(0.0075, 4);
      expect(cost.model).toBe('claude-3-sonnet-20240229');
    });

    test('should calculate cost for conversation with Claude 3 Opus', () => {
      const conversation = {
        model: 'claude-3-opus-20240229',
        usage: {
          input_tokens: 500,
          output_tokens: 200
        }
      };

      const cost = calculator.calculateConversationCost(conversation);

      // Expected: (500/1000000) * 15.00 + (200/1000000) * 75.00 = 0.0075 + 0.015 = 0.0225
      expect(cost.totalCost).toBeCloseTo(0.0225, 4);
      expect(cost.inputCost).toBeCloseTo(0.0075, 4);
      expect(cost.outputCost).toBeCloseTo(0.015, 4);
    });

    test('should calculate cost for conversation with Claude 3 Haiku', () => {
      const conversation = {
        model: 'claude-3-haiku-20240307',
        usage: {
          input_tokens: 2000,
          output_tokens: 1000
        }
      };

      const cost = calculator.calculateConversationCost(conversation);

      // Expected: (2000/1000000) * 0.25 + (1000/1000000) * 1.25 = 0.0005 + 0.00125 = 0.00175
      expect(cost.totalCost).toBeCloseTo(0.00175, 5);
      expect(cost.inputCost).toBeCloseTo(0.0005, 5);
      expect(cost.outputCost).toBeCloseTo(0.00125, 5);
    });

    test('should use default pricing for unknown models', () => {
      const conversation = {
        model: 'unknown-model',
        usage: {
          input_tokens: 1000,
          output_tokens: 500
        }
      };

      const cost = calculator.calculateConversationCost(conversation);

      // Should use default pricing (3.00 input, 15.00 output)
      expect(cost.totalCost).toBeCloseTo(0.0105, 4);
      expect(cost.model).toBe('unknown-model');
      expect(cost.pricingUsed).toBe('default');
    });

    test('should handle missing usage data gracefully', () => {
      const conversation = {
        model: 'claude-3-sonnet-20240229',
        messages: [
          { type: 'user', content: 'Test' }
        ]
      };

      const cost = calculator.calculateConversationCost(conversation);

      expect(cost.totalCost).toBe(0);
      expect(cost.inputCost).toBe(0);
      expect(cost.outputCost).toBe(0);
      expect(cost.error).toBe('Missing usage data');
    });

    test('should calculate cost breakdown with metadata', () => {
      const conversation = {
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: 1500,
          output_tokens: 750
        },
        timestamp: '2024-01-01T10:00:00Z',
        duration: 5000
      };

      const cost = calculator.calculateConversationCost(conversation);

      expect(cost.metadata.tokensPerDollar).toBeDefined();
      expect(cost.metadata.costPerMinute).toBeDefined();
      expect(cost.metadata.efficiency).toBeDefined();
      expect(cost.breakdown.inputPercentage).toBeCloseTo(28.57, 1); // 0.0045/0.0158 * 100
      expect(cost.breakdown.outputPercentage).toBeCloseTo(71.43, 1); // 0.01125/0.0158 * 100
    });
  });

  describe('Batch Cost Analysis', () => {
    test('should calculate total cost for multiple conversations', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 }
        },
        {
          model: 'claude-3-haiku-20240307',
          usage: { input_tokens: 2000, output_tokens: 1000 }
        },
        {
          model: 'claude-3-opus-20240229',
          usage: { input_tokens: 500, output_tokens: 200 }
        }
      ];

      const analysis = calculator.analyzeCostsByConversations(conversations);

      expect(analysis.totalCost).toBeCloseTo(0.034, 3); // Sum of all conversation costs
      expect(analysis.conversationCount).toBe(3);
      expect(analysis.averageCostPerConversation).toBeCloseTo(0.0113, 4);
      expect(analysis.totalTokens).toBe(5200); // 1000+500+2000+1000+500+200
    });

    test('should provide cost breakdown by model', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 }
        },
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1500, output_tokens: 750 }
        },
        {
          model: 'claude-3-haiku-20240307',
          usage: { input_tokens: 2000, output_tokens: 1000 }
        }
      ];

      const analysis = calculator.analyzeCostsByConversations(conversations);

      expect(analysis.costByModel['claude-3-sonnet-20240229']).toBeCloseTo(0.02625, 4);
      expect(analysis.costByModel['claude-3-haiku-20240307']).toBeCloseTo(0.00175, 5);
      expect(analysis.modelUsageStats['claude-3-sonnet-20240229'].count).toBe(2);
      expect(analysis.modelUsageStats['claude-3-haiku-20240307'].count).toBe(1);
    });

    test('should identify most expensive conversations', () => {
      const conversations = [
        {
          id: 'conv1',
          model: 'claude-3-haiku-20240307',
          usage: { input_tokens: 1000, output_tokens: 500 } // Low cost
        },
        {
          id: 'conv2',
          model: 'claude-3-opus-20240229',
          usage: { input_tokens: 2000, output_tokens: 1000 } // High cost
        },
        {
          id: 'conv3',
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1500, output_tokens: 750 } // Medium cost
        }
      ];

      const analysis = calculator.analyzeCostsByConversations(conversations);

      expect(analysis.topExpensiveConversations[0].id).toBe('conv2'); // Opus should be most expensive
      expect(analysis.topExpensiveConversations[0].cost).toBeCloseTo(0.105, 3);
      expect(analysis.costDistribution.high).toBe(1); // One high-cost conversation
      expect(analysis.costDistribution.medium).toBe(1);
      expect(analysis.costDistribution.low).toBe(1);
    });

    test('should handle empty conversation list', () => {
      const analysis = calculator.analyzeCostsByConversations([]);

      expect(analysis.totalCost).toBe(0);
      expect(analysis.conversationCount).toBe(0);
      expect(analysis.averageCostPerConversation).toBe(0);
      expect(analysis.costByModel).toEqual({});
    });
  });

  describe('Time-based Cost Analysis', () => {
    test('should calculate costs by time period', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          timestamp: '2024-01-01T10:00:00Z'
        },
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1500, output_tokens: 750 },
          timestamp: '2024-01-01T14:00:00Z'
        },
        {
          model: 'claude-3-haiku-20240307',
          usage: { input_tokens: 2000, output_tokens: 1000 },
          timestamp: '2024-01-02T10:00:00Z'
        }
      ];

      const analysis = calculator.analyzeCostsByTimeSpan(conversations, '24h');

      expect(analysis.dailyCosts['2024-01-01']).toBeCloseTo(0.02625, 4);
      expect(analysis.dailyCosts['2024-01-02']).toBeCloseTo(0.00175, 5);
      expect(analysis.timeSpan).toBe('24h');
      expect(analysis.totalDays).toBe(2);
    });

    test('should calculate hourly cost distribution', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          timestamp: '2024-01-01T09:00:00Z' // 9 AM
        },
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          timestamp: '2024-01-01T14:00:00Z' // 2 PM
        },
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          timestamp: '2024-01-01T21:00:00Z' // 9 PM
        }
      ];

      const analysis = calculator.analyzeCostsByTimeSpan(conversations, '1h');

      expect(analysis.hourlyDistribution['09']).toBeCloseTo(0.0105, 4);
      expect(analysis.hourlyDistribution['14']).toBeCloseTo(0.0105, 4);
      expect(analysis.hourlyDistribution['21']).toBeCloseTo(0.0105, 4);
      expect(analysis.peakCostHours).toContain('09');
    });

    test('should project future costs based on trends', () => {
      const historicalData = Array.from({ length: 30 }, (_, i) => ({
        model: 'claude-3-sonnet-20240229',
        usage: { 
          input_tokens: 1000 + i * 10, // Increasing usage trend
          output_tokens: 500 + i * 5 
        },
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString()
      }));

      const projection = calculator.projectFutureCosts(historicalData, { days: 30 });

      expect(projection.projectedDailyCost).toBeGreaterThan(0);
      expect(projection.projectedMonthlyCost).toBeGreaterThan(0);
      expect(projection.trendDirection).toMatch(/increasing|stable|decreasing/);
      expect(projection.confidence).toBeGreaterThan(0);
      expect(projection.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Optimization Recommendations', () => {
    test('should identify high-cost sessions for optimization', () => {
      const conversations = [
        {
          id: 'expensive',
          model: 'claude-3-opus-20240229',
          usage: { input_tokens: 10000, output_tokens: 5000 }, // Very expensive
          duration: 30000
        },
        {
          id: 'efficient',
          model: 'claude-3-haiku-20240307',
          usage: { input_tokens: 1000, output_tokens: 500 }, // Efficient
          duration: 5000
        }
      ];

      const recommendations = calculator.generateOptimizationRecommendations(conversations);

      expect(recommendations.highCostSessions).toContain('expensive');
      expect(recommendations.modelSuggestions.switchToHaiku).toContain('expensive');
      expect(recommendations.potentialSavings).toBeGreaterThan(0);
      expect(recommendations.recommendations).toContain('Consider using Claude 3 Haiku for simpler tasks');
    });

    test('should recommend model downgrades for appropriate tasks', () => {
      const conversations = [
        {
          model: 'claude-3-opus-20240229',
          usage: { input_tokens: 500, output_tokens: 200 }, // Simple task on expensive model
          metadata: { complexity: 'low', taskType: 'simple_question' }
        },
        {
          model: 'claude-3-opus-20240229',
          usage: { input_tokens: 5000, output_tokens: 2000 }, // Complex task, appropriate model
          metadata: { complexity: 'high', taskType: 'code_generation' }
        }
      ];

      const recommendations = calculator.generateOptimizationRecommendations(conversations);

      expect(recommendations.modelDowngrades).toHaveLength(1);
      expect(recommendations.modelDowngrades[0].reason).toContain('simple task');
      expect(recommendations.modelDowngrades[0].suggestedModel).toMatch(/haiku|sonnet/);
      expect(recommendations.estimatedSavings).toBeGreaterThan(0);
    });

    test('should identify inefficient token usage patterns', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 10000, output_tokens: 100 }, // Very low output ratio
          metadata: { taskType: 'question_answering' }
        },
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 2000 }, // Reasonable ratio
          metadata: { taskType: 'content_generation' }
        }
      ];

      const recommendations = calculator.generateOptimizationRecommendations(conversations);

      expect(recommendations.inefficientUsage).toHaveLength(1);
      expect(recommendations.inefficientUsage[0].issue).toContain('Low output token ratio');
      expect(recommendations.recommendations).toContain('Optimize prompt efficiency');
    });

    test('should suggest cost optimization strategies', () => {
      const highVolumeData = Array.from({ length: 100 }, (_, i) => ({
        model: 'claude-3-opus-20240229',
        usage: { input_tokens: 2000, output_tokens: 1000 },
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
      }));

      const recommendations = calculator.generateOptimizationRecommendations(highVolumeData);

      expect(recommendations.strategies).toContain('batch_processing');
      expect(recommendations.strategies).toContain('model_switching');
      expect(recommendations.strategies).toContain('prompt_optimization');
      expect(recommendations.totalPotentialSavings).toBeGreaterThan(0);
      expect(recommendations.savingsPercentage).toBeGreaterThan(0);
    });
  });

  describe('Cost Efficiency Metrics', () => {
    test('should calculate cost per task category', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          metadata: { taskCategory: 'coding', outcome: 'success' }
        },
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1500, output_tokens: 750 },
          metadata: { taskCategory: 'explanation', outcome: 'success' }
        },
        {
          model: 'claude-3-haiku-20240307',
          usage: { input_tokens: 500, output_tokens: 250 },
          metadata: { taskCategory: 'coding', outcome: 'success' }
        }
      ];

      const metrics = calculator.calculateEfficiencyMetrics(conversations);

      expect(metrics.costByTaskCategory.coding).toBeCloseTo(0.0114, 4); // Combined coding costs
      expect(metrics.costByTaskCategory.explanation).toBeCloseTo(0.01575, 4);
      expect(metrics.averageCostPerSuccessfulTask).toBeGreaterThan(0);
      expect(metrics.taskEfficiency.coding.averageCost).toBeDefined();
    });

    test('should calculate return on investment metrics', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          metadata: { 
            taskCategory: 'coding',
            outcome: 'success',
            timeSaved: 3600, // 1 hour saved
            valueGenerated: 50 // $50 value
          }
        },
        {
          model: 'claude-3-opus-20240229',
          usage: { input_tokens: 2000, output_tokens: 1000 },
          metadata: {
            taskCategory: 'analysis',
            outcome: 'success',
            timeSaved: 7200, // 2 hours saved
            valueGenerated: 100 // $100 value
          }
        }
      ];

      const metrics = calculator.calculateEfficiencyMetrics(conversations);

      expect(metrics.roi.totalValueGenerated).toBe(150);
      expect(metrics.roi.totalCostSpent).toBeGreaterThan(0);
      expect(metrics.roi.returnRatio).toBeGreaterThan(1); // Should be profitable
      expect(metrics.roi.timeSavingsValue).toBeGreaterThan(0);
    });

    test('should benchmark against cost targets', () => {
      const conversations = [
        {
          model: 'claude-3-sonnet-20240229',
          usage: { input_tokens: 1000, output_tokens: 500 },
          metadata: { taskCategory: 'coding' }
        }
      ];

      const costTargets = {
        dailyBudget: 5.00,
        monthlyBudget: 150.00,
        costPerTask: 0.05
      };

      const benchmark = calculator.benchmarkAgainstTargets(conversations, costTargets);

      expect(benchmark.dailySpend).toBeLessThan(costTargets.dailyBudget);
      expect(benchmark.monthlyProjection).toBeDefined();
      expect(benchmark.averageCostPerTask).toBeLessThan(costTargets.costPerTask);
      expect(benchmark.budgetUtilization.daily).toBeLessThan(1); // Under budget
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed usage data gracefully', () => {
      const malformedConversation = {
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: 'invalid',
          output_tokens: null
        }
      };

      const cost = calculator.calculateConversationCost(malformedConversation);

      expect(cost.totalCost).toBe(0);
      expect(cost.error).toBeDefined();
      expect(cost.error).toContain('Invalid token data');
    });

    test('should handle negative token values', () => {
      const conversation = {
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: -100,
          output_tokens: 500
        }
      };

      const cost = calculator.calculateConversationCost(conversation);

      expect(cost.totalCost).toBe(0);
      expect(cost.error).toContain('Invalid token values');
    });

    test('should handle extreme token values', () => {
      const conversation = {
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: 1000000000, // 1 billion tokens
          output_tokens: 500000000   // 500 million tokens
        }
      };

      const cost = calculator.calculateConversationCost(conversation);

      expect(cost.totalCost).toBeGreaterThan(0);
      expect(cost.totalCost).toBeLessThan(10000); // Reasonable upper bound
      expect(cost.warning).toContain('Unusually high token usage');
    });

    test('should validate model pricing updates', () => {
      const newPricing = {
        'claude-4-test': {
          input: 5.00,
          output: 25.00
        }
      };

      const result = calculator.updateModelPricing(newPricing);

      expect(result.success).toBe(true);
      expect(calculator.modelPricing['claude-4-test']).toEqual(newPricing['claude-4-test']);
    });

    test('should handle concurrent cost calculations safely', async () => {
      const conversations = Array.from({ length: 100 }, (_, i) => ({
        model: 'claude-3-sonnet-20240229',
        usage: { input_tokens: 1000 + i, output_tokens: 500 + i }
      }));

      // Run multiple calculations concurrently
      const promises = conversations.map(conv => 
        Promise.resolve(calculator.calculateConversationCost(conv))
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.totalCost).toBeGreaterThan(0);
        expect(result.error).toBeUndefined();
      });
    });
  });
});