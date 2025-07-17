# syntax=docker/dockerfile:1.4
# Personal Usage Dashboard - Optimized Multi-Stage Dockerfile
# Following 2024-2025 Docker best practices

#=== Build Stage: Install dependencies ===
FROM python:3.9-slim as builder

# Set build-time environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies in virtual environment
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

#=== Runtime Stage: Minimal production image ===
FROM python:3.9-slim as runtime

# Set runtime environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    DASHBOARD_PORT=8080 \
    DASHBOARD_HOST=0.0.0.0

# Install only runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r dashboard && useradd --no-log-init -r -g dashboard dashboard

# Create application directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY --chown=dashboard:dashboard . .

# Create data directory with correct permissions
RUN mkdir -p /app/data /app/logs && \
    chown -R dashboard:dashboard /app

# Switch to non-root user
USER dashboard

# Expose port (configurable via environment)
EXPOSE ${DASHBOARD_PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get(f'http://localhost:{${DASHBOARD_PORT}}/api/health')" || exit 1

# Add volume for persistent data
VOLUME ["/app/data"]

# Entry point with smart initialization
ENTRYPOINT ["python", "main.py"]
CMD ["--host", "0.0.0.0"]