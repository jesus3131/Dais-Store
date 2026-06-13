export default function Newsletter() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--color-primary)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block material-symbols-outlined text-5xl text-white/80 mb-6">mail</span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-white mb-4">
            Mantente al Día
          </h2>
          <p className="font-body-md text-white/80 mb-8">
            Suscríbete a nuestro newsletter y recibe las últimas novedades, promociones exclusivas y consejos de belleza directamente en tu correo.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-5 py-3.5 rounded-full font-manrope text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-white text-[var(--color-primary)] font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-white/90 transition-all duration-300"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
