/**
 * AnalyticsEngine - Advanced analytics and insights generation
 * Processes observability data to generate actionable insights
 */
class AnalyticsEngine {
  constructor() {
    this.isInitialized = false;
    this.dbManager = null;
    this.wsManager = null;
    this.analysisInterval = null;
    this.insights = new Map();
  }

  initialize(dbManager, wsManager) {
    try {
      console.log('📊 Initializing Analytics Engine...');
      
      this.dbManager = dbManager;
      this.wsManager = wsManager;
      
      // Start periodic analysis
      this.startPeriodicAnalysis();
      
      this.isInitialized = true;
      console.log('✅ Analytics Engine initialized');
      
    } catch (error) {
      console.error('❌ Analytics Engine initialization failed:', error);
      throw error;
    }
  }

  startPeriodicAnalysis() {
    // Run analysis every 5 minutes
    this.analysisInterval = setInterval(async () => {
      try {
        await this.runPeriodicAnalysis();
      } catch (error) {
        console.error('Periodic analysis error:', error);
      }
    }, 5 * 60 * 1000);
  }

  async runPeriodicAnalysis() {
    if (!this.dbManager) return;

    try {
      // Generate insights
      const insights = await this.generateInsights();
      
      // Store insights
      this.insights.set('latest', {
        insights,
        timestamp: new Date().toISOString()
      });
      
      // Broadcast significant insights
      if (this.wsManager) {
        const significantInsights = insights.filter(i => i.significance === 'high');
        if (significantInsights.length > 0) {
          this.wsManager.broadcast({
            type: 'analytics_insights',
            data: significantInsights
          });
        }
      }
      
    } catch (error) {
      console.error('Analysis generation error:', error);
    }
  }

  async generateInsights() {
    const insights = [];
    
    try {
      // Performance insights
      const performanceInsights = await this.analyzePerformance();
      insights.push(...performanceInsights);
      
      // Usage pattern insights
      const usageInsights = await this.analyzeUsagePatterns();
      insights.push(...usageInsights);
      
      // Cost optimization insights
      const costInsights = await this.analyzeCosts();
      insights.push(...costInsights);
      
      // Multi-agent coordination insights
      const coordinationInsights = await this.analyzeCoordination();
      insights.push(...coordinationInsights);
      
    } catch (error) {
      console.error('Insight generation error:', error);
    }
    
    return insights;
  }

  async analyzePerformance() {
    const insights = [];
    
    try {
      // Get recent performance metrics
      const performanceMetrics = await this.dbManager.allQuery(`
        SELECT 
          metric_name,
          AVG(metric_value) as avg_value,
          MIN(metric_value) as min_value,
          MAX(metric_value) as max_value,
          COUNT(*) as count
        FROM metrics 
        WHERE category = 'performance' 
        AND timestamp >= datetime('now', '-1 hour')
        GROUP BY metric_name
      `);
      
      for (const metric of performanceMetrics) {
        // Detect performance anomalies
        const variance = metric.max_value - metric.min_value;
        const avgVariance = variance / metric.avg_value;
        
        if (avgVariance > 0.5) { // High variance
          insights.push({
            type: 'performance_anomaly',
            significance: 'medium',
            title: `High variance in ${metric.metric_name}`,
            description: `Performance metric ${metric.metric_name} shows high variance (${(avgVariance * 100).toFixed(1)}%)`,
            data: metric,
            recommendations: [
              'Monitor system resources',
              'Check for resource bottlenecks',
              'Review recent configuration changes'
            ]
          });
        }
        
        // Detect performance degradation
        if (metric.avg_value > 1000 && metric.metric_name.includes('time')) {
          insights.push({
            type: 'performance_degradation',
            significance: 'high',
            title: `Slow ${metric.metric_name}`,
            description: `Average ${metric.metric_name} is ${metric.avg_value.toFixed(0)}ms, which may impact user experience`,
            data: metric,
            recommendations: [
              'Optimize database queries',
              'Review algorithm efficiency',
              'Consider caching strategies'
            ]
          });
        }
      }
      
    } catch (error) {
      console.error('Performance analysis error:', error);
    }
    
    return insights;
  }

  async analyzeUsagePatterns() {
    const insights = [];
    
    try {
      // Get command usage patterns
      const commandUsage = await this.dbManager.allQuery(`
        SELECT 
          command_name,
          COUNT(*) as usage_count,
          AVG(execution_time_ms) as avg_time,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
        FROM command_executions 
        WHERE timestamp >= datetime('now', '-24 hours')
        GROUP BY command_name
        ORDER BY usage_count DESC
        LIMIT 10
      `);
      
      // Identify underutilized commands
      const totalCommands = 76; // From system specification
      const usedCommands = commandUsage.length;
      const utilizationRate = (usedCommands / totalCommands) * 100;
      
      if (utilizationRate < 30) {
        insights.push({
          type: 'low_command_utilization',
          significance: 'medium',
          title: 'Low command ecosystem utilization',
          description: `Only ${utilizationRate.toFixed(1)}% of available commands are being used`,
          data: { utilizationRate, usedCommands, totalCommands },
          recommendations: [
            'Review available command documentation',
            'Consider command discovery improvements',
            'Analyze workflow optimization opportunities'
          ]
        });
      }
      
      // Identify commands with low success rates
      const problematicCommands = commandUsage.filter(cmd => cmd.success_rate < 80);
      if (problematicCommands.length > 0) {
        insights.push({
          type: 'command_reliability_issues',
          significance: 'high',
          title: 'Commands with reliability issues detected',
          description: `${problematicCommands.length} commands have success rates below 80%`,
          data: problematicCommands,
          recommendations: [
            'Review error logs for failed commands',
            'Improve input validation',
            'Enhance error handling'
          ]
        });
      }
      
    } catch (error) {
      console.error('Usage pattern analysis error:', error);
    }
    
    return insights;
  }

  async analyzeCosts() {
    const insights = [];
    
    try {
      // Get cost data
      const costData = await this.dbManager.getCostSummary('24h');
      
      if (costData.length > 0) {
        const totalCost = costData.reduce((sum, item) => sum + item.total_cost, 0);
        const totalTokens = costData.reduce((sum, item) => sum + item.total_input_tokens + item.total_output_tokens, 0);
        
        // High cost detection
        if (totalCost > 10) { // $10 threshold
          insights.push({
            type: 'high_cost_usage',
            significance: 'medium',
            title: 'High daily cost detected',
            description: `Current daily cost is $${totalCost.toFixed(2)}`,
            data: { totalCost, totalTokens, costData },
            recommendations: [
              'Review token usage patterns',
              'Optimize prompt engineering',
              'Consider model selection optimization'
            ]
          });
        }
        
        // Token efficiency analysis
        const costPerToken = totalCost / totalTokens;
        if (costPerToken > 0.0001) { // High cost per token
          insights.push({
            type: 'token_efficiency',
            significance: 'low',
            title: 'Token efficiency could be improved',
            description: `Cost per token is $${costPerToken.toFixed(6)}`,
            data: { costPerToken, totalCost, totalTokens },
            recommendations: [
              'Use more efficient models for simple tasks',
              'Implement response caching',
              'Optimize context window usage'
            ]
          });
        }
      }
      
    } catch (error) {
      console.error('Cost analysis error:', error);
    }
    
    return insights;
  }

  async analyzeCoordination() {
    const insights = [];
    
    try {
      // Get agent coordination data
      const coordinationData = await this.dbManager.getAgentCoordination('24h');
      
      if (coordinationData.length > 0) {
        // Calculate coordination efficiency
        const successfulCoordinations = coordinationData.filter(c => c.outcome === 'success').length;
        const coordinationSuccessRate = (successfulCoordinations / coordinationData.length) * 100;
        
        if (coordinationSuccessRate < 80) {
          insights.push({
            type: 'coordination_efficiency',
            significance: 'medium',
            title: 'Multi-agent coordination issues detected',
            description: `Coordination success rate is ${coordinationSuccessRate.toFixed(1)}%`,
            data: { coordinationSuccessRate, coordinationData: coordinationData.length },
            recommendations: [
              'Review coordination protocols',
              'Improve agent communication',
              'Analyze coordination failure patterns'
            ]
          });
        }
        
        // Analyze performance impact
        const avgPerformanceImpact = coordinationData
          .filter(c => c.performance_impact !== null)
          .reduce((sum, c) => sum + c.performance_impact, 0) / coordinationData.length;
        
        if (avgPerformanceImpact < 0) {
          insights.push({
            type: 'negative_coordination_impact',
            significance: 'high',
            title: 'Coordination negatively impacting performance',
            description: `Average performance impact is ${(avgPerformanceImpact * 100).toFixed(1)}%`,
            data: { avgPerformanceImpact },
            recommendations: [
              'Optimize coordination overhead',
              'Review agent workload distribution',
              'Consider coordination strategy changes'
            ]
          });
        }
      }
      
    } catch (error) {
      console.error('Coordination analysis error:', error);
    }
    
    return insights;
  }

  // Get cached insights
  getInsights() {
    return this.insights.get('latest') || { insights: [], timestamp: new Date().toISOString() };
  }

  // Generate custom analysis report
  async generateReport(type, timeRange = '24h') {
    try {
      switch (type) {
        case 'performance':
          return await this.generatePerformanceReport(timeRange);
        case 'usage':
          return await this.generateUsageReport(timeRange);
        case 'cost':
          return await this.generateCostReport(timeRange);
        case 'coordination':
          return await this.generateCoordinationReport(timeRange);
        default:
          throw new Error(`Unknown report type: ${type}`);
      }
    } catch (error) {
      console.error(`Report generation error for ${type}:`, error);
      throw error;
    }
  }

  async generatePerformanceReport(timeRange) {
    // Implementation for performance report
    return {
      type: 'performance',
      timeRange,
      summary: 'Performance analysis complete',
      timestamp: new Date().toISOString()
    };
  }

  async generateUsageReport(timeRange) {
    // Implementation for usage report
    return {
      type: 'usage',
      timeRange,
      summary: 'Usage analysis complete',
      timestamp: new Date().toISOString()
    };
  }

  async generateCostReport(timeRange) {
    // Implementation for cost report
    return {
      type: 'cost',
      timeRange,
      summary: 'Cost analysis complete',
      timestamp: new Date().toISOString()
    };
  }

  async generateCoordinationReport(timeRange) {
    // Implementation for coordination report
    return {
      type: 'coordination',
      timeRange,
      summary: 'Coordination analysis complete',
      timestamp: new Date().toISOString()
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Analytics Engine...');
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    
    this.insights.clear();
    this.isInitialized = false;
    
    console.log('✅ Analytics Engine shutdown complete');
  }
}

module.exports = AnalyticsEngine;