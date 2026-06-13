-- Run this in PostgreSQL: psql -U postgres -d dais_store -f server/src/migrations/002_seed_images.sql

-- Products table (if not exists)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT '$',
  description TEXT,
  image_url TEXT,
  image_data TEXT,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings (if not exists)
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing products & reseed
DELETE FROM inventory;
DELETE FROM products;

INSERT INTO products (name, price, currency, description, image_url, category) VALUES
('Strawberry Facial Serum', 38900, '$',
 'Suero facial con extracto de fresa y vitamina C. Ilumina, hidrata y protege la piel del daño oxidativo. Ideal para todo tipo de piel.',
 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80', 'Rostro'),

('Rose Gold Brush Set', 32800, '$',
 'Set de 6 brochas de maquillaje con mangos de acero inoxidable rosa dorado. Cerdas sintéticas ultra suaves. Estuche incluido.',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', 'Maquillaje'),

('Golden Nude Palette', 41300, '$',
 'Paleta de sombras con 12 tonos nude mate y brillantes. Pigmentación intensa y larga duración. Acabado profesional.',
 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80', 'Maquillaje'),

('Aurora Hydrating Cream', 45600, '$',
 'Crema hidratante de día con ácido hialurónico y extracto de rosa. Textura ligera de rápida absorción. Piel radiante todo el día.',
 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80', 'Rostro'),

('Elegant Hairclips Set', 15500, '$',
 'Set de 6 pinzas para cabello estilo carey y dorado. Diseño elegante y moderno. Sujeta sin dañar el cabello.',
 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', 'Accesorios'),

('Soft Rose Liquid Blush', 27200, '$',
 'Rubor líquido mate de larga duración. Fórmula ligera que se difumina fácilmente. Tonos rosados naturales.',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', 'Maquillaje'),

('Velvet Lipstick Collection', 35800, '$',
 'Colección de 3 labiales mate terciopelo. Fórmula enriquecida con vitamina E. Larga duración sin resecar los labios.',
 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80', 'Maquillaje'),

('Daily Protection SPF50', 32000, '$',
 'Protector solar facial SPF50+ textura ligera. Protege de rayos UVA/UVB. No graso, ideal para uso diario bajo el maquillaje.',
 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80', 'Rostro');

-- Seed inventory
INSERT INTO inventory (product_id, quantity, min_stock)
SELECT id, 50, 10 FROM products
ON CONFLICT (product_id) DO NOTHING;

-- Seed site settings
INSERT INTO site_settings (key, value) VALUES
('site_name', 'Dais Store'),
('whatsapp', '573000000000'),
('email', 'info@daisstore.co'),
('address', 'Montería, Córdoba, Colombia'),
('business_hours', 'Lun - Sáb: 8:00 AM - 6:00 PM')
ON CONFLICT (key) DO NOTHING;
