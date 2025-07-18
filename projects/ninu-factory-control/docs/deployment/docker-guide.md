# Guía de Containerización Docker - Sistema Ninu.mx

## 🐳 Configuración Docker Completa

El **Sistema de Control de Producción Ninu.mx** está completamente containerizado para garantizar portabilidad, escalabilidad y consistencia entre diferentes entornos.

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Rápido (Recomendado)
```bash
# Ir al directorio del proyecto
cd projects/ninu-factory-control

# Iniciar entorno de desarrollo
npm run docker:dev

# Acceder a la aplicación
open http://localhost:3000
```

### Opción 2: Entorno Completo de Producción
```bash
# Entorno completo con base de datos, Redis, monitoring
npm run docker:prod

# Acceder a los servicios
open http://localhost:3000  # Frontend
open http://localhost:3030  # Grafana (admin/ninu_admin_2024)
open http://localhost:9090  # Prometheus
```

## 📋 Prerrequisitos

### Software Requerido
```bash
# Docker y Docker Compose
docker --version          # >= 24.0.0
docker-compose --version  # >= 2.0.0

# Verificar que Docker está corriendo
docker info
```

### Recursos del Sistema
- **RAM**: Mínimo 4GB, recomendado 8GB
- **Disco**: Mínimo 10GB libres
- **CPU**: 2 cores mínimo, 4 cores recomendado

## 🛠️ Configuraciones Disponibles

### 1. **Desarrollo (`docker-compose.dev.yml`)**
Configuración mínima para desarrollo:
```yaml
Servicios incluidos:
- ✅ Frontend Next.js con hot reload
- ✅ PostgreSQL (puerto 5433)
- ✅ Redis (puerto 6380)
- ❌ Backend API (pendiente implementación)
- ❌ Monitoring
```

### 2. **Producción (`docker-compose.yml`)**
Configuración completa para producción:
```yaml
Servicios incluidos:
- ✅ Frontend Next.js optimizado
- ✅ Backend API (futuro)
- ✅ WebSocket server (futuro)
- ✅ PostgreSQL
- ✅ Redis
- ✅ Nginx reverse proxy
- ✅ Prometheus monitoring
- ✅ Grafana dashboards
```

## 🔧 Comandos Docker

### Comandos de Desarrollo
```bash
# Iniciar desarrollo
npm run docker:dev

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Detener desarrollo
npm run docker:dev:down

# Reconstruir después de cambios en dependencias
npm run docker:dev -- --build

# Entrar al contenedor para debugging
docker exec -it ninu-factory-dev bash
```

### Comandos de Producción
```bash
# Iniciar producción
npm run docker:prod

# Ver estado de servicios
docker-compose ps

# Ver logs específicos
docker-compose logs ninu-frontend
docker-compose logs ninu-database

# Detener producción
npm run docker:prod:down

# Limpiar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v
```

### Comandos de Maintenance
```bash
# Ver uso de recursos
docker stats

# Limpiar contenedores no utilizados
docker system prune

# Limpiar todo (incluyendo volúmenes)
docker system prune -a --volumes

# Backup de la base de datos
docker exec ninu-database pg_dump -U ninu_user ninu_factory > backup.sql

# Restaurar base de datos
docker exec -i ninu-database psql -U ninu_user ninu_factory < backup.sql
```

## 🌐 Puertos Utilizados

### Desarrollo (`docker-compose.dev.yml`)
```
3000  → Frontend Next.js
5433  → PostgreSQL
6380  → Redis
```

### Producción (`docker-compose.yml`)
```
80    → Nginx (HTTP)
443   → Nginx (HTTPS)
3000  → Frontend Next.js
3001  → Backend API
3030  → Grafana
5432  → PostgreSQL
6379  → Redis
8080  → WebSocket
9090  → Prometheus
```

## 🔒 Configuración de Seguridad

### Variables de Entorno
```bash
# Copiar configuración de ejemplo
cp .env.example .env.local

# Editar variables críticas
nano .env.local
```

### Variables Críticas a Cambiar
```env
# OBLIGATORIO cambiar en producción
JWT_SECRET=tu-clave-super-secreta-jwt
POSTGRES_PASSWORD=password-muy-seguro
NEXTAUTH_SECRET=clave-nextauth-segura

# Configuración de base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/ninu_factory
```

### Red Docker Aislada
```yaml
# Todas las comunicaciones internas usan red privada
networks:
  ninu-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 📊 Monitoring y Observabilidad

### Servicios de Monitoring
```bash
# Prometheus - Métricas del sistema
http://localhost:9090

# Grafana - Dashboards visuales
http://localhost:3030
# Usuario: admin
# Contraseña: ninu_admin_2024
```

### Health Checks
```bash
# Verificar salud de servicios
curl http://localhost:3000/api/health

# Ver estado de contenedores
docker-compose ps

# Logs de salud
docker-compose logs | grep health
```

### Métricas Disponibles
- **Performance**: Tiempo de respuesta, throughput
- **Recursos**: CPU, memoria, disco
- **Negocio**: Reactores activos, eficiencia, alertas
- **Base de datos**: Conexiones, queries, locks

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. **Puerto ya en uso**
```bash
# Error: Port 3000 is already in use
# Solución: Cambiar puerto o matar proceso
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en docker-compose.dev.yml
ports:
  - "3001:3000"  # Usar puerto 3001 externamente
```

#### 2. **Falta de memoria**
```bash
# Error: container exited with code 137
# Solución: Aumentar memoria de Docker
# Docker Desktop → Settings → Resources → Memory → 8GB
```

#### 3. **Volúmenes corruptos**
```bash
# Limpiar volúmenes y reconstruir
npm run docker:dev:down
docker volume prune
npm run docker:dev -- --build
```

#### 4. **Hot reload no funciona**
```bash
# Verificar que el volumen está montado correctamente
docker exec -it ninu-factory-dev ls -la /app
# Debe mostrar los archivos del proyecto
```

### Logs de Debug
```bash
# Ver todos los logs
docker-compose -f docker-compose.dev.yml logs

# Logs específicos del frontend
docker-compose -f docker-compose.dev.yml logs ninu-dev

# Seguir logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Logs con timestamps
docker-compose -f docker-compose.dev.yml logs -t
```

## 🎯 Optimizaciones de Performance

### Build Multi-Stage
```dockerfile
# Dockerfile optimizado con 3 etapas:
# 1. deps    - Solo dependencias de producción
# 2. builder - Build del código
# 3. runner  - Imagen final mínima
```

### Caché de Docker
```bash
# Usar BuildKit para mejor caché
export DOCKER_BUILDKIT=1

# Build con caché
docker build --cache-from ninu-factory-control .
```

### Volúmenes Optimizados
```yaml
volumes:
  # Hot reload optimizado
  - .:/app
  - /app/node_modules    # Evita sobrescribir node_modules
  - /app/.next          # Caché de Next.js
```

## 🚀 Despliegue en Producción

### Preparación
```bash
# 1. Build optimizado
npm run docker:build

# 2. Tag para registry
docker tag ninu-factory-control your-registry/ninu-factory-control:v1.0.0

# 3. Push al registry
docker push your-registry/ninu-factory-control:v1.0.0
```

### Variables de Producción
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.ninu.mx
DATABASE_URL=postgresql://user:pass@prod-db:5432/ninu_factory
REDIS_URL=redis://prod-redis:6379
```

### Health Checks Automáticos
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 📈 Escalabilidad

### Escalado Horizontal
```bash
# Escalar frontend
docker-compose up --scale ninu-frontend=3

# Load balancer automático con Nginx
# Distribución de carga entre instancias
```

### Recursos por Servicio
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

---

## 🎉 Conclusión

Con esta configuración Docker, el **Sistema de Control de Producción Ninu.mx** es:

- ✅ **Portable**: Funciona idéntico en cualquier entorno
- ✅ **Escalable**: Fácil escalado horizontal y vertical
- ✅ **Mantenible**: Servicios aislados y actualizables independientemente
- ✅ **Monitoreable**: Observabilidad completa incluida
- ✅ **Seguro**: Configuración de seguridad por defecto

¡El sistema está listo para desarrollo local y despliegue en producción!