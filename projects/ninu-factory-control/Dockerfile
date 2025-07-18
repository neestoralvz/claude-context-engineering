# Production Dockerfile for Ninu Factory Control System
# Enterprise-grade multi-stage build with security, monitoring, and optimization

# ================================
# Stage 1: Security Scanning Base
# ================================
FROM node:18-alpine AS security-base
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata && \
    rm -rf /var/cache/apk/*

# ================================
# Stage 2: Dependencies
# ================================
FROM security-base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with audit and security checks
RUN npm audit --audit-level moderate && \
    npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ================================
# Stage 3: Builder
# ================================
FROM security-base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Run comprehensive testing and quality checks
RUN npm run test:ci
RUN npm run lint

# Build the application with optimizations
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ================================
# Stage 4: Production Runtime
# ================================
FROM security-base AS runner
WORKDIR /app

# Install production utilities
RUN apk add --no-cache \
    tini \
    procfs \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp && \
    chown -R nextjs:nodejs /app

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy configuration files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# Set proper permissions
RUN chmod -R 755 /app && \
    chmod -R 700 /app/logs /app/tmp

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables for production
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=1024" \
    TZ=America/Mexico_City

# Labels for metadata and monitoring
LABEL maintainer="Ninu Factory Team" \
      version="1.0.0" \
      description="Ninu Factory Control System" \
      environment="production"

# Health check with detailed monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]