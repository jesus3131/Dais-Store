-- Sync local data to production

-- 1. Site Settings
INSERT INTO site_settings (key, value) VALUES
('about_image_alt', ''),
('about_image_url', '/uploads/1781635937850-764239877.png'),
('address', 'Montería, Córdoba, Colombia'),
('brand_name', 'Dais Store'),
('business_hours', 'Lun - Sáb: 8:00 AM - 6:00 PM'),
('contact_email', 'contacto@daistore.co'),
('contact_location', 'Montería, Co'),
('cta_text', 'Ver Catálogo'),
('email', 'info@daisstore.co'),
('footer_description', 'Somos una distribuidora mayorista de cosméticos y accesorios de belleza premium en Colombia. Trabajamos con emprendedores y boutiques ofreciendo productos de alta calidad a precios competitivos.'),
('footer_title', 'Dais Store: Distribuidora Mayorista'),
('hero_bg_image_alt', ''),
('hero_bg_image_url', ''),
('hero_description', 'Distribuidora mayorista de cosméticos premium. Descubre nuestra colección curada para potenciar tu negocio de belleza.'),
('hero_headline', 'Resalta tu belleza con Dais Store'),
('site_logo_alt', ''),
('site_logo_url', '/uploads/1781635837295-883737420.png'),
('site_name', 'DAIS'),
('tagline', 'Distribuidora Mayorista'),
('whatsapp', '573000000000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 2. Page Sections (update existing, insert new)
INSERT INTO page_sections (type, title, content, visible, sort_order) VALUES
('hero', 'Hero', '{"bgImage":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80","badge":"Edición Limitada","title":"Transforma tu rutina de belleza","subtitle":"Descubre nuestra colección premium de cosméticos y accesorios","ctaText":"Explorar Colección"}', true, 0),
('catalog', 'Catálogo', '{"title":"Colección Premium","subtitle":"Productos seleccionados para resaltar tu belleza natural"}', true, 1),
('categories', 'Categorías', '{"title":"Categorías","subtitle":"Explora por categoría"}', true, 2),
('about', 'Nosotros', '{"title":"Nuestra Historia","content":"<p>En Dais Store, creemos que la belleza es una forma de expresión personal. Nacimos en Montería con la misión de ofrecer cosméticos y accesorios de alta calidad.</p><p>Trabajamos directamente con laboratorios y fabricantes certificados para garantizar productos seguros, eficaces y con los más altos estándares de calidad.</p>","image":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80","stats":[{"value":"500+","label":"Clientes Satisfechos"},{"value":"50+","label":"Productos Premium"},{"value":"5","label":"Años de Experiencia"},{"value":"24/7","label":"Soporte"}]}', true, 3),
('testimonials', 'Testimonios', '{"title":"Lo que dicen nuestros clientes","testimonials":[{"name":"María García","role":"Emprendedora","content":"Los productos de Dais Store transformaron mi negocio. La calidad es excepcional y mis clientas están encantadas.","rating":5},{"name":"Carlos López","role":"Dueño de Boutique","content":"Como distribuidora, Dais Store es mi aliado perfecto. Precios competitivos y una variedad increíble de productos.","rating":5},{"name":"Ana Martínez","role":"Maquilladora Profesional","content":"La calidad de los productos es insuperable. Mis clientas notan la diferencia.","rating":5}]}', true, 4),
('instagram-feed', 'Instagram', '{"title":"Síguenos en @daisstoreco"}', true, 5),
('footer', 'Footer', '{"description":"Somos una distribuidora mayorista de cosméticos premium en Colombia.","social":{"instagram":"https://instagram.com/daisstoreco","facebook":"https://facebook.com/daisstoreco","tiktok":"https://tiktok.com/@daisstoreco"}}', true, 6),
('wholesale', 'Venta por Mayor', '{"title":"Venta por Mayor","subtitle":"Precios especiales para emprendedores y boutiques","features":["Mínimo 6 unidades por producto","Descuentos progresivos","Envíos a todo Colombia","Facturación electrónica"],"ctaText":"Solicitar Cotización"}', true, 7),
('benefits', 'Beneficios', '{"title":"¿Por qué elegir Dais Store?","benefits":[{"icon":"verified","title":"Calidad Premium","description":"Productos certificados"},{"icon":"local_shipping","title":"Envío Nacional","description":"Entregas rápidas a todo Colombia"},{"icon":"support_agent","title":"Soporte 24/7","description":"Atención personalizada"},{"icon":"card_giftcard","title":"Fidelidad","description":"Beneficios exclusivos para clientes frecuentes"}]}', true, 8)
ON CONFLICT DO NOTHING;

-- 3. Design Tokens (update existing, insert new)
INSERT INTO design_tokens (token_name, token_value, category) VALUES
('primary-color', '#d4af37', 'colors'),
('primary-hover', '#c9a032', 'colors'),
('secondary-color', '#1a1a1a', 'colors'),
('secondary-hover', '#333333', 'colors'),
('accent-color', '#8B7355', 'colors'),
('bg-primary', '#F5F0EB', 'colors'),
('bg-secondary', '#ECE5DC', 'colors'),
('text-primary', '#1a1a1a', 'colors'),
('text-secondary', '#6B6258', 'colors'),
('border-color', '#D4C5B5', 'colors')
ON CONFLICT (token_name) DO UPDATE SET token_value = EXCLUDED.token_value, category = EXCLUDED.category;

-- 4. Ensure admin user exists (from env vars)
DO $$
DECLARE
  u VARCHAR := COALESCE(current_setting('app.admin_username', true), 'admin');
  p VARCHAR := COALESCE(current_setting('app.admin_password', true), 'dais2024');
  h VARCHAR;
BEGIN
  h := crypt(p, gen_salt('bf'));
  INSERT INTO users (username, email, full_name, password_hash, role, modules, is_active, is_superuser)
  VALUES (u, u || '@daisstore.com', 'Administrador', h, 'admin', '["*"]'::jsonb, true, true)
  ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    modules = '["*"]'::jsonb,
    is_active = true;
END $$;
