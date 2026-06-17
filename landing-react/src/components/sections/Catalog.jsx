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

  const salePct = (product) => {
    if (!product.old_price) return 0;
    return Math.round((1 - parseFloat(product.price) / parseFloat(product.old_price)) * 100);
  };

  return (
    <section id="catalog" className="py-20 lg:py-24 bg-[var(--color-pastel-white)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-12">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Colección</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Productos destacados
          </h2>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 stagger-children">
            {products.slice(0, 8).map((product, idx) => {
              const isWishlisted = wishlist.has(product.id);
              const secondImage = product.image_url_2;
              const hasSale = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
              const discount = hasSale ? salePct(product) : 0;
              const isNew = (Date.now() - new Date(product.created_at || Date.now()).getTime()) < 7 * 24 * 60 * 60 * 1000;
              const stock = product.stock != null ? parseInt(product.stock) : null;
              const hasStock = stock === null || stock > 0;

              return (
                <div key={product.id} className="product-card bg-white border border-[var(--color-warm-gray)]/50">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-ivory-dark)]">
                    {isNew && <span className="badge-new">Nuevo</span>}
                    {hasSale && <span className="absolute top-4 right-4 z-10 bg-red-500 text-white font-inter text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 rounded">-{discount}%</span>}
                    <button onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all">
                      <span className={`material-symbols-outlined text-[16px] ${isWishlisted ? 'text-red-400' : 'text-[var(--color-on-surface-variant)]'}`}>
                        {isWishlisted ? 'favorite' : 'favorite'}
                      </span>
                    </button>
                    <div className="product-image relative w-full h-full cursor-pointer" onClick={() => setQuickView(product)}>
                      <img src={product.image_url || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80'}
                        alt={product.name} className="w-full h-full object-cover" />
                      {secondImage && <div className="product-image-secondary"><img src={secondImage} alt="" className="w-full h-full object-cover" /></div>}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="font-inter text-[9px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]">{product.category || 'General'}</span>
                    <h3 className="font-headline text-[var(--text-headline-md)] text-[var(--color-near-black)] mt-1.5 mb-2 leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-headline text-lg font-semibold text-[var(--color-gold-dark)]">
                        {product.currency || '$'}{Number(product.price).toLocaleString()}
                      </span>
                      {hasSale && (
                        <span className="font-inter text-xs text-[var(--color-on-surface-variant)] line-through">
                          {product.currency || '$'}{Number(product.old_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {stock !== null && (
                      <p className={`font-inter text-[10px] ${hasStock ? 'text-green-600' : 'text-red-400'} mb-3`}>
                        {hasStock ? `Stock: ${stock} und.` : 'Agotado'}
                      </p>
                    )}
                    <button onClick={() => handleAdd(product)} disabled={!hasStock}
                      className={`w-full py-3 font-inter text-[10px] uppercase tracking-[0.18em] transition-all duration-300 rounded ${
                        hasStock
                          ? 'bg-[var(--color-near-black)] text-white hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)]'
                          : 'bg-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] cursor-not-allowed'
                      }`}>
                      {hasStock ? 'Añadir al carrito' : 'Agotado'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && products.length > 8 && (
          <div className="text-center mt-12">
            <button className="btn-outline-gold text-[10px] px-8 py-3">
              Ver colección completa
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} onAdd={handleAdd} />}
    </section>
  );
}
