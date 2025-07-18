# Kubernetes Strategic Guide

**Complete strategic framework for Kubernetes adoption with Docker-to-K8s decision protocols and production-ready patterns.**

## 🎯 Strategic Overview

**Kubernetes Purpose**: Container orchestration, scaling, and management for production workloads across distributed systems.

**2024-2025 Context**: Kubernetes remains the dominant orchestration platform with enhanced security, GitOps integration, and cloud-native ecosystem maturity. Modern K8s workflows emphasize declarative configurations, security policies, and automated operations.

## 📊 Docker vs Kubernetes Decision Framework

### **Decision Matrix (Use This Framework)**

| Factor | Docker/Compose | Kubernetes | Threshold |
|--------|----------------|------------|-----------|
| **Scale** | 1-3 containers | 4+ containers | >3 services |
| **Traffic** | <1000 req/day | >1000 req/day | High load |
| **Uptime** | 95-99% | 99.9%+ | Critical systems |
| **Team Size** | 1-5 developers | 5+ developers | Large teams |
| **Environments** | 1-2 environments | 3+ environments | Multi-env |
| **Compliance** | Basic | Advanced | Regulated industries |

### **When to Use Docker (Recommended)**

**✅ Perfect for:**
- Personal projects and MVPs
- Small teams (<5 developers)
- Simple microservices (≤3 services)
- Development environments
- Quick prototypes and demos
- Single-server deployments

**Example Decision**: Personal dashboard, small web apps, development tooling

### **When to Use Kubernetes (Required)**

**✅ Essential for:**
- Production microservices (4+ services)
- High availability requirements (99.9%+)
- Auto-scaling needs
- Multi-environment deployments
- Enterprise compliance requirements
- Large development teams (5+ engineers)

**Example Decision**: E-commerce platforms, SaaS applications, enterprise systems

### **Migration Indicators (Red Flags)**

**🚨 Time to move to Kubernetes when:**
```bash
# You're doing this manually with Docker:
docker run -d --restart=unless-stopped service1
docker run -d --restart=unless-stopped service2
docker run -d --restart=unless-stopped service3
# ... for 5+ services

# Or dealing with these problems:
- Manual scaling decisions
- Service discovery complexity
- Health check coordination
- Load balancing configuration
- Secret management across environments
- Rolling updates becoming risky
```

## 🏗️ Kubernetes Architecture Patterns

### **Production-Ready Cluster Architecture**

**CRITICAL Namespace Framework** (MANDATORY Configuration):

**PRODUCTION Environment Requirements**:
- **API Version**: v1 (REQUIRED standard)
- **Resource Type**: Namespace (MANDATORY isolation)
- **Metadata Configuration**:
  - **Name**: production (CRITICAL identifier)
  - **Environment Label**: prod (MANDATORY classification)
  - **Monitoring**: enabled (REQUIRED observability)
  - **Security Policy**: strict (MAXIMUM protection)

**STAGING Environment Requirements**:
- **API Version**: v1 (REQUIRED standard)
- **Resource Type**: Namespace (MANDATORY isolation)
- **Metadata Configuration**:
  - **Name**: staging (CRITICAL identifier)
  - **Environment Label**: staging (MANDATORY classification)
  - **Monitoring**: enabled (REQUIRED observability)
  - **Security Policy**: moderate (BALANCED protection)

### **Deployment Patterns (2024 Standards)**

**CRITICAL Rolling Update Protocol** (MANDATORY Zero-Downtime Strategy):

**DEPLOYMENT Framework**:
- **API Version**: apps/v1 (REQUIRED Kubernetes standard)
- **Resource Type**: Deployment (MANDATORY workload management)
- **Metadata Configuration**:
  - **Application Name**: web-app (CRITICAL identifier)
  - **Target Namespace**: production (MANDATORY environment isolation)

**SCALING Configuration**:
- **Replica Count**: 3 (REQUIRED minimum for high availability)
- **Update Strategy**: RollingUpdate (MANDATORY zero-downtime approach)
- **Maximum Surge**: 1 (CONTROLLED resource expansion)
- **Maximum Unavailable**: 0 (ZERO downtime tolerance)

**SELECTION Criteria**:
- **Application Selector**: web-app (MANDATORY pod targeting)

**CONTAINER Configuration**:
- **Application Name**: app (CRITICAL container identifier)
- **Image Source**: registry.example.com/web-app:v1.2.3 (MANDATORY version pinning)
- **Exposed Port**: 8080 (REQUIRED application endpoint)
- **Environment Variables**: DATABASE_URL via secret reference (SECURE configuration)

**SECURITY Protocol**:
- **Non-Root Execution**: MANDATORY (enhanced security)
- **User ID**: 1001 (REQUIRED non-privileged execution)
- **File System Group**: 1001 (CONTROLLED access permissions)

**RESOURCE Limits**:
- **Memory Request**: 256Mi (GUARANTEED minimum allocation)
- **CPU Request**: 250m (BASELINE processing capacity)
- **Memory Limit**: 512Mi (MAXIMUM memory consumption)
- **CPU Limit**: 500m (PEAK processing capacity)

**HEALTH Monitoring**:
- **Liveness Check**: /health endpoint, 30s delay, 10s intervals (CRITICAL failure detection)
- **Readiness Check**: /ready endpoint, 5s delay, 5s intervals (MANDATORY traffic routing)

**CRITICAL Service and Ingress Protocol** (MANDATORY Network Exposure):

**SERVICE Framework**:
- **API Version**: v1 (REQUIRED Kubernetes core)
- **Resource Type**: Service (MANDATORY network abstraction)
- **Metadata Configuration**:
  - **Service Name**: web-app-service (CRITICAL network identifier)
  - **Target Namespace**: production (MANDATORY environment isolation)
- **Network Configuration**:
  - **Pod Selector**: web-app (MANDATORY traffic targeting)
  - **External Port**: 80 (STANDARD HTTP port)
  - **Target Port**: 8080 (REQUIRED application port mapping)
  - **Service Type**: ClusterIP (INTERNAL cluster networking)

**INGRESS Framework**:
- **API Version**: networking.k8s.io/v1 (REQUIRED networking standard)
- **Resource Type**: Ingress (MANDATORY external access control)
- **Metadata Configuration**:
  - **Ingress Name**: web-app-ingress (CRITICAL routing identifier)
  - **Target Namespace**: production (MANDATORY environment isolation)
- **Annotation Requirements**:
  - **Ingress Class**: nginx (REQUIRED controller specification)
  - **Certificate Manager**: letsencrypt-prod (MANDATORY SSL automation)
  - **Rate Limiting**: 100 requests/second (CRITICAL protection)

**TLS Configuration**:
- **Protected Hosts**: app.example.com (MANDATORY SSL coverage)
- **Certificate Secret**: web-app-tls (REQUIRED SSL storage)

**ROUTING Rules**:
- **Target Host**: app.example.com (CRITICAL domain specification)
- **Path Matching**: / with Prefix type (COMPREHENSIVE path coverage)
- **Backend Service**: web-app-service on port 80 (MANDATORY traffic destination)

## 🔒 Security Hardening (Mandatory)

### **Pod Security Standards (2024)**

**CRITICAL Security Enforcement Protocol** (MAXIMUM Protection Framework):

**SECURE Namespace Configuration**:
- **API Version**: v1 (REQUIRED Kubernetes core standard)
- **Resource Type**: Namespace (MANDATORY security boundary)
- **Metadata Requirements**:
  - **Namespace Name**: secure-apps (CRITICAL security identifier)
  - **Security Enforcement**: restricted (MAXIMUM security level)
  - **Security Auditing**: restricted (COMPREHENSIVE monitoring)
  - **Security Warnings**: restricted (PROACTIVE threat detection)

### **Network Policies (Zero Trust)**

**CRITICAL Zero Trust Network Protocol** (MANDATORY Default Deny):

**DEFAULT DENY Policy**:
- **API Version**: networking.k8s.io/v1 (REQUIRED networking standard)
- **Resource Type**: NetworkPolicy (MANDATORY traffic control)
- **Metadata Configuration**:
  - **Policy Name**: deny-all-default (CRITICAL baseline security)
  - **Target Namespace**: production (MANDATORY environment isolation)
- **Traffic Control**:
  - **Pod Selection**: ALL pods (COMPREHENSIVE coverage)
  - **Policy Types**: Ingress AND Egress (COMPLETE traffic control)

**APPLICATION ALLOW Policy**:
- **API Version**: networking.k8s.io/v1 (REQUIRED networking standard)
- **Resource Type**: NetworkPolicy (MANDATORY selective access)
- **Metadata Configuration**:
  - **Policy Name**: allow-web-app (CRITICAL application access)
  - **Target Namespace**: production (MANDATORY environment isolation)
- **Selection Criteria**:
  - **Target Pods**: web-app labeled pods (SPECIFIC application targeting)
  - **Policy Types**: Ingress AND Egress (CONTROLLED bidirectional traffic)

**INGRESS Rules**:
- **Source Selection**: nginx-ingress labeled pods (AUTHORIZED traffic source)
- **Protocol**: TCP (REQUIRED transport layer)
- **Target Port**: 8080 (SPECIFIC application endpoint)

**EGRESS Rules**:
- **Destination Selection**: database labeled pods (AUTHORIZED data access)
- **Protocol**: TCP (REQUIRED transport layer)
- **Target Port**: 5432 (SPECIFIC database endpoint)

### **RBAC Configuration**

**CRITICAL Role-Based Access Control** (MANDATORY Least Privilege):

**DEVELOPER Role Definition**:
- **API Version**: rbac.authorization.k8s.io/v1 (REQUIRED authorization standard)
- **Resource Type**: Role (MANDATORY permission definition)
- **Metadata Configuration**:
  - **Target Namespace**: production (MANDATORY environment scope)
  - **Role Name**: developer-role (CRITICAL permission identifier)

**PERMISSION Rules**:
- **Core API Resources**: pods, services, configmaps (READ-ONLY access)
  - **Allowed Actions**: get, list, watch (RESTRICTED to read operations)
- **Apps API Resources**: deployments, replicasets (LIMITED write access)
  - **Allowed Actions**: get, list, watch, update, patch (CONTROLLED modification rights)

**BINDING Configuration**:
- **API Version**: rbac.authorization.k8s.io/v1 (REQUIRED authorization standard)
- **Resource Type**: RoleBinding (MANDATORY user-role association)
- **Metadata Configuration**:
  - **Binding Name**: developer-binding (CRITICAL association identifier)
  - **Target Namespace**: production (MANDATORY environment scope)

**USER Assignment**:
- **Subject Type**: User (INDIVIDUAL access control)
- **User Identity**: developer@company.com (SPECIFIC user specification)
- **Authorization Group**: rbac.authorization.k8s.io (REQUIRED API group)

**ROLE Reference**:
- **Referenced Role**: developer-role (MANDATORY permission source)
- **Role Type**: Role (NAMESPACE-SCOPED permissions)
- **Authorization Group**: rbac.authorization.k8s.io (REQUIRED API group)

## 📈 Scaling and Performance

### **Horizontal Pod Autoscaler (HPA)**

**CRITICAL Auto-Scaling Protocol** (MANDATORY Dynamic Resource Management):

**HPA Framework**:
- **API Version**: autoscaling/v2 (REQUIRED latest scaling standard)
- **Resource Type**: HorizontalPodAutoscaler (MANDATORY scaling automation)
- **Metadata Configuration**:
  - **Autoscaler Name**: web-app-hpa (CRITICAL scaling identifier)
  - **Target Namespace**: production (MANDATORY environment isolation)

**SCALING Target**:
- **Target API Version**: apps/v1 (REQUIRED deployment standard)
- **Target Type**: Deployment (MANDATORY workload reference)
- **Target Name**: web-app (SPECIFIC application targeting)

**CAPACITY Limits**:
- **Minimum Replicas**: 3 (REQUIRED baseline availability)
- **Maximum Replicas**: 50 (CONTROLLED resource ceiling)

**METRIC Configuration**:
- **CPU Utilization**: 70% average threshold (PERFORMANCE optimization)
- **Memory Utilization**: 80% average threshold (RESOURCE efficiency)

**SCALING Behavior**:
- **Scale-Up Protocol**:
  - **Stabilization Window**: 60 seconds (CONTROLLED expansion timing)
  - **Maximum Increase**: 100% per 15-second period (AGGRESSIVE scaling)
- **Scale-Down Protocol**:
  - **Stabilization Window**: 300 seconds (CONSERVATIVE reduction timing)
  - **Maximum Decrease**: 10% per 60-second period (GRADUAL scaling)

### **Vertical Pod Autoscaler (VPA)**

**CRITICAL Resource Optimization Protocol** (MANDATORY Right-Sizing):

**VPA Framework**:
- **API Version**: autoscaling.k8s.io/v1 (REQUIRED VPA standard)
- **Resource Type**: VerticalPodAutoscaler (MANDATORY resource optimization)
- **Metadata Configuration**:
  - **VPA Name**: web-app-vpa (CRITICAL optimization identifier)
  - **Target Namespace**: production (MANDATORY environment isolation)

**OPTIMIZATION Target**:
- **Target API Version**: apps/v1 (REQUIRED deployment standard)
- **Target Type**: Deployment (MANDATORY workload reference)
- **Target Name**: web-app (SPECIFIC application targeting)

**UPDATE Policy**:
- **Update Mode**: Auto (AUTOMATED resource adjustment)

**RESOURCE Constraints**:
- **Container Name**: app (SPECIFIC container targeting)
- **CPU Limits**: 100m minimum, 1 CPU maximum (CONTROLLED processing capacity)
- **Memory Limits**: 128Mi minimum, 2Gi maximum (MANAGED memory allocation)

## 🔄 GitOps and CI/CD Integration

### **ArgoCD Application (Recommended)**

**CRITICAL GitOps Deployment Protocol** (MANDATORY Continuous Delivery):

**ARGOCD Framework**:
- **API Version**: argoproj.io/v1alpha1 (REQUIRED ArgoCD standard)
- **Resource Type**: Application (MANDATORY GitOps deployment)
- **Metadata Configuration**:
  - **Application Name**: web-app (CRITICAL deployment identifier)
  - **Target Namespace**: argocd (REQUIRED ArgoCD namespace)

**PROJECT Configuration**:
- **ArgoCD Project**: default (STANDARD project scope)

**SOURCE Configuration**:
- **Repository URL**: https://github.com/company/k8s-manifests (MANDATORY manifest source)
- **Target Revision**: main (REQUIRED branch specification)
- **Manifest Path**: applications/web-app (SPECIFIC application directory)

**DESTINATION Configuration**:
- **Target Server**: https://kubernetes.default.svc (REQUIRED cluster endpoint)
- **Target Namespace**: production (MANDATORY deployment environment)

**SYNCHRONIZATION Policy**:
- **Automated Deployment**: ENABLED (CONTINUOUS delivery)
- **Resource Pruning**: ENABLED (AUTOMATIC cleanup)
- **Self-Healing**: ENABLED (AUTOMATIC drift correction)
- **Namespace Creation**: ENABLED (AUTOMATIC environment setup)

**RETRY Configuration**:
- **Maximum Attempts**: 3 retries (RESILIENT deployment)
- **Backoff Strategy**: Exponential (INTELLIGENT retry timing)
- **Initial Duration**: 5 seconds (QUICK first retry)
- **Backoff Factor**: 2x multiplier (PROGRESSIVE delay)
- **Maximum Duration**: 3 minutes (REASONABLE timeout)

### **GitHub Actions Kubernetes Deployment**

**CRITICAL CI/CD Pipeline Protocol** (MANDATORY Automated Deployment):

**PIPELINE Configuration**:
- **Trigger Events**: push to main, pull request validation (AUTOMATED activation)
- **Build Process**: Docker image creation with versioning (REPRODUCIBLE artifacts)
- **Security Scanning**: Container vulnerability assessment (MANDATORY security)
- **Deployment Strategy**: Blue-green or rolling updates (ZERO-DOWNTIME deployment)
- **Testing Integration**: Automated testing before production release (QUALITY assurance)
- **Rollback Capability**: Immediate reversion on failure detection (RELIABILITY protection)


## 📊 Monitoring and Observability

### **Prometheus Monitoring Stack**

**CRITICAL Metrics Collection Protocol** (MANDATORY Observability):

**SERVICE MONITOR Framework**:
- **API Version**: monitoring.coreos.com/v1 (REQUIRED Prometheus operator)
- **Resource Type**: ServiceMonitor (MANDATORY metrics collection)
- **Metadata Configuration**:
  - **Monitor Name**: web-app-metrics (CRITICAL monitoring identifier)
  - **Target Namespace**: production (MANDATORY environment isolation)

**MONITORING Configuration**:
- **Target Selection**: web-app labeled services (SPECIFIC application targeting)
- **Metrics Endpoint**: /metrics path on metrics port (STANDARD Prometheus format)
- **Scrape Interval**: 30 seconds (BALANCED monitoring frequency)
- **Scrape Timeout**: 10 seconds (RESPONSIVE collection timing)

### **Essential Health Checks**

**CRITICAL Health Monitoring Protocol** (MANDATORY Application Status):

**LIVENESS Probe Configuration**:
- **Check Method**: HTTP GET request (RELIABLE status verification)
- **Endpoint Path**: /health/live (SPECIFIC liveness indicator)
- **Target Port**: 8080 (APPLICATION service port)
- **Initial Delay**: 30 seconds (APPLICATION startup buffer)
- **Check Interval**: 10 seconds (FREQUENT liveness monitoring)
- **Timeout Duration**: 5 seconds (RESPONSIVE failure detection)
- **Failure Threshold**: 3 consecutive failures (TOLERANT restart policy)

**READINESS Probe Configuration**:
- **Check Method**: HTTP GET request (RELIABLE traffic readiness)
- **Endpoint Path**: /health/ready (SPECIFIC readiness indicator)
- **Target Port**: 8080 (APPLICATION service port)
- **Initial Delay**: 5 seconds (QUICK readiness assessment)
- **Check Interval**: 5 seconds (RAPID readiness monitoring)
- **Timeout Duration**: 3 seconds (FAST response requirement)
- **Failure Threshold**: 3 consecutive failures (SENSITIVE traffic control)

**STARTUP Probe Configuration**:
- **Check Method**: HTTP GET request (RELIABLE initialization status)
- **Endpoint Path**: /health/startup (SPECIFIC startup indicator)
- **Target Port**: 8080 (APPLICATION service port)
- **Initial Delay**: 10 seconds (MINIMAL startup buffer)
- **Check Interval**: 10 seconds (PATIENT startup monitoring)
- **Timeout Duration**: 5 seconds (REASONABLE startup response)
- **Failure Threshold**: 30 consecutive failures (EXTENDED startup tolerance)

## 🚀 Migration Strategy (Docker to Kubernetes)

### **Phase 1: Containerization Audit**

```bash
# Audit existing Docker setup
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

# Analyze resource usage
docker stats --no-stream

# Export configurations
docker inspect container_name > container_config.json
```

### **Phase 2: Kubernetes Manifest Generation**

```bash
# Generate base manifests from Docker Compose
kompose convert -f docker-compose.yml

# Or use kubectl to create base manifests
kubectl create deployment web-app --image=web-app:latest --dry-run=client -o yaml > deployment.yaml
```

### **Phase 3: Progressive Migration**

1. **Development Environment First**
   ```bash
   # Create development cluster
   kind create cluster --name dev-cluster
   
   # Deploy and test
   kubectl apply -f k8s/dev/
   kubectl port-forward svc/web-app 8080:80
   ```

2. **Staging Environment**
   ```bash
   # Deploy to staging
   kubectl apply -f k8s/staging/
   
   # Run integration tests
   kubectl wait --for=condition=available deployment/web-app --timeout=300s
   ```

3. **Production Rollout**
   ```bash
   # Blue-green deployment
   kubectl apply -f k8s/production/
   kubectl patch service web-app -p '{"spec":{"selector":{"version":"new"}}}'
   ```

## 🛠️ Essential Tools and Setup

### **Local Development Cluster Options**

```bash
# Kind (Kubernetes in Docker) - Recommended
kind create cluster --config=kind-config.yaml

# Minikube (Full-featured)
minikube start --memory=4096 --cpus=2

# k3d (Lightweight)
k3d cluster create dev-cluster --port "8080:80@loadbalancer"
```

### **Essential kubectl Commands**

```bash
# Cluster information
kubectl cluster-info
kubectl get nodes
kubectl top nodes

# Application management
kubectl get pods -o wide
kubectl describe pod <pod-name>
kubectl logs -f <pod-name>
kubectl exec -it <pod-name> -- /bin/bash

# Resource monitoring
kubectl top pods
kubectl get events --sort-by=.metadata.creationTimestamp

# Troubleshooting
kubectl describe deployment <deployment-name>
kubectl rollout history deployment/<deployment-name>
kubectl rollout undo deployment/<deployment-name>
```

### **Development Workflow Tools**

```bash
# Helm (Package manager)
helm install my-app ./helm-chart

# Skaffold (Development workflow)
skaffold dev --port-forward

# Tilt (Development automation)
tilt up

# Telepresence (Local development)
telepresence intercept web-app --port 8080:80
```

## ⚠️ Common Pitfalls and Solutions

### **Resource Management Issues**

**CRITICAL Resource Allocation Protocol** (MANDATORY Performance Management):

**RESOURCE Requests** (GUARANTEED Minimums):
- **Memory Request**: 256Mi (BASELINE memory allocation)
- **CPU Request**: 250m (MINIMUM processing capacity)

**RESOURCE Limits** (MAXIMUM Boundaries):
- **Memory Limit**: 512Mi (PEAK memory consumption)
- **CPU Limit**: 500m (MAXIMUM processing capacity)

### **Networking Problems**

```bash
# Debug DNS resolution
kubectl exec -it debug-pod -- nslookup service-name.namespace.svc.cluster.local

# Check service endpoints
kubectl get endpoints service-name

# Test connectivity
kubectl exec -it pod-name -- curl -v http://service-name.namespace.svc.cluster.local
```

### **Security Misconfigurations**

**CRITICAL Security Context Protocol** (MANDATORY Hardening):

**SECURITY Configuration**:
- **Non-Root Execution**: MANDATORY (prevents root privilege abuse)
- **User ID**: 1001 (SPECIFIC non-privileged user)
- **Read-Only Root Filesystem**: MANDATORY (prevents runtime modification)
- **Privilege Escalation**: FORBIDDEN (blocks elevation attacks)
- **Capability Dropping**: ALL capabilities removed (MINIMUM privilege principle)

## 📖 Decision Protocol Implementation

### **Assessment Checklist**

```markdown
## Kubernetes Readiness Assessment

### Scale Requirements
- [ ] More than 3 services
- [ ] Expected traffic >1000 requests/day
- [ ] Need for auto-scaling
- [ ] Multiple environments (dev, staging, prod)

### Team and Process
- [ ] Team size >5 developers
- [ ] DevOps/SRE expertise available
- [ ] CI/CD pipeline established
- [ ] Monitoring and alerting in place

### Technical Requirements
- [ ] High availability requirements (99.9%+)
- [ ] Service mesh needs
- [ ] Complex networking requirements
- [ ] Advanced security policies needed

### Infrastructure
- [ ] Multi-cloud or hybrid cloud strategy
- [ ] Compliance requirements (SOC2, HIPAA, etc.)
- [ ] Need for infrastructure as code
- [ ] Budget for cloud resources

Score: ___/16
- 0-4: Stick with Docker/Compose
- 5-8: Consider Kubernetes for future
- 9-12: Plan Kubernetes migration
- 13-16: Immediate Kubernetes adoption recommended
```

## 🔗 Integration with Context Engineering

### **Command Integration Points**

- `/k8s-assess` → Run readiness assessment
- `/docker-to-k8s` → Generate migration plan
- `/k8s-deploy` → Deploy using best practices
- `/cluster-health` → Monitor cluster status

### **Cross-References**

- **Docker Authority**: [Docker Containerization Authority](../technical/docker-containerization-authority.md)
- **Security Standards**: [Security Best Practices](../security/)
- **Performance Optimization**: [Performance Optimization Guide](../strategies/PERFORMANCE_OPTIMIZATION.md)
- **GitOps Workflows**: [Git Strategy Protocols](../strategies/git-strategy-protocols.md)

---

**Last Updated**: 2025-01-17  
**Next Review**: 2025-07-17  
**Compliance**: P55/P56 ✅ | Writing Standards ✅ | Cross-Reference Network ✅
