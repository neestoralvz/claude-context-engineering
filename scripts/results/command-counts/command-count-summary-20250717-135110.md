# Command Count Report - Thu Jul 17 13:51:12 CST 2025

## Summary
- **Total Commands (docs/)**: 139
- **Total Commands (.claude/)**: 147
- **Total Discrepancies**: 8
- **Validation Status**: ❌ FAILED

## Category Breakdown

### docs/commands/
- Behavioral: 41
- Executable: 72
- Cores: 8
- Shared: 17
- Other: 1

### .claude/commands/
- Behavioral: 42
- Executable: 79
- Cores: 8
- Shared: 18
- Other: 0

## Discrepancies
⚠️ 8 discrepancies detected

- **total_count**: docs:139 vs claude:147 (diff:-8)
- **behavioral_count**: docs:41 vs claude:42 (diff:-1)
- **executable_count**: docs:72 vs claude:79 (diff:-7)
- **shared_count**: docs:17 vs claude:18 (diff:-1)
- **other_count**: docs:1 vs claude:0 (diff:1)
- **missing_in_claude**: 1 files
- **missing_in_docs**: 9 files
- **registry_total**: registry:81 vs counted:147 (diff:-66)

## Methodology
This report uses automated counting with the following criteria:
- Must be .md file
- Must not be README.md
- Must not be in backup/archived directories
- Must not be in examples directory
- Must contain command structure or triggers

## Recommendations
1. Resolve 8 discrepancies for full synchronization
2. Integrate this script with CI/CD for continuous validation
3. Run regularly to maintain accuracy
4. Consider registry synchronization for complete system coherence

---
Generated by: Automated Command Counter v2.0
