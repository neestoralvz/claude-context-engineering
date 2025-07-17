const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

/**
 * DatabaseManager - SQLite database management for observability data
 * Handles events, sessions, metrics, and analytics data storage
 */
class DatabaseManager {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data/observability.db';
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Ensure data directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Open database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          throw new Error(`Failed to open database: ${err.message}`);
        }
      });

      // Enable foreign keys
      await this.runQuery('PRAGMA foreign_keys = ON');
      
      // Initialize schema
      await this.createSchema();
      
      this.isInitialized = true;
      console.log(`✅ Database initialized: ${this.dbPath}`);
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createSchema() {
    const schema = `
      -- Claude Code Sessions
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        total_commands INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        total_cost REAL DEFAULT 0.0,
        model_used TEXT,
        status TEXT DEFAULT 'active',
        metadata TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Claude Code Events (from hooks)
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        event_type TEXT NOT NULL, -- PreToolUse, PostToolUse, etc.
        tool_name TEXT,
        hook_event TEXT,
        timestamp DATETIME NOT NULL,
        execution_time_ms INTEGER,
        success BOOLEAN,
        data TEXT, -- JSON payload
        metadata TEXT, -- JSON additional data
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- Performance Metrics
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_unit TEXT,
        timestamp DATETIME NOT NULL,
        category TEXT, -- performance, quality, usage, efficiency
        metadata TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- Command Executions
      CREATE TABLE IF NOT EXISTS command_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        command_name TEXT NOT NULL,
        command_category TEXT,
        execution_time_ms INTEGER,
        success BOOLEAN NOT NULL,
        confidence_score REAL,
        input_data TEXT, -- JSON
        output_data TEXT, -- JSON
        error_message TEXT,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- Cost Tracking
      CREATE TABLE IF NOT EXISTS cost_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        model TEXT NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cache_creation_tokens INTEGER DEFAULT 0,
        cache_read_tokens INTEGER DEFAULT 0,
        cost_usd REAL NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- Conversation Analysis (JSONL derived)
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        conversation_file TEXT,
        total_messages INTEGER,
        user_messages INTEGER,
        assistant_messages INTEGER,
        total_tokens INTEGER,
        avg_response_time_ms INTEGER,
        last_activity DATETIME,
        analysis_data TEXT, -- JSON insights
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      -- System Health
      CREATE TABLE IF NOT EXISTS system_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component TEXT NOT NULL,
        status TEXT NOT NULL, -- healthy, warning, error
        message TEXT,
        details TEXT, -- JSON
        timestamp DATETIME NOT NULL,
        resolved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_events_session_time ON events(session_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_tool_time ON events(tool_name, timestamp);
      CREATE INDEX IF NOT EXISTS idx_metrics_name_time ON metrics(metric_name, timestamp);
      CREATE INDEX IF NOT EXISTS idx_commands_name_time ON command_executions(command_name, timestamp);
      CREATE INDEX IF NOT EXISTS idx_cost_model_time ON cost_tracking(model, timestamp);
      CREATE INDEX IF NOT EXISTS idx_health_component_time ON system_health(component, timestamp);
    `;

    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await this.runQuery(statement);
      }
    }

    console.log('✅ Database schema created/updated');
    
    // Run migrations
    await this.runMigrations();
  }

  async runMigrations() {
    try {
      // Check if migrations table exists
      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT UNIQUE NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get list of executed migrations
      const executedMigrations = await this.allQuery('SELECT filename FROM migrations');
      const executedFilenames = executedMigrations.map(m => m.filename);

      // Check for migration files
      const migrationFiles = ['002-multi-agent.sql'];
      
      for (const filename of migrationFiles) {
        if (!executedFilenames.includes(filename)) {
          console.log(`🔄 Running migration: ${filename}`);
          
          const migrationPath = path.join(__dirname, 'migrations', filename);
          try {
            const migrationSQL = await fs.readFile(migrationPath, 'utf8');
            const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
              if (statement.trim()) {
                await this.runQuery(statement);
              }
            }
            
            // Mark migration as executed
            await this.runQuery('INSERT INTO migrations (filename) VALUES (?)', [filename]);
            console.log(`✅ Migration completed: ${filename}`);
            
          } catch (migrationError) {
            console.warn(`⚠️ Migration ${filename} not found or failed, creating tables dynamically`);
            // Create multi-agent tables directly if migration file not found
            await this.createMultiAgentTables();
            await this.runQuery('INSERT INTO migrations (filename) VALUES (?)', [filename]);
          }
        }
      }
      
    } catch (error) {
      console.error('Migration error:', error);
      // Fallback: create tables directly
      await this.createMultiAgentTables();
    }
  }

  async createMultiAgentTables() {
    const multiAgentSchema = `
      CREATE TABLE IF NOT EXISTS agent_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        agent_name TEXT,
        agent_type TEXT DEFAULT 'claude-code',
        parent_session_id TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        status TEXT DEFAULT 'active',
        coordination_role TEXT,
        priority INTEGER DEFAULT 1,
        resource_allocation REAL DEFAULT 1.0,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id),
        FOREIGN KEY (parent_session_id) REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS agent_coordination (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        primary_agent_id TEXT NOT NULL,
        secondary_agent_id TEXT NOT NULL,
        coordination_type TEXT NOT NULL,
        coordination_data TEXT,
        trigger_event TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        status TEXT DEFAULT 'active',
        outcome TEXT,
        performance_impact REAL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS resource_utilization (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        agent_id TEXT,
        resource_type TEXT NOT NULL,
        resource_value REAL NOT NULL,
        resource_unit TEXT NOT NULL,
        max_available REAL,
        utilization_percentage REAL,
        efficiency_score REAL,
        bottleneck_detected BOOLEAN DEFAULT 0,
        timestamp DATETIME NOT NULL,
        duration_ms INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        task_category TEXT NOT NULL,
        task_complexity INTEGER,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        execution_time_ms INTEGER,
        success_rate REAL,
        quality_score REAL,
        efficiency_metrics TEXT,
        comparative_baseline REAL,
        optimization_opportunities TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversation_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_file_path TEXT NOT NULL UNIQUE,
        file_size_bytes INTEGER,
        file_modified_time DATETIME,
        total_messages INTEGER,
        user_messages INTEGER,
        assistant_messages INTEGER,
        total_input_tokens INTEGER,
        total_output_tokens INTEGER,
        estimated_cost_usd REAL,
        avg_response_time_ms INTEGER,
        conversation_duration_ms INTEGER,
        conversation_start_time DATETIME,
        conversation_end_time DATETIME,
        pattern_analysis TEXT,
        cost_breakdown TEXT,
        productivity_metrics TEXT,
        optimization_suggestions TEXT,
        last_analyzed DATETIME NOT NULL,
        analysis_version TEXT DEFAULT '1.0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_agent_sessions_session_time ON agent_sessions(session_id, start_time);
      CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_status ON agent_sessions(agent_id, status);
      CREATE INDEX IF NOT EXISTS idx_agent_coordination_session_time ON agent_coordination(session_id, start_time);
      CREATE INDEX IF NOT EXISTS idx_resource_utilization_agent_time ON resource_utilization(agent_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_category ON agent_performance(agent_id, task_category);
      CREATE INDEX IF NOT EXISTS idx_conversation_analysis_file ON conversation_analysis(conversation_file_path);
    `;

    const statements = multiAgentSchema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await this.runQuery(statement);
      }
    }
  }

  // Core database operations
  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Session management
  async createSession(sessionData) {
    const sql = `
      INSERT INTO sessions (id, start_time, model_used, metadata)
      VALUES (?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      sessionData.id,
      sessionData.start_time,
      sessionData.model_used || 'claude-sonnet-4',
      JSON.stringify(sessionData.metadata || {})
    ]);
  }

  async updateSession(sessionId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const sql = `UPDATE sessions SET ${fields} WHERE id = ?`;
    return this.runQuery(sql, [...values, sessionId]);
  }

  async getSession(sessionId) {
    return this.getQuery('SELECT * FROM sessions WHERE id = ?', [sessionId]);
  }

  async getActiveSessions() {
    return this.allQuery('SELECT * FROM sessions WHERE status = ? ORDER BY start_time DESC', ['active']);
  }

  // Event logging
  async logEvent(eventData) {
    const sql = `
      INSERT INTO events (session_id, event_type, tool_name, hook_event, timestamp, 
                         execution_time_ms, success, data, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      eventData.session_id,
      eventData.event_type,
      eventData.tool_name,
      eventData.hook_event,
      eventData.timestamp,
      eventData.execution_time_ms,
      eventData.success,
      JSON.stringify(eventData.data || {}),
      JSON.stringify(eventData.metadata || {})
    ]);
  }

  // Metrics storage
  async logMetric(metricData) {
    const sql = `
      INSERT INTO metrics (session_id, metric_name, metric_value, metric_unit,
                          timestamp, category, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      metricData.session_id,
      metricData.metric_name,
      metricData.metric_value,
      metricData.metric_unit,
      metricData.timestamp,
      metricData.category,
      JSON.stringify(metricData.metadata || {})
    ]);
  }

  // Command execution tracking
  async logCommandExecution(commandData) {
    const sql = `
      INSERT INTO command_executions (session_id, command_name, command_category,
                                    execution_time_ms, success, confidence_score,
                                    input_data, output_data, error_message, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      commandData.session_id,
      commandData.command_name,
      commandData.command_category,
      commandData.execution_time_ms,
      commandData.success,
      commandData.confidence_score,
      JSON.stringify(commandData.input_data || {}),
      JSON.stringify(commandData.output_data || {}),
      commandData.error_message,
      commandData.timestamp
    ]);
  }

  // Analytics queries
  async getMetricsSummary(timeRange = '24h') {
    const timeClause = this.getTimeClause(timeRange);
    
    return this.allQuery(`
      SELECT 
        metric_name,
        COUNT(*) as count,
        AVG(metric_value) as avg_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        category
      FROM metrics 
      WHERE timestamp >= ${timeClause}
      GROUP BY metric_name, category
      ORDER BY avg_value DESC
    `);
  }

  async getCommandStats(timeRange = '24h') {
    const timeClause = this.getTimeClause(timeRange);
    
    return this.allQuery(`
      SELECT 
        command_name,
        COUNT(*) as executions,
        AVG(execution_time_ms) as avg_time,
        AVG(confidence_score) as avg_confidence,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
      FROM command_executions 
      WHERE timestamp >= ${timeClause}
      GROUP BY command_name
      ORDER BY executions DESC
    `);
  }

  async getCostSummary(timeRange = '24h') {
    const timeClause = this.getTimeClause(timeRange);
    
    return this.allQuery(`
      SELECT 
        model,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(cost_usd) as total_cost,
        COUNT(*) as sessions
      FROM cost_tracking 
      WHERE timestamp >= ${timeClause}
      GROUP BY model
      ORDER BY total_cost DESC
    `);
  }

  getTimeClause(timeRange) {
    const ranges = {
      '1h': "datetime('now', '-1 hour')",
      '6h': "datetime('now', '-6 hours')",
      '24h': "datetime('now', '-1 day')",
      '7d': "datetime('now', '-7 days')",
      '30d': "datetime('now', '-30 days')"
    };
    
    return ranges[timeRange] || ranges['24h'];
  }

  // Health and maintenance
  async logHealthEvent(component, status, message, details = {}) {
    const sql = `
      INSERT INTO system_health (component, status, message, details, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      component,
      status,
      message,
      JSON.stringify(details),
      new Date().toISOString()
    ]);
  }

  async getSystemHealth() {
    return this.allQuery(`
      SELECT * FROM system_health 
      WHERE resolved_at IS NULL 
      ORDER BY timestamp DESC
    `);
  }

  async cleanup(retentionDays = 90) {
    const cutoffDate = `datetime('now', '-${retentionDays} days')`;
    
    const tables = ['events', 'metrics', 'command_executions', 'cost_tracking'];
    let totalCleaned = 0;
    
    for (const table of tables) {
      const result = await this.runQuery(
        `DELETE FROM ${table} WHERE created_at < ${cutoffDate}`
      );
      totalCleaned += result.changes;
    }
    
    // Vacuum database to reclaim space
    await this.runQuery('VACUUM');
    
    console.log(`✅ Database cleanup: ${totalCleaned} records removed`);
    return totalCleaned;
  }

  async getStats() {
    const stats = {};
    
    const tables = ['sessions', 'events', 'metrics', 'command_executions', 'conversations', 
                   'agent_sessions', 'agent_coordination', 'resource_utilization', 'agent_performance', 'conversation_analysis'];
    
    for (const table of tables) {
      try {
        const result = await this.getQuery(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result.count;
      } catch (error) {
        // Table might not exist yet
        stats[table] = 0;
      }
    }
    
    return stats;
  }

  // Multi-Agent Session Management
  async createAgentSession(agentData) {
    const sql = `
      INSERT INTO agent_sessions (session_id, agent_id, agent_name, agent_type, 
                                 parent_session_id, start_time, coordination_role, 
                                 priority, resource_allocation, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      agentData.session_id,
      agentData.agent_id,
      agentData.agent_name || `Agent-${agentData.agent_id}`,
      agentData.agent_type || 'claude-code',
      agentData.parent_session_id,
      agentData.start_time || new Date().toISOString(),
      agentData.coordination_role || 'primary',
      agentData.priority || 1,
      agentData.resource_allocation || 1.0,
      JSON.stringify(agentData.metadata || {})
    ]);
  }

  async updateAgentSession(agentId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const sql = `UPDATE agent_sessions SET ${fields} WHERE agent_id = ?`;
    return this.runQuery(sql, [...values, agentId]);
  }

  async getActiveAgentSessions() {
    return this.allQuery(`
      SELECT a.*, s.model_used, s.total_commands 
      FROM agent_sessions a 
      JOIN sessions s ON a.session_id = s.id 
      WHERE a.status = 'active' 
      ORDER BY a.start_time DESC
    `);
  }

  async getAgentCoordination(timeRange = '24h') {
    const timeClause = this.getTimeClause(timeRange);
    
    return this.allQuery(`
      SELECT * FROM agent_coordination 
      WHERE start_time >= ${timeClause}
      ORDER BY start_time DESC
    `);
  }

  // Agent Coordination Tracking
  async logCoordinationEvent(coordinationData) {
    const sql = `
      INSERT INTO agent_coordination (session_id, primary_agent_id, secondary_agent_id,
                                    coordination_type, coordination_data, trigger_event,
                                    start_time, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      coordinationData.session_id,
      coordinationData.primary_agent_id,
      coordinationData.secondary_agent_id,
      coordinationData.coordination_type,
      JSON.stringify(coordinationData.coordination_data || {}),
      coordinationData.trigger_event,
      coordinationData.start_time || new Date().toISOString(),
      coordinationData.status || 'active',
      JSON.stringify(coordinationData.metadata || {})
    ]);
  }

  // Resource Utilization Tracking
  async logResourceUtilization(resourceData) {
    const sql = `
      INSERT INTO resource_utilization (session_id, agent_id, resource_type, resource_value,
                                      resource_unit, max_available, utilization_percentage,
                                      efficiency_score, bottleneck_detected, timestamp,
                                      duration_ms, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      resourceData.session_id,
      resourceData.agent_id,
      resourceData.resource_type,
      resourceData.resource_value,
      resourceData.resource_unit,
      resourceData.max_available,
      resourceData.utilization_percentage,
      resourceData.efficiency_score,
      resourceData.bottleneck_detected || false,
      resourceData.timestamp || new Date().toISOString(),
      resourceData.duration_ms,
      JSON.stringify(resourceData.metadata || {})
    ]);
  }

  async getResourceUtilization(agentId = null, timeRange = '24h') {
    const timeClause = this.getTimeClause(timeRange);
    const agentFilter = agentId ? `AND agent_id = '${agentId}'` : '';
    
    return this.allQuery(`
      SELECT * FROM resource_utilization 
      WHERE timestamp >= ${timeClause} ${agentFilter}
      ORDER BY timestamp DESC
    `);
  }

  // Agent Performance Tracking
  async logAgentPerformance(performanceData) {
    const sql = `
      INSERT INTO agent_performance (session_id, agent_id, task_category, task_complexity,
                                   start_time, end_time, execution_time_ms, success_rate,
                                   quality_score, efficiency_metrics, comparative_baseline,
                                   optimization_opportunities, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      performanceData.session_id,
      performanceData.agent_id,
      performanceData.task_category,
      performanceData.task_complexity,
      performanceData.start_time,
      performanceData.end_time,
      performanceData.execution_time_ms,
      performanceData.success_rate,
      performanceData.quality_score,
      JSON.stringify(performanceData.efficiency_metrics || {}),
      performanceData.comparative_baseline,
      JSON.stringify(performanceData.optimization_opportunities || {}),
      JSON.stringify(performanceData.metadata || {})
    ]);
  }

  async getAgentPerformanceComparison(timeRange = '24h') {
    const timeClause = this.getTimeClause(timeRange);
    
    return this.allQuery(`
      SELECT 
        agent_id,
        task_category,
        COUNT(*) as task_count,
        AVG(execution_time_ms) as avg_execution_time,
        AVG(success_rate) as avg_success_rate,
        AVG(quality_score) as avg_quality_score,
        AVG(comparative_baseline) as avg_baseline_performance
      FROM agent_performance 
      WHERE start_time >= ${timeClause}
      GROUP BY agent_id, task_category
      ORDER BY avg_quality_score DESC, avg_success_rate DESC
    `);
  }

  // Conversation Analysis Storage
  async storeConversationAnalysis(analysisData) {
    const sql = `
      INSERT OR REPLACE INTO conversation_analysis 
      (conversation_file_path, file_size_bytes, file_modified_time, total_messages,
       user_messages, assistant_messages, total_input_tokens, total_output_tokens,
       estimated_cost_usd, avg_response_time_ms, conversation_duration_ms,
       conversation_start_time, conversation_end_time, pattern_analysis,
       cost_breakdown, productivity_metrics, optimization_suggestions, last_analyzed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return this.runQuery(sql, [
      analysisData.conversation_file_path,
      analysisData.file_size_bytes,
      analysisData.file_modified_time,
      analysisData.total_messages,
      analysisData.user_messages,
      analysisData.assistant_messages,
      analysisData.total_input_tokens,
      analysisData.total_output_tokens,
      analysisData.estimated_cost_usd,
      analysisData.avg_response_time_ms,
      analysisData.conversation_duration_ms,
      analysisData.conversation_start_time,
      analysisData.conversation_end_time,
      JSON.stringify(analysisData.pattern_analysis || {}),
      JSON.stringify(analysisData.cost_breakdown || {}),
      JSON.stringify(analysisData.productivity_metrics || {}),
      JSON.stringify(analysisData.optimization_suggestions || {}),
      new Date().toISOString()
    ]);
  }

  async getConversationAnalysis(limit = 100) {
    return this.allQuery(`
      SELECT * FROM conversation_analysis 
      ORDER BY last_analyzed DESC 
      LIMIT ?
    `, [limit]);
  }

  async getConversationCostSummary(timeRange = '30d') {
    const timeClause = this.getTimeClause(timeRange);
    
    return this.allQuery(`
      SELECT 
        COUNT(*) as total_conversations,
        SUM(total_messages) as total_messages,
        SUM(total_input_tokens) as total_input_tokens,
        SUM(total_output_tokens) as total_output_tokens,
        SUM(estimated_cost_usd) as total_estimated_cost,
        AVG(avg_response_time_ms) as avg_response_time
      FROM conversation_analysis 
      WHERE last_analyzed >= ${timeClause}
    `);
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('✅ Database connection closed');
          }
          resolve();
        });
      });
    }
  }
}

module.exports = DatabaseManager;