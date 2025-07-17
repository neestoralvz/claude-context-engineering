const express = require('express');
const router = express.Router();

/**
 * Sessions API Routes
 * Provides session management and tracking
 */

// Get active sessions
router.get('/active', async (req, res) => {
  try {
    const dbManager = req.app.locals.dbManager;
    
    if (!dbManager) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const activeSessions = await dbManager.getActiveSessions();
    
    // Process metadata
    const processedSessions = activeSessions.map(session => ({
      ...session,
      metadata: session.metadata ? JSON.parse(session.metadata) : {}
    }));
    
    res.json({
      count: processedSessions.length,
      sessions: processedSessions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get active sessions',
      message: error.message 
    });
  }
});

// Get specific session details
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const dbManager = req.app.locals.dbManager;
    
    const session = await dbManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Process metadata
    const processedSession = {
      ...session,
      metadata: session.metadata ? JSON.parse(session.metadata) : {}
    };
    
    res.json({
      session: processedSession,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ 
      error: 'Failed to get session',
      message: error.message 
    });
  }
});

// Create new session
router.post('/', async (req, res) => {
  try {
    const sessionData = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Validate required fields
    if (!sessionData.id) {
      return res.status(400).json({ 
        error: 'Missing required field: id' 
      });
    }
    
    // Add default values
    if (!sessionData.start_time) {
      sessionData.start_time = new Date().toISOString();
    }
    
    // Create session
    await dbManager.createSession(sessionData);
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastSessionEvent({
        type: 'session_created',
        data: sessionData
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Session created successfully',
      sessionId: sessionData.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      message: error.message 
    });
  }
});

// Update session
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    const dbManager = req.app.locals.dbManager;
    const wsManager = req.app.locals.wsManager;
    
    // Update session
    const result = await dbManager.updateSession(sessionId, updates);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Broadcast to WebSocket clients
    if (wsManager) {
      wsManager.broadcastSessionEvent({
        type: 'session_updated',
        data: { sessionId, updates }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Session updated successfully',
      sessionId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ 
      error: 'Failed to update session',
      message: error.message 
    });
  }
});

module.exports = router;