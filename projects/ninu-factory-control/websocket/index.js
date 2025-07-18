// Ninu Factory Control System - WebSocket Server
// Real-time communication for factory monitoring
const WebSocket = require('ws');
require('dotenv').config();

const port = process.env.WS_PORT || 8080;

const wss = new WebSocket.Server({ 
  port: port,
  host: '0.0.0.0'
});

console.log(`🔌 Ninu Factory WebSocket server running on port ${port}`);

// Mock factory data for development
const mockFactoryData = () => ({
  timestamp: new Date().toISOString(),
  reactors: {
    A: {
      temperature: 45 + Math.random() * 10,
      pressure: 2.1 + Math.random() * 0.5,
      speed: 150 + Math.random() * 50,
      status: 'active'
    },
    B: {
      temperature: 38 + Math.random() * 8,
      pressure: 1.8 + Math.random() * 0.4,
      speed: 120 + Math.random() * 40,
      status: 'active'
    },
    C: {
      temperature: 25 + Math.random() * 5,
      pressure: 1.0 + Math.random() * 0.2,
      speed: 0,
      status: 'standby'
    }
  },
  stations: {
    etiquetado: { efficiency: 0.85 + Math.random() * 0.1, status: 'running' },
    llenado: { efficiency: 0.90 + Math.random() * 0.08, status: 'running' },
    polvos: { efficiency: 0.0, status: 'idle' },
    jabones: { efficiency: 0.0, status: 'idle' },
    secundario: { efficiency: 0.75 + Math.random() * 0.15, status: 'running' }
  },
  production: {
    totalUnits: Math.floor(1000 + Math.random() * 500),
    qualityRate: 0.95 + Math.random() * 0.04,
    efficiency: 0.87 + Math.random() * 0.08
  }
});

wss.on('connection', (ws) => {
  console.log('📱 New client connected');

  // Send initial data
  ws.send(JSON.stringify({
    type: 'factory_data',
    data: mockFactoryData()
  }));

  // Send periodic updates
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'factory_data',
        data: mockFactoryData()
      }));
    }
  }, 2000); // Update every 2 seconds

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data);
      
      // Echo back for development
      ws.send(JSON.stringify({
        type: 'response',
        data: { received: data }
      }));
    } catch (error) {
      console.error('❌ Message parse error:', error);
    }
  });

  ws.on('close', () => {
    console.log('👋 Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('🔥 WebSocket error:', error);
    clearInterval(interval);
  });
});