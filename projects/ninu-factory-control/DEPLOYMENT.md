# Production Deployment Guide - Ninu.mx Factory Control System

## Overview

This document provides comprehensive instructions for deploying the Ninu.mx Factory Control System to production with PostgreSQL database integration, WebSocket real-time updates, and Docker containerization.

## Architecture Overview

The system consists of the following components:

### Core Services
- **Frontend Application** (Next.js 14 + TypeScript)
- **WebSocket Server** (Real-time inventory and factory monitoring)
- **PostgreSQL Database** (Inventory and factory data)
- **Redis Cache** (Session storage and caching)

### Infrastructure Services
- **HAProxy Load Balancer** (SSL termination and load balancing)
- **Prometheus** (Metrics collection)
- **Grafana** (Monitoring dashboards)
- **Backup Service** (Automated database backups)

### Monitoring & Exporters
- **Node Exporter** (System metrics)
- **PostgreSQL Exporter** (Database metrics)
- **Redis Exporter** (Cache metrics)

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ or CentOS 7+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB free space
- **Network**: Stable internet connection

### Software Dependencies
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **curl**: For health checks
- **Git**: For source code management

### Port Requirements
The following ports must be available:
- `80` - HTTP (redirects to HTTPS)
- `443` - HTTPS (main application)
- `3000` - Frontend application
- `3001` - WebSocket server
- `5432` - PostgreSQL database
- `6379` - Redis cache
- `8080` - HAProxy statistics
- `9090` - Prometheus metrics
- `3030` - Grafana dashboards
- `9100` - Node Exporter
- `9187` - PostgreSQL Exporter
- `9121` - Redis Exporter

## Pre-deployment Setup

### 1. System Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create docker user group (optional)
sudo usermod -aG docker $USER
```

### 2. Directory Structure

```bash
# Create project directory
mkdir -p /opt/ninu-factory-control
cd /opt/ninu-factory-control

# Create required directories
mkdir -p data/{postgres,redis,prometheus,grafana}
mkdir -p logs
mkdir -p backups
mkdir -p monitoring/grafana/{provisioning,dashboards}
mkdir -p haproxy/ssl
```

### 3. SSL Certificate Setup

```bash
# For production, use Let's Encrypt or your SSL provider
# Example with self-signed certificate for testing:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout haproxy/ssl/ninu.key \
  -out haproxy/ssl/ninu.crt \
  -subj "/C=MX/ST=Veracruz/L=Xalapa/O=Ninu/CN=factory.ninu.mx"

# Combine cert and key for HAProxy
cat haproxy/ssl/ninu.crt haproxy/ssl/ninu.key > haproxy/ssl/ninu.pem
```

## Deployment Process

### Step 1: Environment Configuration

Copy and modify the environment file:

```bash
# Copy environment template
cp .env.production .env.local

# Edit environment variables
vim .env.local
```

**Important Environment Variables:**
```bash
# Database Configuration
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_jwt_secret_key

# Monitoring Configuration
GRAFANA_PASSWORD=your_grafana_password

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/ninu.crt
SSL_KEY_PATH=/etc/ssl/private/ninu.key
```

### Step 2: Database Initialization

The database schema will be automatically initialized on first run. However, you can also run it manually:

```bash
# Initialize database schema
docker-compose -f docker-compose.production.yml up -d ninu-database
docker-compose -f docker-compose.production.yml exec ninu-database psql -U ninu_user -d ninu_factory_control -f /docker-entrypoint-initdb.d/01-schema.sql
```

### Step 3: Production Deployment

Use the automated deployment script:

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run full deployment
./scripts/deploy.sh

# Or run specific deployment steps
./scripts/deploy.sh backup    # Create backup only
./scripts/deploy.sh health    # Health check only
./scripts/deploy.sh status    # Check service status
```

### Step 4: Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Build custom images
docker-compose -f docker-compose.production.yml build --no-cache

# Start services in order
docker-compose -f docker-compose.production.yml up -d ninu-database ninu-redis
sleep 30  # Wait for database to be ready

docker-compose -f docker-compose.production.yml up -d ninu-frontend ninu-websocket
sleep 30  # Wait for applications to be ready

docker-compose -f docker-compose.production.yml up -d ninu-haproxy
docker-compose -f docker-compose.production.yml up -d ninu-prometheus ninu-grafana
docker-compose -f docker-compose.production.yml up -d ninu-node-exporter ninu-postgres-exporter ninu-redis-exporter
docker-compose -f docker-compose.production.yml up -d ninu-backup
```

## Post-deployment Verification

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.production.yml ps

# Check application health
curl -f http://localhost:3000/api/health
curl -f http://localhost:3001/health

# Check monitoring services
curl -f http://localhost:9090/-/healthy  # Prometheus
curl -f http://localhost:3030/api/health  # Grafana
```

### Application Access

Once deployed, access the system at:

- **Main Application**: https://localhost (or your domain)
- **WebSocket Connection**: ws://localhost:3001
- **Grafana Dashboards**: http://localhost:3030
- **Prometheus Metrics**: http://localhost:9090
- **HAProxy Stats**: http://localhost:8080/stats

### Default Credentials

- **Grafana**: admin / ninu_admin_2024
- **HAProxy Stats**: admin / ninu_admin_2024

## Monitoring and Maintenance

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f ninu-frontend

# View WebSocket logs
docker-compose -f docker-compose.production.yml logs -f ninu-websocket

# View database logs
docker-compose -f docker-compose.production.yml logs -f ninu-database

# View all logs
docker-compose -f docker-compose.production.yml logs -f
```

### Database Backups

Automated backups run daily at 2 AM. Manual backup:

```bash
# Create manual backup
./scripts/deploy.sh backup

# Restore from backup (if needed)
docker-compose -f docker-compose.production.yml exec ninu-database psql -U ninu_user -d ninu_factory_control < backups/backup-YYYYMMDD-HHMMSS/database.sql
```

### Performance Monitoring

Access monitoring dashboards:

1. **Grafana**: http://localhost:3030
   - System metrics
   - Database performance
   - Application metrics
   - Factory-specific dashboards

2. **Prometheus**: http://localhost:9090
   - Raw metrics
   - Query interface
   - Alerting rules

### Resource Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
docker-compose -f docker-compose.production.yml top
```

## Troubleshooting

### Common Issues

**Service Won't Start:**
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs service-name

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.production.yml restart service-name
```

**Database Connection Issues:**
```bash
# Check database status
docker-compose -f docker-compose.production.yml exec ninu-database pg_isready -U ninu_user

# Check database logs
docker-compose -f docker-compose.production.yml logs ninu-database

# Connect to database manually
docker-compose -f docker-compose.production.yml exec ninu-database psql -U ninu_user -d ninu_factory_control
```

**WebSocket Connection Issues:**
```bash
# Check WebSocket server status
curl -f http://localhost:3001/health

# Check WebSocket logs
docker-compose -f docker-compose.production.yml logs ninu-websocket

# Test WebSocket connection
wscat -c ws://localhost:3001
```

**Load Balancer Issues:**
```bash
# Check HAProxy stats
curl -f http://localhost:8080/stats

# Check HAProxy configuration
docker-compose -f docker-compose.production.yml exec ninu-haproxy cat /usr/local/etc/haproxy/haproxy.cfg

# Reload HAProxy configuration
docker-compose -f docker-compose.production.yml exec ninu-haproxy kill -USR2 1
```

### Emergency Procedures

**Complete System Restart:**
```bash
# Stop all services
docker-compose -f docker-compose.production.yml down

# Wait a moment
sleep 10

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

**Rollback Deployment:**
```bash
# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Restore from backup
# (Restore database from backup if needed)

# Start previous version
# (Use previous Docker images or restore from backup)
```

## Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable SSL/TLS for all services
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable automated backups
- [ ] Configure monitoring alerts
- [ ] Set up access controls
- [ ] Regular security updates

### Network Security

```bash
# Configure UFW firewall (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

# Block unnecessary ports
sudo ufw deny 5432/tcp  # PostgreSQL (only allow from localhost)
sudo ufw deny 6379/tcp  # Redis (only allow from localhost)
```

### Data Security

- All database connections use authentication
- Redis is configured with memory limits
- Sensitive data is encrypted at rest
- Regular security updates applied
- Access logs are monitored

## Scaling Considerations

### Horizontal Scaling

To scale the application:

1. **Add more frontend instances:**
   ```bash
   # Uncomment additional servers in docker-compose.production.yml
   # Update HAProxy configuration
   ```

2. **Database clustering:**
   ```bash
   # Set up PostgreSQL replication
   # Configure read replicas
   ```

3. **Redis clustering:**
   ```bash
   # Enable Redis cluster mode
   # Configure multiple Redis nodes
   ```

### Vertical Scaling

Adjust resource limits in `docker-compose.production.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
    reservations:
      memory: 1G
      cpus: '0.5'
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check disk space
- Review error logs

### Weekly
- Review performance metrics
- Check backup integrity
- Update security patches

### Monthly
- Full system backup
- Performance optimization
- Security audit

### Quarterly
- Disaster recovery testing
- Infrastructure review
- Capacity planning

## Support and Documentation

### Additional Resources

- **Application Documentation**: `/docs/README.md`
- **API Documentation**: Available at `/api/docs` when deployed
- **Database Schema**: `/database/schema.sql`
- **Monitoring Dashboards**: Pre-configured in Grafana

### Support Contacts

- **Technical Support**: DevOps team
- **Database Issues**: Database administrator
- **Security Issues**: Security team
- **Business Issues**: Ninu.mx management

---

**Last Updated**: 2024-07-18
**Version**: 1.0.0
**Environment**: Production