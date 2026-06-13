import { useCart } from '../../context/CartContext.jsx';
import { Link } from 'react-router-dom';

export default function Header() {
  const { totalItems, toggleCart } = useCart();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--color-outline-variant)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button className="p-2 lg:hidden" aria-label="Menú">
            <span className="material-symbols-outlined text-[var(--color-on-surface)]">menu</span>
          </button>
          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Catálogo', target: 'catalog' },
              { label: 'Nosotros', target: 'about' },
              { label: 'Cómo Comprar', target: 'how-it-works' },
              { label: 'Contacto', target: 'footer' },
            ].map(item => (
              <button key={item.label} onClick={() => scrollTo(item.target)}
                className="text-xs font-manrope uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors">
                {item.label}
              </button>
            ))}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <span className="font-headline text-xl italic text-[var(--color-gold)]">DAIS STORE</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/login"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-outline-variant)] text-[10px] font-manrope uppercase tracking-[0.15em] text-[var(--color-warm-gray)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Admin
            </Link>
            <Link to="/admin/login" className="lg:hidden p-2 hover:opacity-60 transition-opacity" title="Admin">
              <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-[20px]">lock</span>
            </Link>
            <button className="relative p-2" onClick={toggleCart}>
              <span className="material-symbols-outlined text-[var(--color-on-surface)]">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-gold)] text-white text-[10px] font-manrope font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
