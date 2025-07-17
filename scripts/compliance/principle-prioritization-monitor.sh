#!/bin/bash

# Principle Prioritization Monitor - Context Engineering
# CRITICAL system for real-time monitoring and enforcement of principle prioritization
# Ensures Claude Code actions are systematically guided by Context Engineering principles

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/scripts/results/principle-monitoring"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="$RESULTS_DIR/principle-monitor-$TIMESTAMP.log"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}║                    🎯 PRINCIPLE PRIORITIZATION MONITOR                      ║${NC}"
echo -e "${PURPLE}║                      Context Engineering - Real-Time                       ║${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo

log "🚀 PRINCIPLE PRIORITIZATION MONITOR INITIATED"
log "📊 Monitoring system-wide principle prioritization and enforcement"

# Initialize monitoring counters
TOTAL_PRINCIPLES=0
TIER_1_PRINCIPLES=0
TIER_2_PRINCIPLES=0
TIER_3_PRINCIPLES=0
PRINCIPLE_REFERENCES=0
COMMAND_INTEGRATIONS=0
COMPLIANCE_ISSUES=0

# Function to analyze principle priority classification
analyze_principle_priorities() {
    log "🔍 ANALYZING Principle Priority Classifications"
    
    # Check Tier 1 (Critical) principles
    CRITICAL_KEYWORDS=("CRITICAL" "MANDATORY" "REQUIRED" "FORBIDDEN")
    
    for keyword in "${CRITICAL_KEYWORDS[@]}"; do
        count=$(find "$PROJECT_ROOT/docs/knowledge/principles" -name "*.md" -exec grep -l "$keyword" {} \; | wc -l)
        log "   📌 Tier 1 keyword '$keyword' found in $count principle files"
        ((TIER_1_PRINCIPLES += count))
    done
    
    # Check principle references in commands
    COMMAND_PRINCIPLE_REFS=$(find "$PROJECT_ROOT/docs/commands" -name "*.md" -exec grep -l "principle\|Principle" {} \; | wc -l)
    log "   🔗 Commands with principle references: $COMMAND_PRINCIPLE_REFS"
    
    # Check for principle enforcement in scripts
    SCRIPT_PRINCIPLE_REFS=$(find "$PROJECT_ROOT/scripts" -name "*.sh" -exec grep -l "principle\|compliance" {} \; | wc -l)
    log "   ⚙️ Scripts with principle enforcement: $SCRIPT_PRINCIPLE_REFS"
    
    # Count total principles
    TOTAL_PRINCIPLES=$(find "$PROJECT_ROOT/docs/knowledge/principles" -name "*.md" -not -name "README.md" | wc -l)
    log "   📊 Total principle files analyzed: $TOTAL_PRINCIPLES"
}

# Function to check principle integration in command system
check_command_principle_integration() {
    log "🔧 CHECKING Command-Principle Integration"
    
    # Check for principle reminders in command templates
    if [ -f "$PROJECT_ROOT/docs/commands/shared/templates/command-structure-template.md" ]; then
        if grep -q "principle" "$PROJECT_ROOT/docs/commands/shared/templates/command-structure-template.md"; then
            log "   ✅ GOOD: Command template includes principle guidance"
        else
            log "   ⚠️  WARNING: Command template missing principle guidance"
            ((COMPLIANCE_ISSUES++))
        fi
    fi
    
    # Check for principle validation in core commands
    CORE_COMMANDS_WITH_PRINCIPLES=$(find "$PROJECT_ROOT/docs/commands/cores" -name "*.md" -exec grep -l "principle" {} \; 2>/dev/null | wc -l)
    log "   📋 Core commands with principle integration: $CORE_COMMANDS_WITH_PRINCIPLES"
    
    # Check for principle enforcement in executable commands
    EXECUTABLE_COMMANDS_WITH_PRINCIPLES=$(find "$PROJECT_ROOT/docs/commands/executable" -name "*.md" -exec grep -l "principle" {} \; 2>/dev/null | wc -l)
    log "   ⚡ Executable commands with principle integration: $EXECUTABLE_COMMANDS_WITH_PRINCIPLES"
    
    # Check for principle awareness in behavioral commands
    BEHAVIORAL_COMMANDS_WITH_PRINCIPLES=$(find "$PROJECT_ROOT/docs/commands/behavioral" -name "*.md" -exec grep -l "principle" {} \; 2>/dev/null | wc -l)
    log "   🧠 Behavioral commands with principle integration: $BEHAVIORAL_COMMANDS_WITH_PRINCIPLES"
}

# Function to validate principle enforcement mechanisms
validate_principle_enforcement() {
    log "🛡️ VALIDATING Principle Enforcement Mechanisms"
    
    # Check for active principle reminder system
    if [ -f "$PROJECT_ROOT/docs/knowledge/protocols/active-principle-reminder-system.md" ]; then
        log "   ✅ EXCELLENT: Active principle reminder system exists"
        
        # Check for real-time activation components
        if grep -q "real_time_activation" "$PROJECT_ROOT/docs/knowledge/protocols/active-principle-reminder-system.md"; then
            log "   ✅ EXCELLENT: Real-time principle activation system configured"
        else
            log "   ⚠️  WARNING: Real-time activation system not fully configured"
            ((COMPLIANCE_ISSUES++))
        fi
    else
        log "   ❌ CRITICAL: Active principle reminder system missing"
        ((COMPLIANCE_ISSUES++))
    fi
    
    # Check for principle priority enforcement
    if [ -f "$PROJECT_ROOT/docs/knowledge/protocols/principle-priority-enforcement.md" ]; then
        log "   ✅ EXCELLENT: Principle priority enforcement system exists"
        
        # Check for tier-based priority system
        if grep -q "tier_1_critical\|tier_2_required\|tier_3_recommended" "$PROJECT_ROOT/docs/knowledge/protocols/principle-priority-enforcement.md"; then
            log "   ✅ EXCELLENT: Tier-based priority system implemented"
        else
            log "   ⚠️  WARNING: Tier-based priority system incomplete"
            ((COMPLIANCE_ISSUES++))
        fi
    else
        log "   ❌ CRITICAL: Principle priority enforcement system missing"
        ((COMPLIANCE_ISSUES++))
    fi
    
    # Check for principle monitoring scripts
    MONITORING_SCRIPTS=$(find "$PROJECT_ROOT/scripts" -name "*principle*" -o -name "*compliance*" | wc -l)
    log "   📊 Principle monitoring scripts available: $MONITORING_SCRIPTS"
    
    if [ "$MONITORING_SCRIPTS" -lt 3 ]; then
        log "   ⚠️  WARNING: Insufficient principle monitoring automation"
        ((COMPLIANCE_ISSUES++))
    fi
}

# Function to check principle cross-reference network integration
check_principle_network_integration() {
    log "🕸️ CHECKING Principle Cross-Reference Network Integration"
    
    # Check for principle cross-reference network
    if [ -f "$PROJECT_ROOT/docs/knowledge/principles/principle-cross-reference-network.md" ]; then
        log "   ✅ EXCELLENT: Principle cross-reference network exists"
        
        # Check network density
        if grep -q "Network Density.*0\.[8-9]" "$PROJECT_ROOT/docs/knowledge/principles/principle-cross-reference-network.md"; then
            log "   ✅ EXCELLENT: High network density achieved (≥0.8)"
        else
            log "   ⚠️  WARNING: Network density may need improvement"
            ((COMPLIANCE_ISSUES++))
        fi
        
        # Check for bidirectional links
        if grep -q "bidirectional" "$PROJECT_ROOT/docs/knowledge/principles/principle-cross-reference-network.md"; then
            log "   ✅ EXCELLENT: Bidirectional principle links implemented"
        else
            log "   ⚠️  WARNING: Bidirectional links not fully implemented"
            ((COMPLIANCE_ISSUES++))
        fi
    else
        log "   ❌ CRITICAL: Principle cross-reference network missing"
        ((COMPLIANCE_ISSUES++))
    fi
}

# Function to assess principle integration in decision trees
assess_decision_tree_integration() {
    log "🌳 ASSESSING Decision Tree Principle Integration"
    
    # Check evolutionary decision trees for principle integration
    if [ -f "$PROJECT_ROOT/docs/commands/executable/core-routing/evolutionary-decision-trees.md" ]; then
        if grep -q "principle_evaluation_system\|principle_guided" "$PROJECT_ROOT/docs/commands/executable/core-routing/evolutionary-decision-trees.md"; then
            log "   ✅ EXCELLENT: Evolutionary decision trees include principle evaluation"
        else
            log "   ⚠️  WARNING: Decision trees lack principle evaluation integration"
            ((COMPLIANCE_ISSUES++))
        fi
        
        # Check for principle-guided optimization
        if grep -q "principle_guided_optimization\|principle_compliance_validation" "$PROJECT_ROOT/docs/commands/executable/core-routing/evolutionary-decision-trees.md"; then
            log "   ✅ EXCELLENT: Principle-guided optimization implemented"
        else
            log "   ⚠️  WARNING: Principle-guided optimization not implemented"
            ((COMPLIANCE_ISSUES++))
        fi
    else
        log "   ❌ CRITICAL: Evolutionary decision trees not found"
        ((COMPLIANCE_ISSUES++))
    fi
    
    # Check explicit decision trees
    if [ -f "$PROJECT_ROOT/docs/commands/executable/core-routing/explicit-decision-trees.md" ]; then
        if grep -q "principle" "$PROJECT_ROOT/docs/commands/executable/core-routing/explicit-decision-trees.md"; then
            log "   ✅ GOOD: Explicit decision trees reference principles"
        else
            log "   ⚠️  WARNING: Explicit decision trees lack principle integration"
            ((COMPLIANCE_ISSUES++))
        fi
    fi
}

# Function to generate principle prioritization recommendations
generate_recommendations() {
    log "💡 GENERATING Principle Prioritization Recommendations"
    
    # Create recommendations based on analysis
    RECOMMENDATIONS_FILE="$RESULTS_DIR/principle-prioritization-recommendations-$TIMESTAMP.md"
    
    cat > "$RECOMMENDATIONS_FILE" << EOF
# 🎯 Principle Prioritization Recommendations

**Analysis Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Generated by**: Principle Prioritization Monitor
**Compliance Issues Found**: $COMPLIANCE_ISSUES

## 📊 Current Status Summary

- **Total Principle Files**: $TOTAL_PRINCIPLES
- **Commands with Principle References**: $COMMAND_PRINCIPLE_REFS
- **Scripts with Principle Enforcement**: $SCRIPT_PRINCIPLE_REFS
- **Compliance Issues Identified**: $COMPLIANCE_ISSUES

## 🎯 Priority Recommendations

EOF

    # Add specific recommendations based on findings
    if [ "$COMPLIANCE_ISSUES" -eq 0 ]; then
        echo "### ✅ EXCELLENT: All principle prioritization systems operational" >> "$RECOMMENDATIONS_FILE"
        echo "- Continue monitoring and optimization" >> "$RECOMMENDATIONS_FILE"
        echo "- Maintain current enforcement levels" >> "$RECOMMENDATIONS_FILE"
        echo "- Consider advanced principle learning systems" >> "$RECOMMENDATIONS_FILE"
    elif [ "$COMPLIANCE_ISSUES" -le 3 ]; then
        echo "### ⚠️ GOOD: Minor improvements needed" >> "$RECOMMENDATIONS_FILE"
        echo "- Address identified compliance gaps" >> "$RECOMMENDATIONS_FILE"
        echo "- Enhance principle integration in commands" >> "$RECOMMENDATIONS_FILE"
        echo "- Strengthen monitoring automation" >> "$RECOMMENDATIONS_FILE"
    else
        echo "### ❌ CRITICAL: Significant improvements required" >> "$RECOMMENDATIONS_FILE"
        echo "- **URGENT**: Implement missing principle enforcement systems" >> "$RECOMMENDATIONS_FILE"
        echo "- **CRITICAL**: Integrate principles into all command execution flows" >> "$RECOMMENDATIONS_FILE"
        echo "- **REQUIRED**: Establish automated compliance monitoring" >> "$RECOMMENDATIONS_FILE"
    fi
    
    cat >> "$RECOMMENDATIONS_FILE" << EOF

## 🔧 Technical Implementation Priorities

1. **Active Principle Reminder System**
   - Implement real-time principle activation
   - Create contextual principle suggestions
   - Build principle compliance dashboards

2. **Principle Priority Enforcement**
   - Establish tier-based priority system
   - Implement automated conflict resolution
   - Create violation prevention mechanisms

3. **Decision Tree Integration**
   - Integrate principle evaluation into routing logic
   - Add principle-guided optimization
   - Implement principle compliance validation

4. **Monitoring and Automation**
   - Expand principle monitoring scripts
   - Create automated compliance reporting
   - Build principle effectiveness tracking

## 📈 Success Metrics

- **Tier 1 Compliance**: Target 100% (Critical principles)
- **Tier 2 Compliance**: Target ≥95% (Required principles)
- **Tier 3 Compliance**: Target ≥85% (Recommended principles)
- **Command Integration**: Target 100% of commands reference relevant principles
- **Automation Coverage**: Target ≥5 monitoring scripts

---

*Generated by Context Engineering Principle Prioritization Monitor*
EOF

    log "   📋 Recommendations saved to: $RECOMMENDATIONS_FILE"
}

# Function to create monitoring dashboard
create_monitoring_dashboard() {
    log "📊 CREATING Principle Monitoring Dashboard"
    
    DASHBOARD_FILE="$RESULTS_DIR/principle-dashboard-$TIMESTAMP.json"
    
    cat > "$DASHBOARD_FILE" << EOF
{
  "principleMonitoringDashboard": {
    "timestamp": "$(date -Iseconds)",
    "analysis": {
      "totalPrinciples": $TOTAL_PRINCIPLES,
      "commandIntegrations": $COMMAND_PRINCIPLE_REFS,
      "scriptEnforcements": $SCRIPT_PRINCIPLE_REFS,
      "complianceIssues": $COMPLIANCE_ISSUES
    },
    "systemHealth": {
      "status": $([ "$COMPLIANCE_ISSUES" -eq 0 ] && echo '"excellent"' || ([ "$COMPLIANCE_ISSUES" -le 3 ] && echo '"good"' || echo '"needs_improvement"')),
      "complianceScore": $(echo "scale=2; (100 - $COMPLIANCE_ISSUES * 10)" | bc -l),
      "integrationLevel": $(echo "scale=2; $COMMAND_PRINCIPLE_REFS / 76 * 100" | bc -l)
    },
    "enforcement": {
      "activePrincipleReminders": $([ -f "$PROJECT_ROOT/docs/knowledge/protocols/active-principle-reminder-system.md" ] && echo 'true' || echo 'false'),
      "priorityEnforcement": $([ -f "$PROJECT_ROOT/docs/knowledge/protocols/principle-priority-enforcement.md" ] && echo 'true' || echo 'false'),
      "decisionTreeIntegration": $(grep -q "principle_evaluation_system" "$PROJECT_ROOT/docs/commands/executable/core-routing/evolutionary-decision-trees.md" 2>/dev/null && echo 'true' || echo 'false'),
      "crossReferenceNetwork": $([ -f "$PROJECT_ROOT/docs/knowledge/principles/principle-cross-reference-network.md" ] && echo 'true' || echo 'false')
    },
    "recommendations": {
      "priority": $([ "$COMPLIANCE_ISSUES" -eq 0 ] && echo '"maintain"' || ([ "$COMPLIANCE_ISSUES" -le 3 ] && echo '"improve"' || echo '"urgent"')),
      "focus": $([ "$COMPLIANCE_ISSUES" -gt 5 ] && echo '"system_implementation"' || echo '"optimization"'),
      "nextSteps": [
        $([ ! -f "$PROJECT_ROOT/docs/knowledge/protocols/active-principle-reminder-system.md" ] && echo '"Implement active principle reminder system",' || echo '')
        $([ ! -f "$PROJECT_ROOT/docs/knowledge/protocols/principle-priority-enforcement.md" ] && echo '"Create principle priority enforcement",' || echo '')
        "Enhance command-principle integration",
        "Expand monitoring automation"
      ]
    }
  }
}
EOF

    log "   📊 Dashboard saved to: $DASHBOARD_FILE"
}

# Main execution
main() {
    log "🎯 STARTING comprehensive principle prioritization analysis"
    
    # Run all analysis functions
    analyze_principle_priorities
    check_command_principle_integration
    validate_principle_enforcement
    check_principle_network_integration
    assess_decision_tree_integration
    
    # Generate outputs
    generate_recommendations
    create_monitoring_dashboard
    
    # Final status report
    echo
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                           📊 FINAL STATUS REPORT                            ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    
    if [ "$COMPLIANCE_ISSUES" -eq 0 ]; then
        echo -e "${GREEN}✅ EXCELLENT: All principle prioritization systems operational${NC}"
        echo -e "${GREEN}   No compliance issues detected${NC}"
        echo -e "${GREEN}   System ready for advanced optimization${NC}"
    elif [ "$COMPLIANCE_ISSUES" -le 3 ]; then
        echo -e "${YELLOW}⚠️  GOOD: Minor improvements needed${NC}"
        echo -e "${YELLOW}   $COMPLIANCE_ISSUES compliance issues identified${NC}"
        echo -e "${YELLOW}   Address issues for optimal performance${NC}"
    else
        echo -e "${RED}❌ CRITICAL: Significant improvements required${NC}"
        echo -e "${RED}   $COMPLIANCE_ISSUES compliance issues detected${NC}"
        echo -e "${RED}   Immediate action required${NC}"
    fi
    
    echo
    echo -e "${BLUE}📋 Analysis complete. Results saved to:${NC}"
    echo -e "${BLUE}   - Log: $LOG_FILE${NC}"
    echo -e "${BLUE}   - Recommendations: $RESULTS_DIR/principle-prioritization-recommendations-$TIMESTAMP.md${NC}"
    echo -e "${BLUE}   - Dashboard: $RESULTS_DIR/principle-dashboard-$TIMESTAMP.json${NC}"
    
    log "🎯 PRINCIPLE PRIORITIZATION MONITOR COMPLETED"
    log "📊 Compliance Score: $(echo "scale=2; (100 - $COMPLIANCE_ISSUES * 10)" | bc -l)%"
    log "🔗 Integration Level: $(echo "scale=2; $COMMAND_PRINCIPLE_REFS / 76 * 100" | bc -l)%"
}

# Execute main function
main "$@"

# Exit with appropriate code
exit $([ "$COMPLIANCE_ISSUES" -eq 0 ] && echo 0 || ([ "$COMPLIANCE_ISSUES" -le 3 ] && echo 1 || echo 2))