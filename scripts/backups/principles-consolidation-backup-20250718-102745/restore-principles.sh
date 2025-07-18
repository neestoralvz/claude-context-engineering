#\!/bin/bash

# Principles System Restoration Script
# Created: 2025-07-18 10:27:45
# Purpose: Restore principles system to pre-consolidation state

BACKUP_DIR="/Users/nalve/claude-context-engineering/scripts/backups/principles-consolidation-backup-20250718-102745"
TARGET_DIR="/Users/nalve/claude-context-engineering/docs/knowledge/principles"

echo "🔄 Principles System Restoration"
echo "================================"
echo "Backup Source: $BACKUP_DIR"
echo "Target Location: $TARGET_DIR"
echo ""

# Verify backup exists
if [ \! -d "$BACKUP_DIR" ]; then
    echo "❌ ERROR: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Create restoration confirmation
echo "⚠️  WARNING: This will overwrite the current principles system\!"
echo "Are you sure you want to continue? (y/N)"
read -r response
if [[ \! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Restoration cancelled"
    exit 0
fi

# Backup current state before restoration
if [ -d "$TARGET_DIR" ]; then
    echo "📦 Creating backup of current state..."
    CURRENT_BACKUP="$TARGET_DIR-current-$(date +%Y%m%d-%H%M%S)"
    cp -r "$TARGET_DIR" "$CURRENT_BACKUP"
    echo "✅ Current state backed up to: $CURRENT_BACKUP"
fi

# Remove current principles directory
echo "🗑️  Removing current principles directory..."
rm -rf "$TARGET_DIR"

# Restore from backup
echo "📥 Restoring from backup..."
cp -r "$BACKUP_DIR" "$TARGET_DIR"

# Remove restoration script from restored directory
rm -f "$TARGET_DIR/restore-principles.sh"
rm -f "$TARGET_DIR/system-state-pre-consolidation.md"

# Verify restoration
echo "🔍 Verifying restoration..."
FILE_COUNT=$(find "$TARGET_DIR" -type f | wc -l)
if [ "$FILE_COUNT" -eq 23 ]; then
    echo "✅ Restoration successful\! ($FILE_COUNT files restored)"
else
    echo "⚠️  Warning: File count mismatch. Expected 23, found $FILE_COUNT"
fi

echo ""
echo "🎉 Principles system restored to pre-consolidation state"
echo "📊 System Status:"
echo "   - Files restored: $FILE_COUNT"
echo "   - Backup timestamp: 20250718-102745"
echo "   - Restoration completed: $(date)"
echo ""
echo "✅ System is ready for operation"
EOF < /dev/null