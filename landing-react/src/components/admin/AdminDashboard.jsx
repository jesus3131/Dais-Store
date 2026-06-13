import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.getOrderStats().then(setStats).catch(() => {});
    api.getUnreadCount().then((d) => setUnread(d.count)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pedidos', value: stats.stats.total_orders, icon: 'receipt_long' },
            { label: 'Ingresos', value: `$${Number(stats.stats.total_revenue).toFixed(2)}`, icon: 'payments' },
            { label: 'Pendientes', value: stats.stats.pending_count, icon: 'pending' },
            { label: 'Valor Promedio', value: `$${Number(stats.stats.avg_order_value).toFixed(2)}`, icon: 'trending_up' },
          ].map(card => (
            <div key={card.label} className="bg-white p-5 rounded-xl luxury-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">{card.icon}</span>
                <p className="font-manrope text-xs text-[var(--color-outline)]">{card.label}</p>
              </div>
              <p className="font-headline text-2xl text-[var(--color-on-surface)]">{card.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats && stats.revenueByDay && (
          <div className="bg-white p-6 rounded-xl luxury-shadow">
            <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Ingresos (últimos 30 días)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.revenueByDay.map(d => (
                <div key={d.day} className="flex justify-between font-manrope text-sm py-1 border-b border-[var(--color-outline-variant)] last:border-0">
                  <span className="text-[var(--color-on-surface-variant)]">{d.day}</span>
                  <span className="font-semibold text-[var(--color-on-surface)]">${Number(d.revenue).toFixed(2)} ({d.orders})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Accesos Rápidos</h2>
          <div className="space-y-3">
            <a href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-primary)] font-manrope text-sm hover:bg-[var(--color-primary)] hover:text-white transition-all">
              <span className="material-symbols-outlined">add_circle</span>
              Agregar Producto
            </a>
            <a href="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] font-manrope text-sm hover:bg-[var(--color-secondary)] hover:text-white transition-all">
              <span className="material-symbols-outlined">assignment</span>
              Ver Pedidos Pendientes
            </a>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-700 font-manrope text-sm">
              <span className="material-symbols-outlined">markunread</span>
              Mensajes sin leer: {unread}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
