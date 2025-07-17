# 🚨 Zero-Root File Verification Command

**SHARED VERIFICATION COMMAND**: Automated verification component for **Principle #81: Zero-Root File Policy** that integrates into all file-generating commands with MANDATORY post-execution validation.

---

## 🧭 Navigation

← [Shared Commands](../) | [Verification Commands](../../executable/verification/) | [Technical Standards](../../../knowledge/principles/technical-standards.md#81-zero-root-file-policy) →

**📊 Shared Elements**: [P55/P56 Compliance](../compliance/p55-p56-universal-compliance.md) | [Command Templates](../templates/) | [Verification Protocol](../../../knowledge/protocols/zero-root-file-verification-protocol.md)

---

## 🎯 Command Function

**PRIMARY PURPOSE**: Provide standardized Zero-Root File verification that can be integrated into ANY command that creates, moves, or manages files.

**INTEGRATION METHOD**: Add verification call at the end of any command execution pipeline with automatic P56 transparency announcements.

---

## 📋 Command Specification

### **Core Verification Function**
```yaml
zero_root_file_verification:
  command_name: "zero-root-verify"
  priority: "MAXIMUM"
  execution_phase: "post-action"
  integration_type: "shared_component"
  
  verification_steps:
    1_root_scan: "Scan project root directory for unauthorized files"
    2_exception_check: "Verify only CLAUDE.md and README.md present in root"
    3_violation_detection: "Identify any files violating Zero-Root Policy"
    4_automatic_resolution: "Auto-relocate violations to appropriate folders"
    5_compliance_confirmation: "Confirm complete Zero-Root Policy compliance"
    6_transparency_announcement: "P56 announcement of verification results"
```

### **Integration Pattern**
```markdown
# Standard Integration in Any Command

## Command Execution
[Standard command logic here]

## MANDATORY Post-Execution (Add to ALL file-generating commands)
```bash
# Zero-Root File Verification (MANDATORY)
echo "🚨 ZERO-ROOT VERIFICATION: Executing final file structure validation..."
zero-root-verify --post-action --transparency
```

### Command completes with Zero-Root Policy compliance confirmed
```

---

## 🛡️ Verification Algorithm

### **Detection Logic**
```yaml
verification_algorithm:
  root_directory_scan:
    target: "project_root_directory"
    permitted_files: ["CLAUDE.md", "README.md"]
    scan_method: "comprehensive_file_enumeration"
    hidden_files: "include_in_scan"
    
  violation_classification:
    handoff_files: "HANDOFF_*.md → relocate to /handoffs/"
    report_files: "*_REPORT.md, *_ANALYSIS.md → relocate to /reports/"
    output_files: "temporary results → relocate to /outputs/"
    script_files: "*.py, *.sh, *.js → relocate to /scripts/"
    documentation: "*.md docs → relocate to appropriate /docs/ subfolder"
    
  automatic_resolution:
    folder_creation: "Create target folders if they don't exist"
    file_relocation: "Move files to appropriate locations"
    reference_updates: "Update any broken references after moves"
    compliance_validation: "Re-verify zero violations after resolution"
```

### **P56 Transparency Framework**
```yaml
transparency_announcements:
  verification_start:
    message: "🚨 ZERO-ROOT VERIFICATION: Analyzing project structure for compliance..."
    detail_level: "high"
    timing: "immediate"
    
  scan_results:
    compliant: "✅ COMPLIANCE VERIFIED: Zero-Root File Policy maintained"
    violations_found: "⚠️ VIOLATIONS DETECTED: [count] files require relocation"
    processing: "🔄 AUTO-RELOCATING: Moving files to appropriate locations"
    
  resolution_complete:
    success: "✅ COMPLIANCE RESTORED: All files properly organized"
    locations: "📁 FILES RELOCATED: [file] → [destination]"
    final_status: "🛡️ ZERO-ROOT POLICY: 100% compliance achieved"
```

---

## 🔄 Command Integration Targets

### **High-Priority Commands (MANDATORY Integration)**
```yaml
critical_integration:
  documentation_commands:
    - "/sync-docs": "Verify no temp files in root after documentation sync"
    - "/update-living-docs": "Ensure living docs properly placed in /docs/"
    - "/handoff": "Force HANDOFF_*.md to /handoffs/ directory"
    
  analysis_commands:
    - "/verify-flow": "Output validation reports to /reports/"
    - "/mathematical-verification": "Results to /outputs/ or /reports/"
    - "/validate-system": "Compliance reports to /reports/"
    - "/orchestrate": "Verify all generated orchestration files"
    
  file_generation:
    - "Write tool usage": "Pre-validate target path compliance"
    - "TodoWrite completion": "Trigger verification on task completion"
    - "Any file creation": "Post-execution verification mandatory"
```

### **Integration Implementation**
```bash
# Example Integration in Documentation Command
/sync-docs() {
    # Standard sync-docs logic
    execute_documentation_sync
    
    # MANDATORY Zero-Root Verification (Principle #81)
    echo "🚨 ZERO-ROOT VERIFICATION: Validating file structure compliance..."
    zero-root-verify --command="sync-docs" --transparency --auto-resolve
    
    # Command completion with compliance confirmed
    echo "✅ SYNC-DOCS COMPLETE: All files properly organized"
}
```

---

## 📊 Command Parameters

### **Execution Modes**
```yaml
command_parameters:
  --post-action:
    description: "Execute as post-action verification (standard mode)"
    usage: "zero-root-verify --post-action"
    transparency: "enabled"
    
  --pre-creation:
    description: "Execute before file creation to validate target path"
    usage: "zero-root-verify --pre-creation --target=/path/to/file"
    prevention: "enabled"
    
  --continuous:
    description: "Background monitoring mode for real-time detection"
    usage: "zero-root-verify --continuous --interval=30s"
    monitoring: "enabled"
    
  --transparency:
    description: "Enable P56 transparency announcements"
    usage: "zero-root-verify --transparency"
    announcements: "detailed"
    
  --auto-resolve:
    description: "Automatically resolve violations without user intervention"
    usage: "zero-root-verify --auto-resolve"
    resolution: "automatic"
```

### **Response Codes**
```yaml
exit_codes:
  0: "SUCCESS: Zero-Root Policy compliance verified"
  1: "VIOLATIONS_DETECTED: Files found in root requiring relocation"
  2: "VIOLATIONS_RESOLVED: Auto-relocation completed successfully"
  3: "MANUAL_INTERVENTION: Complex violations require user decision"
  4: "ERROR: Verification process encountered technical issues"
```

---

## 🎯 Expected Integration Outcomes

### **System-Wide Compliance**
- **100% Command Coverage**: All file-generating commands integrated with verification
- **Zero Violations**: Complete elimination of unauthorized root files
- **Automatic Resolution**: ≥95% violations resolved without manual intervention
- **Seamless Operation**: Verification integrated transparently into command flow

### **User Experience**
- **Clear Transparency**: P56 announcements inform users of all verification activities
- **Automatic Organization**: Files automatically placed in appropriate locations
- **No Workflow Disruption**: Verification happens seamlessly during command execution
- **Confidence**: Users know file organization is always compliant

---

## 🔧 Implementation Validation

### **Integration Checklist**
```yaml
validation_checklist:
  command_integration:
    - [ ] All documentation commands include zero-root-verify call
    - [ ] All analysis commands integrated with verification
    - [ ] TodoWrite triggers automatic verification
    - [ ] Write tool usage includes path validation
    - [ ] Orchestration commands verify file placement
    
  functionality_testing:
    - [ ] Violation detection working correctly
    - [ ] Automatic relocation functioning
    - [ ] P56 transparency announcements clear
    - [ ] No false positives in detection
    - [ ] Performance impact minimal (≤2 seconds)
    
  compliance_validation:
    - [ ] Zero unauthorized files in project root
    - [ ] All handoffs properly routed to /handoffs/
    - [ ] All reports properly placed in /reports/
    - [ ] All outputs organized in /outputs/
    - [ ] Documentation maintained in /docs/ hierarchy
```

---

## 📈 Success Metrics

### **Target Performance**
- **Detection Accuracy**: 100% violation detection rate
- **Resolution Success**: ≥95% automatic resolution without user intervention
- **Performance Impact**: ≤2 seconds verification time per command
- **User Satisfaction**: ≥95% positive feedback on transparency announcements

### **Compliance Metrics**
- **Root Directory**: Only CLAUDE.md and README.md present
- **File Organization**: 100% files in appropriate directories
- **Command Integration**: 100% file-generating commands include verification
- **Real-time Monitoring**: Continuous background compliance validation

---

**Quick Navigation**: [Principle #81](../../../knowledge/principles/technical-standards.md#81-zero-root-file-policy) | [Verification Protocol](../../../knowledge/protocols/zero-root-file-verification-protocol.md) | [P55/P56 Compliance](../compliance/p55-p56-universal-compliance.md)

*This shared verification command ensures systematic integration of Principle #81 compliance across all system operations with automated detection, resolution, and transparency.*