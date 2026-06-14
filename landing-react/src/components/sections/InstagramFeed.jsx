const images = [
  { src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80', likes: 2847 },
  { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80', likes: 1932 },
  { src: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=500&q=80', likes: 3521 },
  { src: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80', likes: 2104 },
  { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80', likes: 4578 },
  { src: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80', likes: 3210 },
  { src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80', likes: 1795 },
  { src: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&q=80', likes: 2634 },
];

export default function InstagramFeed() {
  return (
    <section id="instagram" className="py-28 lg:py-36 bg-white">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">@dais_store</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Síguenos en Instagram
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {images.map((item, i) => (
            <a
              key={i}
              href="https://instagram.com/dais_store"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-item relative aspect-square overflow-hidden group"
            >
              <img src={item.src} alt="" className="w-full h-full object-cover" />
              <div className="instagram-overlay absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-white font-inter text-xs font-medium">{item.likes.toLocaleString()}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
