import { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { api } from '../../services/api.js';

export default function Catalog() {
  const { addToCart, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <section id="catalog" className="py-24 lg:py-32 bg-[var(--color-cream)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-4 font-manrope font-semibold">
            Nuestra Selección
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)] mb-4">
            Productos <span className="text-[var(--color-gold)]">Premium</span>
          </h2>
          <p className="font-body-md text-[var(--color-on-surface-variant)] max-w-lg mx-auto">
            Descubre nuestra selección de productos de belleza y cuidado personal, pensados para tu negocio.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-gold)] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-[var(--color-warm-gray)] mb-4">error_outline</span>
            <p className="font-manrope text-[var(--color-on-surface-variant)] mb-4">No se pudieron cargar los productos.</p>
            <button onClick={load} className="btn-primary text-sm py-3 px-6">Reintentar</button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-[var(--color-warm-gray)] mb-4">inventory_2</span>
            <p className="font-manrope text-[var(--color-on-surface-variant)]">Próximamente nuevos productos.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {products.map(product => (
              <div key={product.id} className="group bg-white luxury-shadow hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-square bg-[var(--color-cream)] overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <button
                    onClick={() => handleAdd(product)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--color-gold)] hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-manrope uppercase tracking-[0.15em] text-[var(--color-warm-gray)]">{product.category}</span>
                  <h3 className="font-headline text-[var(--text-headline-md)] text-[var(--color-on-surface)] mt-1 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="font-manrope text-sm text-[var(--color-on-surface-variant)] mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <p className="font-headline text-2xl font-bold text-[var(--color-gold)] mb-4">
                    {product.currency || '$'}{Number(product.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAdd(product)}
                    className="w-full py-3 border border-[var(--color-gold)] text-[var(--color-gold)] font-manrope font-semibold text-xs uppercase tracking-[0.12em] hover:bg-[var(--color-gold)] hover:text-white transition-all duration-300"
                  >
                    AÑADIR AL PEDIDO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
