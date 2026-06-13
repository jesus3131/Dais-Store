export default function InstagramFeed() {
  return (
    <section id="instagram" className="py-24 lg:py-32 bg-[var(--color-surface)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
            @dais_store
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
            Síguenos en <span className="text-[var(--color-secondary)]">Instagram</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <a key={i} href="https://instagram.com/dais_store" target="_blank" rel="noopener noreferrer" className="instagram-item relative aspect-square bg-[var(--color-surface-container-high)] overflow-hidden group">
              <div className="w-full h-full bg-gradient-to-br from-[var(--color-secondary-container)] to-[var(--color-primary-container)] flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[var(--color-secondary)]/40">photo_camera</span>
              </div>
              <div className="instagram-overlay absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
