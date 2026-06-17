import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const DEFAULT_COLLECTIONS = [
  {
    name: 'Skincare Essentials',
    desc: 'La base de una piel radiante y saludable.',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=800&q=80',
  },
  {
    name: 'Premium Accessories',
    desc: 'Detalles que elevan tu rutina diaria.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
  },
];

export default function FeaturedCollections() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.getSettings().then(s => setContent(s)).catch(() => {});
  }, []);

  let collections;
  try {
    collections = content?.featured_collections ? JSON.parse(content.featured_collections) : DEFAULT_COLLECTIONS;
  } catch {
    collections = DEFAULT_COLLECTIONS;
  }

  return (
    <section className="py-20 md:py-[120px] bg-white px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Colecciones Destacadas</h2>
          <div className="w-24 h-1 bg-burgundy-accent/50 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col, i) => (
            <a
              key={i}
              href="#catalog"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="relative h-[350px] rounded-2xl overflow-hidden group cursor-pointer reveal-on-scroll bg-primary"
            >
              <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="font-headline-md text-2xl md:text-3xl text-white mb-2">{col.name}</h3>
                <p className="text-white/80 font-body-md text-sm mb-6">{col.desc}</p>
                <span className="inline-block bg-burgundy-accent text-white px-8 py-3 rounded-full font-label-md text-[12px] hover:bg-primary transition-all duration-300 tracking-wider uppercase shadow-md">
                  Explorar Colección
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
