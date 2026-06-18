-- Seed demo data only on fresh install (no products exist yet)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, price, currency, description, image_url, category) VALUES
      ('Strawberry Facial Serum', 38900, '$', 'Suero facial con extracto de fresa y vitamina C. Ilumina, hidrata y protege la piel del daño oxidativo. Ideal para todo tipo de piel.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80', 'Rostro'),
      ('Rose Gold Brush Set', 32800, '$', 'Set de 6 brochas de maquillaje con mangos de acero inoxidable rosa dorado. Cerdas sintéticas ultra suaves. Estuche incluido.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', 'Maquillaje'),
      ('Golden Nude Palette', 41300, '$', 'Paleta de sombras con 12 tonos nude mate y brillantes. Pigmentación intensa y larga duración. Acabado profesional.', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80', 'Maquillaje'),
      ('Aurora Hydrating Cream', 45600, '$', 'Crema hidratante de día con ácido hialurónico y extracto de rosa. Textura ligera de rápida absorción. Piel radiante todo el día.', 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80', 'Rostro'),
      ('Elegant Hairclips Set', 15500, '$', 'Set de 6 pinzas para cabello estilo carey y dorado. Diseño elegante y moderno. Sujeta sin dañar el cabello.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', 'Accesorios'),
      ('Soft Rose Liquid Blush', 27200, '$', 'Rubor líquido mate de larga duración. Fórmula ligera que se difumina fácilmente. Tonos rosados naturales.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', 'Maquillaje'),
      ('Velvet Lipstick Collection', 35800, '$', 'Colección de 3 labiales mate terciopelo. Fórmula enriquecida con vitamina E. Larga duración sin resecar los labios.', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80', 'Maquillaje'),
      ('Daily Protection SPF50', 32000, '$', 'Protector solar facial SPF50+ textura ligera. Protege de rayos UVA/UVB. No graso, ideal para uso diario bajo el maquillaje.', 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80', 'Rostro');
  END IF;
END $$;

INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Dais Store'),
  ('whatsapp', '573000000000'),
  ('email', 'info@daisstore.co'),
  ('address', 'Montería, Córdoba, Colombia'),
  ('business_hours', 'Lun - Sáb: 8:00 AM - 6:00 PM'),
  ('site_logo_url', ''),
  ('site_logo_alt', 'Logo'),
  ('hero_bg_image_url', ''),
  ('hero_bg_image_alt', 'Hero'),
  ('about_image_url', ''),
  ('about_image_alt', 'Historia')
ON CONFLICT (key) DO NOTHING;
