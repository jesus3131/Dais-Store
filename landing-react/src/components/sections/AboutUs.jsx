export default function AboutUs() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-[var(--color-surface-container-low)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
              Nuestra Historia
            </span>
            <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)] mb-6 leading-[1.2]">
              Más que una Distribuidora,<br />
              <span className="text-[var(--color-secondary)]">Una Experiencia</span>
            </h2>
            <p className="font-body-md text-[var(--color-on-surface-variant)] mb-6">
              En <strong>Dais Store</strong> somos una distribuidora mayorista apasionada por la belleza y el cuidado personal. Nacimos en Montería, Córdoba, con la misión de ofrecer productos de alta calidad a precios competitivos para emprendedores, esteticistas y tiendas de belleza.
            </p>
            <p className="font-body-md text-[var(--color-on-surface-variant)] mb-6">
              Trabajamos con las mejores marcas nacionales e internacionales para garantizar que cada producto que llega a tus manos cumpla con los más altos estándares de calidad. Creemos en el poder de la belleza para transformar vidas y negocios.
            </p>
            <p className="font-body-md text-[var(--color-on-surface-variant)] mb-8">
              Nuestro equipo está comprometido con brindarte una experiencia de compra excepcional, con asesoría personalizada y envíos rápidos a toda Colombia.
            </p>
            <div className="flex flex-wrap gap-8">
              {[
                { value: '200+', label: 'Productos' },
                { value: '500+', label: 'Clientes' },
                { value: '12', label: 'Marcas' },
                { value: '98%', label: 'Satisfacción' },
              ].map(s => (
                <div key={s.label}>
                  <span className="text-[var(--text-display-lg)] text-[var(--color-secondary)] font-serif font-bold">{s.value}</span>
                  <p className="text-sm text-[var(--color-on-surface-variant)] font-manrope mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[var(--color-secondary-container)] to-[var(--color-primary-container)] p-1">
                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="material-symbols-outlined text-8xl text-[var(--color-secondary)]">spa</span>
                    <p className="font-headline text-xl text-[var(--color-on-surface)] italic mt-4">"Belleza con propósito"</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[var(--color-secondary)]/10 rounded-full blur-2xl" />
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
