# Deployment Guide - Ninu Factory Control System

## Visión General

Esta guía cubre todos los aspectos del despliegue del sistema de control de fábrica Ninu.mx, desde desarrollo local hasta producción, incluyendo containerización con Docker, CI/CD, monitoreo y mantenimiento.

## 🏗️ Arquitectura de Despliegue

### Ambientes

**🔧 Desarrollo Local**
- Next.js dev server (puerto 3000)
- PostgreSQL local (puerto 5432)
- Redis local (puerto 6379)
- Hot reload y debugging habilitado

**🧪 Testing/Staging**
- Docker Compose con servicios completos
- Base de datos de pruebas con datos sintéticos
- WebSocket testing habilitado
- Métricas de performance activadas

**🚀 Producción**
- Kubernetes cluster o Docker Swarm
- PostgreSQL con alta disponibilidad
- Redis cluster para cache distribuido
- Load balancer + SSL/TLS
- Monitoreo completo y logging

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- WebSocket client

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL 15+
- Redis 7+
- WebSocket.io

**Infraestructura:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Certbot (SSL)
- Prometheus + Grafana (monitoreo)

## 🐳 Containerización Docker

### Estructura de Contenedores

```yaml
# docker-compose.yml
version: '3.8'
services:
  # Frontend Next.js
  frontend:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend

  # Backend API
  backend:
    build:
      context: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ninu_factory
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ninu_factory
      - POSTGRES_USER=ninu_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  # Cache Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # Reverse Proxy Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Dockerfile Multi-Stage

```dockerfile
# Dockerfile para Frontend Next.js
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## 🚀 Scripts de Despliegue

### Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Desarrollo local
npm run docker:dev         # Docker desarrollo
npm run docker:dev:down    # Parar Docker desarrollo

# Producción
npm run docker:prod        # Docker producción
npm run docker:prod:down   # Parar Docker producción
npm run docker:build       # Build imagen de producción
npm run docker:run         # Correr imagen built

# Testing
npm run test              # Tests unitarios
npm run test:integration  # Tests de integración
npm run test:e2e         # Tests end-to-end
```

### Script de Inicialización

```bash
#!/bin/bash
# scripts/init-production.sh

set -e

echo "🚀 Inicializando Ninu Factory Control System..."

# Verificar dependencias
command -v docker >/dev/null 2>&1 || { echo "Docker requerido" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose requerido" >&2; exit 1; }

# Variables de entorno
if [ ! -f .env.production ]; then
    echo "⚠️  Archivo .env.production no encontrado"
    exit 1
fi

# Backup de base de datos existente
if [ "$1" = "--backup" ]; then
    echo "📦 Creando backup de base de datos..."
    docker-compose exec postgres pg_dump -U ninu_user ninu_factory > backup_$(date +%Y%m%d_%H%M%S).sql
fi

# Build y deploy
echo "🔨 Building containers..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Verificar salud de servicios
echo "🔍 Verificando servicios..."
sleep 30

curl -f http://localhost:3000/health || { echo "Frontend health check failed" >&2; exit 1; }
curl -f http://localhost:3001/api/health || { echo "Backend health check failed" >&2; exit 1; }

echo "✅ Deployment completado exitosamente!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
```

## 🗄️ Base de Datos

### Migración y Seed

```sql
-- database/migrations/001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de materiales
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    current_stock DECIMAL(12,3) DEFAULT 0,
    minimum_stock DECIMAL(12,3) DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_stock ON materials(current_stock);
```

### Script de Datos Iniciales

```bash
#!/bin/bash
# scripts/seed-database.sh

echo "🌱 Seeding database with initial data..."

# Usuarios iniciales
psql $DATABASE_URL << EOF
INSERT INTO users (email, name, role, department) VALUES
('admin@ninu.mx', 'Administrador Sistema', 'admin', 'IT'),
('supervisor@ninu.mx', 'Supervisor Producción', 'supervisor', 'Production'),
('operator@ninu.mx', 'Operador Planta', 'operator', 'Production'),
('quality@ninu.mx', 'Control Calidad', 'quality', 'Quality');
EOF

# Materiales Ninu.mx
psql $DATABASE_URL << EOF
INSERT INTO materials (code, name, category, unit_of_measure, minimum_stock, unit_cost) VALUES
('MAT-001', 'Tensioactivos Biodegradables', 'surfactants', 'kg', 100, 45.50),
('MAT-002', 'Fragrancia Cítrica Natural', 'fragrances', 'kg', 50, 120.00),
('MAT-003', 'Conservador Parabenos Free', 'preservatives', 'kg', 25, 85.00),
('MAT-004', 'Colorante Azul Natural', 'colorants', 'kg', 10, 95.00);
EOF

echo "✅ Database seeded successfully!"
```

## 🔧 Configuración de Nginx

```nginx
# nginx/nginx.conf
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:3001;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

server {
    listen 80;
    server_name factory.ninu.mx;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name factory.ninu.mx;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Health checks
    location /health {
        access_log off;
        proxy_pass http://frontend;
    }
}
```

## 🔐 Variables de Entorno

### .env.production

```bash
# Base de datos
DATABASE_URL=postgresql://ninu_user:${POSTGRES_PASSWORD}@postgres:5432/ninu_factory
POSTGRES_PASSWORD=secure_password_here

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# API Keys
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=factory@ninu.mx
SMTP_PASS=smtp_password_here

# Ninu.mx Configuration
COMPANY_NAME="Negocio de Innovación Utópica, S. de R.L. de C.V."
COMPANY_BRAND=Ninu.mx
COMPANY_EMAIL=hola@ninu.mx
COMPANY_LOCATION="Xalapa-Enríquez, Veracruz, México"

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=grafana_admin_password

# Security
CORS_ORIGIN=https://factory.ninu.mx
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Features
WEBSOCKET_ENABLED=true
REAL_TIME_MONITORING=true
COFEPRIS_INTEGRATION=true
```

### Seguridad de Secrets

```bash
# Script para generar secrets seguros
# scripts/generate-secrets.sh

#!/bin/bash
echo "🔐 Generando secrets de producción..."

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET"

# Database Password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "POSTGRES_PASSWORD=$DB_PASSWORD"

# Grafana Password
GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
echo "GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD"

echo "🔒 Secrets generados. Agregar a .env.production"
```

## 📊 Monitoreo y Observabilidad

Ver documentos específicos:
- [Monitoring Setup](./monitoring.md) - Configuración de Prometheus y Grafana
- [Logging Strategy](./logging.md) - Estrategia de logs estructurados
- [Performance Monitoring](./performance.md) - Métricas de rendimiento
- [Health Checks](./health-checks.md) - Verificaciones de salud

## 🔄 CI/CD Pipeline

Ver documentos específicos:
- [GitHub Actions](./github-actions.md) - Pipeline completo de CI/CD
- [Automated Testing](./testing.md) - Tests automatizados
- [Deployment Strategies](./deployment-strategies.md) - Blue/Green, Rolling updates

## 🚨 Disaster Recovery

Ver documentos específicos:
- [Backup Strategy](./backup.md) - Estrategia de backups
- [Recovery Procedures](./recovery.md) - Procedimientos de recuperación
- [High Availability](./high-availability.md) - Configuración de alta disponibilidad

## 📋 Checklist de Producción

### Pre-Deployment
- [ ] Variables de entorno configuradas
- [ ] SSL certificates instalados
- [ ] Firewall configurado
- [ ] Backup strategy implementada
- [ ] Monitoring configurado
- [ ] Health checks funcionando
- [ ] Performance testing completado
- [ ] Security scanning completado

### Post-Deployment
- [ ] Verificar todos los servicios UP
- [ ] Validar conectividad de base de datos
- [ ] Confirmar WebSocket funcionando
- [ ] Probar flujo completo de autenticación
- [ ] Verificar logs sin errores
- [ ] Confirmar métricas reportando
- [ ] Validar backups automáticos
- [ ] Documentar versión desplegada

## 🆘 Troubleshooting

### Problemas Comunes

**Frontend no carga:**
```bash
# Verificar logs
docker-compose logs frontend

# Verificar conectividad a backend
docker-compose exec frontend curl backend:3001/health
```

**Base de datos no conecta:**
```bash
# Verificar PostgreSQL
docker-compose exec postgres pg_isready

# Verificar conexión
docker-compose exec backend psql $DATABASE_URL -c "SELECT 1;"
```

**WebSocket no funciona:**
```bash
# Verificar Nginx configuración
docker-compose exec nginx nginx -t

# Test WebSocket
curl -i -N -H "Upgrade: websocket" -H "Connection: Upgrade" http://localhost/socket.io/
```

## 📞 Soporte

**Contacto Técnico:**
- Email: tech@ninu.mx
- Slack: #factory-control
- On-call: +52 228 XXX-XXXX

**Escalación:**
1. Desarrollador → Lead Developer
2. Lead Developer → CTO
3. CTO → CEO (para incidentes críticos)

**SLA:**
- P1 (Crítico): 15 minutos
- P2 (Alto): 2 horas  
- P3 (Medio): 24 horas
- P4 (Bajo): 72 horas