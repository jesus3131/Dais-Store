import { useCart } from '../../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import MobileMenu from './MobileMenu.jsx';

export default function Header() {
  const { totalItems, toggleCart } = useCart();
  const [siteName, setSiteName] = useState('DAIS');
  const [siteLogo, setSiteLogo] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s?.site_logo_url) setSiteLogo(s.site_logo_url);
      if (s?.site_name) setSiteName(s.site_name);
      else if (s?.site_logo_alt) setSiteName(s.site_logo_alt);
    }).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Colecciones', target: 'catalog' },
    { label: 'Categorías', target: 'categories' },
    { label: 'Nosotros', target: 'about' },
    { label: 'Contacto', target: 'footer' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-luxury' : 'bg-transparent'}`}>
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <button className="p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menú">
            <span className="material-symbols-outlined text-[var(--color-near-black)]">menu</span>
          </button>
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(item => (
              <button key={item.label} onClick={() => scrollTo(item.target)}
                className="gold-underline text-[11px] font-inter uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-near-black)] transition-colors duration-300">
                {item.label}
              </button>
            ))}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer flex items-center justify-center" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-10 lg:h-12 w-auto object-contain" />
            ) : (
              <span className="font-display text-2xl lg:text-3xl italic text-[var(--color-gold)] tracking-wide">{siteName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden lg:flex p-3 hover:bg-[rgba(232,207,166,0.08)] rounded-full transition-colors" aria-label="Buscar">
              <span className="material-symbols-outlined text-[var(--color-near-black)] text-[20px]">search</span>
            </button>
            <button className="hidden lg:flex p-3 hover:bg-[rgba(232,207,166,0.08)] rounded-full transition-colors" aria-label="Favoritos">
              <span className="material-symbols-outlined text-[var(--color-near-black)] text-[20px]">favorite</span>
            </button>
            <Link to="/admin/login"
              className="hidden lg:flex p-3 hover:bg-[rgba(232,207,166,0.08)] rounded-full transition-colors" aria-label="Perfil">
              <span className="material-symbols-outlined text-[var(--color-near-black)] text-[20px]">person</span>
            </Link>
            <button className="relative p-3 hover:bg-[rgba(232,207,166,0.08)] rounded-full transition-colors" onClick={toggleCart} aria-label="Carrito">
              <span className="material-symbols-outlined text-[var(--color-near-black)] text-[20px]">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[var(--color-near-black)] text-white text-[9px] font-inter font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
