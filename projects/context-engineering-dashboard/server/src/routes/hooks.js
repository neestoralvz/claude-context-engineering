const express = require('express');
const router = express.Router();

/**
 * Hooks API Routes
 * Handles webhook events from Claude Code hooks
 */

// Handle hook events
router.post('/event', async (req, res) => {
  try {
    const eventData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    if (!dbManager) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Validate event data
    if (!eventData.event_type) {
      return res.status(400).json({ 
        error: 'Missing required field: event_type' 
      });
    }
    
    // Add timestamp if not provided
    if (!eventData.timestamp) {
      eventData.timestamp = new Date().toISOString();
    }
    
    // Log event
    await dbManager.logEvent(eventData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastEvent(eventData);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Event logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error handling hook event:', error);
    res.status(500).json({ 
      error: 'Failed to handle hook event',
      message: error.message 
    });
  }
});

// Get hook status
router.get('/status', async (req, res) => {
  try {
    const hookManager = req.app.locals.hookManager;
    
    let hookStatus = {
      enabled: process.env.HOOKS_ENABLED === 'true',
      installed: false,
      lastEvent: null
    };
    
    if (hookManager) {
      hookStatus.installed = true;
      // Could add more detailed status here
    }
    
    res.json({
      status: hookStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting hook status:', error);
    res.status(500).json({ 
      error: 'Failed to get hook status',
      message: error.message 
    });
  }
});

module.exports = router;