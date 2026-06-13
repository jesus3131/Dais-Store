CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  filename VARCHAR(255),
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO inventory (product_id, quantity, min_stock)
SELECT id, 50, 10 FROM products
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO orders (customer_name, phone, email, items, total, status, created_at) VALUES
('María García', '3001234567', 'maria@email.com', '[{"name":"Strawberry Facial Serum","qty":2,"price":38900},{"name":"Rose Gold Brush Set","qty":1,"price":32800}]'::jsonb, 110600, 'delivered', NOW() - INTERVAL '7 days'),
('Carlos López', '3109876543', 'carlos@email.com', '[{"name":"Golden Nude Palette","qty":1,"price":41300}]'::jsonb, 41300, 'shipped', NOW() - INTERVAL '3 days'),
('Ana Martínez', '3204567890', 'ana@email.com', '[{"name":"Soft Rose Liquid Blush","qty":3,"price":27200},{"name":"Aurora Hydrating Cream","qty":2,"price":45600}]'::jsonb, 172800, 'pending', NOW() - INTERVAL '1 day'),
('Pedro Rodríguez', '3012345678', 'pedro@email.com', '[{"name":"Elegant Hairclips","qty":5,"price":15500}]'::jsonb, 77500, 'pending', NOW()),
('Laura Gómez', '3156789012', 'laura@email.com', '[{"name":"Strawberry Facial Serum","qty":1,"price":38900},{"name":"Aurora Hydrating Cream","qty":1,"price":45600},{"name":"Golden Nude Palette","qty":2,"price":41300}]'::jsonb, 167100, 'delivered', NOW() - INTERVAL '14 days');

INSERT INTO messages (name, phone, email, message) VALUES
('Sofía Torres', '3001112233', 'sofia@email.com', 'Hola, me interesa comprar al por mayor sus serums faciales. ¿Cuál es el mínimo de compra?'),
('Andrés Ruiz', '3102223344', 'andres@email.com', 'Buen día, quisiera saber si hacen envíos a Medellín y cuánto tiempo demoran.'),
('Valentina Ortiz', '3203334455', 'vale@email.com', 'Excelentes productos! Compré el set de brochas y la calidad es increíble. ¿Tendrán nuevos colores pronto?'),
('Diego Moreno', '3014445566', 'diego@email.com', 'Soy dueño de una boutique en Cartagena. Me gustaría recibir el catálogo completo con precios mayoristas.');
