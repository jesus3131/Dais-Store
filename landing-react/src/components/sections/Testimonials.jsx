const testimonials = [
  {
    name: 'María Fernanda López',
    role: 'Esteticista Profesional',
    text: 'La calidad de los productos de DAIS ha transformado los tratamientos que ofrezco a mis clientas. Cada producto es una obra de arte que eleva mi práctica a otro nivel.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  {
    name: 'Carlos Andrés Medina',
    role: 'CEO · Belleza Premium',
    text: 'Trabajar con DAIS ha sido una experiencia extraordinaria. Su selecta colección de productos y la atención personalizada marcan la diferencia en el mercado.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    name: 'Ana Sofía Martínez',
    role: 'Emprendedora · Skincare',
    text: 'Descubrir DAIS fue un punto de inflexión para mi negocio. La curaduría de sus productos y el respaldo de una marca con visión de lujo me dan total confianza.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-28 lg:py-36 bg-[var(--color-surface-container)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Testimonios</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Lo que dicen nuestros clientes
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto stagger-children">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 border border-[var(--color-warm-gray)] hover:border-[var(--color-gold)]/30 transition-all duration-500 shadow-luxury hover:shadow-luxury-lg">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-[var(--color-gold)] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body text-sm text-[var(--color-on-surface-variant)] mb-8 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-4 pt-5 border-t border-[var(--color-warm-gray)]">
                <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="font-headline text-sm text-[var(--color-near-black)]">{t.name}</p>
                  <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
