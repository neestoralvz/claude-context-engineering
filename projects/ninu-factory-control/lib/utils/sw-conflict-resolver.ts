/**
 * Service Worker Conflict Resolver Utility
 * 
 * Handles conflicts between Service Workers and provides resolution strategies
 * for the Ninu Factory Control system.
 */

export interface ConflictResolutionReport {
  timestamp: Date;
  conflictsDetected: number;
  conflictsResolved: number;
  conflictsFailed: number;
  strategies: StrategyUsage[];
  actions: ResolutionAction[];
  warnings: string[];
  errors: string[];
  requiresManualIntervention: boolean;
  backupData?: BackupData;
}

export interface StrategyUsage {
  strategy: string;
  applied: number;
  successful: number;
  failed: number;
}

export interface BackupData {
  registrations: ServiceWorkerRegistration[];
  caches: string[];
  timestamp: Date;
}

export interface ServiceWorkerConflict {
  type: 'duplicate-scope' | 'version-mismatch' | 'cache-conflict' | 'script-error' | 'scope-overlap' | 'update-pending' | 'cache-mismatch' | 'network-fallback';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRegistrations: string[];
  resolution: string;
  autoResolvable: boolean;
  affectedScopes?: string[];
  registrations?: ServiceWorkerRegistration[];
  metadata?: any;
}

export interface ResolutionStrategy {
  name: string;
  description: string;
  actions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  requiresUserConsent: boolean;
  autoApplicable: boolean;
}

export interface ResolutionAction {
  type: 'unregister' | 'skip-waiting' | 'clear-cache' | 'reload-page' | 'user-prompt';
  target?: string;
  description: string;
  result: 'success' | 'failed' | 'skipped';
  error?: string;
  timestamp: Date;
}

export interface UserPreferences {
  autoResolveLevel: 'conservative' | 'moderate' | 'aggressive';
  allowUnregistration: boolean;
  allowCacheClear: boolean;
  allowPageReload: boolean;
  preserveUserData: boolean;
  backupBeforeChanges: boolean;
}

export interface ResolutionContext {
  userPreferences: UserPreferences;
  environmentType: 'development' | 'staging' | 'production';
  criticalOperations: boolean;
  lastResolutionTime?: Date;
}

export interface ConflictResolutionStrategy {
  id: string;
  name: string;
  description: string;
  applicableConflictTypes: string[];
  severity: 'conservative' | 'moderate' | 'aggressive';
  requiresUserConfirmation: boolean;
  resolve: (conflicts: ServiceWorkerConflict[], context: ResolutionContext) => Promise<{
    success: boolean;
    actions: ResolutionAction[];
    warnings: string[];
    errors: string[];
    requiresReload: boolean;
  }>;
}

export class ServiceWorkerConflictResolver {
  private userPreferences: UserPreferences;
  private context?: ResolutionContext;
  private strategies: Map<string, ConflictResolutionStrategy> = new Map();
  private resolutionHistory: ConflictResolutionReport[] = [];
  private readonly maxHistorySize = 10;

  constructor(preferencesOrContext?: UserPreferences | ResolutionContext) {
    if (!preferencesOrContext) {
      // Default preferences
      this.userPreferences = {
        autoResolveLevel: 'conservative',
        allowUnregistration: true,
        allowCacheClear: true,
        allowPageReload: false,
        preserveUserData: true,
        backupBeforeChanges: true
      };
    } else if ('userPreferences' in preferencesOrContext) {
      // ResolutionContext passed
      this.context = preferencesOrContext;
      this.userPreferences = preferencesOrContext.userPreferences;
    } else {
      // UserPreferences passed directly
      this.userPreferences = preferencesOrContext;
    }

    this.initializeBuiltInStrategies();
  }

  private initializeBuiltInStrategies(): void {
    // Duplicate scope resolver
    this.strategies.set('duplicate-scope-resolver', {
      id: 'duplicate-scope-resolver',
      name: 'Duplicate Scope Resolver',
      description: 'Resolves conflicts when multiple service workers have overlapping scopes',
      applicableConflictTypes: ['duplicate-scope'],
      severity: 'moderate',
      requiresUserConfirmation: false,
      resolve: async (conflicts, context) => this.resolveDuplicateScope(conflicts, context)
    });

    // Version mismatch resolver
    this.strategies.set('version-mismatch-resolver', {
      id: 'version-mismatch-resolver',
      name: 'Version Mismatch Resolver',
      description: 'Resolves conflicts between different service worker versions',
      applicableConflictTypes: ['version-mismatch'],
      severity: 'conservative',
      requiresUserConfirmation: false,
      resolve: async (conflicts, context) => this.resolveVersionMismatch(conflicts, context)
    });

    // Cache conflict resolver
    this.strategies.set('cache-conflict-resolver', {
      id: 'cache-conflict-resolver',
      name: 'Cache Conflict Resolver',
      description: 'Resolves cache-related conflicts and orphaned caches',
      applicableConflictTypes: ['cache-conflict'],
      severity: 'moderate',
      requiresUserConfirmation: true,
      resolve: async (conflicts, context) => this.resolveCacheConflict(conflicts, context)
    });

    // Script error resolver
    this.strategies.set('script-error-resolver', {
      id: 'script-error-resolver',
      name: 'Script Error Resolver',
      description: 'Resolves service worker script loading errors',
      applicableConflictTypes: ['script-error'],
      severity: 'moderate',
      requiresUserConfirmation: false,
      resolve: async (conflicts, context) => this.resolveScriptError(conflicts, context)
    });
  }

  getUserPreferences(): UserPreferences {
    return this.userPreferences;
  }

  getStrategies(): ConflictResolutionStrategy[] {
    return Array.from(this.strategies.values());
  }

  registerStrategy(strategy: ConflictResolutionStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  unregisterStrategy(strategyId: string): boolean {
    return this.strategies.delete(strategyId);
  }

  /**
   * Scan for Service Worker conflicts
   */
  async scanForConflicts(): Promise<ServiceWorkerConflict[]> {
    const conflicts: ServiceWorkerConflict[] = [];

    try {
      // Get all registrations
      const registrations = await this.getAllRegistrations();

      // Check for multiple registrations
      if (registrations.length > 1) {
        const conflict = await this.detectMultipleRegistrations(registrations);
        if (conflict) conflicts.push(conflict);
      }

      // Check for scope overlaps
      const scopeConflicts = await this.detectScopeOverlaps(registrations);
      conflicts.push(...scopeConflicts);

      // Check for pending updates
      const updateConflicts = await this.detectPendingUpdates(registrations);
      conflicts.push(...updateConflicts);

      // Check for cache mismatches
      const cacheConflicts = await this.detectCacheMismatches();
      conflicts.push(...cacheConflicts);

      // Check for network fallback issues
      const networkConflicts = await this.detectNetworkFallbackIssues(registrations);
      conflicts.push(...networkConflicts);

    } catch (error) {
      console.error('Error scanning for Service Worker conflicts:', error);
    }

    return conflicts.filter(conflict => conflict !== null);
  }

  /**
   * Resolve detected conflicts
   */
  async resolveConflicts(conflicts: ServiceWorkerConflict[]): Promise<ConflictResolutionReport> {
    const report: ConflictResolutionReport = {
      timestamp: new Date(),
      conflictsDetected: conflicts.length,
      conflictsResolved: 0,
      conflictsFailed: 0,
      strategies: [],
      actions: [],
      warnings: [],
      errors: [],
      requiresManualIntervention: false
    };

    // Create backup if enabled
    if (this.userPreferences.backupBeforeChanges) {
      try {
        report.backupData = await this.createBackup();
      } catch (error) {
        console.warn('Failed to create backup:', error);
      }
    }

    if (conflicts.length === 0) {
      this.addToHistory(report);
      return report;
    }

    try {
      // Process each conflict
      for (const conflict of conflicts) {
        try {
          const result = await this.resolveConflict(conflict);
          if (result.success) {
            report.conflictsResolved++;
          } else {
            report.conflictsFailed++;
            if (result.requiresManualIntervention) {
              report.requiresManualIntervention = true;
            }
          }
          report.actions.push(...result.actions);
          report.warnings.push(...result.warnings);
          report.errors.push(...result.errors);
        } catch (error) {
          report.conflictsFailed++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          report.errors.push(`Resolution process failed: ${errorMsg}`);
          report.requiresManualIntervention = true;
        }
      }

      // Update strategy usage statistics
      this.updateStrategyStatistics(report);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      report.errors.push(`Resolution process failed: ${errorMsg}`);
      report.requiresManualIntervention = true;
    }

    this.addToHistory(report);
    return report;
  }

  /**
   * Auto-resolve conflicts based on user preferences
   */
  async autoResolve(): Promise<ConflictResolutionReport> {
    const conflicts = await this.scanForConflicts();
    
    if (this.userPreferences.autoResolveLevel === 'conservative' && conflicts.some(c => c.severity === 'high')) {
      const report: ConflictResolutionReport = {
        timestamp: new Date(),
        conflictsDetected: conflicts.length,
        conflictsResolved: 0,
        conflictsFailed: conflicts.length,
        strategies: [],
        actions: [],
        warnings: [],
        errors: ['Critical conflicts detected, manual intervention required'],
        requiresManualIntervention: true
      };
      this.addToHistory(report);
      return report;
    }

    return this.resolveConflicts(conflicts);
  }

  private async getAllRegistrations(): Promise<ServiceWorkerRegistration[]> {
    if (!('serviceWorker' in navigator)) {
      return [];
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration ? [registration] : [];
    } catch (error) {
      console.warn('Failed to get Service Worker registrations:', error);
      return [];
    }
  }

  private async detectMultipleRegistrations(registrations: ServiceWorkerRegistration[]): Promise<ServiceWorkerConflict | null> {
    if (registrations.length <= 1) return null;

    return {
      type: 'duplicate-scope',
      severity: 'high',
      description: `Found ${registrations.length} Service Worker registrations`,
      affectedRegistrations: registrations.map(reg => reg.scope),
      resolution: 'unregister-duplicates',
      autoResolvable: true
    };
  }

  private async detectScopeOverlaps(registrations: ServiceWorkerRegistration[]): Promise<ServiceWorkerConflict[]> {
    const conflicts: ServiceWorkerConflict[] = [];
    
    for (let i = 0; i < registrations.length; i++) {
      for (let j = i + 1; j < registrations.length; j++) {
        const reg1 = registrations[i];
        const reg2 = registrations[j];
        
        if (this.scopesOverlap(reg1.scope, reg2.scope)) {
          conflicts.push({
            type: 'scope-overlap',
            severity: 'medium',
            description: `Scope overlap detected between ${reg1.scope} and ${reg2.scope}`,
            affectedRegistrations: [reg1.scope, reg2.scope],
            resolution: 'resolve-scope-conflict',
            autoResolvable: true,
            affectedScopes: [reg1.scope, reg2.scope],
            registrations: [reg1, reg2]
          });
        }
      }
    }

    return conflicts;
  }

  private async detectPendingUpdates(registrations: ServiceWorkerRegistration[]): Promise<ServiceWorkerConflict[]> {
    const conflicts: ServiceWorkerConflict[] = [];

    for (const registration of registrations) {
      if (registration.waiting) {
        conflicts.push({
          type: 'update-pending',
          severity: 'medium',
          description: 'Service Worker update is waiting to be activated',
          affectedRegistrations: [registration.scope],
          resolution: 'activate-waiting',
          autoResolvable: true,
          affectedScopes: [registration.scope],
          registrations: [registration],
          metadata: { 
            waitingWorker: registration.waiting.scriptURL,
            activeWorker: registration.active?.scriptURL 
          }
        });
      }
    }

    return conflicts;
  }

  private async detectCacheMismatches(): Promise<ServiceWorkerConflict[]> {
    const conflicts: ServiceWorkerConflict[] = [];

    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        
        // Check for orphaned caches
        const expectedCaches = ['ninu-factory-control-v1', 'ninu-static-assets'];
        const orphanedCaches = cacheNames.filter(name => !expectedCaches.some(expected => name.includes(expected)));

        if (orphanedCaches.length > 0) {
          conflicts.push({
            type: 'cache-mismatch',
            severity: 'low',
            description: `Found ${orphanedCaches.length} orphaned cache(s)`,
            affectedRegistrations: ['/'],
            resolution: 'clear-orphaned-caches',
            autoResolvable: true,
            affectedScopes: ['/'],
            registrations: [],
            metadata: { orphanedCaches }
          });
        }
      } catch (error) {
        console.warn('Failed to check cache names:', error);
      }
    }

    return conflicts;
  }

  private async detectNetworkFallbackIssues(registrations: ServiceWorkerRegistration[]): Promise<ServiceWorkerConflict[]> {
    const conflicts: ServiceWorkerConflict[] = [];

    // Check if navigator is online and Service Worker is controlling
    if (!navigator.onLine && navigator.serviceWorker.controller) {
      conflicts.push({
        type: 'network-fallback',
        severity: 'medium',
        description: 'Offline mode detected but Service Worker may not handle all requests',
        affectedRegistrations: registrations.map(reg => reg.scope),
        resolution: 'check-network-fallback',
        autoResolvable: false,
        affectedScopes: registrations.map(reg => reg.scope),
        registrations,
        metadata: { isOnline: navigator.onLine }
      });
    }

    return conflicts;
  }

  private scopesOverlap(scope1: string, scope2: string): boolean {
    // Check if one scope is a subset of another
    return scope1.startsWith(scope2) || scope2.startsWith(scope1);
  }

  updateUserPreferences(newPreferences: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...newPreferences };
  }

  getResolutionHistory(): ConflictResolutionReport[] {
    return [...this.resolutionHistory];
  }

  clearResolutionHistory(): void {
    this.resolutionHistory = [];
  }

  exportConfiguration() {
    return {
      strategies: this.getStrategies(),
      userPreferences: this.userPreferences,
      resolutionHistory: this.resolutionHistory
    };
  }

  async previewResolution(conflicts: ServiceWorkerConflict[]): Promise<ConflictResolutionReport> {
    // Create a dry-run report
    const report: ConflictResolutionReport = {
      timestamp: new Date(),
      conflictsDetected: conflicts.length,
      conflictsResolved: 0,
      conflictsFailed: 0,
      strategies: [],
      actions: [],
      warnings: [],
      errors: [],
      requiresManualIntervention: false
    };

    // Simulate actions for preview
    for (const conflict of conflicts) {
      report.actions.push({
        type: this.getActionTypeForConflict(conflict.type),
        description: `Would resolve ${conflict.type}: ${conflict.description}`,
        result: 'skipped',
        timestamp: new Date()
      });
    }

    return report;
  }

  private getActionTypeForConflict(conflictType: string): any {
    const mapping: Record<string, any> = {
      'duplicate-scope': 'unregister',
      'version-mismatch': 'skip-waiting',
      'cache-conflict': 'clear-cache',
      'script-error': 'unregister'
    };
    return mapping[conflictType] || 'user-prompt';
  }

  private addToHistory(report: ConflictResolutionReport): void {
    this.resolutionHistory.unshift(report);
    if (this.resolutionHistory.length > this.maxHistorySize) {
      this.resolutionHistory = this.resolutionHistory.slice(0, this.maxHistorySize);
    }
  }

  private async createBackup(): Promise<BackupData> {
    const registrations = await this.getAllRegistrations();
    const caches = 'caches' in window ? await window.caches.keys() : [];
    
    return {
      registrations,
      caches,
      timestamp: new Date()
    };
  }

  private async resolveConflict(conflict: ServiceWorkerConflict): Promise<{
    success: boolean;
    actions: ResolutionAction[];
    warnings: string[];
    errors: string[];
    requiresManualIntervention: boolean;
  }> {
    const applicableStrategies = this.getApplicableStrategies(conflict);
    
    if (applicableStrategies.length === 0) {
      return {
        success: false,
        actions: [],
        warnings: [],
        errors: [`No applicable strategies for conflict type: ${conflict.type}`],
        requiresManualIntervention: true
      };
    }

    const strategy = this.selectBestStrategy(applicableStrategies);
    
    try {
      const result = await strategy.resolve([conflict], this.context || { 
        userPreferences: this.userPreferences, 
        environmentType: 'development', 
        criticalOperations: false 
      });
      
      return {
        success: result.success,
        actions: result.actions,
        warnings: result.warnings,
        errors: result.errors,
        requiresManualIntervention: !result.success
      };
    } catch (error) {
      return {
        success: false,
        actions: [],
        warnings: [],
        errors: [`Strategy execution failed: ${error instanceof Error ? error.message : String(error)}`],
        requiresManualIntervention: true
      };
    }
  }

  private getApplicableStrategies(conflict: ServiceWorkerConflict): ConflictResolutionStrategy[] {
    return Array.from(this.strategies.values())
      .filter(strategy => strategy.applicableConflictTypes.includes(conflict.type));
  }

  private selectBestStrategy(strategies: ConflictResolutionStrategy[]): ConflictResolutionStrategy {
    const sorted = strategies.sort((a, b) => {
      if (a.requiresUserConfirmation && !b.requiresUserConfirmation) return 1;
      if (!a.requiresUserConfirmation && b.requiresUserConfirmation) return -1;
      
      const severityOrder = { 'conservative': 1, 'moderate': 2, 'aggressive': 3 };
      const userLevel = severityOrder[this.userPreferences.autoResolveLevel];
      const aLevel = severityOrder[a.severity];
      const bLevel = severityOrder[b.severity];
      
      if (aLevel <= userLevel && bLevel > userLevel) return -1;
      if (bLevel <= userLevel && aLevel > userLevel) return 1;
      
      return 0;
    });
    
    return sorted[0];
  }

  private updateStrategyStatistics(report: ConflictResolutionReport): void {
    const strategyStats = new Map<string, StrategyUsage>();
    
    for (const action of report.actions) {
      if (action.type) {
        const strategyId = this.getStrategyIdForActionType(action.type);
        if (!strategyStats.has(strategyId)) {
          strategyStats.set(strategyId, {
            strategy: strategyId,
            applied: 0,
            successful: 0,
            failed: 0
          });
        }
        
        const stats = strategyStats.get(strategyId)!;
        stats.applied++;
        
        if (action.result === 'success') {
          stats.successful++;
        } else if (action.result === 'failed') {
          stats.failed++;
        }
      }
    }
    
    report.strategies = Array.from(strategyStats.values());
  }

  private getStrategyIdForActionType(actionType: string): string {
    const mapping: Record<string, string> = {
      'unregister': 'duplicate-scope-resolver',
      'skip-waiting': 'version-mismatch-resolver',
      'clear-cache': 'cache-conflict-resolver',
      'reload-page': 'version-mismatch-resolver',
      'user-prompt': 'cache-conflict-resolver'
    };
    
    return mapping[actionType] || 'unknown-strategy';
  }

  // Strategy resolution methods  
  private async resolveDuplicateScope(conflicts: ServiceWorkerConflict[], context: ResolutionContext) {
    const actions: ResolutionAction[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    if (!context.userPreferences.allowUnregistration) {
      warnings.push('Service worker unregistration not allowed by user preferences');
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
    
    try {
      const registrations = await this.getAllRegistrations();
      
      for (let i = 1; i < registrations.length; i++) {
        await registrations[i].unregister();
        actions.push({
          type: 'unregister',
          target: registrations[i].scope,
          description: `Unregistered duplicate service worker: ${registrations[i].scope}`,
          result: 'success',
          timestamp: new Date()
        });
      }
      
      return { success: true, actions, warnings, errors, requiresReload: false };
    } catch (error) {
      errors.push(`Failed to unregister duplicates: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
  }

  private async resolveVersionMismatch(conflicts: ServiceWorkerConflict[], context: ResolutionContext) {
    const actions: ResolutionAction[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      const registrations = await this.getAllRegistrations();
      
      for (const registration of registrations) {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          actions.push({
            type: 'skip-waiting',
            target: registration.scope,
            description: `Activated waiting service worker: ${registration.scope}`,
            result: 'success',
            timestamp: new Date()
          });
        }
      }
      
      if (context.userPreferences.allowPageReload) {
        actions.push({
          type: 'reload-page',
          description: 'Page reload suggested to complete service worker update',
          result: 'success',
          timestamp: new Date()
        });
      }
      
      return { success: true, actions, warnings, errors, requiresReload: context.userPreferences.allowPageReload };
    } catch (error) {
      errors.push(`Failed to resolve version mismatch: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
  }

  private async resolveCacheConflict(conflicts: ServiceWorkerConflict[], context: ResolutionContext) {
    const actions: ResolutionAction[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    if (!context.userPreferences.allowCacheClear) {
      warnings.push('Cache clearing not allowed by user preferences');
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
    
    if (this.strategies.get('cache-conflict-resolver')?.requiresUserConfirmation) {
      const userConfirmed = typeof window !== 'undefined' && window.confirm('Clear service worker caches to resolve conflicts?');
      if (!userConfirmed) {
        warnings.push('User declined cache clearing operation');
        return { success: false, actions, warnings, errors, requiresReload: false };
      }
    }
    
    try {
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        
        for (const cacheName of cacheNames) {
          await window.caches.delete(cacheName);
          actions.push({
            type: 'clear-cache',
            target: cacheName,
            description: `Cleared cache: ${cacheName}`,
            result: 'success',
            timestamp: new Date()
          });
        }
      }
      
      return { success: true, actions, warnings, errors, requiresReload: false };
    } catch (error) {
      errors.push(`Failed to clear caches: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
  }

  private async resolveScriptError(conflicts: ServiceWorkerConflict[], context: ResolutionContext) {
    const actions: ResolutionAction[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    if (!context.userPreferences.allowUnregistration) {
      warnings.push('Service worker unregistration not allowed by user preferences');
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
    
    try {
      const registrations = await this.getAllRegistrations();
      
      for (const registration of registrations) {
        if (!registration.active) {
          await registration.unregister();
          actions.push({
            type: 'unregister',
            target: registration.scope,
            description: `Unregistered failed service worker: ${registration.scope}`,
            result: 'success',
            timestamp: new Date()
          });
        }
      }
      
      return { success: true, actions, warnings, errors, requiresReload: false };
    } catch (error) {
      errors.push(`Failed to resolve script errors: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, actions, warnings, errors, requiresReload: false };
    }
  }
}

// Export factory function
export function createConflictResolver(context?: ResolutionContext): ServiceWorkerConflictResolver {
  return new ServiceWorkerConflictResolver(context);
}

// Export default resolver with factory control specific settings
export const factoryControlResolver = createConflictResolver({
  userPreferences: {
    autoResolveLevel: 'conservative',
    allowUnregistration: true,
    allowCacheClear: true,
    allowPageReload: false, // Conservative for factory environment
    preserveUserData: true,
    backupBeforeChanges: true
  },
  environmentType: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  criticalOperations: true // Factory control is critical
});