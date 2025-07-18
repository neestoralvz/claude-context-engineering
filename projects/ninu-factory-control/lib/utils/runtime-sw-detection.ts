/**
 * Runtime Service Worker Detection Utility
 * 
 * Provides real-time detection and monitoring of Service Worker changes
 * in the Ninu Factory Control system.
 */

export interface ServiceWorkerDetectionConfig {
  pollInterval?: number; // milliseconds
  enableAutoReload?: boolean;
  enableNotifications?: boolean;
  debug?: boolean;
}

export interface ServiceWorkerEvent {
  type: 'registered' | 'updated' | 'unregistered' | 'error' | 'controlling' | 'activated';
  timestamp: Date;
  details?: any;
  registration?: ServiceWorkerRegistration;
}

export type ServiceWorkerEventHandler = (event: ServiceWorkerEvent) => void;

export interface RuntimeServiceWorkerState {
  isMonitoring: boolean;
  detectedServiceWorkers: Map<string, ServiceWorkerRegistration>;
  lastUpdate: Date | null;
  eventLog: ServiceWorkerEvent[];
  performanceMetrics: {
    fetchCount: number;
    cacheHitRatio: number;
    avgResponseTime: number;
  };
  conflicts: ServiceWorkerConflict[];
}

export interface ServiceWorkerConflict {
  type: 'scope' | 'version' | 'capability';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRegistrations: ServiceWorkerRegistration[];
}

export class RuntimeServiceWorkerDetection {
  private config: Required<ServiceWorkerDetectionConfig>;
  private eventHandlers: Map<string, ServiceWorkerEventHandler[]> = new Map();
  private state: RuntimeServiceWorkerState;
  private pollTimer?: NodeJS.Timeout;
  private observers: ((state: RuntimeServiceWorkerState) => void)[] = [];

  constructor(config: ServiceWorkerDetectionConfig = {}) {
    this.config = {
      pollInterval: config.pollInterval || 5000,
      enableAutoReload: config.enableAutoReload ?? false,
      enableNotifications: config.enableNotifications ?? true,
      debug: config.debug ?? false
    };

    this.state = {
      isMonitoring: false,
      detectedServiceWorkers: new Map(),
      lastUpdate: null,
      eventLog: [],
      performanceMetrics: {
        fetchCount: 0,
        cacheHitRatio: 0,
        avgResponseTime: 0
      },
      conflicts: []
    };
  }

  getState(): RuntimeServiceWorkerState {
    return { ...this.state };
  }

  start(): void {
    this.startMonitoring();
  }

  stop(): void {
    this.stopMonitoring();
  }

  subscribe(observer: (state: RuntimeServiceWorkerState) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index !== -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer(this.getState());
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    });
  }

  /**
   * Start monitoring for Service Worker changes
   */
  async startMonitoring(): Promise<void> {
    if (this.state.isMonitoring) {
      this.debug('Already monitoring Service Workers');
      return;
    }

    if (!this.isServiceWorkerSupported()) {
      this.debug('Service Workers not supported, skipping monitoring');
      return;
    }

    this.state.isMonitoring = true;
    this.state.lastUpdate = new Date();
    this.debug('Starting Service Worker monitoring');

    // Set up event listeners
    this.setupEventListeners();

    // Start polling for changes
    this.startPolling();

    // Initial registration check
    await this.checkRegistration();
    
    this.notifyObservers();
  }

  /**
   * Stop monitoring Service Worker changes
   */
  stopMonitoring(): void {
    if (!this.state.isMonitoring) {
      return;
    }

    this.state.isMonitoring = false;
    this.debug('Stopping Service Worker monitoring');

    // Clear polling timer
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }

    // Remove event listeners
    this.removeEventListeners();
    
    this.notifyObservers();
  }

  /**
   * Register an event handler for Service Worker events
   */
  on(eventType: ServiceWorkerEvent['type'], handler: ServiceWorkerEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove an event handler
   */
  off(eventType: ServiceWorkerEvent['type'], handler: ServiceWorkerEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Manually check for Service Worker registration changes
   */
  async checkRegistration(): Promise<ServiceWorkerRegistration | null> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const currentSWs = this.state.detectedServiceWorkers;

      if (registration) {
        const existingKey = Array.from(currentSWs.keys()).find(key => 
          currentSWs.get(key)?.scope === registration.scope
        );

        if (!existingKey) {
          // New registration detected
          this.state.detectedServiceWorkers.set(registration.scope, registration);
          this.emitEvent({
            type: 'registered',
            timestamp: new Date(),
            registration
          });
        }
      }

      this.state.lastUpdate = new Date();
      this.notifyObservers();
      return registration || null;
    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Force reload the page if Service Worker updated
   */
  async reloadIfUpdated(): Promise<boolean> {
    const registration = await this.checkRegistration();
    
    if (registration?.waiting) {
      if (this.config.enableAutoReload) {
        this.debug('Service Worker updated, reloading page...');
        window.location.reload();
        return true;
      } else {
        this.debug('Service Worker updated but auto-reload is disabled');
        this.emitEvent({
          type: 'updated',
          timestamp: new Date(),
          registration,
          details: { autoReloadDisabled: true }
        });
      }
    }

    return false;
  }

  /**
   * Get current Service Worker status
   */
  async getStatus(): Promise<{
    supported: boolean;
    registered: boolean;
    active: boolean;
    waiting: boolean;
    controlling: boolean;
  }> {
    const registration = await this.checkRegistration();

    return {
      supported: this.isServiceWorkerSupported(),
      registered: registration !== null,
      active: registration?.active !== null,
      waiting: registration?.waiting !== null,
      controlling: navigator.serviceWorker.controller !== null
    };
  }

  private setupEventListeners(): void {
    if (!this.isServiceWorkerSupported()) return;

    // Listen for Service Worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', this.handleControllerChange);

    // Listen for messages from Service Worker
    navigator.serviceWorker.addEventListener('message', this.handleMessage);
  }

  private removeEventListeners(): void {
    if (!this.isServiceWorkerSupported()) return;

    navigator.serviceWorker.removeEventListener('controllerchange', this.handleControllerChange);
    navigator.serviceWorker.removeEventListener('message', this.handleMessage);
  }

  private handleControllerChange = (): void => {
    this.debug('Service Worker controller changed');
    this.emitEvent({
      type: 'controlling',
      timestamp: new Date(),
      details: { 
        hasController: navigator.serviceWorker.controller !== null 
      }
    });

    // Check if we should reload
    if (this.config.enableAutoReload) {
      this.debug('Auto-reloading due to controller change...');
      window.location.reload();
    }
  };

  private handleMessage = (event: MessageEvent): void => {
    this.debug('Received message from Service Worker:', event.data);
    
    // Handle specific Service Worker messages
    if (event.data?.type === 'SW_ACTIVATED') {
      this.emitEvent({
        type: 'activated',
        timestamp: new Date(),
        details: event.data
      });
    }
  };

  private startPolling(): void {
    this.pollTimer = setInterval(() => {
      this.checkRegistration();
    }, this.config.pollInterval);
  }

  private emitEvent(event: ServiceWorkerEvent): void {
    // Add to event log with limit
    this.state.eventLog.push(event);
    if (this.state.eventLog.length > 100) {
      this.state.eventLog.shift(); // Remove oldest event
    }

    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in Service Worker event handler for ${event.type}:`, error);
        }
      });
    }

    this.debug(`Service Worker event: ${event.type}`, event);

    // Show notification if enabled
    if (this.config.enableNotifications && 'Notification' in window) {
      this.showNotification(event);
    }

    this.notifyObservers();
  }

  private showNotification(event: ServiceWorkerEvent): void {
    if (Notification.permission !== 'granted') return;

    const notifications: Record<ServiceWorkerEvent['type'], { title: string; body: string }> = {
      registered: {
        title: 'Service Worker Registered',
        body: 'Factory Control system is now available offline'
      },
      updated: {
        title: 'Factory Control Updated',
        body: 'A new version is available. Reload to update.'
      },
      unregistered: {
        title: 'Service Worker Unregistered',
        body: 'Offline functionality is no longer available'
      },
      error: {
        title: 'Service Worker Error',
        body: 'There was an issue with the Service Worker'
      },
      controlling: {
        title: 'Service Worker Active',
        body: 'Factory Control is now under Service Worker control'
      },
      activated: {
        title: 'Service Worker Activated',
        body: 'New Service Worker version is now active'
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

  private isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  private debug(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[SW Detection] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const runtimeServiceWorkerDetection = new RuntimeServiceWorkerDetection();

// Export utility functions
export const startMonitoring = (config?: ServiceWorkerDetectionConfig) => {
  const detector = new RuntimeServiceWorkerDetection(config);
  detector.startMonitoring();
  return detector;
};

export const checkServiceWorkerStatus = async () => {
  const detector = new RuntimeServiceWorkerDetection();
  return detector.getStatus();
};