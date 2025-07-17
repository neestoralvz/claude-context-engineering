#!/bin/bash

# Command Counting System Demonstration
# Shows the complete workflow and capabilities of the automated command counting system

echo "🎯 Context Engineering - Command Counting System Demo"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

BASE_DIR="/Users/nalve/claude-context-engineering"
SCRIPTS_DIR="$BASE_DIR/scripts"

echo -e "${BOLD}🚀 DEMONSTRATION: Automated Command Counting System${NC}"
echo -e "${BOLD}=================================================${NC}"
echo ""

# Step 1: Show help functionality
echo -e "${PURPLE}Step 1: Help and Usage Information${NC}"
echo "Command: ./scripts/validation/automated-command-counter-v2.sh --help"
echo ""
$SCRIPTS_DIR/validation/automated-command-counter-v2.sh --help
echo ""

# Step 2: Run quiet mode for CI/CD demonstration
echo -e "${PURPLE}Step 2: CI/CD Integration (Quiet Mode)${NC}"
echo "Command: ./scripts/validation/automated-command-counter-v2.sh --quiet"
echo ""
$SCRIPTS_DIR/validation/automated-command-counter-v2.sh --quiet
EXIT_CODE=$?
echo ""
echo -e "Exit Code: ${YELLOW}$EXIT_CODE${NC} (0=success, 1=discrepancies, 2=error)"
echo ""

# Step 3: Generate JSON report only
echo -e "${PURPLE}Step 3: JSON Report Generation${NC}"
echo "Command: ./scripts/validation/automated-command-counter-v2.sh --json-only"
echo ""
$SCRIPTS_DIR/validation/automated-command-counter-v2.sh --json-only
echo ""

# Step 4: Show the latest JSON report
echo -e "${PURPLE}Step 4: Latest JSON Report Analysis${NC}"
LATEST_JSON=$(find "$BASE_DIR/scripts/results/command-counts" -name "command-count-report-*.json" -type f | sort -r | head -1)
if [ -f "$LATEST_JSON" ]; then
    echo "Latest report: $LATEST_JSON"
    echo ""
    echo -e "${CYAN}Key Metrics:${NC}"
    echo "• Total Commands (docs): $(jq -r '.command_count_report.counts.docs_commands.total' "$LATEST_JSON")"
    echo "• Total Commands (claude): $(jq -r '.command_count_report.counts.claude_commands.total' "$LATEST_JSON")"
    echo "• Total Discrepancies: $(jq -r '.command_count_report.discrepancies.total_found' "$LATEST_JSON")"
    echo "• Validation Status: $(jq -r '.command_count_report.summary.validation_status' "$LATEST_JSON")"
    echo "• Synchronization Status: $(jq -r '.command_count_report.summary.synchronization_status' "$LATEST_JSON")"
    echo ""
else
    echo "No JSON report found"
fi

# Step 5: Show summary report
echo -e "${PURPLE}Step 5: Summary Report Generation${NC}"
echo "Command: ./scripts/validation/automated-command-counter-v2.sh --summary-only"
echo ""
$SCRIPTS_DIR/validation/automated-command-counter-v2.sh --summary-only
echo ""

# Step 6: Show the latest summary report
echo -e "${PURPLE}Step 6: Latest Summary Report Preview${NC}"
LATEST_SUMMARY=$(find "$BASE_DIR/scripts/results/command-counts" -name "command-count-summary-*.md" -type f | sort -r | head -1)
if [ -f "$LATEST_SUMMARY" ]; then
    echo "Latest summary: $LATEST_SUMMARY"
    echo ""
    echo -e "${CYAN}Summary Preview:${NC}"
    head -20 "$LATEST_SUMMARY"
    echo ""
    echo "... (truncated for demo)"
    echo ""
else
    echo "No summary report found"
fi

# Step 7: Integration with system validation
echo -e "${PURPLE}Step 7: System Validation Integration${NC}"
echo "The command counter is integrated as Phase 6 of system validation:"
echo ""
echo -e "${CYAN}Integration Benefits:${NC}"
echo "• Automated validation in CI/CD pipelines"
echo "• Real-time discrepancy detection"
echo "• JSON output for machine processing"
echo "• Human-readable reports for review"
echo "• Exit codes for automation decisions"
echo ""

# Final summary
echo -e "${BOLD}${GREEN}🎉 DEMO COMPLETE${NC}"
echo -e "${BOLD}===============${NC}"
echo ""
echo -e "${CYAN}System Capabilities Demonstrated:${NC}"
echo "✅ Command counting with precise methodology"
echo "✅ Category-based analysis and reporting"
echo "✅ Discrepancy detection and alerting"
echo "✅ CI/CD integration with exit codes"
echo "✅ JSON and human-readable outputs"
echo "✅ System validation framework integration"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "1. Integrate into CI/CD pipeline"
echo "2. Set up automated monitoring"
echo "3. Configure alert thresholds"
echo "4. Schedule regular validation runs"
echo ""
echo -e "${YELLOW}Note: Current validation shows discrepancies between docs/ and .claude/ directories${NC}"
echo -e "${YELLOW}This is expected and demonstrates the system's detection capabilities${NC}"
echo ""

exit $EXIT_CODE