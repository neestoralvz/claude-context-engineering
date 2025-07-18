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

**Data Minimization Protocol**:

**Collection Limits Framework**:
- **MANDATORY Principle**: Only collect data essential for functionality
- **Pre-Collection Validation**: Data necessity verification
- **Purpose Documentation**: Clear documentation of data collection purpose
- **Retention Policy**: Automatic deletion after purpose fulfillment

**Purpose Limitation Requirements**:
- **Usage Restriction**: Data usage restricted to declared purposes only
- **Automatic Enforcement**: Purpose boundaries enforcement
- **Continuous Monitoring**: Data usage patterns monitoring
- **Violation Detection**: Real-time detection of purpose violations

**Storage Optimization Framework**:
- **Duration Minimization**: Minimize data storage duration and scope
- **Automatic Management**: Data expiration and cleanup
- **Efficiency Balance**: Storage optimization while maintaining functionality
- **Secure Deletion**: Secure deletion of expired data

### **5. Consent Management Framework**

**CRITICAL REQUIREMENT**: Explicit consent MUST be obtained for any data processing or storage operations.

**Consent Management System**:

**Consent Verification Protocol**:
- **Active Verification**: Before any data processing
- **Granular Consent**: Different data types and purposes
- **Documentation Standards**: Clear consent documentation and tracking
- **Withdrawal Mechanisms**: Easy consent withdrawal mechanisms

**Consent Transparency Requirements**:
- **Clear Explanation**: Data usage and processing explanation
- **Plain Language**: Data practices explanations
- **Accessibility Standards**: Accessible consent interfaces for all users
- **Update Notifications**: Consent policy changes notification

**Consent Enforcement Framework**:
- **Automatic Enforcement**: Consent decisions enforcement
- **Complete Scope**: All data processing operations
- **Continuous Validation**: Consent compliance validation
- **Audit Trails**: Comprehensive consent audit trails

### **6. Privacy Rights Implementation**

**MANDATORY IMPLEMENTATION**: Complete implementation of privacy rights including deletion, access, and portability.

**Privacy Rights Framework**:

**Right to Deletion Protocol**:
- **Complete Removal**: User data removal on user request
- **Comprehensive Scope**: All user data across all systems and backups
- **Deletion Verification**: Complete deletion verification
- **Timeline Standard**: ≤30 days for complete deletion

**Right to Access Framework**:
- **Data Visibility**: User visibility into collected and processed data
- **Format Standards**: Machine-readable and human-readable formats
- **Complete Disclosure**: Data inventory and usage disclosure
- **Timeline Requirement**: ≤15 days for access request fulfillment

**Data Portability Requirements**:
- **Standard Formats**: Data export and transfer formats
- **Export Formats**: JSON, CSV, XML for structured data export
- **Complete Capability**: User data export capability
- **Automated Systems**: Export generation and delivery

---

## 🔐 **COMPLIANCE AUTOMATION RULES (MANDATORY)**

### **7. Regulatory Compliance Framework**

**CRITICAL REQUIREMENT**: Automatic compliance with applicable privacy and security regulations.

**Compliance Automation System**:

**GDPR Compliance Framework**:
- **Automatic Verification**: GDPR compliance verification and reporting
- **Compliance Scope**: Data protection, consent, rights implementation
- **Continuous Monitoring**: GDPR compliance monitoring
- **Automated Reporting**: Compliance reporting and documentation

**CCPA Compliance Framework**:
- **Compliance Requirement**: California Consumer Privacy Act compliance framework
- **Protection Scope**: Consumer rights, data disclosure, opt-out mechanisms
- **Automatic Implementation**: CCPA compliance enforcement
- **Regular Validation**: CCPA compliance validation

**Regional Adaptation Framework**:
- **Automatic Adaptation**: Local privacy regulations adaptation
- **Regulation Scope**: PIPEDA, LGPD, other regional privacy laws
- **Automatic Detection**: Applicable regulations detection
- **Dynamic Adaptation**: Compliance framework adaptation

### **8. Audit Trail Generation**

**MANDATORY REQUIREMENT**: Comprehensive audit trails for all security and privacy-relevant operations.

**Audit Trail Framework**:

**Security Audit Trails Requirements**:
- **Complete Logging**: Security-relevant actions logging
- **Logging Scope**: Authentication, authorization, data access, security events
- **Secure Retention**: Audit log retention with integrity protection
- **Automated Analysis**: Audit log analysis and alerting

**Privacy Audit Trails Requirements**:
- **Complete Logging**: Privacy-relevant operations logging
- **Operations Scope**: Data collection, processing, sharing, deletion
- **Regulatory Compliance**: Audit trails meeting regulatory requirements
- **Secure Access**: Audit trail access for compliance verification

**Compliance Reporting Framework**:
- **Automated Generation**: Compliance reports generation
- **Reporting Frequency**: Real-time monitoring with periodic comprehensive reports
- **Standard Formats**: Compliance reporting formats
- **Audit Support**: Third-party audit preparation and support

---

## 🎯 **RISK MITIGATION PROTOCOLS (MANDATORY)**

### **9. Threat Detection and Prevention**

**CRITICAL REQUIREMENT**: Proactive detection and prevention of security and privacy threats.

**Threat Mitigation Framework**:

**Data Leak Prevention Protocol**:
- **Multi-Layer Protection**: Against accidental data exposure
- **Implementation Strategy**: DLP scanning, output filtering, access controls
- **Prevention Effectiveness**: ≥99.9% prevention of sensitive data leaks
- **Real-Time Monitoring**: Data leak detection and prevention

**Injection Attack Prevention Framework**:
- **Validation Requirement**: Input validation and sanitization for all commands
- **Protection Scope**: Command injection, data injection, prompt injection
- **Multi-Layer Implementation**: Input validation and sanitization
- **Regular Testing**: Penetration testing and vulnerability assessment

**Unauthorized Access Prevention Protocol**:
- **Access Controls**: Strong access controls and authentication
- **Implementation Framework**: Multi-factor authentication, role-based access control
- **Real-Time Monitoring**: Access monitoring and anomaly detection
- **Automatic Response**: Unauthorized access attempts response

### **10. Security Incident Response**

**MANDATORY REQUIREMENT**: Comprehensive incident response protocols for security and privacy breaches.

**Incident Response Framework**:

**Detection Protocols Requirements**:
- **Real-Time Detection**: Security and privacy incidents detection
- **Continuous Monitoring**: Security anomalies monitoring
- **Immediate Alerting**: Critical security events alerting
- **Automatic Classification**: Incident classification and prioritization

**Response Procedures Framework**:
- **Standardized Procedures**: Incident response procedures
- **Response Timeline**: ≤15 minutes for critical incident response initiation
- **Automatic Containment**: Security incidents containment
- **Systematic Recovery**: Recovery and restoration procedures

**Post-Incident Analysis Requirements**:
- **Comprehensive Analysis**: Post-incident analysis and improvement
- **Complete Documentation**: Incident documentation and lessons learned
- **Prevention Implementation**: Preventive measures based on analysis
- **Regulatory Reporting**: Stakeholder incident reporting

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
