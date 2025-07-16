// Logging Configuration Management System
// Handles configuration loading, validation, and management

const fs = require('fs');
const path = require('path');
const { ContextLogger } = require('./logger');

// Default logging configuration
const DEFAULT_CONFIG = {
  level: 'INFO',
  enableConsole: true,
  enableFile: true,
  logDir: './logs',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  colorEnabled: true,
  components: {
    SYSTEM: { level: 'INFO' },
    VALIDATION: { level: 'INFO' },
    DECISION_ENGINE: { level: 'INFO' },
    COMMAND_EXECUTION: { level: 'INFO' },
    PERFORMANCE: { level: 'DEBUG' }
  },
  filters: {
    excludePatterns: [],
    includePatterns: ['*']
  },
  formatting: {
    timestamp: true,
    pid: true,
    component: true,
    metadata: true
  }
};

class LoggingConfig {
  constructor(configPath = './logging-config.json') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.loggers = new Map();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        const userConfig = JSON.parse(fileContent);
        return this.mergeConfigs(DEFAULT_CONFIG, userConfig);
      }
    } catch (error) {
      console.warn(`Failed to load logging config from ${this.configPath}:`, error.message);
      console.warn('Using default configuration');
    }
    
    return { ...DEFAULT_CONFIG };
  }

  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    // Merge top-level properties
    Object.keys(userConfig).forEach(key => {
      if (key === 'components' && userConfig.components) {
        merged.components = { ...defaultConfig.components, ...userConfig.components };
      } else if (key === 'filters' && userConfig.filters) {
        merged.filters = { ...defaultConfig.filters, ...userConfig.filters };
      } else if (key === 'formatting' && userConfig.formatting) {
        merged.formatting = { ...defaultConfig.formatting, ...userConfig.formatting };
      } else {
        merged[key] = userConfig[key];
      }
    });

    return merged;
  }

  saveConfig() {
    try {
      const configContent = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(this.configPath, configContent);
      return true;
    } catch (error) {
      console.error(`Failed to save config to ${this.configPath}:`, error.message);
      return false;
    }
  }

  updateConfig(updates) {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveConfig();
    this.refreshLoggers();
  }

  getComponentConfig(component) {
    const componentConfig = this.config.components[component] || {};
    return {
      ...this.config,
      ...componentConfig,
      component
    };
  }

  createLogger(component = 'SYSTEM') {
    const config = this.getComponentConfig(component);
    
    const logger = new ContextLogger({
      level: config.level,
      enableConsole: config.enableConsole,
      enableFile: config.enableFile,
      logDir: config.logDir,
      maxFileSize: config.maxFileSize,
      maxFiles: config.maxFiles,
      colorEnabled: config.colorEnabled,
      component
    });

    this.loggers.set(component, logger);
    return logger;
  }

  getLogger(component = 'SYSTEM') {
    if (!this.loggers.has(component)) {
      this.createLogger(component);
    }
    return this.loggers.get(component);
  }

  refreshLoggers() {
    // Recreate all existing loggers with new config
    const components = Array.from(this.loggers.keys());
    this.loggers.clear();
    
    components.forEach(component => {
      this.createLogger(component);
    });
  }

  // Configuration validation
  validateConfig(config = this.config) {
    const errors = [];

    // Validate log level
    const validLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    if (!validLevels.includes(config.level)) {
      errors.push(`Invalid log level: ${config.level}. Must be one of: ${validLevels.join(', ')}`);
    }

    // Validate numeric values
    if (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0) {
      errors.push('maxFileSize must be a positive number');
    }

    if (typeof config.maxFiles !== 'number' || config.maxFiles <= 0) {
      errors.push('maxFiles must be a positive number');
    }

    // Validate component configurations
    if (config.components) {
      Object.keys(config.components).forEach(component => {
        const componentConfig = config.components[component];
        if (componentConfig.level && !validLevels.includes(componentConfig.level)) {
          errors.push(`Invalid log level for component ${component}: ${componentConfig.level}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Runtime configuration updates
  setLogLevel(level, component = null) {
    if (component) {
      this.config.components[component] = { 
        ...this.config.components[component], 
        level 
      };
    } else {
      this.config.level = level;
    }
    
    this.saveConfig();
    this.refreshLoggers();
  }

  enableFileLogging(enabled = true) {
    this.config.enableFile = enabled;
    this.saveConfig();
    this.refreshLoggers();
  }

  enableConsoleLogging(enabled = true) {
    this.config.enableConsole = enabled;
    this.saveConfig();
    this.refreshLoggers();
  }

  setLogDirectory(directory) {
    this.config.logDir = directory;
    this.saveConfig();
    this.refreshLoggers();
  }

  // Environment-based configuration
  configureForEnvironment(env) {
    const envConfigs = {
      development: {
        level: 'DEBUG',
        enableConsole: true,
        enableFile: true,
        colorEnabled: true
      },
      production: {
        level: 'INFO',
        enableConsole: false,
        enableFile: true,
        colorEnabled: false
      },
      test: {
        level: 'WARN',
        enableConsole: false,
        enableFile: false,
        colorEnabled: false
      }
    };

    const envConfig = envConfigs[env];
    if (envConfig) {
      this.updateConfig(envConfig);
    }
  }

  // Get configuration summary
  getConfigSummary() {
    const validation = this.validateConfig();
    
    return {
      configPath: this.configPath,
      currentLevel: this.config.level,
      consoleEnabled: this.config.enableConsole,
      fileEnabled: this.config.enableFile,
      logDirectory: this.config.logDir,
      maxFileSize: this.config.maxFileSize,
      maxFiles: this.config.maxFiles,
      componentCount: Object.keys(this.config.components).length,
      activeLoggers: this.loggers.size,
      validation,
      config: this.config
    };
  }

  // Development helpers
  createSampleConfig() {
    const sampleConfig = {
      level: 'DEBUG',
      enableConsole: true,
      enableFile: true,
      logDir: './logs',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      colorEnabled: true,
      components: {
        SYSTEM: { level: 'INFO' },
        VALIDATION: { level: 'DEBUG' },
        DECISION_ENGINE: { level: 'DEBUG' },
        COMMAND_EXECUTION: { level: 'INFO' },
        PERFORMANCE: { level: 'TRACE' }
      },
      filters: {
        excludePatterns: ['debug_spam'],
        includePatterns: ['*']
      },
      formatting: {
        timestamp: true,
        pid: true,
        component: true,
        metadata: true
      }
    };

    const samplePath = './logging-config.sample.json';
    fs.writeFileSync(samplePath, JSON.stringify(sampleConfig, null, 2));
    return samplePath;
  }
}

// Create default configuration manager
const configManager = new LoggingConfig();

// Export configuration system
module.exports = {
  LoggingConfig,
  configManager,
  DEFAULT_CONFIG
};