const express = require('express');
const router = express.Router();

/**
 * Multi-Agent API Routes
 * Provides real-time and historical multi-agent coordination data
 */

// Get active agent sessions
router.get('/active', async (req, res) => {
  try {
    const dbManager = req.app.locals.dbManager;
    
    if (!dbManager) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const activeAgents = await dbManager.getActiveAgentSessions();
    
    // Process metadata for each agent
    const processedAgents = activeAgents.map(agent => ({
      ...agent,
      metadata: agent.metadata ? JSON.parse(agent.metadata) : {}
    }));
    
    res.json({
      count: processedAgents.length,
      agents: processedAgents,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting active agents:', error);
    res.status(500).json({ 
      error: 'Failed to get active agents',
      message: error.message 
    });
  }
});

// Get agent coordination events
router.get('/coordination', async (req, res) => {
  try {
    const { timeRange = '24h', limit = 100 } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    const coordination = await dbManager.getAgentCoordination(timeRange);
    
    // Process coordination data
    const processedCoordination = coordination.slice(0, limit).map(event => ({
      ...event,
      coordination_data: event.coordination_data ? JSON.parse(event.coordination_data) : {},
      metadata: event.metadata ? JSON.parse(event.metadata) : {}
    }));
    
    // Calculate coordination statistics
    const stats = {
      totalEvents: coordination.length,
      coordinationTypes: {},
      averagePerformanceImpact: 0,
      successRate: 0
    };
    
    let totalImpact = 0;
    let successCount = 0;
    
    coordination.forEach(event => {
      // Count coordination types
      const type = event.coordination_type;
      stats.coordinationTypes[type] = (stats.coordinationTypes[type] || 0) + 1;
      
      // Calculate averages
      if (event.performance_impact !== null) {
        totalImpact += event.performance_impact;
      }
      if (event.outcome === 'success') {
        successCount++;
      }
    });
    
    if (coordination.length > 0) {
      stats.averagePerformanceImpact = totalImpact / coordination.length;
      stats.successRate = (successCount / coordination.length) * 100;
    }
    
    res.json({
      timeRange,
      statistics: stats,
      events: processedCoordination,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting agent coordination:', error);
    res.status(500).json({ 
      error: 'Failed to get agent coordination',
      message: error.message 
    });
  }
});

// Get resource utilization for agents
router.get('/resources', async (req, res) => {
  try {
    const { agentId, timeRange = '24h', resourceType } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    let resourceData = await dbManager.getResourceUtilization(agentId, timeRange);
    
    // Filter by resource type if specified
    if (resourceType) {
      resourceData = resourceData.filter(r => r.resource_type === resourceType);
    }
    
    // Process metadata
    const processedData = resourceData.map(resource => ({
      ...resource,
      metadata: resource.metadata ? JSON.parse(resource.metadata) : {}
    }));
    
    // Calculate resource statistics
    const stats = {
      totalDataPoints: processedData.length,
      resourceTypes: {},
      averageUtilization: 0,
      averageEfficiency: 0,
      bottleneckCount: 0
    };
    
    let totalUtilization = 0;
    let totalEfficiency = 0;
    
    processedData.forEach(resource => {
      // Count resource types
      const type = resource.resource_type;
      if (!stats.resourceTypes[type]) {
        stats.resourceTypes[type] = {
          count: 0,
          avgUtilization: 0,
          avgEfficiency: 0
        };
      }
      stats.resourceTypes[type].count++;
      
      // Calculate averages
      if (resource.utilization_percentage !== null) {
        totalUtilization += resource.utilization_percentage;
        stats.resourceTypes[type].avgUtilization += resource.utilization_percentage;
      }
      if (resource.efficiency_score !== null) {
        totalEfficiency += resource.efficiency_score;
        stats.resourceTypes[type].avgEfficiency += resource.efficiency_score;
      }
      if (resource.bottleneck_detected) {
        stats.bottleneckCount++;
      }
    });
    
    // Finalize averages
    if (processedData.length > 0) {
      stats.averageUtilization = totalUtilization / processedData.length;
      stats.averageEfficiency = totalEfficiency / processedData.length;
      
      // Calculate per-type averages
      Object.keys(stats.resourceTypes).forEach(type => {
        const typeData = stats.resourceTypes[type];
        typeData.avgUtilization /= typeData.count;
        typeData.avgEfficiency /= typeData.count;
      });
    }
    
    res.json({
      agentId: agentId || 'all',
      timeRange,
      resourceType: resourceType || 'all',
      statistics: stats,
      resources: processedData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting resource utilization:', error);
    res.status(500).json({ 
      error: 'Failed to get resource utilization',
      message: error.message 
    });
  }
});

// Get agent performance comparison
router.get('/performance', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    const performanceData = await dbManager.getAgentPerformanceComparison(timeRange);
    
    // Calculate performance insights
    const insights = {
      totalAgents: new Set(performanceData.map(p => p.agent_id)).size,
      taskCategories: new Set(performanceData.map(p => p.task_category)).size,
      topPerformers: performanceData.slice(0, 5),
      averageMetrics: {
        executionTime: 0,
        successRate: 0,
        qualityScore: 0
      }
    };
    
    if (performanceData.length > 0) {
      insights.averageMetrics.executionTime = performanceData.reduce((sum, p) => sum + p.avg_execution_time, 0) / performanceData.length;
      insights.averageMetrics.successRate = performanceData.reduce((sum, p) => sum + p.avg_success_rate, 0) / performanceData.length;
      insights.averageMetrics.qualityScore = performanceData.reduce((sum, p) => sum + p.avg_quality_score, 0) / performanceData.length;
    }
    
    res.json({
      timeRange,
      insights,
      performance: performanceData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting agent performance:', error);
    res.status(500).json({ 
      error: 'Failed to get agent performance',
      message: error.message 
    });
  }
});

// Get specific agent details
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { timeRange = '24h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    // Get agent session info
    const agentSession = await dbManager.getQuery(
      'SELECT * FROM agent_sessions WHERE agent_id = ? ORDER BY start_time DESC LIMIT 1',
      [agentId]
    );
    
    if (!agentSession) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Get agent's coordination events
    const coordination = await dbManager.allQuery(
      `SELECT * FROM agent_coordination 
       WHERE (primary_agent_id = ? OR secondary_agent_id = ?) 
       AND start_time >= ${getTimeClause(timeRange)}
       ORDER BY start_time DESC`,
      [agentId, agentId]
    );
    
    // Get agent's resource utilization
    const resources = await dbManager.getResourceUtilization(agentId, timeRange);
    
    // Get agent's performance data
    const performance = await dbManager.allQuery(
      `SELECT * FROM agent_performance 
       WHERE agent_id = ? AND start_time >= ${getTimeClause(timeRange)}
       ORDER BY start_time DESC`,
      [agentId]
    );
    
    // Process metadata
    const processedAgent = {
      ...agentSession,
      metadata: agentSession.metadata ? JSON.parse(agentSession.metadata) : {}
    };
    
    res.json({
      agent: processedAgent,
      coordination: coordination.map(c => ({
        ...c,
        coordination_data: c.coordination_data ? JSON.parse(c.coordination_data) : {},
        metadata: c.metadata ? JSON.parse(c.metadata) : {}
      })),
      resources: resources.map(r => ({
        ...r,
        metadata: r.metadata ? JSON.parse(r.metadata) : {}
      })),
      performance: performance.map(p => ({
        ...p,
        efficiency_metrics: p.efficiency_metrics ? JSON.parse(p.efficiency_metrics) : {},
        optimization_opportunities: p.optimization_opportunities ? JSON.parse(p.optimization_opportunities) : {},
        metadata: p.metadata ? JSON.parse(p.metadata) : {}
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting agent details:', error);
    res.status(500).json({ 
      error: 'Failed to get agent details',
      message: error.message 
    });
  }
});

// Create new agent session
router.post('/session', async (req, res) => {
  try {
    const agentData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!agentData.session_id || !agentData.agent_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: session_id, agent_id' 
      });
    }
    
    // Create agent session
    await dbManager.createAgentSession(agentData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastAgentEvent({
        type: 'agent_session_created',
        data: agentData
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Agent session created successfully',
      agentId: agentData.agent_id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating agent session:', error);
    res.status(500).json({ 
      error: 'Failed to create agent session',
      message: error.message 
    });
  }
});

// Log coordination event
router.post('/coordination', async (req, res) => {
  try {
    const coordinationData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!coordinationData.session_id || !coordinationData.primary_agent_id || !coordinationData.secondary_agent_id || !coordinationData.coordination_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: session_id, primary_agent_id, secondary_agent_id, coordination_type' 
      });
    }
    
    // Log coordination event
    await dbManager.logCoordinationEvent(coordinationData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastAgentEvent({
        type: 'agent_coordination',
        data: coordinationData
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Coordination event logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error logging coordination event:', error);
    res.status(500).json({ 
      error: 'Failed to log coordination event',
      message: error.message 
    });
  }
});

// Log resource utilization
router.post('/resources', async (req, res) => {
  try {
    const resourceData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!resourceData.resource_type || resourceData.resource_value === undefined || !resourceData.resource_unit) {
      return res.status(400).json({ 
        error: 'Missing required fields: resource_type, resource_value, resource_unit' 
      });
    }
    
    // Calculate utilization percentage if max_available is provided
    if (resourceData.max_available && resourceData.max_available > 0) {
      resourceData.utilization_percentage = (resourceData.resource_value / resourceData.max_available) * 100;
    }
    
    // Log resource utilization
    await dbManager.logResourceUtilization(resourceData);
    
    // Broadcast to WebSocket clients if bottleneck detected or high utilization
    if (wsManager && (resourceData.bottleneck_detected || (resourceData.utilization_percentage && resourceData.utilization_percentage > 80))) {
      wsManager.broadcastAgentEvent({
        type: 'resource_alert',
        data: resourceData
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Resource utilization logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error logging resource utilization:', error);
    res.status(500).json({ 
      error: 'Failed to log resource utilization',
      message: error.message 
    });
  }
});

// Log agent performance
router.post('/performance', async (req, res) => {
  try {
    const performanceData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!performanceData.session_id || !performanceData.agent_id || !performanceData.task_category) {
      return res.status(400).json({ 
        error: 'Missing required fields: session_id, agent_id, task_category' 
      });
    }
    
    // Log performance data
    await dbManager.logAgentPerformance(performanceData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastAgentEvent({
        type: 'agent_performance',
        data: performanceData
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Agent performance logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error logging agent performance:', error);
    res.status(500).json({ 
      error: 'Failed to log agent performance',
      message: error.message 
    });
  }
});

// Update agent session
router.put('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const updates = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Update agent session
    const result = await dbManager.updateAgentSession(agentId, updates);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastAgentEvent({
        type: 'agent_session_updated',
        data: { agentId, updates }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Agent session updated successfully',
      agentId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating agent session:', error);
    res.status(500).json({ 
      error: 'Failed to update agent session',
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

module.exports = router;