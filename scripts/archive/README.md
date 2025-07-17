# Scripts Archive

This directory contains archived scripts that are no longer in active use but have been preserved for reference.

## Archived Scripts

### enhanced-command-sync-bidirectional.js
- **Archived**: 2025-07-17
- **Reason**: Replaced by unidirectional-command-sync.js for source of truth architecture
- **Original Purpose**: Bidirectional synchronization between docs/commands and .claude/commands
- **Why Archived**: 
  - Complex conflict resolution logic no longer needed
  - Source of truth architecture (docs → .claude) simplified the sync process
  - Unidirectional flow eliminates confusion about which directory is authoritative
  - Better aligns with development workflow where all work happens in docs/commands

## Archive Policy

Scripts are archived when:
1. They are superseded by improved versions
2. Architecture changes make them obsolete
3. They contain legacy logic that conflicts with current patterns

Archived scripts are kept for:
- Historical reference
- Recovery scenarios
- Learning from previous approaches