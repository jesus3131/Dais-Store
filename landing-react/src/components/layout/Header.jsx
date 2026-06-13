import { useCart } from '../../context/CartContext.jsx';

export default function Header() {
  const { totalItems, toggleCart } = useCart();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-2" onClick={() => scrollTo('hero')} style={{cursor: 'pointer'}}>
            <span className="text-sm font-manrope uppercase tracking-[0.2em] text-[var(--color-on-surface)]">Dais Store</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {['Productos', 'Nosotros', 'Cómo Funciona', 'Contacto'].map(item => (
              <button
                key={item}
                onClick={() => scrollTo(item === 'Productos' ? 'catalog' : item === 'Nosotros' ? 'about' : item === 'Cómo Funciona' ? 'how-it-works' : 'footer')}
                className="text-sm font-manrope text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative p-2" onClick={toggleCart}>
              <span className="material-symbols-outlined text-[var(--color-on-surface)]">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-secondary)] text-white text-[10px] font-manrope font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="lg:hidden p-2">
              <span className="material-symbols-outlined text-[var(--color-on-surface)]">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
