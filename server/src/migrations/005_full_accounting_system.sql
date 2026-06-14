-- ============================================================
-- PLAN DE CUENTAS (Chart of Accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS account_charts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  level INTEGER NOT NULL DEFAULT 1,
  parent_id INTEGER REFERENCES account_charts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TERCEROS (Clients, Suppliers, Employees)
-- ============================================================
CREATE TABLE IF NOT EXISTS third_parties (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('client', 'supplier', 'employee', 'other')),
  document_type VARCHAR(10) NOT NULL DEFAULT 'NIT',
  document_number VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_type, document_number)
);

-- ============================================================
-- CENTROS DE COSTO (Cost Centers)
-- ============================================================
CREATE TABLE IF NOT EXISTS cost_centers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ASIENTOS CONTABLES (Double-entry Journal)
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  third_party_id INTEGER REFERENCES third_parties(id),
  cost_center_id INTEGER REFERENCES cost_centers(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_chart_id INTEGER NOT NULL REFERENCES account_charts(id),
  description TEXT,
  debit DECIMAL(12,2) NOT NULL DEFAULT 0,
  credit DECIMAL(12,2) NOT NULL DEFAULT 0,
  third_party_id INTEGER REFERENCES third_parties(id),
  cost_center_id INTEGER REFERENCES cost_centers(id)
);

-- ============================================================
-- FACTURACIÓN (Invoicing)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('sales', 'purchase', 'credit_note', 'debit_note')),
  third_party_id INTEGER NOT NULL REFERENCES third_parties(id),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
  cufe VARCHAR(200),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL
);

-- ============================================================
-- CUENTAS POR COBRAR / PAGAR (Receivables / Payables)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts_receivable_payable (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('receivable', 'payable')),
  third_party_id INTEGER NOT NULL REFERENCES third_parties(id),
  invoice_id INTEGER REFERENCES invoices(id),
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  original_amount DECIMAL(12,2) NOT NULL,
  balance DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CUENTAS BANCARIAS (Bank Accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  bank_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit')),
  account_number VARCHAR(50) NOT NULL,
  account_chart_id INTEGER REFERENCES account_charts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONCILIACIÓN BANCARIA (Bank Reconciliation)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_reconciliation (
  id SERIAL PRIMARY KEY,
  bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id),
  reconciliation_date DATE NOT NULL,
  bank_balance DECIMAL(12,2) NOT NULL,
  system_balance DECIMAL(12,2) NOT NULL,
  difference DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'unmatched')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MOVIMIENTOS DE INVENTARIO
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_entry_lines(account_chart_id);
CREATE INDEX IF NOT EXISTS idx_invoices_third_party ON invoices(third_party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_arp_third_party ON accounts_receivable_payable(third_party_id);
CREATE INDEX IF NOT EXISTS idx_arp_status ON accounts_receivable_payable(status);
CREATE INDEX IF NOT EXISTS idx_arp_due ON accounts_receivable_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_bank_rec_account ON bank_reconciliation(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_type ON inventory_movements(movement_type);

-- ============================================================
-- SEED: PLAN DE CUENTAS BÁSICO
-- ============================================================
INSERT INTO account_charts (code, name, type, level) VALUES
  ('1', 'Activo', 'asset', 1),
  ('1.1', 'Activo Corriente', 'asset', 2),
  ('1.1.01', 'Efectivo y Equivalentes', 'asset', 3),
  ('1.1.01.01', 'Caja General', 'asset', 4),
  ('1.1.01.02', 'Bancos', 'asset', 4),
  ('1.1.02', 'Deudores Comerciales', 'asset', 3),
  ('1.1.02.01', 'Clientes Nacionales', 'asset', 4),
  ('1.1.02.02', 'Clientes del Exterior', 'asset', 4),
  ('1.1.03', 'Inventarios', 'asset', 3),
  ('1.1.03.01', 'Inventario de Mercancías', 'asset', 4),
  ('1.2', 'Activo No Corriente', 'asset', 2),
  ('1.2.01', 'Propiedad, Planta y Equipo', 'asset', 3),
  ('1.2.01.01', 'Muebles y Enseres', 'asset', 4),
  ('1.2.01.02', 'Equipo de Cómputo', 'asset', 4),
  ('2', 'Pasivo', 'liability', 1),
  ('2.1', 'Pasivo Corriente', 'liability', 2),
  ('2.1.01', 'Proveedores', 'liability', 3),
  ('2.1.01.01', 'Proveedores Nacionales', 'liability', 4),
  ('2.1.02', 'Obligaciones Tributarias', 'liability', 3),
  ('2.1.02.01', 'IVA por Pagar', 'liability', 4),
  ('2.1.02.02', 'Retención en la Fuente', 'liability', 4),
  ('2.2', 'Pasivo No Corriente', 'liability', 2),
  ('2.2.01', 'Obligaciones Financieras', 'liability', 3),
  ('2.2.01.01', 'Préstamos Bancarios', 'liability', 4),
  ('3', 'Patrimonio', 'equity', 1),
  ('3.1', 'Capital', 'equity', 2),
  ('3.1.01', 'Capital Social', 'equity', 3),
  ('3.1.01.01', 'Aportes Sociales', 'equity', 4),
  ('3.2', 'Resultados', 'equity', 2),
  ('3.2.01', 'Utilidad del Ejercicio', 'equity', 3),
  ('3.2.02', 'Reservas', 'equity', 3),
  ('4', 'Ingresos', 'income', 1),
  ('4.1', 'Ingresos Operacionales', 'income', 2),
  ('4.1.01', 'Venta de Productos', 'income', 3),
  ('4.1.01.01', 'Venta de Mercancías', 'income', 4),
  ('4.1.02', 'Servicios', 'income', 3),
  ('4.1.02.01', 'Servicios de Belleza', 'income', 4),
  ('4.2', 'Ingresos No Operacionales', 'income', 2),
  ('4.2.01', 'Otros Ingresos', 'income', 3),
  ('4.2.01.01', 'Ingresos Financieros', 'income', 4),
  ('5', 'Gastos', 'expense', 1),
  ('5.1', 'Gastos Operacionales', 'expense', 2),
  ('5.1.01', 'Costo de Ventas', 'expense', 3),
  ('5.1.01.01', 'Costo de Mercancías Vendidas', 'expense', 4),
  ('5.1.02', 'Gastos de Personal', 'expense', 3),
  ('5.1.02.01', 'Salarios', 'expense', 4),
  ('5.1.02.02', 'Prestaciones Sociales', 'expense', 4),
  ('5.1.03', 'Gastos Administrativos', 'expense', 3),
  ('5.1.03.01', 'Arrendamientos', 'expense', 4),
  ('5.1.03.02', 'Servicios Públicos', 'expense', 4),
  ('5.1.03.03', 'Papelería', 'expense', 4),
  ('5.1.04', 'Gastos de Venta', 'expense', 3),
  ('5.1.04.01', 'Publicidad y Marketing', 'expense', 4),
  ('5.1.04.02', 'Comisiones', 'expense', 4),
  ('5.2', 'Gastos No Operacionales', 'expense', 2),
  ('5.2.01', 'Gastos Financieros', 'expense', 3),
  ('5.2.01.01', 'Intereses Bancarios', 'expense', 4),
  ('5.2.02', 'Impuestos', 'expense', 3),
  ('5.2.02.01', 'Impuesto de Renta', 'expense', 4)
ON CONFLICT (code) DO NOTHING;
