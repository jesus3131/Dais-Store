const images = [
  { src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80' },
  { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80' },
  { src: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=500&q=80' },
  { src: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80' },
];

function extractHandle(url) {
  if (!url) return 'dais_store';
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/\/$/, '').split('/');
    return parts[parts.length - 1] || 'dais_store';
  } catch { return 'dais_store'; }
}

export default function InstagramFeed({ settings = {} }) {
  const igUrl = settings.social_instagram || 'https://instagram.com/dais_store';
  const handle = extractHandle(igUrl);
  return (
    <section id="instagram" className="py-16 lg:py-20 bg-[var(--color-pastel-white)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">@{handle}</span>
            <h3 className="font-headline text-[var(--text-headline-xl)] text-[var(--color-near-black)] mt-2">Síguenos en Instagram</h3>
          </div>
          <a href={igUrl} target="_blank" rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 text-[11px] font-inter uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors">
            Ir al perfil
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {images.map((item, i) => (
            <a key={i} href={igUrl} target="_blank" rel="noopener noreferrer"
              className="instagram-item relative aspect-square overflow-hidden group">
              <img src={item.src} alt="" className="w-full h-full object-cover" />
              <div className="instagram-overlay absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>instagram</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
