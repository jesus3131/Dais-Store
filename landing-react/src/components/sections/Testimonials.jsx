import { useState } from 'react';

const defaultTestimonials = [
  { name: 'María Fernanda G.', role: 'Emprendedora de Belleza', text: 'Desde que trabajo con DAIS, la calidad de mis productos se ha disparado. Mis clientas notan la diferencia y yo también. El servicio al cliente es impecable.', rating: 5 },
  { name: 'Carlos E. Mendoza', role: 'Dueño de Salón', text: 'La variedad de productos y los precios mayoristas son insuperables. Los envíos siempre llegan a tiempo y en perfectas condiciones. Altamente recomendados.', rating: 5 },
  { name: 'Ana Lucía R.', role: 'Distribuidora Independiente', text: 'DAIS me ha permitido hacer crecer mi negocio de manera increíble. La asesoría personalizada y la calidad de los productos marcan la diferencia.', rating: 5 },
];

export default function Testimonials({ sectionData = {} }) {
  const testimonials = sectionData.items || defaultTestimonials;
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 lg:py-24 bg-[var(--color-near-black)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-12">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Testimonios</span>
          <div className="section-divider mt-4 mx-auto" />
          <h2 className="font-headline text-[var(--text-display-md)] text-white mt-6">
            Lo que dicen nuestros clientes
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden">
            <div className="transition-all duration-500" style={{ transform: `translateX(-${active * 100}%)`, display: 'flex' }}>
              {testimonials.map((t, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-4 lg:px-12 text-center">
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`material-symbols-outlined text-lg ${i < t.rating ? 'text-[var(--color-gold)]' : 'text-white/20'}`}>
                        {i < t.rating ? 'star' : 'star'}
                      </span>
                    ))}
                  </div>
                  <p className="font-body text-white/70 text-base lg:text-lg italic leading-relaxed mb-8 max-w-2xl mx-auto">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <span className="font-headline text-white text-base">{t.name}</span>
                    <p className="font-inter text-[11px] text-white/40 mt-1">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-10">
            {testimonials.map((_, idx) => (
              <button key={idx} onClick={() => setActive(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === active ? 'bg-[var(--color-gold)] w-6' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
