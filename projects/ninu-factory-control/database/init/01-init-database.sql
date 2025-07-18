-- Database Initialization Script for Ninu Factory Control System
-- Production-ready schema with security, performance, and compliance features

-- ================================
-- Database Configuration
-- ================================
SET timezone = 'America/Mexico_City';
SET TIME ZONE 'America/Mexico_City';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================
-- User Management & Security
-- ================================

-- Create roles
CREATE ROLE ninu_read_only;
CREATE ROLE ninu_app_user;
CREATE ROLE ninu_admin;

-- Create application user
CREATE USER ninu_app WITH PASSWORD 'ninu_app_secure_password_2024';
GRANT ninu_app_user TO ninu_app;

-- Create Grafana user
CREATE USER grafana_user WITH PASSWORD 'grafana_db_password_2024';
GRANT ninu_read_only TO grafana_user;

-- Create additional database for Grafana
CREATE DATABASE grafana OWNER grafana_user;

-- ================================
-- Core Tables
-- ================================

-- Users table with security features
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(20) DEFAULT 'liters',
    target_ph DECIMAL(3,1),
    target_density DECIMAL(5,3),
    shelf_life_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Raw materials table
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    supplier VARCHAR(255),
    unit_cost DECIMAL(10,2),
    unit_of_measure VARCHAR(20),
    minimum_stock DECIMAL(10,2),
    maximum_stock DECIMAL(10,2),
    current_stock DECIMAL(10,2) DEFAULT 0,
    safety_notes TEXT,
    is_hazardous BOOLEAN DEFAULT false,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Production stations table
CREATE TABLE production_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    station_type VARCHAR(50) CHECK (station_type IN ('mixing', 'filtering', 'packaging', 'quality_control')),
    capacity DECIMAL(10,2),
    is_operational BOOLEAN DEFAULT true,
    maintenance_schedule VARCHAR(255),
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Production batches table
CREATE TABLE production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    station_id UUID NOT NULL REFERENCES production_stations(id),
    target_quantity DECIMAL(10,2) NOT NULL,
    actual_quantity DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'quality_check', 'approved', 'rejected')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    quality_ph DECIMAL(3,1),
    quality_density DECIMAL(5,3),
    quality_notes TEXT,
    operator_id UUID REFERENCES users(id),
    supervisor_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Inventory movements table
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES raw_materials(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    reference_type VARCHAR(50), -- 'batch', 'purchase', 'adjustment'
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Quality control tests table
CREATE TABLE quality_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES production_batches(id),
    test_type VARCHAR(50) NOT NULL,
    test_value DECIMAL(10,3),
    expected_value DECIMAL(10,3),
    tolerance DECIMAL(10,3),
    passed BOOLEAN,
    test_notes TEXT,
    tested_by UUID REFERENCES users(id),
    tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production orders table
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'shipped', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    due_date DATE,
    total_amount DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Production order items table
CREATE TABLE production_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES production_orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    batch_id UUID REFERENCES production_batches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Audit & Compliance Tables
-- ================================

-- Audit log table for COFEPRISS compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security events table
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- Indexes for Performance
-- ================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Products indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);

-- Raw materials indexes
CREATE INDEX idx_raw_materials_code ON raw_materials(code);
CREATE INDEX idx_raw_materials_supplier ON raw_materials(supplier);
CREATE INDEX idx_raw_materials_stock ON raw_materials(current_stock);

-- Production batches indexes
CREATE INDEX idx_batches_number ON production_batches(batch_number);
CREATE INDEX idx_batches_status ON production_batches(status);
CREATE INDEX idx_batches_product ON production_batches(product_id);
CREATE INDEX idx_batches_station ON production_batches(station_id);
CREATE INDEX idx_batches_dates ON production_batches(start_time, end_time);

-- Inventory movements indexes
CREATE INDEX idx_inventory_material ON inventory_movements(material_id);
CREATE INDEX idx_inventory_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_date ON inventory_movements(created_at);

-- Quality tests indexes
CREATE INDEX idx_quality_batch ON quality_tests(batch_id);
CREATE INDEX idx_quality_type ON quality_tests(test_type);
CREATE INDEX idx_quality_date ON quality_tests(tested_at);

-- Production orders indexes
CREATE INDEX idx_orders_number ON production_orders(order_number);
CREATE INDEX idx_orders_status ON production_orders(status);
CREATE INDEX idx_orders_priority ON production_orders(priority);
CREATE INDEX idx_orders_due_date ON production_orders(due_date);

-- Audit logs indexes
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- Security events indexes
CREATE INDEX idx_security_type ON security_events(event_type);
CREATE INDEX idx_security_severity ON security_events(severity);
CREATE INDEX idx_security_timestamp ON security_events(created_at);

-- ================================
-- Triggers for Automatic Updates
-- ================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON production_stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- Audit Trigger Function
-- ================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true)::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_batches AFTER INSERT OR UPDATE OR DELETE ON production_batches FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory_movements FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ================================
-- Permissions
-- ================================

-- Grant permissions to read-only role
GRANT CONNECT ON DATABASE ninu_factory TO ninu_read_only;
GRANT USAGE ON SCHEMA public TO ninu_read_only;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ninu_read_only;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO ninu_read_only;

-- Grant permissions to app user role
GRANT CONNECT ON DATABASE ninu_factory TO ninu_app_user;
GRANT USAGE, CREATE ON SCHEMA public TO ninu_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ninu_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ninu_app_user;

-- Grant permissions to admin role
GRANT ALL PRIVILEGES ON DATABASE ninu_factory TO ninu_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO ninu_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ninu_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ninu_admin;

-- ================================
-- Initial Data
-- ================================

-- Create admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, role)
VALUES (
    uuid_generate_v4(),
    'admin@ninu-factory.com',
    crypt('AdminPassword2024!', gen_salt('bf')),
    'System',
    'Administrator',
    'admin'
);

-- Create sample products
INSERT INTO products (sku, name, description, category, unit_of_measure, target_ph, target_density) VALUES
('CLN-001', 'Limpiador Multiusos Premium', 'Limpiador concentrado para uso general', 'Limpiadores', 'liters', 7.0, 0.985),
('CLN-002', 'Desengrasante Industrial', 'Desengrasante de alta potencia', 'Industriales', 'liters', 8.5, 0.920),
('CLN-003', 'Jabón Líquido Antibacterial', 'Jabón líquido con propiedades antibacteriales', 'Higiene', 'liters', 6.5, 1.020);

-- Create sample raw materials
INSERT INTO raw_materials (code, name, supplier, unit_cost, unit_of_measure, minimum_stock, maximum_stock, current_stock) VALUES
('RM-001', 'Tensoactivo Base', 'Proveedor Químicos SA', 25.50, 'kg', 100, 500, 250),
('RM-002', 'Fragrancia Citrica', 'Esencias Mexicanas', 120.00, 'liters', 20, 100, 45),
('RM-003', 'Conservante E211', 'Química Industrial MX', 85.00, 'kg', 50, 200, 125);

-- Create sample production stations
INSERT INTO production_stations (station_code, name, station_type, capacity, maintenance_schedule) VALUES
('ST-001', 'Mezclador Principal A', 'mixing', 1000.00, 'Semanal'),
('ST-002', 'Filtro de Precision B', 'filtering', 500.00, 'Quincenal'),
('ST-003', 'Línea de Envasado C', 'packaging', 800.00, 'Mensual');

COMMIT;