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
      .catch((err) => {
        if (mounted.current) setError(err.message);
      })
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
    <section id="catalog" className="py-24 lg:py-32 bg-[var(--color-surface-container-low)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-16">
          <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
            Catálogo
          </span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)] mb-4">
            Nuestros <span className="text-[var(--color-secondary)]">Productos</span>
          </h2>
          <p className="font-body-md text-[var(--color-on-surface-variant)] max-w-lg mx-auto">
            Descubre nuestra selección de productos de belleza y cuidado personal, pensados para tu negocio.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-red-300 mb-4">error_outline</span>
            <p className="font-manrope text-[var(--color-on-surface-variant)]">No se pudieron cargar los productos.</p>
            <button onClick={load} className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white font-manrope text-sm rounded-full">
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)] mb-4">inventory_2</span>
            <p className="font-manrope text-[var(--color-on-surface-variant)]">Próximamente nuevos productos.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="group bg-white rounded-xl overflow-hidden luxury-shadow hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-[var(--color-surface-container-high)] overflow-hidden">
                  <img
                    src={product.image_url || 'https://placehold.co/400x400/e5e2e1/4f4445?text=Sin+Imagen'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-manrope uppercase tracking-[0.1em] text-[var(--color-outline)]">{product.category}</span>
                  <h3 className="font-headline text-[var(--text-headline-md)] text-[var(--color-on-surface)] mt-1 mb-1">{product.name}</h3>
                  <p className="font-headline text-xl font-semibold text-[var(--color-secondary)]">
                    {product.currency || '$'}{Number(product.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAdd(product)}
                    className="mt-4 w-full py-3 bg-[var(--color-primary)] text-white font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    Agregar
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
