// Inventory Service for database operations
import { query, DatabaseOperations } from '@/lib/database';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
  location: string;
  status: string;
  lastUpdated: string;
  supplier: string;
  description?: string;
}

export interface InventoryFilters {
  category?: string;
  status?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface InventoryResponse {
  inventory: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalItems: number;
    totalValue: number;
    totalStock: number;
    lowStockCount: number;
    categories: string[];
    averagePrice: number;
  };
}

export class InventoryService {
  /**
   * Get inventory items with filtering and pagination
   */
  static async getInventory(filters: InventoryFilters = {}): Promise<InventoryResponse> {
    const {
      category,
      status,
      lowStock,
      page = 1,
      limit = 10
    } = filters;

    // Build dynamic query
    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (lowStock) {
      whereClause += ` AND stock <= min_stock`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory_items
      WHERE ${whereClause}
    `;
    
    const countResult = await query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get inventory items
    const inventoryQuery = `
      SELECT 
        id,
        name,
        category,
        stock,
        min_stock as "minStock",
        price,
        unit,
        location,
        status,
        last_updated as "lastUpdated",
        supplier,
        description
      FROM inventory_items
      WHERE ${whereClause}
      ORDER BY last_updated DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const inventoryResult = await query<InventoryItem>(
      inventoryQuery, 
      [...params, limit, offset]
    );

    // Calculate summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_items,
        SUM(stock * price) as total_value,
        SUM(stock) as total_stock,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_count,
        AVG(price) as average_price
      FROM inventory_items
      WHERE ${whereClause}
    `;

    const summaryResult = await query<{
      total_items: string;
      total_value: string;
      total_stock: string;
      low_stock_count: string;
      average_price: string;
    }>(summaryQuery, params);

    // Get categories
    const categoriesQuery = `
      SELECT DISTINCT category
      FROM inventory_items
      WHERE ${whereClause}
      ORDER BY category
    `;

    const categoriesResult = await query<{ category: string }>(categoriesQuery, params);
    const categories = categoriesResult.rows.map(row => row.category);

    const summary = summaryResult.rows[0];

    return {
      inventory: inventoryResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary: {
        totalItems: parseInt(summary.total_items),
        totalValue: parseFloat(summary.total_value || '0'),
        totalStock: parseInt(summary.total_stock || '0'),
        lowStockCount: parseInt(summary.low_stock_count || '0'),
        categories,
        averagePrice: parseFloat(summary.average_price || '0')
      }
    };
  }

  /**
   * Get inventory item by ID
   */
  static async getInventoryById(id: string): Promise<InventoryItem | null> {
    const result = await query<InventoryItem>(`
      SELECT 
        id,
        name,
        category,
        stock,
        min_stock as "minStock",
        price,
        unit,
        location,
        status,
        last_updated as "lastUpdated",
        supplier,
        description
      FROM inventory_items
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  /**
   * Create new inventory item
   */
  static async createInventoryItem(data: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> {
    const result = await query<InventoryItem>(`
      INSERT INTO inventory_items (
        name, category, stock, min_stock, price, unit, location, status, supplier, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id,
        name,
        category,
        stock,
        min_stock as "minStock",
        price,
        unit,
        location,
        status,
        last_updated as "lastUpdated",
        supplier,
        description
    `, [
      data.name,
      data.category,
      data.stock,
      data.minStock,
      data.price,
      data.unit,
      data.location,
      data.status,
      data.supplier,
      data.description
    ]);

    return result.rows[0];
  }

  /**
   * Update inventory item
   */
  static async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'id' || key === 'lastUpdated') return;
      
      const dbKey = key === 'minStock' ? 'min_stock' : key === 'lastUpdated' ? 'last_updated' : key;
      updates.push(`${dbKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    if (updates.length === 0) {
      return await this.getInventoryById(id);
    }

    const result = await query<InventoryItem>(`
      UPDATE inventory_items
      SET ${updates.join(', ')}, last_updated = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        name,
        category,
        stock,
        min_stock as "minStock",
        price,
        unit,
        location,
        status,
        last_updated as "lastUpdated",
        supplier,
        description
    `, [...values, id]);

    return result.rows[0] || null;
  }

  /**
   * Delete inventory item
   */
  static async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await query(`
      DELETE FROM inventory_items WHERE id = $1
    `, [id]);

    return result.rowCount > 0;
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(): Promise<InventoryItem[]> {
    const result = await query<InventoryItem>(`
      SELECT 
        id,
        name,
        category,
        stock,
        min_stock as "minStock",
        price,
        unit,
        location,
        status,
        last_updated as "lastUpdated",
        supplier,
        description
      FROM inventory_items
      WHERE stock <= min_stock
      ORDER BY (stock / min_stock) ASC
    `);

    return result.rows;
  }

  /**
   * Initialize inventory table if it doesn't exist
   */
  static async initializeInventoryTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS inventory_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          stock DECIMAL(10,2) NOT NULL DEFAULT 0,
          min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
          price DECIMAL(10,2) NOT NULL DEFAULT 0,
          unit VARCHAR(20) NOT NULL DEFAULT 'unidad',
          location VARCHAR(100) NOT NULL DEFAULT 'A1-001',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          supplier VARCHAR(255) NOT NULL DEFAULT 'Proveedor General',
          description TEXT,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if table is empty and seed with mock data
      const countResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM inventory_items'
      );

      if (countResult.rows[0].count === '0') {
        await this.seedInventoryData();
      }
    } catch (error) {
      console.error('Error initializing inventory table:', error);
      throw error;
    }
  }

  /**
   * Seed inventory table with mock data
   */
  static async seedInventoryData(): Promise<void> {
    const mockData = [
      {
        name: 'Tensioactivo Premium',
        category: 'raw_material',
        stock: 150,
        minStock: 50,
        price: 45.50,
        unit: 'kg',
        location: 'A1-001',
        status: 'active',
        supplier: 'QuimiPro S.A.',
        description: 'Tensioactivo premium para formulaciones'
      },
      {
        name: 'Botellas 1L Transparentes',
        category: 'packaging',
        stock: 30,
        minStock: 100,
        price: 12.00,
        unit: 'pzas',
        location: 'A2-005',
        status: 'active',
        supplier: 'Envases MX',
        description: 'Botellas transparentes de 1L para productos líquidos'
      },
      {
        name: 'Detergente Multiusos 1L',
        category: 'finished_product',
        stock: 200,
        minStock: 50,
        price: 25.00,
        unit: 'unidades',
        location: 'B1-010',
        status: 'active',
        supplier: 'Producción Ninu',
        description: 'Detergente multiusos de 1L para limpieza general'
      },
      {
        name: 'Ácido Cítrico',
        category: 'raw_material',
        stock: 25,
        minStock: 50,
        price: 85.00,
        unit: 'kg',
        location: 'A1-030',
        status: 'active',
        supplier: 'Química Industrial MX',
        description: 'Ácido cítrico para formulaciones'
      },
      {
        name: 'Colorante Azul',
        category: 'raw_material',
        stock: 8,
        minStock: 15,
        price: 220.00,
        unit: 'L',
        location: 'A1-045',
        status: 'active',
        supplier: 'Colorantes Especializados',
        description: 'Colorante azul para productos de limpieza'
      }
    ];

    for (const item of mockData) {
      await query(`
        INSERT INTO inventory_items (
          name, category, stock, min_stock, price, unit, location, status, supplier, description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        item.name,
        item.category,
        item.stock,
        item.minStock,
        item.price,
        item.unit,
        item.location,
        item.status,
        item.supplier,
        item.description
      ]);
    }

    console.log('✅ Inventory table seeded with mock data');
  }
}