const steps = [
  { icon: 'search', title: 'Descubre', desc: 'Explora nuestra colección curada de productos premium para el cuidado personal.' },
  { icon: 'checklist', title: 'Selecciona', desc: 'Elige los productos que mejor se adapten a tu estilo y necesidades.' },
  { icon: 'auto_awesome', title: 'Personaliza', desc: 'Recibe asesoría personalizada de nuestros expertos en belleza.' },
  { icon: 'local_shipping', title: 'Recibe', desc: 'Disfruta de envíos rápidos y empaques premium que cuidan cada detalle.' },
];

export default function HowItWorks() {
  return (
    <section id="benefits" className="py-28 lg:py-36 bg-white">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-20">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Experiencia Premium</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Una experiencia de compra excepcional
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 stagger-children">
          {steps.map((step, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[var(--color-gold-soft)] group-hover:bg-[var(--color-gold)] transition-all duration-500 group-hover:shadow-gold">
                <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl group-hover:text-white transition-colors duration-500">{step.icon}</span>
              </div>
              <h3 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-near-black)] mb-3">{step.title}</h3>
              <div className="w-8 h-[1px] bg-[var(--color-gold)] mx-auto mb-4 opacity-50" />
              <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
