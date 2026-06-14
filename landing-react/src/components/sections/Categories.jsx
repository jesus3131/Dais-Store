const categories = [
  { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=800&q=80', count: '24 productos' },
  { name: 'Maquillaje', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', count: '18 productos' },
  { name: 'Fragancias', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', count: '12 productos' },
  { name: 'Accesorios', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', count: '30 productos' },
  { name: 'Wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', count: '15 productos' },
  { name: 'Ediciones Limitadas', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', count: '6 productos' },
];

export default function Categories() {
  return (
    <section id="categories" className="py-28 lg:py-36 bg-[var(--color-surface-container)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Categorías</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Explora por categoría
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {categories.map((cat, i) => (
            <a key={i} href="#catalog"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="category-card group relative aspect-[4/5] block"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="category-overlay absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">{cat.count}</span>
                <h3 className="font-headline text-[var(--text-headline-xl)] text-white mt-2">{cat.name}</h3>
                <div className="category-btn mt-4">
                  <span className="inline-flex items-center gap-2 text-[11px] font-inter uppercase tracking-[0.18em] text-[var(--color-gold)]">
                    Explorar
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
