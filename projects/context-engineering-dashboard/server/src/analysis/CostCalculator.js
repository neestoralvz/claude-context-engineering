/**
 * Cost Calculator for Claude Code Usage Analysis
 * Calculates token-based costs with model-specific pricing
 */
class CostCalculator {
  constructor() {
    // Model pricing per 1M tokens (as of 2024)
    this.modelPricing = {
      'claude-3-sonnet-20240229': {
        input: 3.00,   // $3.00 per 1M input tokens
        output: 15.00  // $15.00 per 1M output tokens
      },
      'claude-3-opus-20240229': {
        input: 15.00,  // $15.00 per 1M input tokens
        output: 75.00  // $75.00 per 1M output tokens
      },
      'claude-3-haiku-20240307': {
        input: 0.25,   // $0.25 per 1M input tokens
        output: 1.25   // $1.25 per 1M output tokens
      },
      'claude-3-5-sonnet-20240620': {
        input: 3.00,   // $3.00 per 1M input tokens
        output: 15.00  // $15.00 per 1M output tokens
      },
      'claude-3-5-haiku-20241022': {
        input: 1.00,   // $1.00 per 1M input tokens
        output: 5.00   // $5.00 per 1M output tokens
      },
      // Default fallback pricing
      'default': {
        input: 3.00,
        output: 15.00
      }
    };
    
    this.costOptimizationThresholds = {
      high_cost_session: 1.00,      // $1.00 per session
      inefficient_token_ratio: 0.1,  // Input/output ratio threshold
      expensive_model_usage: 0.5     // Percentage of expensive model usage
    };
  }

  /**
   * Calculate cost for a single conversation
   */
  calculateConversationCost(conversation) {
    const costs = {
      totalCost: 0,
      inputCost: 0,
      outputCost: 0,
      modelBreakdown: {},
      costPerMessage: 0,
      costPerToken: 0,
      efficiency: {
        tokenEfficiency: 0,
        costEfficiency: 0,
        modelEfficiency: 0
      },
      recommendations: []
    };

    // Calculate base costs
    if (conversation.models && conversation.models.length > 0) {
      conversation.models.forEach(model => {
        const pricing = this.getModelPricing(model);
        
        // Estimate token distribution per model (simplified)
        const inputTokens = conversation.totalInputTokens / conversation.models.length;
        const outputTokens = conversation.totalOutputTokens / conversation.models.length;
        
        const modelInputCost = (inputTokens / 1000000) * pricing.input;
        const modelOutputCost = (outputTokens / 1000000) * pricing.output;
        const modelTotalCost = modelInputCost + modelOutputCost;
        
        costs.modelBreakdown[model] = {
          inputTokens: Math.round(inputTokens),
          outputTokens: Math.round(outputTokens),
          inputCost: modelInputCost,
          outputCost: modelOutputCost,
          totalCost: modelTotalCost
        };
        
        costs.inputCost += modelInputCost;
        costs.outputCost += modelOutputCost;
        costs.totalCost += modelTotalCost;
      });
    } else {
      // Fallback to default pricing
      const pricing = this.getModelPricing('default');
      costs.inputCost = (conversation.totalInputTokens / 1000000) * pricing.input;
      costs.outputCost = (conversation.totalOutputTokens / 1000000) * pricing.output;
      costs.totalCost = costs.inputCost + costs.outputCost;
    }

    // Calculate per-unit costs
    costs.costPerMessage = conversation.messageCount > 0 ? costs.totalCost / conversation.messageCount : 0;
    costs.costPerToken = conversation.totalTokens > 0 ? costs.totalCost / conversation.totalTokens : 0;

    // Calculate efficiency metrics
    costs.efficiency = this.calculateEfficiencyMetrics(conversation, costs);

    // Generate cost optimization recommendations
    costs.recommendations = this.generateCostRecommendations(conversation, costs);

    return costs;
  }

  /**
   * Calculate costs for multiple conversations
   */
  calculateBatchCosts(conversations) {
    const batchCosts = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      averageCostPerConversation: 0,
      modelUsageBreakdown: {},
      costTrends: {},
      optimizationPotential: {
        totalSavings: 0,
        recommendations: []
      }
    };

    const conversationCosts = conversations.map(conv => {
      const cost = this.calculateConversationCost(conv);
      
      // Accumulate batch totals
      batchCosts.totalCost += cost.totalCost;
      batchCosts.totalInputTokens += conv.totalInputTokens;
      batchCosts.totalOutputTokens += conv.totalOutputTokens;
      
      // Track model usage
      Object.entries(cost.modelBreakdown).forEach(([model, modelCost]) => {
        if (!batchCosts.modelUsageBreakdown[model]) {
          batchCosts.modelUsageBreakdown[model] = {
            conversations: 0,
            totalCost: 0,
            inputTokens: 0,
            outputTokens: 0
          };
        }
        
        batchCosts.modelUsageBreakdown[model].conversations++;
        batchCosts.modelUsageBreakdown[model].totalCost += modelCost.totalCost;
        batchCosts.modelUsageBreakdown[model].inputTokens += modelCost.inputTokens;
        batchCosts.modelUsageBreakdown[model].outputTokens += modelCost.outputTokens;
      });
      
      // Track cost trends by date
      if (conv.conversationStart) {
        const date = new Date(conv.conversationStart).toISOString().split('T')[0];
        batchCosts.costTrends[date] = (batchCosts.costTrends[date] || 0) + cost.totalCost;
      }
      
      return { conversation: conv, cost };
    });

    // Calculate averages
    batchCosts.averageCostPerConversation = conversations.length > 0 ? 
      batchCosts.totalCost / conversations.length : 0;

    // Analyze optimization potential
    batchCosts.optimizationPotential = this.analyzeOptimizationPotential(conversationCosts);

    return { batchCosts, conversationCosts };
  }

  /**
   * Get pricing for a specific model
   */
  getModelPricing(model) {
    // Try exact match first
    if (this.modelPricing[model]) {
      return this.modelPricing[model];
    }
    
    // Try partial match for model families
    const modelFamily = Object.keys(this.modelPricing).find(key => 
      model.toLowerCase().includes(key.toLowerCase())
    );
    
    if (modelFamily) {
      return this.modelPricing[modelFamily];
    }
    
    // Fallback to default
    return this.modelPricing.default;
  }

  /**
   * Calculate efficiency metrics
   */
  calculateEfficiencyMetrics(conversation, costs) {
    const efficiency = {
      tokenEfficiency: 0,
      costEfficiency: 0,
      modelEfficiency: 0
    };

    // Token efficiency: output/input ratio
    if (conversation.totalInputTokens > 0) {
      efficiency.tokenEfficiency = conversation.totalOutputTokens / conversation.totalInputTokens;
    }

    // Cost efficiency: value per dollar (messages per dollar)
    if (costs.totalCost > 0) {
      efficiency.costEfficiency = conversation.messageCount / costs.totalCost;
    }

    // Model efficiency: using cheaper models when possible
    if (conversation.models && conversation.models.length > 0) {
      const avgModelCost = conversation.models.reduce((sum, model) => {
        const pricing = this.getModelPricing(model);
        return sum + (pricing.input + pricing.output) / 2;
      }, 0) / conversation.models.length;
      
      const cheapestModelCost = Math.min(...Object.values(this.modelPricing).map(p => (p.input + p.output) / 2));
      efficiency.modelEfficiency = cheapestModelCost / avgModelCost;
    }

    return efficiency;
  }

  /**
   * Generate cost optimization recommendations
   */
  generateCostRecommendations(conversation, costs) {
    const recommendations = [];

    // High cost session recommendation
    if (costs.totalCost > this.costOptimizationThresholds.high_cost_session) {
      recommendations.push({
        type: 'high_cost_session',
        priority: 'high',
        title: 'High cost session detected',
        description: `This conversation cost $${costs.totalCost.toFixed(4)}, consider optimizing query complexity`,
        potentialSavings: costs.totalCost * 0.3
      });
    }

    // Inefficient token ratio
    if (costs.efficiency.tokenEfficiency < this.costOptimizationThresholds.inefficient_token_ratio) {
      recommendations.push({
        type: 'inefficient_tokens',
        priority: 'medium',
        title: 'Low token efficiency detected',
        description: 'Consider providing more concise inputs or asking for more detailed responses',
        potentialSavings: costs.totalCost * 0.15
      });
    }

    // Expensive model usage
    if (conversation.models && conversation.models.some(model => 
      this.getModelPricing(model).input > this.modelPricing.default.input * 2
    )) {
      recommendations.push({
        type: 'expensive_model',
        priority: 'medium',
        title: 'Expensive model usage detected',
        description: 'Consider using Haiku or Sonnet for simpler tasks instead of Opus',
        potentialSavings: costs.totalCost * 0.5
      });
    }

    // Long conversation optimization
    if (conversation.messageCount > 50) {
      recommendations.push({
        type: 'long_conversation',
        priority: 'low',
        title: 'Very long conversation detected',
        description: 'Consider breaking complex tasks into smaller, focused conversations',
        potentialSavings: costs.totalCost * 0.2
      });
    }

    return recommendations;
  }

  /**
   * Analyze optimization potential across all conversations
   */
  analyzeOptimizationPotential(conversationCosts) {
    const optimization = {
      totalSavings: 0,
      recommendations: []
    };

    // Aggregate recommendations by type
    const recommendationGroups = {};
    
    conversationCosts.forEach(({ conversation, cost }) => {
      cost.recommendations.forEach(rec => {
        if (!recommendationGroups[rec.type]) {
          recommendationGroups[rec.type] = {
            type: rec.type,
            priority: rec.priority,
            title: rec.title,
            count: 0,
            totalSavings: 0,
            affectedConversations: []
          };
        }
        
        recommendationGroups[rec.type].count++;
        recommendationGroups[rec.type].totalSavings += rec.potentialSavings;
        recommendationGroups[rec.type].affectedConversations.push(conversation.fileName);
      });
    });

    // Convert to array and sort by potential savings
    optimization.recommendations = Object.values(recommendationGroups)
      .sort((a, b) => b.totalSavings - a.totalSavings)
      .map(group => ({
        ...group,
        description: `${group.count} conversations affected, potential savings: $${group.totalSavings.toFixed(4)}`,
        averageSavingsPerConversation: group.totalSavings / group.count
      }));

    // Calculate total potential savings
    optimization.totalSavings = optimization.recommendations.reduce(
      (sum, rec) => sum + rec.totalSavings, 0
    );

    return optimization;
  }

  /**
   * Generate cost report
   */
  generateCostReport(conversations) {
    const { batchCosts, conversationCosts } = this.calculateBatchCosts(conversations);
    
    const report = {
      summary: {
        totalCost: batchCosts.totalCost,
        totalConversations: conversations.length,
        averageCostPerConversation: batchCosts.averageCostPerConversation,
        totalTokens: batchCosts.totalInputTokens + batchCosts.totalOutputTokens,
        costPerToken: batchCosts.totalCost / (batchCosts.totalInputTokens + batchCosts.totalOutputTokens)
      },
      modelBreakdown: batchCosts.modelUsageBreakdown,
      costTrends: batchCosts.costTrends,
      topExpensiveConversations: conversationCosts
        .sort((a, b) => b.cost.totalCost - a.cost.totalCost)
        .slice(0, 10)
        .map(({ conversation, cost }) => ({
          fileName: conversation.fileName,
          cost: cost.totalCost,
          messages: conversation.messageCount,
          tokens: conversation.totalTokens
        })),
      optimizationPotential: batchCosts.optimizationPotential,
      recommendations: this.generateGlobalRecommendations(batchCosts),
      generatedAt: new Date().toISOString()
    };

    return report;
  }

  /**
   * Generate global cost optimization recommendations
   */
  generateGlobalRecommendations(batchCosts) {
    const recommendations = [];

    // Model optimization recommendations
    const sortedModels = Object.entries(batchCosts.modelUsageBreakdown)
      .sort((a, b) => b[1].totalCost - a[1].totalCost);

    if (sortedModels.length > 0) {
      const mostExpensiveModel = sortedModels[0];
      const totalModelCost = mostExpensiveModel[1].totalCost;
      
      if (totalModelCost > batchCosts.totalCost * 0.5) {
        recommendations.push({
          type: 'model_optimization',
          priority: 'high',
          title: 'Optimize model selection',
          description: `${mostExpensiveModel[0]} accounts for ${((totalModelCost / batchCosts.totalCost) * 100).toFixed(1)}% of total costs`,
          action: 'Consider using more cost-effective models for simpler tasks'
        });
      }
    }

    // Usage pattern recommendations
    const dailyAverage = Object.values(batchCosts.costTrends).reduce((sum, cost) => sum + cost, 0) / 
                        Object.keys(batchCosts.costTrends).length;
    
    if (dailyAverage > 5.00) {
      recommendations.push({
        type: 'usage_optimization',
        priority: 'medium',
        title: 'High daily usage detected',
        description: `Average daily cost: $${dailyAverage.toFixed(2)}`,
        action: 'Consider implementing usage monitoring and budget controls'
      });
    }

    return recommendations;
  }

  /**
   * Calculate projected costs based on usage patterns
   */
  projectCosts(conversations, projectionPeriod = 'monthly') {
    const { batchCosts } = this.calculateBatchCosts(conversations);
    
    const projectionMultipliers = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365
    };

    const multiplier = projectionMultipliers[projectionPeriod] || 30;
    const dailyAverage = batchCosts.totalCost / Object.keys(batchCosts.costTrends).length;
    
    return {
      period: projectionPeriod,
      projectedCost: dailyAverage * multiplier,
      currentPeriodCost: batchCosts.totalCost,
      projectedSavings: batchCosts.optimizationPotential.totalSavings * multiplier,
      breakdown: Object.entries(batchCosts.modelUsageBreakdown).map(([model, usage]) => ({
        model,
        projectedCost: (usage.totalCost / Object.keys(batchCosts.costTrends).length) * multiplier,
        currentCost: usage.totalCost
      }))
    };
  }
}

module.exports = CostCalculator;