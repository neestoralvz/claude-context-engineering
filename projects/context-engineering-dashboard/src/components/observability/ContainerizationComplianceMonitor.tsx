'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ContainerizationMetrics {
  timestamp: string;
  containerization_metrics: {
    overall_compliance: {
      score: number;
      threshold: number;
      compliant: boolean;
      timestamp: string;
    };
    principle_compliance: {
      [key: string]: {
        compliant: boolean;
        score: number;
        checks_passed?: string[];
        checks_failed?: string[];
        violations?: Array<{
          type: string;
          severity: string;
          message: string;
          remediation: string;
          blocking: boolean;
        }>;
        message: string;
      };
    };
    deployment_readiness: {
      overall_score: number;
      threshold: number;
      ready: boolean;
      components: {
        [key: string]: {
          status: boolean;
          score: number;
          details: string;
        };
      };
    };
    command_integration: {
      commands_available: Array<{
        name: string;
        description: string;
        compliance_score: number;
        last_used: string;
      }>;
      integration_score: number;
    };
    alerts: {
      critical: Array<{
        id: string;
        type: string;
        principle: string;
        message: string;
        severity: string;
        timestamp: string;
        remediation: string;
        blocking: boolean;
      }>;
      high: Array<{
        id: string;
        type: string;
        principle: string;
        message: string;
        severity: string;
        timestamp: string;
        remediation: string;
        blocking: boolean;
      }>;
    };
    trends: {
      compliance_history: Array<{
        timestamp: string;
        score: number;
      }>;
      performance_history: Array<{
        timestamp: string;
        build_time: number;
        image_size: number;
      }>;
    };
  };
  monitoring: {
    status: string;
    interval_seconds: number;
    last_enforcement_run: string;
    next_scheduled_run: string;
  };
}

export default function ContainerizationComplianceMonitor() {
  const [metrics, setMetrics] = useState<ContainerizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/server/data/containerization_metrics.json');
        if (!response.ok) {
          throw new Error('Failed to fetch containerization metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getComplianceColor = (compliant: boolean, score: number): string => {
    if (compliant) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="p-6">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Error Loading Metrics</h3>
          <p>{error || 'No metrics data available'}</p>
        </div>
      </Card>
    );
  }

  const { containerization_metrics } = metrics;

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🔒 Containerization Compliance</h2>
          <Badge className={containerization_metrics.overall_compliance.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {containerization_metrics.overall_compliance.compliant ? '✅ Compliant' : '❌ Non-Compliant'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getComplianceColor(
              containerization_metrics.overall_compliance.compliant,
              containerization_metrics.overall_compliance.score
            )}`}>
              {containerization_metrics.overall_compliance.score}%
            </div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {containerization_metrics.deployment_readiness.overall_score}%
            </div>
            <div className="text-sm text-gray-600">Deployment Ready</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {containerization_metrics.command_integration.integration_score}%
            </div>
            <div className="text-sm text-gray-600">Command Integration</div>
          </div>
        </div>
      </Card>

      {/* Critical Alerts */}
      {(containerization_metrics.alerts.critical.length > 0 || containerization_metrics.alerts.high.length > 0) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🚨 Active Alerts</h3>
          
          {containerization_metrics.alerts.critical.map((alert, index) => (
            <div key={index} className="mb-4 p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-red-800">
                  Principle #{alert.principle} - {alert.type.replace('_', ' ').toUpperCase()}
                </span>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.blocking ? '🚨 BLOCKING' : alert.severity}
                </Badge>
              </div>
              <p className="text-red-700 mb-2">{alert.message}</p>
              <p className="text-sm text-red-600">
                <strong>Remediation:</strong> {alert.remediation}
              </p>
            </div>
          ))}

          {containerization_metrics.alerts.high.map((alert, index) => (
            <div key={index} className="mb-4 p-4 border-l-4 border-orange-500 bg-orange-50">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-orange-800">
                  Principle #{alert.principle} - {alert.type.replace('_', ' ').toUpperCase()}
                </span>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-orange-700 mb-2">{alert.message}</p>
              <p className="text-sm text-orange-600">
                <strong>Remediation:</strong> {alert.remediation}
              </p>
            </div>
          ))}
        </Card>
      )}

      {/* Principle Compliance Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Principle Compliance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(containerization_metrics.principle_compliance).map(([principleId, principle]) => (
            <div key={principleId} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">
                  #{principleId.split('_')[1]} {principleId.split('_').slice(2).join(' ').replace(/^\w/, c => c.toUpperCase())}
                </h4>
                <Badge className={principle.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {principle.score}%
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{principle.message}</p>
              
              {principle.checks_passed && principle.checks_passed.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-green-600 mb-1">✅ Passed:</div>
                  <div className="text-xs text-green-600">
                    {principle.checks_passed.join(', ')}
                  </div>
                </div>
              )}
              
              {principle.checks_failed && principle.checks_failed.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-red-600 mb-1">❌ Failed:</div>
                  <div className="text-xs text-red-600">
                    {principle.checks_failed.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Command Integration Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">⚡ Command Integration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {containerization_metrics.command_integration.commands_available.map((command, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">/{command.name}</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {command.compliance_score}%
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{command.description}</p>
              <p className="text-xs text-gray-500">
                Last used: {new Date(command.last_used).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Compliance Trends</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Compliance History</h4>
            <div className="space-y-2">
              {containerization_metrics.trends.compliance_history.slice(-5).map((point, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={getComplianceColor(point.score >= 90, point.score)}>
                    {point.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Performance Trends</h4>
            <div className="space-y-2">
              {containerization_metrics.trends.performance_history.slice(-3).map((point, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Build Time:</span>
                    <span>{point.build_time}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Image Size:</span>
                    <span>{point.image_size}MB</span>
                  </div>
                  <hr className="my-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Monitoring Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Monitoring Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Status:</strong> 
            <Badge className={metrics.monitoring.status === 'active' ? 'bg-green-100 text-green-800 ml-2' : 'bg-red-100 text-red-800 ml-2'}>
              {metrics.monitoring.status}
            </Badge>
          </div>
          <div>
            <strong>Check Interval:</strong> {metrics.monitoring.interval_seconds}s
          </div>
          <div>
            <strong>Last Run:</strong> {new Date(metrics.monitoring.last_enforcement_run).toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  );
}