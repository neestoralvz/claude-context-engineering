const express = require('express');
const router = express.Router();

/**
 * Metrics API Routes
 * Provides real-time and historical metrics data
 */

// Get current metrics summary
router.get('/summary', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    if (!dbManager) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Get metrics summary
    const summary = await dbManager.getMetricsSummary(timeRange);
    
    // Get system stats
    const stats = await dbManager.getStats();
    
    // Get active sessions
    const activeSessions = await dbManager.getActiveSessions();
    
    res.json({
      timeRange,
      summary,
      systemStats: stats,
      activeSessions: activeSessions.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting metrics summary:', error);
    res.status(500).json({ 
      error: 'Failed to get metrics summary',
      message: error.message 
    });
  }
});

// Get metrics by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { timeRange = '24h', limit = 100 } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    const timeClause = getTimeClause(timeRange);
    
    const metrics = await dbManager.allQuery(`
      SELECT 
        metric_name,
        metric_value,
        metric_unit,
        timestamp,
        session_id,
        metadata
      FROM metrics 
      WHERE category = ? AND timestamp >= ${timeClause}
      ORDER BY timestamp DESC
      LIMIT ?
    `, [category, parseInt(limit)]);
    
    // Process metadata
    const processedMetrics = metrics.map(metric => ({
      ...metric,
      metadata: metric.metadata ? JSON.parse(metric.metadata) : {}
    }));
    
    res.json({
      category,
      timeRange,
      count: processedMetrics.length,
      metrics: processedMetrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting category metrics:', error);
    res.status(500).json({ 
      error: 'Failed to get category metrics',
      message: error.message 
    });
  }
});

// Get real-time metrics (last 5 minutes)
router.get('/realtime', async (req, res) => {
  try {
    const dbManager = req.app.locals.dbManager;
    
    const realtimeMetrics = await dbManager.allQuery(`
      SELECT 
        metric_name,
        metric_value,
        metric_unit,
        category,
        timestamp,
        session_id
      FROM metrics 
      WHERE timestamp >= datetime('now', '-5 minutes')
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    
    // Group by category
    const groupedMetrics = realtimeMetrics.reduce((acc, metric) => {
      const category = metric.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(metric);
      return acc;
    }, {});
    
    res.json({
      timeWindow: '5 minutes',
      totalMetrics: realtimeMetrics.length,
      categories: Object.keys(groupedMetrics),
      metrics: groupedMetrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting realtime metrics:', error);
    res.status(500).json({ 
      error: 'Failed to get realtime metrics',
      message: error.message 
    });
  }
});

// Get metric trends
router.get('/trends/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    const { timeRange = '24h', interval = '1h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    const timeClause = getTimeClause(timeRange);
    const intervalClause = getIntervalClause(interval);
    
    const trends = await dbManager.allQuery(`
      SELECT 
        datetime(timestamp, ${intervalClause}) as time_bucket,
        AVG(metric_value) as avg_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        COUNT(*) as count
      FROM metrics 
      WHERE metric_name = ? AND timestamp >= ${timeClause}
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `, [metricName]);
    
    // Calculate trend direction
    let trendDirection = 'stable';
    if (trends.length >= 2) {
      const first = trends[0].avg_value;
      const last = trends[trends.length - 1].avg_value;
      const change = ((last - first) / first) * 100;
      
      if (change > 5) trendDirection = 'up';
      else if (change < -5) trendDirection = 'down';
    }
    
    res.json({
      metricName,
      timeRange,
      interval,
      trendDirection,
      dataPoints: trends.length,
      trends,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting metric trends:', error);
    res.status(500).json({ 
      error: 'Failed to get metric trends',
      message: error.message 
    });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    const parentIntegration = req.app.locals.parentIntegration;
    
    // Get database performance metrics
    const dbPerformance = await dbManager.allQuery(`
      SELECT 
        metric_name,
        AVG(metric_value) as avg_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value
      FROM metrics 
      WHERE category = 'performance' AND timestamp >= ${getTimeClause(timeRange)}
      GROUP BY metric_name
    `);
    
    // Get parent project performance data
    let parentPerformance = {};
    if (parentIntegration) {
      try {
        parentPerformance = parentIntegration.getPerformanceData();
      } catch (error) {
        console.warn('Could not get parent performance data:', error.message);
      }
    }
    
    res.json({
      timeRange,
      database: dbPerformance,
      parentProject: parentPerformance,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to get performance metrics',
      message: error.message 
    });
  }
});

// Post new metric (from hooks)
router.post('/', async (req, res) => {
  try {
    const metricData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!metricData.metric_name || metricData.metric_value === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: metric_name, metric_value' 
      });
    }
    
    // Add timestamp if not provided
    if (!metricData.timestamp) {
      metricData.timestamp = new Date().toISOString();
    }
    
    // Store in database
    await dbManager.logMetric(metricData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastMetric(metricData);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Metric logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error logging metric:', error);
    res.status(500).json({ 
      error: 'Failed to log metric',
      message: error.message 
    });
  }
});

// Get system health metrics
router.get('/health', async (req, res) => {
  try {
    const dbManager = req.app.locals.dbManager;
    const parentIntegration = req.app.locals.parentIntegration;
    
    // Database health
    const dbStats = await dbManager.getStats();
    const systemHealth = await dbManager.getSystemHealth();
    
    // Parent project health
    let parentHealth = {};
    if (parentIntegration) {
      try {
        parentHealth = parentIntegration.getHealthStatus();
      } catch (error) {
        parentHealth = { status: 'error', message: error.message };
      }
    }
    
    // Overall health determination
    const criticalIssues = systemHealth.filter(h => h.status === 'error').length;
    const warnings = systemHealth.filter(h => h.status === 'warning').length;
    
    let overallStatus = 'healthy';
    if (criticalIssues > 0) overallStatus = 'critical';
    else if (warnings > 0) overallStatus = 'warning';
    
    res.json({
      overallStatus,
      database: {
        status: 'healthy',
        stats: dbStats
      },
      parentProject: parentHealth,
      systemHealth: systemHealth,
      issues: {
        critical: criticalIssues,
        warnings: warnings
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting health metrics:', error);
    res.status(500).json({ 
      error: 'Failed to get health metrics',
      message: error.message 
    });
  }
});

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

function getIntervalClause(interval) {
  const intervals = {
    '5m': "'-5 minutes'",
    '15m': "'-15 minutes'",
    '1h': "'-1 hour'",
    '6h': "'-6 hours'",
    '1d': "'-1 day'"
  };
  
  return intervals[interval] || intervals['1h'];
}

module.exports = router;