-- Replace all data with local database snapshot

-- Add missing columns to match local schema
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;

TRUNCATE TABLE public.invoice_items CASCADE;
TRUNCATE TABLE public.journal_entry_lines CASCADE;
TRUNCATE TABLE public.accounts_receivable_payable CASCADE;
TRUNCATE TABLE public.bank_reconciliation CASCADE;
TRUNCATE TABLE public.bank_accounts CASCADE;
TRUNCATE TABLE public.inventory_movements CASCADE;
TRUNCATE TABLE public.inventory CASCADE;
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.catalogs CASCADE;
TRUNCATE TABLE public.coupons CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.invoices CASCADE;
TRUNCATE TABLE public.journal_entries CASCADE;
TRUNCATE TABLE public.accounting_entries CASCADE;
TRUNCATE TABLE public.quotations CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.third_parties CASCADE;
TRUNCATE TABLE public.cost_centers CASCADE;
TRUNCATE TABLE public.design_tokens CASCADE;
TRUNCATE TABLE public.page_sections CASCADE;
TRUNCATE TABLE public.site_settings CASCADE;
TRUNCATE TABLE public.account_charts CASCADE;

-- products
INSERT INTO public.products (id, name, price, currency, description, image_url, category, image_data, created_at, updated_at, sku, stock, active, old_price, image_url_2, wholesale_price, wholesale_min_qty) VALUES (1, 'Strawberry Facial Serum', 38900, '\$', 'Suero facial con extracto de fresa y vitamina C', 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=533&fit=crop', 'serum', NULL, '2026-06-13 15:32:47.845399', '2026-06-13 15:32:47.845399', NULL, NULL, true, NULL, NULL, NULL, 0);
INSERT INTO public.products (id, name, price, currency, description, image_url, category, image_data, created_at, updated_at, sku, stock, active, old_price, image_url_2, wholesale_price, wholesale_min_qty) VALUES (2, 'Elegant Hairclips', 15500, '\$', 'Set de 4 pinzas para cabello con acabado dorado', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=533&fit=crop', 'accesorios', NULL, '2026-06-13 15:32:47.845399', '2026-06-13 15:32:47.845399', NULL, NULL, true, NULL, NULL, NULL, 0);
INSERT INTO public.products (id, name, price, currency, description, image_url, category, image_data, created_at, updated_at, sku, stock, active, old_price, image_url_2, wholesale_price, wholesale_min_qty) VALUES (3, 'Soft Rose Liquid Blush', 27200, '\$', 'Rubor líquido de larga duración tono rosa suave', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=533&fit=crop', 'maquillaje', NULL, '2026-06-13 15:32:47.845399', '2026-06-13 15:32:47.845399', NULL, NULL, true, NULL, NULL, NULL, 0);
INSERT INTO public.products (id, name, price, currency, description, image_url, category, image_data, created_at, updated_at, sku, stock, active, old_price, image_url_2, wholesale_price, wholesale_min_qty) VALUES (4, 'Aurora Hydrating Cream', 45600, '\$', 'Crema hidratante con ácido hialurónico y colágeno', 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=533&fit=crop', 'cuidado', NULL, '2026-06-13 15:32:47.845399', '2026-06-13 15:32:47.845399', NULL, NULL, true, NULL, NULL, NULL, 0);
INSERT INTO public.products (id, name, price, currency, description, image_url, category, image_data, created_at, updated_at, sku, stock, active, old_price, image_url_2, wholesale_price, wholesale_min_qty) VALUES (5, 'Rose Gold Brush Set', 32800, '\$', 'Set de 6 brochas con mango rosa dorado', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=533&fit=crop', 'accesorios', NULL, '2026-06-13 15:32:47.845399', '2026-06-13 15:32:47.845399', NULL, NULL, true, NULL, NULL, NULL, 0);
INSERT INTO public.products (id, name, price, currency, description, image_url, category, image_data, created_at, updated_at, sku, stock, active, old_price, image_url_2, wholesale_price, wholesale_min_qty) VALUES (6, 'Golden Nude Palette', 41300, '\$', 'Paleta de sombras con 12 tonos nude y dorados', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=533&fit=crop', 'maquillaje', NULL, '2026-06-13 15:32:47.845399', '2026-06-13 15:32:47.845399', NULL, NULL, true, NULL, NULL, NULL, 0);

-- orders
INSERT INTO public.orders (id, customer_name, phone, email, items, total, status, notes, created_at, updated_at, payment_method) VALUES (1, 'María García', '3001234567', 'maria@email.com', '[{"qty": 2, "name": "Strawberry Facial Serum", "price": 38900}, {"qty": 1, "name": "Rose Gold Brush Set", "price": 32800}]', 110600, 'delivered', NULL, '2026-06-06 15:36:40.339489', '2026-06-13 15:36:40.339489', 'transferencia');
INSERT INTO public.orders (id, customer_name, phone, email, items, total, status, notes, created_at, updated_at, payment_method) VALUES (2, 'Carlos López', '3109876543', 'carlos@email.com', '[{"qty": 1, "name": "Golden Nude Palette", "price": 41300}]', 41300, 'shipped', NULL, '2026-06-10 15:36:40.339489', '2026-06-13 15:36:40.339489', 'transferencia');
INSERT INTO public.orders (id, customer_name, phone, email, items, total, status, notes, created_at, updated_at, payment_method) VALUES (3, 'Ana Martínez', '3204567890', 'ana@email.com', '[{"qty": 3, "name": "Soft Rose Liquid Blush", "price": 27200}, {"qty": 2, "name": "Aurora Hydrating Cream", "price": 45600}]', 172800, 'pending', NULL, '2026-06-12 15:36:40.339489', '2026-06-13 15:36:40.339489', 'transferencia');
INSERT INTO public.orders (id, customer_name, phone, email, items, total, status, notes, created_at, updated_at, payment_method) VALUES (4, 'Pedro Rodríguez', '3012345678', 'pedro@email.com', '[{"qty": 5, "name": "Elegant Hairclips", "price": 15500}]', 77500, 'pending', NULL, '2026-06-13 15:36:40.339489', '2026-06-13 15:36:40.339489', 'transferencia');
INSERT INTO public.orders (id, customer_name, phone, email, items, total, status, notes, created_at, updated_at, payment_method) VALUES (5, 'Laura Gómez', '3156789012', 'laura@email.com', '[{"qty": 1, "name": "Strawberry Facial Serum", "price": 38900}, {"qty": 1, "name": "Aurora Hydrating Cream", "price": 45600}, {"qty": 2, "name": "Golden Nude Palette", "price": 41300}]', 167100, 'delivered', NULL, '2026-05-30 15:36:40.339489', '2026-06-13 15:36:40.339489', 'transferencia');
INSERT INTO public.orders (id, customer_name, phone, email, items, total, status, notes, created_at, updated_at, payment_method) VALUES (6, 'Cliente Web', '573000000000', 'cliente@daisstore.com', '[{"id": 2, "name": "Elegant Hairclips", "price": 15500, "quantity": 1}]', 15500, 'pending', 'Pedido desde la tienda web', '2026-06-13 18:13:43.240479', '2026-06-13 18:13:43.240479', 'transferencia');

-- customers
INSERT INTO public.customers (id, name, email, phone, city, department, address, notes, total_orders, total_spent, last_order_date, created_at, updated_at) VALUES (1, 'María Pérez', 'maria@test.com', '3009998877', 'Bogotá', 'Cundinamarca', NULL, NULL, 1, 0, NULL, '2026-06-16 21:37:30.175385', '2026-06-16 21:37:30.175385');

-- inventory
INSERT INTO public.inventory (id, product_id, quantity, min_stock, updated_at) VALUES (1, 1, 50, 10, '2026-06-13 15:36:40.32844');
INSERT INTO public.inventory (id, product_id, quantity, min_stock, updated_at) VALUES (2, 2, 50, 10, '2026-06-13 15:36:40.32844');
INSERT INTO public.inventory (id, product_id, quantity, min_stock, updated_at) VALUES (3, 3, 50, 10, '2026-06-13 15:36:40.32844');
INSERT INTO public.inventory (id, product_id, quantity, min_stock, updated_at) VALUES (4, 4, 50, 10, '2026-06-13 15:36:40.32844');
INSERT INTO public.inventory (id, product_id, quantity, min_stock, updated_at) VALUES (5, 5, 50, 10, '2026-06-13 15:36:40.32844');
INSERT INTO public.inventory (id, product_id, quantity, min_stock, updated_at) VALUES (6, 6, 50, 10, '2026-06-13 15:36:40.32844');

-- inventory_movements
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (1, 1, 'adjustment', 50, 0, 50, 'initial', NULL, 'Inventario inicial', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (2, 2, 'adjustment', 100, 0, 100, 'initial', NULL, 'Inventario inicial', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (3, 3, 'adjustment', 75, 0, 75, 'initial', NULL, 'Inventario inicial', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (4, 4, 'adjustment', 40, 0, 40, 'initial', NULL, 'Inventario inicial', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (5, 5, 'adjustment', 30, 0, 30, 'initial', NULL, 'Inventario inicial', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (6, 6, 'adjustment', 60, 0, 60, 'initial', NULL, 'Inventario inicial', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (7, 1, 'out', 5, 50, 45, 'sale', 1, 'Venta INV-001', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (8, 2, 'out', 10, 100, 90, 'sale', 1, 'Venta INV-001', '2026-06-14 14:14:37.541445');
INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_at) VALUES (9, 3, 'out', 5, 75, 70, 'sale', 1, 'Venta INV-001', '2026-06-14 14:14:37.541445');

-- messages
INSERT INTO public.messages (id, name, phone, email, message, is_read, created_at, reply) VALUES (4, 'Diego Moreno', '3014445566', 'diego@email.com', 'Soy dueño de una boutique en Cartagena. Me gustaría recibir el catálogo completo con precios mayoristas.', false, '2026-06-13 15:36:40.343652', NULL);

-- coupons
INSERT INTO public.coupons (id, code, type, value, min_purchase, max_uses, used_count, starts_at, expires_at, is_active, created_at, updated_at) VALUES (1, 'BIENVENIDO10', 'percentage', 10, 0, 0, 0, NULL, NULL, true, '2026-06-16 21:35:33.455942', '2026-06-16 21:35:33.455942');
INSERT INTO public.coupons (id, code, type, value, min_purchase, max_uses, used_count, starts_at, expires_at, is_active, created_at, updated_at) VALUES (2, 'DESCUENTO20', 'percentage', 20, 50000, 0, 0, NULL, NULL, true, '2026-06-16 21:37:04.691941', '2026-06-16 21:37:04.691941');
INSERT INTO public.coupons (id, code, type, value, min_purchase, max_uses, used_count, starts_at, expires_at, is_active, created_at, updated_at) VALUES (3, 'NUEVO', 'fixed', 5000, 0, 0, 0, NULL, NULL, true, '2026-06-16 22:05:38.500453', '2026-06-16 22:05:38.500453');

-- account_charts
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (1, '1', 'Activo', 'asset', 1, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (2, '1.1', 'Activo Corriente', 'asset', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (3, '1.1.01', 'Efectivo y Equivalentes', 'asset', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (4, '1.1.01.01', 'Caja General', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (5, '1.1.01.02', 'Bancos', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (6, '1.1.02', 'Deudores Comerciales', 'asset', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (7, '1.1.02.01', 'Clientes Nacionales', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (8, '1.1.02.02', 'Clientes del Exterior', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (9, '1.1.03', 'Inventarios', 'asset', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (10, '1.1.03.01', 'Inventario de Mercancías', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (11, '1.2', 'Activo No Corriente', 'asset', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (12, '1.2.01', 'Propiedad, Planta y Equipo', 'asset', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (13, '1.2.01.01', 'Muebles y Enseres', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (14, '1.2.01.02', 'Equipo de Cómputo', 'asset', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (15, '2', 'Pasivo', 'liability', 1, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (16, '2.1', 'Pasivo Corriente', 'liability', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (17, '2.1.01', 'Proveedores', 'liability', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (18, '2.1.01.01', 'Proveedores Nacionales', 'liability', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (19, '2.1.02', 'Obligaciones Tributarias', 'liability', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (20, '2.1.02.01', 'IVA por Pagar', 'liability', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (21, '2.1.02.02', 'Retención en la Fuente', 'liability', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (22, '2.2', 'Pasivo No Corriente', 'liability', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (23, '2.2.01', 'Obligaciones Financieras', 'liability', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (24, '2.2.01.01', 'Préstamos Bancarios', 'liability', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (25, '3', 'Patrimonio', 'equity', 1, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (26, '3.1', 'Capital', 'equity', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (27, '3.1.01', 'Capital Social', 'equity', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (28, '3.1.01.01', 'Aportes Sociales', 'equity', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (29, '3.2', 'Resultados', 'equity', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (30, '3.2.01', 'Utilidad del Ejercicio', 'equity', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (31, '3.2.02', 'Reservas', 'equity', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (32, '4', 'Ingresos', 'income', 1, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (33, '4.1', 'Ingresos Operacionales', 'income', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (34, '4.1.01', 'Venta de Productos', 'income', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (35, '4.1.01.01', 'Venta de Mercancías', 'income', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (36, '4.1.02', 'Servicios', 'income', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (37, '4.1.02.01', 'Servicios de Belleza', 'income', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (38, '4.2', 'Ingresos No Operacionales', 'income', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (39, '4.2.01', 'Otros Ingresos', 'income', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (40, '4.2.01.01', 'Ingresos Financieros', 'income', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (41, '5', 'Gastos', 'expense', 1, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (42, '5.1', 'Gastos Operacionales', 'expense', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (43, '5.1.01', 'Costo de Ventas', 'expense', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (44, '5.1.01.01', 'Costo de Mercancías Vendidas', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (45, '5.1.02', 'Gastos de Personal', 'expense', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (46, '5.1.02.01', 'Salarios', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (47, '5.1.02.02', 'Prestaciones Sociales', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (48, '5.1.03', 'Gastos Administrativos', 'expense', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (49, '5.1.03.01', 'Arrendamientos', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (50, '5.1.03.02', 'Servicios Públicos', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (51, '5.1.03.03', 'Papelería', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (52, '5.1.04', 'Gastos de Venta', 'expense', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (53, '5.1.04.01', 'Publicidad y Marketing', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (54, '5.1.04.02', 'Comisiones', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (55, '5.2', 'Gastos No Operacionales', 'expense', 2, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (56, '5.2.01', 'Gastos Financieros', 'expense', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (57, '5.2.01.01', 'Intereses Bancarios', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (58, '5.2.02', 'Impuestos', 'expense', 3, NULL, true, '2026-06-14 14:08:49.591132');
INSERT INTO public.account_charts (id, code, name, type, level, parent_id, is_active, created_at) VALUES (59, '5.2.02.01', 'Impuesto de Renta', 'expense', 4, NULL, true, '2026-06-14 14:08:49.591132');

-- cost_centers
INSERT INTO public.cost_centers (id, code, name, is_active, created_at) VALUES (1, 'CC-001', 'Administración', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.cost_centers (id, code, name, is_active, created_at) VALUES (2, 'CC-002', 'Ventas', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.cost_centers (id, code, name, is_active, created_at) VALUES (3, 'CC-003', 'Almacén', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.cost_centers (id, code, name, is_active, created_at) VALUES (4, 'CC-004', 'Servicios', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.cost_centers (id, code, name, is_active, created_at) VALUES (5, 'CC-005', 'Marketing', true, '2026-06-14 14:14:37.541445');

-- third_parties
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (1, 'client', 'NIT', '900123456-7', 'Belleza Integral SAS', 'ventas@bellezaintegral.com', '3101234567', 'Calle 45 #12-34', 'Bogotá', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (2, 'client', 'CC', '1012345678', 'María Fernanda López', 'maria.lopez@email.com', '3209876543', 'Carrera 7 #80-15', 'Bogotá', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (3, 'client', 'CC', '1098765432', 'Carlos Andrés Ruiz', 'carlos.ruiz@email.com', '3156789012', 'Av. Siempre Viva #123', 'Medellín', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (4, 'supplier', 'NIT', '890123456-1', 'Distribuidora Cosmética Ltda', 'info@dicosmetica.com', '3112223344', 'Cra 30 #15-20', 'Bogotá', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (5, 'supplier', 'NIT', '890987654-3', 'Proveedora Beauty Plus', 'pedidos@beautyplus.com', '3015556677', 'Av. Las Américas #50-10', 'Cali', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (6, 'employee', 'CC', '1111111111', 'Ana María Torres', 'ana.torres@daisstore.com', '3001112233', 'Calle 10 #5-30', 'Bogotá', true, '2026-06-14 14:14:37.541445');
INSERT INTO public.third_parties (id, type, document_type, document_number, name, email, phone, address, city, is_active, created_at) VALUES (7, 'employee', 'CC', '2222222222', 'Pedro Sánchez', 'pedro.sanchez@daisstore.com', '3004445566', 'Cra 8 #20-15', 'Bogotá', true, '2026-06-14 14:14:37.541445');

-- journal_entries
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (1, 'JE-001', '2026-01-01', 'Asiento de apertura - Aportes sociales iniciales', NULL, NULL, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (2, 'JE-002', '2026-02-15', 'Venta de productos - Strawberry Facial Serum y accesorios', 1, 2, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (3, 'JE-003', '2026-02-15', 'Costo de ventas - Febrero', NULL, NULL, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (4, 'JE-004', '2026-03-01', 'Servicios de belleza - María López (a crédito)', 2, 4, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (5, 'JE-005', '2026-03-31', 'Pago arriendo local comercial - Marzo', NULL, 1, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (6, 'JE-006', '2026-03-31', 'Nómina mensual - Marzo', NULL, 1, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (7, 'JE-007', '2026-03-31', 'Servicios públicos - Marzo', NULL, 1, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');
INSERT INTO public.journal_entries (id, entry_number, entry_date, description, third_party_id, cost_center_id, status, created_at, updated_at) VALUES (8, 'JE-008', '2026-04-01', 'Campaña redes sociales - Abril', NULL, 5, 'posted', '2026-06-14 14:14:37.541445', '2026-06-14 14:14:37.541445');

-- journal_entry_lines
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (1, 1, 4, 'Caja General - Apertura', 80000000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (2, 1, 5, 'Bancos - Apertura', 60000000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (3, 1, 10, 'Inventario inicial de mercancías', 30000000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (4, 1, 13, 'Muebles y enseres', 15000000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (5, 1, 14, 'Equipo de cómputo', 8000000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (6, 1, 28, 'Aportes sociales - Capital inicial', 0.00, 193000000.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (7, 2, 4, 'Venta contado - Belleza Integral SAS', 1425000.00, 0.00, 1, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (8, 2, 35, 'Venta de mercancías', 0.00, 1200000.00, 1, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (9, 2, 20, 'IVA por pagar (19%)', 0.00, 225000.00, 1, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (10, 3, 44, 'Costo de mercancías vendidas', 750000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (11, 3, 10, 'Salida de inventario', 0.00, 750000.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (12, 4, 7, 'Cuenta por cobrar - María López', 952000.00, 0.00, 2, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (13, 4, 37, 'Servicios de belleza', 0.00, 800000.00, 2, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (14, 4, 20, 'IVA por pagar', 0.00, 152000.00, 2, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (15, 5, 49, 'Arrendamiento - Marzo', 2500000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (16, 5, 4, 'Pago de arriendo', 0.00, 2500000.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (17, 6, 46, 'Salarios del mes', 4500000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (18, 6, 47, 'Prestaciones sociales', 1200000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (19, 6, 4, 'Pago de nómina', 0.00, 5700000.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (20, 7, 50, 'Energía, agua, internet', 850000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (21, 7, 4, 'Pago servicios', 0.00, 850000.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (22, 8, 53, 'Publicidad Instagram y Facebook', 1500000.00, 0.00, NULL, NULL);
INSERT INTO public.journal_entry_lines (id, journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id) VALUES (23, 8, 5, 'Pago desde Bancolombia', 0.00, 1500000.00, NULL, NULL);

-- invoices
INSERT INTO public.invoices (id, invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status, cufe, journal_entry_id, created_at) VALUES (1, 'INV-001', 'sales', 1, '2026-02-15', '2026-03-15', 1200000.00, 225000.00, 1425000.00, 'paid', NULL, 2, '2026-06-14 14:14:37.541445');
INSERT INTO public.invoices (id, invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status, cufe, journal_entry_id, created_at) VALUES (2, 'INV-002', 'sales', 2, '2026-03-01', '2026-04-01', 800000.00, 152000.00, 952000.00, 'issued', NULL, 4, '2026-06-14 14:14:37.541445');
INSERT INTO public.invoices (id, invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status, cufe, journal_entry_id, created_at) VALUES (3, 'INV-003', 'purchase', 4, '2026-03-20', '2026-04-20', 4500000.00, 855000.00, 5355000.00, 'issued', NULL, NULL, '2026-06-14 14:14:37.541445');

-- invoice_items
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (1, 1, 'Strawberry Facial Serum 50ml', 5, 120000.00, 19.00, 600000.00);
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (2, 1, 'Elegant Hairclips - Pack x5', 10, 35000.00, 19.00, 350000.00);
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (3, 1, 'Soft Rose Liquid Blush', 5, 50000.00, 19.00, 250000.00);
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (4, 2, 'Servicio facial premium', 1, 400000.00, 19.00, 400000.00);
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (5, 2, 'Sesión de maquillaje profesional', 2, 200000.00, 19.00, 400000.00);
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (6, 3, 'Lote productos skincare - 100 unidades', 100, 35000.00, 19.00, 3500000.00);
INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, tax_rate, total) VALUES (7, 3, 'Accesorios para el cabello - 200 unidades', 200, 5000.00, 19.00, 1000000.00);

-- accounts_receivable_payable
INSERT INTO public.accounts_receivable_payable (id, type, third_party_id, invoice_id, journal_entry_id, original_amount, balance, due_date, status, created_at) VALUES (1, 'receivable', 2, 2, 4, 952000.00, 952000.00, '2026-04-01', 'pending', '2026-06-14 14:14:37.541445');
INSERT INTO public.accounts_receivable_payable (id, type, third_party_id, invoice_id, journal_entry_id, original_amount, balance, due_date, status, created_at) VALUES (2, 'receivable', 3, NULL, NULL, 2500000.00, 1500000.00, '2026-05-15', 'partial', '2026-06-14 14:14:37.541445');
INSERT INTO public.accounts_receivable_payable (id, type, third_party_id, invoice_id, journal_entry_id, original_amount, balance, due_date, status, created_at) VALUES (3, 'payable', 4, 3, NULL, 5355000.00, 5355000.00, '2026-04-20', 'pending', '2026-06-14 14:14:37.541445');
INSERT INTO public.accounts_receivable_payable (id, type, third_party_id, invoice_id, journal_entry_id, original_amount, balance, due_date, status, created_at) VALUES (4, 'payable', 5, NULL, NULL, 3200000.00, 2000000.00, '2026-05-01', 'partial', '2026-06-14 14:14:37.541445');

-- bank_accounts
INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, account_chart_id, is_active, created_at) VALUES (1, 'Bancolombia', 'checking', '123-456789-01', 5, true, '2026-06-14 14:14:37.541445');
INSERT INTO public.bank_accounts (id, bank_name, account_type, account_number, account_chart_id, is_active, created_at) VALUES (2, 'Banco de Bogotá', 'savings', '987-654321-02', 5, true, '2026-06-14 14:14:37.541445');

-- bank_reconciliation
INSERT INTO public.bank_reconciliation (id, bank_account_id, reconciliation_date, bank_balance, system_balance, difference, status, notes, created_at) VALUES (1, 1, '2026-03-31', 58500000.00, 58500000.00, 0.00, 'matched', NULL, '2026-06-14 14:14:37.541445');
INSERT INTO public.bank_reconciliation (id, bank_account_id, reconciliation_date, bank_balance, system_balance, difference, status, notes, created_at) VALUES (2, 2, '2026-03-31', 60000000.00, 60000000.00, 0.00, 'matched', NULL, '2026-06-14 14:14:37.541445');

-- design_tokens
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (1, 'color-gold', '#e8cfa6', 'color', '2026-06-16 14:11:54.768173');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (3, 'color-gold-dark', '#c9a84b', 'color', '2026-06-16 14:11:54.78142');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (2, 'color-gold-light', '#f5e8d0', 'color', '2026-06-16 14:11:54.782914');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (10, 'color-ivory', '#fdf0f3', 'color', '2026-06-16 14:11:54.784074');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (7, 'color-near-black', '#1c1b1b', 'color', '2026-06-16 14:11:54.785266');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (8, 'color-on-surface-variant', '#4a4440', 'color', '2026-06-16 14:11:54.786425');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (4, 'color-pastel-pink', '#fdf0f3', 'color', '2026-06-16 14:11:54.787514');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (5, 'color-pastel-pink-dark', '#fce4ea', 'color', '2026-06-16 14:11:54.788534');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (6, 'color-pastel-white', '#fffbfc', 'color', '2026-06-16 14:11:54.789546');
INSERT INTO public.design_tokens (id, token_name, token_value, category, updated_at) VALUES (9, 'color-warm-gray', '#f0e0e4', 'color', '2026-06-16 14:11:54.791992');

-- page_sections
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (3, 'categories', 'Categorías', '{"categories": [{"name": "Skincare", "image": "https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80"}, {"name": "Maquillaje", "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"}, {"name": "Cabello", "image": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80"}]}', true, 2, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:58.133472');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (4, 'catalog', 'Productos', '{}', true, 3, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:58.191393');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (1, 'hero', 'Hero', '{"badge": "Edición Limitada", "title": "Transforma tu rutina\nen una experiencia\nextraordinaria", "bgImage": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80", "subtitle": "Descubre una selección curada de productos de belleza, skincare y bienestar. Cada detalle ha sido pensado para elevar tu ritual diario a una experiencia de lujo.", "btnPrimary": "Explorar Colección", "btnSecondary": "Conocer la Marca"}', true, 0, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:57.536456');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (2, 'how-it-works', 'Cómo funciona', '{"steps": [{"desc": "Explora nuestra colección curada de productos premium para el cuidado personal.", "icon": "search", "title": "Descubre"}, {"desc": "Elige los productos que mejor se adapten a tu estilo y necesidades.", "icon": "checklist", "title": "Selecciona"}, {"desc": "Recibe asesoría personalizada de nuestros expertos en belleza.", "icon": "auto_awesome", "title": "Personaliza"}, {"desc": "Disfruta de envíos rápidos y empaques premium que cuidan cada detalle.", "icon": "local_shipping", "title": "Recibe"}]}', true, 1, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:57.873641');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (5, 'testimonials', 'Testimonios', '{"items": [{"name": "María Fernanda G.", "role": "Emprendedora de Belleza", "text": "Desde que trabajo con DAIS, la calidad de mis productos se ha disparado. Mis clientas notan la diferencia y yo también. El servicio al cliente es impecable.", "rating": 5}, {"name": "Carlos E. Mendoza", "role": "Dueño de Salón", "text": "La variedad de productos y los precios mayoristas son insuperables. Los envíos siempre llegan a tiempo y en perfectas condiciones. Altamente recomendados.", "rating": 5}, {"name": "Ana Lucía R.", "role": "Distribuidora Independiente", "text": "DAIS me ha permitido hacer crecer mi negocio de manera increíble. La asesoría personalizada y la calidad de los productos marcan la diferencia.", "rating": 5}]}', true, 4, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:58.460411');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (6, 'branding', 'Marcas', '{"brands": [{"icon": "spa", "name": "L''Oréal"}, {"icon": "brush", "name": "Maybelline"}, {"icon": "water_drop", "name": "Neutrogena"}, {"icon": "ac_unit", "name": "Nivea"}, {"icon": "science", "name": "Vichy"}, {"icon": "healing", "name": "Eucerin"}]}', true, 5, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:58.514968');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (7, 'about', 'Nosotros', '{"text": "En DAIS, creemos que la belleza es una forma de expresión personal. Desde nuestros inicios, nos hemos dedicado a seleccionar los mejores productos de belleza, skincare y bienestar para ofrecer a nuestros clientes una experiencia excepcional.\n\nTrabajamos directamente con laboratorios y fabricantes de prestigio para garantizar la más alta calidad en cada producto que llega a tus manos. Nuestro compromiso es brindarte no solo productos extraordinarios, sino también el conocimiento y la asesoría que necesitas para potenciar tu negocio.", "stats": [{"label": "Productos premium", "number": "200+"}, {"label": "Clientes satisfechos", "number": "500+"}, {"label": "Años de experiencia", "number": "15+"}]}', true, 6, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:58.777737');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (8, 'faq', 'FAQ', '{"items": [{"a": "Puedes explorar nuestro catálogo, agregar los productos a tu carrito y enviar tu pedido a través de WhatsApp.", "q": "¿Cómo realizo un pedido al por mayor?"}, {"a": "Trabajamos con pedidos desde $1,500 MXN.", "q": "¿Cuál es el monto mínimo de compra?"}, {"a": "Los envíos se realizan dentro de las siguientes 72 horas hábiles posteriores a la confirmación del pago.", "q": "¿Cuánto tiempo tarda el envío?"}, {"a": "Aceptamos transferencia bancaria, depósito en efectivo y pagos con tarjeta.", "q": "¿Qué métodos de pago aceptan?"}, {"a": "Aceptamos cambios y devoluciones dentro de los primeros 15 días.", "q": "¿Puedo devolver un producto?"}, {"a": "Sí, ofrecemos la venta de muestras para que puedas evaluar la calidad.", "q": "¿Ofrecen muestras?"}]}', true, 7, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:58.829811');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (9, 'instagram-feed', 'Instagram', '{}', true, 8, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:59.099775');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (10, 'newsletter', 'Newsletter', '{"title": "Únete a nuestra newsletter", "btnText": "Suscribirme", "subtitle": "Sé la primera en enterarte de nuevos lanzamientos, ofertas exclusivas y contenido de belleza."}', true, 9, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:59.139362');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (11, 'prefooter', 'Pre Footer', '{"email": "info@daisstore.co", "phone": "+57 300 000 0000", "address": "Montería, Córdoba, Colombia"}', true, 10, '2026-06-16 13:56:51.431394', '2026-06-16 14:11:59.421902');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (12, 'hero', 'Hero', '{"badge": "Edición Limitada", "title": "Transforma tu rutina\nen una experiencia\nextraordinaria", "bgImage": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80", "subtitle": "Descubre una selección curada de productos de belleza, skincare y bienestar. Cada detalle ha sido pensado para elevar tu ritual diario a una experiencia de lujo.", "btnPrimary": "Explorar Colección", "btnSecondary": "Conocer la Marca"}', true, 0, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (13, 'how-it-works', 'Cómo funciona', '{"steps": [{"desc": "Explora nuestra colección curada de productos premium para el cuidado personal.", "icon": "search", "title": "Descubre"}, {"desc": "Elige los productos que mejor se adapten a tu estilo y necesidades.", "icon": "checklist", "title": "Selecciona"}, {"desc": "Recibe asesoría personalizada de nuestros expertos en belleza.", "icon": "auto_awesome", "title": "Personaliza"}, {"desc": "Disfruta de envíos rápidos y empaques premium que cuidan cada detalle.", "icon": "local_shipping", "title": "Recibe"}]}', true, 1, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (14, 'categories', 'Categorías', '{"categories": [{"name": "Skincare", "image": "https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80"}, {"name": "Maquillaje", "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"}, {"name": "Cabello", "image": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80"}]}', true, 2, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (15, 'catalog', 'Productos', '{}', true, 3, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (16, 'testimonials', 'Testimonios', '{"items": [{"name": "María Fernanda G.", "role": "Emprendedora de Belleza", "text": "Desde que trabajo con DAIS, la calidad de mis productos se ha disparado. Mis clientas notan la diferencia y yo también. El servicio al cliente es impecable.", "rating": 5}, {"name": "Carlos E. Mendoza", "role": "Dueño de Salón", "text": "La variedad de productos y los precios mayoristas son insuperables. Los envíos siempre llegan a tiempo y en perfectas condiciones. Altamente recomendados.", "rating": 5}, {"name": "Ana Lucía R.", "role": "Distribuidora Independiente", "text": "DAIS me ha permitido hacer crecer mi negocio de manera increíble. La asesoría personalizada y la calidad de los productos marcan la diferencia.", "rating": 5}]}', true, 4, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (17, 'branding', 'Marcas', '{"brands": [{"icon": "spa", "name": "L''Oréal"}, {"icon": "brush", "name": "Maybelline"}, {"icon": "water_drop", "name": "Neutrogena"}, {"icon": "ac_unit", "name": "Nivea"}, {"icon": "science", "name": "Vichy"}, {"icon": "healing", "name": "Eucerin"}]}', true, 5, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (18, 'about', 'Nosotros', '{"text": "En DAIS, creemos que la belleza es una forma de expresión personal. Desde nuestros inicios, nos hemos dedicado a seleccionar los mejores productos de belleza, skincare y bienestar para ofrecer a nuestros clientes una experiencia excepcional.\n\nTrabajamos directamente con laboratorios y fabricantes de prestigio para garantizar la más alta calidad en cada producto que llega a tus manos. Nuestro compromiso es brindarte no solo productos extraordinarios, sino también el conocimiento y la asesoría que necesitas para potenciar tu negocio.", "stats": [{"label": "Productos premium", "number": "200+"}, {"label": "Clientes satisfechos", "number": "500+"}, {"label": "Años de experiencia", "number": "15+"}]}', true, 6, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (19, 'faq', 'FAQ', '{"items": [{"a": "Puedes explorar nuestro catálogo, agregar los productos a tu carrito y enviar tu pedido a través de WhatsApp.", "q": "¿Cómo realizo un pedido al por mayor?"}, {"a": "Trabajamos con pedidos desde $1,500 MXN.", "q": "¿Cuál es el monto mínimo de compra?"}, {"a": "Los envíos se realizan dentro de las siguientes 72 horas hábiles posteriores a la confirmación del pago.", "q": "¿Cuánto tiempo tarda el envío?"}, {"a": "Aceptamos transferencia bancaria, depósito en efectivo y pagos con tarjeta.", "q": "¿Qué métodos de pago aceptan?"}, {"a": "Aceptamos cambios y devoluciones dentro de los primeros 15 días.", "q": "¿Puedo devolver un producto?"}, {"a": "Sí, ofrecemos la venta de muestras para que puedas evaluar la calidad.", "q": "¿Ofrecen muestras?"}]}', true, 7, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (20, 'instagram-feed', 'Instagram', '{}', true, 8, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (21, 'newsletter', 'Newsletter', '{"title": "Únete a nuestra newsletter", "btnText": "Suscribirme", "subtitle": "Sé la primera en enterarte de nuevos lanzamientos, ofertas exclusivas y contenido de belleza."}', true, 9, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');
INSERT INTO public.page_sections (id, type, title, content, visible, sort_order, created_at, updated_at) VALUES (22, 'prefooter', 'Pre Footer', '{"email": "info@daisstore.co", "phone": "+57 300 000 0000", "address": "Montería, Córdoba, Colombia"}', true, 10, '2026-06-18 17:33:24.989794', '2026-06-18 17:33:24.989794');

-- site_settings
INSERT INTO site_settings (key, value) VALUES ('brand_name', 'Dais Store') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('tagline', 'Distribuidora Mayorista') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('hero_headline', 'Resalta tu belleza con Dais Store') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('hero_description', 'Distribuidora mayorista de cosméticos premium. Descubre nuestra colección curada para potenciar tu negocio de belleza.') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('cta_text', 'Ver Catálogo') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('footer_title', 'Dais Store: Distribuidora Mayorista') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('footer_description', 'Somos una distribuidora mayorista de cosméticos y accesorios de belleza premium en Colombia. Trabajamos con emprendedores y boutiques ofreciendo productos de alta calidad a precios competitivos.') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('contact_email', 'contacto@daistore.co') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('contact_location', 'Montería, Co') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('site_logo_url', '/uploads/1781635837295-883737420.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('site_logo_alt', '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('hero_bg_image_url', '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('hero_bg_image_alt', '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('about_image_url', '/uploads/1781635937850-764239877.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('about_image_alt', '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('site_name', 'DAIS Public Test') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('whatsapp', '573000000000') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('email', 'info@daisstore.co') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('address', 'Montería, Córdoba, Colombia') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
INSERT INTO site_settings (key, value) VALUES ('business_hours', 'Lun - Sáb: 8:00 AM - 6:00 PM') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Reset sequences
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 0) + 1, false);
SELECT setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 0) + 1, false);
SELECT setval('customers_id_seq', COALESCE((SELECT MAX(id) FROM customers), 0) + 1, false);
SELECT setval('inventory_id_seq', COALESCE((SELECT MAX(id) FROM inventory), 0) + 1, false);
SELECT setval('inventory_movements_id_seq', COALESCE((SELECT MAX(id) FROM inventory_movements), 0) + 1, false);
SELECT setval('messages_id_seq', COALESCE((SELECT MAX(id) FROM messages), 0) + 1, false);
SELECT setval('coupons_id_seq', COALESCE((SELECT MAX(id) FROM coupons), 0) + 1, false);
SELECT setval('accounting_entries_id_seq', COALESCE((SELECT MAX(id) FROM accounting_entries), 0) + 1, false);
SELECT setval('account_charts_id_seq', COALESCE((SELECT MAX(id) FROM account_charts), 0) + 1, false);
SELECT setval('cost_centers_id_seq', COALESCE((SELECT MAX(id) FROM cost_centers), 0) + 1, false);
SELECT setval('third_parties_id_seq', COALESCE((SELECT MAX(id) FROM third_parties), 0) + 1, false);
SELECT setval('journal_entries_id_seq', COALESCE((SELECT MAX(id) FROM journal_entries), 0) + 1, false);
SELECT setval('journal_entry_lines_id_seq', COALESCE((SELECT MAX(id) FROM journal_entry_lines), 0) + 1, false);
SELECT setval('invoices_id_seq', COALESCE((SELECT MAX(id) FROM invoices), 0) + 1, false);
SELECT setval('invoice_items_id_seq', COALESCE((SELECT MAX(id) FROM invoice_items), 0) + 1, false);
SELECT setval('accounts_receivable_payable_id_seq', COALESCE((SELECT MAX(id) FROM accounts_receivable_payable), 0) + 1, false);
SELECT setval('bank_accounts_id_seq', COALESCE((SELECT MAX(id) FROM bank_accounts), 0) + 1, false);
SELECT setval('bank_reconciliation_id_seq', COALESCE((SELECT MAX(id) FROM bank_reconciliation), 0) + 1, false);
SELECT setval('quotations_id_seq', COALESCE((SELECT MAX(id) FROM quotations), 0) + 1, false);
SELECT setval('catalogs_id_seq', COALESCE((SELECT MAX(id) FROM catalogs), 0) + 1, false);
SELECT setval('design_tokens_id_seq', COALESCE((SELECT MAX(id) FROM design_tokens), 0) + 1, false);
SELECT setval('page_sections_id_seq', COALESCE((SELECT MAX(id) FROM page_sections), 0) + 1, false);