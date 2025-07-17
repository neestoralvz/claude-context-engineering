import React, { useState, useEffect } from 'react';
import { Clock, Activity, TrendingUp, AlertCircle, CheckCircle, Timer } from 'lucide-react';

/**
 * TimingMetricsWidget - Real-time execution timing metrics display
 * Context Engineering System - P55/P56 Compliance Dashboard Component
 */
const TimingMetricsWidget = ({ 
  className = '', 
  refreshInterval = 10000,
  showDetails = true 
}) => {
  const [metrics, setMetrics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch timing metrics
  const fetchMetrics = async () => {
    try {
      const [metricsRes, summaryRes, alertsRes] = await Promise.all([
        fetch('/api/timing-metrics/current'),
        fetch('/api/timing-metrics/summary'),
        fetch('/api/timing-metrics/alerts')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.data.slice(0, 5)); // Show only latest 5 alerts
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching timing metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh metrics
  const forceRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/timing-metrics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setTimeout(() => fetchMetrics(), 2000); // Wait for aggregation
      } else {
        throw new Error('Failed to update metrics');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Setup periodic refresh
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Format time duration
  const formatDuration = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get performance tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'fast': return 'text-green-600';
      case 'standard': return 'text-blue-600';
      case 'complex': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get compliance status color
  const getComplianceColor = (rate) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 87.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !metrics) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Timer className="h-6 w-6 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold">Loading Timing Metrics...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600">Timing Metrics Error</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={forceRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Execution Timing Metrics</h3>
        </div>
        <div className="flex items-center space-x-2">
          {loading && <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
          <button
            onClick={forceRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh metrics"
          >
            <Activity className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Instructions</div>
            <div className="text-2xl font-bold text-gray-900">{summary.total_instructions}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Avg Execution Time</div>
            <div className="text-2xl font-bold text-gray-900">{formatDuration(summary.avg_execution_time_ms)}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className={`text-2xl font-bold ${getComplianceColor(summary.success_rate)}`}>
              {summary.success_rate.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Compliance Score</div>
            <div className={`text-2xl font-bold ${getComplianceColor(summary.compliance_score)}`}>
              {summary.compliance_score}%
            </div>
          </div>
        </div>
      )}

      {/* Performance Tiers */}
      {metrics?.instruction_metrics && (
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(metrics.instruction_metrics.by_performance_tier).map(([tier, count]) => (
              <div key={tier} className="text-center p-3 border rounded-lg">
                <div className={`text-lg font-bold ${getTierColor(tier)}`}>{count}</div>
                <div className="text-xs text-gray-500 capitalize">{tier}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Status */}
      {summary && (
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3">P55/P56 Compliance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">P55 Real Execution</span>
              <div className="flex items-center">
                <span className={`text-sm font-semibold ${getComplianceColor(summary.p55_compliance_rate)}`}>
                  {summary.p55_compliance_rate.toFixed(1)}%
                </span>
                {summary.p55_compliance_rate >= 95 ? 
                  <CheckCircle className="h-4 w-4 text-green-600 ml-2" /> :
                  <AlertCircle className="h-4 w-4 text-red-600 ml-2" />
                }
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">P56 Transparency</span>
              <div className="flex items-center">
                <span className={`text-sm font-semibold ${getComplianceColor(summary.p56_transparency_rate)}`}>
                  {summary.p56_transparency_rate.toFixed(1)}%
                </span>
                {summary.p56_transparency_rate >= 95 ? 
                  <CheckCircle className="h-4 w-4 text-green-600 ml-2" /> :
                  <AlertCircle className="h-4 w-4 text-red-600 ml-2" />
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
            Recent Timing Alerts
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-yellow-800">{alert.violation_type}</div>
                  <div className="text-xs text-yellow-700 truncate">{alert.message}</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
        <div className="flex items-center space-x-4">
          <span>Status: {summary?.system_status || 'Unknown'}</span>
          {summary?.real_work_ratio && (
            <span>Real Work: {(summary.real_work_ratio * 100).toFixed(1)}%</span>
          )}
        </div>
        {lastUpdate && (
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};

export default TimingMetricsWidget;