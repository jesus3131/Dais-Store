import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [unread, setUnread] = useState(0);
  const [lowCount, setLowCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    api.getOrderStats().then(setStats).catch(() => addToast('Error al cargar estadísticas', 'error'));
    api.getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    api.getLowStock().then(d => setLowCount(d.length)).catch(() => {});
    api.getOrders().then(all => setRecentOrders(all.slice(-5).reverse())).catch(() => {});
  }, [addToast]);

  const productCount = stats?.stats?.total_products ?? (stats?.stats?.topProducts?.length ?? '—');

  return (
    <div className="max-w-6xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Dashboard</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Resumen general de tu tienda</p>
        </div>
        <Link to="/admin/import" className="admin-btn-primary">
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          Importar
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats ? [
          { label: 'Ingresos Totales', value: `$${Number(stats.stats.total_revenue).toLocaleString()}`, icon: 'payments', sub: `$${Number(stats.stats.avg_order_value).toLocaleString()} avg`, color: 'text-green-600' },
          { label: 'Pedidos', value: stats.stats.total_orders, icon: 'receipt_long', sub: `${stats.stats.pending_count} pendientes`, color: 'text-blue-600' },
          { label: 'Productos', icon: 'inventory_2', value: productCount, sub: `${lowCount} stock bajo`, color: 'text-[var(--color-near-black)]' },
          { label: 'Mensajes', value: unread, icon: 'mail', sub: `${lowCount} stock bajo`, color: unread > 0 ? 'text-amber-600' : 'text-gray-600' },
        ].map(card => (
          <div key={card.label} className="admin-stat-card border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <span className={`material-symbols-outlined ${card.color} text-[22px]`}>{card.icon}</span>
              <span className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{card.sub}</span>
            </div>
            <p className="font-headline text-3xl text-[var(--color-near-black)]">{card.value}</p>
            <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{card.label}</p>
          </div>
        )) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-stat-card border border-[rgba(0,0,0,0.04)] animate-pulse">
              <div className="h-8 bg-[var(--color-warm-gray)]/30 w-20 mb-3 rounded" />
              <div className="h-4 bg-[var(--color-warm-gray)]/30 w-32 rounded" />
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[rgba(0,0,0,0.04)] p-8 lg:col-span-2">
          <h2 className="font-headline text-xl text-[var(--color-near-black)] mb-6">Acceso Rápido</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { to: '/admin/products', label: 'Productos', icon: 'inventory_2', desc: 'Gestionar catálogo' },
              { to: '/admin/orders', label: 'Pedidos', icon: 'receipt_long', desc: `${stats?.stats?.pending_count || 0} pendientes` },
              { to: '/admin/inventory', label: 'Inventario', icon: 'shelf_auto', desc: `${lowCount} productos bajos` },
              { to: '/admin/import', label: 'Importar Excel', icon: 'upload_file', desc: 'Carga masiva' },
              { to: '/admin/accounting', label: 'Contabilidad', icon: 'account_balance', desc: 'Exportar reportes' },
              { to: '/admin/messages', label: 'Mensajes', icon: 'mail', desc: `${unread} sin leer` },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-5 p-5 border border-[rgba(0,0,0,0.04)] hover:border-[var(--color-gold)]/30 hover:bg-[rgba(232,207,166,0.02)] transition-all duration-300 group">
                <span className="material-symbols-outlined text-[var(--color-gold)] text-[26px]">{item.icon}</span>
                <div>
                  <p className="font-headline text-sm text-[var(--color-near-black)]">{item.label}</p>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {recentOrders.length > 0 && (
            <div className="mt-8">
              <h3 className="font-headline text-base text-[var(--color-near-black)] mb-4">Últimos pedidos</h3>
              <div className="space-y-2">
                {recentOrders.map(o => (
                  <Link key={o.id} to="/admin/orders"
                    className="flex items-center justify-between p-4 border border-[rgba(0,0,0,0.04)] hover:border-[var(--color-gold)]/30 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${o.status === 'pending' ? 'bg-amber-400' : o.status === 'shipped' ? 'bg-blue-400' : o.status === 'delivered' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="font-headline text-sm text-[var(--color-near-black)] truncate">{o.customer_name}</span>
                    </div>
                    <span className="font-headline text-sm text-[var(--color-gold)] flex-shrink-0 ml-4">${Number(o.total).toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.04)] p-8">
          <h2 className="font-headline text-xl text-[var(--color-near-black)] mb-6">Alertas</h2>
          <div className="space-y-4">
            {unread > 0 && (
              <Link to="/admin/messages" className="flex items-center gap-4 p-4 border-l-2 border-[var(--color-gold)] bg-[rgba(232,207,166,0.03)] font-inter text-sm text-[var(--color-near-black)] hover:bg-[rgba(232,207,166,0.06)] transition-colors rounded-r">
                <span className="material-symbols-outlined text-[var(--color-gold)] text-[20px]">markunread</span>
                <span>{unread} mensaje{unread !== 1 ? 's' : ''} sin leer</span>
              </Link>
            )}
            {lowCount > 0 && (
              <Link to="/admin/inventory" className="flex items-center gap-4 p-4 border-l-2 border-red-400 bg-red-50/50 font-inter text-sm text-red-700 hover:bg-red-50 transition-colors rounded-r">
                <span className="material-symbols-outlined text-red-500 text-[20px]">inventory</span>
                <span>{lowCount} producto{lowCount !== 1 ? 's' : ''} con stock bajo</span>
              </Link>
            )}
            {stats?.stats?.pending_count > 0 && (
              <Link to="/admin/orders?status=pending" className="flex items-center gap-4 p-4 border-l-2 border-blue-400 bg-blue-50/50 font-inter text-sm text-blue-700 hover:bg-blue-50 transition-colors rounded-r">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">pending</span>
                <span>{stats.stats.pending_count} pedido{stats.stats.pending_count !== 1 ? 's' : ''} pendiente{stats.stats.pending_count !== 1 ? 's' : ''}</span>
              </Link>
            )}
            {!unread && !lowCount && !stats?.stats?.pending_count && (
              <p className="font-inter text-sm text-[var(--color-on-surface-variant)] text-center py-8">Todo está al día</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
