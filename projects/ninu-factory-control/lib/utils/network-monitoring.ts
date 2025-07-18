/**
 * Network Monitoring Utility
 * 
 * Provides comprehensive network monitoring and connection management
 * for the Ninu Factory Control system.
 */

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
  timestamp: Date;
}

export interface ConnectionInfo {
  type: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export type ConnectionType = 
  | 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export interface NetworkEvent {
  type: 'online' | 'offline' | 'connection-change' | 'slow-connection' | 'fast-connection';
  timestamp: Date;
  previousStatus?: NetworkStatus;
  currentStatus: NetworkStatus;
  details?: any;
}

export type NetworkEventHandler = (event: NetworkEvent) => void;

export interface NetworkMonitoringConfig {
  enableConnectionTracking?: boolean;
  slowConnectionThreshold?: number; // Mbps
  fastConnectionThreshold?: number; // Mbps
  rttThreshold?: number; // milliseconds
  checkInterval?: number; // milliseconds
  enableNotifications?: boolean;
  debug?: boolean;
}

export class NetworkMonitor {
  private config: Required<NetworkMonitoringConfig>;
  private eventHandlers: Map<string, NetworkEventHandler[]> = new Map();
  private isMonitoring = false;
  private lastStatus: NetworkStatus | null = null;
  private checkTimer?: NodeJS.Timeout;

  constructor(config: NetworkMonitoringConfig = {}) {
    this.config = {
      enableConnectionTracking: config.enableConnectionTracking ?? true,
      slowConnectionThreshold: config.slowConnectionThreshold ?? 1.0,
      fastConnectionThreshold: config.fastConnectionThreshold ?? 10.0,
      rttThreshold: config.rttThreshold ?? 1000,
      checkInterval: config.checkInterval ?? 30000,
      enableNotifications: config.enableNotifications ?? true,
      debug: config.debug ?? false
    };
  }

  /**
   * Start network monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      this.debug('Already monitoring network status');
      return;
    }

    this.isMonitoring = true;
    this.debug('Starting network monitoring');

    // Set up event listeners
    this.setupEventListeners();

    // Start periodic checks
    this.startPeriodicChecks();

    // Initial status check
    this.checkNetworkStatus();
  }

  /**
   * Stop network monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    this.debug('Stopping network monitoring');

    // Clear timer
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = undefined;
    }

    // Remove event listeners
    this.removeEventListeners();
  }

  /**
   * Get current network status
   */
  async getCurrentStatus(): Promise<NetworkStatus> {
    const status: NetworkStatus = {
      isOnline: navigator.onLine,
      connectionType: this.getConnectionType(),
      effectiveType: this.getEffectiveConnectionType(),
      downlink: this.getDownlink(),
      rtt: this.getRTT(),
      saveData: this.getSaveData(),
      timestamp: new Date()
    };

    return status;
  }

  /**
   * Test network connection with a ping
   */
  async testConnection(url: string = '/api/health', timeout: number = 5000): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      const responseTime = performance.now() - startTime;

      return {
        success: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if connection is slow based on configured thresholds
   */
  isConnectionSlow(status?: NetworkStatus): boolean {
    const currentStatus = status || this.lastStatus;
    if (!currentStatus) return false;

    return (
      currentStatus.downlink < this.config.slowConnectionThreshold ||
      currentStatus.rtt > this.config.rttThreshold ||
      currentStatus.effectiveType === 'slow-2g' ||
      currentStatus.effectiveType === '2g'
    );
  }

  /**
   * Check if connection is fast based on configured thresholds
   */
  isConnectionFast(status?: NetworkStatus): boolean {
    const currentStatus = status || this.lastStatus;
    if (!currentStatus) return false;

    return (
      currentStatus.downlink >= this.config.fastConnectionThreshold &&
      currentStatus.rtt < 500 &&
      currentStatus.effectiveType === '4g'
    );
  }

  /**
   * Get connection quality assessment
   */
  getConnectionQuality(status?: NetworkStatus): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
    const currentStatus = status || this.lastStatus;
    
    if (!currentStatus || !currentStatus.isOnline) {
      return 'offline';
    }

    if (this.isConnectionFast(currentStatus)) {
      return 'excellent';
    }

    if (currentStatus.downlink >= 5 && currentStatus.rtt < 800) {
      return 'good';
    }

    if (currentStatus.downlink >= 1.5 && currentStatus.rtt < 1500) {
      return 'fair';
    }

    return 'poor';
  }

  /**
   * Register an event handler
   */
  on(eventType: NetworkEvent['type'], handler: NetworkEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove an event handler
   */
  off(eventType: NetworkEvent['type'], handler: NetworkEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Listen for connection changes if supported
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', this.handleConnectionChange);
    }
  }

  private removeEventListeners(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if ('connection' in navigator) {
      (navigator as any).connection?.removeEventListener('change', this.handleConnectionChange);
    }
  }

  private handleOnline = (): void => {
    this.debug('Network came online');
    this.checkNetworkStatus();
  };

  private handleOffline = (): void => {
    this.debug('Network went offline');
    this.checkNetworkStatus();
  };

  private handleConnectionChange = (): void => {
    this.debug('Network connection changed');
    this.checkNetworkStatus();
  };

  private startPeriodicChecks(): void {
    this.checkTimer = setInterval(() => {
      this.checkNetworkStatus();
    }, this.config.checkInterval);
  }

  private async checkNetworkStatus(): Promise<void> {
    try {
      const currentStatus = await this.getCurrentStatus();
      
      if (this.lastStatus) {
        this.compareAndEmitEvents(this.lastStatus, currentStatus);
      } else {
        // First check
        const eventType = currentStatus.isOnline ? 'online' : 'offline';
        this.emitEvent({
          type: eventType,
          timestamp: currentStatus.timestamp,
          currentStatus
        });
      }

      this.lastStatus = currentStatus;
    } catch (error) {
      this.debug('Error checking network status:', error);
    }
  }

  private compareAndEmitEvents(previous: NetworkStatus, current: NetworkStatus): void {
    // Check for online/offline changes
    if (previous.isOnline !== current.isOnline) {
      const eventType = current.isOnline ? 'online' : 'offline';
      this.emitEvent({
        type: eventType,
        timestamp: current.timestamp,
        previousStatus: previous,
        currentStatus: current
      });
    }

    // Check for connection type changes
    if (previous.connectionType !== current.connectionType || 
        previous.effectiveType !== current.effectiveType) {
      this.emitEvent({
        type: 'connection-change',
        timestamp: current.timestamp,
        previousStatus: previous,
        currentStatus: current,
        details: {
          from: {
            type: previous.connectionType,
            effectiveType: previous.effectiveType
          },
          to: {
            type: current.connectionType,
            effectiveType: current.effectiveType
          }
        }
      });
    }

    // Check for speed changes
    const wasSlowConnection = this.isConnectionSlow(previous);
    const isSlowConnection = this.isConnectionSlow(current);
    const wasFastConnection = this.isConnectionFast(previous);
    const isFastConnection = this.isConnectionFast(current);

    if (!wasSlowConnection && isSlowConnection) {
      this.emitEvent({
        type: 'slow-connection',
        timestamp: current.timestamp,
        previousStatus: previous,
        currentStatus: current
      });
    }

    if (!wasFastConnection && isFastConnection) {
      this.emitEvent({
        type: 'fast-connection',
        timestamp: current.timestamp,
        previousStatus: previous,
        currentStatus: current
      });
    }
  }

  private emitEvent(event: NetworkEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in network event handler for ${event.type}:`, error);
        }
      });
    }

    this.debug(`Network event: ${event.type}`, event);

    // Show notification if enabled
    if (this.config.enableNotifications) {
      this.showNotification(event);
    }
  }

  private showNotification(event: NetworkEvent): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notifications: Record<NetworkEvent['type'], { title: string; body: string }> = {
      online: {
        title: 'Connection Restored',
        body: 'Factory Control is back online'
      },
      offline: {
        title: 'Connection Lost',
        body: 'Factory Control is working offline'
      },
      'connection-change': {
        title: 'Connection Changed',
        body: 'Network connection type has changed'
      },
      'slow-connection': {
        title: 'Slow Connection',
        body: 'Network connection is slow. Some features may be limited.'
      },
      'fast-connection': {
        title: 'Fast Connection',
        body: 'Network connection improved. All features available.'
      }
    };

    const notification = notifications[event.type];
    if (notification) {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  private getConnectionType(): ConnectionType {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.type || 'unknown';
    }
    return 'unknown';
  }

  private getEffectiveConnectionType(): EffectiveConnectionType {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || '4g';
    }
    return '4g';
  }

  private getDownlink(): number {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.downlink || 10;
    }
    return 10;
  }

  private getRTT(): number {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.rtt || 100;
    }
    return 100;
  }

  private getSaveData(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.saveData || false;
    }
    return false;
  }

  private debug(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[Network Monitor] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();

// Export utility functions
export const startNetworkMonitoring = (config?: NetworkMonitoringConfig) => {
  const monitor = new NetworkMonitor(config);
  monitor.startMonitoring();
  return monitor;
};

export const getCurrentNetworkStatus = async () => {
  const monitor = new NetworkMonitor();
  return monitor.getCurrentStatus();
};

export const testNetworkConnection = async (url?: string, timeout?: number) => {
  const monitor = new NetworkMonitor();
  return monitor.testConnection(url, timeout);
};