#!/usr/bin/env node

/**
 * Unidirectional Command Synchronization Script
 * 
 * Establishes docs/commands as the single source of truth with
 * .claude/commands as an operational mirror.
 * 
 * Architecture:
 * - docs/commands = SOURCE OF TRUTH (development, documentation, authoritative)
 * - .claude/commands = OPERATIONAL MIRROR (automatically synced from docs)
 * 
 * Features:
 * - Unidirectional sync (docs → .claude only)
 * - Analysis file exclusions
 * - Complete mirror replacement
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

// Patterns to exclude from mirroring (analysis files, review directories, templates, hubs)
const EXCLUDE_PATTERNS = [
    /README\.md$/,
    /command-structure-analysis-matrix\.md$/,
    /-analysis.*\.md$/,
    /-matrix\.md$/,
    /^review\//,
    /\/review\//,
    /\.backup$/,
    /\.archive$/,
    /-template\.md$/,
    /template\.md$/,
    /-hub\.md$/,
    /hub\.md$/,
    /-navigation\.md$/,
    /navigation\.md$/,
    /\/templates\//,
    /enforcement-template\.md$/,
    /p55-p56-enhancement-template\.md$/,
    /zero-root-verification-integration\.md$/,
    /p55-p56-compliance-template\.md$/,
    /command-structure-template\.md$/,
    /orchestration-hub\.md$/
];

// Statistics tracking
let stats = {
    mirrored: 0,
    removed: 0,
    errors: 0,
    totalDocs: 0,
    finalClaude: 0
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
 * Check if file should be mirrored (not excluded)
 */
function shouldMirror(filePath) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(DOCS_COMMANDS_DIR, filePath);
    
    return !EXCLUDE_PATTERNS.some(pattern => 
        pattern.test(fileName) || pattern.test(relativePath)
    );
}

/**
 * Get all command files recursively from docs/commands
 */
function getSourceFiles(dirPath, basePath = '') {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
        console.log(`⚠️  Source directory not found: ${dirPath}`);
        return files;
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...getSourceFiles(fullPath, relativePath));
        } else if (item.endsWith('.md') && shouldMirror(fullPath)) {
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
 * Remove all existing files in .claude/commands
 */
function cleanMirrorDirectory() {
    console.log('🧹 Cleaning mirror directory...');
    
    if (fs.existsSync(CLAUDE_COMMANDS_DIR)) {
        const removeDir = (dirPath) => {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    removeDir(fullPath);
                    fs.rmdirSync(fullPath);
                } else {
                    fs.unlinkSync(fullPath);
                    stats.removed++;
                }
            }
        };
        
        removeDir(CLAUDE_COMMANDS_DIR);
        console.log(`🗑️  Removed ${stats.removed} files from mirror directory`);
    }
    
    // Recreate base directory
    ensureDir(CLAUDE_COMMANDS_DIR);
}

/**
 * Mirror file from docs to .claude with directory structure creation
 */
function mirrorFile(sourceFile) {
    const targetFile = path.join(CLAUDE_COMMANDS_DIR, sourceFile.relativePath);
    const targetDirPath = path.dirname(targetFile);
    
    // Ensure target directory exists
    ensureDir(targetDirPath);
    
    try {
        fs.copyFileSync(sourceFile.fullPath, targetFile);
        console.log(`📋 Mirrored: ${sourceFile.relativePath}`);
        stats.mirrored++;
        return true;
    } catch (error) {
        console.error(`❌ Error mirroring ${sourceFile.relativePath}:`, error.message);
        stats.errors++;
        return false;
    }
}

/**
 * Create backup of current mirror state
 */
function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    
    ensureDir(BACKUP_DIR);
    
    const backupFile = path.join(BACKUP_DIR, `unidirectional-sync-backup-${timestamp}.json`);
    
    const backup = {
        timestamp: new Date().toISOString(),
        sync_type: 'unidirectional',
        source: 'docs/commands',
        mirror: '.claude/commands',
        docs_files_count: 0,
        claude_files_count: 0
    };
    
    // Count existing files if directories exist
    if (fs.existsSync(DOCS_COMMANDS_DIR)) {
        backup.docs_files_count = getSourceFiles(DOCS_COMMANDS_DIR).length;
    }
    
    if (fs.existsSync(CLAUDE_COMMANDS_DIR)) {
        const countFiles = (dir) => {
            let count = 0;
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    count += countFiles(fullPath);
                } else if (item.endsWith('.md')) {
                    count++;
                }
            }
            return count;
        };
        backup.claude_files_count = countFiles(CLAUDE_COMMANDS_DIR);
    }
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`💾 Backup created: ${backupFile}`);
    return backupFile;
}

/**
 * Generate comprehensive report
 */
function generateReport(sourceFiles, backupFile) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(RESULTS_DIR, 'unidirectional-sync', `mirror-report-${timestamp}.json`);
    
    ensureDir(path.dirname(reportFile));
    
    const report = {
        timestamp: new Date().toISOString(),
        sync_type: 'unidirectional',
        source_of_truth: 'docs/commands',
        mirror_target: '.claude/commands',
        backup_file: backupFile,
        statistics: {
            total_source_files: sourceFiles.length,
            files_mirrored: stats.mirrored,
            files_removed: stats.removed,
            errors_encountered: stats.errors,
            final_mirror_count: stats.finalClaude
        },
        excluded_patterns: EXCLUDE_PATTERNS.map(p => p.toString()),
        source_files: sourceFiles.map(f => ({ 
            path: f.relativePath, 
            size: f.size, 
            modified: f.modified 
        })),
        success: stats.errors === 0
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Also generate markdown summary
    const summaryFile = path.join(RESULTS_DIR, 'unidirectional-sync', `mirror-summary-${timestamp}.md`);
    const summary = `# Unidirectional Command Sync Report

## Architecture
- **Source of Truth**: docs/commands/ (${sourceFiles.length} files)
- **Mirror Target**: .claude/commands/ (${stats.finalClaude} files)
- **Sync Direction**: docs → .claude (unidirectional)

## Statistics
- **Files Mirrored**: ${stats.mirrored}
- **Files Removed**: ${stats.removed}
- **Errors**: ${stats.errors}
- **Status**: ${stats.errors === 0 ? '✅ SUCCESS' : '❌ FAILED'}

## Exclusions Applied
${EXCLUDE_PATTERNS.map(p => `- ${p.toString()}`).join('\n')}

## Backup
- **File**: ${backupFile}

## Source of Truth Principle
✅ docs/commands/ established as single source of truth
✅ .claude/commands/ serves as operational mirror only
✅ All development should happen in docs/commands/
`;
    
    fs.writeFileSync(summaryFile, summary);
    
    console.log(`\n📊 Report generated: ${reportFile}`);
    console.log(`📄 Summary generated: ${summaryFile}`);
    
    return { reportFile, summaryFile };
}

/**
 * Count final files in mirror directory
 */
function countMirrorFiles() {
    if (!fs.existsSync(CLAUDE_COMMANDS_DIR)) {
        return 0;
    }
    
    const countFiles = (dir) => {
        let count = 0;
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                count += countFiles(fullPath);
            } else if (item.endsWith('.md')) {
                count++;
            }
        }
        return count;
    };
    
    return countFiles(CLAUDE_COMMANDS_DIR);
}

/**
 * Main unidirectional sync function
 */
async function mirrorCommands() {
    console.log('🔄 Unidirectional Command Synchronization Starting...');
    console.log('📍 Architecture: docs/commands → .claude/commands (SOURCE OF TRUTH → MIRROR)\n');
    
    try {
        // Create backup first
        const backupFile = createBackup();
        
        // Get source files from docs/commands
        console.log('📂 Scanning source directory (docs/commands)...');
        const sourceFiles = getSourceFiles(DOCS_COMMANDS_DIR);
        
        stats.totalDocs = sourceFiles.length;
        
        console.log(`📊 Found ${sourceFiles.length} mirrorable commands in docs/commands/`);
        console.log(`🚫 Excluded files: README.md, *-analysis*.md, review/, etc.`);
        
        // Clean mirror directory completely
        cleanMirrorDirectory();
        
        // Mirror all source files to .claude/commands
        console.log('\n📤 Mirroring source files to .claude/commands...');
        
        for (const sourceFile of sourceFiles) {
            mirrorFile(sourceFile);
        }
        
        // Count final files
        stats.finalClaude = countMirrorFiles();
        
        // Generate report
        const { reportFile, summaryFile } = generateReport(sourceFiles, backupFile);
        
        // Final summary
        console.log('\n🎉 Unidirectional Sync Complete!');
        console.log(`📁 Source files: ${stats.totalDocs} (docs/commands)`);
        console.log(`🪞 Mirror files: ${stats.finalClaude} (.claude/commands)`);
        console.log(`📋 Files mirrored: ${stats.mirrored}`);
        console.log(`🗑️  Files removed: ${stats.removed}`);
        console.log(`❌ Errors: ${stats.errors}`);
        
        if (stats.errors === 0) {
            console.log('\n✅ Source of truth mirroring completed successfully!');
            console.log('📍 docs/commands/ is now the authoritative source');
            console.log('🪞 .claude/commands/ is operational mirror');
            return 0;
        } else {
            console.log('\n❌ Mirroring completed with errors');
            return 1;
        }
        
    } catch (error) {
        console.error('💥 Fatal error during unidirectional sync:', error.message);
        return 1;
    }
}

// Run if called directly
if (require.main === module) {
    mirrorCommands().then(code => process.exit(code));
}

module.exports = { mirrorCommands, getSourceFiles, shouldMirror };