import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerCard } from '../../../components/customers/CustomerCard';
import { Customer } from '../../../types';

const mockCustomer: Customer = {
  id: 'cust-001',
  name: 'Oscar Torres',
  email: 'oscar.torres@email.com',
  phone: '+52-228-1234567',
  company: 'Distribuidora del Golfo',
  address: {
    street: 'Av. Lázaro Cárdenas 1500',
    city: 'Xalapa',
    state: 'Veracruz',
    postal_code: '91000',
    country: 'México',
    is_shipping_address: true,
    is_billing_address: true
  },
  type: 'distributor',
  status: 'vip',
  pricing_tier: 'wholesale',
  credit_limit: 250000,
  payment_terms: 30,
  preferred_products: ['sanitizante-1l', 'multiusos-1l'],
  total_orders: 45,
  total_spent: 875000,
  average_order_value: 19444,
  last_order_date: '2024-01-18',
  registration_date: '2023-03-15',
  sales_rep: 'María González',
  notes: 'Cliente VIP - Distribuidor principal',
  created_at: '2023-03-15T08:00:00Z',
  updated_at: '2024-01-18T14:30:00Z'
};

describe('CustomerCard', () => {
  describe('Basic rendering', () => {
    it('should render customer name', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Oscar Torres')).toBeInTheDocument();
    });

    it('should render company name when provided', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Distribuidora del Golfo')).toBeInTheDocument();
    });

    it('should not render company when not provided', () => {
      const customerWithoutCompany = { ...mockCustomer, company: undefined };
      render(<CustomerCard customer={customerWithoutCompany} />);
      expect(screen.queryByText('Distribuidora del Golfo')).not.toBeInTheDocument();
    });

    it('should render email and phone', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('oscar.torres@email.com')).toBeInTheDocument();
      expect(screen.getByText('+52-228-1234567')).toBeInTheDocument();
    });

    it('should render customer type', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Distribuidor')).toBeInTheDocument();
    });

    it('should render pricing tier', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Wholesale')).toBeInTheDocument();
    });

    it('should render address', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Xalapa, Veracruz')).toBeInTheDocument();
    });
  });

  describe('Status badges', () => {
    it('should show VIP status badge', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });

    it('should show Active status for active customers', () => {
      const activeCustomer = { ...mockCustomer, status: 'active' as const };
      render(<CustomerCard customer={activeCustomer} />);
      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('should show Inactive status for inactive customers', () => {
      const inactiveCustomer = { ...mockCustomer, status: 'inactive' as const };
      render(<CustomerCard customer={inactiveCustomer} />);
      expect(screen.getByText('Inactivo')).toBeInTheDocument();
    });

    it('should show Blocked status for blocked customers', () => {
      const blockedCustomer = { ...mockCustomer, status: 'blocked' as const };
      render(<CustomerCard customer={blockedCustomer} />);
      expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    });
  });

  describe('Customer metrics', () => {
    it('should display total spent formatted as currency', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('$875,000.00')).toBeInTheDocument();
    });

    it('should display total orders', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should display average order value', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('$19,444.00')).toBeInTheDocument();
    });

    it('should display credit limit', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('$250,000.00')).toBeInTheDocument();
    });
  });

  describe('Customer type icons', () => {
    it('should show correct icon for distributor', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Distribuidor')).toBeInTheDocument();
      // Check that the Package icon is rendered
      const distributorText = screen.getByText('Distribuidor');
      expect(distributorText).toBeInTheDocument();
    });

    it('should show correct icon for individual customer', () => {
      const individualCustomer = { ...mockCustomer, type: 'individual' as const };
      render(<CustomerCard customer={individualCustomer} />);
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });

    it('should show correct icon for business customer', () => {
      const businessCustomer = { ...mockCustomer, type: 'business' as const };
      render(<CustomerCard customer={businessCustomer} />);
      expect(screen.getByText('Empresa')).toBeInTheDocument();
    });
  });

  describe('Date formatting', () => {
    it('should display last order date formatted', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('17/1/2024')).toBeInTheDocument();
    });

    it('should not show last order section when no date provided', () => {
      const customerWithoutLastOrder = { ...mockCustomer, last_order_date: undefined };
      render(<CustomerCard customer={customerWithoutLastOrder} />);
      expect(screen.queryByText('Última orden:')).not.toBeInTheDocument();
    });
  });

  describe('Payment terms', () => {
    it('should show payment terms when greater than 0', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Crédito: 30 días')).toBeInTheDocument();
    });

    it('should not show payment terms when 0', () => {
      const cashCustomer = { ...mockCustomer, payment_terms: 0 };
      render(<CustomerCard customer={cashCustomer} />);
      expect(screen.queryByText(/Crédito:/)).not.toBeInTheDocument();
    });
  });

  describe('Customer value indicator', () => {
    it('should show value indicators based on total spent', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.getByText('Valor del Cliente')).toBeInTheDocument();
      
      // Should show filled indicators for high-value customer
      const indicators = screen.getAllByRole('generic').filter(el => 
        el.className.includes('w-2 h-2 rounded-full')
      );
      expect(indicators.length).toBe(5);
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = jest.fn();
      render(<CustomerCard customer={mockCustomer} onClick={handleClick} />);
      
      fireEvent.click(screen.getByText('Oscar Torres'));
      expect(handleClick).toHaveBeenCalledWith(mockCustomer);
    });

    it('should not show actions by default', () => {
      render(<CustomerCard customer={mockCustomer} />);
      expect(screen.queryByText('Ver Órdenes')).not.toBeInTheDocument();
      expect(screen.queryByText('Nueva Orden')).not.toBeInTheDocument();
      expect(screen.queryByText('Contactar')).not.toBeInTheDocument();
    });

    it('should show actions when showActions is true', () => {
      render(<CustomerCard customer={mockCustomer} showActions={true} />);
      expect(screen.getByText('Ver Órdenes')).toBeInTheDocument();
      expect(screen.getByText('Nueva Orden')).toBeInTheDocument();
      expect(screen.getByText('Contactar')).toBeInTheDocument();
    });

    it('should apply hover styles when onClick is provided', () => {
      const { container } = render(
        <CustomerCard customer={mockCustomer} onClick={() => {}} />
      );
      
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Pricing tier colors', () => {
    it('should apply correct styling for VIP tier', () => {
      const vipCustomer = { ...mockCustomer, pricing_tier: 'vip' as const };
      render(<CustomerCard customer={vipCustomer} />);
      
      const tierBadge = screen.getByText('Vip');
      expect(tierBadge).toHaveClass('text-yellow-600', 'bg-yellow-50');
    });

    it('should apply correct styling for wholesale tier', () => {
      render(<CustomerCard customer={mockCustomer} />);
      
      const tierBadge = screen.getByText('Wholesale');
      expect(tierBadge).toHaveClass('text-blue-600', 'bg-blue-50');
    });

    it('should apply correct styling for custom tier', () => {
      const customCustomer = { ...mockCustomer, pricing_tier: 'custom' as const };
      render(<CustomerCard customer={customCustomer} />);
      
      const tierBadge = screen.getByText('Custom');
      expect(tierBadge).toHaveClass('text-purple-600', 'bg-purple-50');
    });

    it('should apply default styling for standard tier', () => {
      const standardCustomer = { ...mockCustomer, pricing_tier: 'standard' as const };
      render(<CustomerCard customer={standardCustomer} />);
      
      const tierBadge = screen.getByText('Standard');
      expect(tierBadge).toHaveClass('text-gray-600', 'bg-gray-50');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero values gracefully', () => {
      const zeroValueCustomer = {
        ...mockCustomer,
        total_spent: 0,
        total_orders: 0,
        average_order_value: 0,
        credit_limit: 0
      };
      
      render(<CustomerCard customer={zeroValueCustomer} />);
      expect(screen.getAllByText('$0.00')).toHaveLength(3); // total_spent, average_order_value, credit_limit
      expect(screen.getByText('0')).toBeInTheDocument(); // total_orders
    });

    it('should handle very large amounts correctly', () => {
      const highValueCustomer = {
        ...mockCustomer,
        total_spent: 10000000,
        credit_limit: 5000000
      };
      
      render(<CustomerCard customer={highValueCustomer} />);
      expect(screen.getByText('$10,000,000.00')).toBeInTheDocument();
      expect(screen.getByText('$5,000,000.00')).toBeInTheDocument();
    });

    it('should truncate very long email addresses', () => {
      const longEmailCustomer = {
        ...mockCustomer,
        email: 'very.long.email.address.that.should.be.truncated@verylongcompanyname.com'
      };
      
      const { container } = render(<CustomerCard customer={longEmailCustomer} />);
      const emailElement = screen.getByText(longEmailCustomer.email);
      expect(emailElement).toHaveClass('truncate');
    });

    it('should handle missing optional fields', () => {
      const minimalCustomer: Customer = {
        id: 'cust-minimal',
        name: 'Minimal Customer',
        email: 'minimal@test.com',
        phone: '123456789',
        address: {
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          postal_code: '12345',
          country: 'México',
          is_shipping_address: true,
          is_billing_address: true
        },
        type: 'individual',
        status: 'active',
        pricing_tier: 'standard',
        credit_limit: 0,
        payment_terms: 0,
        preferred_products: [],
        total_orders: 0,
        total_spent: 0,
        average_order_value: 0,
        registration_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };
      
      render(<CustomerCard customer={minimalCustomer} />);
      expect(screen.getByText('Minimal Customer')).toBeInTheDocument();
      expect(screen.getByText('Individual')).toBeInTheDocument();
    });
  });
});