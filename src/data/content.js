export const siteData = {
  brandName: 'Dais Store',
  tagline: 'Distribuidora Mayorista',
  heroHeadline: 'Resalta tu belleza con Dais Store',
  heroDescription: 'Distribuidora mayorista de cosméticos premium. Descubre nuestra colección curada para potenciar tu negocio de belleza.',
  heroImages: [
    { src: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=240&h=400&fit=crop', alt: 'Serum de noche' },
    { src: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=240&h=400&fit=crop', alt: 'Crema hidratante' },
    { src: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=240&h=400&fit=crop', alt: 'Aceite facial' },
  ],
  ctaText: 'Ver Catálogo',
  ctaHref: '#productos',
  sectionTitles: {
    steps: '¿Cómo funciona?',
    products: 'Nuestra Selección',
  },
  footer: {
    title: 'Dais Store: Distribuidora Mayorista',
    description: 'Somos una distribuidora mayorista de cosméticos y accesorios de belleza premium en Colombia. Trabajamos con emprendedores y boutiques ofreciendo productos de alta calidad a precios competitivos.',
  },
  contact: {
    email: 'contacto@daistore.co',
    location: 'Montería, Co',
  },
};

export const steps = [
  {
    icon: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    title: 'Elige productos',
    description: 'Selecciona tus favoritos de nuestro catálogo mayorista.',
  },
  {
    icon: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    title: 'Envía a WhatsApp',
    description: 'Comparte tu pedido con nosotros por WhatsApp.',
  },
  {
    icon: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    title: 'Paga',
    description: 'Recibe los datos de pago y confirma tu pedido.',
  },
  {
    icon: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    title: 'Despachamos',
    description: 'Coordinamos el envío a todo Colombia.',
  },
];

export const products = [
  { id: 1, name: 'Strawberry Facial Serum', price: 38900, currency: '$', description: 'Suero facial con extracto de fresa y vitamina C', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=533&fit=crop', category: 'serum' },
  { id: 2, name: 'Elegant Hairclips', price: 15500, currency: '$', description: 'Set de 4 pinzas para cabello con acabado dorado', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=533&fit=crop', category: 'accesorios' },
  { id: 3, name: 'Soft Rose Liquid Blush', price: 27200, currency: '$', description: 'Rubor líquido de larga duración tono rosa suave', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=533&fit=crop', category: 'maquillaje' },
  { id: 4, name: 'Aurora Hydrating Cream', price: 45600, currency: '$', description: 'Crema hidratante con ácido hialurónico y colágeno', image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=533&fit=crop', category: 'cuidado' },
  { id: 5, name: 'Rose Gold Brush Set', price: 32800, currency: '$', description: 'Set de 6 brochas con mango rosa dorado', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=533&fit=crop', category: 'accesorios' },
  { id: 6, name: 'Golden Nude Palette', price: 41300, currency: '$', description: 'Paleta de sombras con 12 tonos nude y dorados', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=533&fit=crop', category: 'maquillaje' },
];
