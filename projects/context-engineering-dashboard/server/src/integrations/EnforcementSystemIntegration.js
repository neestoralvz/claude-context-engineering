/**
 * Enforcement System Integration - Context Engineering Dashboard
 * Connects all enforcement systems to the dashboard for real-time monitoring
 * Integrates with principle blocking, command orchestration, density optimization, and error protocol systems
 */

const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { EventEmitter } = require('events');

class EnforcementSystemIntegration extends EventEmitter {
    constructor() {
        super();
        this.projectRoot = path.resolve(__dirname, '../../../../../');
        this.databases = {
            enforcement: path.join(this.projectRoot, 'scripts/results/compliance/metrics/enforcement_engine.db'),
            orchestration: path.join(this.projectRoot, 'scripts/results/compliance/metrics/orchestration_enforcer.db'),
            density: path.join(this.projectRoot, 'scripts/results/compliance/metrics/density_enforcer.db'),
            errorProtocol: path.join(this.projectRoot, 'scripts/results/compliance/metrics/error_protocol.db'),
            compliance: path.join(this.projectRoot, 'scripts/results/compliance/metrics/compliance_monitoring.db')
        };
        
        this.dataPath = path.join(__dirname, '../../data');
        this.enforcementDataFile = path.join(this.dataPath, 'enforcement_data.json');
        
        // Ensure data directory exists
        this.ensureDataDirectory();
        
        // Initialize monitoring
        this.startMonitoring();
    }

    async ensureDataDirectory() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
        } catch (error) {
            console.error('Error creating data directory:', error);
        }
    }

    startMonitoring() {
        // Monitor enforcement systems every 30 seconds
        setInterval(() => {
            this.collectEnforcementData();
        }, 30000);
        
        // Initial data collection
        this.collectEnforcementData();
    }

    async collectEnforcementData() {
        try {
            const enforcementData = {
                timestamp: new Date().toISOString(),
                systems: {
                    principleBlocking: await this.getPrincipleBlockingData(),
                    commandOrchestration: await this.getCommandOrchestrationData(),
                    densityOptimization: await this.getDensityOptimizationData(),
                    errorProtocol: await this.getErrorProtocolData(),
                    complianceAlerting: await this.getComplianceAlertingData()
                },
                summary: {
                    totalViolations: 0,
                    activeProtocols: 0,
                    complianceRate: 0,
                    systemHealth: 'UNKNOWN'
                }
            };

            // Calculate summary metrics
            enforcementData.summary = this.calculateSummaryMetrics(enforcementData.systems);

            // Save to file
            await fs.writeFile(this.enforcementDataFile, JSON.stringify(enforcementData, null, 2));

            // Emit update event
            this.emit('enforcementDataUpdate', enforcementData);

            console.log(`Enforcement data updated: ${enforcementData.summary.totalViolations} violations, ${enforcementData.summary.complianceRate}% compliance`);

        } catch (error) {
            console.error('Error collecting enforcement data:', error);
        }
    }

    async getPrincipleBlockingData() {
        return new Promise((resolve) => {
            if (!this.databases.enforcement) {
                resolve({ status: 'NOT_AVAILABLE', data: {} });
                return;
            }

            const db = new sqlite3.Database(this.databases.enforcement, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    resolve({ status: 'ERROR', error: err.message, data: {} });
                    return;
                }

                // Get recent violations
                db.all(`
                    SELECT 
                        COUNT(*) as total_violations,
                        SUM(CASE WHEN resolved = 0 THEN 1 ELSE 0 END) as unresolved_violations,
                        violation_type,
                        COUNT(*) as count
                    FROM enforcement_violations 
                    WHERE timestamp > datetime('now', '-24 hours')
                    GROUP BY violation_type
                    ORDER BY count DESC
                `, [], (err, rows) => {
                    if (err) {
                        resolve({ status: 'ERROR', error: err.message, data: {} });
                        return;
                    }

                    // Get total active rules
                    db.get(`
                        SELECT COUNT(*) as active_rules
                        FROM enforcement_rules 
                        WHERE active = 1
                    `, [], (err, rulesRow) => {
                        db.close();

                        if (err) {
                            resolve({ status: 'ERROR', error: err.message, data: {} });
                            return;
                        }

                        const totalViolations = rows.reduce((sum, row) => sum + row.count, 0);
                        const unresolvedViolations = rows.reduce((sum, row) => sum + row.unresolved_violations, 0);

                        resolve({
                            status: 'ACTIVE',
                            data: {
                                activeRules: rulesRow ? rulesRow.active_rules : 0,
                                violations24h: totalViolations,
                                unresolvedViolations: unresolvedViolations,
                                violationsByType: rows.map(row => ({
                                    type: row.violation_type,
                                    count: row.count
                                }))
                            }
                        });
                    });
                });
            });
        });
    }

    async getCommandOrchestrationData() {
        return new Promise((resolve) => {
            if (!this.databases.orchestration) {
                resolve({ status: 'NOT_AVAILABLE', data: {} });
                return;
            }

            const db = new sqlite3.Database(this.databases.orchestration, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    resolve({ status: 'ERROR', error: err.message, data: {} });
                    return;
                }

                // Get usage patterns and violations
                db.all(`
                    SELECT 
                        AVG(utilization_rate) as avg_utilization,
                        AVG(objective_complexity) as avg_complexity,
                        COUNT(*) as total_patterns,
                        SUM(CASE WHEN is_compliant = 0 THEN 1 ELSE 0 END) as violations
                    FROM usage_patterns 
                    WHERE timestamp > datetime('now', '-24 hours')
                `, [], (err, usageRows) => {
                    if (err) {
                        resolve({ status: 'ERROR', error: err.message, data: {} });
                        return;
                    }

                    // Get violation details
                    db.all(`
                        SELECT violation_type, COUNT(*) as count, AVG(utilization_gap) as avg_gap
                        FROM orchestration_violations 
                        WHERE timestamp > datetime('now', '-24 hours')
                        GROUP BY violation_type
                    `, [], (err, violationRows) => {
                        db.close();

                        if (err) {
                            resolve({ status: 'ERROR', error: err.message, data: {} });
                            return;
                        }

                        const usageData = usageRows[0] || {};
                        
                        resolve({
                            status: 'ACTIVE',
                            data: {
                                avgUtilization: usageData.avg_utilization || 0,
                                avgComplexity: usageData.avg_complexity || 0,
                                totalPatterns24h: usageData.total_patterns || 0,
                                violations24h: usageData.violations || 0,
                                complianceRate: usageData.total_patterns > 0 ? 
                                    ((usageData.total_patterns - usageData.violations) / usageData.total_patterns) * 100 : 100,
                                violationsByType: violationRows.map(row => ({
                                    type: row.violation_type,
                                    count: row.count,
                                    avgGap: row.avg_gap
                                }))
                            }
                        });
                    });
                });
            });
        });
    }

    async getDensityOptimizationData() {
        return new Promise((resolve) => {
            if (!this.databases.density) {
                resolve({ status: 'NOT_AVAILABLE', data: {} });
                return;
            }

            const db = new sqlite3.Database(this.databases.density, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    resolve({ status: 'ERROR', error: err.message, data: {} });
                    return;
                }

                // Get density analyses
                db.all(`
                    SELECT 
                        AVG(character_efficiency) as avg_efficiency,
                        AVG(estimated_comprehension_time) as avg_comprehension_time,
                        AVG(value_per_token) as avg_value_per_token,
                        COUNT(*) as total_analyses,
                        SUM(CASE WHEN is_compliant = 0 THEN 1 ELSE 0 END) as violations
                    FROM density_analyses 
                    WHERE timestamp > datetime('now', '-24 hours')
                `, [], (err, analysisRows) => {
                    if (err) {
                        resolve({ status: 'ERROR', error: err.message, data: {} });
                        return;
                    }

                    // Get violation details
                    db.all(`
                        SELECT violation_type, COUNT(*) as count, AVG(metric_value) as avg_metric
                        FROM density_violations 
                        WHERE timestamp > datetime('now', '-24 hours')
                        GROUP BY violation_type
                    `, [], (err, violationRows) => {
                        db.close();

                        if (err) {
                            resolve({ status: 'ERROR', error: err.message, data: {} });
                            return;
                        }

                        const analysisData = analysisRows[0] || {};
                        
                        resolve({
                            status: 'ACTIVE',
                            data: {
                                avgCharacterEfficiency: analysisData.avg_efficiency || 0,
                                avgComprehensionTime: analysisData.avg_comprehension_time || 0,
                                avgValuePerToken: analysisData.avg_value_per_token || 0,
                                totalAnalyses24h: analysisData.total_analyses || 0,
                                violations24h: analysisData.violations || 0,
                                complianceRate: analysisData.total_analyses > 0 ? 
                                    ((analysisData.total_analyses - analysisData.violations) / analysisData.total_analyses) * 100 : 100,
                                violationsByType: violationRows.map(row => ({
                                    type: row.violation_type,
                                    count: row.count,
                                    avgMetric: row.avg_metric
                                }))
                            }
                        });
                    });
                });
            });
        });
    }

    async getErrorProtocolData() {
        return new Promise((resolve) => {
            if (!this.databases.errorProtocol) {
                resolve({ status: 'NOT_AVAILABLE', data: {} });
                return;
            }

            const db = new sqlite3.Database(this.databases.errorProtocol, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    resolve({ status: 'ERROR', error: err.message, data: {} });
                    return;
                }

                // Get error detections
                db.all(`
                    SELECT 
                        COUNT(*) as total_errors,
                        SUM(CASE WHEN requires_protocol = 1 THEN 1 ELSE 0 END) as protocol_required,
                        error_type,
                        COUNT(*) as count
                    FROM error_detections 
                    WHERE timestamp > datetime('now', '-24 hours')
                    GROUP BY error_type
                    ORDER BY count DESC
                `, [], (err, errorRows) => {
                    if (err) {
                        resolve({ status: 'ERROR', error: err.message, data: {} });
                        return;
                    }

                    // Get protocol executions
                    db.all(`
                        SELECT protocol_status, COUNT(*) as count
                        FROM protocol_executions 
                        WHERE start_time > datetime('now', '-24 hours')
                        GROUP BY protocol_status
                    `, [], (err, protocolRows) => {
                        db.close();

                        if (err) {
                            resolve({ status: 'ERROR', error: err.message, data: {} });
                            return;
                        }

                        const totalErrors = errorRows.reduce((sum, row) => sum + row.count, 0);
                        const protocolRequired = errorRows.reduce((sum, row) => sum + row.protocol_required, 0);
                        const activeProtocols = protocolRows.find(row => row.protocol_status === 'ACTIVE')?.count || 0;

                        resolve({
                            status: 'ACTIVE',
                            data: {
                                totalErrors24h: totalErrors,
                                protocolRequired24h: protocolRequired,
                                activeProtocols: activeProtocols,
                                errorsByType: errorRows.map(row => ({
                                    type: row.error_type,
                                    count: row.count
                                })),
                                protocolsByStatus: protocolRows.map(row => ({
                                    status: row.protocol_status,
                                    count: row.count
                                }))
                            }
                        });
                    });
                });
            });
        });
    }

    async getComplianceAlertingData() {
        return new Promise((resolve) => {
            if (!this.databases.compliance) {
                resolve({ status: 'NOT_AVAILABLE', data: {} });
                return;
            }

            const db = new sqlite3.Database(this.databases.compliance, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    resolve({ status: 'ERROR', error: err.message, data: {} });
                    return;
                }

                // Get compliance alerts
                db.all(`
                    SELECT 
                        COUNT(*) as total_alerts,
                        violation_type,
                        severity,
                        COUNT(*) as count
                    FROM compliance_alerts 
                    WHERE timestamp > datetime('now', '-24 hours')
                    GROUP BY violation_type, severity
                    ORDER BY count DESC
                `, [], (err, alertRows) => {
                    if (err) {
                        resolve({ status: 'ERROR', error: err.message, data: {} });
                        return;
                    }

                    // Get compliance metrics
                    db.all(`
                        SELECT 
                            metric_type,
                            AVG(metric_value) as avg_value,
                            AVG(CASE WHEN is_compliant = 1 THEN 1.0 ELSE 0.0 END) as compliance_rate
                        FROM compliance_metrics 
                        WHERE timestamp > datetime('now', '-24 hours')
                        GROUP BY metric_type
                    `, [], (err, metricRows) => {
                        db.close();

                        if (err) {
                            resolve({ status: 'ERROR', error: err.message, data: {} });
                            return;
                        }

                        const totalAlerts = alertRows.reduce((sum, row) => sum + row.count, 0);
                        const avgComplianceRate = metricRows.length > 0 ? 
                            metricRows.reduce((sum, row) => sum + row.compliance_rate, 0) / metricRows.length * 100 : 100;

                        resolve({
                            status: 'ACTIVE',
                            data: {
                                totalAlerts24h: totalAlerts,
                                avgComplianceRate: avgComplianceRate,
                                alertsBySeverity: alertRows.reduce((acc, row) => {
                                    acc[row.severity] = (acc[row.severity] || 0) + row.count;
                                    return acc;
                                }, {}),
                                alertsByType: alertRows.map(row => ({
                                    type: row.violation_type,
                                    severity: row.severity,
                                    count: row.count
                                })),
                                metricsByType: metricRows.map(row => ({
                                    type: row.metric_type,
                                    avgValue: row.avg_value,
                                    complianceRate: row.compliance_rate * 100
                                }))
                            }
                        });
                    });
                });
            });
        });
    }

    calculateSummaryMetrics(systems) {
        let totalViolations = 0;
        let activeProtocols = 0;
        let complianceRates = [];
        let systemsActive = 0;

        // Count violations and active protocols
        Object.values(systems).forEach(system => {
            if (system.status === 'ACTIVE') {
                systemsActive++;
                
                if (system.data.violations24h) {
                    totalViolations += system.data.violations24h;
                }
                
                if (system.data.activeProtocols) {
                    activeProtocols += system.data.activeProtocols;
                }
                
                if (system.data.complianceRate !== undefined) {
                    complianceRates.push(system.data.complianceRate);
                }
            }
        });

        // Calculate overall compliance rate
        const avgComplianceRate = complianceRates.length > 0 ? 
            complianceRates.reduce((sum, rate) => sum + rate, 0) / complianceRates.length : 0;

        // Determine system health
        let systemHealth = 'HEALTHY';
        if (totalViolations > 50) {
            systemHealth = 'CRITICAL';
        } else if (totalViolations > 20 || avgComplianceRate < 80) {
            systemHealth = 'WARNING';
        } else if (systemsActive < 3) {
            systemHealth = 'DEGRADED';
        }

        return {
            totalViolations,
            activeProtocols,
            complianceRate: Math.round(avgComplianceRate * 100) / 100,
            systemHealth,
            systemsActive,
            totalSystems: Object.keys(systems).length
        };
    }

    async getEnforcementStatus() {
        try {
            const data = await fs.readFile(this.enforcementDataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading enforcement data:', error);
            return {
                timestamp: new Date().toISOString(),
                systems: {},
                summary: {
                    totalViolations: 0,
                    activeProtocols: 0,
                    complianceRate: 0,
                    systemHealth: 'UNKNOWN'
                }
            };
        }
    }

    async checkBlockingStatus() {
        const blockingFiles = [
            path.join(this.projectRoot, 'scripts/results/compliance/BLOCKING_ACTIVE.flag'),
            path.join(this.projectRoot, 'scripts/results/compliance/ERROR_PROTOCOL_ACTIVE.flag')
        ];

        const blockingStatus = {
            isBlocked: false,
            blockingReasons: [],
            activeFlags: []
        };

        for (const flagFile of blockingFiles) {
            try {
                await fs.access(flagFile);
                blockingStatus.isBlocked = true;
                blockingStatus.activeFlags.push(path.basename(flagFile));
                
                // Read blocking reason
                const content = await fs.readFile(flagFile, 'utf8');
                const lines = content.split('\n');
                if (lines.length > 1) {
                    blockingStatus.blockingReasons.push(lines[1]); // Second line is usually the reason
                }
            } catch (error) {
                // File doesn't exist, which is good
            }
        }

        return blockingStatus;
    }

    // API methods for dashboard
    async getDashboardData() {
        const [enforcementData, blockingStatus] = await Promise.all([
            this.getEnforcementStatus(),
            this.checkBlockingStatus()
        ]);

        return {
            ...enforcementData,
            blocking: blockingStatus,
            lastUpdated: enforcementData.timestamp
        };
    }

    async getSystemDetails(systemName) {
        const enforcementData = await this.getEnforcementStatus();
        return enforcementData.systems[systemName] || { status: 'NOT_FOUND', data: {} };
    }

    async getViolationHistory(hours = 24) {
        // This would typically query multiple databases for historical data
        // For now, return current data
        return this.getEnforcementStatus();
    }
}

module.exports = EnforcementSystemIntegration;