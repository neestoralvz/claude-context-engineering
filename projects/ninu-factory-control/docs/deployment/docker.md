# Docker Deployment Guide - Ninu Factory Control

## Visión General

Guía completa para containerización y despliegue con Docker del sistema de control de fábrica Ninu.mx. Incluye configuraciones para desarrollo, testing y producción.

## 🐳 Arquitectura Docker

### Servicios Containerizados

**📱 Frontend (Next.js)**
- Puerto: 3000
- Imagen: `ninu/factory-frontend:latest`
- Dependencias: Backend API

**🔧 Backend (Node.js + Express)**
- Puerto: 3001  
- Imagen: `ninu/factory-backend:latest`
- Dependencias: PostgreSQL, Redis

**🗄️ PostgreSQL Database**
- Puerto: 5432
- Imagen: `postgres:15-alpine`
- Volumen persistente para datos

**⚡ Redis Cache**
- Puerto: 6379
- Imagen: `redis:7-alpine`  
- Volumen persistente para cache

**🌐 Nginx Reverse Proxy**
- Puertos: 80, 443
- Imagen: `nginx:alpine`
- SSL/TLS terminación

## 📁 Estructura de Archivos Docker

```
projects/ninu-factory-control/
├── Dockerfile                          # Frontend Next.js
├── docker-compose.yml                  # Desarrollo
├── docker-compose.prod.yml             # Producción
├── docker-compose.test.yml             # Testing
├── backend/
│   └── Dockerfile                      # Backend API
├── nginx/
│   ├── nginx.conf                      # Configuración base
│   ├── nginx.prod.conf                 # Configuración producción
│   └── ssl/                           # Certificados SSL
├── database/
│   ├── init/                          # Scripts inicialización
│   └── migrations/                    # Migraciones SQL
└── scripts/
    ├── docker-build.sh                # Script de build
    ├── docker-deploy.sh               # Script de deploy
    └── docker-cleanup.sh              # Limpieza de containers
```

## 🏗️ Dockerfiles

### Frontend Dockerfile (Multi-stage)

```dockerfile
# Dockerfile - Frontend Next.js
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app

# Build aplicación
COPY package*.json ./
RUN npm ci
COPY . .
COPY .env.production .env.local
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos built
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Configuración de seguridad
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile - Node.js API
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client

# Instalar dependencias npm
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app

# Build TypeScript
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client curl

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Copiar dependencias y código built
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/package*.json ./

# Scripts de inicialización
COPY --chown=nodeuser:nodejs scripts/wait-for-db.sh ./scripts/
RUN chmod +x ./scripts/wait-for-db.sh

# Configuración de seguridad
USER nodeuser
EXPOSE 3001
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["./scripts/wait-for-db.sh", "postgres", "node", "dist/server.js"]
```

## 🔧 Docker Compose Configurations

### Development (docker-compose.yml)

```yaml
version: '3.8'
services:
  # Frontend Development
  frontend:
    build:
      context: .
      target: deps
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXT_PUBLIC_WS_URL=ws://localhost:3001
    command: npm run dev
    depends_on:
      - backend

  # Backend Development  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://ninu_dev:ninu_dev@postgres:5432/ninu_factory_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev_jwt_secret_not_for_production
    command: npm run dev
    depends_on:
      - postgres
      - redis

  # PostgreSQL Development
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ninu_factory_dev
      - POSTGRES_USER=ninu_dev
      - POSTGRES_PASSWORD=ninu_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d

  # Redis Development
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
```

### Production (docker-compose.prod.yml)

```yaml
version: '3.8'
services:
  # Frontend Production
  frontend:
    build:
      context: .
      target: production
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://factory-api.ninu.mx
      - NEXT_PUBLIC_WS_URL=wss://factory-api.ninu.mx
    depends_on:
      - backend
    networks:
      - ninu_network

  # Backend Production
  backend:
    build:
      context: ./backend
      target: production
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    depends_on:
      - postgres
      - redis
    networks:
      - ninu_network

  # PostgreSQL Production
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=ninu_factory
      - POSTGRES_USER=ninu_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
      - ./backups:/backups
    networks:
      - ninu_network
    deploy:
      resources:
        limits:
          memory: 1GB
        reservations:
          memory: 512MB

  # Redis Production
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - ninu_network
    deploy:
      resources:
        limits:
          memory: 256MB

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - nginx_logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - ninu_network

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - ninu_network

  # Monitoring - Grafana  
  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    ports:
      - "3333:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - ninu_network

volumes:
  postgres_prod_data:
  redis_prod_data:
  nginx_logs:
  prometheus_data:
  grafana_data:

networks:
  ninu_network:
    driver: bridge
```

## 🚀 Scripts de Deployment

### Build Script

```bash
#!/bin/bash
# scripts/docker-build.sh

set -e

echo "🔨 Building Ninu Factory Control Docker images..."

# Variables
VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-}

# Build Frontend
echo "📱 Building Frontend..."
docker build -t ninu/factory-frontend:$VERSION .

# Build Backend
echo "🔧 Building Backend..."
docker build -t ninu/factory-backend:$VERSION ./backend

# Tag for registry if provided
if [ ! -z "$REGISTRY" ]; then
    echo "🏷️ Tagging for registry $REGISTRY..."
    docker tag ninu/factory-frontend:$VERSION $REGISTRY/ninu/factory-frontend:$VERSION
    docker tag ninu/factory-backend:$VERSION $REGISTRY/ninu/factory-backend:$VERSION
fi

echo "✅ Build completed!"
echo "Images built:"
echo "  - ninu/factory-frontend:$VERSION"
echo "  - ninu/factory-backend:$VERSION"
```

### Deploy Script

```bash
#!/bin/bash
# scripts/docker-deploy.sh

set -e

ENVIRONMENT=${1:-development}
VERSION=${2:-latest}

echo "🚀 Deploying Ninu Factory Control - Environment: $ENVIRONMENT"

# Verificar archivos requeridos
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f .env.production ]; then
        echo "❌ .env.production file required for production deployment"
        exit 1
    fi
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

# Backup en producción
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Creating database backup..."
    ./scripts/backup-database.sh
fi

# Build images
echo "🔨 Building images..."
./scripts/docker-build.sh $VERSION

# Deploy
echo "🚀 Starting deployment..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f $COMPOSE_FILE --env-file .env.production up -d
else
    docker-compose -f $COMPOSE_FILE up -d
fi

# Health checks
echo "🔍 Running health checks..."
sleep 30

# Check frontend
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check backend
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

echo "🎉 Deployment successful!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "📊 Monitoring: http://localhost:3333 (Grafana)"
    echo "📈 Metrics: http://localhost:9090 (Prometheus)"
fi
```

### Wait for Database Script

```bash
#!/bin/bash
# scripts/wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

until pg_isready -h "$host" -p 5432 -U "${POSTGRES_USER:-ninu_user}"; do
  echo "⏳ Waiting for PostgreSQL at $host:5432..."
  sleep 2
done

echo "✅ PostgreSQL is ready - executing command"
exec $cmd
```

## 🔍 Debugging y Troubleshooting

### Logs de Containers

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs frontend
docker-compose logs backend

# Seguir logs en tiempo real
docker-compose logs -f backend

# Logs con timestamps
docker-compose logs -t frontend
```

### Acceso a Containers

```bash
# Acceder al container del backend
docker-compose exec backend sh

# Acceder a PostgreSQL
docker-compose exec postgres psql -U ninu_user -d ninu_factory

# Acceder a Redis
docker-compose exec redis redis-cli

# Ejecutar comandos en containers
docker-compose exec backend npm run migration:run
```

### Health Checks

```bash
# Verificar estado de containers
docker-compose ps

# Health check manual del frontend
curl http://localhost:3000/health

# Health check manual del backend  
curl http://localhost:3001/api/health

# Verificar conectividad entre servicios
docker-compose exec frontend curl backend:3001/api/health
```

## 🧹 Limpieza y Mantenimiento

### Cleanup Script

```bash
#!/bin/bash
# scripts/docker-cleanup.sh

echo "🧹 Cleaning up Docker resources..."

# Parar todos los containers
docker-compose down

# Remover containers parados
docker container prune -f

# Remover imágenes sin usar
docker image prune -f

# Remover volúmenes sin usar (CUIDADO en producción)
if [ "$1" = "--volumes" ]; then
    echo "⚠️  Removing unused volumes..."
    docker volume prune -f
fi

# Remover networks sin usar
docker network prune -f

# Mostrar espacio liberado
echo "📊 Docker disk usage:"
docker system df

echo "✅ Cleanup completed!"
```

### Backup de Volúmenes

```bash
#!/bin/bash
# scripts/backup-volumes.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "📦 Backing up Docker volumes to $BACKUP_DIR..."

# Backup PostgreSQL data
docker run --rm -v ninu-factory-control_postgres_prod_data:/data \
  -v $PWD/$BACKUP_DIR:/backup alpine \
  tar czf /backup/postgres_data.tar.gz -C /data .

# Backup Redis data
docker run --rm -v ninu-factory-control_redis_prod_data:/data \
  -v $PWD/$BACKUP_DIR:/backup alpine \
  tar czf /backup/redis_data.tar.gz -C /data .

echo "✅ Backup completed in $BACKUP_DIR"
```

## 📋 Checklist de Production

### Pre-deployment
- [ ] `.env.production` configurado correctamente
- [ ] SSL certificates válidos en `nginx/ssl/`
- [ ] Passwords seguros generados
- [ ] Backup de datos actuales creado
- [ ] Health checks configurados
- [ ] Monitoring configurado (Prometheus/Grafana)
- [ ] Log rotation configurado

### Post-deployment
- [ ] Todos los containers corriendo (`docker-compose ps`)
- [ ] Health checks pasando
- [ ] Frontend accesible vía HTTPS
- [ ] Backend API respondiendo
- [ ] WebSocket funcionando
- [ ] Base de datos accesible
- [ ] Redis funcionando
- [ ] Logs sin errores críticos
- [ ] Métricas reportando a Prometheus
- [ ] Alertas configuradas en Grafana

## 🆘 Emergency Procedures

### Rollback Rápido

```bash
#!/bin/bash
# Rollback a versión anterior
PREVIOUS_VERSION=$(docker images ninu/factory-frontend --format "table {{.Tag}}" | sed -n 2p)

echo "🔄 Rolling back to version: $PREVIOUS_VERSION"

# Actualizar compose con versión anterior
sed -i "s/:latest/:$PREVIOUS_VERSION/g" docker-compose.prod.yml

# Redesplegar
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback completed"
```

### Recovery desde Backup

```bash
#!/bin/bash
# Restaurar desde backup
BACKUP_DATE=$1

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 YYYYMMDD_HHMMSS"
    exit 1
fi

echo "🔄 Restoring from backup: $BACKUP_DATE"

# Parar servicios
docker-compose down

# Restaurar PostgreSQL
docker run --rm -v ninu-factory-control_postgres_prod_data:/data \
  -v $PWD/backups/$BACKUP_DATE:/backup alpine \
  tar xzf /backup/postgres_data.tar.gz -C /data

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Recovery completed"
```