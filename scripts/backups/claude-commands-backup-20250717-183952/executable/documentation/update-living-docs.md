# /update-living-docs

Manually trigger synchronization of all living documentation with current system metrics.

## Objective

Force immediate update of CLAUDE.md and other living documentation to reflect current system state from command-registry.json.

## Execution Protocol

### 1. Validate Registry Data
- Read `.claude/config/command-registry.json`
- Verify statistics section is complete
- Check for data consistency and completeness
- Report any missing or invalid metrics

### 2. Execute Sync Operations
- Run `/sync-claude-md` command automatically
- Update completion dashboard if needed
- Refresh any cached documentation references
- Ensure all cross-references are current
- Apply `/optimize-intelligent-writing` to all synchronized documentation

### 3. Verification Steps
- Compare CLAUDE.md content with registry data
- Confirm all metrics match exactly
- Validate timestamp updates
- Check command count accuracy
- Verify writing quality metrics (≥95% density, ≥90% clarity, ≥85% ROI)

### 4. Report Results
Display summary of updates made:
```
✅ CLAUDE.md synchronized successfully
✅ [X] commands with updated metrics
✅ [X] pattern crystallization candidates
✅ Success rate: [XX]% (from [X] executions)
✅ Last updated: [timestamp]
✅ Writing optimization applied: [XX]% density, [XX]% clarity, [XX]% ROI
```

## Success Criteria

- CLAUDE.md reflects current registry state
- All living documentation is synchronized
- No data inconsistencies detected
- User receives clear confirmation of updates
- Writing quality targets achieved (≥95% density, ≥90% clarity, ≥85% ROI)

## When to Use

- After major system changes
- Before important presentations or reviews
- When debugging metric discrepancies  
- To verify system consistency
- During development and testing

## Validation Rules

Ensure updated documentation meets:
- **Accuracy**: All numbers match registry exactly
- **Currency**: Timestamps are current
- **Completeness**: No missing required metrics
- **Consistency**: Cross-references align properly

## Integration

This command supports:
- **Principle #19**: Living Documentation maintenance
- **Principle #16**: Mathematical Verification of accuracy
- **Principle #15**: Verification as Liberation (user can "see" system state)

Provides manual control when automatic updates need verification or troubleshooting.