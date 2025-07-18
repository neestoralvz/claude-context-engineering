import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryCard } from '../../../components/inventory/InventoryCard';
import { InventoryItem } from '../../../types';

const mockInventoryItem: InventoryItem = {
  id: '1',
  name: 'Tensioactivo Premium',
  type: 'raw_material',
  currentStock: 150,
  minStock: 50,
  maxStock: 300,
  unit: 'kg',
  cost: 45.50,
  supplier: 'QuimiPro S.A.',
  lastRestocked: new Date('2024-01-15'),
  expirationDate: new Date('2024-12-31')
};

describe('InventoryCard', () => {
  describe('Basic rendering', () => {
    it('should render inventory item name', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText('Tensioactivo Premium')).toBeInTheDocument();
    });

    it('should render item type correctly', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText('raw material')).toBeInTheDocument();
    });

    it('should render current stock with unit', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText('150 kg')).toBeInTheDocument();
    });

    it('should render cost formatted', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText('$45.50')).toBeInTheDocument();
    });

    it('should render supplier name', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText('QuimiPro S.A.')).toBeInTheDocument();
    });

    it('should render min and max stock values', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText('Min: 50')).toBeInTheDocument();
      expect(screen.getByText('Max: 300')).toBeInTheDocument();
    });

    it('should render last restocked date', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.getByText(/14\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Stock status rendering', () => {
    it('should show critical stock for items below minimum', () => {
      const criticalItem = { ...mockInventoryItem, currentStock: 30 };
      render(<InventoryCard inventoryItem={criticalItem} />);
      expect(screen.getByText('Stock Crítico')).toBeInTheDocument();
    });

    it('should show low stock for items slightly above minimum', () => {
      const lowStockItem = { ...mockInventoryItem, currentStock: 60 };
      render(<InventoryCard inventoryItem={lowStockItem} />);
      expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
    });

    it('should show normal stock for adequate levels', () => {
      const normalItem = { ...mockInventoryItem, currentStock: 150 };
      render(<InventoryCard inventoryItem={normalItem} />);
      expect(screen.getByText('Stock Normal')).toBeInTheDocument();
    });

    it('should show high stock for items near maximum', () => {
      const highStockItem = { ...mockInventoryItem, currentStock: 280 };
      render(<InventoryCard inventoryItem={highStockItem} />);
      expect(screen.getByText('Stock Alto')).toBeInTheDocument();
    });

    it('should calculate stock percentage correctly', () => {
      // Current: 150, Min: 50, Max: 300
      // Percentage = ((150-50)/(300-50)) * 100 = 40%
      const { container } = render(<InventoryCard inventoryItem={mockInventoryItem} />);
      const progressBar = container.querySelector('[style*="width: 40%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Expiration handling', () => {
    it('should show expiration warning for items expiring soon', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expiringItem = { ...mockInventoryItem, expirationDate: tomorrow };
      
      render(<InventoryCard inventoryItem={expiringItem} />);
      expect(screen.getByText('Caduca Pronto')).toBeInTheDocument();
    });

    it('should show expired status for past expiration date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expiredItem = { ...mockInventoryItem, expirationDate: yesterday };
      
      render(<InventoryCard inventoryItem={expiredItem} />);
      expect(screen.getByText('Caducado')).toBeInTheDocument();
    });

    it('should show review date for items expiring within 30 days', () => {
      const in20Days = new Date();
      in20Days.setDate(in20Days.getDate() + 20);
      const reviewItem = { ...mockInventoryItem, expirationDate: in20Days };
      
      render(<InventoryCard inventoryItem={reviewItem} />);
      expect(screen.getByText('Revise Fecha')).toBeInTheDocument();
    });

    it('should show valid status for items with long expiration', () => {
      const inOneYear = new Date();
      inOneYear.setFullYear(inOneYear.getFullYear() + 1);
      const validItem = { ...mockInventoryItem, expirationDate: inOneYear };
      
      render(<InventoryCard inventoryItem={validItem} />);
      expect(screen.getByText('Vigente')).toBeInTheDocument();
    });

    it('should not show expiration for non-expiring items', () => {
      const nonExpiringItem = { ...mockInventoryItem, expirationDate: undefined };
      render(<InventoryCard inventoryItem={nonExpiringItem} />);
      expect(screen.queryByText('Vencimiento')).not.toBeInTheDocument();
    });
  });

  describe('Type icons', () => {
    it('should show correct icon for raw materials', () => {
      const rawMaterial = { ...mockInventoryItem, type: 'raw_material' as const };
      render(<InventoryCard inventoryItem={rawMaterial} />);
      expect(screen.getByText('🧪')).toBeInTheDocument();
    });

    it('should show correct icon for packaging', () => {
      const packaging = { ...mockInventoryItem, type: 'packaging' as const };
      render(<InventoryCard inventoryItem={packaging} />);
      expect(screen.getByText('📦')).toBeInTheDocument();
    });

    it('should show correct icon for finished products', () => {
      const finishedProduct = { ...mockInventoryItem, type: 'finished_product' as const };
      render(<InventoryCard inventoryItem={finishedProduct} />);
      expect(screen.getByText('✅')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = jest.fn();
      render(<InventoryCard inventoryItem={mockInventoryItem} onClick={handleClick} />);
      
      fireEvent.click(screen.getByText('Tensioactivo Premium'));
      expect(handleClick).toHaveBeenCalledWith(mockInventoryItem);
    });

    it('should not show actions by default', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} />);
      expect(screen.queryByText('Ajustar Stock')).not.toBeInTheDocument();
      expect(screen.queryByText('Ver Historial')).not.toBeInTheDocument();
    });

    it('should show actions when showActions is true', () => {
      render(<InventoryCard inventoryItem={mockInventoryItem} showActions={true} />);
      expect(screen.getByText('Ajustar Stock')).toBeInTheDocument();
      expect(screen.getByText('Ver Historial')).toBeInTheDocument();
    });

    it('should apply hover styles when onClick is provided', () => {
      const { container } = render(
        <InventoryCard inventoryItem={mockInventoryItem} onClick={() => {}} />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero stock correctly', () => {
      const zeroStockItem = { ...mockInventoryItem, currentStock: 0 };
      render(<InventoryCard inventoryItem={zeroStockItem} />);
      expect(screen.getByText('0 kg')).toBeInTheDocument();
      expect(screen.getByText('Stock Crítico')).toBeInTheDocument();
    });

    it('should handle equal min and max stock', () => {
      const equalStockItem = { ...mockInventoryItem, minStock: 100, maxStock: 100 };
      render(<InventoryCard inventoryItem={equalStockItem} />);
      // Should not crash and show some reasonable display
      expect(screen.getByText('Min: 100')).toBeInTheDocument();
      expect(screen.getByText('Max: 100')).toBeInTheDocument();
    });

    it('should handle very long supplier names', () => {
      const longSupplierItem = { 
        ...mockInventoryItem, 
        supplier: 'Empresa de Productos Químicos Industriales Especializados S.A. de C.V.' 
      };
      const { container } = render(<InventoryCard inventoryItem={longSupplierItem} />);
      
      // Should truncate with CSS
      const supplierElement = screen.getByText(/Empresa de Productos/);
      expect(supplierElement).toHaveClass('truncate');
    });

    it('should handle large stock numbers', () => {
      const largeStockItem = { ...mockInventoryItem, currentStock: 1000000 };
      render(<InventoryCard inventoryItem={largeStockItem} />);
      expect(screen.getByText('1,000,000 kg')).toBeInTheDocument();
    });
  });
});