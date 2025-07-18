// Containerization metrics API routes
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to containerization metrics data
const METRICS_PATH = path.join(__dirname, '../../data/containerization_metrics.json');

/**
 * GET /api/containerization/metrics
 * Retrieve current containerization compliance metrics
 */
router.get('/metrics', async (req, res) => {
    try {
        const data = await fs.readFile(METRICS_PATH, 'utf8');
        const metrics = JSON.parse(data);
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading containerization metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to read containerization metrics',
            message: error.message
        });
    }
});

/**
 * GET /api/containerization/compliance-summary
 * Get a summary of compliance status
 */
router.get('/compliance-summary', async (req, res) => {
    try {
        const data = await fs.readFile(METRICS_PATH, 'utf8');
        const metrics = JSON.parse(data);
        const containerMetrics = metrics.containerization_metrics;
        
        // Calculate summary statistics
        const principleScores = Object.values(containerMetrics.principle_compliance)
            .map(principle => principle.score);
        
        const avgPrincipleScore = principleScores.reduce((sum, score) => sum + score, 0) / principleScores.length;
        
        const criticalAlerts = containerMetrics.alerts.critical.length;
        const highAlerts = containerMetrics.alerts.high.length;
        const totalAlerts = criticalAlerts + highAlerts;
        
        const summary = {
            overall_compliance: containerMetrics.overall_compliance.score,
            average_principle_score: Math.round(avgPrincipleScore * 10) / 10,
            deployment_readiness: containerMetrics.deployment_readiness.overall_score,
            command_integration: containerMetrics.command_integration.integration_score,
            alerts: {
                critical: criticalAlerts,
                high: highAlerts,
                total: totalAlerts
            },
            blocking_violations: containerMetrics.alerts.critical.filter(alert => alert.blocking).length,
            monitoring_status: metrics.monitoring.status,
            last_check: metrics.monitoring.last_enforcement_run
        };
        
        res.json({
            success: true,
            data: summary,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating compliance summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate compliance summary',
            message: error.message
        });
    }
});

/**
 * GET /api/containerization/alerts
 * Get current alerts and violations
 */
router.get('/alerts', async (req, res) => {
    try {
        const data = await fs.readFile(METRICS_PATH, 'utf8');
        const metrics = JSON.parse(data);
        const alerts = metrics.containerization_metrics.alerts;
        
        // Combine and sort alerts by severity
        const allAlerts = [
            ...alerts.critical.map(alert => ({...alert, severity_level: 1})),
            ...alerts.high.map(alert => ({...alert, severity_level: 2})),
            ...(alerts.medium || []).map(alert => ({...alert, severity_level: 3})),
            ...(alerts.low || []).map(alert => ({...alert, severity_level: 4}))
        ].sort((a, b) => a.severity_level - b.severity_level);
        
        res.json({
            success: true,
            data: {
                alerts: allAlerts,
                summary: {
                    critical: alerts.critical.length,
                    high: alerts.high.length,
                    medium: (alerts.medium || []).length,
                    low: (alerts.low || []).length,
                    blocking: alerts.critical.filter(alert => alert.blocking).length
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to read alerts',
            message: error.message
        });
    }
});

/**
 * GET /api/containerization/trends
 * Get compliance and performance trends
 */
router.get('/trends', async (req, res) => {
    try {
        const data = await fs.readFile(METRICS_PATH, 'utf8');
        const metrics = JSON.parse(data);
        const trends = metrics.containerization_metrics.trends;
        
        // Calculate trend analysis
        const complianceHistory = trends.compliance_history;
        const performanceHistory = trends.performance_history;
        
        const latestCompliance = complianceHistory[complianceHistory.length - 1]?.score || 0;
        const previousCompliance = complianceHistory[complianceHistory.length - 2]?.score || 0;
        const complianceTrend = latestCompliance - previousCompliance;
        
        const latestBuildTime = performanceHistory[performanceHistory.length - 1]?.build_time || 0;
        const previousBuildTime = performanceHistory[performanceHistory.length - 2]?.build_time || 0;
        const buildTimeTrend = latestBuildTime - previousBuildTime;
        
        const latestImageSize = performanceHistory[performanceHistory.length - 1]?.image_size || 0;
        const previousImageSize = performanceHistory[performanceHistory.length - 2]?.image_size || 0;
        const imageSizeTrend = latestImageSize - previousImageSize;
        
        res.json({
            success: true,
            data: {
                compliance_history: complianceHistory,
                performance_history: performanceHistory,
                trends: {
                    compliance: {
                        current: latestCompliance,
                        change: complianceTrend,
                        direction: complianceTrend > 0 ? 'up' : complianceTrend < 0 ? 'down' : 'stable'
                    },
                    build_time: {
                        current: latestBuildTime,
                        change: buildTimeTrend,
                        direction: buildTimeTrend < 0 ? 'up' : buildTimeTrend > 0 ? 'down' : 'stable' // Lower is better
                    },
                    image_size: {
                        current: latestImageSize,
                        change: imageSizeTrend,
                        direction: imageSizeTrend < 0 ? 'up' : imageSizeTrend > 0 ? 'down' : 'stable' // Lower is better
                    }
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reading trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to read trends',
            message: error.message
        });
    }
});

/**
 * POST /api/containerization/update-metrics
 * Update containerization metrics (called by enforcement engine)
 */
router.post('/update-metrics', async (req, res) => {
    try {
        const { enforcement_report } = req.body;
        
        if (!enforcement_report) {
            return res.status(400).json({
                success: false,
                error: 'Missing enforcement_report in request body'
            });
        }
        
        // Read current metrics
        const data = await fs.readFile(METRICS_PATH, 'utf8');
        const currentMetrics = JSON.parse(data);
        
        // Update metrics with new enforcement data
        const timestamp = new Date().toISOString();
        const compliance_score = parseFloat(enforcement_report.compliance_score.replace('%', ''));
        
        // Update overall compliance
        currentMetrics.containerization_metrics.overall_compliance = {
            score: compliance_score,
            threshold: 90,
            compliant: compliance_score >= 90,
            timestamp: timestamp
        };
        
        // Update alerts from violations
        currentMetrics.containerization_metrics.alerts.critical = enforcement_report.violations
            .filter(v => v.severity === 'CRITICAL')
            .map((v, index) => ({
                id: `security_${index + 1}`,
                type: 'security_violation',
                principle: v.principle,
                message: v.message,
                severity: v.severity,
                timestamp: timestamp,
                remediation: v.remediation,
                blocking: v.blocking
            }));
            
        currentMetrics.containerization_metrics.alerts.high = enforcement_report.violations
            .filter(v => v.severity === 'HIGH')
            .map((v, index) => ({
                id: `compliance_${index + 1}`,
                type: 'compliance_threshold',
                principle: v.principle,
                message: v.message,
                severity: v.severity,
                timestamp: timestamp,
                remediation: v.remediation,
                blocking: v.blocking
            }));
        
        // Update compliance history
        currentMetrics.containerization_metrics.trends.compliance_history.push({
            timestamp: timestamp,
            score: compliance_score
        });
        
        // Keep only last 20 entries
        if (currentMetrics.containerization_metrics.trends.compliance_history.length > 20) {
            currentMetrics.containerization_metrics.trends.compliance_history = 
                currentMetrics.containerization_metrics.trends.compliance_history.slice(-20);
        }
        
        // Update monitoring info
        currentMetrics.monitoring.last_enforcement_run = timestamp;
        currentMetrics.monitoring.next_scheduled_run = new Date(Date.now() + currentMetrics.monitoring.interval_seconds * 1000).toISOString();
        currentMetrics.timestamp = timestamp;
        
        // Write updated metrics
        await fs.writeFile(METRICS_PATH, JSON.stringify(currentMetrics, null, 2));
        
        res.json({
            success: true,
            message: 'Metrics updated successfully',
            timestamp: timestamp
        });
    } catch (error) {
        console.error('Error updating metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update metrics',
            message: error.message
        });
    }
});

module.exports = router;