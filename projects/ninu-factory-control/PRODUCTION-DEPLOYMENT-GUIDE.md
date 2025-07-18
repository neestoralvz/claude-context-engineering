# Production Deployment Guide - Ninu Factory Control System

## 🚀 Enterprise-Ready Production Deployment

This guide provides comprehensive instructions for deploying the Ninu Factory Control System in a production environment with enterprise-grade security, monitoring, and high availability.

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Docker Engine 24.0+ installed
- [ ] Docker Compose v2.24.0+ installed
- [ ] Minimum 8GB RAM, 4 CPU cores
- [ ] 100GB+ available disk space
- [ ] SSL certificates configured
- [ ] Domain name configured (ninu-factory.com)
- [ ] Firewall ports 80, 443, 8404 open

### Security Prerequisites
- [ ] Environment variables configured
- [ ] Database passwords generated
- [ ] JWT secrets configured
- [ ] SSL/TLS certificates installed
- [ ] Backup encryption keys generated
- [ ] Security scanning completed

### Monitoring Setup
- [ ] Slack webhook configured
- [ ] Email alerts configured
- [ ] PagerDuty integration (optional)
- [ ] AWS S3 backup bucket created
- [ ] Grafana admin password set

## 🔧 Initial Setup

### 1. Environment Configuration

```bash
# Copy and configure environment variables
cp .env.production .env

# Edit the environment file with production values
nano .env

# Required changes:
# - POSTGRES_PASSWORD: Strong password
# - JWT_SECRET: 32+ character secret
# - GRAFANA_PASSWORD: Admin password
# - All CHANGE_ME_* values
```

### 2. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p ssl

# Copy your SSL certificates
cp your-domain.crt ssl/server.crt
cp your-domain.key ssl/server.key
cp ca-bundle.crt ssl/ca.crt

# Set proper permissions
chmod 600 ssl/server.key
chmod 644 ssl/server.crt ssl/ca.crt
```

### 3. Database Initialization

```bash
# Create data directories
mkdir -p data/{postgres,redis,prometheus,grafana,elasticsearch}

# Set proper ownership
sudo chown -R 999:999 data/postgres
sudo chown -R 999:999 data/redis
sudo chown -R 65534:65534 data/prometheus
sudo chown -R 472:472 data/grafana
```

## 🚢 Production Deployment

### 1. Build and Deploy

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start the production stack
docker-compose -f docker-compose.prod.yml up -d

# Verify all services are running
docker-compose -f docker-compose.prod.yml ps
```

### 2. Health Verification

```bash
# Check application health
curl -f https://your-domain.com/api/health

# Check load balancer stats
curl -f http://your-domain.com:8404/stats

# Check Grafana
curl -f http://your-domain.com:3001/api/health

# Check Prometheus
curl -f http://your-domain.com:9090/-/healthy
```

### 3. Database Setup Verification

```bash
# Connect to database
docker exec -it ninu-database psql -U ninu_user -d ninu_factory

# Verify tables exist
\dt

# Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

## 📊 Monitoring Setup

### 1. Grafana Configuration

1. Access Grafana at `http://your-domain.com:3001`
2. Login with admin credentials from `.env`
3. Import production dashboards from `monitoring/grafana/dashboards/`
4. Configure alert notification channels
5. Set up user access and permissions

### 2. Prometheus Alerts

```bash
# Verify alert rules are loaded
curl http://your-domain.com:9090/api/v1/rules

# Check AlertManager status
curl http://your-domain.com:9093/api/v1/status
```

### 3. Log Monitoring

```bash
# Access Kibana at http://your-domain.com:5601
# Configure index patterns for application logs
# Set up log analysis dashboards
```

## 🔐 Security Configuration

### 1. Firewall Setup

```bash
# Allow necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8404/tcp  # HAProxy stats
sudo ufw allow 22/tcp    # SSH

# Block direct access to internal services
sudo ufw deny 3000/tcp   # Frontend
sudo ufw deny 5432/tcp   # PostgreSQL
sudo ufw deny 6379/tcp   # Redis
sudo ufw deny 9090/tcp   # Prometheus
```

### 2. Container Security

```bash
# Run security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ninu-factory-control:latest

# Check for vulnerabilities
docker run --rm -v $(pwd):/app \
  clair-scanner:latest --ip $(docker-machine ip) ninu-factory-control:latest
```

## 🔄 Backup System

### 1. Automated Backups

```bash
# Set up cron jobs for automated backups
sudo crontab -e

# Add these entries:
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup/backup-system.sh backup daily

# Weekly backup on Sundays at 3 AM
0 3 * * 0 /path/to/scripts/backup/backup-system.sh backup weekly

# Monthly backup on 1st of month at 4 AM
0 4 1 * * /path/to/scripts/backup/backup-system.sh backup monthly
```

### 2. Test Backup/Restore

```bash
# Test backup creation
./scripts/backup/backup-system.sh backup daily

# Test restore process (use test database)
./scripts/backup/backup-system.sh restore /path/to/backup/file
```

## 🔧 Auto-Recovery System

### 1. Health Monitoring

```bash
# Start health monitor as systemd service
sudo cp scripts/health/ninu-health-monitor.service /etc/systemd/system/
sudo systemctl enable ninu-health-monitor
sudo systemctl start ninu-health-monitor

# Check status
sudo systemctl status ninu-health-monitor
```

### 2. Configure Alerts

```bash
# Edit alert configuration
nano monitoring/alertmanager/alertmanager.yml

# Update notification endpoints:
# - Slack webhook URL
# - Email recipients
# - PagerDuty integration key
```

## 📈 Performance Optimization

### 1. Resource Limits

```yaml
# Adjust in docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

### 2. Database Tuning

```bash
# Optimize PostgreSQL settings
docker exec -it ninu-database psql -U ninu_user -d ninu_factory

# Run performance analysis
EXPLAIN ANALYZE SELECT * FROM production_batches WHERE status = 'in_progress';
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Setup

```bash
# Configure repository secrets:
# - DOCKER_REGISTRY_TOKEN
# - PRODUCTION_SERVER_HOST
# - PRODUCTION_SSH_KEY
# - SLACK_WEBHOOK_URL
```

### 2. Deployment Pipeline

The automated pipeline includes:
- ✅ Code quality checks
- ✅ Security scanning
- ✅ Comprehensive testing
- ✅ Docker image building
- ✅ Staging deployment
- ✅ Production deployment
- ✅ Automatic rollback on failure

## 🆘 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose -f docker-compose.prod.yml restart service-name
```

#### Database Connection Issues
```bash
# Check database status
docker exec ninu-database pg_isready -U ninu_user

# Check connection settings
echo $DATABASE_URL

# Reset database password
docker exec -it ninu-database psql -U postgres -c "ALTER USER ninu_user PASSWORD 'new_password';"
```

#### High Memory Usage
```bash
# Check memory usage by service
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Clean up unused resources
docker system prune -f
docker volume prune -f
```

### Recovery Procedures

#### Complete System Recovery
```bash
# 1. Stop all services
docker-compose -f docker-compose.prod.yml down

# 2. Restore from backup
./scripts/backup/backup-system.sh restore /path/to/latest/backup

# 3. Restart services
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify health
curl -f https://your-domain.com/api/health
```

## 📞 Support Contacts

- **Technical Issues**: tech-support@ninu-factory.com
- **Security Incidents**: security@ninu-factory.com
- **Production Emergencies**: emergency@ninu-factory.com
- **24/7 Hotline**: +52-xxx-xxx-xxxx

## 📚 Additional Resources

- [Security Implementation Guide](docs/SECURITY_IMPLEMENTATION.md)
- [API Documentation](docs/api/README.md)
- [Performance Tuning Guide](docs/deployment/performance-tuning.md)
- [Disaster Recovery Procedures](docs/operations/disaster-recovery.md)

---

## ✅ Production Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database initialized
- [ ] All services running
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Security scanning completed
- [ ] Performance testing done
- [ ] Documentation updated
- [ ] Team training completed

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: _______________  
**Sign-off**: _______________