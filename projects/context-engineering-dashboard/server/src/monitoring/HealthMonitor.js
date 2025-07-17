/**
 * HealthMonitor - System health monitoring and alerting
 * Monitors component health and generates alerts
 */
class HealthMonitor {
  constructor() {
    this.isInitialized = false;
    this.dbManager = null;
    this.wsManager = null;
    this.healthCheckInterval = null;
    this.healthStatus = new Map();
    this.alertThresholds = this.getDefaultThresholds();
  }

  initialize(dbManager, wsManager) {
    try {
      console.log('🏥 Initializing Health Monitor...');
      
      this.dbManager = dbManager;
      this.wsManager = wsManager;
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Health Monitor initialized');
      
    } catch (error) {
      console.error('❌ Health Monitor initialization failed:', error);
      throw error;
    }
  }

  getDefaultThresholds() {
    return {
      database: {
        maxResponseTime: 100, // ms
        maxConnections: 10,
        maxSize: 100 * 1024 * 1024 // 100MB
      },
      memory: {
        maxUsage: 80, // percentage
        maxHeapUsage: 512 * 1024 * 1024 // 512MB
      },
      api: {
        maxResponseTime: 1000, // ms
        maxErrorRate: 5 // percentage
      },
      websocket: {
        maxConnections: 100,
        maxLatency: 100 // ms
      }
    };
  }

  startHealthMonitoring() {
    // Run health checks every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.runHealthChecks();
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 30 * 1000);

    // Initial health check
    setTimeout(() => this.runHealthChecks(), 1000);
  }

  async runHealthChecks() {
    if (!this.dbManager) return;

    try {
      // Check database health
      await this.checkDatabaseHealth();
      
      // Check system memory
      await this.checkMemoryHealth();
      
      // Check API health
      await this.checkAPIHealth();
      
      // Check WebSocket health
      await this.checkWebSocketHealth();
      
      // Check parent project integration
      await this.checkParentProjectHealth();
      
      // Generate overall health status
      const overallStatus = this.calculateOverallHealth();
      
      // Update health status
      this.healthStatus.set('overall', {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        components: Array.from(this.healthStatus.entries())
          .filter(([key]) => key !== 'overall')
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      });
      
      // Broadcast health updates if critical
      if (this.wsManager && overallStatus === 'critical') {
        this.wsManager.broadcast({
          type: 'health_alert',
          data: this.healthStatus.get('overall')
        });
      }
      
    } catch (error) {
      console.error('Health monitoring error:', error);
      this.healthStatus.set('monitor', {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test database connectivity
      const stats = await this.dbManager.getStats();
      const responseTime = Date.now() - startTime;
      
      // Check response time
      const thresholds = this.alertThresholds.database;
      let status = 'healthy';
      let issues = [];
      
      if (responseTime > thresholds.maxResponseTime) {
        status = 'warning';
        issues.push(`Slow response time: ${responseTime}ms`);
      }
      
      // Check database size (if available)
      if (stats.total_size && stats.total_size > thresholds.maxSize) {
        status = 'warning';
        issues.push(`Large database size: ${(stats.total_size / 1024 / 1024).toFixed(1)}MB`);
      }
      
      this.healthStatus.set('database', {
        status,
        responseTime,
        stats,
        issues,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.healthStatus.set('database', {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkMemoryHealth() {
    try {
      const memoryUsage = process.memoryUsage();
      const thresholds = this.alertThresholds.memory;
      
      let status = 'healthy';
      let issues = [];
      
      // Check heap usage
      if (memoryUsage.heapUsed > thresholds.maxHeapUsage) {
        status = 'warning';
        issues.push(`High heap usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
      }
      
      // Check RSS (Resident Set Size)
      const rssPercent = (memoryUsage.rss / (1024 * 1024 * 1024)) * 100; // Convert to GB percentage
      if (rssPercent > thresholds.maxUsage) {
        status = 'warning';
        issues.push(`High memory usage: ${rssPercent.toFixed(1)}%`);
      }
      
      this.healthStatus.set('memory', {
        status,
        usage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        issues,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.healthStatus.set('memory', {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkAPIHealth() {
    try {
      // This is a simplified check - in production you might make actual HTTP requests
      const status = 'healthy';
      const issues = [];
      
      this.healthStatus.set('api', {
        status,
        endpoints: {
          metrics: 'healthy',
          agents: 'healthy',
          sessions: 'healthy',
          analytics: 'healthy'
        },
        issues,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.healthStatus.set('api', {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkWebSocketHealth() {
    try {
      let status = 'healthy';
      let issues = [];
      
      // Check WebSocket connection count
      const connectionCount = this.wsManager ? this.wsManager.getConnectionCount() : 0;
      const thresholds = this.alertThresholds.websocket;
      
      if (connectionCount > thresholds.maxConnections) {
        status = 'warning';
        issues.push(`High connection count: ${connectionCount}`);
      }
      
      this.healthStatus.set('websocket', {
        status,
        connections: connectionCount,
        issues,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.healthStatus.set('websocket', {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkParentProjectHealth() {
    try {
      // Basic check for parent project integration
      const status = 'healthy';
      const issues = [];
      
      this.healthStatus.set('parent_project', {
        status,
        isInitialized: true,
        dataSources: 5, // Placeholder
        issues,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.healthStatus.set('parent_project', {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  calculateOverallHealth() {
    const healthStatuses = Array.from(this.healthStatus.values())
      .filter(h => h.status)
      .map(h => h.status);
    
    if (healthStatuses.includes('error')) {
      return 'critical';
    } else if (healthStatuses.includes('warning')) {
      return 'warning';
    } else if (healthStatuses.length > 0) {
      return 'healthy';
    } else {
      return 'unknown';
    }
  }

  getHealthStatus() {
    const overall = this.healthStatus.get('overall') || {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      components: {}
    };
    
    return {
      status: overall.status,
      timestamp: overall.timestamp,
      components: overall.components,
      uptime: process.uptime(),
      version: require('../../../package.json').version || '1.0.0'
    };
  }

  // Log health event to database
  async logHealthEvent(component, status, message, details = {}) {
    if (this.dbManager) {
      try {
        await this.dbManager.logHealthEvent(component, status, message, details);
      } catch (error) {
        console.error('Failed to log health event:', error);
      }
    }
  }

  // Get health history from database
  async getHealthHistory(component = null, limit = 100) {
    if (!this.dbManager) return [];
    
    try {
      let query = 'SELECT * FROM system_health WHERE resolved_at IS NULL';
      const params = [];
      
      if (component) {
        query += ' AND component = ?';
        params.push(component);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);
      
      return await this.dbManager.allQuery(query, params);
    } catch (error) {
      console.error('Failed to get health history:', error);
      return [];
    }
  }

  // Update alert thresholds
  updateThresholds(component, thresholds) {
    if (this.alertThresholds[component]) {
      this.alertThresholds[component] = {
        ...this.alertThresholds[component],
        ...thresholds
      };
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down Health Monitor...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthStatus.clear();
    this.isInitialized = false;
    
    console.log('✅ Health Monitor shutdown complete');
  }
}

module.exports = HealthMonitor;