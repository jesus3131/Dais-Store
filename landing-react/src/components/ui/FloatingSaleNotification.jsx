import { useState, useEffect, useCallback } from 'react';

const NAMES = [
  'María', 'Carolina', 'Andrea', 'Valentina', 'Laura', 'Camila', 'Sofía',
  'Isabella', 'Gabriela', 'Daniela', 'Ana', 'Luisa', 'Fernanda', 'Alejandra',
  'Paula', 'Manuela', 'Juliana', 'Tatiana', 'Verónica', 'Ximena',
];

const PRODUCTS = [
  'Crema Facial', 'Sérum Vitamina C', 'Protector Solar', 'Aceite Corporal',
  'Mascarilla Capilar', 'Labial Mate', 'Base Líquida', 'Exfoliante Facial',
  'Contorno de Ojos', 'Brillo Labial', 'Crema de Manos', 'Aceite Esencial',
];

const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Montería'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function timeAgo(minutes) {
  if (minutes < 1) return 'recién';
  if (minutes === 1) return 'hace 1 min';
  if (minutes < 60) return `hace ${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `hace ${h} h`;
}

export function triggerFloatingNotification(data) {
  window.dispatchEvent(new CustomEvent('floating-notification', { detail: data }));
}

export default function FloatingSaleNotification() {
  const [items, setItems] = useState([]);

  const push = useCallback(({ name, product, city, time, icon }) => {
    const id = Date.now() + Math.random();
    setItems(prev => [...prev, { id, name, product, city, time, icon }]);
    setTimeout(() => setItems(prev => prev.filter(n => n.id !== id)), 6000);
  }, []);

  const addSimulated = useCallback(() => {
    push({
      name: randomItem(NAMES),
      product: randomItem(PRODUCTS),
      city: randomItem(CITIES),
      time: timeAgo(Math.floor(Math.random() * 50) + 1),
    });
  }, [push]);

  useEffect(() => {
    const handler = (e) => {
      const d = e.detail;
      push({ name: d.name || 'Cliente', product: d.product || 'producto', city: d.city || '', time: d.time || 'recién', icon: d.icon });
    };
    window.addEventListener('floating-notification', handler);
    addSimulated();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') addSimulated();
    }, Math.random() * 10000 + 8000);
    return () => { clearInterval(interval); window.removeEventListener('floating-notification', handler); };
  }, [addSimulated, push]);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-6 z-[90] flex flex-col gap-3 max-w-xs pointer-events-none">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="pointer-events-auto bg-white border border-[var(--color-warm-gray)]/50 shadow-luxury-lg flex items-center gap-3 px-4 py-3 animate-notification-in"
          style={{ zIndex: items.length - i }}
        >
          <div className="w-9 h-9 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[16px] text-[var(--color-gold)]">{item.icon || 'shopping_bag'}</span>
          </div>
          <div className="min-w-0">
            <p className="font-inter text-xs text-[var(--color-near-black)] leading-tight">
              <span className="font-semibold">{item.name}</span>{' '}
              {item.product ? <>compró <span className="text-[var(--color-gold)] font-medium">{item.product}</span></> : item.message}
            </p>
            {(item.city || item.time) && (
              <p className="font-inter text-[10px] text-[var(--color-on-surface-variant)] mt-0.5">
                {[item.city, item.time].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
