// Inventory management models and services for Ninu.mx Factory Control System
import { query, transaction, DatabaseOperations } from '../database';
import { PoolClient } from 'pg';

// Type definitions for inventory system
export interface RawMaterial {
  id: string;
  company_id: string;
  supplier_id?: string;
  material_code: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  standard_cost?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_point?: number;
  lead_time_days?: number;
  is_hazardous?: boolean;
  safety_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryLocation {
  id: string;
  company_id: string;
  code: string;
  name: string;
  location_type: 'warehouse' | 'production' | 'staging' | 'quality';
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryLevel {
  id: string;
  company_id: string;
  material_id: string;
  location_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  unit_cost?: number;
  last_updated: Date;
  updated_by?: string;
}

export interface InventoryTransaction {
  id: string;
  company_id: string;
  material_id: string;
  location_id: string;
  transaction_type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'production';
  reference_type?: string;
  reference_id?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  created_by?: string;
  created_at: Date;
}

export interface InventorySummary {
  id: string;
  company_id: string;
  material_code: string;
  material_name: string;
  unit_of_measure: string;
  location_name: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  unit_cost?: number;
  total_value?: number;
  stock_status: 'normal' | 'low' | 'critical';
  last_updated: Date;
}

export interface StockAlert {
  material_id: string;
  material_code: string;
  material_name: string;
  location_name: string;
  quantity_available: number;
  reorder_point: number;
  minimum_stock: number;
  alert_level: 'low' | 'critical' | 'out_of_stock';
  days_until_stockout?: number;
}

// Raw Materials Service
export class RawMaterialsService {
  static async getAll(companyId: string): Promise<RawMaterial[]> {
    const result = await query<RawMaterial>(`
      SELECT * FROM raw_materials 
      WHERE company_id = $1 AND is_active = true
      ORDER BY name
    `, [companyId]);
    return result.rows;
  }

  static async getById(id: string): Promise<RawMaterial | null> {
    const result = await query<RawMaterial>(`
      SELECT * FROM raw_materials WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Partial<RawMaterial>): Promise<RawMaterial> {
    const result = await query<RawMaterial>(`
      INSERT INTO raw_materials (
        company_id, material_code, name, description, unit_of_measure,
        standard_cost, minimum_stock, maximum_stock, reorder_point,
        lead_time_days, is_hazardous, safety_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      data.company_id,
      data.material_code,
      data.name,
      data.description,
      data.unit_of_measure,
      data.standard_cost,
      data.minimum_stock,
      data.maximum_stock,
      data.reorder_point,
      data.lead_time_days,
      data.is_hazardous,
      data.safety_notes
    ]);
    return result.rows[0];
  }

  static async update(id: string, data: Partial<RawMaterial>): Promise<RawMaterial | null> {
    return DatabaseOperations.update('raw_materials', id, data);
  }

  static async delete(id: string): Promise<boolean> {
    return DatabaseOperations.delete('raw_materials', id);
  }

  static async searchByName(companyId: string, searchTerm: string): Promise<RawMaterial[]> {
    const result = await query<RawMaterial>(`
      SELECT * FROM raw_materials 
      WHERE company_id = $1 AND is_active = true
      AND (name ILIKE $2 OR material_code ILIKE $2)
      ORDER BY name
    `, [companyId, `%${searchTerm}%`]);
    return result.rows;
  }
}

// Inventory Locations Service
export class InventoryLocationsService {
  static async getAll(companyId: string): Promise<InventoryLocation[]> {
    const result = await query<InventoryLocation>(`
      SELECT * FROM inventory_locations 
      WHERE company_id = $1 AND is_active = true
      ORDER BY name
    `, [companyId]);
    return result.rows;
  }

  static async getById(id: string): Promise<InventoryLocation | null> {
    return DatabaseOperations.findById('inventory_locations', id);
  }

  static async create(data: Partial<InventoryLocation>): Promise<InventoryLocation> {
    return DatabaseOperations.insert('inventory_locations', data);
  }

  static async update(id: string, data: Partial<InventoryLocation>): Promise<InventoryLocation | null> {
    return DatabaseOperations.update('inventory_locations', id, data);
  }

  static async delete(id: string): Promise<boolean> {
    return DatabaseOperations.delete('inventory_locations', id);
  }
}

// Inventory Levels Service
export class InventoryLevelsService {
  static async getAll(companyId: string): Promise<InventorySummary[]> {
    const result = await query<InventorySummary>(`
      SELECT * FROM v_inventory_summary 
      WHERE company_id = $1
      ORDER BY material_name, location_name
    `, [companyId]);
    return result.rows;
  }

  static async getByMaterial(materialId: string): Promise<InventoryLevel[]> {
    const result = await query<InventoryLevel>(`
      SELECT * FROM inventory_levels 
      WHERE material_id = $1
      ORDER BY location_id
    `, [materialId]);
    return result.rows;
  }

  static async getByLocation(locationId: string): Promise<InventoryLevel[]> {
    const result = await query<InventoryLevel>(`
      SELECT * FROM inventory_levels 
      WHERE location_id = $1
      ORDER BY material_id
    `, [locationId]);
    return result.rows;
  }

  static async updateLevel(
    materialId: string,
    locationId: string,
    quantityOnHand: number,
    unitCost?: number,
    updatedBy?: string
  ): Promise<InventoryLevel> {
    const result = await query<InventoryLevel>(`
      INSERT INTO inventory_levels (material_id, location_id, quantity_on_hand, unit_cost, updated_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (material_id, location_id)
      DO UPDATE SET 
        quantity_on_hand = $3,
        unit_cost = COALESCE($4, inventory_levels.unit_cost),
        updated_by = $5,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `, [materialId, locationId, quantityOnHand, unitCost, updatedBy]);
    return result.rows[0];
  }

  static async reserveQuantity(
    materialId: string,
    locationId: string,
    quantity: number
  ): Promise<boolean> {
    const result = await query(`
      UPDATE inventory_levels 
      SET quantity_reserved = quantity_reserved + $3
      WHERE material_id = $1 AND location_id = $2
      AND quantity_available >= $3
      RETURNING *
    `, [materialId, locationId, quantity]);
    return result.rowCount > 0;
  }

  static async releaseReservedQuantity(
    materialId: string,
    locationId: string,
    quantity: number
  ): Promise<boolean> {
    const result = await query(`
      UPDATE inventory_levels 
      SET quantity_reserved = GREATEST(0, quantity_reserved - $3)
      WHERE material_id = $1 AND location_id = $2
      RETURNING *
    `, [materialId, locationId, quantity]);
    return result.rowCount > 0;
  }

  static async getStockAlerts(companyId: string): Promise<StockAlert[]> {
    const result = await query<StockAlert>(`
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
        END as alert_level
      FROM inventory_levels il
      JOIN raw_materials rm ON il.material_id = rm.id
      JOIN inventory_locations loc ON il.location_id = loc.id
      WHERE rm.company_id = $1 
      AND rm.is_active = true
      AND loc.is_active = true
      AND il.quantity_available <= rm.reorder_point
      ORDER BY alert_level, material_name
    `, [companyId]);
    return result.rows;
  }
}

// Inventory Transactions Service
export class InventoryTransactionsService {
  static async getAll(companyId: string, limit: number = 100): Promise<InventoryTransaction[]> {
    const result = await query<InventoryTransaction>(`
      SELECT it.*, rm.name as material_name, rm.material_code, loc.name as location_name
      FROM inventory_transactions it
      JOIN raw_materials rm ON it.material_id = rm.id
      JOIN inventory_locations loc ON it.location_id = loc.id
      WHERE it.company_id = $1
      ORDER BY it.created_at DESC
      LIMIT $2
    `, [companyId, limit]);
    return result.rows;
  }

  static async getByMaterial(materialId: string, limit: number = 50): Promise<InventoryTransaction[]> {
    const result = await query<InventoryTransaction>(`
      SELECT it.*, loc.name as location_name
      FROM inventory_transactions it
      JOIN inventory_locations loc ON it.location_id = loc.id
      WHERE it.material_id = $1
      ORDER BY it.created_at DESC
      LIMIT $2
    `, [materialId, limit]);
    return result.rows;
  }

  static async createTransaction(data: Partial<InventoryTransaction>): Promise<InventoryTransaction> {
    return transaction(async (client: PoolClient) => {
      // Insert the transaction
      const result = await client.query<InventoryTransaction>(`
        INSERT INTO inventory_transactions (
          company_id, material_id, location_id, transaction_type,
          reference_type, reference_id, quantity, unit_cost,
          total_cost, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        data.company_id,
        data.material_id,
        data.location_id,
        data.transaction_type,
        data.reference_type,
        data.reference_id,
        data.quantity,
        data.unit_cost,
        data.total_cost,
        data.notes,
        data.created_by
      ]);

      const transaction = result.rows[0];

      // Update inventory levels based on transaction type
      if (data.transaction_type === 'receipt' || data.transaction_type === 'adjustment') {
        await client.query(`
          INSERT INTO inventory_levels (material_id, location_id, quantity_on_hand, unit_cost, updated_by)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (material_id, location_id)
          DO UPDATE SET 
            quantity_on_hand = inventory_levels.quantity_on_hand + $3,
            unit_cost = COALESCE($4, inventory_levels.unit_cost),
            updated_by = $5,
            last_updated = CURRENT_TIMESTAMP
        `, [data.material_id, data.location_id, data.quantity, data.unit_cost, data.created_by]);
      } else if (data.transaction_type === 'issue' || data.transaction_type === 'production') {
        await client.query(`
          UPDATE inventory_levels 
          SET 
            quantity_on_hand = GREATEST(0, quantity_on_hand - $3),
            updated_by = $4,
            last_updated = CURRENT_TIMESTAMP
          WHERE material_id = $1 AND location_id = $2
        `, [data.material_id, data.location_id, Math.abs(data.quantity || 0), data.created_by]);
      }

      return transaction;
    });
  }

  static async transferMaterial(
    materialId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string,
    createdBy?: string
  ): Promise<{ success: boolean; transactions: InventoryTransaction[] }> {
    return transaction(async (client: PoolClient) => {
      // Check if enough quantity is available
      const availableResult = await client.query<{ quantity_available: number }>(`
        SELECT quantity_available 
        FROM inventory_levels 
        WHERE material_id = $1 AND location_id = $2
      `, [materialId, fromLocationId]);

      if (!availableResult.rows[0] || availableResult.rows[0].quantity_available < quantity) {
        throw new Error('Insufficient quantity available for transfer');
      }

      // Create issue transaction (from location)
      const issueResult = await client.query<InventoryTransaction>(`
        INSERT INTO inventory_transactions (
          material_id, location_id, transaction_type, reference_type,
          quantity, notes, created_by
        ) VALUES ($1, $2, 'issue', 'transfer', $3, $4, $5)
        RETURNING *
      `, [materialId, fromLocationId, -quantity, notes, createdBy]);

      // Create receipt transaction (to location)
      const receiptResult = await client.query<InventoryTransaction>(`
        INSERT INTO inventory_transactions (
          material_id, location_id, transaction_type, reference_type,
          quantity, notes, created_by
        ) VALUES ($1, $2, 'receipt', 'transfer', $3, $4, $5)
        RETURNING *
      `, [materialId, toLocationId, quantity, notes, createdBy]);

      // Update inventory levels
      await client.query(`
        UPDATE inventory_levels 
        SET quantity_on_hand = quantity_on_hand - $3, last_updated = CURRENT_TIMESTAMP
        WHERE material_id = $1 AND location_id = $2
      `, [materialId, fromLocationId, quantity]);

      await client.query(`
        INSERT INTO inventory_levels (material_id, location_id, quantity_on_hand, updated_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (material_id, location_id)
        DO UPDATE SET 
          quantity_on_hand = inventory_levels.quantity_on_hand + $3,
          updated_by = $4,
          last_updated = CURRENT_TIMESTAMP
      `, [materialId, toLocationId, quantity, createdBy]);

      return {
        success: true,
        transactions: [issueResult.rows[0], receiptResult.rows[0]]
      };
    });
  }
}

// Inventory Analytics Service
export class InventoryAnalyticsService {
  static async getInventoryValue(companyId: string): Promise<{ total_value: number; by_location: any[] }> {
    const totalResult = await query<{ total_value: number }>(`
      SELECT COALESCE(SUM(quantity_available * unit_cost), 0) as total_value
      FROM inventory_levels il
      JOIN raw_materials rm ON il.material_id = rm.id
      WHERE rm.company_id = $1 AND rm.is_active = true
    `, [companyId]);

    const byLocationResult = await query<{ location_name: string; total_value: number }>(`
      SELECT 
        loc.name as location_name,
        COALESCE(SUM(il.quantity_available * il.unit_cost), 0) as total_value
      FROM inventory_levels il
      JOIN raw_materials rm ON il.material_id = rm.id
      JOIN inventory_locations loc ON il.location_id = loc.id
      WHERE rm.company_id = $1 AND rm.is_active = true AND loc.is_active = true
      GROUP BY loc.name
      ORDER BY total_value DESC
    `, [companyId]);

    return {
      total_value: totalResult.rows[0].total_value,
      by_location: byLocationResult.rows
    };
  }

  static async getTopMaterialsByValue(companyId: string, limit: number = 10): Promise<any[]> {
    const result = await query(`
      SELECT 
        rm.name as material_name,
        rm.material_code,
        SUM(il.quantity_available) as total_quantity,
        rm.unit_of_measure,
        AVG(il.unit_cost) as avg_unit_cost,
        SUM(il.quantity_available * il.unit_cost) as total_value
      FROM inventory_levels il
      JOIN raw_materials rm ON il.material_id = rm.id
      WHERE rm.company_id = $1 AND rm.is_active = true
      GROUP BY rm.id, rm.name, rm.material_code, rm.unit_of_measure
      ORDER BY total_value DESC
      LIMIT $2
    `, [companyId, limit]);
    return result.rows;
  }

  static async getMovementAnalysis(companyId: string, days: number = 30): Promise<any[]> {
    const result = await query(`
      SELECT 
        rm.name as material_name,
        rm.material_code,
        COUNT(it.id) as transaction_count,
        SUM(CASE WHEN it.transaction_type IN ('receipt', 'adjustment') AND it.quantity > 0 THEN it.quantity ELSE 0 END) as total_receipts,
        SUM(CASE WHEN it.transaction_type IN ('issue', 'production') OR it.quantity < 0 THEN ABS(it.quantity) ELSE 0 END) as total_issues,
        AVG(il.quantity_available) as avg_stock_level
      FROM inventory_transactions it
      JOIN raw_materials rm ON it.material_id = rm.id
      LEFT JOIN inventory_levels il ON it.material_id = il.material_id
      WHERE rm.company_id = $1 
      AND it.created_at >= CURRENT_DATE - INTERVAL '$2 days'
      GROUP BY rm.id, rm.name, rm.material_code
      ORDER BY transaction_count DESC
    `, [companyId, days]);
    return result.rows;
  }
}

// Export all services and types
export {
  RawMaterialsService,
  InventoryLocationsService,
  InventoryLevelsService,
  InventoryTransactionsService,
  InventoryAnalyticsService
};