const express = require('express');
const router = express.Router();

/**
 * Analytics API Routes
 * Provides advanced analytics and insights
 */

// Get general analytics
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { timeRange = '24h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    if (!dbManager) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    let analyticsData = {};
    
    switch (type) {
      case 'performance':
        analyticsData = await getPerformanceAnalytics(dbManager, timeRange);
        break;
      case 'usage':
        analyticsData = await getUsageAnalytics(dbManager, timeRange);
        break;
      case 'costs':
        analyticsData = await getCostAnalytics(dbManager, timeRange);
        break;
      case 'conversation':
        analyticsData = await getConversationAnalytics(dbManager, timeRange);
        break;
      default:
        return res.status(400).json({ error: 'Invalid analytics type' });
    }
    
    res.json({
      type,
      timeRange,
      data: analyticsData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics',
      message: error.message 
    });
  }
});

async function getPerformanceAnalytics(dbManager, timeRange) {
  const timeClause = getTimeClause(timeRange);
  
  // Get performance metrics
  const performanceMetrics = await dbManager.allQuery(`
    SELECT 
      metric_name,
      AVG(metric_value) as avg_value,
      MIN(metric_value) as min_value,
      MAX(metric_value) as max_value,
      COUNT(*) as count
    FROM metrics 
    WHERE category = 'performance' AND timestamp >= ${timeClause}
    GROUP BY metric_name
  `);
  
  // Get command performance
  const commandPerformance = await dbManager.getCommandStats(timeRange);
  
  return {
    metrics: performanceMetrics,
    commands: commandPerformance
  };
}

async function getUsageAnalytics(dbManager, timeRange) {
  const timeClause = getTimeClause(timeRange);
  
  // Get usage patterns
  const usagePatterns = await dbManager.allQuery(`
    SELECT 
      DATE(timestamp) as date,
      COUNT(*) as total_events,
      COUNT(DISTINCT session_id) as unique_sessions
    FROM events
    WHERE timestamp >= ${timeClause}
    GROUP BY DATE(timestamp)
    ORDER BY date
  `);
  
  // Get most used commands
  const topCommands = await dbManager.allQuery(`
    SELECT 
      command_name,
      COUNT(*) as usage_count,
      AVG(execution_time_ms) as avg_time
    FROM command_executions
    WHERE timestamp >= ${timeClause}
    GROUP BY command_name
    ORDER BY usage_count DESC
    LIMIT 10
  `);
  
  return {
    patterns: usagePatterns,
    topCommands
  };
}

async function getCostAnalytics(dbManager, timeRange) {
  const costSummary = await dbManager.getCostSummary(timeRange);
  
  // Get conversation cost analysis if available
  const conversationCosts = await dbManager.getConversationCostSummary(timeRange);
  
  return {
    summary: costSummary,
    conversations: conversationCosts
  };
}

async function getConversationAnalytics(dbManager, timeRange) {
  // Get conversation analysis data
  const conversationData = await dbManager.getConversationAnalysis(50);
  
  return {
    conversations: conversationData.map(conv => ({
      ...conv,
      pattern_analysis: conv.pattern_analysis ? JSON.parse(conv.pattern_analysis) : {},
      cost_breakdown: conv.cost_breakdown ? JSON.parse(conv.cost_breakdown) : {},
      productivity_metrics: conv.productivity_metrics ? JSON.parse(conv.productivity_metrics) : {},
      optimization_suggestions: conv.optimization_suggestions ? JSON.parse(conv.optimization_suggestions) : {}
    }))
  };
}

// Utility functions
function getTimeClause(timeRange) {
  const ranges = {
    '1h': "datetime('now', '-1 hour')",
    '6h': "datetime('now', '-6 hours')",
    '24h': "datetime('now', '-1 day')",
    '7d': "datetime('now', '-7 days')",
    '30d': "datetime('now', '-30 days')"
  };
  
  return ranges[timeRange] || ranges['24h'];
}

module.exports = router;