# Containerize - Automated Project Containerization

**CATEGORY**: Executable Deployment  
**PURPOSE**: Automated project containerization using standardized templates and security best practices  
**ACTIVATION**: `/containerize [project] [type] [port] [entry_point]`  
**INTEGRATION**: P55/P56 compliance, Docker Authority standards, Principle #101-104 enforcement

**🚨 MANDATORY Compact Communication**: Auto-enforcement of Principle #82 with format `⟳ /comando → resultado 🎯 [tiempo]` and immediate blocking of verbose patterns.

## 🎯 Core Function

**AUTOMATED CONTAINERIZATION**: Transform any project into production-ready containerized application using Context Engineering templates and 2024-2025 Docker best practices.

### **Execution Pattern**
```bash
/containerize my-app web 3000 app.py
# → Applies web application containerization template
# → Configures multi-stage builds with security hardening
# → Sets up Docker Compose with Redis/database integration
# → Implements health checks and monitoring
```

## 📋 P55/P56 Integration

### **P55 Execution Evidence**
**CRITICAL**: Visual confirmation of ALL containerization steps with quantifiable metrics

**MANDATORY Tool Executions**:
1. **Template Analysis**: `find docs/templates/containerization/ -name "*.template"`
2. **Project Assessment**: `ls -la [project_dir]` → identify application type
3. **Security Configuration**: `docker scout --help` → validate security scanning capability
4. **Build Validation**: `docker build --progress=plain .` → multi-stage build verification
5. **Health Check Testing**: `curl -f http://localhost:[port]/api/health` → endpoint validation

### **P56 Transparency Protocol**
**MANDATORY Visual Announcements**:

```bash
⟳ Project containerization → [PROJECT_NAME] detected as [TYPE] → Port [PORT] configured → Templates applied [2.1s]
✅ Multi-stage Dockerfile: 65% size reduction achieved
✅ Security hardening: Non-root user, minimal base image implemented  
✅ Performance optimization: <5min build time target set
✅ Health endpoints: /api/health endpoint configured
```

## 🔧 Implementation Specifications

### **1. Project Type Detection**
**AUTOMATIC ANALYSIS**:
- **Web Application**: package.json, requirements.txt, Gemfile
- **API Service**: FastAPI, Express, Flask patterns
- **Background Service**: Celery, worker patterns
- **Static Site**: build/ dist/ public/ directories
- **Database Application**: migrations/, models/ directories

### **2. Template Application Strategy**
**DOCKER AUTHORITY COMPLIANCE**:
- **Multi-stage builds**: Builder + Runtime stages (Principle #101)
- **Security hardening**: Non-root users, minimal images (Principle #103)
- **Multi-architecture**: ARM64 + AMD64 support (Principle #102)
- **Performance targets**: <100MB images, <5min builds (Principle #104)

### **3. Configuration Variables**
**AUTOMATIC SUBSTITUTION**:
```bash
# Template Variables Applied:
{{PROJECT_NAME}} → my-app
{{APPLICATION_TYPE}} → web
{{DEFAULT_PORT}} → 3000
{{ENTRY_POINT}} → app.py
{{PYTHON_VERSION}} → 3.9-slim
{{NODE_VERSION}} → 18-alpine
{{HEALTH_ENDPOINT}} → /api/health
```

## 🚨 Enforcement Integration

### **Principle #101: Container-First Development**
**MANDATORY ACTIVATION**: Automatic enforcement for all new projects
- **Detection**: New project directory without Dockerfile
- **Action**: Immediate containerization prompt with template selection
- **Validation**: Dockerfile presence and compliance verification

### **Principle #102: Multi-Architecture Support**
**AUTOMATIC IMPLEMENTATION**: ARM64 + AMD64 platform detection
- **Platform Detection**: `uname -m` → architecture identification
- **Build Configuration**: `--platform linux/amd64,linux/arm64`
- **Testing**: Platform-specific build verification

### **Principle #103: Security Hardening Protocol**
**CRITICAL SECURITY MEASURES**:
- **Non-root execution**: `USER app` with proper group creation
- **Capability dropping**: `--cap-drop=ALL` runtime configuration
- **Secret management**: Runtime injection validation
- **Vulnerability scanning**: Docker Scout integration

### **Principle #104: Performance Optimization**
**QUANTIFIED TARGETS**:
- **Image size**: <100MB for application images
- **Build time**: <5 minutes for standard applications
- **Layer efficiency**: Consolidated RUN commands
- **Cache optimization**: BuildKit mount utilization

## 📊 Command Orchestration

### **Multi-Command Integration**
**AUTOMATIC ACTIVATION**: Part of complete deployment pipeline
- **Phase 1**: `/containerize` → Application containerization
- **Phase 2**: `/docker-deploy` → Environment deployment
- **Phase 3**: `/k8s-assess` → Kubernetes readiness evaluation
- **Phase 4**: `/port-scan` → Conflict detection and resolution

### **Dependency Chain**
**INTELLIGENT ORDERING**:
1. Project type detection → Template selection
2. Security configuration → Dockerfile generation
3. Compose setup → Service orchestration
4. Health check implementation → Monitoring integration
5. Build validation → Performance verification

## 🔍 Validation Framework

### **Automated Testing Protocol**
**COMPREHENSIVE VALIDATION**:
```bash
# Security Validation
docker scout cves [image]:latest → vulnerability assessment
docker run --rm [image] id → non-root user verification

# Performance Validation  
docker build --progress=plain . → build time measurement
docker images [image] → size verification (<100MB target)

# Functionality Validation
docker-compose up -d → service orchestration test
curl -f http://localhost:[port]/api/health → health endpoint verification
```

### **Error Detection and Resolution**
**ZERO TOLERANCE PROTOCOL** (Principle #89):
1. **Port Conflicts**: Automatic detection → alternative port suggestion
2. **Build Failures**: Layer-by-layer analysis → specific error identification
3. **Security Issues**: Vulnerability scanning → remediation recommendations
4. **Performance Problems**: Build time analysis → optimization suggestions

## 📈 Integration Ecosystem

### **Cross-Reference Network**
- **Docker Authority**: `/docs/knowledge/technical/docker-containerization-authority.md`
- **Kubernetes Guide**: `/docs/knowledge/deployment/kubernetes-strategic-guide.md`
- **Templates**: `/docs/templates/containerization/`
- **Principles**: `/docs/knowledge/principles/technical-standards.md` (#101-104)

### **Command Relationships**
- **Predecessor**: Project analysis and planning commands
- **Parallel**: `/docker-deploy`, `/k8s-assess` for complete deployment pipeline
- **Successor**: Monitoring and maintenance commands
- **Support**: `/port-scan` for conflict resolution

### **Dashboard Integration**
**REAL-TIME MONITORING**:
- **Containerization Metrics**: Success rates, build times, security scores
- **Template Usage**: Most popular templates and configurations  
- **Performance Tracking**: Image sizes, build optimization trends
- **Security Monitoring**: Vulnerability detection and resolution rates

## 🚀 Usage Examples

### **Basic Containerization**
```bash
/containerize blog-app web 3000 server.js
# → Applies Node.js web template
# → Configures port 3000 with health checks
# → Implements multi-stage build with Alpine base
```

### **Advanced Configuration**
```bash
/containerize api-service background 8080 worker.py
# → Applies Python background service template
# → Configures Redis integration and job queue
# → Implements monitoring and logging
```

### **Database Application**
```bash
/containerize data-app database 5432 migrate.sh
# → Applies database application template
# → Configures PostgreSQL integration
# → Implements migration and backup systems
```

## ✅ Success Metrics

### **Quantifiable Outcomes**
- **Template Application**: 100% successful variable substitution
- **Security Compliance**: ≥95% Docker Scout security score
- **Performance Targets**: <100MB images, <5min builds achieved
- **Multi-platform**: ARM64 + AMD64 builds verified
- **Integration**: Dashboard metrics collection functional

### **Validation Evidence**
- **Build Success**: `docker build` exit code 0
- **Security Verification**: Non-root user confirmed
- **Health Check**: `/api/health` endpoint responsive
- **Performance**: Image size and build time within targets
- **Compliance**: All principles #101-104 validated

---

**STRATEGIC IMPACT**: Enables immediate containerization for any project with production-ready security, performance, and monitoring integration while maintaining full compliance with Context Engineering principles and Docker 2024-2025 best practices.
