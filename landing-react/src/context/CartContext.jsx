import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const whatsappMessage = encodeURIComponent(
    '¡Hola! Quiero hacer un pedido:\n\n' +
    cartItems.map(item =>
      `• ${item.name} x${item.quantity} — $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n') +
    `\n\nTotal: $${subtotal.toLocaleString()}\n\n¡Gracias!`
  );

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, clearCart,
      isOpen, toggleCart, openCart, closeCart,
      subtotal, totalItems, whatsappMessage,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
