export default function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-[var(--color-on-background)] text-white pt-16 pb-8">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="font-headline text-2xl italic text-[var(--color-secondary)] mb-4" style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#e9c176' }}>
              DAIS STORE
            </h3>
            <p className="font-manrope text-sm text-white/60 leading-relaxed mb-4">
              Distribuidora Mayorista de productos de belleza y cuidado personal. Calidad premium para tu negocio en toda Colombia.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'whatsapp', 'tiktok'].map(icon => (
                <a
                  key={icon}
                  href={icon === 'whatsapp' ? 'https://wa.me/573000000000' : '#'}
                  target={icon === 'whatsapp' ? '_blank' : undefined}
                  rel={icon === 'whatsapp' ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors duration-300"
                >
                  <span className="material-symbols-outlined text-sm">{icon === 'whatsapp' ? 'call' : icon === 'tiktok' ? 'music_note' : icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-manrope font-semibold text-sm uppercase tracking-[0.1em] text-white/80 mb-5">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', target: 'hero' },
                { label: 'Catálogo', target: 'catalog' },
                { label: 'Nosotros', target: 'about' },
                { label: 'Cómo Comprar', target: 'how-it-works' },
                { label: 'FAQ', target: 'faq' },
                { label: 'Contacto', target: 'footer' },
              ].map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.target)}
                    className="font-manrope text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-manrope font-semibold text-sm uppercase tracking-[0.1em] text-white/80 mb-5">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-[18px] mt-0.5">location_on</span>
                <span className="font-manrope text-sm text-white/60">Montería, Córdoba, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-[18px]">call</span>
                <a href="tel:+573000000000" className="font-manrope text-sm text-white/60 hover:text-white transition-colors">+57 300 000 0000</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-[18px]">mail</span>
                <a href="mailto:info@daisstore.co" className="font-manrope text-sm text-white/60 hover:text-white transition-colors">info@daisstore.co</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-[18px]">schedule</span>
                <span className="font-manrope text-sm text-white/60">Lun - Sáb: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-manrope font-semibold text-sm uppercase tracking-[0.1em] text-white/80 mb-5">Medios de Pago</h4>
            <div className="flex flex-wrap gap-3">
              {['credit_card', 'account_balance', 'payments', 'smartphone'].map((icon, i) => (
                <div key={i} className="w-14 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/60 text-lg">{icon}</span>
                </div>
              ))}
            </div>
            <p className="font-manrope text-xs text-white/40 mt-4">
              Aceptamos transferencias, Nequi, Daviplata y tarjetas.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="font-manrope text-xs text-white/40">
            &copy; {new Date().getFullYear()} Dais Store. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
