const images = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
  'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=400&q=80',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&q=80',
];

export default function InstagramFeed() {
  return (
    <section id="instagram" className="py-24 lg:py-32 bg-[var(--color-surface)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-4 font-manrope font-semibold">
            @dais_store
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
            Síguenos en <span className="text-[var(--color-gold)]">Instagram</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3">
          {images.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/dais_store"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-item relative aspect-square overflow-hidden group"
            >
              <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
