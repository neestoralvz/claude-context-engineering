const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Add security headers to HTTP responses
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: dev ? "http://localhost:3000" : "https://factory.ninu.mx",
      methods: ["GET", "POST"],
      credentials: true
    },
    allowEIO3: false, // Disable older Engine.IO versions for security
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Authentication middleware (basic implementation for backward compatibility)
  io.use(async (socket, next) => {
    try {
      // For now, allow connections but log them
      console.log(`WebSocket connection attempt from: ${socket.handshake.address}`)
      
      // In production, implement proper JWT verification here
      // const token = socket.handshake.auth.token
      // if (!token) return next(new Error('Authentication token required'))
      
      next()
    } catch (error) {
      console.error('WebSocket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  // Mock data generators
  const generateReactorUpdate = () => ({
    id: ['reactor-001', 'reactor-002', 'reactor-003'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
    parameters: {
      temperature: 15 + Math.random() * 20, // 15-35°C
      pressure: 0.8 + Math.random() * 0.8, // 0.8-1.6 bar
      mixingSpeed: Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0, // 0-200 rpm
      pH: 6.5 + Math.random() * 1.5 // 6.5-8.0
    },
    efficiency: 80 + Math.random() * 20 // 80-100%
  })

  const generateMetricsUpdate = () => ({
    timestamp: new Date().toISOString(),
    totalProduction: 12000 + Math.floor(Math.random() * 1000),
    efficiency: 85 + Math.random() * 10,
    qualityRate: 95 + Math.random() * 5,
    downtime: Math.random() * 5,
    activeOrders: 6 + Math.floor(Math.random() * 5),
    alertsCount: Math.floor(Math.random() * 5)
  })

  const generateAlert = () => {
    const alertTypes = [
      { type: 'warning', message: 'Temperatura alta en Reactor B' },
      { type: 'info', message: 'Mantenimiento programado completado' },
      { type: 'warning', message: 'Stock bajo de materias primas' },
      { type: 'error', message: 'Falla en estación de etiquetado' },
      { type: 'info', message: 'Nueva orden de producción asignada' }
    ]
    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    return {
      id: `alert-${Date.now()}`,
      ...alert,
      timestamp: new Date().toISOString(),
      resolved: false
    }
  }

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`)

    // Send initial data
    socket.emit('reactor:status', generateReactorUpdate())
    socket.emit('metrics:update', generateMetricsUpdate())

    // Real-time data simulation intervals
    const reactorInterval = setInterval(() => {
      socket.emit('reactor:status', generateReactorUpdate())
    }, 5000) // Every 5 seconds

    const metricsInterval = setInterval(() => {
      socket.emit('metrics:update', generateMetricsUpdate())
    }, 10000) // Every 10 seconds

    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of alert
        socket.emit('alert:new', generateAlert())
      }
    }, 15000) // Every 15 seconds

    // Station status updates
    const stationInterval = setInterval(() => {
      const stationUpdate = {
        id: ['station-001', 'station-002', 'station-003', 'station-004', 'station-005'][Math.floor(Math.random() * 5)],
        timestamp: new Date().toISOString(),
        performance: {
          efficiency: 80 + Math.random() * 20,
          speed: 50 + Math.random() * 100,
          quality: 95 + Math.random() * 5,
          uptime: 85 + Math.random() * 15
        }
      }
      socket.emit('station:update', stationUpdate)
    }, 8000) // Every 8 seconds

    // Production order updates
    const orderInterval = setInterval(() => {
      const orderUpdate = {
        id: `ORDER-2024-${Math.floor(Math.random() * 10) + 1}`.padStart(3, '0'),
        timestamp: new Date().toISOString(),
        progress: Math.floor(Math.random() * 100),
        status: ['in_progress', 'completed', 'on_hold'][Math.floor(Math.random() * 3)]
      }
      socket.emit('order:progress', orderUpdate)
    }, 12000) // Every 12 seconds

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`)
      clearInterval(reactorInterval)
      clearInterval(metricsInterval)
      clearInterval(alertInterval)
      clearInterval(stationInterval)
      clearInterval(orderInterval)
    })

    // Handle custom events from client
    socket.on('reactor:control', (data) => {
      console.log('Comando de reactor recibido:', data)
      // Simulate control response
      socket.emit('reactor:control:response', {
        reactorId: data.reactorId,
        action: data.action,
        status: 'executed',
        timestamp: new Date().toISOString()
      })
    })

    socket.on('station:control', (data) => {
      console.log('Comando de estación recibido:', data)
      // Simulate control response
      socket.emit('station:control:response', {
        stationId: data.stationId,
        action: data.action,
        status: 'executed',
        timestamp: new Date().toISOString()
      })
    })

    socket.on('metrics:request', (data) => {
      console.log('Solicitud de métricas:', data)
      // Send immediate metrics update
      socket.emit('metrics:update', generateMetricsUpdate())
    })
  })

  const port = process.env.WEBSOCKET_PORT || 3001

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`🚀 WebSocket server ready on http://localhost:${port}`)
    console.log(`📡 Socket.IO server running for real-time factory control`)
  })
})

module.exports = { io }