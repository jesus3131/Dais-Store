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
    <section id="categories" className="py-12 lg:py-16 bg-[var(--color-surface-container)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-8">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Categorías</span>
          <h2 className="font-headline text-[24px] lg:text-[var(--text-headline-xl)] text-[var(--color-near-black)] mt-2">
            Explora por categoría
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {categories.map((cat, i) => (
            <a
              key={i}
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="category-card group relative aspect-[5/6] block rounded-xl overflow-hidden border border-[var(--color-gold)]/10"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="category-overlay absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 className="font-headline text-[16px] lg:text-[20px] text-white leading-tight">
                  {cat.name}
                </h3>
                <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]/80">
                  {cat.count} productos
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
