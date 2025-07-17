import { useState, useEffect, useCallback } from 'react';
import { apiService, SystemMetrics } from '@/services/api';

interface UseSystemMetricsOptions {
  refreshInterval?: number;
  enableRealtime?: boolean;
  timeRange?: string;
}

interface UseSystemMetricsReturn {
  metrics: SystemMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isOnline: boolean;
}

/**
 * Hook for managing system metrics data with real-time updates
 */
export function useSystemMetrics(options: UseSystemMetricsOptions = {}): UseSystemMetricsReturn {
  const {
    refreshInterval = 30000, // 30 seconds default
    enableRealtime = true,
    timeRange = '24h'
  } = options;

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Fetch metrics from API
  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await apiService.getSystemMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
      setIsOnline(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      setIsOnline(false);
      console.error('Error fetching system metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchMetrics();
  }, [fetchMetrics]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    if (!data.type || !data.payload) return;

    switch (data.type) {
      case 'metric_update':
        // Update specific metric in current state
        setMetrics(current => {
          if (!current) return current;
          
          const { metric_name, metric_value } = data.payload;
          const updated = { ...current };
          
          // Update relevant metric based on name
          if (metric_name.includes('success_rate')) {
            updated.performance.successRate = metric_value;
          } else if (metric_name.includes('execution_time')) {
            updated.performance.avgExecutionTime = metric_value;
          } else if (metric_name.includes('context')) {
            updated.optimization.contextReduction = metric_value;
          }
          
          return updated;
        });
        setLastUpdated(new Date());
        break;

      case 'system_health':
        // Trigger full refresh on health changes
        fetchMetrics();
        break;

      case 'command_update':
        // Update command metrics
        setMetrics(current => {
          if (!current) return current;
          
          const updated = { ...current };
          if (data.payload.type === 'execution') {
            updated.performance.totalExecutions += 1;
          }
          
          return updated;
        });
        break;

      case 'connection':
        console.log('WebSocket connected:', data.payload.message);
        setIsOnline(true);
        break;

      default:
        // Ignore unknown message types
        break;
    }
  }, [fetchMetrics]);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const ws = apiService.createWebSocketConnection(
      handleWebSocketMessage,
      (error) => {
        console.error('WebSocket error:', error);
        setIsOnline(false);
      }
    );

    if (ws) {
      setWsConnection(ws);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [enableRealtime, handleWebSocketMessage]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchMetrics();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, refreshInterval]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchMetrics();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refresh,
    isOnline
  };
}

export default useSystemMetrics;