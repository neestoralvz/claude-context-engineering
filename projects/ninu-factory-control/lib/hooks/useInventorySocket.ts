// Real-time inventory tracking hooks for Ninu.mx Factory Control System
'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Type definitions for inventory data
interface InventoryItem {
  id: string;
  material_code: string;
  material_name: string;
  unit_of_measure: string;
  location_name: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  unit_cost?: number;
  total_value?: number;
  stock_status: 'normal' | 'low' | 'critical' | 'out_of_stock';
  last_updated: string;
}

interface StockAlert {
  material_id: string;
  material_code: string;
  material_name: string;
  location_name: string;
  quantity_available: number;
  reorder_point: number;
  minimum_stock: number;
  alert_level: 'low' | 'critical' | 'out_of_stock';
  last_updated: string;
}

interface InventoryTransaction {
  id: string;
  transaction_type: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'production';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  created_at: string;
  material_code: string;
  material_name: string;
  unit_of_measure: string;
  location_name: string;
  created_by_username?: string;
}

interface InventoryStats {
  total_materials: number;
  total_locations: number;
  total_value: number;
  critical_items: number;
  low_stock_items: number;
  normal_items: number;
}

interface UseInventorySocketReturn {
  // Connection state
  isConnected: boolean;
  socket: Socket | null;
  
  // Inventory data
  inventorySummary: InventoryItem[];
  stockAlerts: StockAlert[];
  inventoryStats: InventoryStats;
  recentTransactions: InventoryTransaction[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  requestInventoryUpdate: () => void;
  requestStockAlerts: () => void;
  requestInventoryStats: () => void;
  requestRecentTransactions: (limit?: number) => void;
  createTransaction: (data: {
    materialId: string;
    locationId: string;
    transactionType: 'receipt' | 'issue' | 'adjustment';
    quantity: number;
    unitCost?: number;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  // Event handlers
  onInventoryUpdate: (callback: (data: InventoryItem[]) => void) => void;
  onStockAlert: (callback: (data: StockAlert[]) => void) => void;
  onNewTransaction: (callback: (data: InventoryTransaction) => void) => void;
}

// Main hook for inventory socket connection
export function useInventorySocket(): UseInventorySocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Inventory data state
  const [inventorySummary, setInventorySummary] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    total_materials: 0,
    total_locations: 0,
    total_value: 0,
    critical_items: 0,
    low_stock_items: 0,
    normal_items: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<InventoryTransaction[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
    
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Connected to inventory WebSocket server');
      setIsConnected(true);
      setIsLoading(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from inventory WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
      setIsLoading(false);
    });

    // Inventory data event handlers
    socketInstance.on('inventory:summary', (data: InventoryItem[]) => {
      setInventorySummary(data);
    });

    socketInstance.on('inventory:alerts', (data: StockAlert[]) => {
      setStockAlerts(data);
    });

    socketInstance.on('inventory:stats', (data: InventoryStats) => {
      setInventoryStats(data);
    });

    socketInstance.on('inventory:transactions', (data: InventoryTransaction[]) => {
      setRecentTransactions(data);
    });

    socketInstance.on('inventory:transaction:new', (data: InventoryTransaction) => {
      setRecentTransactions(prev => [data, ...prev.slice(0, 9)]);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Request functions
  const requestInventoryUpdate = useCallback(() => {
    if (socket) {
      socket.emit('inventory:request:summary');
    }
  }, [socket]);

  const requestStockAlerts = useCallback(() => {
    if (socket) {
      socket.emit('inventory:request:alerts');
    }
  }, [socket]);

  const requestInventoryStats = useCallback(() => {
    if (socket) {
      socket.emit('inventory:request:stats');
    }
  }, [socket]);

  const requestRecentTransactions = useCallback((limit: number = 10) => {
    if (socket) {
      socket.emit('inventory:request:transactions', { limit });
    }
  }, [socket]);

  // Create transaction function
  const createTransaction = useCallback(async (data: {
    materialId: string;
    locationId: string;
    transactionType: 'receipt' | 'issue' | 'adjustment';
    quantity: number;
    unitCost?: number;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      // Set up one-time listener for response
      socket.once('inventory:transaction:created', (response: { success: boolean; error?: string }) => {
        resolve(response);
      });

      // Send transaction request
      socket.emit('inventory:transaction:create', data);
    });
  }, [socket]);

  // Event handler registration functions
  const onInventoryUpdate = useCallback((callback: (data: InventoryItem[]) => void) => {
    if (socket) {
      socket.on('inventory:summary', callback);
      return () => socket.off('inventory:summary', callback);
    }
  }, [socket]);

  const onStockAlert = useCallback((callback: (data: StockAlert[]) => void) => {
    if (socket) {
      socket.on('inventory:alerts', callback);
      return () => socket.off('inventory:alerts', callback);
    }
  }, [socket]);

  const onNewTransaction = useCallback((callback: (data: InventoryTransaction) => void) => {
    if (socket) {
      socket.on('inventory:transaction:new', callback);
      return () => socket.off('inventory:transaction:new', callback);
    }
  }, [socket]);

  return {
    isConnected,
    socket,
    inventorySummary,
    stockAlerts,
    inventoryStats,
    recentTransactions,
    isLoading,
    requestInventoryUpdate,
    requestStockAlerts,
    requestInventoryStats,
    requestRecentTransactions,
    createTransaction,
    onInventoryUpdate,
    onStockAlert,
    onNewTransaction,
  };
}

// Hook for inventory statistics
export function useInventoryStats() {
  const { inventoryStats, requestInventoryStats, isConnected } = useInventorySocket();

  useEffect(() => {
    if (isConnected) {
      requestInventoryStats();
    }
  }, [isConnected, requestInventoryStats]);

  return {
    stats: inventoryStats,
    refresh: requestInventoryStats,
    isConnected,
  };
}

// Hook for stock alerts
export function useStockAlerts() {
  const { stockAlerts, requestStockAlerts, isConnected } = useInventorySocket();

  useEffect(() => {
    if (isConnected) {
      requestStockAlerts();
    }
  }, [isConnected, requestStockAlerts]);

  return {
    alerts: stockAlerts,
    refresh: requestStockAlerts,
    isConnected,
    criticalCount: stockAlerts.filter(alert => alert.alert_level === 'critical').length,
    lowStockCount: stockAlerts.filter(alert => alert.alert_level === 'low').length,
    outOfStockCount: stockAlerts.filter(alert => alert.alert_level === 'out_of_stock').length,
  };
}

// Hook for recent transactions
export function useRecentTransactions(limit: number = 10) {
  const { recentTransactions, requestRecentTransactions, isConnected } = useInventorySocket();

  useEffect(() => {
    if (isConnected) {
      requestRecentTransactions(limit);
    }
  }, [isConnected, requestRecentTransactions, limit]);

  return {
    transactions: recentTransactions,
    refresh: () => requestRecentTransactions(limit),
    isConnected,
  };
}

// Hook for inventory summary with filtering
export function useInventorySummary(filters?: {
  stockStatus?: 'normal' | 'low' | 'critical' | 'out_of_stock';
  locationName?: string;
  materialName?: string;
}) {
  const { inventorySummary, requestInventoryUpdate, isConnected } = useInventorySocket();

  useEffect(() => {
    if (isConnected) {
      requestInventoryUpdate();
    }
  }, [isConnected, requestInventoryUpdate]);

  const filteredSummary = inventorySummary.filter(item => {
    if (filters?.stockStatus && item.stock_status !== filters.stockStatus) {
      return false;
    }
    if (filters?.locationName && !item.location_name.toLowerCase().includes(filters.locationName.toLowerCase())) {
      return false;
    }
    if (filters?.materialName && !item.material_name.toLowerCase().includes(filters.materialName.toLowerCase())) {
      return false;
    }
    return true;
  });

  return {
    inventory: filteredSummary,
    allInventory: inventorySummary,
    refresh: requestInventoryUpdate,
    isConnected,
    totalItems: filteredSummary.length,
    totalValue: filteredSummary.reduce((sum, item) => sum + (item.total_value || 0), 0),
  };
}

// Export types for use in components
export type {
  InventoryItem,
  StockAlert,
  InventoryTransaction,
  InventoryStats,
  UseInventorySocketReturn,
};