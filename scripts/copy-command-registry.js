#!/usr/bin/env node

/**
 * Copy Command Registry to Public Directory
 * 
 * This script copies the command registry from .claude/config/command-registry.json
 * to public/.claude/config/command-registry.json so it's accessible in the deployed environment.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = '.claude/config/command-registry.json';
const TARGET_DIR = 'public/.claude/config';
const TARGET_PATH = 'public/.claude/config/command-registry.json';

function copyCommandRegistry() {
  try {
    console.log('🔧 Copying command registry for deployment...');
    
    // Check if source file exists
    if (!fs.existsSync(SOURCE_PATH)) {
      console.error(`❌ Source file not found: ${SOURCE_PATH}`);
      process.exit(1);
    }
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
      console.log(`📁 Created directory: ${TARGET_DIR}`);
    }
    
    // Read source file
    const commandRegistry = fs.readFileSync(SOURCE_PATH, 'utf8');
    
    // Validate JSON
    try {
      JSON.parse(commandRegistry);
    } catch (error) {
      console.error('❌ Invalid JSON in command registry:', error.message);
      process.exit(1);
    }
    
    // Write to target location
    fs.writeFileSync(TARGET_PATH, commandRegistry);
    
    console.log(`✅ Command registry copied to: ${TARGET_PATH}`);
    
    // Get file size for confirmation
    const stats = fs.statSync(TARGET_PATH);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Parse and show basic stats
    const registry = JSON.parse(commandRegistry);
    console.log(`📈 Commands included: ${registry.statistics.totalCommands}`);
    console.log(`🎯 Atomic: ${registry.statistics.atomicCommands}`);
    console.log(`⚡ Orchestrators: ${registry.statistics.orchestratorCommands}`);
    console.log(`🎮 Meta: ${registry.statistics.metaCommands}`);
    console.log(`🔧 System: ${registry.statistics.systemCommands}`);
    
  } catch (error) {
    console.error('❌ Error copying command registry:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  copyCommandRegistry();
}

module.exports = { copyCommandRegistry };