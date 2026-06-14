import { useCart } from '../../context/CartContext.jsx';
import { Link } from 'react-router-dom';

export default function MobileMenu({ isOpen, onClose }) {
  const { totalItems, toggleCart } = useCart();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  const links = [
    { label: 'Inicio', target: 'hero' },
    { label: 'Colecciones', target: 'catalog' },
    { label: 'Categorías', target: 'categories' },
    { label: 'Nosotros', target: 'about' },
    { label: 'Contacto', target: 'footer' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-[var(--color-near-black)]/40 z-[60] backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] shadow-luxury-lg transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-warm-gray)]/40">
          <span className="font-display text-xl italic text-[var(--color-gold)]">DAIS</span>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-warm-gray)]/30 transition-colors rounded-full">
            <span className="material-symbols-outlined text-[var(--color-near-black)] text-[20px]">close</span>
          </button>
        </div>
        <nav className="p-6 space-y-1">
          {links.map(link => (
            <button key={link.label} onClick={() => scrollTo(link.target)}
              className="block w-full text-left px-4 py-3 font-inter text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all rounded-lg">
              {link.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--color-warm-gray)]/40 space-y-3">
          <button onClick={() => { toggleCart(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 font-inter text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            Carrito {totalItems > 0 && `(${totalItems})`}
          </button>
          <Link to="/admin/login" onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 font-inter text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Admin
          </Link>
        </div>
      </div>
    </>
  );
}
