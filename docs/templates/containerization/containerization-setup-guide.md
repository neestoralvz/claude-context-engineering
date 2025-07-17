# Containerization Setup Guide

**Complete implementation guide for Context Engineering containerization standards using reusable templates and automated setup.**

## 🎯 Quick Start

### **Essential Steps (≤5 minutes setup)**

1. **Copy Templates**:
   ```bash
   cp docs/templates/containerization/Dockerfile.template ./Dockerfile
   cp docs/templates/containerization/docker-compose.template.yml ./docker-compose.yml
   cp docs/templates/containerization/.dockerignore.template ./.dockerignore
   ```

2. **Configure Variables** (see [Template Variables](#template-variables))
3. **Run Setup Script**: `./containerize-project.sh`
4. **Build and Deploy**: `docker-compose up --build -d`

## 📋 Template Variables

### **Required Variables** (Must Replace)

#### **Project Configuration**
```bash
# Core project identifiers
{{PROJECT_NAME}}="my-project"           # Lowercase, hyphens only
{{SERVICE_NAME}}="app"                  # Main service name
{{CONTAINER_NAME}}="my-project-app"     # Container identifier
{{NETWORK_NAME}}="my_project_network"   # Docker network name

# Application details
{{APP_NAME}}="My Application"           # Human-readable name
{{APP_DESCRIPTION}}="Application description"
{{MAINTAINER_EMAIL}}="dev@example.com"
{{LICENSE}}="MIT"                       # Or your license
{{VCS_URL}}="https://github.com/user/repo"
```

#### **Port Configuration**
```bash
# Port variables
{{DEFAULT_PORT}}="8080"                 # Application port
{{PORT_ENV_VAR}}="APP_PORT"            # Environment variable name
{{INTERNAL_PORT_ENV_VAR}}="APP_INTERNAL_PORT"
```

#### **Application Files**
```bash
{{MAIN_FILE}}="main.py"                # Entry point file (main.py, app.py, etc.)
```

### **Optional Variables** (Defaults Available)

#### **Database Configuration**
```bash
{{DEFAULT_DATABASE_URL}}="sqlite:///./data/app.db"
{{DEFAULT_DB_NAME}}="myapp"
{{DEFAULT_DB_USER}}="appuser"
{{DEFAULT_DB_PASSWORD}}="changeme"
```

#### **Resource Limits**
```bash
# Application resources
{{MEMORY_LIMIT}}="512m"
{{CPU_LIMIT}}="1.0"
{{MEMORY_RESERVATION}}="256m"
{{CPU_RESERVATION}}="0.5"

# Database resources
{{DB_MEMORY_LIMIT}}="256m"
{{DB_CPU_LIMIT}}="0.5"

# Redis resources
{{REDIS_MEMORY_LIMIT}}="128m"
{{REDIS_CPU_LIMIT}}="0.25"
```

#### **Network Configuration**
```bash
{{SUBNET_RANGE}}="172.20.0.0/16"
{{DOMAIN_NAME}}="app.localhost"
```

## 🛠️ Automated Setup

### **Containerization Script** (Recommended)

Create `containerize-project.sh`:
```bash
#!/bin/bash
# Automated containerization setup for Context Engineering projects

set -euo pipefail

# Configuration
PROJECT_NAME="${1:-$(basename $(pwd))}"
SERVICE_NAME="${2:-app}"
DEFAULT_PORT="${3:-8080}"
MAIN_FILE="${4:-main.py}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Setting up containerization for: $PROJECT_NAME${NC}"

# Check if templates exist
TEMPLATE_DIR="docs/templates/containerization"
if [[ ! -d "$TEMPLATE_DIR" ]]; then
    echo "❌ Template directory not found: $TEMPLATE_DIR"
    exit 1
fi

# Copy and configure Dockerfile
echo -e "${YELLOW}📋 Configuring Dockerfile...${NC}"
cp "$TEMPLATE_DIR/Dockerfile.template" ./Dockerfile

# Replace variables in Dockerfile
sed -i.bak "s/{{APP_NAME}}/$PROJECT_NAME/g" Dockerfile
sed -i.bak "s/{{DEFAULT_PORT}}/$DEFAULT_PORT/g" Dockerfile
sed -i.bak "s/{{MAIN_FILE}}/$MAIN_FILE/g" Dockerfile
rm Dockerfile.bak

# Copy and configure docker-compose.yml
echo -e "${YELLOW}📋 Configuring Docker Compose...${NC}"
cp "$TEMPLATE_DIR/docker-compose.template.yml" ./docker-compose.yml

# Replace variables in docker-compose.yml
sed -i.bak "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" docker-compose.yml
sed -i.bak "s/{{SERVICE_NAME}}/$SERVICE_NAME/g" docker-compose.yml
sed -i.bak "s/{{CONTAINER_NAME}}/$PROJECT_NAME-$SERVICE_NAME/g" docker-compose.yml
sed -i.bak "s/{{NETWORK_NAME}}/${PROJECT_NAME}_network/g" docker-compose.yml
sed -i.bak "s/{{DEFAULT_PORT}}/$DEFAULT_PORT/g" docker-compose.yml
sed -i.bak "s/{{PORT_ENV_VAR}}/${SERVICE_NAME^^}_PORT/g" docker-compose.yml
sed -i.bak "s/{{INTERNAL_PORT_ENV_VAR}}/${SERVICE_NAME^^}_INTERNAL_PORT/g" docker-compose.yml
rm docker-compose.yml.bak

# Copy .dockerignore
echo -e "${YELLOW}📋 Configuring .dockerignore...${NC}"
cp "$TEMPLATE_DIR/.dockerignore.template" ./.dockerignore

# Create necessary directories
mkdir -p config data logs

# Create example .env file
echo -e "${YELLOW}📋 Creating environment configuration...${NC}"
cat > .env.example << EOF
# $PROJECT_NAME Environment Configuration
${SERVICE_NAME^^}_PORT=$DEFAULT_PORT
${SERVICE_NAME^^}_INTERNAL_PORT=$DEFAULT_PORT
APP_ENV=development
LOG_LEVEL=info
EOF

# Create example config files
mkdir -p config
cat > config/redis.conf << EOF
# Redis configuration for $PROJECT_NAME
maxmemory 128mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

echo -e "${GREEN}✅ Containerization setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and customize Dockerfile, docker-compose.yml"
echo "2. Copy .env.example to .env and configure"
echo "3. Run: docker-compose up --build -d"
echo "4. Access application at: http://localhost:$DEFAULT_PORT"
```

### **Usage Examples**

```bash
# Basic setup with defaults
./containerize-project.sh

# Custom configuration
./containerize-project.sh "my-dashboard" "web" "3000" "app.py"

# Interactive setup with validation
./containerize-project.sh --interactive
```

## 🔧 Manual Configuration

### **Step 1: Template Processing**

For each template file:
1. Copy template to project root
2. Replace variables using search/replace
3. Validate configuration

### **Step 2: Variable Replacement Methods**

#### **Using sed (Unix/Linux/macOS)**
```bash
# Replace single variable
sed -i 's/{{PROJECT_NAME}}/my-project/g' Dockerfile

# Replace multiple variables
sed -i -e 's/{{PROJECT_NAME}}/my-project/g' \
       -e 's/{{DEFAULT_PORT}}/8080/g' \
       -e 's/{{MAIN_FILE}}/main.py/g' Dockerfile
```

#### **Using PowerShell (Windows)**
```powershell
# Replace variables in file
(Get-Content Dockerfile) -replace '{{PROJECT_NAME}}', 'my-project' | Set-Content Dockerfile
```

#### **Using Python Script**
```python
#!/usr/bin/env python3
# Template processor for containerization setup

import os
import sys
from pathlib import Path

def process_template(template_path, output_path, variables):
    """Process template file with variable substitution"""
    with open(template_path, 'r') as f:
        content = f.read()
    
    for key, value in variables.items():
        content = content.replace(f'{{{{{key}}}}}', value)
    
    with open(output_path, 'w') as f:
        f.write(content)

# Configuration
variables = {
    'PROJECT_NAME': 'my-project',
    'SERVICE_NAME': 'app',
    'DEFAULT_PORT': '8080',
    'MAIN_FILE': 'main.py',
    # Add more variables as needed
}

# Process templates
process_template('docs/templates/containerization/Dockerfile.template', 'Dockerfile', variables)
process_template('docs/templates/containerization/docker-compose.template.yml', 'docker-compose.yml', variables)
```

### **Step 3: Environment Configuration**

Create `.env` file:
```bash
# Application Configuration
APP_PORT=8080
APP_INTERNAL_PORT=8080
APP_ENV=development

# Database Configuration
DB_NAME=myapp
DB_USER=appuser
DB_PASSWORD=secure_password

# Redis Configuration
REDIS_PORT=6379

# Resource Limits
MEMORY_LIMIT=512m
CPU_LIMIT=1.0
```

## 🚀 Deployment Patterns

### **Development Deployment**
```bash
# Start with development profile
docker-compose --profile development up --build

# With specific services
docker-compose up --build app database redis
```

### **Production Deployment**
```bash
# Production build with optimization
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With monitoring
docker-compose --profile monitoring up -d
```

### **Testing Deployment**
```bash
# Test environment with isolated network
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## 📊 Validation and Testing

### **Container Health Validation**
```bash
# Check container health
docker-compose ps

# Validate health endpoints
curl -f http://localhost:8080/api/health

# Monitor resource usage
docker stats
```

### **Security Validation**
```bash
# Scan for vulnerabilities
docker scout cves my-project:latest

# Check for security issues
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image my-project:latest
```

### **Performance Testing**
```bash
# Build time measurement
time docker-compose build

# Image size analysis
docker images my-project:latest

# Resource usage monitoring
docker stats --no-stream
```

## 🔗 Integration Points

### **CI/CD Integration**
- GitHub Actions workflow templates
- GitLab CI/CD pipeline configurations
- Jenkins pipeline scripts
- Azure DevOps integration

### **Orchestration Integration**
- Kubernetes manifests generation
- Docker Swarm configurations
- Nomad job specifications
- Cloud platform deployments

### **Monitoring Integration**
- Prometheus metrics configuration
- Grafana dashboard templates
- Logging aggregation setup
- Health check endpoints

## 📖 Troubleshooting

### **Common Issues**

**Port Conflicts**:
```bash
# Check port usage
lsof -i :8080

# Use alternative port
export APP_PORT=8081
docker-compose up
```

**Build Failures**:
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose build --no-cache
```

**Permission Issues**:
```bash
# Fix file permissions
chmod +x containerize-project.sh

# Fix directory ownership
sudo chown -R $USER:$USER .
```

---

**Last Updated**: 2025-01-17  
**Next Review**: 2025-07-17  
**Compliance**: P55/P56 ✅ | Writing Standards ✅ | Cross-Reference Network ✅