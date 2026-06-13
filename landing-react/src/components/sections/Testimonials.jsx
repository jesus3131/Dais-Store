export default function Testimonials() {
  const testimonials = [
    {
      name: 'María Fernanda López',
      role: 'Esteticista',
      text: 'Dais Store me ha permitido ofrecer productos de alta calidad a mis clientas. La atención es increíble y los precios son insuperables para el mercado mayorista.',
      rating: 5,
    },
    {
      name: 'Carlos Andrés Medina',
      role: 'Dueño de tienda de belleza',
      text: 'Llevo trabajando con ellos más de un año y la constancia en la calidad de los productos es admirable. Los envíos siempre llegan a tiempo y bien empacados.',
      rating: 5,
    },
    {
      name: 'Ana Sofía Martínez',
      role: 'Emprendedora',
      text: 'Empecé mi negocio de belleza con los productos de Dais Store y no podría estar más feliz. El catálogo es variado y siempre tienen las últimas tendencias.',
      rating: 5,
    },
    {
      name: 'Laura Cristina Pérez',
      role: 'Distribuidora independiente',
      text: 'La atención personalizada que ofrecen marca la diferencia. Siempre recomiendo a Dais Store por su compromiso y la calidad de sus productos de belleza.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-[var(--color-surface)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
            Testimonios
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
            Lo que Dicen <span className="text-[var(--color-secondary)]">Nuestros Clientes</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[var(--color-surface-container-low)] p-6 rounded-xl luxury-shadow">
              <div className="flex mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-[var(--color-secondary)] text-lg">star</span>
                ))}
              </div>
              <p className="font-body-md text-[var(--color-on-surface-variant)] mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-secondary-container)] to-[var(--color-primary-container)] flex items-center justify-center">
                  <span className="font-manrope font-bold text-sm text-[var(--color-secondary)]">
                    {t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-manrope font-semibold text-sm text-[var(--color-on-surface)]">{t.name}</p>
                  <p className="font-manrope text-xs text-[var(--color-outline)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
