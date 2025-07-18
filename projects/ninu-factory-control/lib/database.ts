// Database connection and configuration for Ninu.mx Factory Control System
import { Pool, PoolClient, QueryResult } from 'pg';

// Database configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl?: boolean | object;
}

// Database connection pool
let pool: Pool | null = null;

// Get database configuration from environment variables
function getDatabaseConfig(): DatabaseConfig {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ninu_factory_control',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  };

  // SSL configuration for production
  if (process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  return config;
}

// Initialize database connection pool
export function initializeDatabase(): Pool {
  if (!pool) {
    const config = getDatabaseConfig();
    
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
      ssl: config.ssl,
    });

    // Handle pool events
    pool.on('connect', (client: PoolClient) => {
      console.log('✅ Database connection established');
    });

    pool.on('error', (err: Error) => {
      console.error('❌ Database pool error:', err);
    });

    pool.on('remove', () => {
      console.log('🔄 Database connection removed from pool');
    });
  }

  return pool;
}

// Get database connection pool
export function getDatabase(): Pool {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

// Close database connection pool
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 Database connection pool closed');
  }
}

// Database query wrapper with error handling
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const db = getDatabase();
  const client = await db.connect();

  try {
    const start = Date.now();
    const result = await client.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (>100ms) in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`🐌 Slow query (${duration}ms):`, text);
    }

    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Transaction wrapper
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Database health check
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  connectionCount: number;
  details?: string;
}> {
  try {
    const db = getDatabase();
    const result = await db.query('SELECT NOW() as timestamp, version() as version');
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      connectionCount: db.totalCount,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      connectionCount: 0,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Database initialization with schema setup
export async function initializeSchema(): Promise<void> {
  try {
    const db = getDatabase();
    
    // Check if schema is already initialized
    const result = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'companies'
    `);

    if (result.rows[0].count === '0') {
      console.log('🔄 Initializing database schema...');
      
      // Here you would typically run the schema.sql file
      // For now, we'll just create a basic companies table
      await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          legal_name VARCHAR(255) NOT NULL,
          tax_id VARCHAR(50) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ Database schema initialized');
    } else {
      console.log('✅ Database schema already exists');
    }
  } catch (error) {
    console.error('❌ Schema initialization error:', error);
    throw error;
  }
}

// Common database operations
export class DatabaseOperations {
  // Get all records from a table
  static async findAll<T>(tableName: string, whereClause?: string, params?: any[]): Promise<T[]> {
    const queryText = whereClause 
      ? `SELECT * FROM ${tableName} WHERE ${whereClause}`
      : `SELECT * FROM ${tableName}`;
    
    const result = await query<T>(queryText, params);
    return result.rows;
  }

  // Get a single record by ID
  static async findById<T>(tableName: string, id: string): Promise<T | null> {
    const result = await query<T>(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  // Insert a new record
  static async insert<T>(tableName: string, data: Partial<T>): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const queryText = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await query<T>(queryText, values);
    return result.rows[0];
  }

  // Update a record by ID
  static async update<T>(tableName: string, id: string, data: Partial<T>): Promise<T | null> {
    const entries = Object.entries(data);
    const setClause = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
    const values = entries.map(([, value]) => value);

    const queryText = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await query<T>(queryText, [...values, id]);
    return result.rows[0] || null;
  }

  // Delete a record by ID
  static async delete(tableName: string, id: string): Promise<boolean> {
    const result = await query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }

  // Count records in a table
  static async count(tableName: string, whereClause?: string, params?: any[]): Promise<number> {
    const queryText = whereClause
      ? `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`
      : `SELECT COUNT(*) as count FROM ${tableName}`;

    const result = await query<{ count: string }>(queryText, params);
    return parseInt(result.rows[0].count);
  }
}

// Export types for use in other modules
export type { DatabaseConfig, QueryResult };
export { Pool, PoolClient };