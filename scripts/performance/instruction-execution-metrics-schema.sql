-- Instruction Execution Time Metrics Database Schema
-- Context Engineering System - Execution Time Tracking
-- P55/P56 Compliance: Real tool execution with transparency

-- Main instruction execution metrics table
CREATE TABLE IF NOT EXISTS instruction_execution_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT NOT NULL,
    instruction_id TEXT NOT NULL,
    instruction_type TEXT NOT NULL,
    user_instruction TEXT,
    
    -- Timing metrics (all in milliseconds)
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    total_execution_time_ms INTEGER NOT NULL,
    
    -- Phase timing breakdown
    routing_time_ms INTEGER DEFAULT 0,
    tool_execution_time_ms INTEGER DEFAULT 0,
    verification_time_ms INTEGER DEFAULT 0,
    response_generation_time_ms INTEGER DEFAULT 0,
    
    -- Execution details
    tool_calls_count INTEGER DEFAULT 0,
    parallel_tool_calls INTEGER DEFAULT 0,
    tool_call_sequence TEXT, -- JSON array of tool calls
    success BOOLEAN NOT NULL,
    error_count INTEGER DEFAULT 0,
    
    -- Response metrics
    claude_response_length INTEGER DEFAULT 0,
    context_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    
    -- Compliance metrics
    p55_compliance BOOLEAN DEFAULT TRUE,
    p56_transparency BOOLEAN DEFAULT TRUE,
    real_work_ratio REAL DEFAULT 1.0,
    
    -- Performance classifications
    complexity_score REAL DEFAULT 0.0,
    performance_tier TEXT DEFAULT 'standard', -- 'fast', 'standard', 'complex', 'critical'
    optimization_opportunities TEXT
);

-- Tool-level execution metrics (detailed breakdown)
CREATE TABLE IF NOT EXISTS tool_execution_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    instruction_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Tool identification
    tool_name TEXT NOT NULL,
    tool_call_index INTEGER NOT NULL,
    tool_parameters TEXT, -- JSON of parameters
    
    -- Timing details
    tool_start_time INTEGER NOT NULL,
    tool_end_time INTEGER NOT NULL,
    tool_execution_time_ms INTEGER NOT NULL,
    
    -- Execution results
    success BOOLEAN NOT NULL,
    error_message TEXT,
    result_size_bytes INTEGER DEFAULT 0,
    
    -- Performance metrics
    memory_usage_mb REAL DEFAULT 0.0,
    cpu_usage_percent REAL DEFAULT 0.0,
    io_operations INTEGER DEFAULT 0,
    
    -- P55/P56 compliance
    real_execution BOOLEAN DEFAULT TRUE,
    transparency_provided BOOLEAN DEFAULT TRUE,
    evidence_documented BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (instruction_id) REFERENCES instruction_execution_metrics(instruction_id)
);

-- Command routing metrics (decision engine performance)
CREATE TABLE IF NOT EXISTS command_routing_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    instruction_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Routing details
    initial_classification TEXT NOT NULL,
    command_ecosystem_activated TEXT, -- JSON array of activated commands
    decision_tree_path TEXT, -- JSON of decision path
    
    -- Timing metrics
    classification_time_ms INTEGER NOT NULL,
    command_selection_time_ms INTEGER NOT NULL,
    total_routing_time_ms INTEGER NOT NULL,
    
    -- Routing quality
    routing_confidence REAL DEFAULT 0.0,
    command_utilization_rate REAL DEFAULT 0.0,
    optimal_routing BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (instruction_id) REFERENCES instruction_execution_metrics(instruction_id)
);

-- Verification phase metrics
CREATE TABLE IF NOT EXISTS verification_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    instruction_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Verification phases
    mathematical_verification_time_ms INTEGER DEFAULT 0,
    compliance_verification_time_ms INTEGER DEFAULT 0,
    quality_verification_time_ms INTEGER DEFAULT 0,
    output_verification_time_ms INTEGER DEFAULT 0,
    total_verification_time_ms INTEGER NOT NULL,
    
    -- Verification results
    mathematical_precision REAL DEFAULT 1.0,
    compliance_score REAL DEFAULT 1.0,
    quality_score REAL DEFAULT 1.0,
    overall_verification_success BOOLEAN DEFAULT TRUE,
    
    -- Error detection
    errors_detected INTEGER DEFAULT 0,
    errors_resolved INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    
    FOREIGN KEY (instruction_id) REFERENCES instruction_execution_metrics(instruction_id)
);

-- Performance aggregation view for dashboard
CREATE VIEW IF NOT EXISTS performance_summary AS
SELECT 
    DATE(timestamp) as date,
    instruction_type,
    COUNT(*) as instruction_count,
    ROUND(AVG(total_execution_time_ms), 2) as avg_execution_time_ms,
    ROUND(MIN(total_execution_time_ms), 2) as min_execution_time_ms,
    ROUND(MAX(total_execution_time_ms), 2) as max_execution_time_ms,
    ROUND(AVG(tool_calls_count), 2) as avg_tool_calls,
    ROUND(AVG(real_work_ratio), 4) as avg_real_work_ratio,
    ROUND(AVG(CASE WHEN success THEN 1 ELSE 0 END), 4) as success_rate,
    ROUND(AVG(CASE WHEN p55_compliance THEN 1 ELSE 0 END), 4) as p55_compliance_rate,
    ROUND(AVG(CASE WHEN p56_transparency THEN 1 ELSE 0 END), 4) as p56_transparency_rate
FROM instruction_execution_metrics
GROUP BY DATE(timestamp), instruction_type
ORDER BY date DESC, instruction_type;

-- Real-time performance metrics view (last 24 hours)
CREATE VIEW IF NOT EXISTS realtime_performance AS
SELECT 
    instruction_type,
    COUNT(*) as recent_count,
    ROUND(AVG(total_execution_time_ms), 2) as avg_execution_time_ms,
    ROUND(STDDEV(total_execution_time_ms), 2) as stddev_execution_time_ms,
    ROUND(AVG(tool_calls_count), 2) as avg_tool_calls,
    ROUND(AVG(real_work_ratio), 4) as real_work_ratio,
    ROUND(AVG(CASE WHEN success THEN 1 ELSE 0 END), 4) as success_rate,
    MIN(timestamp) as oldest_entry,
    MAX(timestamp) as newest_entry
FROM instruction_execution_metrics
WHERE timestamp > datetime('now', '-24 hours')
GROUP BY instruction_type
ORDER BY recent_count DESC;

-- Performance alerts thresholds
CREATE TABLE IF NOT EXISTS performance_thresholds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT UNIQUE NOT NULL,
    threshold_value REAL NOT NULL,
    comparison_operator TEXT NOT NULL, -- 'gt', 'lt', 'eq', 'gte', 'lte'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    alert_enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default performance thresholds
INSERT OR REPLACE INTO performance_thresholds (metric_name, threshold_value, comparison_operator, severity, description) VALUES
('max_execution_time_standard', 30000, 'gt', 'medium', 'Standard instructions should complete within 30 seconds'),
('max_execution_time_complex', 120000, 'gt', 'high', 'Complex instructions should complete within 2 minutes'),
('min_success_rate', 0.877, 'lt', 'high', 'Success rate should be ≥87.7%'),
('min_p55_compliance', 0.95, 'lt', 'critical', 'P55 compliance should be ≥95%'),
('min_p56_transparency', 0.95, 'lt', 'critical', 'P56 transparency should be ≥95%'),
('min_real_work_ratio', 0.70, 'lt', 'medium', 'Real work ratio should be ≥70%'),
('max_tool_calls_simple', 5, 'gt', 'low', 'Simple instructions should use ≤5 tool calls'),
('max_tool_calls_complex', 20, 'gt', 'medium', 'Complex instructions should use ≤20 tool calls'),
('max_response_time_verification', 5000, 'gt', 'high', 'Verification phase should complete within 5 seconds'),
('max_routing_time', 2000, 'gt', 'medium', 'Command routing should complete within 2 seconds');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_instruction_timestamp ON instruction_execution_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_instruction_session ON instruction_execution_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_instruction_type ON instruction_execution_metrics(instruction_type);
CREATE INDEX IF NOT EXISTS idx_instruction_success ON instruction_execution_metrics(success);
CREATE INDEX IF NOT EXISTS idx_instruction_performance_tier ON instruction_execution_metrics(performance_tier);

CREATE INDEX IF NOT EXISTS idx_tool_timestamp ON tool_execution_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_tool_instruction ON tool_execution_metrics(instruction_id);
CREATE INDEX IF NOT EXISTS idx_tool_name ON tool_execution_metrics(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_success ON tool_execution_metrics(success);

CREATE INDEX IF NOT EXISTS idx_routing_timestamp ON command_routing_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_routing_instruction ON command_routing_metrics(instruction_id);

CREATE INDEX IF NOT EXISTS idx_verification_timestamp ON verification_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_verification_instruction ON verification_metrics(instruction_id);

-- Database schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT OR REPLACE INTO schema_version (version, description) VALUES 
('1.0.0', 'Initial instruction execution metrics schema with P55/P56 compliance');