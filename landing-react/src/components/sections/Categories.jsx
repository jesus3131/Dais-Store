

const defaultCats = [
  { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80' },
  { name: 'Maquillaje', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80' },
  { name: 'Cabello', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80' },
];

export default function Categories({ sectionData = {} }) {
  const items = (sectionData.categories || defaultCats).map(c => ({
    ...c,
    image_url: c.image_url || c.image,
  }));

  return (
    <section id="categories" className="py-20 lg:py-24 bg-[var(--color-ivory)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-12">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Categorías</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Explora por categoría
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {items.map((cat, idx) => (
            <a key={idx} href="#catalog"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative h-64 lg:h-80 overflow-hidden bg-[var(--color-ivory-dark)] block">
              <img src={cat.image_url || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80'}
                alt={cat.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,27,27,0.5)] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <h3 className="font-headline text-xl lg:text-2xl text-white">{cat.name}</h3>
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                  <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-gold)]">Explorar</span>
                  <span className="material-symbols-outlined text-[14px] text-[var(--color-gold)]">arrow_forward</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
