const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const os = require('os');

/**
 * ParentProjectIntegration - Read-only integration with parent Context Engineering project
 * Monitors and reads data from the parent project without making any modifications
 */
class ParentProjectIntegration {
  constructor() {
    this.parentPath = this.resolveParentPath();
    this.watchers = new Map();
    this.cache = new Map();
    this.lastUpdate = new Map();
    this.isInitialized = false;
    
    // Data sources configuration
    this.dataSources = {
      commandRegistry: '.claude/config/command-registry.json',
      scriptsResults: 'scripts/results/',
      outputs: 'docs/operations/outputs/',
      handoffs: 'docs/operations/handoffs/',
      reports: 'docs/operations/reports/',
      principles: 'docs/knowledge/principles/',
      commandDocs: 'docs/commands/',
      claudeConfig: '.claude/settings.local.json'
    };
  }

  resolveParentPath() {
    // Resolve parent project path
    const envPath = process.env.PARENT_PROJECT_PATH;
    if (envPath) {
      return path.resolve(envPath);
    }
    
    // Default: go up from dashboard project
    return path.resolve(__dirname, '../../../..');
  }

  async initialize() {
    try {
      // Verify parent project exists
      await this.verifyParentProject();
      
      // Load initial data
      await this.loadAllData();
      
      // Setup file watchers
      this.setupWatchers();
      
      this.isInitialized = true;
      console.log(`✅ Parent project integration initialized: ${this.parentPath}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize parent project integration:', error);
      throw error;
    }
  }

  async verifyParentProject() {
    try {
      const claudeMdPath = path.join(this.parentPath, 'CLAUDE.md');
      await fs.access(claudeMdPath);
      
      const packageJsonPath = path.join(this.parentPath, 'package.json');
      const hasPackageJson = await fs.access(packageJsonPath).then(() => true).catch(() => false);
      
      console.log(`✅ Parent project verified: ${this.parentPath}`);
      console.log(`   - CLAUDE.md: ✅`);
      console.log(`   - package.json: ${hasPackageJson ? '✅' : '❌'}`);
      
    } catch (error) {
      throw new Error(`Parent project not found at ${this.parentPath}. Ensure PARENT_PROJECT_PATH is correct.`);
    }
  }

  async loadAllData() {
    console.log('📊 Loading parent project data...');
    
    for (const [key, relativePath] of Object.entries(this.dataSources)) {
      try {
        await this.loadDataSource(key, relativePath);
      } catch (error) {
        console.warn(`⚠️ Could not load ${key}: ${error.message}`);
      }
    }
  }

  async loadDataSource(key, relativePath) {
    const fullPath = path.join(this.parentPath, relativePath);
    
    try {
      const stats = await fs.stat(fullPath);
      
      if (stats.isFile()) {
        await this.loadFile(key, fullPath);
      } else if (stats.isDirectory()) {
        await this.loadDirectory(key, fullPath);
      }
      
      this.lastUpdate.set(key, Date.now());
      
    } catch (error) {
      console.warn(`⚠️ Could not load ${key} from ${fullPath}: ${error.message}`);
    }
  }

  async loadFile(key, filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      if (filePath.endsWith('.json')) {
        this.cache.set(key, JSON.parse(content));
      } else {
        this.cache.set(key, content);
      }
      
      console.log(`   ✅ ${key}: ${filePath}`);
      
    } catch (error) {
      console.warn(`   ❌ ${key}: ${error.message}`);
    }
  }

  async loadDirectory(key, dirPath) {
    try {
      const entries = await this.scanDirectory(dirPath);
      this.cache.set(key, entries);
      
      console.log(`   ✅ ${key}: ${entries.length} entries from ${dirPath}`);
      
    } catch (error) {
      console.warn(`   ❌ ${key}: ${error.message}`);
    }
  }

  async scanDirectory(dirPath, extensions = ['.json', '.md', '.log']) {
    const entries = [];
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isFile()) {
          const ext = path.extname(item.name);
          if (extensions.includes(ext)) {
            try {
              const stats = await fs.stat(itemPath);
              const content = await fs.readFile(itemPath, 'utf-8');
              
              entries.push({
                name: item.name,
                path: itemPath,
                relativePath: path.relative(this.parentPath, itemPath),
                extension: ext,
                size: stats.size,
                modified: stats.mtime,
                content: ext === '.json' ? JSON.parse(content) : content
              });
            } catch (error) {
              console.warn(`⚠️ Error reading ${itemPath}: ${error.message}`);
            }
          }
        } else if (item.isDirectory() && !item.name.startsWith('.')) {
          // Recursively scan subdirectories
          const subEntries = await this.scanDirectory(itemPath, extensions);
          entries.push(...subEntries);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error scanning directory ${dirPath}: ${error.message}`);
    }
    
    return entries;
  }

  setupWatchers() {
    console.log('👀 Setting up file watchers...');
    
    for (const [key, relativePath] of Object.entries(this.dataSources)) {
      const fullPath = path.join(this.parentPath, relativePath);
      
      try {
        const watcher = chokidar.watch(fullPath, {
          ignoreInitial: true,
          persistent: true,
          followSymlinks: false,
          depth: key === 'scriptsResults' || key === 'outputs' || key === 'handoffs' || key === 'reports' ? 3 : 1
        });

        watcher
          .on('add', (path) => this.handleFileChange(key, 'add', path))
          .on('change', (path) => this.handleFileChange(key, 'change', path))
          .on('unlink', (path) => this.handleFileChange(key, 'unlink', path))
          .on('error', (error) => console.error(`Watcher error for ${key}:`, error));

        this.watchers.set(key, watcher);
        console.log(`   👀 Watching ${key}: ${fullPath}`);
        
      } catch (error) {
        console.warn(`⚠️ Could not setup watcher for ${key}: ${error.message}`);
      }
    }
  }

  async handleFileChange(key, event, filePath) {
    console.log(`📁 File ${event}: ${key} - ${path.relative(this.parentPath, filePath)}`);
    
    try {
      // Reload the data source
      const relativePath = this.dataSources[key];
      await this.loadDataSource(key, relativePath);
      
      // Emit change event for real-time updates
      this.emitChange(key, event, filePath);
      
    } catch (error) {
      console.error(`Error handling file change for ${key}:`, error);
    }
  }

  emitChange(key, event, filePath) {
    // This would integrate with WebSocketManager to broadcast changes
    console.log(`🔄 Data source updated: ${key}`);
  }

  // Public API methods for accessing parent project data

  getCommandRegistry() {
    return this.cache.get('commandRegistry') || {
      commands: {},
      metadata: { total_commands: 0, last_updated: null }
    };
  }

  getScriptsResults() {
    return this.cache.get('scriptsResults') || [];
  }

  getOutputs() {
    return this.cache.get('outputs') || [];
  }

  getHandoffs() {
    return this.cache.get('handoffs') || [];
  }

  getReports() {
    return this.cache.get('reports') || [];
  }

  getPrinciples() {
    return this.cache.get('principles') || [];
  }

  getCommandDocs() {
    return this.cache.get('commandDocs') || [];
  }

  getClaudeConfig() {
    return this.cache.get('claudeConfig') || {};
  }

  // Analysis methods

  getSystemMetrics() {
    const commandRegistry = this.getCommandRegistry();
    const scriptsResults = this.getScriptsResults();
    const principles = this.getPrinciples();
    const handoffs = this.getHandoffs();
    const reports = this.getReports();
    
    return {
      commands: {
        total: commandRegistry.metadata?.total_commands || 0,
        categories: this.analyzeCommandCategories(commandRegistry),
        lastUpdated: commandRegistry.metadata?.last_updated
      },
      scripts: {
        total: scriptsResults.length,
        recent: scriptsResults.filter(r => this.isRecentFile(r.modified)).length
      },
      principles: {
        total: principles.length,
        categories: this.analyzePrincipleCategories(principles)
      },
      operations: {
        handoffs: {
          total: handoffs.length,
          active: handoffs.filter(h => h.relativePath.includes('/active/')).length,
          recent: handoffs.filter(h => this.isRecentFile(h.modified)).length
        },
        reports: {
          total: reports.length,
          active: reports.filter(r => r.relativePath.includes('/active/')).length,
          recent: reports.filter(r => this.isRecentFile(r.modified)).length
        }
      },
      lastSync: Math.max(...Array.from(this.lastUpdate.values()))
    };
  }

  analyzeCommandCategories(registry) {
    const categories = {};
    
    if (registry.commands) {
      Object.values(registry.commands).forEach(command => {
        const category = command.category || 'unknown';
        categories[category] = (categories[category] || 0) + 1;
      });
    }
    
    return categories;
  }

  analyzePrincipleCategories(principles) {
    const categories = {};
    
    principles.forEach(principle => {
      const dir = path.dirname(principle.relativePath);
      const category = path.basename(dir);
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  }

  isRecentFile(modifiedDate) {
    const fileDate = new Date(modifiedDate);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return fileDate > dayAgo;
  }

  // Performance tracking

  getPerformanceData() {
    const scriptsResults = this.getScriptsResults();
    
    // Extract performance metrics from script results
    const performanceFiles = scriptsResults.filter(file => 
      file.name.includes('performance') || 
      file.name.includes('metrics') ||
      file.path.includes('performance')
    );
    
    return {
      files: performanceFiles.length,
      lastUpdate: performanceFiles.length > 0 
        ? Math.max(...performanceFiles.map(f => new Date(f.modified).getTime()))
        : null,
      data: performanceFiles
    };
  }

  // Claude configuration analysis

  getClaudeSettings() {
    const config = this.getClaudeConfig();
    
    return {
      permissions: {
        allowed: config.permissions?.allow?.length || 0,
        denied: config.permissions?.deny?.length || 0
      },
      hooks: config.hooks || {},
      hasConfig: Object.keys(config).length > 0
    };
  }

  // Health check

  getHealthStatus() {
    const lastUpdates = Array.from(this.lastUpdate.values());
    const oldestUpdate = Math.min(...lastUpdates);
    const newestUpdate = Math.max(...lastUpdates);
    const avgAge = (Date.now() - (lastUpdates.reduce((a, b) => a + b, 0) / lastUpdates.length)) / 1000;
    
    return {
      isInitialized: this.isInitialized,
      parentPath: this.parentPath,
      dataSources: Object.keys(this.dataSources).length,
      activeWatchers: this.watchers.size,
      cacheEntries: this.cache.size,
      avgDataAge: Math.round(avgAge),
      lastSync: newestUpdate,
      status: avgAge < 300 ? 'healthy' : avgAge < 3600 ? 'stale' : 'outdated'
    };
  }

  // Cleanup

  async shutdown() {
    console.log('🛑 Shutting down parent project integration...');
    
    // Close all watchers
    for (const [key, watcher] of this.watchers) {
      try {
        await watcher.close();
        console.log(`✅ Closed watcher: ${key}`);
      } catch (error) {
        console.error(`Error closing watcher ${key}:`, error);
      }
    }
    
    this.watchers.clear();
    this.cache.clear();
    this.lastUpdate.clear();
    
    console.log('✅ Parent project integration shutdown complete');
  }
}

module.exports = ParentProjectIntegration;