'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  serviceWorkerDiagnostics, 
  type ServiceWorkerDiagnostics 
} from '../../lib/utils/service-worker-diagnostics';
import { 
  runtimeServiceWorkerDetection,
  type ServiceWorkerEvent 
} from '../../lib/utils/runtime-sw-detection';
import { 
  factoryControlResolver,
  type ConflictResolutionReport 
} from '../../lib/utils/sw-conflict-resolver';
import { 
  networkMonitor,
  type NetworkStatus 
} from '../../lib/utils/network-monitoring';
import { AlertCircle, CheckCircle, WifiOff, Wifi, RefreshCw, Settings } from 'lucide-react';

interface ServiceWorkerStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ServiceWorkerStatusIndicator({
  className = '',
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 30000
}: ServiceWorkerStatusIndicatorProps) {
  const [diagnostics, setDiagnostics] = useState<ServiceWorkerDiagnostics | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [conflictReport, setConflictReport] = useState<ConflictResolutionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDetailsPanel, setShowDetailsPanel] = useState(showDetails);

  const refreshStatus = useCallback(async () => {
    try {
      // Fetch diagnostics
      const newDiagnostics = await serviceWorkerDiagnostics.runDiagnostics();
      setDiagnostics(newDiagnostics);

      // Fetch network status
      const newNetworkStatus = await networkMonitor.getCurrentStatus();
      setNetworkStatus(newNetworkStatus);

      // Check for conflicts
      const newConflictReport = await factoryControlResolver.autoResolve();
      setConflictReport(newConflictReport);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh Service Worker status:', error);
    }
  }, []);

  const handleServiceWorkerEvent = useCallback((event: ServiceWorkerEvent) => {
    console.log('Service Worker event:', event);
    // Refresh status when Service Worker changes
    refreshStatus();
  }, [refreshStatus]);

  const handleNetworkEvent = useCallback(() => {
    // Refresh status when network changes
    refreshStatus();
  }, [refreshStatus]);

  const initializeMonitoring = useCallback(async () => {
    try {
      setIsLoading(true);

      // Start monitoring services
      runtimeServiceWorkerDetection.startMonitoring();
      networkMonitor.startMonitoring();

      // Set up event listeners
      runtimeServiceWorkerDetection.on('updated', handleServiceWorkerEvent);
      runtimeServiceWorkerDetection.on('error', handleServiceWorkerEvent);
      runtimeServiceWorkerDetection.on('registered', handleServiceWorkerEvent);

      networkMonitor.on('online', handleNetworkEvent);
      networkMonitor.on('offline', handleNetworkEvent);
      networkMonitor.on('connection-change', handleNetworkEvent);

      // Initial status fetch
      await refreshStatus();
    } catch (error) {
      console.error('Failed to initialize Service Worker monitoring:', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleNetworkEvent, handleServiceWorkerEvent, refreshStatus]);

  // Initialize monitoring and fetch initial status
  useEffect(() => {
    initializeMonitoring();
    
    if (autoRefresh) {
      const interval = setInterval(refreshStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, initializeMonitoring, refreshStatus]);

  const handleResolveConflicts = async () => {
    try {
      setIsLoading(true);
      const report = await factoryControlResolver.autoResolve();
      setConflictReport(report);
      
      // Refresh diagnostics after conflict resolution
      await refreshStatus();
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallStatus = (): 'healthy' | 'warning' | 'error' | 'offline' => {
    if (!networkStatus?.isOnline) return 'offline';
    if (!diagnostics) return 'error';
    
    if (diagnostics.errors.length > 0) return 'error';
    if (diagnostics.warnings.length > 0 || (conflictReport && conflictReport.conflictsDetected > 0)) return 'warning';
    if (diagnostics.isSupported && diagnostics.isActive) return 'healthy';
    
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'error': return 'bg-red-500 text-white';
      case 'offline': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Sistema Operativo';
      case 'warning': return 'Advertencias Detectadas';
      case 'error': return 'Errores Críticos';
      case 'offline': return 'Sin Conexión';
      default: return 'Estado Desconocido';
    }
  };

  if (isLoading && !diagnostics) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Verificando sistema...</span>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Status Indicator */}
      <div className="flex items-center space-x-2">
        <Badge className={`flex items-center space-x-1 ${getStatusColor(overallStatus)}`}>
          {getStatusIcon(overallStatus)}
          <span>{getStatusText(overallStatus)}</span>
        </Badge>
        
        {networkStatus && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            {networkStatus.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{networkStatus.isOnline ? 'Online' : 'Offline'}</span>
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetailsPanel(!showDetailsPanel)}
          className="p-1"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Details Panel */}
      {showDetailsPanel && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Diagnóstico del Sistema</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStatus}
                disabled={isLoading}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <span className="text-xs text-gray-500">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Service Worker Status */}
          {diagnostics && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700">Service Worker</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Soporte:</span>
                  <Badge variant={diagnostics.isSupported ? 'default' : 'destructive'}>
                    {diagnostics.isSupported ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Activo:</span>
                  <Badge variant={diagnostics.isActive ? 'default' : 'secondary'}>
                    {diagnostics.isActive ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <Badge variant="secondary">{diagnostics.state}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Actualización:</span>
                  <Badge variant={diagnostics.updateAvailable ? 'destructive' : 'default'}>
                    {diagnostics.updateAvailable ? 'Disponible' : 'Al día'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Network Status */}
          {networkStatus && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700">Red</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Conexión:</span>
                  <Badge variant={networkStatus.isOnline ? 'default' : 'destructive'}>
                    {networkStatus.connectionType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Velocidad:</span>
                  <Badge variant="secondary">{networkStatus.effectiveType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Descarga:</span>
                  <span className="font-mono">{networkStatus.downlink.toFixed(1)} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Latencia:</span>
                  <span className="font-mono">{networkStatus.rtt} ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Conflicts */}
          {conflictReport && conflictReport.conflictsDetected > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-xs text-gray-700">Conflictos</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolveConflicts}
                  disabled={isLoading}
                >
                  Resolver
                </Button>
              </div>
              <div className="space-y-1">
                {conflictReport.actions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate">{action.description}</span>
                    <Badge variant={
                      action.result === 'failed' ? 'destructive' :
                      action.result === 'success' ? 'default' : 'secondary'
                    }>
                      {action.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors and Warnings */}
          {diagnostics && (diagnostics.errors.length > 0 || diagnostics.warnings.length > 0) && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-gray-700">Mensajes</h4>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {diagnostics.errors.map((error, index) => (
                  <div key={`error-${index}`} className="text-xs text-red-600 bg-red-50 p-1 rounded">
                    ❌ {error}
                  </div>
                ))}
                {diagnostics.warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="text-xs text-yellow-600 bg-yellow-50 p-1 rounded">
                    ⚠️ {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default ServiceWorkerStatusIndicator;