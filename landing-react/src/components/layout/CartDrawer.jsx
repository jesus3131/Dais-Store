import { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { api, getImageUrl } from '../../services/api.js';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '573000000000';

const PAYMENT_METHODS = [
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta Débito/Crédito' },
];

export default function CartDrawer() {
  const {
    cartItems, isOpen, closeCart, addToCart, removeFromCart, clearCart,
    subtotal, totalItems, whatsappMessage,
  } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const handleWhatsApp = () => {
    api.createOrder({
      customer_name: customerName || 'Cliente Web',
      phone: customerPhone || WHATSAPP_NUMBER,
      email: 'cliente@daisstore.com',
      items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      total: subtotal,
      notes: 'Pedido desde la tienda web',
      payment_method: paymentMethod,
    }).catch(() => {});
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/40 z-[60] backdrop-blur-sm transition-opacity" onClick={closeCart} />
      )}
      <div className={`cart-drawer fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-luxury-lg ${isOpen ? 'open' : 'closed'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-warm-gray)]">
            <div>
              <h3 className="font-headline text-xl text-[var(--color-near-black)]">Tu carrito</h3>
              <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
            <button onClick={closeCart} className="w-10 h-10 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center hover:border-[var(--color-near-black)] transition-colors">
              <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <span className="material-symbols-outlined text-5xl text-[var(--color-warm-gray-dark)] mb-6">shopping_bag</span>
              <p className="font-headline text-lg text-[var(--color-near-black)] mb-2">Tu carrito está vacío</p>
              <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mb-8">Agrega productos premium para comenzar</p>
              <button onClick={() => { closeCart(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn-dark text-[10px] px-6 py-3">
                Explorar colección
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 pb-5 border-b border-[var(--color-warm-gray)]/50 last:border-0">
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-[var(--color-ivory-dark)]">
                      <img src={getImageUrl(item.image_url) || getImageUrl(item.image) || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=400&q=80'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-sm text-[var(--color-near-black)]">{item.name}</h4>
                      <p className="font-headline text-base font-semibold text-[var(--color-gold)] mt-1">
                        ${item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 border border-[rgba(0,0,0,0.08)] flex items-center justify-center hover:border-[var(--color-near-black)] transition-colors rounded">
                          <span className="material-symbols-outlined text-[12px] text-[var(--color-near-black)]">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                        </button>
                        <span className="font-inter text-sm w-5 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)}
                          className="w-7 h-7 border border-[rgba(0,0,0,0.08)] flex items-center justify-center hover:border-[var(--color-near-black)] transition-colors rounded">
                          <span className="material-symbols-outlined text-[12px] text-[var(--color-near-black)]">add</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-headline font-semibold text-sm text-[var(--color-near-black)]">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--color-warm-gray)] px-8 py-6 space-y-4">
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-[rgba(0,0,0,0.08)] px-4 py-2.5 font-inter text-sm focus:outline-none focus:border-[var(--color-near-black)] transition-colors" />
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Tu teléfono"
                  className="w-full border border-[rgba(0,0,0,0.08)] px-4 py-2.5 font-inter text-sm focus:outline-none focus:border-[var(--color-near-black)] transition-colors" />
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border border-[rgba(0,0,0,0.08)] px-4 py-2.5 font-inter text-sm focus:outline-none focus:border-[var(--color-near-black)] transition-colors bg-white">
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between">
                  <span className="font-inter text-sm text-[var(--color-on-surface-variant)]">Subtotal</span>
                  <span className="font-headline text-xl font-semibold text-[var(--color-near-black)]">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="font-inter text-[11px] text-[var(--color-on-surface-variant)]">*Costos de envío calculados al finalizar</p>
                <div className="flex gap-3">
                  <button onClick={clearCart}
                    className="flex-1 py-3.5 border border-[rgba(0,0,0,0.08)] text-[var(--color-near-black)] font-inter text-[10px] uppercase tracking-[0.18em] hover:border-[var(--color-near-black)] transition-all rounded">
                    Vaciar
                  </button>
                  <button onClick={handleWhatsApp}
                    className="flex-1 py-3.5 bg-[#25D366] text-white font-inter text-[10px] uppercase tracking-[0.18em] hover:bg-[#1da851] transition-all flex items-center justify-center gap-2 rounded">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    WhatsApp
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
