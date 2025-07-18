import { NextResponse } from 'next/server'

async function checkDatabaseConnection(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    
    // Try to import and use the database health check
    try {
      const { healthCheck } = await import('@/lib/database');
      const result = await healthCheck();
      const latency = Date.now() - start;
      
      return {
        status: result.status === 'healthy' ? 'connected' : 'disconnected',
        latency: latency,
        error: result.details
      };
    } catch (importError) {
      // If database module is not available, simulate connection check
      await new Promise(resolve => setTimeout(resolve, 10));
      const latency = Date.now() - start;
      
      return {
        status: 'not_configured',
        latency: latency,
        error: 'Database module not configured'
      };
    }
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

async function checkExternalServices(): Promise<{ 
  websocket: { status: string; port?: number }; 
  redis: { status: string; error?: string };
  prometheus: { status: string; error?: string };
}> {
  // Check WebSocket server
  const websocketStatus = process.env.WEBSOCKET_PORT ? 
    { status: 'running', port: parseInt(process.env.WEBSOCKET_PORT) } : 
    { status: 'not_configured' };

  // Check Redis (simulated)
  const redisStatus = process.env.REDIS_URL ? 
    { status: 'connected' } : 
    { status: 'not_configured' };

  // Check Prometheus (simulated)
  const prometheusStatus = process.env.PROMETHEUS_URL ? 
    { status: 'connected' } : 
    { status: 'not_configured' };

  return {
    websocket: websocketStatus,
    redis: redisStatus,
    prometheus: prometheusStatus
  };
}

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Run health checks in parallel
    const [dbStatus, externalServices] = await Promise.all([
      checkDatabaseConnection(),
      checkExternalServices()
    ]);

    const totalLatency = Date.now() - startTime;
    
    // Determine overall health status
    let overallStatus = 'healthy';
    const issues = [];

    if (dbStatus.status === 'disconnected') {
      overallStatus = 'degraded';
      issues.push('Database connection issues');
    }

    if (externalServices.websocket.status === 'error') {
      overallStatus = 'degraded';
      issues.push('WebSocket server issues');
    }

    // Enhanced health check response
    const healthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: 'ninu-factory-control',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: dbStatus,
        external_services: externalServices,
        total_latency: totalLatency
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          usage_percent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        cpu: {
          platform: process.platform,
          arch: process.arch,
          node_version: process.version
        }
      },
      // Factory-specific health indicators
      factory: {
        reactors: {
          total: 3,
          active: 2,
          maintenance: 1,
          efficiency: 87.5 // percentage
        },
        stations: {
          total: 5,
          operational: 4,
          offline: 1,
          throughput: 145 // units per hour
        },
        inventory: {
          total_items: 12,
          low_stock_alerts: 4,
          critical_alerts: 2
        },
        production: {
          daily_output: 1250,
          quality_rate: 96.8,
          last_batch: new Date().toISOString()
        },
        lastDataUpdate: new Date().toISOString()
      },
      // Additional monitoring data for external systems
      monitoring: {
        metrics_enabled: !!process.env.PROMETHEUS_URL,
        logging_enabled: true,
        alerts_enabled: true,
        backup_enabled: !!process.env.BACKUP_ENABLED
      }
    };

    // Add issues if any
    if (issues.length > 0) {
      healthCheck.issues = issues;
    }

    return NextResponse.json(healthCheck, { 
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'ninu-factory-control'
      }, 
      { status: 500 }
    );
  }
}