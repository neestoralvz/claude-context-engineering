/**
 * Service Worker Conflict Resolver Tests
 * Comprehensive test suite for service worker conflict resolution utilities
 * 
 * @file sw-conflict-resolver.test.ts
 * @description TDD tests for ServiceWorkerConflictResolver class and utilities
 */

import { 
  ServiceWorkerConflictResolver, 
  createConflictResolver,
  type ConflictResolutionReport,
  type UserPreferences,
  type ResolutionContext
} from '../../lib/utils/sw-conflict-resolver';

// Mock ServiceWorker API
const mockServiceWorkerRegistration = {
  scope: 'https://example.com/',
  scriptURL: 'https://example.com/sw.js',
  installing: null,
  waiting: null,
  active: {
    scriptURL: 'https://example.com/sw.js',
    state: 'activated' as ServiceWorkerState,
    postMessage: jest.fn()
  },
  addEventListener: jest.fn(),
  unregister: jest.fn().mockResolvedValue(true)
};

const mockNavigator = {
  serviceWorker: {
    getRegistrations: jest.fn().mockResolvedValue([])
  }
};

// Mock caches API
const mockCaches = {
  keys: jest.fn().mockResolvedValue([]),
  delete: jest.fn().mockResolvedValue(true)
};

Object.defineProperty(global, 'caches', {
  value: mockCaches,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock window.confirm
Object.defineProperty(global, 'confirm', {
  value: jest.fn().mockReturnValue(true),
  writable: true
});

describe('ServiceWorkerConflictResolver', () => {
  let resolver: ServiceWorkerConflictResolver;
  let userPreferences: UserPreferences;

  beforeEach(() => {
    jest.clearAllMocks();
    
    userPreferences = {
      autoResolveLevel: 'moderate',
      allowUnregistration: true,
      allowCacheClear: true,
      allowPageReload: false,
      preserveUserData: true,
      backupBeforeChanges: true
    };
    
    resolver = new ServiceWorkerConflictResolver(userPreferences);
  });

  describe('Initialization', () => {
    it('should create resolver instance with default preferences', () => {
      const defaultResolver = new ServiceWorkerConflictResolver();
      expect(defaultResolver).toBeInstanceOf(ServiceWorkerConflictResolver);
    });

    it('should create resolver instance with custom preferences', () => {
      expect(resolver).toBeInstanceOf(ServiceWorkerConflictResolver);
    });

    it('should initialize with built-in strategies', () => {
      const strategies = resolver.getStrategies();
      
      expect(strategies.length).toBeGreaterThan(0);
      expect(strategies.some(s => s.id === 'duplicate-scope-resolver')).toBe(true);
      expect(strategies.some(s => s.id === 'version-mismatch-resolver')).toBe(true);
      expect(strategies.some(s => s.id === 'cache-conflict-resolver')).toBe(true);
      expect(strategies.some(s => s.id === 'script-error-resolver')).toBe(true);
    });

    it('should allow custom user preferences', () => {
      const customPreferences = {
        autoResolveLevel: 'aggressive' as const,
        allowUnregistration: false
      };
      
      const customResolver = new ServiceWorkerConflictResolver(customPreferences);
      const preferences = customResolver.getUserPreferences();
      
      expect(preferences.autoResolveLevel).toBe('aggressive');
      expect(preferences.allowUnregistration).toBe(false);
    });
  });

  describe('Strategy Management', () => {
    it('should register custom strategies', () => {
      const customStrategy = {
        id: 'custom-strategy',
        name: 'Custom Strategy',
        description: 'A custom resolution strategy',
        applicableConflictTypes: ['custom-conflict'],
        severity: 'conservative' as const,
        requiresUserConfirmation: false,
        async resolve() {
          return {
            success: true,
            actions: [],
            warnings: [],
            errors: [],
            requiresReload: false
          };
        }
      };
      
      resolver.registerStrategy(customStrategy);
      
      const strategies = resolver.getStrategies();
      expect(strategies.some(s => s.id === 'custom-strategy')).toBe(true);
    });

    it('should unregister strategies', () => {
      const initialCount = resolver.getStrategies().length;
      
      const unregistered = resolver.unregisterStrategy('duplicate-scope-resolver');
      
      expect(unregistered).toBe(true);
      expect(resolver.getStrategies().length).toBe(initialCount - 1);
    });

    it('should return false when unregistering non-existent strategy', () => {
      const unregistered = resolver.unregisterStrategy('non-existent-strategy');
      expect(unregistered).toBe(false);
    });
  });

  describe('Duplicate Scope Resolution', () => {
    it('should resolve duplicate scope conflicts', async () => {
      const duplicateRegistrations = [
        mockServiceWorkerRegistration,
        {
          ...mockServiceWorkerRegistration,
          active: {
            ...mockServiceWorkerRegistration.active,
            scriptURL: 'https://example.com/sw-v2.js'
          }
        }
      ];
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue(duplicateRegistrations);
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Multiple service workers with same scope',
        affectedRegistrations: [
          'https://example.com/sw.js',
          'https://example.com/sw-v2.js'
        ],
        resolution: 'Unregister duplicate service workers',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.conflictsResolved).toBe(1);
      expect(report.actions.some(a => a.type === 'unregister')).toBe(true);
      expect(mockServiceWorkerRegistration.unregister).toHaveBeenCalled();
    });

    it('should handle duplicate scope resolution errors', async () => {
      mockServiceWorkerRegistration.unregister.mockRejectedValue(new Error('Unregister failed'));
      
      const duplicateRegistrations = [
        mockServiceWorkerRegistration,
        mockServiceWorkerRegistration
      ];
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue(duplicateRegistrations);
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Multiple service workers with same scope',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Unregister duplicate service workers',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.conflictsFailed).toBe(1);
      expect(report.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Version Mismatch Resolution', () => {
    it('should resolve version mismatch conflicts', async () => {
      const versionMismatchReg = {
        ...mockServiceWorkerRegistration,
        waiting: {
          scriptURL: 'https://example.com/sw-new.js',
          state: 'installed' as ServiceWorkerState,
          postMessage: jest.fn()
        }
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([versionMismatchReg]);
      
      const conflict = {
        type: 'version-mismatch',
        severity: 'medium',
        description: 'Service worker version mismatch',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Activate waiting service worker',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.conflictsResolved).toBe(1);
      expect(report.actions.some(a => a.type === 'skip-waiting')).toBe(true);
      expect(versionMismatchReg.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });

    it('should suggest page reload when allowed', async () => {
      const reloadPreferences = { ...userPreferences, allowPageReload: true };
      const reloadResolver = new ServiceWorkerConflictResolver(reloadPreferences);
      
      const versionMismatchReg = {
        ...mockServiceWorkerRegistration,
        waiting: {
          scriptURL: 'https://example.com/sw-new.js',
          state: 'installed' as ServiceWorkerState,
          postMessage: jest.fn()
        }
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([versionMismatchReg]);
      
      const conflict = {
        type: 'version-mismatch',
        severity: 'medium',
        description: 'Service worker version mismatch',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Activate waiting service worker',
        autoResolvable: true
      };
      
      const report = await reloadResolver.resolveConflicts([conflict]);
      
      expect(report.actions.some(a => a.type === 'reload-page')).toBe(true);
    });
  });

  describe('Cache Conflict Resolution', () => {
    it('should resolve cache conflicts', async () => {
      mockCaches.keys.mockResolvedValue([
        'next-cache-v1',
        'workbox-precache-v2',
        'sw-custom-cache'
      ]);
      
      const conflict = {
        type: 'cache-conflict',
        severity: 'medium',
        description: 'Cache conflicts between service workers',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Clear conflicting caches',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.conflictsResolved).toBe(1);
      expect(report.actions.some(a => a.type === 'clear-cache')).toBe(true);
      expect(mockCaches.delete).toHaveBeenCalled();
    });

    it('should handle cache clearing disabled', async () => {
      const noCachePreferences = { ...userPreferences, allowCacheClear: false };
      const noCacheResolver = new ServiceWorkerConflictResolver(noCachePreferences);
      
      const conflict = {
        type: 'cache-conflict',
        severity: 'medium',
        description: 'Cache conflicts between service workers',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Clear conflicting caches',
        autoResolvable: true
      };
      
      const report = await noCacheResolver.resolveConflicts([conflict]);
      
      expect(report.warnings.some(w => w.includes('Cache clearing not allowed'))).toBe(true);
    });

    it('should require user confirmation for cache conflicts', async () => {
      global.confirm = jest.fn().mockReturnValue(false);
      
      const conflict = {
        type: 'cache-conflict',
        severity: 'medium',
        description: 'Cache conflicts between service workers',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Clear conflicting caches',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(global.confirm).toHaveBeenCalled();
      expect(report.warnings.some(w => w.includes('User declined'))).toBe(true);
    });
  });

  describe('Script Error Resolution', () => {
    it('should resolve script error conflicts', async () => {
      const failedReg = {
        scope: 'https://example.com/failed/',
        scriptURL: 'https://example.com/failed/sw.js',
        installing: null,
        waiting: null,
        active: null,
        addEventListener: jest.fn(),
        unregister: jest.fn().mockResolvedValue(true)
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([failedReg]);
      
      const conflict = {
        type: 'script-error',
        severity: 'high',
        description: 'Service worker script failed',
        affectedRegistrations: ['https://example.com/failed/sw.js'],
        resolution: 'Unregister failed service worker',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.conflictsResolved).toBe(1);
      expect(report.actions.some(a => a.type === 'unregister')).toBe(true);
      expect(failedReg.unregister).toHaveBeenCalled();
    });

    it('should handle unregistration disabled for script errors', async () => {
      const noUnregPreferences = { ...userPreferences, allowUnregistration: false };
      const noUnregResolver = new ServiceWorkerConflictResolver(noUnregPreferences);
      
      const failedReg = {
        scope: 'https://example.com/failed/',
        scriptURL: 'https://example.com/failed/sw.js',
        installing: null,
        waiting: null,
        active: null,
        addEventListener: jest.fn(),
        unregister: jest.fn().mockResolvedValue(true)
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([failedReg]);
      
      const conflict = {
        type: 'script-error',
        severity: 'high',
        description: 'Service worker script failed',
        affectedRegistrations: ['https://example.com/failed/sw.js'],
        resolution: 'Unregister failed service worker',
        autoResolvable: true
      };
      
      const report = await noUnregResolver.resolveConflicts([conflict]);
      
      expect(report.warnings.some(w => w.includes('unregistration not allowed'))).toBe(true);
    });
  });

  describe('Strategy Selection', () => {
    it('should select conservative strategies for conservative level', async () => {
      const conservativeResolver = new ServiceWorkerConflictResolver({
        ...userPreferences,
        autoResolveLevel: 'conservative'
      });
      
      const conflict = {
        type: 'version-mismatch',
        severity: 'medium',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await conservativeResolver.resolveConflicts([conflict]);
      
      // Should use conservative strategy (version-mismatch-resolver has conservative severity)
      expect(report.strategies.some(s => s.strategy === 'version-mismatch-resolver')).toBe(true);
    });

    it('should select appropriate strategies for moderate level', async () => {
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      // Should use moderate strategy (duplicate-scope-resolver has moderate severity)
      expect(report.strategies.some(s => s.strategy === 'duplicate-scope-resolver')).toBe(true);
    });

    it('should select any strategy for aggressive level', async () => {
      const aggressiveResolver = new ServiceWorkerConflictResolver({
        ...userPreferences,
        autoResolveLevel: 'aggressive'
      });
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await aggressiveResolver.resolveConflicts([conflict]);
      
      expect(report.strategies.length).toBeGreaterThan(0);
    });

    it('should prefer strategies without user confirmation', async () => {
      // Mock a strategy that requires confirmation
      const confirmationStrategy = {
        id: 'confirmation-required',
        name: 'Confirmation Required',
        description: 'Requires user confirmation',
        applicableConflictTypes: ['test-conflict'],
        severity: 'moderate' as const,
        requiresUserConfirmation: true,
        async resolve() {
          return {
            success: true,
            actions: [],
            warnings: [],
            errors: [],
            requiresReload: false
          };
        }
      };
      
      // Mock a strategy that doesn't require confirmation
      const autoStrategy = {
        id: 'auto-strategy',
        name: 'Auto Strategy',
        description: 'Does not require confirmation',
        applicableConflictTypes: ['test-conflict'],
        severity: 'moderate' as const,
        requiresUserConfirmation: false,
        async resolve() {
          return {
            success: true,
            actions: [],
            warnings: [],
            errors: [],
            requiresReload: false
          };
        }
      };
      
      resolver.registerStrategy(confirmationStrategy);
      resolver.registerStrategy(autoStrategy);
      
      const conflict = {
        type: 'test-conflict',
        severity: 'medium',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      // Should prefer auto strategy
      expect(report.strategies.some(s => s.strategy === 'auto-strategy')).toBe(true);
    });
  });

  describe('Backup and Recovery', () => {
    it('should create backup when enabled', async () => {
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([mockServiceWorkerRegistration]);
      mockCaches.keys.mockResolvedValue(['test-cache']);
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.backupData).toBeDefined();
      expect(report.backupData.registrations).toBeDefined();
      expect(report.backupData.caches).toBeDefined();
    });

    it('should skip backup when disabled', async () => {
      const noBackupResolver = new ServiceWorkerConflictResolver({
        ...userPreferences,
        backupBeforeChanges: false
      });
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await noBackupResolver.resolveConflicts([conflict]);
      
      expect(report.backupData).toBeUndefined();
    });

    it('should handle backup creation failures gracefully', async () => {
      mockCaches.keys.mockRejectedValue(new Error('Backup failed'));
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      // Should not throw error
      const report = await resolver.resolveConflicts([conflict]);
      expect(report).toBeDefined();
    });
  });

  describe('Dry Run Mode', () => {
    it('should preview resolution without making changes', async () => {
      const duplicateRegistrations = [
        mockServiceWorkerRegistration,
        mockServiceWorkerRegistration
      ];
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue(duplicateRegistrations);
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const preview = await resolver.previewResolution([conflict]);
      
      expect(preview.actions.some(a => a.description.includes('Would unregister'))).toBe(true);
      expect(mockServiceWorkerRegistration.unregister).not.toHaveBeenCalled();
    });

    it('should not create backup in dry run mode', async () => {
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const preview = await resolver.previewResolution([conflict]);
      
      expect(preview.backupData).toBeUndefined();
    });
  });

  describe('Report Generation', () => {
    it('should generate comprehensive resolution report', async () => {
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('conflictsDetected');
      expect(report).toHaveProperty('conflictsResolved');
      expect(report).toHaveProperty('conflictsFailed');
      expect(report).toHaveProperty('strategies');
      expect(report).toHaveProperty('actions');
      expect(report).toHaveProperty('warnings');
      expect(report).toHaveProperty('errors');
      expect(report).toHaveProperty('requiresManualIntervention');
    });

    it('should track strategy usage statistics', async () => {
      const conflicts = [
        {
          type: 'duplicate-scope',
          severity: 'high',
          description: 'Test conflict 1',
          affectedRegistrations: ['https://example.com/sw1.js'],
          resolution: 'Test resolution',
          autoResolvable: true
        },
        {
          type: 'duplicate-scope',
          severity: 'high',
          description: 'Test conflict 2',
          affectedRegistrations: ['https://example.com/sw2.js'],
          resolution: 'Test resolution',
          autoResolvable: true
        }
      ];
      
      const report = await resolver.resolveConflicts(conflicts);
      
      const strategyStats = report.strategies.find(s => s.strategy === 'duplicate-scope-resolver');
      expect(strategyStats).toBeDefined();
      expect(strategyStats?.applied).toBe(2);
    });

    it('should flag manual intervention requirement', async () => {
      const unsupportedConflict = {
        type: 'unsupported-conflict',
        severity: 'high',
        description: 'Unsupported conflict type',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Manual resolution required',
        autoResolvable: false
      };
      
      const report = await resolver.resolveConflicts([unsupportedConflict]);
      
      expect(report.requiresManualIntervention).toBe(true);
      expect(report.conflictsFailed).toBe(1);
    });
  });

  describe('History Management', () => {
    it('should store resolution history', async () => {
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      await resolver.resolveConflicts([conflict]);
      
      const history = resolver.getResolutionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].conflictsDetected).toBe(1);
    });

    it('should limit history size', async () => {
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      // Generate more than 10 reports
      for (let i = 0; i < 15; i++) {
        await resolver.resolveConflicts([conflict]);
      }
      
      const history = resolver.getResolutionHistory();
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should clear resolution history', async () => {
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      await resolver.resolveConflicts([conflict]);
      resolver.clearResolutionHistory();
      
      const history = resolver.getResolutionHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Configuration Management', () => {
    it('should update user preferences', () => {
      const newPreferences = {
        autoResolveLevel: 'aggressive' as const,
        allowCacheClear: false
      };
      
      resolver.updateUserPreferences(newPreferences);
      
      const preferences = resolver.getUserPreferences();
      expect(preferences.autoResolveLevel).toBe('aggressive');
      expect(preferences.allowCacheClear).toBe(false);
    });

    it('should export configuration', () => {
      const config = resolver.exportConfiguration();
      
      expect(config).toHaveProperty('strategies');
      expect(config).toHaveProperty('userPreferences');
      expect(config).toHaveProperty('resolutionHistory');
      expect(config.strategies).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    it('should handle strategy execution failures', async () => {
      const failingStrategy = {
        id: 'failing-strategy',
        name: 'Failing Strategy',
        description: 'A strategy that fails',
        applicableConflictTypes: ['test-conflict'],
        severity: 'moderate' as const,
        requiresUserConfirmation: false,
        async resolve() {
          throw new Error('Strategy execution failed');
        }
      };
      
      resolver.registerStrategy(failingStrategy);
      
      const conflict = {
        type: 'test-conflict',
        severity: 'medium',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.conflictsFailed).toBe(1);
      expect(report.errors.some(e => e.includes('Strategy execution failed'))).toBe(true);
    });

    it('should handle no applicable strategies', async () => {
      const unknownConflict = {
        type: 'unknown-conflict-type',
        severity: 'medium',
        description: 'Unknown conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Unknown resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([unknownConflict]);
      
      expect(report.conflictsFailed).toBe(1);
      expect(report.errors.some(e => e.includes('No applicable strategies'))).toBe(true);
      expect(report.requiresManualIntervention).toBe(true);
    });

    it('should handle service worker API failures', async () => {
      mockNavigator.serviceWorker.getRegistrations.mockRejectedValue(new Error('API failure'));
      
      const conflict = {
        type: 'duplicate-scope',
        severity: 'high',
        description: 'Test conflict',
        affectedRegistrations: ['https://example.com/sw.js'],
        resolution: 'Test resolution',
        autoResolvable: true
      };
      
      const report = await resolver.resolveConflicts([conflict]);
      
      expect(report.errors.some(e => e.includes('Resolution process failed'))).toBe(true);
      expect(report.requiresManualIntervention).toBe(true);
    });
  });

  describe('Factory Function', () => {
    it('should create new instance via factory function', () => {
      const newResolver = createConflictResolver();
      
      expect(newResolver).toBeInstanceOf(ServiceWorkerConflictResolver);
      expect(newResolver).not.toBe(resolver);
    });

    it('should create instance with custom preferences via factory', () => {
      const customPreferences = { autoResolveLevel: 'conservative' as const };
      const newResolver = createConflictResolver(customPreferences);
      
      expect(newResolver).toBeInstanceOf(ServiceWorkerConflictResolver);
      expect(newResolver.getUserPreferences().autoResolveLevel).toBe('conservative');
    });
  });
});