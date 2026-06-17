const defaultStats = [
  { number: '200+', label: 'Productos premium' },
  { number: '500+', label: 'Clientes satisfechos' },
  { number: '15+', label: 'Años de experiencia' },
];

const defaultText = `En DAIS, creemos que la belleza es una forma de expresión personal. Desde nuestros inicios, nos hemos dedicado a seleccionar los mejores productos de belleza, skincare y bienestar para ofrecer a nuestros clientes una experiencia excepcional.\n\nTrabajamos directamente con laboratorios y fabricantes de prestigio para garantizar la más alta calidad en cada producto que llega a tus manos. Nuestro compromiso es brindarte no solo productos extraordinarios, sino también el conocimiento y la asesoría que necesitas para potenciar tu negocio.\n\nÚnete a nuestra comunidad de emprendedores y profesionales de la belleza que confían en DAIS para ofrecer lo mejor a sus clientes.`;

const defaultImages = [
  'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
];

export default function AboutUs({ sectionData = {}, settings = {} }) {
  const aboutText = sectionData.text || defaultText;
  const stats = sectionData.stats || defaultStats;
  const images = sectionData.images || [settings.about_image_url, settings.about_image_2_url].filter(Boolean);
  const displayImages = images.length >= 2 ? images : (images.length === 1 ? [images[0], defaultImages[1]] : defaultImages);

  return (
    <section id="about" className="py-20 lg:py-24 bg-[var(--color-pastel-white)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Nosotros</span>
            <div className="section-divider mt-4" />
            <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6 leading-tight">
              Más que una distribuidora,<br />una experiencia de <span className="text-[var(--color-gold)]">belleza</span>
            </h2>
            <div className="mt-8 space-y-4">
              {aboutText ? (
                aboutText.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="font-body text-[var(--color-on-surface-variant)] leading-relaxed">{p}</p>
                ))
              ) : (
                <>
                  <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed">
                    En DAIS, creemos que la belleza es una forma de expresión personal. Desde nuestros inicios, nos hemos dedicado a seleccionar los mejores productos de belleza, skincare y bienestar para ofrecer a nuestros clientes una experiencia excepcional.
                  </p>
                  <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed">
                    Trabajamos directamente con laboratorios y fabricantes de prestigio para garantizar la más alta calidad en cada producto que llega a tus manos. Nuestro compromiso es brindarte no solo productos extraordinarios, sino también el conocimiento y la asesoría que necesitas para potenciar tu negocio.
                  </p>
                  <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed">
                    Únete a nuestra comunidad de emprendedores y profesionales de la belleza que confían en DAIS para ofrecer lo mejor a sus clientes.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-8 mt-10">
              {stats.map(stat => (
                <div key={stat.label}>
                  <span className="font-display text-3xl text-[var(--color-gold)]">{stat.number}</span>
                  <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={displayImages[0]} alt=""
              className="w-full h-64 lg:h-80 object-cover" />
            <img src={displayImages[1] || displayImages[0]} alt=""
              className="w-full h-64 lg:h-80 object-cover mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
