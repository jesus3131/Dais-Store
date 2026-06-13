export default function AboutUs() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-[var(--color-surface-container-low)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-4 font-manrope font-semibold">
              Nuestra Historia
            </span>
            <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)] mb-6 leading-[1.2]">
              Más que una Distribuidora,<br />
              <span className="text-[var(--color-gold)]">Una Experiencia</span>
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
            <div className="flex flex-wrap gap-10">
              {[
                { value: '200+', label: 'Productos' },
                { value: '500+', label: 'Clientes' },
                { value: '12', label: 'Marcas' },
                { value: '98%', label: 'Satisfacción' },
              ].map(s => (
                <div key={s.label}>
                  <span className="text-4xl lg:text-5xl font-headline font-bold text-[var(--color-gold)]">{s.value}</span>
                  <p className="text-sm text-[var(--color-on-surface-variant)] font-manrope mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80"
                alt="Nuestro equipo"
                className="w-full aspect-[3/4] object-cover luxury-shadow"
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[var(--color-gold)]/10" />
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-[var(--color-gold)]/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
