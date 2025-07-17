import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Shield,
  Bell,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Types
interface ComplianceMetric {
  timestamp: string;
  metric_type: string;
  metric_value: number;
  threshold_value: number;
  is_compliant: boolean;
  details: string;
}

interface ComplianceAlert {
  id: string;
  timestamp: string;
  violation_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  details: Record<string, any>;
  response_time_ms: number;
  auto_remediation: boolean;
  resolved: boolean;
}

interface ComplianceSummary {
  tool_execution_rate: number;
  script_execution_rate: number;
  transparency_rate: number;
  real_work_rate: number;
  principle_compliance_rate: number;
  overall_compliance: number;
  trend_direction: 'improving' | 'declining' | 'stable';
}

// Severity color mapping
const severityColors = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-blue-100 text-blue-800 border-blue-200'
};

// Compliance thresholds
const complianceThresholds = {
  tool_execution: 80,
  script_execution: 95,
  transparency: 90,
  real_work: 70,
  principle_compliance: 85
};

const ComplianceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h'>('6h');

  // Fetch compliance data
  const fetchComplianceData = useCallback(async () => {
    try {
      const [metricsResponse, alertsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/compliance/metrics?timeRange=${selectedTimeRange}`),
        fetch('/api/compliance/alerts?limit=50'),
        fetch('/api/compliance/summary')
      ]);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange]);

  // Auto-refresh effect
  useEffect(() => {
    fetchComplianceData();
    
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchComplianceData, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchComplianceData, autoRefresh]);

  // Calculate compliance score color
  const getComplianceColor = (score: number, threshold: number): string => {
    if (score >= threshold) return 'text-green-600';
    if (score >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get trend icon
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'MEDIUM':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'LOW':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Mark alert as resolved
  const markAlertResolved = async (alertId: string) => {
    try {
      await fetch(`/api/compliance/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  // Get active alerts (unresolved)
  const activeAlerts = alerts.filter(alert => !alert.resolved);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading compliance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Monitor</h2>
          <p className="text-gray-600">Real-time compliance monitoring and alerting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'border-green-500 text-green-600' : ''}
          >
            <Activity className="h-4 w-4 mr-1" />
            Auto-refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComplianceData}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {summary.overall_compliance.toFixed(1)}%
                </span>
                {getTrendIcon(summary.trend_direction)}
              </div>
              <Progress value={summary.overall_compliance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tool Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getComplianceColor(summary.tool_execution_rate, complianceThresholds.tool_execution)}`}>
                  {summary.tool_execution_rate.toFixed(1)}%
                </span>
                {summary.tool_execution_rate >= complianceThresholds.tool_execution ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <XCircle className="h-5 w-5 text-red-600" />
                }
              </div>
              <Progress value={summary.tool_execution_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Script Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getComplianceColor(summary.script_execution_rate, complianceThresholds.script_execution)}`}>
                  {summary.script_execution_rate.toFixed(1)}%
                </span>
                {summary.script_execution_rate >= complianceThresholds.script_execution ? 
                  <CheckCircle className="h-5 w-5 text-green-600" /> : 
                  <XCircle className="h-5 w-5 text-red-600" />
                }
              </div>
              <Progress value={summary.script_execution_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {activeAlerts.length}
                </span>
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-2 flex space-x-1">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => {
                  const count = activeAlerts.filter(a => a.severity === severity).length;
                  return count > 0 ? (
                    <Badge key={severity} variant="outline" className={`text-xs ${severityColors[severity as keyof typeof severityColors]}`}>
                      {count}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Metrics</CardTitle>
                <CardDescription>Current compliance rates vs thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                {summary && (
                  <div className="space-y-4">
                    {Object.entries(complianceThresholds).map(([key, threshold]) => {
                      const value = summary[key as keyof ComplianceSummary] as number;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className={`text-sm font-bold ${getComplianceColor(value, threshold)}`}>
                              {value.toFixed(1)}% / {threshold}%
                            </span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest compliance violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {alert.violation_type}
                          </p>
                          <Badge variant="outline" className={`text-xs ${severityColors[alert.severity]}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            {alert.auto_remediation && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Auto-remediated
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAlertResolved(alert.id)}
                              className="text-xs"
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeAlerts.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p>No active alerts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>All compliance violations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${alert.resolved ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {alert.violation_type}
                            </h3>
                            <Badge variant="outline" className={`${severityColors[alert.severity]}`}>
                              {alert.severity}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                            <span>Response: {alert.response_time_ms}ms</span>
                            {alert.auto_remediation && (
                              <span className="text-green-600">Auto-remediated</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAlertResolved(alert.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                    {alert.details && Object.keys(alert.details).length > 0 && (
                      <div className="mt-4 bg-gray-50 p-3 rounded">
                        <h4 className="text-sm font-medium mb-2">Details:</h4>
                        <pre className="text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(alert.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics</CardTitle>
              <CardDescription>Detailed metrics and measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Time Range Selector */}
                <div className="flex space-x-2">
                  {(['1h', '6h', '24h'] as const).map(range => (
                    <Button
                      key={range}
                      variant={selectedTimeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>

                {/* Metrics List */}
                <div className="space-y-2">
                  {metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{metric.metric_type}</span>
                        <p className="text-sm text-gray-600">{metric.details}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${metric.is_compliant ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.metric_value.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Threshold: {metric.threshold_value}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>Historical compliance patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Overall Trend:</span>
                    {getTrendIcon(summary.trend_direction)}
                    <span className="text-sm text-gray-600 capitalize">{summary.trend_direction}</span>
                  </div>
                )}
                
                {/* Placeholder for trend chart */}
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Compliance trend chart</p>
                    <p className="text-sm text-gray-400">Chart implementation in progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleString()}
      </div>
    </div>
  );
};

export default ComplianceMonitor;