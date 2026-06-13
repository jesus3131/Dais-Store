export function Footer({ site }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-logo">{site.brandName}</div>
        <div className="footer-sub">{site.tagline}</div>
        <h2>{site.footer.title}</h2>
        <p>{site.footer.description}</p>
      </div>
      <div className="footer-bar">
        <div>&copy; {site.year} {site.brandName} — Todos los derechos reservados</div>
        <div className="footer-contact">
          <a href={`mailto:${site.contact.email}`}>Contáctanos</a>
          <span>{site.contact.location}</span>
        </div>
      </div>
    </footer>
  );
}
