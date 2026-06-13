import { useCart } from '../../context/CartContext.jsx';

const products = [
  { id: 1, name: 'Crema Hidratante Facial', price: 28500, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Crema+Facial', category: 'Rostro' },
  { id: 2, name: 'Sérum Reparador de Noche', price: 42500, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Serum+Noche', category: 'Rostro' },
  { id: 3, name: 'Protector Solar SPF50', price: 32000, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Protector+Solar', category: 'Rostro' },
  { id: 4, name: 'Aceite Corporal de Argán', price: 38000, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Aceite+Argan', category: 'Corporal' },
  { id: 5, name: 'Exfoliante Corporal', price: 26000, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Exfoliante+Corporal', category: 'Corporal' },
  { id: 6, name: 'Mascarilla Capilar', price: 22500, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Mascarilla+Capilar', category: 'Capilar' },
  { id: 7, name: 'Kit de Maquillaje', price: 65000, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Kit+Maquillaje', category: 'Maquillaje' },
  { id: 8, name: 'Crema Corporal Hidratante', price: 24000, image: 'https://placehold.co/400x400/e5e2e1/4f4445?text=Crema+Corporal', category: 'Corporal' },
];

export default function Catalog() {
  const { addToCart, openCart } = useCart();

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="group bg-white rounded-xl overflow-hidden luxury-shadow hover:shadow-lg transition-all duration-300">
              <div className="aspect-square bg-[var(--color-surface-container-high)] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-manrope uppercase tracking-[0.1em] text-[var(--color-outline)]">{product.category}</span>
                <h3 className="font-headline text-[var(--text-headline-md)] text-[var(--color-on-surface)] mt-1 mb-1">{product.name}</h3>
                <p className="font-headline text-xl font-semibold text-[var(--color-secondary)]">
                  ${product.price.toLocaleString()}
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
      </div>
    </section>
  );
}
