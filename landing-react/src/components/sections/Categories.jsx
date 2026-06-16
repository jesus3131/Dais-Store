const categories = [
  { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=800&q=80', count: '24' },
  { name: 'Maquillaje', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', count: '18' },
  { name: 'Fragancias', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', count: '12' },
  { name: 'Accesorios', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', count: '30' },
  { name: 'Wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', count: '15' },
  { name: 'Ediciones Limitadas', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', count: '6' },
];

export default function Categories() {
  return (
    <section id="categories" className="py-12 lg:py-16 bg-[var(--color-surface-container)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(242,198,222,0.06)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)] relative">
        <div className="text-center mb-8">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Categorías</span>
          <h2 className="font-display text-[26px] lg:text-[var(--text-display-md)] text-[var(--color-near-black)] mt-1.5 leading-tight">
            Explora por categoría
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-5">
          {categories.map((cat, i) => (
            <a
              key={i}
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`category-card group relative block overflow-hidden ${i % 3 === 1 ? 'aspect-[5/6]' : 'aspect-[4/5]'}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="category-overlay absolute inset-0" />
              <div className="category-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" />
              <div className="category-frame absolute inset-0 opacity-0 group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="overflow-hidden">
                  <h3 className="font-display text-[18px] lg:text-[24px] text-white leading-tight translate-y-0 group-hover:-translate-y-px transition-transform duration-500">
                    {cat.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="block w-6 h-px bg-[var(--color-gold)] category-gold-rule" />
                  <span className="font-inter text-[9px] uppercase tracking-[0.18em] text-[var(--color-gold)]/90">
                    {cat.count} productos
                  </span>
                </div>
              </div>
              <div className="absolute top-0 left-0 h-px bg-[var(--color-gold)] category-border-top" />
              <div className="absolute bottom-0 right-0 h-px bg-[var(--color-gold)] category-border-bottom" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
