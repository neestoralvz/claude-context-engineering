# 🚨 Zero-Root File Verification Command

**SHARED VERIFICATION COMMAND**: Automated verification component for **Principle #81: Zero-Root File Policy** that integrates into all file-generating commands with MANDATORY post-execution validation.

---

## 🧭 Navigation

← [Shared Commands](../) | [Verification Commands](../../executable/verification/) | [Technical Standards](../../../knowledge/principles/technical-standards.md#81-zero-root-file-policy) →

**📊 Shared Elements**: [P55/P56 Compliance](../compliance/p55-p56-universal-compliance.md) | [Command Templates](../templates/) | [Verification Protocol](../../../knowledge/protocols/zero-root-file-verification-protocol.md)

---

## 🎯 Command Function

**PRIMARY PURPOSE**: Provide standardized Zero-Root File verification that MUST be integrated into ALL commands that create, move, or manage files.

**INTEGRATION METHOD**: Add verification call at the end of any command execution pipeline with automatic P56 transparency announcements.

---

## 📋 Command Specification

### **Core Verification Function**
**Zero Root File Verification**:
  - **Command Name**: zero-root-verify
  - **Priority**: MAXIMUM
  - **Execution Phase**: post-action
  - **Integration Type**: shared_component
  **Verification Steps**:
    - **1 Root Scan**: Scan project root directory for unauthorized files
    - **2 Exception Check**: Verify only CLAUDE.md and README.md present in root
    - **3 Violation Detection**: Identify any files violating Zero-Root Policy
    - **4 Automatic Resolution**: Auto-relocate violations to appropriate folders
    - **5 Compliance Confirmation**: Confirm complete Zero-Root Policy compliance
    - **6 Transparency Announcement**: P56 announcement of verification results

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
**Verification Algorithm**:
  **Root Directory Scan**:
    - **Target**: project_root_directory
    **Permitted Files**:
    - CLAUDE.md
    - README.md
    - **Scan Method**: comprehensive_file_enumeration
    - **Hidden Files**: include_in_scan
  **Violation Classification**:
    - **Handoff Files**: HANDOFF_*.md → relocate to docs/operations/handoffs/
    - **Report Files**: *_REPORT.md, *_ANALYSIS.md → relocate to docs/operations/reports/
    - **Output Files**: temporary results → relocate to docs/operations/outputs/
    - **Script Files**: *.py, *.sh, *.js → relocate to /scripts/
    - **Documentation**: *.md docs → relocate to appropriate /docs/ subfolder
  **Automatic Resolution**:
    - **Folder Creation**: Create target folders if they don't exist
    - **File Relocation**: Move files to appropriate locations
    - **Reference Updates**: Update any broken references after moves
    - **Compliance Validation**: Re-verify zero violations after resolution

### **P56 Transparency Framework**
**Transparency Announcements**:
  **Verification Start**:
    - **Message**: 🚨 ZERO-ROOT VERIFICATION: Analyzing project structure for compliance...
    - **Detail Level**: high
    - **Timing**: immediate
  **Scan Results**:
    - **Compliant**: ✅ COMPLIANCE VERIFIED: Zero-Root File Policy maintained
    - **Violations Found**: ⚠️ VIOLATIONS DETECTED: [count] files require relocation
    - **Processing**: 🔄 AUTO-RELOCATING: Moving files to appropriate locations
  **Resolution Complete**:
    - **Success**: ✅ COMPLIANCE RESTORED: All files properly organized
    - **Locations**: 📁 FILES RELOCATED: [file] → [destination]
    - **Final Status**: 🛡️ ZERO-ROOT POLICY: 100% compliance achieved

---

## 🔄 Command Integration Targets

### **High-Priority Commands (MANDATORY Integration)**
**Critical Integration**:
  **Documentation Commands**:
  - {'/sync-docs': 'Verify no temp files in root after documentation sync'}
  - {'/update-living-docs': 'Ensure living docs properly placed in /docs/'}
  - {'/handoff': 'Force HANDOFF_*.md to docs/operations/handoffs/ directory'}
  **Analysis Commands**:
  - {'/verify-flow': 'Output validation reports to docs/operations/reports/'}
  - {'/mathematical-verification': 'Results to docs/operations/outputs/ or docs/operations/reports/'}
  - {'/validate-system': 'Compliance reports to docs/operations/reports/'}
  - {'/orchestrate': 'Verify all generated orchestration files'}
  **File Generation**:
  - {'Write tool usage': 'Pre-validate target path compliance'}
  - {'TodoWrite completion': 'Trigger verification on task completion'}
  - {'Any file creation': 'Post-execution verification mandatory'}

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
**Command Parameters**:
  **--Post-Action**:
    - **Description**: Execute as post-action verification (standard mode)
    - **Usage**: zero-root-verify --post-action
    - **Transparency**: enabled
  **--Pre-Creation**:
    - **Description**: Execute before file creation to validate target path
    - **Usage**: zero-root-verify --pre-creation --target=/path/to/file
    - **Prevention**: enabled
  **--Continuous**:
    - **Description**: Background monitoring mode for real-time detection
    - **Usage**: zero-root-verify --continuous --interval=30s
    - **Monitoring**: enabled
  **--Transparency**:
    - **Description**: Enable P56 transparency announcements
    - **Usage**: zero-root-verify --transparency
    - **Announcements**: detailed
  **--Auto-Resolve**:
    - **Description**: Automatically resolve violations without user intervention
    - **Usage**: zero-root-verify --auto-resolve
    - **Resolution**: automatic

### **Response Codes**

**CRITICAL Response Classification Protocol** (MANDATORY Status Communication):

**SUCCESS Responses**:
- **Code 0**: Complete compliance - Zero violations detected (OPTIMAL status)
- **Code 1**: Minor violations - Automatically resolved (ACCEPTABLE status)

**WARNING Responses**:
- **Code 2**: Manual intervention required - Multiple violations (ATTENTION needed)
- **Code 3**: Path validation failed - Invalid target location (CORRECTION required)

**ERROR Responses**:
- **Code 4**: Critical violations - System integrity compromised (IMMEDIATE action)
- **Code 5**: Verification system failure - Internal error detected (TECHNICAL support)


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
**Validation Checklist**:
**Command Integration**:
- [ ] All documentation commands include zero-root-verify call
- [ ] All analysis commands integrated with verification
- [ ] TodoWrite triggers automatic verification
- [ ] Write tool usage includes path validation
- [ ] Orchestration commands verify file placement
**Functionality Testing**:
- [ ] Violation detection working correctly
- [ ] Automatic relocation functioning
- [ ] P56 transparency announcements clear
- [ ] No false positives in detection
- [ ] Performance impact minimal (≤2 seconds)
**Compliance Validation**:
- [ ] Zero unauthorized files in project root
- [ ] All handoffs properly routed to docs/operations/handoffs/
- [ ] All reports properly placed in docs/operations/reports/
- [ ] All outputs organized in docs/operations/outputs/
- [ ] Documentation maintained in /docs/ hierarchy

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
