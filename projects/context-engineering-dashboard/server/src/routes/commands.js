const express = require('express');
const router = express.Router();

/**
 * Commands API Routes
 * Provides command execution tracking and statistics
 */

// Get command registry
router.get('/registry', async (req, res) => {
  try {
    const dbManager = req.app.locals.dbManager;
    const parentIntegration = req.app.locals.parentIntegration;
    
    if (!dbManager) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Get command registry from parent project if available
    let registry = {};
    if (parentIntegration) {
      try {
        registry = parentIntegration.getCommandRegistry() || {};
      } catch (error) {
        console.warn('Could not get command registry:', error.message);
      }
    }
    
    res.json({
      registry,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting command registry:', error);
    res.status(500).json({ 
      error: 'Failed to get command registry',
      message: error.message 
    });
  }
});

// Get command statistics
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    const stats = await dbManager.getCommandStats(timeRange);
    
    res.json({
      timeRange,
      commandCount: stats.length,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting command stats:', error);
    res.status(500).json({ 
      error: 'Failed to get command stats',
      message: error.message 
    });
  }
});

// Get specific command execution details
router.get('/execution/:commandName', async (req, res) => {
  try {
    const { commandName } = req.params;
    const { timeRange = '24h', limit = 50 } = req.query;
    const dbManager = req.app.locals.dbManager;
    
    const timeClause = getTimeClause(timeRange);
    
    const executions = await dbManager.allQuery(`
      SELECT * FROM command_executions 
      WHERE command_name = ? AND timestamp >= ${timeClause}
      ORDER BY timestamp DESC
      LIMIT ?
    `, [commandName, parseInt(limit)]);
    
    // Process metadata
    const processedExecutions = executions.map(exec => ({
      ...exec,
      input_data: exec.input_data ? JSON.parse(exec.input_data) : {},
      output_data: exec.output_data ? JSON.parse(exec.output_data) : {}
    }));
    
    res.json({
      commandName,
      timeRange,
      executionCount: processedExecutions.length,
      executions: processedExecutions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting command execution:', error);
    res.status(500).json({ 
      error: 'Failed to get command execution',
      message: error.message 
    });
  }
});

// Log command execution (from hooks)
router.post('/execution', async (req, res) => {
  try {
    const commandData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!commandData.command_name || commandData.success === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: command_name, success' 
      });
    }
    
    // Add timestamp if not provided
    if (!commandData.timestamp) {
      commandData.timestamp = new Date().toISOString();
    }
    
    // Store in database
    await dbManager.logCommandExecution(commandData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastCommandEvent(commandData);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Command execution logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error logging command execution:', error);
    res.status(500).json({ 
      error: 'Failed to log command execution',
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