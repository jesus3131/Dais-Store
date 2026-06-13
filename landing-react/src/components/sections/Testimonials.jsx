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
  ];

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-[var(--color-surface)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-4 font-manrope font-semibold">
            Testimonios
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
            Lo que Dicen <span className="text-[var(--color-gold)]">Nuestros Clientes</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 luxury-shadow">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-[var(--color-gold)] text-lg">star</span>
                ))}
              </div>
              <p className="font-body-md text-[var(--color-on-surface-variant)] mb-8 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-outline-variant)]">
                <div className="w-11 h-11 rounded-full bg-[var(--color-sand)] flex items-center justify-center">
                  <span className="font-manrope font-bold text-sm text-[var(--color-gold-dark)]">
                    {t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-manrope font-semibold text-sm text-[var(--color-on-surface)]">{t.name}</p>
                  <p className="font-manrope text-xs text-[var(--color-warm-gray)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
