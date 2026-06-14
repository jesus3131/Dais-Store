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
    <section id="about" className="py-20 lg:py-24 bg-white">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Nuestra Historia</span>
            <div className="w-10 h-[1px] bg-[var(--color-gold)] mt-4 mb-6" />
            <h2 className="font-headline text-[var(--text-headline-xl)] text-[var(--color-near-black)] mb-6 leading-[1.15]">
              Belleza premium<br />con <span className="italic text-[var(--color-gold)]">esencia colombiana</span>
            </h2>
            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-8">
              En DAIS seleccionamos cada producto para ofrecer una experiencia de lujo accesible. 
              Nacimos en Montería con la misión de llevar lo mejor de la cosmética global a cada rincón de Colombia.
            </p>
            <div className="flex gap-10">
              <div>
                <span className="font-display text-4xl text-[var(--color-gold)]">200+</span>
                <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] mt-1">Productos premium</p>
              </div>
              <div>
                <span className="font-display text-4xl text-[var(--color-gold)]">500+</span>
                <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] mt-1">Clientes satisfechos</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img src={aboutImg} alt="DAIS - Luxury beauty" className="w-full aspect-[3/4] object-cover shadow-luxury-lg" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-[var(--color-gold)]/20 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
