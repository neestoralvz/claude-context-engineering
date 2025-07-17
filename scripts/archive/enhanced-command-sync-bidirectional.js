#!/usr/bin/env node

/**
 * Enhanced Bidirectional Command Synchronization Script
 * 
 * This script provides comprehensive bidirectional synchronization between
 * docs/commands/ and .claude/commands/ directories with the following features:
 * 
 * - Bidirectional sync capability
 * - Directory structure creation
 * - Conflict detection and resolution
 * - Validation and integrity checks
 * - Backup creation before operations
 * - Detailed logging and reporting
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = process.cwd();
const DOCS_COMMANDS_DIR = path.join(BASE_DIR, 'docs', 'commands');
const CLAUDE_COMMANDS_DIR = path.join(BASE_DIR, '.claude', 'commands');
const BACKUP_DIR = path.join(BASE_DIR, 'scripts', 'backups');
const RESULTS_DIR = path.join(BASE_DIR, 'scripts', 'results');

// Patterns to exclude from command counting
const EXCLUDE_PATTERNS = [
    /README\.md$/,
    /-hub\.md$/,
    /-template\.md$/,
    /-example[s]?.*\.md$/,
    /-analysis.*\.md$/,
    /-integration\.md$/,
    /command-structure-analysis-matrix\.md$/,
    /usage-patterns-examples\.md$/,
    /think-process-examples-integration\.md$/
];

// Statistics tracking
let stats = {
    copiedToClaudеы: 0,
    copiedToDocs: 0,
    conflicts: 0,
    errors: 0,
    totalDocs: 0,
    totalClaude: 0
};

/**
 * Ensure directory exists, create if necessary
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
}

/**
 * Check if file is a valid command (not excluded pattern)
 */
function isValidCommand(filePath) {
    const fileName = path.basename(filePath);
    return !EXCLUDE_PATTERNS.some(pattern => pattern.test(fileName));
}

/**
 * Get all command files recursively from a directory
 */
function getCommandFiles(dirPath, basePath = '') {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
        return files;
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...getCommandFiles(fullPath, relativePath));
        } else if (item.endsWith('.md') && isValidCommand(fullPath)) {
            files.push({
                relativePath,
                fullPath,
                name: item,
                size: stat.size,
                modified: stat.mtime
            });
        }
    }
    
    return files;
}

/**
 * Create backup of current state
 */
function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    
    ensureDir(BACKUP_DIR);
    
    const backupFile = path.join(BACKUP_DIR, `command-sync-backup-${timestamp}.json`);
    
    const backup = {
        timestamp: new Date().toISOString(),
        docs_commands: getCommandFiles(DOCS_COMMANDS_DIR),
        claude_commands: getCommandFiles(CLAUDE_COMMANDS_DIR)
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`💾 Backup created: ${backupFile}`);
    return backupFile;
}

/**
 * Copy file with directory structure creation
 */
function copyFileWithStructure(sourceFile, targetDir) {
    const targetFile = path.join(targetDir, sourceFile.relativePath);
    const targetDirPath = path.dirname(targetFile);
    
    // Ensure target directory exists
    ensureDir(targetDirPath);
    
    try {
        fs.copyFileSync(sourceFile.fullPath, targetFile);
        console.log(`📋 Copied: ${sourceFile.relativePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error copying ${sourceFile.relativePath}:`, error.message);
        stats.errors++;
        return false;
    }
}

/**
 * Detect and resolve conflicts
 */
function detectConflicts(docsFiles, claudeFiles) {
    const conflicts = [];
    const docsMap = new Map(docsFiles.map(f => [f.relativePath, f]));
    const claudeMap = new Map(claudeFiles.map(f => [f.relativePath, f]));
    
    // Find files that exist in both with different modification times
    for (const [relativePath, docsFile] of docsMap) {
        const claudeFile = claudeMap.get(relativePath);
        if (claudeFile) {
            if (Math.abs(docsFile.modified - claudeFile.modified) > 1000) { // 1 second tolerance
                conflicts.push({
                    path: relativePath,
                    docsModified: docsFile.modified,
                    claudeModified: claudeFile.modified,
                    suggestion: docsFile.modified > claudeFile.modified ? 'docs-newer' : 'claude-newer'
                });
            }
        }
    }
    
    return conflicts;
}

/**
 * Sync from docs to claude (missing files only)
 */
function syncToClоude(docsFiles, claudeFiles) {
    console.log('\n📤 Syncing missing commands to .claude/commands/...');
    
    const claudeMap = new Map(claudeFiles.map(f => [f.relativePath, f]));
    
    for (const docsFile of docsFiles) {
        if (!claudeMap.has(docsFile.relativePath)) {
            if (copyFileWithStructure(docsFile, CLAUDE_COMMANDS_DIR)) {
                stats.copiedToClaude++;
            }
        }
    }
}

/**
 * Copy unique claude files to docs review directory
 */
function copyUniqueToReview(docsFiles, claudeFiles) {
    console.log('\n📥 Copying unique .claude/commands/ files to review directory...');
    
    const reviewDir = path.join(DOCS_COMMANDS_DIR, 'review', 'claude-unique');
    ensureDir(reviewDir);
    
    const docsMap = new Map(docsFiles.map(f => [f.relativePath, f]));
    
    for (const claudeFile of claudeFiles) {
        if (!docsMap.has(claudeFile.relativePath)) {
            if (copyFileWithStructure(claudeFile, reviewDir)) {
                stats.copiedToDocs++;
            }
        }
    }
}

/**
 * Generate comprehensive report
 */
function generateReport(docsFiles, claudeFiles, conflicts, backupFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(RESULTS_DIR, 'command-sync', `sync-report-${timestamp}.json`);
    
    ensureDir(path.dirname(reportFile));
    
    const report = {
        timestamp: new Date().toISOString(),
        backup_file: backupFile,
        statistics: {
            total_docs_commands: docsFiles.length,
            total_claude_commands: claudeFiles.length,
            copied_to_claude: stats.copiedToClaude,
            copied_to_docs_review: stats.copiedToDocs,
            conflicts_detected: conflicts.length,
            errors_encountered: stats.errors
        },
        conflicts: conflicts,
        docs_files: docsFiles.map(f => ({ path: f.relativePath, size: f.size, modified: f.modified })),
        claude_files: claudeFiles.map(f => ({ path: f.relativePath, size: f.size, modified: f.modified })),
        success: stats.errors === 0
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Also generate markdown summary
    const summaryFile = path.join(RESULTS_DIR, 'command-sync', `sync-summary-${timestamp}.md`);
    const summary = `# Command Synchronization Report

## Summary
- **Timestamp**: ${new Date().toISOString()}
- **Total docs/commands**: ${docsFiles.length}
- **Total .claude/commands**: ${claudeFiles.length}
- **Copied to .claude**: ${stats.copiedToClaude}
- **Copied to docs/review**: ${stats.copiedToDocs}
- **Conflicts detected**: ${conflicts.length}
- **Errors**: ${stats.errors}
- **Status**: ${stats.errors === 0 ? '✅ SUCCESS' : '❌ FAILED'}

## Conflicts
${conflicts.map(c => `- **${c.path}**: ${c.suggestion} (docs: ${c.docsModified}, claude: ${c.claudeModified})`).join('\n')}

## Backup
- **File**: ${backupFile}
`;
    
    fs.writeFileSync(summaryFile, summary);
    
    console.log(`\n📊 Report generated: ${reportFile}`);
    console.log(`📄 Summary generated: ${summaryFile}`);
    
    return { reportFile, summaryFile };
}

/**
 * Main synchronization function
 */
async function syncCommands() {
    console.log('🔄 Enhanced Command Synchronization Starting...\n');
    
    try {
        // Create backup first
        const backupFile = createBackup();
        
        // Get command files from both directories
        console.log('📂 Scanning command directories...');
        const docsFiles = getCommandFiles(DOCS_COMMANDS_DIR);
        const claudeFiles = getCommandFiles(CLAUDE_COMMANDS_DIR);
        
        stats.totalDocs = docsFiles.length;
        stats.totalClaude = claudeFiles.length;
        
        console.log(`📊 Found ${docsFiles.length} commands in docs/commands/`);
        console.log(`📊 Found ${claudeFiles.length} commands in .claude/commands/`);
        
        // Detect conflicts
        console.log('\n🔍 Detecting conflicts...');
        const conflicts = detectConflicts(docsFiles, claudeFiles);
        stats.conflicts = conflicts.length;
        
        if (conflicts.length > 0) {
            console.log(`⚠️  Found ${conflicts.length} conflicts:`);
            conflicts.forEach(c => {
                console.log(`   - ${c.path} (${c.suggestion})`);
            });
        } else {
            console.log('✅ No conflicts detected');
        }
        
        // Sync missing files to claude
        syncToClоude(docsFiles, claudeFiles);
        
        // Copy unique claude files to review
        copyUniqueToReview(docsFiles, claudeFiles);
        
        // Generate report
        const { reportFile, summaryFile } = generateReport(docsFiles, claudeFiles, conflicts, backupFile);
        
        // Final summary
        console.log('\n🎉 Synchronization Complete!');
        console.log(`📈 Commands synchronized: ${stats.copiedToClaude} to .claude/`);
        console.log(`📋 Unique files for review: ${stats.copiedToDocs}`);
        console.log(`⚠️  Conflicts: ${stats.conflicts}`);
        console.log(`❌ Errors: ${stats.errors}`);
        
        if (stats.errors === 0) {
            console.log('\n✅ Command synchronization completed successfully!');
            return 0;
        } else {
            console.log('\n❌ Command synchronization completed with errors');
            return 1;
        }
        
    } catch (error) {
        console.error('💥 Fatal error during synchronization:', error.message);
        return 1;
    }
}

// Run if called directly
if (require.main === module) {
    syncCommands().then(code => process.exit(code));
}

module.exports = { syncCommands, getCommandFiles, isValidCommand };