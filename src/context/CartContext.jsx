import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ cartService, children }) {
  const [summary, setSummary] = useState(() => cartService.getSummary());

  useEffect(() => {
    const unsubscribe = cartService.on('cart:updated', (data) => {
      setSummary({ ...data });
    });
    return unsubscribe;
  }, [cartService]);

  const addItem = useCallback((product) => cartService.addItem(product), [cartService]);
  const removeItem = useCallback((id) => cartService.removeItem(id), [cartService]);
  const clear = useCallback(() => cartService.clear(), [cartService]);

  return (
    <CartContext.Provider value={{ summary, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
