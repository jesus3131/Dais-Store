export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-[var(--color-surface)] overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80"
          alt="Cosmeticos"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.35)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-charcoal)]/80 via-[var(--color-charcoal)]/60 to-transparent" />
      </div>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)] relative z-20 w-full">
        <div className="max-w-2xl">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-6 font-manrope font-semibold">
            Distribuidora Mayorista de Belleza
          </span>
          <h1 className="font-display-lg text-[var(--text-display-lg)] text-white mb-6 leading-[1.1]">
            Resalta tu belleza,<br />
            <span className="text-[var(--color-gold)]">impulsa tu negocio</span>
          </h1>
          <p className="font-body-lg text-white/70 mb-10 max-w-lg leading-relaxed">
            Descubre nuestra exclusiva colección de productos de belleza y cuidado personal al por mayor. Calidad premium para emprendedores y tiendas en toda Colombia.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="#catalog"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-primary"
            >
              Ver Catálogo
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-gold)] text-[var(--color-gold)] font-manrope font-semibold text-sm uppercase tracking-[0.12em] hover:bg-[var(--color-gold)] hover:text-white transition-all duration-300"
            >
              Cómo Comprar
            </a>
          </div>
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
        <span className="material-symbols-outlined text-[var(--color-gold)] animate-bounce">expand_more</span>
      </div>
    </section>
  );
}
