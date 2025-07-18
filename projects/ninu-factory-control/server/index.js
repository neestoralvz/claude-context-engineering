// Ninu Factory Control System - API Backend
// Secure Express server with authentication and security middleware
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true,
});

app.use(limiter);
app.use('/api/auth', authLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://factory.ninu.mx'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.['auth-token'];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Permission checking middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.permissions.includes(permission) && !req.user.permissions.includes('write:all')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'ninu-factory-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Protected API endpoints
app.get('/api/status', authenticateToken, requirePermission('read:dashboard'), (req, res) => {
  res.json({
    factory: 'operational',
    reactors: {
      A: 'active',
      B: 'active', 
      C: 'standby'
    },
    stations: {
      etiquetado: 'running',
      llenado: 'running',
      polvos: 'idle',
      jabones: 'idle',
      secundario: 'running'
    },
    requestedBy: req.user.username,
    timestamp: new Date().toISOString()
  });
});

// Reactor control endpoint
app.post('/api/reactors/:id/control', authenticateToken, requirePermission('control:reactors'), (req, res) => {
  const { id } = req.params;
  const { action, parameters } = req.body;

  // Log the control action
  console.log(`Reactor ${id} control by ${req.user.username}: ${action}`, parameters);

  res.json({
    success: true,
    reactorId: id,
    action,
    parameters,
    executedBy: req.user.username,
    timestamp: new Date().toISOString()
  });
});

// Station control endpoint
app.post('/api/stations/:id/control', authenticateToken, requirePermission('control:stations'), (req, res) => {
  const { id } = req.params;
  const { action, parameters } = req.body;

  // Log the control action
  console.log(`Station ${id} control by ${req.user.username}: ${action}`, parameters);

  res.json({
    success: true,
    stationId: id,
    action,
    parameters,
    executedBy: req.user.username,
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/api/metrics', authenticateToken, requirePermission('view:analytics'), (req, res) => {
  const { role } = req.user;
  
  const baseMetrics = {
    timestamp: new Date().toISOString(),
    totalProduction: 12000 + Math.floor(Math.random() * 1000),
    efficiency: 85 + Math.random() * 10,
    activeOrders: 6 + Math.floor(Math.random() * 5)
  };

  // Add sensitive data for supervisors and admins
  if (role === 'supervisor' || role === 'admin') {
    baseMetrics.qualityRate = 95 + Math.random() * 5;
    baseMetrics.downtime = Math.random() * 5;
    baseMetrics.alertsCount = Math.floor(Math.random() * 5);
  }

  res.json(baseMetrics);
});

// User management endpoints (admin only)
app.get('/api/users', authenticateToken, requirePermission('manage:users'), (req, res) => {
  // Return mock users list
  res.json([
    { id: '1', username: 'admin', role: 'admin', isActive: true },
    { id: '2', username: 'supervisor1', role: 'supervisor', isActive: true }
  ]);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🏭 Ninu Factory API running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});