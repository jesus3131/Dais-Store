export default function HowItWorks() {
  const steps = [
    { icon: 'search', title: 'Explora', desc: 'Navega por nuestro catálogo y descubre los productos que se adapten a tu negocio.' },
    { icon: 'shopping_bag', title: 'Agrega', desc: 'Selecciona los productos que necesites y agrégalos a tu carrito de compras.' },
    { icon: 'support_agent', title: 'Asesoría', desc: 'Recibe atención personalizada de nuestro equipo para resolver tus dudas.' },
    { icon: 'local_shipping', title: 'Recibe', desc: 'Recibe tus productos en la puerta de tu negocio con envíos rápidos a toda Colombia.' },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-[var(--color-surface)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
            Cómo Funciona
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
            Compra en <span className="text-[var(--color-secondary)]">3 Pasos</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center group-hover:bg-[var(--color-secondary-container)] transition-colors duration-300">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">{step.icon}</span>
              </div>
              <span className="inline-block text-4xl font-serif font-bold text-[var(--color-secondary)]/20 absolute -top-4 right-0 lg:right-8">0{i + 1}</span>
              <h3 className="font-headline text-[var(--text-headline-md)] text-[var(--color-on-surface)] mb-3">{step.title}</h3>
              <p className="font-body-md text-[var(--color-on-surface-variant)]">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all duration-300"
            onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            Comprar Ahora
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}
