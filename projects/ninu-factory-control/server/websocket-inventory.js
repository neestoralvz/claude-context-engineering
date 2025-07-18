// Enhanced WebSocket server with real-time inventory tracking for Ninu.mx Factory Control
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ninu_factory_control',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: dev ? "http://localhost:3000" : "https://factory.ninu.mx",
      methods: ["GET", "POST"],
      credentials: true
    },
    allowEIO3: false,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      console.log(`WebSocket connection attempt from: ${socket.handshake.address}`);
      
      // In production, implement proper JWT verification here
      // const token = socket.handshake.auth.token;
      // if (!token) return next(new Error('Authentication token required'));
      
      next();
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // ==========================================
  // REAL-TIME INVENTORY FUNCTIONS
  // ==========================================

  // Get current inventory summary
  async function getInventorySummary() {
    try {
      const query = `
        SELECT 
          rm.id,
          rm.material_code,
          rm.name as material_name,
          rm.unit_of_measure,
          rm.minimum_stock,
          rm.reorder_point,
          loc.name as location_name,
          il.quantity_on_hand,
          il.quantity_reserved,
          il.quantity_available,
          il.unit_cost,
          il.quantity_available * il.unit_cost as total_value,
          CASE 
            WHEN il.quantity_available <= 0 THEN 'out_of_stock'
            WHEN il.quantity_available <= rm.minimum_stock THEN 'critical'
            WHEN il.quantity_available <= rm.reorder_point THEN 'low'
            ELSE 'normal'
          END as stock_status,
          il.last_updated
        FROM inventory_levels il
        JOIN raw_materials rm ON il.material_id = rm.id
        JOIN inventory_locations loc ON il.location_id = loc.id
        WHERE rm.is_active = true AND loc.is_active = true
        ORDER BY material_name, location_name
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      return [];
    }
  }

  // Get stock alerts
  async function getStockAlerts() {
    try {
      const query = `
        SELECT 
          il.material_id,
          rm.material_code,
          rm.name as material_name,
          loc.name as location_name,
          il.quantity_available,
          rm.reorder_point,
          rm.minimum_stock,
          CASE 
            WHEN il.quantity_available <= 0 THEN 'out_of_stock'
            WHEN il.quantity_available <= rm.minimum_stock THEN 'critical'
            WHEN il.quantity_available <= rm.reorder_point THEN 'low'
          END as alert_level,
          il.last_updated
        FROM inventory_levels il
        JOIN raw_materials rm ON il.material_id = rm.id
        JOIN inventory_locations loc ON il.location_id = loc.id
        WHERE rm.is_active = true 
        AND loc.is_active = true
        AND il.quantity_available <= rm.reorder_point
        ORDER BY 
          CASE 
            WHEN il.quantity_available <= 0 THEN 1
            WHEN il.quantity_available <= rm.minimum_stock THEN 2
            WHEN il.quantity_available <= rm.reorder_point THEN 3
          END,
          material_name
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return [];
    }
  }

  // Get recent inventory transactions
  async function getRecentTransactions(limit = 10) {
    try {
      const query = `
        SELECT 
          it.id,
          it.transaction_type,
          it.quantity,
          it.unit_cost,
          it.total_cost,
          it.notes,
          it.created_at,
          rm.material_code,
          rm.name as material_name,
          rm.unit_of_measure,
          loc.name as location_name,
          u.username as created_by_username
        FROM inventory_transactions it
        JOIN raw_materials rm ON it.material_id = rm.id
        JOIN inventory_locations loc ON it.location_id = loc.id
        LEFT JOIN users u ON it.created_by = u.id::text
        ORDER BY it.created_at DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  // Get inventory value statistics
  async function getInventoryStats() {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT rm.id) as total_materials,
          COUNT(DISTINCT loc.id) as total_locations,
          COALESCE(SUM(il.quantity_available * il.unit_cost), 0) as total_value,
          COUNT(CASE WHEN il.quantity_available <= rm.minimum_stock THEN 1 END) as critical_items,
          COUNT(CASE WHEN il.quantity_available <= rm.reorder_point AND il.quantity_available > rm.minimum_stock THEN 1 END) as low_stock_items,
          COUNT(CASE WHEN il.quantity_available > rm.reorder_point THEN 1 END) as normal_items
        FROM inventory_levels il
        JOIN raw_materials rm ON il.material_id = rm.id
        JOIN inventory_locations loc ON il.location_id = loc.id
        WHERE rm.is_active = true AND loc.is_active = true
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return {
        total_materials: 0,
        total_locations: 0,
        total_value: 0,
        critical_items: 0,
        low_stock_items: 0,
        normal_items: 0
      };
    }
  }

  // Simulate inventory transaction
  async function simulateInventoryTransaction() {
    try {
      // Get a random material and location
      const materialQuery = `
        SELECT id, material_code, name, unit_of_measure
        FROM raw_materials 
        WHERE is_active = true 
        ORDER BY RANDOM() 
        LIMIT 1
      `;
      
      const locationQuery = `
        SELECT id, name
        FROM inventory_locations 
        WHERE is_active = true 
        ORDER BY RANDOM() 
        LIMIT 1
      `;
      
      const [materialResult, locationResult] = await Promise.all([
        pool.query(materialQuery),
        pool.query(locationQuery)
      ]);
      
      if (materialResult.rows.length === 0 || locationResult.rows.length === 0) {
        return null;
      }
      
      const material = materialResult.rows[0];
      const location = locationResult.rows[0];
      
      // Create random transaction
      const transactionTypes = ['receipt', 'issue', 'adjustment'];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const unitCost = Math.floor(Math.random() * 50) + 10;
      
      const insertQuery = `
        INSERT INTO inventory_transactions (
          material_id, location_id, transaction_type, quantity, 
          unit_cost, total_cost, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        material.id,
        location.id,
        transactionType,
        transactionType === 'issue' ? -quantity : quantity,
        unitCost,
        unitCost * quantity,
        `Simulated ${transactionType} transaction`
      ]);
      
      // Update inventory levels
      const updateQuery = `
        INSERT INTO inventory_levels (material_id, location_id, quantity_on_hand, unit_cost, last_updated)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (material_id, location_id)
        DO UPDATE SET 
          quantity_on_hand = CASE 
            WHEN $5 = 'issue' THEN GREATEST(0, inventory_levels.quantity_on_hand - $3)
            ELSE inventory_levels.quantity_on_hand + $3
          END,
          unit_cost = COALESCE($4, inventory_levels.unit_cost),
          last_updated = NOW()
        RETURNING *
      `;
      
      await pool.query(updateQuery, [
        material.id,
        location.id,
        Math.abs(quantity),
        unitCost,
        transactionType
      ]);
      
      return {
        ...result.rows[0],
        material_code: material.material_code,
        material_name: material.name,
        location_name: location.name,
        unit_of_measure: material.unit_of_measure
      };
    } catch (error) {
      console.error('Error simulating inventory transaction:', error);
      return null;
    }
  }

  // ==========================================
  // EXISTING MOCK DATA GENERATORS
  // ==========================================

  const generateReactorUpdate = () => ({
    id: ['reactor-001', 'reactor-002', 'reactor-003'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
    parameters: {
      temperature: 15 + Math.random() * 20,
      pressure: 0.8 + Math.random() * 0.8,
      mixingSpeed: Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0,
      pH: 6.5 + Math.random() * 1.5
    },
    efficiency: 80 + Math.random() * 20
  });

  const generateMetricsUpdate = () => ({
    timestamp: new Date().toISOString(),
    totalProduction: 12000 + Math.floor(Math.random() * 1000),
    efficiency: 85 + Math.random() * 10,
    qualityRate: 95 + Math.random() * 5,
    downtime: Math.random() * 5,
    activeOrders: 6 + Math.floor(Math.random() * 5),
    alertsCount: Math.floor(Math.random() * 5)
  });

  // ==========================================
  // WEBSOCKET CONNECTION HANDLING
  // ==========================================

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send initial data
    socket.emit('reactor:status', generateReactorUpdate());
    socket.emit('metrics:update', generateMetricsUpdate());

    // Send initial inventory data
    getInventorySummary().then(data => {
      socket.emit('inventory:summary', data);
    });

    getStockAlerts().then(data => {
      socket.emit('inventory:alerts', data);
    });

    getInventoryStats().then(data => {
      socket.emit('inventory:stats', data);
    });

    getRecentTransactions(10).then(data => {
      socket.emit('inventory:transactions', data);
    });

    // ==========================================
    // REAL-TIME UPDATE INTERVALS
    // ==========================================

    // Reactor updates
    const reactorInterval = setInterval(() => {
      socket.emit('reactor:status', generateReactorUpdate());
    }, 5000);

    // Metrics updates
    const metricsInterval = setInterval(() => {
      socket.emit('metrics:update', generateMetricsUpdate());
    }, 10000);

    // Inventory summary updates
    const inventoryInterval = setInterval(async () => {
      const summary = await getInventorySummary();
      socket.emit('inventory:summary', summary);
    }, 30000); // Every 30 seconds

    // Stock alerts updates
    const alertsInterval = setInterval(async () => {
      const alerts = await getStockAlerts();
      socket.emit('inventory:alerts', alerts);
    }, 60000); // Every minute

    // Inventory stats updates
    const statsInterval = setInterval(async () => {
      const stats = await getInventoryStats();
      socket.emit('inventory:stats', stats);
    }, 45000); // Every 45 seconds

    // Simulate inventory transactions
    const transactionInterval = setInterval(async () => {
      if (Math.random() > 0.6) { // 40% chance
        const transaction = await simulateInventoryTransaction();
        if (transaction) {
          socket.emit('inventory:transaction:new', transaction);
          
          // Update related data
          const [summary, alerts, stats, transactions] = await Promise.all([
            getInventorySummary(),
            getStockAlerts(),
            getInventoryStats(),
            getRecentTransactions(10)
          ]);
          
          socket.emit('inventory:summary', summary);
          socket.emit('inventory:alerts', alerts);
          socket.emit('inventory:stats', stats);
          socket.emit('inventory:transactions', transactions);
        }
      }
    }, 20000); // Every 20 seconds

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
      };
      socket.emit('station:update', stationUpdate);
    }, 8000);

    // ==========================================
    // CLIENT EVENT HANDLERS
    // ==========================================

    // Inventory-specific events
    socket.on('inventory:request:summary', async () => {
      const summary = await getInventorySummary();
      socket.emit('inventory:summary', summary);
    });

    socket.on('inventory:request:alerts', async () => {
      const alerts = await getStockAlerts();
      socket.emit('inventory:alerts', alerts);
    });

    socket.on('inventory:request:stats', async () => {
      const stats = await getInventoryStats();
      socket.emit('inventory:stats', stats);
    });

    socket.on('inventory:request:transactions', async (data) => {
      const limit = data?.limit || 10;
      const transactions = await getRecentTransactions(limit);
      socket.emit('inventory:transactions', transactions);
    });

    // Manual inventory transaction
    socket.on('inventory:transaction:create', async (data) => {
      try {
        const { materialId, locationId, transactionType, quantity, unitCost, notes } = data;
        
        const insertQuery = `
          INSERT INTO inventory_transactions (
            material_id, location_id, transaction_type, quantity, 
            unit_cost, total_cost, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [
          materialId,
          locationId,
          transactionType,
          transactionType === 'issue' ? -Math.abs(quantity) : Math.abs(quantity),
          unitCost,
          unitCost * Math.abs(quantity),
          notes || `Manual ${transactionType} transaction`
        ]);
        
        // Update inventory levels
        const updateQuery = `
          INSERT INTO inventory_levels (material_id, location_id, quantity_on_hand, unit_cost, last_updated)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (material_id, location_id)
          DO UPDATE SET 
            quantity_on_hand = CASE 
              WHEN $5 = 'issue' THEN GREATEST(0, inventory_levels.quantity_on_hand - $3)
              ELSE inventory_levels.quantity_on_hand + $3
            END,
            unit_cost = COALESCE($4, inventory_levels.unit_cost),
            last_updated = NOW()
          RETURNING *
        `;
        
        await pool.query(updateQuery, [
          materialId,
          locationId,
          Math.abs(quantity),
          unitCost,
          transactionType
        ]);
        
        socket.emit('inventory:transaction:created', {
          success: true,
          transaction: result.rows[0]
        });
        
        // Send updated data
        const [summary, alerts, stats, transactions] = await Promise.all([
          getInventorySummary(),
          getStockAlerts(),
          getInventoryStats(),
          getRecentTransactions(10)
        ]);
        
        socket.emit('inventory:summary', summary);
        socket.emit('inventory:alerts', alerts);
        socket.emit('inventory:stats', stats);
        socket.emit('inventory:transactions', transactions);
        
      } catch (error) {
        console.error('Error creating inventory transaction:', error);
        socket.emit('inventory:transaction:created', {
          success: false,
          error: error.message
        });
      }
    });

    // Existing event handlers
    socket.on('reactor:control', (data) => {
      console.log('Reactor control command received:', data);
      socket.emit('reactor:control:response', {
        reactorId: data.reactorId,
        action: data.action,
        status: 'executed',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('station:control', (data) => {
      console.log('Station control command received:', data);
      socket.emit('station:control:response', {
        stationId: data.stationId,
        action: data.action,
        status: 'executed',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('metrics:request', (data) => {
      console.log('Metrics request:', data);
      socket.emit('metrics:update', generateMetricsUpdate());
    });

    // ==========================================
    // CLEANUP ON DISCONNECT
    // ==========================================

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      clearInterval(reactorInterval);
      clearInterval(metricsInterval);
      clearInterval(inventoryInterval);
      clearInterval(alertsInterval);
      clearInterval(statsInterval);
      clearInterval(transactionInterval);
      clearInterval(stationInterval);
    });
  });

  const port = process.env.WEBSOCKET_PORT || 3001;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Enhanced WebSocket server ready on http://localhost:${port}`);
    console.log(`📡 Socket.IO server running with real-time inventory tracking`);
    console.log(`🏭 Factory control + inventory management system active`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down WebSocket server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down WebSocket server...');
  await pool.end();
  process.exit(0);
});

module.exports = { io, pool };