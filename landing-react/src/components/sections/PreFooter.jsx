import SocialIcon, { SOCIAL_LINKS } from '../ui/SocialIcons.jsx';

const defaults = { address: 'Montería, Córdoba, Colombia', phone: '+57 300 000 0000', email: 'info@daisstore.co' };
const siteDefaults = { site_name: 'DAIS', site_description: 'Distribuidora mayorista de productos de belleza premium. Calidad excepcional para tu negocio en toda Colombia.' };

export default function PreFooter({ sectionData = {}, settings = {} }) {
  const s = { ...siteDefaults, ...settings };
  const { address, phone, email } = { ...defaults, ...sectionData };
  return (
    <section className="py-20 lg:py-28 bg-[var(--color-ivory)] border-t border-[var(--color-warm-gray)]/40">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-5xl italic text-[var(--color-gold)] mb-4">{s.site_name}</h2>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] max-w-md leading-relaxed">
              {s.site_description}
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
              {SOCIAL_LINKS.map(sl => (
                <a key={sl.key} href={s[`social_${sl.key}`] || sl.href} target="_blank" rel="noopener noreferrer" aria-label={sl.label} title={sl.label}
                  className="social-icon-gold">
                  <SocialIcon icon={sl.key} size={16} />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-5 font-inter text-sm text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 flex items-center justify-center border border-[var(--color-warm-gray)]/60 text-[var(--color-gold)]">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </span>
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 flex items-center justify-center border border-[var(--color-warm-gray)]/60 text-[var(--color-gold)]">
                <span className="material-symbols-outlined text-[18px]">call</span>
              </span>
              <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-[var(--color-gold)] transition-colors">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 flex items-center justify-center border border-[var(--color-warm-gray)]/60 text-[var(--color-gold)]">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <a href={`mailto:${email}`} className="hover:text-[var(--color-gold)] transition-colors">{email}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
