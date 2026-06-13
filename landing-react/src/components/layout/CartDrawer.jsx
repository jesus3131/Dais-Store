import { useCart } from '../../context/CartContext.jsx';

const WHATSAPP_NUMBER = '573000000000'; // configurable

export default function CartDrawer() {
  const {
    cartItems, isOpen, closeCart, addToCart, removeFromCart, clearCart,
    subtotal, totalItems, whatsappMessage,
  } = useCart();

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[60] transition-opacity"
          onClick={closeCart}
        />
      )}
      <div
        className={`cart-drawer fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl ${isOpen ? 'open' : 'closed'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-outline-variant)]">
            <div>
              <h3 className="font-headline text-lg text-[var(--color-on-surface)]">Tu Carrito</h3>
              <p className="font-manrope text-xs text-[var(--color-outline)]">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
            <button onClick={closeCart} className="p-1">
              <span className="material-symbols-outlined text-[var(--color-on-surface)]">close</span>
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <span className="material-symbols-outlined text-6xl text-[var(--color-outline-variant)] mb-4">shopping_bag</span>
              <p className="font-headline text-lg text-[var(--color-on-surface)] mb-2">Tu carrito está vacío</p>
              <p className="font-manrope text-sm text-[var(--color-outline)] mb-6">Agrega productos para comenzar tu pedido</p>
              <button
                onClick={() => { closeCart(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-6 py-3 bg-[var(--color-primary)] text-white font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all"
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-[var(--color-outline-variant)] last:border-0">
                    <div className="w-20 h-20 rounded-lg bg-[var(--color-surface-container-high)] flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-manrope font-semibold text-sm text-[var(--color-on-surface)] truncate">{item.name}</h4>
                      <p className="font-headline text-sm font-semibold text-[var(--color-secondary)] mt-1">
                        ${item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center hover:bg-[var(--color-surface-container-high)] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm text-[var(--color-on-surface)]">
                            {item.quantity === 1 ? 'delete' : 'remove'}
                          </span>
                        </button>
                        <span className="font-manrope font-semibold text-sm text-[var(--color-on-surface)] w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center hover:bg-[var(--color-surface-container-high)] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm text-[var(--color-on-surface)]">add</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-manrope font-semibold text-sm text-[var(--color-on-surface)]">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--color-outline-variant)] px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-manrope text-sm text-[var(--color-outline)]">Subtotal</span>
                  <span className="font-headline text-lg font-semibold text-[var(--color-on-surface)]">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="font-manrope text-xs text-[var(--color-outline)]">
                  *Los costos de envío se calculan al finalizar el pedido.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-3 border border-[var(--color-outline)] text-[var(--color-on-surface)] font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-surface-container-high)] transition-all"
                  >
                    Vaciar
                  </button>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#25D366] text-white font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[#1da851] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    WhatsApp
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
