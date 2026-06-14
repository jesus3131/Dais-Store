import { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { api } from '../../services/api.js';
import QuickView from './QuickView.jsx';

export default function Catalog() {
  const { addToCart, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickView, setQuickView] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const mounted = useRef(true);

  const load = useCallback(() => {
    if (!mounted.current) return;
    api.getProducts()
      .then(setProducts)
      .catch((err) => { if (mounted.current) setError(err.message); })
      .finally(() => { if (mounted.current) setLoading(false); });
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    const interval = setInterval(load, 30000);
    return () => { mounted.current = false; clearInterval(interval); };
  }, [load]);

  const handleAdd = (product) => {
    addToCart(product);
    openCart();
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section id="catalog" className="py-28 lg:py-36 bg-[var(--color-ivory)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Colección</span>
            <div className="section-divider mt-4" />
            <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
              Productos destacados
            </h2>
          </div>
          <button className="hidden lg:flex items-center gap-2 text-[11px] font-inter uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors">
            Ver todos
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)] mb-4">error_outline</span>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mb-6">No se pudieron cargar los productos.</p>
            <button onClick={load} className="btn-gold text-[10px] px-6 py-3">Reintentar</button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)] mb-4">inventory_2</span>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">Próximamente nuevos productos.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 stagger-children">
            {products.map((product, idx) => {
              const isWishlisted = wishlist.has(product.id);
              const secondImage = product.image_url_2 || (idx % 2 === 0 ? 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' : 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80');
              const hasSale = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
              const isNew = idx < 2;

              return (
                <div key={product.id} className="product-card group bg-white">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-ivory-dark)]">
                    {isNew && <span className="badge-new">Nuevo</span>}
                    {hasSale && <span className="badge-sale">Oferta</span>}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all"
                      >
                        <span className={`material-symbols-outlined text-[18px] ${isWishlisted ? 'text-red-400' : 'text-[var(--color-on-surface-variant)]'}`}>
                          {isWishlisted ? 'favorite' : 'favorite'}
                        </span>
                      </button>
                    </div>
                    <div className="product-image relative w-full h-full">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="product-image-secondary">
                        <img src={secondImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="product-actions absolute bottom-0 left-0 right-0 p-4">
                      <button
                        onClick={() => setQuickView(product)}
                        className="w-full py-3 bg-white/90 backdrop-blur-sm text-[var(--color-near-black)] font-inter text-[10px] uppercase tracking-[0.18em] hover:bg-white transition-all"
                      >
                        Vista Rápida
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="font-inter text-[9px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{product.category}</span>
                    <h3 className="font-headline text-[var(--text-headline-md)] text-[var(--color-near-black)] mt-1.5 mb-1">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[var(--color-gold)] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline text-lg font-semibold text-[var(--color-near-black)]">
                        {product.currency || '$'}{Number(product.price).toLocaleString()}
                      </span>
                      {hasSale && (
                        <span className="font-inter text-xs text-[var(--color-on-surface-variant)] line-through">
                          {product.currency || '$'}{Number(product.old_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(product)}
                      className="w-full mt-4 py-3 bg-[var(--color-near-black)] text-white font-inter text-[10px] uppercase tracking-[0.18em] hover:bg-[var(--color-dark-gray)] transition-all duration-300"
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-14">
          <button className="btn-outline-gold text-[10px] px-8 py-3">
            Ver colección completa
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} onAdd={handleAdd} />}
    </section>
  );
}
