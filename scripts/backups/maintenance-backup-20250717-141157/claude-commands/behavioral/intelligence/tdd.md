# Atomic Command: `/tdd`

## **Principle #7: Test-Driven Development (TDD)**
**"Define verification criteria before implementation."**

---

## 🎯 **COMMAND DEFINITION**

### **Purpose**
Implement comprehensive test-driven development methodology where verification criteria are defined before any implementation begins, ensuring clear success metrics and autonomous validation.

### **Complexity**: 0.7/1.0
### **Context Required**: Objective and success criteria requirements
### **Execution Time**: 2-8 minutes (depending on test complexity)

---

## ⚡ **ACTIVATION PROTOCOL**

### **Input Format**
```
/tdd [objective] [verification_types?] [success_threshold?]
```

### **What This Command Does**
1. **Define Success Criteria**: Establish clear, measurable verification criteria before implementation
2. **Create Test Framework**: Design comprehensive testing approach for all aspects
3. **Implement Minimally**: Build minimal solution that meets verification criteria
4. **Verify Continuously**: Validate against criteria throughout development
5. **Refactor Safely**: Improve implementation while maintaining verification success

### **TDD Protocol Steps**
1. Write comprehensive verification criteria first
2. Create automated tests where possible
3. Implement minimal solution to pass verification
4. Run all verification tests
5. Refactor while maintaining test success
6. Document patterns learned through TDD process

---

## 🔍 **VERIFICATION CRITERIA**

### **Success Metrics**
- **Criteria Completeness**: 100% of success criteria defined before implementation
- **Test Coverage**: ≥95% of functionality covered by automated verification
- **Verification Accuracy**: ≥90% correlation between tests and actual success
- **Red-Green-Refactor**: Complete TDD cycle followed for all implementation
- **Documentation Quality**: All verification criteria clearly documented

### **Mathematical Validation**
```javascript
tdd_effectiveness = (
  (criteria_completeness * 0.30) +
  (test_coverage * 0.25) +
  (verification_accuracy * 0.25) +
  (cycle_adherence * 0.15) +
  (documentation_quality * 0.05)
)
// Required: ≥ 8.5/10
```

---

## 🔗 **NATURAL CONNECTIONS**

### **Automatically Triggers**
- `/verification-loops` - Continuous validation through iteration
- `/verify-mathematics` - Objective measurement of success
- `/strategic-git` - Version control checkpoints at verification milestones

### **Compatible With**
- `/objective-decomposition` - TDD applied to each sub-objective
- `/exploration-first` - Exploration informs verification criteria design
- `/recognize-patterns` - TDD patterns identified for reuse

### **Feeds Into**
- All implementation commands (TDD provides verification foundation)
- Quality assurance processes (TDD ensures quality by design)
- Continuous integration (TDD enables automated validation)

---

## 📋 **USAGE EXAMPLES**

### **Feature Development**
```
/tdd "User authentication system" "functional,security,performance" 0.95
```
**Result**: Complete verification criteria for auth system, automated tests, minimal implementation, iterative refinement

### **API Development**
```
/tdd "REST API for user management" "integration,validation,documentation"
```
**Result**: API test suite, endpoint verification, minimal working API, documented behavior

### **Performance Optimization**
```
/tdd "Reduce page load time to under 2 seconds" "performance,user_experience" 0.90
```
**Result**: Performance tests, optimization criteria, minimal changes, verified improvements

---

## 🔄 **5-PHASE TDD IMPLEMENTATION**

### **Phase 1: Criteria Definition (30%)**
**Objective**: Define comprehensive verification criteria before any code
- Functional requirements and expected behaviors
- Performance criteria and benchmarks
- Security requirements and validation
- User experience and usability criteria
- Integration and compatibility requirements

**Verification**: 100% of success criteria documented and measurable

### **Phase 2: Test Creation (25%)**
**Objective**: Create automated tests for all verification criteria
- Unit tests for individual functions
- Integration tests for system interactions
- Performance tests for speed and efficiency
- Security tests for vulnerability detection
- User acceptance tests for experience validation

**Verification**: ≥95% of criteria covered by automated tests

### **Phase 3: Minimal Implementation (25%)**
**Objective**: Build smallest possible solution that passes tests
- Focus on meeting verification criteria, not optimization
- Implement core functionality without extra features
- Ensure all tests pass with minimal code
- Document implementation decisions and trade-offs

**Verification**: All tests pass with minimal implementation

### **Phase 4: Verification Validation (15%)**
**Objective**: Validate that tests accurately measure success
- Run tests against implementation
- Verify test accuracy and completeness
- Identify and fix test gaps or inaccuracies
- Ensure tests provide meaningful feedback

**Verification**: ≥90% correlation between test results and actual success

### **Phase 5: Refactor and Improve (5%)**
**Objective**: Improve implementation while maintaining test success
- Optimize performance while keeping tests green
- Improve code quality and maintainability
- Add documentation and comments
- Ensure all tests continue to pass

**Verification**: All tests remain green, implementation quality improved

---

## 🛡️ **FALLBACK PROTOCOL**

### **If TDD Process Fails**
1. **Unclear Requirements**: Use `/objective-decomposition` to clarify success criteria
2. **Complex Testing**: Break into smaller testable units
3. **Test Writing Difficulty**: Start with manual verification criteria, automate incrementally
4. **Implementation Complexity**: Use minimal viable implementation, refactor later

### **Recovery Strategy**
- Document what verification was attempted for future improvement
- Create manual verification checklist when automation fails
- Use simplified success criteria to enable progress
- Build test automation incrementally as understanding improves

---

## 📊 **INTEGRATION WITH DECISION ENGINE**

### **TDD-Based Routing**
- **Clear Requirements**: Standard TDD process with comprehensive testing
- **Unclear Requirements**: Mandatory `/exploration-first` before TDD
- **Complex Implementation**: Extended TDD with incremental verification
- **Legacy Code**: Adapted TDD with characterization tests

### **Verification Pattern Recognition**
- Successful TDD patterns → Templates for similar objectives
- Test automation strategies → Improved testing approaches
- Verification criteria patterns → Better criteria definition
- TDD failure patterns → Process improvements

---

## 🔄 **TDD EVOLUTION**

### **Learning Metrics**
- **Test Effectiveness**: How well tests predict actual success
- **Implementation Speed**: Time from criteria to working solution
- **Quality Outcomes**: Quality of solutions produced through TDD
- **Pattern Recognition**: Identification of reusable TDD patterns

### **TDD Intelligence Growth**
- Learn optimal test types for different objective categories
- Identify verification criteria patterns that lead to successful outcomes
- Build templates for common TDD scenarios
- Develop automated test generation for predictable patterns

---

## 🎯 **VERIFICATION TYPES**

### **Functional Verification**
- Unit tests for individual functions
- Integration tests for component interactions
- End-to-end tests for complete user workflows
- API tests for interface contracts

### **Non-Functional Verification**
- Performance tests for speed and efficiency
- Security tests for vulnerability detection
- Usability tests for user experience
- Compatibility tests for different environments

### **Quality Verification**
- Code quality tests (linting, complexity)
- Documentation tests (completeness, accuracy)
- Maintainability tests (coupling, cohesion)
- Reliability tests (error handling, edge cases)

---

## 🌟 **TDD BENEFITS**

### **Quality Assurance**
- Clear success criteria prevent misunderstandings
- Automated tests catch regressions early
- Minimal implementation reduces complexity
- Continuous verification ensures quality

### **Development Efficiency**
- Clear targets accelerate development
- Early feedback prevents wasted effort
- Refactoring is safe with comprehensive tests
- Pattern recognition improves future TDD speed

---

**Note**: This command implements the foundational principle that verification criteria must be defined before implementation. It ensures that AI has clear, measurable targets and can autonomously validate success.