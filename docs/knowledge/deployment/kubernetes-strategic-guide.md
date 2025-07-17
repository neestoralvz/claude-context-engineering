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

```yaml
# namespace-structure.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: prod
    monitoring: enabled
    security-policy: strict
---
apiVersion: v1
kind: Namespace
metadata:
  name: staging
  labels:
    environment: staging
    monitoring: enabled
    security-policy: moderate
```

### **Deployment Patterns (2024 Standards)**

**Rolling Update Strategy**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        version: v1.2.3
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: app
        image: registry.example.com/web-app:v1.2.3
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Service and Ingress Configuration**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  namespace: production
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - app.example.com
    secretName: web-app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app-service
            port:
              number: 80
```

## 🔒 Security Hardening (Mandatory)

### **Pod Security Standards (2024)**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: secure-apps
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### **Network Policies (Zero Trust)**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-default
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-app
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

### **RBAC Configuration**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: developer-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding
  namespace: production
subjects:
- kind: User
  name: developer@company.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer-role
  apiGroup: rbac.authorization.k8s.io
```

## 📈 Scaling and Performance

### **Horizontal Pod Autoscaler (HPA)**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### **Vertical Pod Autoscaler (VPA)**

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-app-vpa
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: app
      maxAllowed:
        cpu: 1
        memory: 2Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## 🔄 GitOps and CI/CD Integration

### **ArgoCD Application (Recommended)**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/company/k8s-manifests
    targetRevision: main
    path: applications/web-app
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

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

```yaml
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web-app-metrics
  namespace: production
spec:
  selector:
    matchLabels:
      app: web-app
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
    scrapeTimeout: 10s
```

### **Essential Health Checks**

```yaml
# Application health endpoints
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30
```

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

```yaml
# Problem: OOMKilled containers
# Solution: Proper resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"  # 2x requests
    cpu: "500m"      # 2x requests
```

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

```yaml
# Don't: Run as root
securityContext:
  runAsUser: 0  # BAD

# Do: Use non-root user
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
```

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