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

- **Apiversion**: v1
- **Kind**: Namespace
**Metadata**:
- **Name**: production
**Labels**:
- **Environment**: prod
- **Monitoring**: enabled
- **Security-Policy**: strict
- --
- **Apiversion**: v1
- **Kind**: Namespace
**Metadata**:
- **Name**: staging
**Labels**:
- **Environment**: staging
- **Monitoring**: enabled
- **Security-Policy**: moderate

### **Deployment Patterns (2024 Standards)**

**Rolling Update Strategy**:
- **Apiversion**: apps/v1
- **Kind**: Deployment
**Metadata**:
  - **Name**: web-app
  - **Namespace**: production
**Spec**:
  - **Replicas**: 3
  **Strategy**:
    - **Type**: RollingUpdate
    **Rollingupdate**:
      - **Maxsurge**: 1
      - **Maxunavailable**: 0
  **Selector**:
    **Matchlabels**:
      - **App**: web-app
  **Template**:
    **Metadata**:
      **Labels**:
        - **App**: web-app
        - **Version**: v1.2.3
    **Spec**:
      **Securitycontext**:
        - **Runasnonroot**: True
        - **Runasuser**: 1001
        - **Fsgroup**: 1001
      **Containers**:
      - {'name': 'app', 'image': 'registry.example.com/web-app:v1.2.3', 'ports': [{'containerPort': 8080}], 'env': [{'name': 'DATABASE_URL', 'valueFrom': {'secretKeyRef': {'name': 'db-credentials', 'key': 'url'}}}], 'resources': {'requests': {'memory': '256Mi', 'cpu': '250m'}, 'limits': {'memory': '512Mi', 'cpu': '500m'}}, 'livenessProbe': {'httpGet': {'path': '/health', 'port': 8080}, 'initialDelaySeconds': 30, 'periodSeconds': 10}, 'readinessProbe': {'httpGet': {'path': '/ready', 'port': 8080}, 'initialDelaySeconds': 5, 'periodSeconds': 5}}

**Service and Ingress Configuration**:
- **Apiversion**: v1
- **Kind**: Service
**Metadata**:
- **Name**: web-app-service
- **Namespace**: production
**Spec**:
**Selector**:
- **App**: web-app
**Ports**:
- port: 80
- **Targetport**: 8080
- **Type**: ClusterIP
- --
- **Apiversion**: networking.k8s.io/v1
- **Kind**: Ingress
**Metadata**:
- **Name**: web-app-ingress
- **Namespace**: production
**Annotations**:
- **Kubernetes.Io/Ingress.Class**: nginx
- **Cert-Manager.Io/Cluster-Issuer**: letsencrypt-prod
- **Nginx.Ingress.Kubernetes.Io/Rate-Limit**: 100
**Spec**:
**Tls**:
- hosts:
- app.example.com
- **Secretname**: web-app-tls
**Rules**:
- host: app.example.com
**Http**:
**Paths**:
- path: /
- **Pathtype**: Prefix
**Backend**:
**Service**:
- **Name**: web-app-service
**Port**:
- **Number**: 80

## 🔒 Security Hardening (Mandatory)

### **Pod Security Standards (2024)**

- **Apiversion**: v1
- **Kind**: Namespace
**Metadata**:
  - **Name**: secure-apps
  **Labels**:
    - **Pod-Security.Kubernetes.Io/Enforce**: restricted
    - **Pod-Security.Kubernetes.Io/Audit**: restricted
    - **Pod-Security.Kubernetes.Io/Warn**: restricted

### **Network Policies (Zero Trust)**

- **Apiversion**: networking.k8s.io/v1
- **Kind**: NetworkPolicy
**Metadata**:
- **Name**: deny-all-default
- **Namespace**: production
**Spec**:
- **Podselector**: {}
**Policytypes**:
- Ingress
- Egress
- --
- **Apiversion**: networking.k8s.io/v1
- **Kind**: NetworkPolicy
**Metadata**:
- **Name**: allow-web-app
- **Namespace**: production
**Spec**:
**Podselector**:
**Matchlabels**:
- **App**: web-app
**Policytypes**:
- Ingress
- Egress
**Ingress**:
- from:
- podSelector:
**Matchlabels**:
- **App**: nginx-ingress
**Ports**:
- protocol: TCP
- **Port**: 8080
**Egress**:
- to:
- podSelector:
**Matchlabels**:
- **App**: database
**Ports**:
- protocol: TCP
- **Port**: 5432

### **RBAC Configuration**

- **Apiversion**: rbac.authorization.k8s.io/v1
- **Kind**: Role
**Metadata**:
- **Namespace**: production
- **Name**: developer-role
**Rules**:
- apiGroups: [""]
- **Resources**: ["pods", "services", "configmaps"]
- **Verbs**: ["get", "list", "watch"]
- apiGroups: ["apps"]
- **Resources**: ["deployments", "replicasets"]
- **Verbs**: ["get", "list", "watch", "update", "patch"]
- --
- **Apiversion**: rbac.authorization.k8s.io/v1
- **Kind**: RoleBinding
**Metadata**:
- **Name**: developer-binding
- **Namespace**: production
**Subjects**:
- kind: User
- **Name**: developer@company.com
- **Apigroup**: rbac.authorization.k8s.io
**Roleref**:
- **Kind**: Role
- **Name**: developer-role
- **Apigroup**: rbac.authorization.k8s.io

## 📈 Scaling and Performance

### **Horizontal Pod Autoscaler (HPA)**

- **Apiversion**: autoscaling/v2
- **Kind**: HorizontalPodAutoscaler
**Metadata**:
  - **Name**: web-app-hpa
  - **Namespace**: production
**Spec**:
  **Scaletargetref**:
    - **Apiversion**: apps/v1
    - **Kind**: Deployment
    - **Name**: web-app
  - **Minreplicas**: 3
  - **Maxreplicas**: 50
  **Metrics**:
  - {'type': 'Resource', 'resource': {'name': 'cpu', 'target': {'type': 'Utilization', 'averageUtilization': 70}}}
  - {'type': 'Resource', 'resource': {'name': 'memory', 'target': {'type': 'Utilization', 'averageUtilization': 80}}}
  **Behavior**:
    **Scaleup**:
      - **Stabilizationwindowseconds**: 60
      **Policies**:
      - {'type': 'Percent', 'value': 100, 'periodSeconds': 15}
    **Scaledown**:
      - **Stabilizationwindowseconds**: 300
      **Policies**:
      - {'type': 'Percent', 'value': 10, 'periodSeconds': 60}

### **Vertical Pod Autoscaler (VPA)**

- **Apiversion**: autoscaling.k8s.io/v1
- **Kind**: VerticalPodAutoscaler
**Metadata**:
  - **Name**: web-app-vpa
  - **Namespace**: production
**Spec**:
  **Targetref**:
    - **Apiversion**: apps/v1
    - **Kind**: Deployment
    - **Name**: web-app
  **Updatepolicy**:
    - **Updatemode**: Auto
  **Resourcepolicy**:
    **Containerpolicies**:
    - {'containerName': 'app', 'maxAllowed': {'cpu': 1, 'memory': '2Gi'}, 'minAllowed': {'cpu': '100m', 'memory': '128Mi'}}

## 🔄 GitOps and CI/CD Integration

### **ArgoCD Application (Recommended)**

- **Apiversion**: argoproj.io/v1alpha1
- **Kind**: Application
**Metadata**:
  - **Name**: web-app
  - **Namespace**: argocd
**Spec**:
  - **Project**: default
  **Source**:
    - **Repourl**: https://github.com/company/k8s-manifests
    - **Targetrevision**: main
    - **Path**: applications/web-app
  **Destination**:
    - **Server**: https://kubernetes.default.svc
    - **Namespace**: production
  **Syncpolicy**:
    **Automated**:
      - **Prune**: True
      - **Selfheal**: True
    **Syncoptions**:
    - CreateNamespace=true
    **Retry**:
      - **Limit**: 3
      **Backoff**:
        - **Duration**: 5s
        - **Factor**: 2
        - **Maxduration**: 3m

### **GitHub Actions Kubernetes Deployment**

```yaml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]
    paths: ['k8s/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        method: kubeconfig
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy to cluster
      run: |
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/secrets.yaml
        kubectl apply -f k8s/configmap.yaml
        kubectl apply -f k8s/deployment.yaml
        kubectl apply -f k8s/service.yaml
        kubectl apply -f k8s/ingress.yaml
        
        # Wait for rollout
        kubectl rollout status deployment/web-app -n production --timeout=300s
    
    - name: Verify deployment
      run: |
        kubectl get pods -n production -l app=web-app
        kubectl get services -n production
```

## 📊 Monitoring and Observability

### **Prometheus Monitoring Stack**

- **Apiversion**: monitoring.coreos.com/v1
- **Kind**: ServiceMonitor
**Metadata**:
  - **Name**: web-app-metrics
  - **Namespace**: production
**Spec**:
  **Selector**:
    **Matchlabels**:
      - **App**: web-app
  **Endpoints**:
  - {'port': 'metrics', 'path': '/metrics', 'interval': '30s', 'scrapeTimeout': '10s'}

### **Essential Health Checks**

**Livenessprobe**:
  **Httpget**:
    - **Path**: /health/live
    - **Port**: 8080
  - **Initialdelayseconds**: 30
  - **Periodseconds**: 10
  - **Timeoutseconds**: 5
  - **Failurethreshold**: 3
**Readinessprobe**:
  **Httpget**:
    - **Path**: /health/ready
    - **Port**: 8080
  - **Initialdelayseconds**: 5
  - **Periodseconds**: 5
  - **Timeoutseconds**: 3
  - **Failurethreshold**: 3
**Startupprobe**:
  **Httpget**:
    - **Path**: /health/startup
    - **Port**: 8080
  - **Initialdelayseconds**: 10
  - **Periodseconds**: 10
  - **Timeoutseconds**: 5
  - **Failurethreshold**: 30

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

**Resources**:
  **Requests**:
    - **Memory**: 256Mi
    - **Cpu**: 250m
  **Limits**:
    - **Memory**: 512Mi
    - **Cpu**: 500m

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

**Securitycontext**:
  - **Runasnonroot**: True
  - **Runasuser**: 1001
  - **Readonlyrootfilesystem**: True
  - **Allowprivilegeescalation**: False
  **Capabilities**:
    **Drop**:
    - ALL

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