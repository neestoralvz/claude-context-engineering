/**
 * Service Worker Diagnostics Utility
 * 
 * Provides comprehensive diagnostics for Service Worker functionality
 * in the Ninu Factory Control system.
 */

export interface ServiceWorkerDiagnostics {
  isSupported: boolean;
  isActive: boolean;
  registration: ServiceWorkerRegistration | null;
  state: ServiceWorkerState | 'not-supported';
  scope: string | null;
  updateAvailable: boolean;
  lastUpdateCheck: Date | null;
  errors: string[];
  warnings: string[];
}

export interface DiagnosticTest {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

export class ServiceWorkerDiagnosticsProvider {
  private registration: ServiceWorkerRegistration | null = null;
  private lastCheck: Date | null = null;

  async runDiagnostics(): Promise<ServiceWorkerDiagnostics> {
    const diagnostics: ServiceWorkerDiagnostics = {
      isSupported: this.isServiceWorkerSupported(),
      isActive: false,
      registration: null,
      state: 'not-supported',
      scope: null,
      updateAvailable: false,
      lastUpdateCheck: null,
      errors: [],
      warnings: []
    };

    if (!diagnostics.isSupported) {
      diagnostics.errors.push('Service Workers are not supported in this browser');
      return diagnostics;
    }

    try {
      this.registration = (await navigator.serviceWorker.getRegistration()) || null;
      diagnostics.registration = this.registration;

      if (this.registration) {
        diagnostics.isActive = this.registration.active !== null;
        diagnostics.state = this.registration.active?.state || 'not-supported';
        diagnostics.scope = this.registration.scope;
        diagnostics.updateAvailable = this.registration.waiting !== null;
      }

      this.lastCheck = new Date();
      diagnostics.lastUpdateCheck = this.lastCheck;

      // Run additional diagnostic tests
      const tests = await this.runDiagnosticTests();
      for (const test of tests) {
        if (test.status === 'failed') {
          diagnostics.errors.push(`${test.name}: ${test.message}`);
        } else if (test.status === 'warning') {
          diagnostics.warnings.push(`${test.name}: ${test.message}`);
        }
      }

    } catch (error) {
      diagnostics.errors.push(`Failed to get Service Worker registration: ${error}`);
    }

    return diagnostics;
  }

  async runDiagnosticTests(): Promise<DiagnosticTest[]> {
    const tests: DiagnosticTest[] = [];

    // Test 1: Service Worker Support
    tests.push({
      name: 'Service Worker Support',
      status: this.isServiceWorkerSupported() ? 'passed' : 'failed',
      message: this.isServiceWorkerSupported() 
        ? 'Service Workers are supported'
        : 'Service Workers are not supported in this browser'
    });

    // Test 2: HTTPS/Localhost Check
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    tests.push({
      name: 'Secure Context',
      status: isSecure ? 'passed' : 'failed',
      message: isSecure 
        ? 'Running in secure context (HTTPS or localhost)'
        : 'Service Workers require HTTPS or localhost'
    });

    // Test 3: Registration Status
    if (this.registration) {
      tests.push({
        name: 'Service Worker Registration',
        status: 'passed',
        message: 'Service Worker is registered',
        details: {
          scope: this.registration.scope,
          updateViaCache: this.registration.updateViaCache
        }
      });

      // Test 4: Active Service Worker
      if (this.registration.active) {
        tests.push({
          name: 'Active Service Worker',
          status: 'passed',
          message: `Service Worker is active (${this.registration.active.state})`,
          details: {
            scriptURL: this.registration.active.scriptURL,
            state: this.registration.active.state
          }
        });
      } else {
        tests.push({
          name: 'Active Service Worker',
          status: 'warning',
          message: 'No active Service Worker found'
        });
      }

      // Test 5: Update Check
      if (this.registration.waiting) {
        tests.push({
          name: 'Update Available',
          status: 'warning',
          message: 'Service Worker update is waiting'
        });
      }
    } else {
      tests.push({
        name: 'Service Worker Registration',
        status: 'failed',
        message: 'No Service Worker registration found'
      });
    }

    return tests;
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return this.registration.waiting !== null;
    } catch (error) {
      console.warn('Failed to check for Service Worker updates:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      return await this.registration.unregister();
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
      return false;
    }
  }

  private isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  formatDiagnosticsReport(diagnostics: ServiceWorkerDiagnostics): string {
    let report = '=== Service Worker Diagnostics Report ===\n\n';
    
    report += `Supported: ${diagnostics.isSupported ? '✅' : '❌'}\n`;
    report += `Active: ${diagnostics.isActive ? '✅' : '❌'}\n`;
    report += `State: ${diagnostics.state}\n`;
    report += `Scope: ${diagnostics.scope || 'N/A'}\n`;
    report += `Update Available: ${diagnostics.updateAvailable ? '⚠️' : '✅'}\n`;
    report += `Last Check: ${diagnostics.lastUpdateCheck?.toISOString() || 'Never'}\n\n`;

    if (diagnostics.errors.length > 0) {
      report += '❌ Errors:\n';
      diagnostics.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
      report += '\n';
    }

    if (diagnostics.warnings.length > 0) {
      report += '⚠️ Warnings:\n';
      diagnostics.warnings.forEach(warning => {
        report += `  - ${warning}\n`;
      });
      report += '\n';
    }

    return report;
  }
}

// Export singleton instance
export const serviceWorkerDiagnostics = new ServiceWorkerDiagnosticsProvider();

// Export utility functions
export const getDiagnostics = () => serviceWorkerDiagnostics.runDiagnostics();
export const checkForUpdates = () => serviceWorkerDiagnostics.checkForUpdates();
export const unregisterServiceWorker = () => serviceWorkerDiagnostics.unregister();