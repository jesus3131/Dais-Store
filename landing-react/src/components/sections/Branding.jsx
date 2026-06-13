export default function Branding() {
  const brands = [
    { name: 'L\'Oréal', icon: 'spa' },
    { name: 'Maybelline', icon: 'brush' },
    { name: 'Neutrogena', icon: 'water_drop' },
    { name: 'Nivea', icon: 'ac_unit' },
    { name: 'Vichy', icon: 'science' },
    { name: 'Eucerin', icon: 'healing' },
  ];

  return (
    <section id="brands" className="py-24 lg:py-32 bg-[var(--color-surface-container-low)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
            Marcas
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
            Trabajamos con las <span className="text-[var(--color-secondary)]">Mejores Marcas</span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
          {brands.map((brand, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center luxury-shadow group-hover:shadow-lg transition-shadow">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-3xl">{brand.icon}</span>
              </div>
              <span className="font-manrope text-sm font-semibold text-[var(--color-on-surface-variant)]">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
