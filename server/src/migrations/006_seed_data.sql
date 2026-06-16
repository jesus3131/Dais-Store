-- ============================================================
-- SEED DATA: Terceros, Asientos, Facturas, Inventario
-- ============================================================

-- TERCEROS
INSERT INTO third_parties (type, document_type, document_number, name, email, phone, address, city) VALUES
  ('client', 'NIT', '900123456-7', 'Belleza Integral SAS', 'ventas@bellezaintegral.com', '3101234567', 'Calle 45 #12-34', 'Bogotá'),
  ('client', 'CC', '1012345678', 'María Fernanda López', 'maria.lopez@email.com', '3209876543', 'Carrera 7 #80-15', 'Bogotá'),
  ('client', 'CC', '1098765432', 'Carlos Andrés Ruiz', 'carlos.ruiz@email.com', '3156789012', 'Av. Siempre Viva #123', 'Medellín'),
  ('supplier', 'NIT', '890123456-1', 'Distribuidora Cosmética Ltda', 'info@dicosmetica.com', '3112223344', 'Cra 30 #15-20', 'Bogotá'),
  ('supplier', 'NIT', '890987654-3', 'Proveedora Beauty Plus', 'pedidos@beautyplus.com', '3015556677', 'Av. Las Américas #50-10', 'Cali'),
  ('employee', 'CC', '1111111111', 'Ana María Torres', 'ana.torres@daisstore.com', '3001112233', 'Calle 10 #5-30', 'Bogotá'),
  ('employee', 'CC', '2222222222', 'Pedro Sánchez', 'pedro.sanchez@daisstore.com', '3004445566', 'Cra 8 #20-15', 'Bogotá')
ON CONFLICT (document_type, document_number) DO NOTHING;

-- CENTROS DE COSTO
INSERT INTO cost_centers (code, name) VALUES
  ('CC-001', 'Administración'),
  ('CC-002', 'Ventas'),
  ('CC-003', 'Almacén'),
  ('CC-004', 'Servicios'),
  ('CC-005', 'Marketing')
ON CONFLICT (code) DO NOTHING;

-- CUENTAS BANCARIAS
INSERT INTO bank_accounts (bank_name, account_type, account_number, account_chart_id) VALUES
  ('Bancolombia', 'checking', '123-456789-01', 5),
  ('Banco de Bogotá', 'savings', '987-654321-02', 5)
;

-- ============================================================
-- ASIENTO 1: APERTURA (Patrimonio Inicial)
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, status) VALUES
  ('JE-001', '2026-01-01', 'Asiento de apertura - Aportes sociales iniciales', 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit) VALUES
  (1, 4, 'Caja General - Apertura', 80000000, 0),
  (1, 5, 'Bancos - Apertura', 60000000, 0),
  (1, 10, 'Inventario inicial de mercancías', 30000000, 0),
  (1, 13, 'Muebles y enseres', 15000000, 0),
  (1, 14, 'Equipo de cómputo', 8000000, 0),
  (1, 28, 'Aportes sociales - Capital inicial', 0, 193000000);

-- ============================================================
-- ASIENTO 2: VENTA DE PRODUCTOS (Contado)
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, third_party_id, cost_center_id, status) VALUES
  ('JE-002', '2026-02-15', 'Venta de productos - Strawberry Facial Serum y accesorios', 1, 2, 'posted');

-- Débito: Caja
INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit, third_party_id) VALUES
  (2, 4, 'Venta contado - Belleza Integral SAS', 1425000, 0, 1),
  (2, 35, 'Venta de mercancías', 0, 1200000, 1),
  (2, 20, 'IVA por pagar (19%)', 0, 225000, 1);

-- ============================================================
-- ASIENTO 3: COSTO DE VENTAS
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, status) VALUES
  ('JE-003', '2026-02-15', 'Costo de ventas - Febrero', 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit) VALUES
  (3, 44, 'Costo de mercancías vendidas', 750000, 0),
  (3, 10, 'Salida de inventario', 0, 750000);

-- ============================================================
-- ASIENTO 4: VENTA DE SERVICIOS (Crédito)
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, third_party_id, cost_center_id, status) VALUES
  ('JE-004', '2026-03-01', 'Servicios de belleza - María López (a crédito)', 2, 4, 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit, third_party_id) VALUES
  (4, 7, 'Cuenta por cobrar - María López', 952000, 0, 2),
  (4, 37, 'Servicios de belleza', 0, 800000, 2),
  (4, 20, 'IVA por pagar', 0, 152000, 2);

-- ============================================================
-- ASIENTO 5: GASTOS ADMINISTRATIVOS
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, cost_center_id, status) VALUES
  ('JE-005', '2026-03-31', 'Pago arriendo local comercial - Marzo', 1, 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit) VALUES
  (5, 49, 'Arrendamiento - Marzo', 2500000, 0),
  (5, 4, 'Pago de arriendo', 0, 2500000);

-- ============================================================
-- ASIENTO 6: NÓMINA
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, cost_center_id, status) VALUES
  ('JE-006', '2026-03-31', 'Nómina mensual - Marzo', 1, 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit) VALUES
  (6, 46, 'Salarios del mes', 4500000, 0),
  (6, 47, 'Prestaciones sociales', 1200000, 0),
  (6, 4, 'Pago de nómina', 0, 5700000);

-- ============================================================
-- ASIENTO 7: GASTOS DE SERVICIOS
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, cost_center_id, status) VALUES
  ('JE-007', '2026-03-31', 'Servicios públicos - Marzo', 1, 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit) VALUES
  (7, 50, 'Energía, agua, internet', 850000, 0),
  (7, 4, 'Pago servicios', 0, 850000);

-- ============================================================
-- ASIENTO 8: GASTOS DE MARKETING
-- ============================================================
INSERT INTO journal_entries (entry_number, entry_date, description, cost_center_id, status) VALUES
  ('JE-008', '2026-04-01', 'Campaña redes sociales - Abril', 5, 'posted');

INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit) VALUES
  (8, 53, 'Publicidad Instagram y Facebook', 1500000, 0),
  (8, 5, 'Pago desde Bancolombia', 0, 1500000);

-- ============================================================
-- FACTURA DE VENTA #1
-- ============================================================
INSERT INTO invoices (invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status, journal_entry_id) VALUES
  ('INV-001', 'sales', 1, '2026-02-15', '2026-03-15', 1200000, 225000, 1425000, 'paid', 2);

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, total) VALUES
  (1, 'Strawberry Facial Serum 50ml', 5, 120000, 19, 600000),
  (1, 'Elegant Hairclips - Pack x5', 10, 35000, 19, 350000),
  (1, 'Soft Rose Liquid Blush', 5, 50000, 19, 250000);

-- ============================================================
-- FACTURA DE VENTA #2 (Crédito)
-- ============================================================
INSERT INTO invoices (invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status, journal_entry_id) VALUES
  ('INV-002', 'sales', 2, '2026-03-01', '2026-04-01', 800000, 152000, 952000, 'issued', 4);

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, total) VALUES
  (2, 'Servicio facial premium', 1, 400000, 19, 400000),
  (2, 'Sesión de maquillaje profesional', 2, 200000, 19, 400000);

-- ============================================================
-- FACTURA DE COMPRA #1
-- ============================================================
INSERT INTO invoices (invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status) VALUES
  ('INV-003', 'purchase', 4, '2026-03-20', '2026-04-20', 4500000, 855000, 5355000, 'issued');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, total) VALUES
  (3, 'Lote productos skincare - 100 unidades', 100, 35000, 19, 3500000),
  (3, 'Accesorios para el cabello - 200 unidades', 200, 5000, 19, 1000000);

-- ============================================================
-- CUENTAS POR COBRAR
-- ============================================================
INSERT INTO accounts_receivable_payable (type, third_party_id, invoice_id, journal_entry_id, original_amount, balance, due_date, status) VALUES
  ('receivable', 2, 2, 4, 952000, 952000, '2026-04-01', 'pending'),
  ('receivable', 3, NULL, NULL, 2500000, 1500000, '2026-05-15', 'partial');

-- ============================================================
-- CUENTAS POR PAGAR
-- ============================================================
INSERT INTO accounts_receivable_payable (type, third_party_id, invoice_id, original_amount, balance, due_date, status) VALUES
  ('payable', 4, 3, 5355000, 5355000, '2026-04-20', 'pending'),
  ('payable', 5, NULL, 3200000, 2000000, '2026-05-01', 'partial');

-- ============================================================
-- MOVIMIENTOS DE INVENTARIO
-- ============================================================
INSERT INTO inventory_movements (product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes) VALUES
  (1, 'adjustment', 50, 0, 50, 'initial', NULL, 'Inventario inicial'),
  (2, 'adjustment', 100, 0, 100, 'initial', NULL, 'Inventario inicial'),
  (3, 'adjustment', 75, 0, 75, 'initial', NULL, 'Inventario inicial'),
  (4, 'adjustment', 40, 0, 40, 'initial', NULL, 'Inventario inicial'),
  (5, 'adjustment', 30, 0, 30, 'initial', NULL, 'Inventario inicial'),
  (6, 'adjustment', 60, 0, 60, 'initial', NULL, 'Inventario inicial'),
  (1, 'out', 5, 50, 45, 'sale', 1, 'Venta INV-001'),
  (2, 'out', 10, 100, 90, 'sale', 1, 'Venta INV-001'),
  (3, 'out', 5, 75, 70, 'sale', 1, 'Venta INV-001');

-- ============================================================
-- CONCILIACIÓN BANCARIA
-- ============================================================
INSERT INTO bank_reconciliation (bank_account_id, reconciliation_date, bank_balance, system_balance, difference, status) VALUES
  (1, '2026-03-31', 58500000, 58500000, 0, 'matched'),
  (2, '2026-03-31', 60000000, 60000000, 0, 'matched');
