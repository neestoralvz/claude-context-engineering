// Context Engineering Logger System
// Structured logging with levels, formatting, and persistence

const fs = require('fs');
const path = require('path');
const util = require('util');

// Log levels with priorities
const LOG_LEVELS = {
  ERROR: { priority: 0, color: '\x1b[31m', symbol: '❌' },
  WARN: { priority: 1, color: '\x1b[33m', symbol: '⚠️' },
  INFO: { priority: 2, color: '\x1b[36m', symbol: 'ℹ️' },
  DEBUG: { priority: 3, color: '\x1b[37m', symbol: '🔍' },
  TRACE: { priority: 4, color: '\x1b[90m', symbol: '🔬' }
};

class ContextLogger {
  constructor(options = {}) {
    this.level = options.level || 'INFO';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.logDir = options.logDir || './logs';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.colorEnabled = options.colorEnabled !== false;
    this.component = options.component || 'SYSTEM';
    
    // Create logs directory if it doesn't exist
    if (this.enableFile) {
      this.ensureLogDirectory();
    }
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  shouldLog(level) {
    return LOG_LEVELS[level].priority <= LOG_LEVELS[this.level].priority;
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const levelInfo = LOG_LEVELS[level];
    
    // Base log entry
    const logEntry = {
      timestamp,
      level,
      component: this.component,
      message: typeof message === 'string' ? message : util.inspect(message),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      pid: process.pid
    };

    // Format for console output
    const consoleFormat = this.colorEnabled
      ? `${levelInfo.color}${levelInfo.symbol} ${timestamp} [${this.component}] ${level}: ${logEntry.message}\x1b[0m`
      : `${levelInfo.symbol} ${timestamp} [${this.component}] ${level}: ${logEntry.message}`;

    // Format for file output (JSON)
    const fileFormat = JSON.stringify(logEntry) + '\n';

    return { consoleFormat, fileFormat, logEntry };
  }

  writeToFile(content) {
    if (!this.enableFile) return;

    const logFile = path.join(this.logDir, `context-engineering-${new Date().toISOString().split('T')[0]}.log`);
    
    try {
      // Check file size and rotate if needed
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxFileSize) {
          this.rotateLogFile(logFile);
        }
      }

      fs.appendFileSync(logFile, content);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  rotateLogFile(logFile) {
    const logDir = path.dirname(logFile);
    const baseName = path.basename(logFile, '.log');
    
    // Remove oldest log file if we exceed maxFiles
    const existingFiles = fs.readdirSync(logDir)
      .filter(file => file.startsWith(baseName) && file.endsWith('.log'))
      .sort()
      .reverse();

    if (existingFiles.length >= this.maxFiles) {
      const oldestFile = existingFiles[existingFiles.length - 1];
      fs.unlinkSync(path.join(logDir, oldestFile));
    }

    // Rotate current file
    const rotatedFile = `${baseName}-${Date.now()}.log`;
    fs.renameSync(logFile, path.join(logDir, rotatedFile));
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, metadata);

    // Console output
    if (this.enableConsole) {
      console.log(formatted.consoleFormat);
      
      // Add metadata to console if present
      if (metadata && Object.keys(metadata).length > 0) {
        console.log('  Metadata:', JSON.stringify(metadata, null, 2));
      }
    }

    // File output
    if (this.enableFile) {
      this.writeToFile(formatted.fileFormat);
    }

    return formatted.logEntry;
  }

  // Convenience methods for each log level
  error(message, metadata = {}) {
    return this.log('ERROR', message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log('WARN', message, metadata);
  }

  info(message, metadata = {}) {
    return this.log('INFO', message, metadata);
  }

  debug(message, metadata = {}) {
    return this.log('DEBUG', message, metadata);
  }

  trace(message, metadata = {}) {
    return this.log('TRACE', message, metadata);
  }

  // Context-specific logging methods
  commandExecution(command, context = {}) {
    return this.info(`Command executed: ${command}`, {
      command,
      context,
      type: 'command_execution'
    });
  }

  validationResult(command, result, context = {}) {
    const level = result.validation_passed ? 'INFO' : 'WARN';
    return this.log(level, `Validation ${result.validation_passed ? 'passed' : 'failed'} for ${command}`, {
      command,
      result,
      context,
      type: 'validation_result'
    });
  }

  decisionEngine(analysis, context = {}) {
    return this.info('Decision engine analysis completed', {
      analysis,
      context,
      type: 'decision_engine'
    });
  }

  systemEvent(event, details = {}) {
    return this.info(`System event: ${event}`, {
      event,
      details,
      type: 'system_event'
    });
  }

  // Performance logging
  performanceMetric(metric, value, unit = 'ms', context = {}) {
    return this.debug(`Performance metric: ${metric} = ${value}${unit}`, {
      metric,
      value,
      unit,
      context,
      type: 'performance_metric'
    });
  }

  // Error tracking with stack traces
  errorWithStack(error, context = {}) {
    return this.error(error.message, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      type: 'error_with_stack'
    });
  }

  // Create child logger with different component
  child(component, options = {}) {
    return new ContextLogger({
      level: this.level,
      enableConsole: this.enableConsole,
      enableFile: this.enableFile,
      logDir: this.logDir,
      maxFileSize: this.maxFileSize,
      maxFiles: this.maxFiles,
      colorEnabled: this.colorEnabled,
      component,
      ...options
    });
  }
}

// Create default logger instance
const defaultLogger = new ContextLogger({
  component: 'CONTEXT_ENGINEERING',
  level: process.env.LOG_LEVEL || 'INFO'
});

// Export logger class and default instance
module.exports = {
  ContextLogger,
  logger: defaultLogger,
  LOG_LEVELS
};