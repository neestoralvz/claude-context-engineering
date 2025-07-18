#!/usr/bin/env node

/**
 * Cache Debug Script for Ninu Factory Control
 * Analyzes Next.js build cache and provides cleanup recommendations
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeDirectory(dirPath, depth = 0) {
  if (!fs.existsSync(dirPath)) {
    return { size: 0, files: 0, directories: 0 };
  }

  let totalSize = 0;
  let fileCount = 0;
  let dirCount = 0;

  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        dirCount++;
        if (depth < 3) { // Limit recursion depth
          const subAnalysis = analyzeDirectory(itemPath, depth + 1);
          totalSize += subAnalysis.size;
          fileCount += subAnalysis.files;
          dirCount += subAnalysis.directories;
        }
      } else {
        fileCount++;
        totalSize += stats.size;
      }
    });
  } catch (error) {
    log(`Error analyzing directory ${dirPath}: ${error.message}`, 'red');
  }

  return { size: totalSize, files: fileCount, directories: dirCount };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeCacheFiles() {
  const projectRoot = process.cwd();
  
  log('📦 NINU FACTORY CONTROL - Cache Analysis Report', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`📍 Project Root: ${projectRoot}`, 'blue');
  log(`⏰ Analysis Time: ${new Date().toISOString()}`, 'blue');
  log('');

  // Analyze Next.js cache
  const nextDir = path.join(projectRoot, '.next');
  if (fs.existsSync(nextDir)) {
    const nextAnalysis = analyzeDirectory(nextDir);
    log('🏗️  NEXT.JS BUILD CACHE', 'yellow');
    log(`   Location: ${nextDir}`, 'bright');
    log(`   Size: ${formatBytes(nextAnalysis.size)}`, 'bright');
    log(`   Files: ${nextAnalysis.files.toLocaleString()}`, 'bright');
    log(`   Directories: ${nextAnalysis.directories.toLocaleString()}`, 'bright');
    
    // Analyze subdirectories
    const subdirs = ['cache', 'static', 'server', 'trace'];
    subdirs.forEach(subdir => {
      const subdirPath = path.join(nextDir, subdir);
      if (fs.existsSync(subdirPath)) {
        const subdirAnalysis = analyzeDirectory(subdirPath);
        log(`   └── ${subdir}: ${formatBytes(subdirAnalysis.size)}`, 'green');
      }
    });
    log('');
  } else {
    log('🏗️  NEXT.JS BUILD CACHE', 'yellow');
    log('   Status: No .next directory found', 'red');
    log('   Action: Run "npm run build" to generate cache', 'yellow');
    log('');
  }

  // Analyze node_modules
  const nodeModulesDir = path.join(projectRoot, 'node_modules');
  if (fs.existsSync(nodeModulesDir)) {
    const nodeModulesAnalysis = analyzeDirectory(nodeModulesDir, 0);
    log('📦 NODE_MODULES CACHE', 'yellow');
    log(`   Location: ${nodeModulesDir}`, 'bright');
    log(`   Size: ${formatBytes(nodeModulesAnalysis.size)}`, 'bright');
    log(`   Files: ${nodeModulesAnalysis.files.toLocaleString()}`, 'bright');
    log(`   Directories: ${nodeModulesAnalysis.directories.toLocaleString()}`, 'bright');
    log('');
  }

  // Analyze coverage reports
  const coverageDir = path.join(projectRoot, 'coverage');
  if (fs.existsSync(coverageDir)) {
    const coverageAnalysis = analyzeDirectory(coverageDir);
    log('🧪 TEST COVERAGE CACHE', 'yellow');
    log(`   Location: ${coverageDir}`, 'bright');
    log(`   Size: ${formatBytes(coverageAnalysis.size)}`, 'bright');
    log(`   Files: ${coverageAnalysis.files.toLocaleString()}`, 'bright');
    log('');
  }

  // Analyze logs
  const logsDir = path.join(projectRoot, 'logs');
  if (fs.existsSync(logsDir)) {
    const logsAnalysis = analyzeDirectory(logsDir);
    log('📝 APPLICATION LOGS', 'yellow');
    log(`   Location: ${logsDir}`, 'bright');
    log(`   Size: ${formatBytes(logsAnalysis.size)}`, 'bright');
    log(`   Files: ${logsAnalysis.files.toLocaleString()}`, 'bright');
    log('');
  }

  // Check for TypeScript build info
  const tsBuildInfo = path.join(projectRoot, 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfo)) {
    const stats = fs.statSync(tsBuildInfo);
    log('📘 TYPESCRIPT BUILD CACHE', 'yellow');
    log(`   Location: ${tsBuildInfo}`, 'bright');
    log(`   Size: ${formatBytes(stats.size)}`, 'bright');
    log(`   Modified: ${stats.mtime.toISOString()}`, 'bright');
    log('');
  }

  // Check for package-lock.json
  const packageLock = path.join(projectRoot, 'package-lock.json');
  if (fs.existsSync(packageLock)) {
    const stats = fs.statSync(packageLock);
    log('🔒 NPM LOCK FILE', 'yellow');
    log(`   Location: ${packageLock}`, 'bright');
    log(`   Size: ${formatBytes(stats.size)}`, 'bright');
    log(`   Modified: ${stats.mtime.toISOString()}`, 'bright');
    log('');
  }
}

function generateCleanupCommands() {
  log('🧹 CLEANUP RECOMMENDATIONS', 'magenta');
  log('='.repeat(60), 'magenta');
  
  log('🔥 SAFE CLEANUP (Recommended):', 'green');
  log('   npm run build:fresh     # Clean rebuild', 'bright');
  log('   rm -rf .next            # Remove Next.js cache', 'bright');
  log('   rm -rf coverage         # Remove test coverage', 'bright');
  log('   rm tsconfig.tsbuildinfo # Remove TypeScript cache', 'bright');
  log('');
  
  log('⚠️  AGGRESSIVE CLEANUP (Use with caution):', 'yellow');
  log('   rm -rf node_modules     # Remove dependencies', 'bright');
  log('   npm install             # Reinstall dependencies', 'bright');
  log('   rm -rf logs             # Clear application logs', 'bright');
  log('');
  
  log('🚨 NUCLEAR CLEANUP (Last resort):', 'red');
  log('   rm -rf .next node_modules coverage logs', 'bright');
  log('   rm tsconfig.tsbuildinfo package-lock.json', 'bright');
  log('   npm install && npm run build', 'bright');
  log('');
}

function checkDiskSpace() {
  log('💾 DISK SPACE ANALYSIS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  try {
    const { execSync } = require('child_process');
    
    // Try to get disk usage (Unix-like systems)
    try {
      const output = execSync('df -h .', { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        if (parts.length >= 4) {
          log(`   Available Space: ${parts[3]}`, 'bright');
          log(`   Used Space: ${parts[2]}`, 'bright');
          log(`   Total Space: ${parts[1]}`, 'bright');
          log(`   Usage: ${parts[4]}`, 'bright');
        }
      }
    } catch (e) {
      // Try Windows version
      try {
        const output = execSync('dir /-c', { encoding: 'utf8' });
        log('   Windows disk space check - see command output above', 'yellow');
      } catch (e2) {
        log('   Unable to determine disk space automatically', 'yellow');
      }
    }
  } catch (error) {
    log(`   Error checking disk space: ${error.message}`, 'red');
  }
  log('');
}

function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(process.cwd(), `cache-analysis-${timestamp}.txt`);
  
  // Capture console output
  let reportContent = '';
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ').replace(/\x1b\[[0-9;]*m/g, ''); // Remove ANSI codes
    reportContent += message + '\n';
    originalLog(...args);
  };
  
  try {
    analyzeCacheFiles();
    generateCleanupCommands();
    checkDiskSpace();
    
    // Restore original console.log
    console.log = originalLog;
    
    // Write report to file
    fs.writeFileSync(reportPath, reportContent);
    log(`📄 Report saved to: ${reportPath}`, 'green');
    
  } catch (error) {
    console.log = originalLog;
    log(`Error generating report: ${error.message}`, 'red');
  }
}

function showHelp() {
  log('📋 NINU FACTORY CONTROL - Cache Debug Tool', 'cyan');
  log('='.repeat(50), 'cyan');
  log('');
  log('Usage:', 'bright');
  log('  node scripts/debug-cache.js [options]', 'bright');
  log('');
  log('Options:', 'bright');
  log('  --help, -h     Show this help message', 'bright');
  log('  --report, -r   Generate a detailed report file', 'bright');
  log('  --clean, -c    Show cleanup commands only', 'bright');
  log('  --disk, -d     Show disk space analysis only', 'bright');
  log('');
  log('Examples:', 'bright');
  log('  node scripts/debug-cache.js              # Full analysis', 'bright');
  log('  node scripts/debug-cache.js --report     # Generate report file', 'bright');
  log('  node scripts/debug-cache.js --clean      # Show cleanup commands', 'bright');
  log('');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--clean') || args.includes('-c')) {
    generateCleanupCommands();
    return;
  }
  
  if (args.includes('--disk') || args.includes('-d')) {
    checkDiskSpace();
    return;
  }
  
  if (args.includes('--report') || args.includes('-r')) {
    generateReport();
    return;
  }
  
  // Default: run full analysis
  analyzeCacheFiles();
  generateCleanupCommands();
  checkDiskSpace();
  
  log('');
  log('💡 TIP: Run with --report to save analysis to file', 'cyan');
  log('💡 TIP: Run with --help to see all available options', 'cyan');
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeCacheFiles,
  generateCleanupCommands,
  checkDiskSpace,
  formatBytes,
  analyzeDirectory
};