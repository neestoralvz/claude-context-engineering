#!/bin/bash

# Setup Execution Timing Hooks
# Context Engineering System - Claude Hooks Configuration
# P55/P56 Compliance: Real tool execution with transparency

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLAUDE_SETTINGS_DIR="$HOME/.claude"
CLAUDE_SETTINGS_FILE="$CLAUDE_SETTINGS_DIR/settings.json"
COLLECTOR_SCRIPT="$SCRIPT_DIR/execution-time-collector.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Execution Timing Hooks${NC}"

# Ensure Claude settings directory exists
mkdir -p "$CLAUDE_SETTINGS_DIR"

# Make collector script executable
chmod +x "$COLLECTOR_SCRIPT"

# Backup existing settings if they exist
if [[ -f "$CLAUDE_SETTINGS_FILE" ]]; then
    backup_file="$CLAUDE_SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CLAUDE_SETTINGS_FILE" "$backup_file"
    echo -e "${YELLOW}📋 Backed up existing settings to: $backup_file${NC}"
fi

# Create or update hooks configuration
create_hooks_config() {
    local settings_file="$1"
    
    # Read existing settings or create empty object
    local existing_settings="{}"
    if [[ -f "$settings_file" ]]; then
        existing_settings=$(cat "$settings_file")
    fi
    
    # Create new hooks configuration
    local hooks_config=$(cat << EOF
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 '$COLLECTOR_SCRIPT'",
            "timeout": 10
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 '$COLLECTOR_SCRIPT'",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 '$COLLECTOR_SCRIPT'",
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 '$COLLECTOR_SCRIPT'",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
EOF
    )
    
    # Merge with existing settings using jq
    if command -v jq &> /dev/null; then
        echo "$existing_settings" | jq --argjson hooks "$(echo "$hooks_config" | jq .hooks)" '. + {hooks: $hooks}' > "$settings_file"
    else
        # Fallback if jq is not available
        echo -e "${YELLOW}⚠️  jq not found, creating new settings file${NC}"
        echo "$hooks_config" > "$settings_file"
    fi
}

# Create hooks configuration
create_hooks_config "$CLAUDE_SETTINGS_FILE"

echo -e "${GREEN}✅ Execution timing hooks configured successfully${NC}"

# Verify configuration
echo -e "\n${BLUE}📋 Hooks Configuration Summary:${NC}"
echo "Settings file: $CLAUDE_SETTINGS_FILE"
echo "Collector script: $COLLECTOR_SCRIPT"

if command -v jq &> /dev/null; then
    echo -e "\n${BLUE}🔍 Configured Hook Events:${NC}"
    cat "$CLAUDE_SETTINGS_FILE" | jq -r '.hooks | keys[]' | while read event; do
        echo "  ✓ $event"
    done
else
    echo -e "${YELLOW}⚠️  Install jq to view detailed configuration${NC}"
fi

# Test collector script
echo -e "\n${BLUE}🧪 Testing Collector Script:${NC}"
if python3 -c "import json, sqlite3, os, time, uuid; print('✓ All required modules available')"; then
    echo -e "${GREEN}✅ Python dependencies satisfied${NC}"
else
    echo -e "${RED}❌ Missing Python dependencies${NC}"
    exit 1
fi

# Create directories
echo -e "\n${BLUE}📁 Creating Required Directories:${NC}"
mkdir -p "$PROJECT_ROOT/scripts/results/performance"
mkdir -p "$PROJECT_ROOT/scripts/results/compliance/metrics"
echo -e "${GREEN}✅ Directories created${NC}"

# Initialize database
echo -e "\n${BLUE}🗄️  Initializing Execution Metrics Database:${NC}"
python3 << EOF
import sys
sys.path.append('$SCRIPT_DIR')
try:
    from pathlib import Path
    import sqlite3
    
    schema_file = Path('$SCRIPT_DIR/instruction-execution-metrics-schema.sql')
    db_file = Path('$PROJECT_ROOT/scripts/results/performance/execution_metrics.db')
    
    if schema_file.exists():
        with sqlite3.connect(str(db_file)) as conn:
            with open(schema_file, 'r') as f:
                conn.executescript(f.read())
        print('✅ Database initialized successfully')
    else:
        print('⚠️  Schema file not found')
except Exception as e:
    print(f'❌ Database initialization failed: {e}')
EOF

echo -e "\n${GREEN}🎉 Execution Timing Hooks Setup Complete!${NC}"
echo -e "\n${BLUE}📝 Next Steps:${NC}"
echo "1. Restart Claude Code to load the new hooks"
echo "2. Run any command to start collecting timing metrics"
echo "3. Check timing data in:"
echo "   - Database: $PROJECT_ROOT/scripts/results/performance/execution_metrics.db"
echo "   - Logs: $PROJECT_ROOT/scripts/results/performance/execution_timing.log"
echo ""
echo -e "${YELLOW}💡 Pro Tip:${NC} Use 'sqlite3 \$DB_FILE \"SELECT * FROM performance_summary\"' to view aggregated metrics"

# Show configuration verification
echo -e "\n${BLUE}🔍 Configuration Verification:${NC}"
if [[ -f "$CLAUDE_SETTINGS_FILE" ]]; then
    echo -e "${GREEN}✅ Settings file exists${NC}"
    if command -v jq &> /dev/null; then
        if jq empty "$CLAUDE_SETTINGS_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ Settings file is valid JSON${NC}"
            hook_count=$(jq '.hooks | length' "$CLAUDE_SETTINGS_FILE" 2>/dev/null || echo "0")
            echo -e "${GREEN}✅ Configured $hook_count hook events${NC}"
        else
            echo -e "${RED}❌ Settings file contains invalid JSON${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Settings file not created${NC}"
fi

if [[ -x "$COLLECTOR_SCRIPT" ]]; then
    echo -e "${GREEN}✅ Collector script is executable${NC}"
else
    echo -e "${RED}❌ Collector script is not executable${NC}"
fi

echo -e "\n${BLUE}📊 Performance Monitoring Ready!${NC}"