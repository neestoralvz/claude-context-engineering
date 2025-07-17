const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

/**
 * WebSocketManager - Real-time communication for observability data
 * Manages WebSocket connections and real-time data broadcasting
 */
class WebSocketManager {
  constructor() {
    this.server = null;
    this.clients = new Map();
    this.channels = new Map();
    this.heartbeatInterval = null;
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0
    };
  }

  initialize(wsServer) {
    this.server = wsServer;
    this.setupEventHandlers();
    this.startHeartbeat();
    
    console.log('✅ WebSocket manager initialized');
  }

  setupEventHandlers() {
    this.server.on('connection', (ws, req) => {
      const clientId = uuidv4();
      const clientInfo = {
        id: clientId,
        ws: ws,
        subscriptions: new Set(),
        lastSeen: Date.now(),
        userAgent: req.headers['user-agent'],
        ip: req.socket.remoteAddress
      };

      this.clients.set(clientId, clientInfo);
      this.stats.totalConnections++;
      this.stats.activeConnections++;

      console.log(`🔌 Client connected: ${clientId} (${this.stats.activeConnections} active)`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection',
        payload: {
          clientId: clientId,
          timestamp: new Date().toISOString(),
          message: 'Connected to Claude Code Observability Server'
        }
      });

      // Setup client event handlers
      ws.on('message', (data) => this.handleClientMessage(clientId, data));
      ws.on('close', () => this.handleClientDisconnect(clientId));
      ws.on('error', (error) => this.handleClientError(clientId, error));
      ws.on('pong', () => this.handlePong(clientId));
    });

    this.server.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  handleClientMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());
      this.stats.messagesReceived++;

      const client = this.clients.get(clientId);
      if (!client) return;

      client.lastSeen = Date.now();

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message.payload);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message.payload);
          break;
          
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', payload: { timestamp: Date.now() } });
          break;
          
        case 'request_metrics':
          this.handleMetricsRequest(clientId, message.payload);
          break;
          
        case 'request_commands':
          this.handleCommandsRequest(clientId, message.payload);
          break;
          
        default:
          console.warn(`Unknown message type from ${clientId}: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
    }
  }

  handleSubscription(clientId, { channels }) {
    const client = this.clients.get(clientId);
    if (!client) return;

    channels.forEach(channel => {
      client.subscriptions.add(channel);
      
      // Add client to channel
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new Set());
      }
      this.channels.get(channel).add(clientId);
    });

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      payload: { channels, timestamp: Date.now() }
    });

    console.log(`📡 Client ${clientId} subscribed to: ${channels.join(', ')}`);
  }

  handleUnsubscription(clientId, { channels }) {
    const client = this.clients.get(clientId);
    if (!client) return;

    channels.forEach(channel => {
      client.subscriptions.delete(channel);
      
      // Remove client from channel
      if (this.channels.has(channel)) {
        this.channels.get(channel).delete(clientId);
        
        // Clean up empty channels
        if (this.channels.get(channel).size === 0) {
          this.channels.delete(channel);
        }
      }
    });

    this.sendToClient(clientId, {
      type: 'unsubscription_confirmed',
      payload: { channels, timestamp: Date.now() }
    });
  }

  handleMetricsRequest(clientId, { timeRange, categories }) {
    // This would integrate with DatabaseManager to fetch metrics
    // For now, send a placeholder response
    this.sendToClient(clientId, {
      type: 'metrics_data',
      payload: {
        timeRange,
        categories,
        timestamp: Date.now(),
        data: [] // Will be populated by integration
      }
    });
  }

  handleCommandsRequest(clientId, { filters }) {
    // This would integrate with parent project data
    this.sendToClient(clientId, {
      type: 'commands_data',
      payload: {
        filters,
        timestamp: Date.now(),
        data: [] // Will be populated by integration
      }
    });
  }

  handleClientDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all channels
    client.subscriptions.forEach(channel => {
      if (this.channels.has(channel)) {
        this.channels.get(channel).delete(clientId);
        if (this.channels.get(channel).size === 0) {
          this.channels.delete(channel);
        }
      }
    });

    this.clients.delete(clientId);
    this.stats.activeConnections--;

    console.log(`🔌 Client disconnected: ${clientId} (${this.stats.activeConnections} active)`);
  }

  handleClientError(clientId, error) {
    console.error(`❌ Client error ${clientId}:`, error.message);
  }

  handlePong(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastSeen = Date.now();
    }
  }

  // Broadcasting methods
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      return false;
    }
  }

  broadcast(message, channel = null) {
    let targetClients;
    
    if (channel) {
      // Send to specific channel subscribers
      targetClients = this.channels.get(channel) || new Set();
    } else {
      // Send to all clients
      targetClients = new Set(this.clients.keys());
    }

    let successCount = 0;
    targetClients.forEach(clientId => {
      if (this.sendToClient(clientId, message)) {
        successCount++;
      }
    });

    return successCount;
  }

  // Specific broadcast methods for different data types
  broadcastMetric(metricData) {
    const message = {
      type: 'metric_update',
      payload: {
        ...metricData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'metrics');
  }

  broadcastEvent(eventData) {
    const message = {
      type: 'event_update',
      payload: {
        ...eventData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'events');
  }

  broadcastCommand(commandData) {
    const message = {
      type: 'command_update',
      payload: {
        ...commandData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'commands');
  }

  broadcastAlert(alertData) {
    const message = {
      type: 'alert',
      payload: {
        ...alertData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'alerts');
  }

  broadcastSystemHealth(healthData) {
    const message = {
      type: 'system_health',
      payload: {
        ...healthData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'health');
  }

  // Multi-Agent specific broadcast methods
  broadcastAgentEvent(eventData) {
    const message = {
      type: 'agent_event',
      payload: {
        ...eventData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'agents');
  }

  broadcastSessionEvent(eventData) {
    const message = {
      type: 'session_event', 
      payload: {
        ...eventData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'sessions');
  }

  broadcastCommandEvent(eventData) {
    const message = {
      type: 'command_event',
      payload: {
        ...eventData,
        timestamp: Date.now()
      }
    };

    return this.broadcast(message, 'commands');
  }

  // Get connection count for health monitoring
  getConnectionCount() {
    return this.clients.size;
  }

  // Heartbeat to detect dead connections
  startHeartbeat() {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000;
    
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = interval * 2; // 2x heartbeat interval
      
      this.clients.forEach((client, clientId) => {
        if (now - client.lastSeen > timeout) {
          console.log(`💀 Removing dead client: ${clientId}`);
          client.ws.terminate();
          this.handleClientDisconnect(clientId);
          return;
        }
        
        // Send ping
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      });
    }, interval);

    console.log(`💓 WebSocket heartbeat started (${interval}ms)`);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Statistics and monitoring
  getStats() {
    return {
      ...this.stats,
      activeConnections: this.clients.size,
      channels: Array.from(this.channels.keys()),
      channelSubscriptions: Object.fromEntries(
        Array.from(this.channels.entries()).map(([channel, clients]) => [
          channel,
          clients.size
        ])
      )
    };
  }

  getClientInfo() {
    return Array.from(this.clients.entries()).map(([id, client]) => ({
      id,
      lastSeen: client.lastSeen,
      subscriptions: Array.from(client.subscriptions),
      userAgent: client.userAgent,
      ip: client.ip
    }));
  }

  // Cleanup
  shutdown() {
    console.log('🛑 Shutting down WebSocket manager...');
    
    this.stopHeartbeat();
    
    // Close all client connections
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, {
        type: 'server_shutdown',
        payload: { message: 'Server is shutting down', timestamp: Date.now() }
      });
      client.ws.close();
    });
    
    this.clients.clear();
    this.channels.clear();
    
    console.log('✅ WebSocket manager shutdown complete');
  }
}

module.exports = WebSocketManager;