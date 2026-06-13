export default function PreFooter() {
  return (
    <section className="py-20 lg:py-28 bg-white border-t border-[var(--color-outline-variant)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left">
            <h2 className="font-headline text-4xl lg:text-5xl italic text-[var(--color-gold)] mb-4">DAIS STORE</h2>
            <p className="font-manrope text-[var(--color-on-surface-variant)] max-w-md">
              Distribuidora Mayorista de productos de belleza y cuidado personal. Calidad premium para tu negocio en toda Colombia.
            </p>
          </div>
          <div className="flex flex-col gap-4 font-manrope text-sm text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-[18px]">location_on</span>
              <span>Montería, Córdoba, Colombia</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-[18px]">call</span>
              <a href={`tel:${import.meta.env.VITE_WHATSAPP_NUMBER || '+573000000000'}`} className="hover:text-[var(--color-gold)] transition-colors">
                {import.meta.env.VITE_WHATSAPP_NUMBER || '+57 300 000 0000'}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-[18px]">mail</span>
              <a href="mailto:info@daisstore.co" className="hover:text-[var(--color-gold)] transition-colors">info@daisstore.co</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
