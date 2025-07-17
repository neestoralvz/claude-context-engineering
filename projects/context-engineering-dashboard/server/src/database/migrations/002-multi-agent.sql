-- Multi-Agent Support Database Migration
-- Adds tables for multi-agent session tracking, coordination, and resource monitoring

-- Agent Sessions (extends sessions for multi-agent coordination)
CREATE TABLE IF NOT EXISTS agent_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT,
  agent_type TEXT DEFAULT 'claude-code', -- claude-code, auxiliary, coordinator
  parent_session_id TEXT, -- Links to coordinating session
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status TEXT DEFAULT 'active', -- active, paused, completed, failed
  coordination_role TEXT, -- primary, secondary, observer, coordinator
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  resource_allocation REAL DEFAULT 1.0, -- 0.0-1.0 resource percentage
  metadata TEXT, -- JSON: {project_path, worktree_branch, specialized_task}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (parent_session_id) REFERENCES sessions(id)
);

-- Agent Coordination Events
CREATE TABLE IF NOT EXISTS agent_coordination (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  primary_agent_id TEXT NOT NULL,
  secondary_agent_id TEXT NOT NULL,
  coordination_type TEXT NOT NULL, -- handoff, collaboration, resource_sharing, conflict_resolution
  coordination_data TEXT, -- JSON: interaction details
  trigger_event TEXT, -- What triggered this coordination
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status TEXT DEFAULT 'active', -- active, completed, failed, aborted
  outcome TEXT, -- success, partial_success, failure
  performance_impact REAL, -- -1.0 to 1.0 (negative = degraded, positive = improved)
  metadata TEXT, -- JSON: additional coordination context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (primary_agent_id) REFERENCES agent_sessions(agent_id),
  FOREIGN KEY (secondary_agent_id) REFERENCES agent_sessions(agent_id)
);

-- Resource Utilization Tracking
CREATE TABLE IF NOT EXISTS resource_utilization (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  agent_id TEXT,
  resource_type TEXT NOT NULL, -- memory, tokens, context, cpu, disk_io, network
  resource_value REAL NOT NULL,
  resource_unit TEXT NOT NULL, -- MB, tokens, percentage, ms
  max_available REAL, -- Maximum available for this resource
  utilization_percentage REAL, -- Calculated percentage of max
  efficiency_score REAL, -- 0.0-1.0 efficiency rating
  bottleneck_detected BOOLEAN DEFAULT 0,
  timestamp DATETIME NOT NULL,
  duration_ms INTEGER, -- How long this utilization lasted
  metadata TEXT, -- JSON: {task_context, resource_details}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (agent_id) REFERENCES agent_sessions(agent_id)
);

-- Agent Performance Comparison
CREATE TABLE IF NOT EXISTS agent_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  task_category TEXT NOT NULL, -- coding, analysis, documentation, debugging
  task_complexity INTEGER, -- 1-10 complexity scale
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  execution_time_ms INTEGER,
  success_rate REAL, -- 0.0-1.0
  quality_score REAL, -- 0.0-1.0 based on validation
  efficiency_metrics TEXT, -- JSON: {tokens_per_task, context_switches, etc}
  comparative_baseline REAL, -- Performance vs expected baseline
  optimization_opportunities TEXT, -- JSON: identified improvements
  metadata TEXT, -- JSON: task details and context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (agent_id) REFERENCES agent_sessions(agent_id)
);

-- Conversation Analysis Cache (for JSONL processing)
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
  pattern_analysis TEXT, -- JSON: usage patterns, command frequency
  cost_breakdown TEXT, -- JSON: detailed cost analysis
  productivity_metrics TEXT, -- JSON: efficiency insights
  optimization_suggestions TEXT, -- JSON: improvement recommendations
  last_analyzed DATETIME NOT NULL,
  analysis_version TEXT DEFAULT '1.0',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Multi-Agent Queries
CREATE INDEX IF NOT EXISTS idx_agent_sessions_session_time ON agent_sessions(session_id, start_time);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_status ON agent_sessions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_coordination_session_time ON agent_coordination(session_id, start_time);
CREATE INDEX IF NOT EXISTS idx_agent_coordination_agents ON agent_coordination(primary_agent_id, secondary_agent_id);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_agent_time ON resource_utilization(agent_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_type_time ON resource_utilization(resource_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_category ON agent_performance(agent_id, task_category);
CREATE INDEX IF NOT EXISTS idx_conversation_analysis_file ON conversation_analysis(conversation_file_path);
CREATE INDEX IF NOT EXISTS idx_conversation_analysis_modified ON conversation_analysis(file_modified_time);

-- Views for Common Multi-Agent Queries
CREATE VIEW IF NOT EXISTS active_agent_sessions AS
SELECT 
  a.session_id,
  a.agent_id,
  a.agent_name,
  a.agent_type,
  a.coordination_role,
  a.start_time,
  a.resource_allocation,
  s.model_used,
  s.total_commands,
  s.status as session_status
FROM agent_sessions a
JOIN sessions s ON a.session_id = s.id
WHERE a.status = 'active';

CREATE VIEW IF NOT EXISTS coordination_summary AS
SELECT 
  session_id,
  coordination_type,
  COUNT(*) as event_count,
  AVG(performance_impact) as avg_impact,
  SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
FROM agent_coordination
WHERE start_time >= datetime('now', '-24 hours')
GROUP BY session_id, coordination_type;

CREATE VIEW IF NOT EXISTS resource_efficiency_summary AS
SELECT 
  agent_id,
  resource_type,
  AVG(utilization_percentage) as avg_utilization,
  AVG(efficiency_score) as avg_efficiency,
  COUNT(CASE WHEN bottleneck_detected = 1 THEN 1 END) as bottleneck_count
FROM resource_utilization
WHERE timestamp >= datetime('now', '-24 hours')
GROUP BY agent_id, resource_type;