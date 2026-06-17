const defaultBrands = [
  { name: "L'Oréal", icon: 'spa' },
  { name: 'Maybelline', icon: 'brush' },
  { name: 'Neutrogena', icon: 'water_drop' },
  { name: 'Nivea', icon: 'ac_unit' },
  { name: 'Vichy', icon: 'science' },
  { name: 'Eucerin', icon: 'healing' },
];

export default function Branding({ sectionData = {} }) {
  const brands = sectionData.brands || defaultBrands;
  return (
    <section id="brands" className="py-28 lg:py-36 bg-[var(--color-ivory)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Marcas</span>
          <div className="w-10 h-[1px] bg-[var(--color-gold)] mx-auto mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Trabajamos con las mejores marcas
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-10 lg:gap-20 stagger-children">
          {brands.map((brand, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group">
              <div className="w-20 h-20 flex items-center justify-center bg-white border border-[var(--color-warm-gray)]/40 group-hover:border-[var(--color-gold)]/40 transition-all duration-500 group-hover:shadow-gold">
                <span className="material-symbols-outlined text-[var(--color-gold)] text-3xl">{brand.icon}</span>
              </div>
              <span className="font-inter text-xs uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-gold)] transition-colors">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
