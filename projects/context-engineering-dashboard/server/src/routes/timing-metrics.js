const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

/**
 * Timing Metrics API Routes
 * Handles execution time metrics from Claude Code instruction timing system
 * P55/P56 Compliance: Real-time performance analytics with transparency
 */

// Data file paths
const DATA_DIR = path.join(__dirname, '../../data');
const TIMING_METRICS_FILE = path.join(DATA_DIR, 'execution_timing_metrics.json');
const TIMING_ALERTS_FILE = path.join(DATA_DIR, 'timing_alerts.json');

// Helper function to read JSON file safely
async function readJsonFile(filePath, defaultValue = {}) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

// Helper function to write JSON file safely
async function writeJsonFile(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Get current timing metrics
router.get('/current', async (req, res) => {
  try {
    const metrics = await readJsonFile(TIMING_METRICS_FILE, {
      timestamp: new Date().toISOString(),
      metrics_period_hours: 24,
      instruction_metrics: {
        by_instruction_type: {},
        by_performance_tier: { fast: 0, standard: 0, complex: 0, critical: 0 },
        total_instructions: 0
      },
      tool_metrics: {
        tool_usage: {},
        most_used_tools: [],
        total_tool_calls: 0
      },
      performance_analytics: {
        overall: {
          total_instructions: 0,
          avg_execution_time_ms: 0,
          avg_tool_calls: 0,
          avg_complexity: 0,
          success_rate: 0,
          p55_compliance_rate: 0,
          p56_transparency_rate: 0,
          real_work_ratio: 0
        },
        threshold_compliance: {
          within_30s_rate: 0,
          within_2min_rate: 0,
          efficient_tool_usage_rate: 0
        },
        hourly_trends: {}
      },
      realtime_stats: {
        last_10_minutes: {
          instruction_count: 0,
          avg_execution_time_ms: 0,
          last_instruction: "None"
        },
        system_status: "idle"
      },
      compliance_status: {
        p55_real_execution: true,
        p56_transparency: true,
        evidence_documented: true,
        mathematical_precision: true,
        response_time_compliance: true
      },
      dashboard_status: "no_data"
    });

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting timing metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timing metrics',
      message: error.message
    });
  }
});

// Get timing summary statistics
router.get('/summary', async (req, res) => {
  try {
    const metrics = await readJsonFile(TIMING_METRICS_FILE, {});
    
    if (!metrics.performance_analytics) {
      return res.json({
        success: true,
        data: {
          total_instructions: 0,
          avg_execution_time: 0,
          success_rate: 0,
          compliance_score: 0,
          status: 'no_data'
        },
        timestamp: new Date().toISOString()
      });
    }

    const overall = metrics.performance_analytics.overall || {};
    const compliance = metrics.compliance_status || {};
    
    // Calculate overall compliance score
    const complianceScore = Math.round(
      ((compliance.p55_real_execution ? 1 : 0) +
       (compliance.p56_transparency ? 1 : 0) +
       (compliance.evidence_documented ? 1 : 0) +
       (compliance.mathematical_precision ? 1 : 0) +
       (compliance.response_time_compliance ? 1 : 0)) * 20
    );

    const summary = {
      total_instructions: overall.total_instructions || 0,
      avg_execution_time_ms: Math.round(overall.avg_execution_time_ms || 0),
      success_rate: Math.round((overall.success_rate || 0) * 10) / 10,
      p55_compliance_rate: Math.round((overall.p55_compliance_rate || 0) * 10) / 10,
      p56_transparency_rate: Math.round((overall.p56_transparency_rate || 0) * 10) / 10,
      compliance_score: complianceScore,
      real_work_ratio: Math.round((overall.real_work_ratio || 0) * 1000) / 1000,
      system_status: metrics.realtime_stats?.system_status || 'unknown',
      last_update: metrics.timestamp || new Date().toISOString()
    };

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting timing summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timing summary',
      message: error.message
    });
  }
});

// Get performance trends
router.get('/trends', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const metrics = await readJsonFile(TIMING_METRICS_FILE, {});
    
    const trends = {
      hourly_trends: metrics.performance_analytics?.hourly_trends || {},
      performance_tiers: metrics.instruction_metrics?.by_performance_tier || {
        fast: 0, standard: 0, complex: 0, critical: 0
      },
      tool_usage: Object.entries(metrics.tool_metrics?.tool_usage || {})
        .slice(0, 10)
        .map(([tool, data]) => ({
          tool,
          usage_count: data.usage_count,
          avg_time_ms: Math.round(data.avg_execution_time_ms || 0),
          success_rate: Math.round((data.success_rate || 0) * 10) / 10
        })),
      threshold_compliance: metrics.performance_analytics?.threshold_compliance || {
        within_30s_rate: 0,
        within_2min_rate: 0,
        efficient_tool_usage_rate: 0
      }
    };

    res.json({
      success: true,
      data: trends,
      period_hours: hours,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting performance trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance trends',
      message: error.message
    });
  }
});

// Get timing alerts
router.get('/alerts', async (req, res) => {
  try {
    let alerts = [];
    
    try {
      const alertsData = await fs.readFile(TIMING_ALERTS_FILE, 'utf8');
      // Parse JSONL format (one JSON object per line)
      alerts = alertsData.trim().split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .slice(-50); // Get last 50 alerts
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Error reading timing alerts:', error);
      }
    }

    // Sort by timestamp descending
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting timing alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timing alerts',
      message: error.message
    });
  }
});

// Update timing metrics (for manual updates)
router.post('/update', async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const scriptPath = path.join(__dirname, '../../../../../scripts/performance/timing-metrics-aggregator.py');
    
    // Execute aggregator script
    const aggregator = spawn('python3', [scriptPath, '--update-dashboard'], {
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    aggregator.stdout.on('data', (data) => {
      output += data.toString();
    });

    aggregator.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    aggregator.on('close', (code) => {
      if (code === 0) {
        res.json({
          success: true,
          message: 'Timing metrics updated successfully',
          output: output.trim(),
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update timing metrics',
          code: code,
          output: output.trim(),
          error_output: errorOutput.trim()
        });
      }
    });

    aggregator.on('error', (error) => {
      res.status(500).json({
        success: false,
        error: 'Failed to execute aggregator script',
        message: error.message
      });
    });

    // Set timeout
    setTimeout(() => {
      aggregator.kill();
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Timing metrics update timeout'
        });
      }
    }, 30000); // 30 second timeout

  } catch (error) {
    console.error('Error updating timing metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update timing metrics',
      message: error.message
    });
  }
});

// Get real-time status
router.get('/status', async (req, res) => {
  try {
    const metrics = await readJsonFile(TIMING_METRICS_FILE, {});
    const realtime = metrics.realtime_stats || {};
    
    const status = {
      system_status: realtime.system_status || 'unknown',
      last_instruction: realtime.last_10_minutes?.last_instruction || 'None',
      recent_activity: realtime.last_10_minutes?.instruction_count || 0,
      avg_recent_time: Math.round(realtime.last_10_minutes?.avg_execution_time_ms || 0),
      dashboard_status: metrics.dashboard_status || 'unknown',
      last_update: metrics.timestamp || null,
      data_age_minutes: metrics.timestamp ? 
        Math.round((Date.now() - new Date(metrics.timestamp).getTime()) / 60000) : null
    };

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting timing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timing status',
      message: error.message
    });
  }
});

// WebSocket support for real-time updates
router.ws = function(wsManager) {
  if (!wsManager) return;

  // Monitor timing metrics file for changes
  const chokidar = require('chokidar');
  
  const watcher = chokidar.watch(TIMING_METRICS_FILE, {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', async () => {
    try {
      const metrics = await readJsonFile(TIMING_METRICS_FILE, {});
      
      // Broadcast updated metrics to all connected clients
      wsManager.broadcast({
        type: 'timing_metrics_update',
        data: metrics,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error broadcasting timing metrics update:', error);
    }
  });

  return watcher;
};

module.exports = router;