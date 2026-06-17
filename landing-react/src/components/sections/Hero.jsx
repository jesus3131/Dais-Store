import { useState } from 'react';

export default function Hero({ sectionData = {}, settings = {} }) {
  const [heroBg] = useState(sectionData.bgImage || settings.hero_bg_image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80');

  const {
    badge = 'Edición Limitada',
    title = 'Transforma tu rutina\nen una experiencia\nextraordinaria',
    subtitle = 'Descubre una selección curada de productos de belleza, skincare y bienestar. Cada detalle ha sido pensado para elevar tu ritual diario a una experiencia de lujo.',
    btnPrimary = 'Explorar Colección',
    btnSecondary = 'Conocer la Marca',
  } = sectionData;

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover parallax" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(28,27,27,0.6)] via-[rgba(232,207,166,0.2)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,27,27,0.3)] via-transparent to-transparent" />
      </div>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)] relative z-20 w-full">
        <div className="max-w-2xl">
          <div className="animate-fade-in-down">
            <span className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-gold)]/40 text-[var(--color-gold)] font-inter text-[10px] uppercase tracking-[0.2em] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] animate-gold-pulse" />
              {badge}
            </span>
          </div>
          <h1 className="animate-fade-in-up font-display text-[var(--text-display-xl)] text-white mb-6 leading-[0.95]" style={{ animationDelay: '0.2s' }}>
            {title.split('\n').map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h1>
          <p className="animate-fade-in-up font-body text-white/60 max-w-lg leading-relaxed mb-12" style={{ animationDelay: '0.4s' }}>
            {subtitle}
          </p>
          <div className="animate-fade-in-up flex flex-col sm:flex-row items-start gap-5" style={{ animationDelay: '0.6s' }}>
            <a
              href="#catalog"
              onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-gold"
            >
              {btnPrimary}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn-outline-gold"
            >
              {btnSecondary}
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-float">
        <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">expand_more</span>
      </div>
    </section>
  );
}
