# Claude Code Observability Dashboard

🚀 **Real-time monitoring and analytics dashboard for Claude Code usage**

A comprehensive, self-contained observability solution that provides real-time insights into Claude Code performance, command execution, and system metrics without modifying the parent Context Engineering project.

## 🎯 Features

### ✅ **Real-time Observability**
- **Live metrics dashboard** with WebSocket-powered updates
- **Command execution tracking** with performance analytics
- **Multi-agent session monitoring** and coordination
- **Cost tracking and analysis** (tokens, models, usage patterns)
- **Anomaly detection** and intelligent alerting

### ✅ **Non-invasive Integration**
- **Complete project autonomy** - operates independently
- **Read-only parent project access** - no modifications required
- **Hook-based event capture** - automatic Claude Code monitoring
- **Fallback systems** - works offline with cached data

### ✅ **Advanced Analytics**
- **Performance trend analysis** with statistical insights
- **JSONL conversation processing** for usage patterns
- **Predictive analytics** for resource planning
- **Custom dashboards** and reporting

## 🏗️ Architecture

```
Context Engineering Dashboard (Autonomous)
├── Frontend (Next.js 14 + TypeScript)
│   ├── Real-time metrics display
│   ├── Interactive command simulator
│   ├── Multi-agent observability views
│   └── Analytics and reporting
├── Backend (Node.js + Express)
│   ├── WebSocket server (real-time data)
│   ├── SQLite database (events, metrics)
│   ├── REST/GraphQL APIs
│   └── Parent project integration (read-only)
├── Hook System (Python)
│   ├── claude-events-capture.py
│   ├── performance-monitor.py
│   ├── cost-tracker.py
│   └── session-analyzer.py
└── Parent Project Integration
    ├── Command registry monitoring
    ├── Scripts results analysis
    ├── Outputs tracking
    └── Real-time file watching
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Python 3.8+**
- **Claude Code installed** and configured
- **Git** (for development)

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install

# Python dependencies (for hooks)
pip install requests jsonlines
```

### 2. Environment Configuration

```bash
# Copy environment template
cp server/.env.example server/.env

# Edit configuration
nano server/.env
```

**Key environment variables:**
```bash
# Server configuration
PORT=3001
WS_PORT=3002

# Parent project path (auto-detected by default)
PARENT_PROJECT_PATH=../../

# Features
HOOKS_ENABLED=true
ENABLE_REAL_TIME_ALERTS=true
ENABLE_COST_TRACKING=true
```

### 3. Database Setup

```bash
# Initialize SQLite database
cd server
npm run setup
```

### 4. Start Services

```bash
# Start backend server
cd server
npm run dev

# Start frontend (new terminal)
npm run dev
```

### 5. Install Hooks (Optional)

The system will automatically attempt to install hooks in your Claude Code configuration. If this fails, you can install manually:

```bash
# Add to ~/.claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /path/to/dashboard/hooks/claude-events-capture.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /path/to/dashboard/hooks/performance-monitor.py"
          }
        ]
      }
    ]
  }
}
```

## 📊 Dashboard Access

Once running, access the dashboard at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3002
- **Health Check**: http://localhost:3001/health

## 🎛️ Features Overview

### **Real-time Metrics Dashboard**
- Command success rates and execution times
- Context optimization metrics
- System health indicators
- Live activity feed

### **Command Analytics**
- Command usage patterns and frequency
- Performance trends and anomalies
- Success rate analysis
- Execution time distributions

### **Multi-agent Monitoring**
- Session coordination tracking
- Agent collaboration metrics
- Resource utilization
- Workflow optimization insights

### **Cost Tracking**
- Token usage by model and time
- Cost analysis and projections
- Usage optimization recommendations
- Budget tracking and alerts

### **System Health**
- Component status monitoring
- Performance bottleneck detection
- Error tracking and analysis
- Automated alerting

## 🔧 Configuration

### **Metrics Collection**
```typescript
// Customize metrics collection
{
  refreshInterval: 30000,     // 30 seconds
  enableRealtime: true,       // WebSocket updates
  retentionDays: 90,          // Data retention
  samplingRate: 1.0           // 100% sampling
}
```

### **Hook Configuration**
```bash
# Hook system settings
HOOKS_TIMEOUT=30000
HOOK_DEBUG=false
OBSERVABILITY_SERVER=http://localhost:3001
```

### **Performance Tuning**
```bash
# Database performance
MAX_DATABASE_SIZE=100MB
DATABASE_BACKUP_INTERVAL=24h

# WebSocket settings
WS_HEARTBEAT_INTERVAL=30000
MAX_CONNECTIONS=100
```

## 🔍 API Reference

### **Metrics API**
```bash
GET /api/metrics/summary?timeRange=24h
GET /api/metrics/realtime
GET /api/metrics/trends/{metric}
POST /api/metrics (from hooks)
```

### **Commands API**
```bash
GET /api/commands/registry
GET /api/commands/stats
GET /api/commands/execution/{command}
```

### **Analytics API**
```bash
GET /api/analytics/performance
GET /api/analytics/usage
GET /api/analytics/costs
```

### **WebSocket Events**
```typescript
// Subscribe to real-time updates
ws.send({
  type: 'subscribe',
  payload: { 
    channels: ['metrics', 'events', 'commands', 'alerts'] 
  }
})
```

## 🛠️ Development

### **Project Structure**
```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── utils/             # Utilities
├── server/                # Backend source
│   ├── src/               # Server modules
│   ├── routes/            # API routes
│   └── scripts/           # Setup scripts
├── hooks/                 # Claude Code hooks
└── docs/                  # Documentation
```

### **Development Commands**
```bash
# Frontend development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check

# Backend development
cd server
npm run dev          # Start with nodemon
npm run test         # Run tests
npm run monitor      # Health monitoring
```

### **Testing**
```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test

# Integration tests
npm run test:integration

# Hook tests
python -m pytest hooks/tests/
```

## 🐳 Production Deployment

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t claude-dashboard .
docker run -p 3000:3000 -p 3001:3001 claude-dashboard
```

### **Environment Setup**
```bash
# Production environment
NODE_ENV=production
DATABASE_PATH=/data/observability.db
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://your-domain.com
API_RATE_LIMIT=1000
```

### **Monitoring**
```bash
# Health monitoring
curl http://localhost:3001/health

# Metrics endpoint
curl http://localhost:3001/api/metrics/summary

# System stats
curl http://localhost:3001/api/system/info
```

## 🔒 Security Considerations

### **Data Privacy**
- ✅ **All data stored locally** - no cloud transmission
- ✅ **Read-only parent project access** - no modifications
- ✅ **Encrypted WebSocket connections** (in production)
- ✅ **Configurable data retention** policies

### **Access Control**
- ✅ **CORS protection** for API endpoints
- ✅ **Rate limiting** on all endpoints
- ✅ **Input validation** and sanitization
- ✅ **Secure headers** with Helmet.js

### **Hook Security**
- ✅ **Timeout protection** (30s default)
- ✅ **Error isolation** - failures don't affect Claude Code
- ✅ **Input validation** for all hook data
- ✅ **Sandboxed execution** environment

## 📈 Performance

### **Benchmarks**
- **Real-time latency**: <100ms for WebSocket updates
- **API response time**: <50ms average
- **Database queries**: <10ms for metrics
- **Memory usage**: <500MB total footprint
- **Hook overhead**: <5ms per Claude Code operation

### **Optimization**
- ✅ **SQLite optimization** with indexes and prepared statements
- ✅ **WebSocket connection pooling** and heartbeat management
- ✅ **Caching layers** for frequently accessed data
- ✅ **Lazy loading** for dashboard components
- ✅ **Data pagination** for large result sets

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### **Code Standards**
- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Jest** for testing
- **Conventional commits** for messages

## 🆘 Troubleshooting

### **Common Issues**

**Dashboard not loading:**
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check frontend build
npm run build
```

**No real-time data:**
```bash
# Verify WebSocket connection
wscat -c ws://localhost:3002

# Check hook installation
cat ~/.claude/settings.json | grep hooks
```

**Database errors:**
```bash
# Reset database
cd server
rm data/observability.db
npm run setup
```

**Permission errors:**
```bash
# Fix hook permissions
chmod +x hooks/*.py

# Check Python dependencies
pip list | grep requests
```

### **Debug Mode**
```bash
# Enable debug logging
export HOOK_DEBUG=true
export LOG_LEVEL=debug

# Run with debug info
npm run dev 2>&1 | tee debug.log
```

## 📞 Support

- **Documentation**: [Full documentation](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/claude-dashboard/issues)
- **API Reference**: [API docs](./docs/api.md)
- **Examples**: [Integration examples](./docs/examples/)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ for the Claude Code community**

*Autonomous • Real-time • Privacy-first • Production-ready*