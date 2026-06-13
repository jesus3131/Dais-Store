export function Hero({ site }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-bottles">
          {site.heroImages.map((img, i) => (
            <img key={i} className="hero-bottle" src={img.src} alt={img.alt} loading="lazy" />
          ))}
        </div>
        <h1>{site.heroHeadline}</h1>
        <p>{site.heroDescription}</p>
        <a href={site.ctaHref} className="btn-primary">{site.ctaText}</a>
      </div>
    </section>
  );
}
