#!/usr/bin/env node

/**
 * Database Setup Script
 * Initializes SQLite database with proper schema and sample data
 */

const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const DatabaseManager = require('../src/database/DatabaseManager');

async function setupDatabase() {
  console.log('🚀 Setting up Claude Code Observability Database...\n');

  try {
    // Initialize database manager
    const dbManager = new DatabaseManager();
    
    console.log('📊 Initializing database...');
    await dbManager.initialize();
    
    console.log('✅ Database schema created successfully');
    
    // Create sample data for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('📝 Creating sample data for development...');
      await createSampleData(dbManager);
    }
    
    // Verify database setup
    console.log('🔍 Verifying database setup...');
    const stats = await dbManager.getStats();
    
    console.log('\n📈 Database Statistics:');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });
    
    // Test core functionality
    console.log('\n🧪 Testing core functionality...');
    await testCoreFunctionality(dbManager);
    
    await dbManager.close();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('🎯 You can now start the observability server');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function createSampleData(dbManager) {
  const now = new Date().toISOString();
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  try {
    // Create sample session
    const sessionId = 'sample-session-001';
    await dbManager.createSession({
      id: sessionId,
      start_time: anHourAgo,
      model_used: 'claude-sonnet-4',
      metadata: {
        environment: 'development',
        project: 'context-engineering',
        sample: true
      }
    });
    
    console.log('   ✅ Sample session created');
    
    // Create sample events
    const sampleEvents = [
      {
        session_id: sessionId,
        event_type: 'PreToolUse',
        tool_name: 'Read',
        hook_event: 'PreToolUse',
        timestamp: anHourAgo,
        success: true,
        data: { tool_input: { file_path: '/example/file.txt' } },
        metadata: { sample: true }
      },
      {
        session_id: sessionId,
        event_type: 'PostToolUse',
        tool_name: 'Read',
        hook_event: 'PostToolUse',
        timestamp: anHourAgo,
        execution_time_ms: 150,
        success: true,
        data: { tool_response: { success: true } },
        metadata: { sample: true }
      },
      {
        session_id: sessionId,
        event_type: 'PreToolUse',
        tool_name: 'Write',
        hook_event: 'PreToolUse',
        timestamp: now,
        success: true,
        data: { tool_input: { file_path: '/example/output.txt' } },
        metadata: { sample: true }
      }
    ];
    
    for (const event of sampleEvents) {
      await dbManager.logEvent(event);
    }
    
    console.log('   ✅ Sample events created');
    
    // Create sample metrics
    const sampleMetrics = [
      {
        session_id: sessionId,
        metric_name: 'command_success_rate',
        metric_value: 0.95,
        metric_unit: 'ratio',
        timestamp: anHourAgo,
        category: 'performance',
        metadata: { sample: true }
      },
      {
        session_id: sessionId,
        metric_name: 'avg_execution_time',
        metric_value: 180,
        metric_unit: 'ms',
        timestamp: anHourAgo,
        category: 'performance',
        metadata: { sample: true }
      },
      {
        session_id: sessionId,
        metric_name: 'context_optimization',
        metric_value: 0.78,
        metric_unit: 'ratio',
        timestamp: now,
        category: 'efficiency',
        metadata: { sample: true }
      },
      {
        session_id: sessionId,
        metric_name: 'total_commands',
        metric_value: 76,
        metric_unit: 'count',
        timestamp: now,
        category: 'usage',
        metadata: { sample: true }
      }
    ];
    
    for (const metric of sampleMetrics) {
      await dbManager.logMetric(metric);
    }
    
    console.log('   ✅ Sample metrics created');
    
    // Create sample command executions
    const sampleCommands = [
      {
        session_id: sessionId,
        command_name: 'Read',
        command_category: 'file_operations',
        execution_time_ms: 150,
        success: true,
        confidence_score: 0.95,
        input_data: { file_path: '/example/file.txt' },
        output_data: { success: true, content_length: 1024 },
        timestamp: anHourAgo
      },
      {
        session_id: sessionId,
        command_name: 'Write',
        command_category: 'file_operations',
        execution_time_ms: 200,
        success: true,
        confidence_score: 0.98,
        input_data: { file_path: '/example/output.txt' },
        output_data: { success: true, bytes_written: 512 },
        timestamp: now
      }
    ];
    
    for (const command of sampleCommands) {
      await dbManager.logCommandExecution(command);
    }
    
    console.log('   ✅ Sample command executions created');
    
    // Log system health
    await dbManager.logHealthEvent(
      'database',
      'healthy',
      'Database initialized successfully',
      { sample: true, setup_time: now }
    );
    
    console.log('   ✅ Sample health events created');
    
  } catch (error) {
    console.error('   ❌ Failed to create sample data:', error);
    throw error;
  }
}

async function testCoreFunctionality(dbManager) {
  try {
    // Test metrics summary
    const summary = await dbManager.getMetricsSummary('24h');
    console.log(`   ✅ Metrics summary: ${summary.length} metric types`);
    
    // Test command stats
    const commandStats = await dbManager.getCommandStats('24h');
    console.log(`   ✅ Command stats: ${commandStats.length} commands`);
    
    // Test system health
    const health = await dbManager.getSystemHealth();
    console.log(`   ✅ System health: ${health.length} health events`);
    
    // Test session management
    const activeSessions = await dbManager.getActiveSessions();
    console.log(`   ✅ Active sessions: ${activeSessions.length} sessions`);
    
  } catch (error) {
    console.error('   ❌ Core functionality test failed:', error);
    throw error;
  }
}

// Environment validation
async function validateEnvironment() {
  console.log('🔍 Validating environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
  }
  
  console.log(`   ✅ Node.js version: ${nodeVersion}`);
  
  // Check database directory
  const dbPath = process.env.DATABASE_PATH || './data/observability.db';
  const dbDir = path.dirname(dbPath);
  
  try {
    await fs.mkdir(dbDir, { recursive: true });
    console.log(`   ✅ Database directory: ${dbDir}`);
  } catch (error) {
    throw new Error(`Cannot create database directory: ${error.message}`);
  }
  
  // Check environment variables
  const requiredEnvVars = ['PORT', 'WS_PORT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.log('   📝 Using default values. Consider creating .env file.');
  } else {
    console.log('   ✅ Environment variables configured');
  }
  
  console.log('');
}

// Main execution
async function main() {
  try {
    await validateEnvironment();
    await setupDatabase();
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main();
} else {
  module.exports = { setupDatabase, createSampleData };
}