-- Ninu.mx Factory Control - PostgreSQL Database Schema
-- Comprehensive inventory management system for cleaning products manufacturing

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Companies table for multi-tenant support
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mexico',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication and authorization
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'operator',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PRODUCT CATALOG
-- ==========================================

-- Product categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products master table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_type VARCHAR(50) NOT NULL, -- 'liquid', 'powder', 'gel', 'concentrate'
    unit_of_measure VARCHAR(20) NOT NULL, -- 'L', 'kg', 'pieces', 'ml'
    standard_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    cofepris_approval VARCHAR(100),
    cofepris_expiry DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product formulations and recipes
CREATE TABLE product_formulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    formula_name VARCHAR(255),
    batch_size DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, version)
);

-- ==========================================
-- INVENTORY MANAGEMENT
-- ==========================================

-- Raw materials and ingredients
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID,
    material_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) NOT NULL,
    standard_cost DECIMAL(10,2),
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    maximum_stock DECIMAL(10,2),
    reorder_point DECIMAL(10,2),
    lead_time_days INTEGER DEFAULT 7,
    is_hazardous BOOLEAN DEFAULT false,
    safety_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory locations and warehouses
CREATE TABLE inventory_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL, -- 'warehouse', 'production', 'staging', 'quality'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Current inventory levels
CREATE TABLE inventory_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    location_id UUID REFERENCES inventory_locations(id) ON DELETE CASCADE,
    quantity_on_hand DECIMAL(10,2) DEFAULT 0,
    quantity_reserved DECIMAL(10,2) DEFAULT 0,
    quantity_available DECIMAL(10,2) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    unit_cost DECIMAL(10,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    UNIQUE(material_id, location_id)
);

-- Inventory transactions log
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    location_id UUID REFERENCES inventory_locations(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'receipt', 'issue', 'transfer', 'adjustment', 'production'
    reference_type VARCHAR(50), -- 'purchase_order', 'production_order', 'manual_adjustment'
    reference_id UUID,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PRODUCTION SYSTEM
-- ==========================================

-- Production reactors
CREATE TABLE reactors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    reactor_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity_liters DECIMAL(10,2) NOT NULL,
    reactor_type VARCHAR(50) NOT NULL, -- 'liquid', 'disinfectant', 'specialty'
    status VARCHAR(30) DEFAULT 'idle', -- 'idle', 'running', 'maintenance', 'error'
    current_temperature DECIMAL(5,2),
    target_temperature DECIMAL(5,2),
    current_pressure DECIMAL(5,2),
    target_pressure DECIMAL(5,2),
    mixing_speed_rpm INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production stations
CREATE TABLE production_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    station_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    station_type VARCHAR(50) NOT NULL, -- 'filling', 'labeling', 'packaging', 'powder', 'soap'
    capacity_per_hour DECIMAL(10,2),
    status VARCHAR(30) DEFAULT 'idle', -- 'idle', 'running', 'maintenance', 'error'
    current_efficiency DECIMAL(5,2),
    target_efficiency DECIMAL(5,2) DEFAULT 85.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production orders
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    formulation_id UUID REFERENCES product_formulations(id),
    reactor_id UUID REFERENCES reactors(id),
    quantity_planned DECIMAL(10,2) NOT NULL,
    quantity_produced DECIMAL(10,2) DEFAULT 0,
    quantity_approved DECIMAL(10,2) DEFAULT 0,
    quantity_rejected DECIMAL(10,2) DEFAULT 0,
    unit_of_measure VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
    priority INTEGER DEFAULT 5,
    planned_start_date TIMESTAMP WITH TIME ZONE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    planned_end_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production order materials consumption
CREATE TABLE production_order_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    quantity_required DECIMAL(10,2) NOT NULL,
    quantity_consumed DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- QUALITY CONTROL
-- ==========================================

-- Quality control tests
CREATE TABLE quality_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    test_code VARCHAR(50) UNIQUE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- 'chemical', 'physical', 'microbiological', 'visual'
    test_method TEXT,
    acceptable_range_min DECIMAL(10,4),
    acceptable_range_max DECIMAL(10,4),
    unit_of_measure VARCHAR(20),
    is_mandatory BOOLEAN DEFAULT false,
    cofepris_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quality control results
CREATE TABLE quality_control_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
    test_id UUID REFERENCES quality_tests(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    test_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    test_result DECIMAL(10,4),
    result_text TEXT,
    test_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'pass', 'fail', 'retest'
    tested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SUPPLIERS AND CUSTOMERS
-- ==========================================

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mexico',
    payment_terms VARCHAR(50),
    credit_limit DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    customer_type VARCHAR(50) NOT NULL, -- 'distributor', 'retailer', 'institutional', 'end_user'
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mexico',
    payment_terms VARCHAR(50),
    credit_limit DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ORDERS AND SALES
-- ==========================================

-- Sales orders
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_date DATE NOT NULL,
    required_date DATE,
    order_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'partial', 'paid', 'overdue'
    shipping_address TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales order line items
CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity_ordered DECIMAL(10,2) NOT NULL,
    quantity_shipped DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
    delivery_date DATE,
    line_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'in_production', 'ready', 'shipped', 'delivered'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- REAL-TIME MONITORING
-- ==========================================

-- System alerts and notifications
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'inventory_low', 'production_error', 'quality_fail', 'maintenance_due'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Real-time metrics snapshots
CREATE TABLE metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'production', 'inventory', 'quality', 'efficiency'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    unit_of_measure VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reactor_id UUID REFERENCES reactors(id),
    station_id UUID REFERENCES production_stations(id),
    production_order_id UUID REFERENCES production_orders(id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Primary business indexes
CREATE INDEX idx_inventory_levels_material_location ON inventory_levels(material_id, location_id);
CREATE INDEX idx_inventory_transactions_material_date ON inventory_transactions(material_id, created_at DESC);
CREATE INDEX idx_production_orders_status_date ON production_orders(status, planned_start_date);
CREATE INDEX idx_sales_orders_customer_date ON sales_orders(customer_id, order_date DESC);
CREATE INDEX idx_quality_results_order_test ON quality_control_results(production_order_id, test_id);

-- Performance indexes
CREATE INDEX idx_system_alerts_company_unread ON system_alerts(company_id, is_read, created_at DESC);
CREATE INDEX idx_metrics_snapshots_type_timestamp ON metrics_snapshots(metric_type, timestamp DESC);
CREATE INDEX idx_raw_materials_company_active ON raw_materials(company_id, is_active);
CREATE INDEX idx_products_company_active ON products(company_id, is_active);

-- Search indexes using pg_trgm
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);
CREATE INDEX idx_raw_materials_name_trgm ON raw_materials USING GIN(name gin_trgm_ops);
CREATE INDEX idx_customers_name_trgm ON customers USING GIN(name gin_trgm_ops);

-- ==========================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ==========================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers to all relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_levels_updated_at BEFORE UPDATE ON inventory_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reactors_updated_at BEFORE UPDATE ON reactors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_stations_updated_at BEFORE UPDATE ON production_stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INITIAL DATA SETUP
-- ==========================================

-- Insert default company (Ninu.mx)
INSERT INTO companies (id, name, legal_name, tax_id, address, city, state, country, phone, email, website)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ninu.mx',
    'Negocio de Innovación Utópica, S. de R.L. de C.V.',
    'NIU220101XXX',
    'Calle Innovación #123, Col. Utópica',
    'Xalapa-Enríquez',
    'Veracruz',
    'Mexico',
    '229-229-9399',
    'hola@ninu.mx',
    'https://ninu.mx'
);

-- Insert default product categories
INSERT INTO product_categories (name, description, sort_order) VALUES
('Desinfección', 'Productos desinfectantes y sanitizantes', 1),
('Limpieza', 'Productos de limpieza multiusos', 2),
('Higiene Personal', 'Productos de higiene y cuidado personal', 3),
('Automotriz', 'Productos especializados para vehículos', 4),
('Albercas', 'Productos para tratamiento de piscinas', 5),
('Alimentos', 'Productos para industria alimentaria', 6),
('Mascotas', 'Productos seguros para mascotas', 7),
('Especialidades', 'Productos especializados y únicos', 8);

-- Insert default inventory locations
INSERT INTO inventory_locations (company_id, code, name, location_type, description) VALUES
('00000000-0000-0000-0000-000000000001', 'WH001', 'Almacén Principal', 'warehouse', 'Almacén principal de materias primas'),
('00000000-0000-0000-0000-000000000001', 'PROD01', 'Área de Producción', 'production', 'Área de producción y reactores'),
('00000000-0000-0000-0000-000000000001', 'QC001', 'Control de Calidad', 'quality', 'Área de control de calidad'),
('00000000-0000-0000-0000-000000000001', 'STAGE', 'Área de Staging', 'staging', 'Área de preparación y empaque'),
('00000000-0000-0000-0000-000000000001', 'FG001', 'Producto Terminado', 'warehouse', 'Almacén de producto terminado');

-- Insert default reactors
INSERT INTO reactors (company_id, reactor_code, name, capacity_liters, reactor_type, target_temperature, target_pressure) VALUES
('00000000-0000-0000-0000-000000000001', 'RCT-A', 'Reactor A - Líquidos', 5000.00, 'liquid', 25.0, 1.0),
('00000000-0000-0000-0000-000000000001', 'RCT-B', 'Reactor B - Desinfectantes', 3000.00, 'disinfectant', 23.0, 1.0),
('00000000-0000-0000-0000-000000000001', 'RCT-C', 'Reactor C - Especialidades', 2000.00, 'specialty', 22.0, 1.0);

-- Insert default production stations
INSERT INTO production_stations (company_id, station_code, name, station_type, capacity_per_hour, target_efficiency) VALUES
('00000000-0000-0000-0000-000000000001', 'ST001', 'Estación Llenado', 'filling', 1000.00, 90.0),
('00000000-0000-0000-0000-000000000001', 'ST002', 'Estación Etiquetado Principal', 'labeling', 800.00, 85.0),
('00000000-0000-0000-0000-000000000001', 'ST003', 'Estación Etiquetado Secundario', 'labeling', 600.00, 85.0),
('00000000-0000-0000-0000-000000000001', 'ST004', 'Estación Polvos', 'powder', 500.00, 80.0),
('00000000-0000-0000-0000-000000000001', 'ST005', 'Estación Jabones', 'soap', 400.00, 82.0);

-- Insert default quality tests
INSERT INTO quality_tests (company_id, test_code, test_name, test_type, acceptable_range_min, acceptable_range_max, unit_of_measure, is_mandatory, cofepris_required) VALUES
('00000000-0000-0000-0000-000000000001', 'PH001', 'pH del Producto', 'chemical', 6.5, 8.5, 'pH', true, true),
('00000000-0000-0000-0000-000000000001', 'DENS01', 'Densidad', 'physical', 0.95, 1.05, 'g/ml', true, false),
('00000000-0000-0000-0000-000000000001', 'VISC01', 'Viscosidad', 'physical', 50.0, 200.0, 'cP', false, false),
('00000000-0000-0000-0000-000000000001', 'MICR01', 'Conteo Microbiano', 'microbiological', 0.0, 100.0, 'UFC/ml', true, true),
('00000000-0000-0000-0000-000000000001', 'VIS001', 'Inspección Visual', 'visual', null, null, 'pass/fail', true, false);

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- Inventory levels with material details
CREATE VIEW v_inventory_summary AS
SELECT 
    il.id,
    il.company_id,
    rm.material_code,
    rm.name as material_name,
    rm.unit_of_measure,
    loc.name as location_name,
    il.quantity_on_hand,
    il.quantity_reserved,
    il.quantity_available,
    il.unit_cost,
    il.quantity_available * il.unit_cost as total_value,
    CASE 
        WHEN il.quantity_available <= rm.reorder_point THEN 'low'
        WHEN il.quantity_available <= rm.minimum_stock THEN 'critical'
        ELSE 'normal'
    END as stock_status,
    il.last_updated
FROM inventory_levels il
JOIN raw_materials rm ON il.material_id = rm.id
JOIN inventory_locations loc ON il.location_id = loc.id
WHERE rm.is_active = true AND loc.is_active = true;

-- Production orders with details
CREATE VIEW v_production_orders_summary AS
SELECT 
    po.id,
    po.company_id,
    po.order_number,
    p.name as product_name,
    p.sku,
    po.quantity_planned,
    po.quantity_produced,
    po.quantity_approved,
    po.quantity_rejected,
    po.unit_of_measure,
    po.status,
    po.priority,
    r.name as reactor_name,
    po.planned_start_date,
    po.actual_start_date,
    po.planned_end_date,
    po.actual_end_date,
    CASE 
        WHEN po.status = 'completed' THEN 
            ROUND((po.quantity_produced / po.quantity_planned) * 100, 2)
        ELSE 0
    END as completion_percentage,
    po.created_at,
    po.updated_at
FROM production_orders po
JOIN products p ON po.product_id = p.id
LEFT JOIN reactors r ON po.reactor_id = r.id;

-- Real-time factory metrics
CREATE VIEW v_factory_metrics AS
SELECT 
    'reactors' as metric_category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'running' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'idle' THEN 1 END) as idle_count,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_count,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
    ROUND(AVG(current_temperature), 2) as avg_temperature,
    ROUND(AVG(current_pressure), 2) as avg_pressure
FROM reactors
WHERE is_active = true
UNION ALL
SELECT 
    'stations' as metric_category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'running' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'idle' THEN 1 END) as idle_count,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_count,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
    ROUND(AVG(current_efficiency), 2) as avg_temperature,
    ROUND(AVG(target_efficiency), 2) as avg_pressure
FROM production_stations
WHERE is_active = true;

-- Comment on the schema
COMMENT ON SCHEMA public IS 'Ninu.mx Factory Control System - PostgreSQL Database Schema for comprehensive inventory management, production control, and real-time monitoring';