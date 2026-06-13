export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-[var(--color-surface)] overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-container)]/30 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[var(--color-secondary-container)]/20 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-[var(--color-primary-container)]/20 blur-3xl" />
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)] relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-6 font-manrope font-semibold">
            Distribuidora Mayorista de Belleza
          </span>
          <h1 className="font-display-lg text-[var(--text-display-lg)] text-[var(--color-on-background)] mb-6 leading-[1.1]">
            Belleza que Inspira,<br />
            <span className="text-[var(--color-secondary)]">Historia que Perdura</span>
          </h1>
          <p className="font-body-lg text-[var(--color-on-surface-variant)] mb-10 max-w-xl mx-auto">
            Descubre nuestra exclusiva colección de productos de belleza y cuidado personal. Calidad premium para tu negocio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all duration-300"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Ver Catálogo
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-outline)] text-[var(--color-on-surface)] font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-surface-container-high)] transition-all duration-300"
              onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Cómo Comprar
            </a>
          </div>
        </div>
        <div className="mt-16 lg:mt-20">
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-16 opacity-50">
            {['Beauty Co', 'GlowLab', 'SkinPro', 'NaturaCos', 'BellezaPura'].map((name, i) => (
              <span key={i} className="font-headline-sm text-lg lg:text-2xl text-[var(--color-on-surface-variant)] italic">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
