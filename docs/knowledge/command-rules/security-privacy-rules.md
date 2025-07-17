# Security & Privacy Rules - Context Engineering

**Meta-Principle**: "Security and privacy by design, not as an afterthought"

**Purpose**: MANDATORY comprehensive rules for security implementation, privacy protection, and compliance management within the Context Engineering system.

**Integration Reference**: [Security by Design Principle](../principles/validation-protocols.md#59-security-by-design) | [Privacy-First Architecture Principle](../principles/technical-standards.md#60-privacy-first-architecture)

---

## 🔒 **SECURITY BY DESIGN RULES (MANDATORY)**

### **1. Pre-Execution Security Validation**

**CRITICAL REQUIREMENT**: Every command execution MUST include mandatory security validation before any tool call execution.

**Pre-Execution Security Protocol**:

**Credential Scanning Requirements**:
- **MANDATORY Scanning**: API keys, passwords, tokens in all inputs
- **Protection Patterns**: API_KEY, PASSWORD, TOKEN, SECRET, PRIVATE_KEY
- **FORBIDDEN Action**: Exposure in outputs or logs
- **Validation Standard**: 100% detection and protection required

**Data Classification Framework**:
- **Automatic Classification**: Sensitive data types identification
- **Protection Categories**: PII, Financial, Healthcare, Credentials, Business Confidential
- **Accuracy Requirement**: ≥95% classification accuracy required
- **Handling Protocol**: Appropriate protection based on classification

**Permission Validation Protocol**:
- **Verification Requirement**: Command execution permissions before sensitive operations
- **Validation Scope**: File system access, network operations, external API calls
- **Enforcement Standard**: 100% permission validation required
- **Fallback Strategy**: Graceful degradation when permissions insufficient

### **2. Secure Execution Patterns**

**MANDATORY IMPLEMENTATION**: All tool calls MUST follow secure execution patterns with isolation and protection.

**Secure Execution Standards**:

**Sandboxed Execution Requirements**:
- **Isolated Environment**: Critical tool calls execution isolation
- **Protection Scope**: File operations, network access, external integrations
- **Isolation Level**: Process-level isolation when possible
- **Monitoring Requirement**: Real-time execution monitoring required

**Data Masking Protocol**:
- **Automatic Masking**: Sensitive data in outputs
- **Coverage Scope**: Logs, console outputs, user displays, error messages
- **Protection Effectiveness**: ≥99.9% sensitive data protection
- **Functional Preservation**: Output preserved while protecting sensitive data

**Secure Communication Framework**:
- **Encryption Requirement**: Encrypted communication between agents when required
- **Activation Triggers**: Sensitive data transmission, external API calls
- **Security Standards**: TLS 1.3 minimum, end-to-end encryption preferred
- **Validation Protocol**: Certificate validation and secure protocols only

### **3. Security Boundary Enforcement**

**CRITICAL REQUIREMENT**: Clear security boundaries MUST be enforced between agents, contexts, and data domains.

**Security Boundary Framework**:

**Agent Isolation Requirements**:
- **Security Boundaries**: Between multi-agent executions
- **Implementation Strategy**: Separate execution contexts, isolated memory spaces
- **Communication Control**: Controlled inter-agent communication channels
- **Validation Protocol**: Security boundary integrity validation

**Context Separation Framework**:
- **Isolation Requirement**: Between different user contexts and projects
- **Protection Scope**: User data, project configurations, execution environments
- **Contamination Prevention**: Zero cross-contamination between contexts
- **Monitoring Protocol**: Continuous boundary integrity monitoring

**Data Domain Isolation Framework**:
- **Separation Requirement**: Clear separation between different data sensitivity levels
- **Classification System**: Public, Internal, Confidential, Secret
- **Policy Enforcement**: Automatic enforcement of data handling policies
- **Effectiveness Validation**: Regular validation of data isolation effectiveness

---

## 🛡️ **PRIVACY-FIRST ARCHITECTURE RULES (MANDATORY)**

### **4. Data Minimization Enforcement**

**MANDATORY REQUIREMENT**: Only collect and process minimum necessary data for functionality.

```yaml
data_minimization_protocol:
  collection_limits:
    principle: "MANDATORY: Only collect data essential for functionality"
    validation: "Pre-collection validation of data necessity"
    documentation: "Clear documentation of data collection purpose"
    retention: "Automatic deletion after purpose fulfillment"
    
  purpose_limitation:
    requirement: "Data usage restricted to declared purposes only"
    enforcement: "Automatic enforcement of purpose boundaries"
    monitoring: "Continuous monitoring of data usage patterns"
    violation_detection: "Real-time detection of purpose violations"
    
  storage_optimization:
    requirement: "Minimize data storage duration and scope"
    implementation: "Automatic data expiration and cleanup"
    efficiency: "Storage optimization while maintaining functionality"
    security: "Secure deletion of expired data"
```

### **5. Consent Management Framework**

**CRITICAL REQUIREMENT**: Explicit consent MUST be obtained for any data processing or storage operations.

```yaml
consent_management_system:
  consent_verification:
    requirement: "Active consent verification before any data processing"
    granularity: "Granular consent for different data types and purposes"
    documentation: "Clear consent documentation and tracking"
    withdrawal: "Easy consent withdrawal mechanisms"
    
  consent_transparency:
    requirement: "Clear explanation of data usage and processing"
    language: "Plain language explanations of data practices"
    accessibility: "Accessible consent interfaces for all users"
    updates: "Notification of consent policy changes"
    
  consent_enforcement:
    requirement: "Automatic enforcement of consent decisions"
    scope: "All data processing operations"
    validation: "Continuous validation of consent compliance"
    audit: "Comprehensive consent audit trails"
```

### **6. Privacy Rights Implementation**

**MANDATORY IMPLEMENTATION**: Complete implementation of privacy rights including deletion, access, and portability.

```yaml
privacy_rights_framework:
  right_to_deletion:
    requirement: "Complete data removal on user request"
    scope: "All user data across all systems and backups"
    verification: "Verification of complete deletion"
    timeline: "≤30 days for complete deletion"
    
  right_to_access:
    requirement: "User visibility into collected and processed data"
    format: "Machine-readable and human-readable formats"
    completeness: "Complete data inventory and usage disclosure"
    timeline: "≤15 days for access request fulfillment"
    
  data_portability:
    requirement: "Standard formats for data export and transfer"
    formats: "JSON, CSV, XML for structured data export"
    completeness: "Complete user data export capability"
    automation: "Automated export generation and delivery"
```

---

## 🔐 **COMPLIANCE AUTOMATION RULES (MANDATORY)**

### **7. Regulatory Compliance Framework**

**CRITICAL REQUIREMENT**: Automatic compliance with applicable privacy and security regulations.

```yaml
compliance_automation_system:
  gdpr_compliance:
    requirement: "Automatic GDPR compliance verification and reporting"
    scope: "Data protection, consent, rights implementation"
    monitoring: "Continuous GDPR compliance monitoring"
    reporting: "Automated compliance reporting and documentation"
    
  ccpa_compliance:
    requirement: "California Consumer Privacy Act compliance framework"
    scope: "Consumer rights, data disclosure, opt-out mechanisms"
    implementation: "Automatic CCPA compliance enforcement"
    validation: "Regular CCPA compliance validation"
    
  regional_adaptation:
    requirement: "Automatic adaptation to local privacy regulations"
    scope: "PIPEDA, LGPD, other regional privacy laws"
    detection: "Automatic detection of applicable regulations"
    adaptation: "Dynamic compliance framework adaptation"
```

### **8. Audit Trail Generation**

**MANDATORY REQUIREMENT**: Comprehensive audit trails for all security and privacy-relevant operations.

```yaml
audit_trail_framework:
  security_audit_trails:
    requirement: "Complete logging of security-relevant actions"
    scope: "Authentication, authorization, data access, security events"
    retention: "Secure audit log retention with integrity protection"
    analysis: "Automated audit log analysis and alerting"
    
  privacy_audit_trails:
    requirement: "Complete logging of privacy-relevant operations"
    scope: "Data collection, processing, sharing, deletion"
    compliance: "Audit trails meeting regulatory requirements"
    access: "Secure audit trail access for compliance verification"
    
  compliance_reporting:
    requirement: "Automated generation of compliance reports"
    frequency: "Real-time monitoring with periodic comprehensive reports"
    formats: "Standard compliance reporting formats"
    validation: "Third-party audit preparation and support"
```

---

## 🎯 **RISK MITIGATION PROTOCOLS (MANDATORY)**

### **9. Threat Detection and Prevention**

**CRITICAL REQUIREMENT**: Proactive detection and prevention of security and privacy threats.

```yaml
threat_mitigation_framework:
  data_leak_prevention:
    requirement: "Multi-layer protection against accidental data exposure"
    implementation: "DLP scanning, output filtering, access controls"
    effectiveness: "≥99.9% prevention of sensitive data leaks"
    monitoring: "Real-time data leak detection and prevention"
    
  injection_attack_prevention:
    requirement: "Input validation and sanitization for all commands"
    scope: "Command injection, data injection, prompt injection"
    implementation: "Multi-layer input validation and sanitization"
    testing: "Regular penetration testing and vulnerability assessment"
    
  unauthorized_access_prevention:
    requirement: "Strong access controls and authentication"
    implementation: "Multi-factor authentication, role-based access control"
    monitoring: "Real-time access monitoring and anomaly detection"
    response: "Automatic response to unauthorized access attempts"
```

### **10. Security Incident Response**

**MANDATORY REQUIREMENT**: Comprehensive incident response protocols for security and privacy breaches.

```yaml
incident_response_framework:
  detection_protocols:
    requirement: "Real-time detection of security and privacy incidents"
    monitoring: "Continuous monitoring for security anomalies"
    alerting: "Immediate alerting for critical security events"
    classification: "Automatic incident classification and prioritization"
    
  response_procedures:
    requirement: "Standardized incident response procedures"
    timeline: "≤15 minutes for critical incident response initiation"
    containment: "Automatic containment of security incidents"
    recovery: "Systematic recovery and restoration procedures"
    
  post_incident_analysis:
    requirement: "Comprehensive post-incident analysis and improvement"
    documentation: "Complete incident documentation and lessons learned"
    prevention: "Preventive measures implementation based on analysis"
    reporting: "Regulatory and stakeholder incident reporting"
```

---

## 📊 **SECURITY & PRIVACY VALIDATION METRICS**

### **Security Effectiveness Metrics**
- **Threat Prevention Rate**: ≥99.5% - Successfully prevented security threats
- **Vulnerability Response Time**: ≤4 hours - Time to address critical vulnerabilities
- **Access Control Effectiveness**: 100% - Proper access control enforcement
- **Security Incident Response**: ≤15 minutes - Critical incident response time

### **Privacy Protection Metrics**
- **Data Minimization Compliance**: ≥98% - Compliance with data minimization principles
- **Consent Coverage**: 100% - All data processing covered by valid consent
- **Privacy Rights Fulfillment**: ≤15 days - Average time to fulfill privacy rights requests
- **Data Leak Prevention**: 100% - Prevention of sensitive data exposure

### **Compliance Achievement Metrics**
- **Regulatory Compliance**: ≥99% - Compliance with applicable regulations
- **Audit Trail Completeness**: 100% - Complete audit trails for all relevant operations
- **Privacy Impact Assessment**: 100% - All data processing covered by privacy impact assessment
- **Third-Party Audit Readiness**: ≥95% - Readiness for external security and privacy audits

---

## 🔧 **INTEGRATION WITH EXISTING RULES**

### **Tool Call Rules Integration**
- **Enhanced P55/P56 Compliance**: Security and privacy validation integrated into tool execution protocols
- **Permissions System Integration**: [Claude Code Permissions](../reference/claude-code-permissions-system.md) - `/permissions` command security framework
- **Visual Transparency**: Security-aware transparency that protects sensitive information
- **Error Handling**: Security-aware error handling that prevents information disclosure

### **Command Structure Integration**
- **Security-First Architecture**: All commands implement security and privacy by design
- **Validation Protocols**: Security and privacy validation integrated into command validation
- **Cross-Reference Security**: Strategic cross-references include security and privacy considerations

### **Performance Integration**
- **Security Performance Balance**: Optimal balance between security measures and system performance
- **Privacy-Preserving Optimization**: System optimization that maintains privacy protections
- **Compliance Efficiency**: Efficient compliance implementation that minimizes performance impact

---

**Consolidated Authority**: [Security by Design](../principles/validation-protocols.md#59-security-by-design) | [Privacy-First Architecture](../principles/technical-standards.md#60-privacy-first-architecture) | **Navigation Hub**: [Knowledge Hub](../README.md) | **Command Rules**: [Rules Hub](./README.md)