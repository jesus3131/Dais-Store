import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function AboutUs() {
  const [aboutImg, setAboutImg] = useState('https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80');

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s?.about_image_url) setAboutImg(s.about_image_url);
    }).catch(() => {});
  }, []);

  return (
    <section id="about" className="py-28 lg:py-36 bg-white">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Nuestra Historia</span>
            <div className="w-10 h-[1px] bg-[var(--color-gold)] mt-4 mb-8" />
            <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mb-8 leading-[1.15]">
              Donde la ciencia
              <br />
              <span className="italic text-[var(--color-gold)]">encuentra</span>
              <br />
              la belleza
            </h2>
            <div className="space-y-5 font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-lg">
              <p>
                En <strong className="text-[var(--color-near-black)]">DAIS</strong> creemos que la belleza verdadera nace de la combinación perfecta entre innovación científica y arte sensorial. Cada producto en nuestra colección ha sido seleccionado meticulosamente para ofrecer una experiencia que trasciende lo ordinario.
              </p>
              <p>
                Nacimos en Montería, Córdoba, con la visión de democratizar el lujo y llevar a cada rincón de Colombia los mejores ingredientes y formulaciones que la industria cosmética tiene para ofrecer.
              </p>
              <p>
                Trabajamos exclusivamente con laboratorios y marcas que comparten nuestra filosofía: calidad excepcional, sustentabilidad real y un compromiso inquebrantable con la excelencia.
              </p>
            </div>
            <div className="flex flex-wrap gap-12 mt-10">
              {[
                { value: '200+', label: 'Productos premium' },
                { value: '500+', label: 'Clientes satisfechos' },
                { value: '12', label: 'Marcas exclusivas' },
              ].map(s => (
                <div key={s.label}>
                  <span className="font-display text-5xl text-[var(--color-gold)]">{s.value}</span>
                  <p className="font-inter text-[11px] text-[var(--color-on-surface-variant)] uppercase tracking-[0.12em] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img src={aboutImg} alt="DAIS - Luxury beauty" className="w-full aspect-[3/4] object-cover shadow-luxury-lg" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-[var(--color-gold)]/20 -z-10" />
              <div className="absolute -top-6 -right-6 w-40 h-40 border border-[var(--color-gold)]/20 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
