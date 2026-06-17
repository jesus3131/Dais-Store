CREATE TABLE IF NOT EXISTS page_sections (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) DEFAULT '',
  content JSONB DEFAULT '{}',
  visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS design_tokens (
  id SERIAL PRIMARY KEY,
  token_name VARCHAR(100) UNIQUE NOT NULL,
  token_value VARCHAR(200) NOT NULL DEFAULT '',
  category VARCHAR(50) DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO design_tokens (token_name, token_value, category) VALUES
  ('color-gold', '#e8cfa6', 'color'),
  ('color-gold-light', '#f5e8d0', 'color'),
  ('color-gold-dark', '#c9a84b', 'color'),
  ('color-pastel-pink', '#fdf0f3', 'color'),
  ('color-pastel-pink-dark', '#fce4ea', 'color'),
  ('color-pastel-white', '#fffbfc', 'color'),
  ('color-near-black', '#1c1b1b', 'color'),
  ('color-on-surface-variant', '#4a4440', 'color'),
  ('color-warm-gray', '#f0e0e4', 'color'),
  ('color-ivory', '#fdf0f3', 'color')
ON CONFLICT (token_name) DO NOTHING;

INSERT INTO page_sections (type, title, content, visible, sort_order) VALUES
  ('hero', 'Hero', '{"bgImage":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80","badge":"Edición Limitada","title":"Transforma tu rutina\nen una experiencia\nextraordinaria","subtitle":"Descubre una selección curada de productos de belleza, skincare y bienestar. Cada detalle ha sido pensado para elevar tu ritual diario a una experiencia de lujo.","btnPrimary":"Explorar Colección","btnSecondary":"Conocer la Marca"}', true, 0),
  ('how-it-works', 'Cómo funciona', '{"steps":[{"icon":"search","title":"Descubre","desc":"Explora nuestra colección curada de productos premium para el cuidado personal."},{"icon":"checklist","title":"Selecciona","desc":"Elige los productos que mejor se adapten a tu estilo y necesidades."},{"icon":"auto_awesome","title":"Personaliza","desc":"Recibe asesoría personalizada de nuestros expertos en belleza."},{"icon":"local_shipping","title":"Recibe","desc":"Disfruta de envíos rápidos y empaques premium que cuidan cada detalle."}]}', true, 1),
  ('categories', 'Categorías', '{"categories":[{"name":"Skincare","image":"https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80"},{"name":"Maquillaje","image":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"},{"name":"Cabello","image":"https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80"}]}', true, 2),
  ('catalog', 'Productos', '{}', true, 3),
  ('testimonials', 'Testimonios', '{"items":[{"name":"María Fernanda G.","role":"Emprendedora de Belleza","text":"Desde que trabajo con DAIS, la calidad de mis productos se ha disparado. Mis clientas notan la diferencia y yo también. El servicio al cliente es impecable.","rating":5},{"name":"Carlos E. Mendoza","role":"Dueño de Salón","text":"La variedad de productos y los precios mayoristas son insuperables. Los envíos siempre llegan a tiempo y en perfectas condiciones. Altamente recomendados.","rating":5},{"name":"Ana Lucía R.","role":"Distribuidora Independiente","text":"DAIS me ha permitido hacer crecer mi negocio de manera increíble. La asesoría personalizada y la calidad de los productos marcan la diferencia.","rating":5}]}', true, 4),
  ('branding', 'Marcas', '{"brands":[{"name":"L''Oréal","icon":"spa"},{"name":"Maybelline","icon":"brush"},{"name":"Neutrogena","icon":"water_drop"},{"name":"Nivea","icon":"ac_unit"},{"name":"Vichy","icon":"science"},{"name":"Eucerin","icon":"healing"}]}', true, 5),
  ('about', 'Nosotros', '{"text":"En DAIS, creemos que la belleza es una forma de expresión personal. Desde nuestros inicios, nos hemos dedicado a seleccionar los mejores productos de belleza, skincare y bienestar para ofrecer a nuestros clientes una experiencia excepcional.\n\nTrabajamos directamente con laboratorios y fabricantes de prestigio para garantizar la más alta calidad en cada producto que llega a tus manos. Nuestro compromiso es brindarte no solo productos extraordinarios, sino también el conocimiento y la asesoría que necesitas para potenciar tu negocio.","stats":[{"number":"200+","label":"Productos premium"},{"number":"500+","label":"Clientes satisfechos"},{"number":"15+","label":"Años de experiencia"}]}', true, 6),
  ('faq', 'FAQ', '{"items":[{"q":"¿Cómo realizo un pedido al por mayor?","a":"Puedes explorar nuestro catálogo, agregar los productos a tu carrito y enviar tu pedido a través de WhatsApp."},{"q":"¿Cuál es el monto mínimo de compra?","a":"Trabajamos con pedidos desde $1,500 MXN."},{"q":"¿Cuánto tiempo tarda el envío?","a":"Los envíos se realizan dentro de las siguientes 72 horas hábiles posteriores a la confirmación del pago."},{"q":"¿Qué métodos de pago aceptan?","a":"Aceptamos transferencia bancaria, depósito en efectivo y pagos con tarjeta."},{"q":"¿Puedo devolver un producto?","a":"Aceptamos cambios y devoluciones dentro de los primeros 15 días."},{"q":"¿Ofrecen muestras?","a":"Sí, ofrecemos la venta de muestras para que puedas evaluar la calidad."}]}', true, 7),
  ('instagram-feed', 'Instagram', '{}', true, 8),
  ('newsletter', 'Newsletter', '{"title":"Únete a nuestra newsletter","subtitle":"Sé la primera en enterarte de nuevos lanzamientos, ofertas exclusivas y contenido de belleza.","btnText":"Suscribirme"}', true, 9),
  ('prefooter', 'Pre Footer', '{"address":"Montería, Córdoba, Colombia","phone":"+57 300 000 0000","email":"info@daisstore.co"}', true, 10)
ON CONFLICT DO NOTHING;
