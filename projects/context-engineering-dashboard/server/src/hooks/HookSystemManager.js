const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

/**
 * HookSystemManager - Manages Claude Code hook system integration
 * Handles hook installation, monitoring, and data collection
 */
class HookSystemManager {
  constructor() {
    this.isInitialized = false;
    this.hooksInstalled = false;
    this.hookProcesses = new Map();
    this.eventHandlers = new Map();
  }

  async initialize() {
    try {
      console.log('🔗 Initializing Hook System Manager...');
      
      // Check if hooks are enabled
      if (process.env.HOOKS_ENABLED !== 'true') {
        console.log('ℹ️ Hooks disabled via environment variable');
        this.isInitialized = true;
        return;
      }

      // Check for hook files
      await this.validateHookFiles();
      
      // Install hooks if not already installed
      await this.installHooks();
      
      this.isInitialized = true;
      console.log('✅ Hook System Manager initialized');
      
    } catch (error) {
      console.error('❌ Hook System Manager initialization failed:', error);
      throw error;
    }
  }

  async validateHookFiles() {
    const hookDir = path.join(__dirname, '../../../hooks');
    const requiredHooks = [
      'claude-events-capture.py',
      'performance-monitor.py'
    ];
    
    for (const hookFile of requiredHooks) {
      const hookPath = path.join(hookDir, hookFile);
      try {
        await fs.access(hookPath);
        console.log(`✅ Hook file found: ${hookFile}`);
      } catch (error) {
        console.warn(`⚠️ Hook file missing: ${hookFile}`);
        // Create basic hook file if missing
        await this.createBasicHook(hookPath, hookFile);
      }
    }
  }

  async createBasicHook(hookPath, hookFile) {
    const basicHookContent = this.getBasicHookContent(hookFile);
    
    try {
      await fs.mkdir(path.dirname(hookPath), { recursive: true });
      await fs.writeFile(hookPath, basicHookContent);
      await fs.chmod(hookPath, '755'); // Make executable
      console.log(`✅ Created basic hook: ${hookFile}`);
    } catch (error) {
      console.error(`❌ Failed to create hook ${hookFile}:`, error);
    }
  }

  getBasicHookContent(hookFile) {
    const serverUrl = process.env.OBSERVABILITY_SERVER || 'http://localhost:3001';
    
    if (hookFile.includes('events-capture')) {
      return `#!/usr/bin/env python3
"""Claude Code Events Capture Hook"""
import json
import sys
import requests
from datetime import datetime

def main():
    try:
        # Read hook data from environment or stdin
        event_data = {
            "event_type": "hook_event",
            "tool_name": sys.argv[1] if len(sys.argv) > 1 else "unknown",
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "data": {
                "args": sys.argv[1:] if len(sys.argv) > 1 else []
            }
        }
        
        # Send to observability server
        response = requests.post(
            "${serverUrl}/api/hooks/event",
            json=event_data,
            timeout=5
        )
        
        print(f"Event logged: {response.status_code}")
        
    except Exception as e:
        print(f"Hook error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
`;
    } else if (hookFile.includes('performance-monitor')) {
      return `#!/usr/bin/env python3
"""Claude Code Performance Monitor Hook"""
import json
import sys
import requests
import time
from datetime import datetime

def main():
    try:
        start_time = time.time()
        
        # Monitor performance
        performance_data = {
            "session_id": "default",
            "metric_name": "hook_execution_time",
            "metric_value": (time.time() - start_time) * 1000,
            "metric_unit": "ms",
            "timestamp": datetime.now().isoformat(),
            "category": "performance"
        }
        
        # Send to observability server
        response = requests.post(
            "${serverUrl}/api/metrics",
            json=performance_data,
            timeout=5
        )
        
        print(f"Performance logged: {response.status_code}")
        
    except Exception as e:
        print(f"Performance hook error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
`;
    }
    
    return `#!/usr/bin/env python3
"""Basic Claude Code Hook"""
import sys
print("Basic hook executed")
`;
  }

  async installHooks() {
    try {
      // This would typically modify ~/.claude/settings.json
      // For now, we'll just mark hooks as conceptually installed
      this.hooksInstalled = true;
      console.log('✅ Hooks installation completed (simulated)');
      
      // In a real implementation, this would:
      // 1. Read ~/.claude/settings.json
      // 2. Add hook configurations
      // 3. Write back the updated settings
      
    } catch (error) {
      console.warn('⚠️ Hook installation failed:', error.message);
    }
  }

  // Event handler registration
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  // Emit events to registered handlers
  emit(eventType, data) {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Hook event handler error for ${eventType}:`, error);
      }
    });
  }

  // Process incoming hook data
  processHookEvent(eventData) {
    try {
      // Validate and process the event
      if (!eventData || !eventData.event_type) {
        throw new Error('Invalid hook event data');
      }

      // Emit to registered handlers
      this.emit(eventData.event_type, eventData);
      this.emit('all', eventData);

      return true;
    } catch (error) {
      console.error('Hook event processing error:', error);
      return false;
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      hooksInstalled: this.hooksInstalled,
      activeProcesses: this.hookProcesses.size,
      eventHandlers: this.eventHandlers.size
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Hook System Manager...');
    
    // Kill any running hook processes
    for (const [id, process] of this.hookProcesses) {
      try {
        process.kill();
        console.log(`✅ Hook process ${id} terminated`);
      } catch (error) {
        console.error(`❌ Error terminating hook process ${id}:`, error);
      }
    }
    
    this.hookProcesses.clear();
    this.eventHandlers.clear();
    this.isInitialized = false;
    
    console.log('✅ Hook System Manager shutdown complete');
  }
}

module.exports = HookSystemManager;