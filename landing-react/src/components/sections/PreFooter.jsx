import SocialIcon, { SOCIAL_LINKS } from '../ui/SocialIcons.jsx';

export default function PreFooter() {
  return (
    <section className="py-20 lg:py-28 bg-white border-t border-[var(--color-warm-gray)]/40">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-5xl italic text-[var(--color-gold)] mb-4">DAIS</h2>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] max-w-md leading-relaxed">
              Distribuidora mayorista de productos de belleza premium.
              Calidad excepcional para tu negocio en toda Colombia.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
              {SOCIAL_LINKS.map(s => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                  className="social-icon-gold">
                  <SocialIcon icon={s.key} size={16} />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-5 font-inter text-sm text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 flex items-center justify-center border border-[var(--color-warm-gray)]/60 text-[var(--color-gold)]">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </span>
              <span>Montería, Córdoba, Colombia</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 flex items-center justify-center border border-[var(--color-warm-gray)]/60 text-[var(--color-gold)]">
                <span className="material-symbols-outlined text-[18px]">call</span>
              </span>
              <a href={`tel:${import.meta.env.VITE_WHATSAPP_NUMBER || '+573000000000'}`} className="hover:text-[var(--color-gold)] transition-colors">
                {import.meta.env.VITE_WHATSAPP_NUMBER || '+57 300 000 0000'}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 flex items-center justify-center border border-[var(--color-warm-gray)]/60 text-[var(--color-gold)]">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <a href="mailto:info@daisstore.co" className="hover:text-[var(--color-gold)] transition-colors">info@daisstore.co</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
