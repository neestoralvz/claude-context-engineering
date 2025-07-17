#!/usr/bin/env node

/**
 * Claude Code Observability Server
 * Real-time monitoring and analytics for Claude Code usage
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const DatabaseManager = require('./src/database/DatabaseManager');
const WebSocketManager = require('./src/websocket/WebSocketManager');
const ParentProjectIntegration = require('./src/integrations/ParentProjectIntegration');
const HookSystemManager = require('./src/hooks/HookSystemManager');
const AnalyticsEngine = require('./src/analytics/AnalyticsEngine');
const HealthMonitor = require('./src/monitoring/HealthMonitor');

class ObservabilityServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 3001;
    this.wsPort = process.env.WS_PORT || 3002;
    
    this.initializeManagers();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  initializeManagers() {
    // Core system managers
    this.dbManager = new DatabaseManager();
    this.wsManager = new WebSocketManager();
    this.parentIntegration = new ParentProjectIntegration();
    this.hookManager = new HookSystemManager();
    this.analytics = new AnalyticsEngine();
    this.healthMonitor = new HealthMonitor();

    console.log('✅ System managers initialized');
  }

  setupMiddleware() {
    // Security and performance middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Allow WebSocket connections
    }));
    this.app.use(compression());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));

    // Logging
    if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
      this.app.use(morgan('combined'));
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    console.log('✅ Middleware configured');
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      const health = this.healthMonitor.getHealthStatus();
      res.status(health.status === 'healthy' ? 200 : 503).json(health);
    });

    // API routes
    this.app.use('/api/metrics', require('./src/routes/metrics'));
    this.app.use('/api/agents', require('./src/routes/agents'));
    this.app.use('/api/commands', require('./src/routes/commands'));
    this.app.use('/api/sessions', require('./src/routes/sessions'));
    this.app.use('/api/analytics', require('./src/routes/analytics'));
    this.app.use('/api/hooks', require('./src/routes/hooks'));

    // System info
    this.app.get('/api/system/info', (req, res) => {
      res.json({
        name: 'Claude Code Observability Server',
        version: require('./package.json').version,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        features: {
          costTracking: process.env.ENABLE_COST_TRACKING === 'true',
          multiAgent: process.env.ENABLE_MULTI_AGENT_MONITORING === 'true',
          predictiveAnalytics: process.env.ENABLE_PREDICTIVE_ANALYTICS === 'true',
          realTimeAlerts: process.env.ENABLE_REAL_TIME_ALERTS === 'true'
        }
      });
    });

    console.log('✅ Routes configured');
  }

  setupWebSocket() {
    this.wsServer = new WebSocket.Server({ 
      port: this.wsPort,
      perMessageDeflate: false
    });

    this.wsManager.initialize(this.wsServer);
    
    console.log(`✅ WebSocket server configured on port ${this.wsPort}`);
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Server Error:', err);
      
      res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());

    console.log('✅ Error handling configured');
  }

  async start() {
    try {
      // Initialize database
      await this.dbManager.initialize();
      console.log('✅ Database initialized');

      // Start parent project integration
      await this.parentIntegration.initialize();
      console.log('✅ Parent project integration active');

      // Initialize hook system
      if (process.env.HOOKS_ENABLED === 'true') {
        await this.hookManager.initialize();
        console.log('✅ Hook system initialized');
      }

      // Start analytics engine
      this.analytics.initialize(this.dbManager, this.wsManager);
      console.log('✅ Analytics engine started');

      // Start health monitoring
      this.healthMonitor.initialize(this.dbManager, this.wsManager);
      console.log('✅ Health monitoring active');

      // Start HTTP server
      this.server.listen(this.port, () => {
        console.log(`\n🚀 Claude Code Observability Server`);
        console.log(`📊 HTTP API: http://localhost:${this.port}`);
        console.log(`🔌 WebSocket: ws://localhost:${this.wsPort}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        console.log(`📁 Database: ${process.env.DATABASE_PATH}`);
        console.log(`\n✅ Server ready for connections\n`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('\n🛑 Shutting down server...');

    try {
      // Close WebSocket server
      this.wsServer.close();
      console.log('✅ WebSocket server closed');

      // Stop managers
      await this.healthMonitor.shutdown();
      await this.analytics.shutdown();
      await this.hookManager.shutdown();
      await this.parentIntegration.shutdown();
      await this.dbManager.close();
      console.log('✅ All managers stopped');

      // Close HTTP server
      this.server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new ObservabilityServer();
  server.start();
}

module.exports = ObservabilityServer;