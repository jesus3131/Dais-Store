import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

const STATUS_COLORS = {
  pending: 'border-l-amber-400 bg-amber-50/50 text-amber-700',
  shipped: 'border-l-blue-400 bg-blue-50/50 text-blue-700',
  delivered: 'border-l-green-400 bg-green-50/50 text-green-700',
  cancelled: 'border-l-red-400 bg-red-50/50 text-red-700',
};

const STATUS_LABELS = { pending: 'Pendiente', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const { addToast } = useToast();

  const load = () => { api.getOrders(filter || undefined).then(setOrders).catch(() => {}); };
  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      const label = STATUS_LABELS[status] || status;
      addToast(`Pedido marcado como ${label}`); triggerFloatingNotification({ name: 'Pedido', product: label, icon: 'local_shipping', time: 'recién' }); load();
    } catch (err) { addToast(err.message || 'Error al actualizar estado', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta orden?')) return;
    try {
      await api.deleteOrder(id); addToast('Pedido eliminado', 'info'); load();
    } catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Pedidos</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''}{filter ? ` · ${STATUS_LABELS[filter]}` : ''}</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-5 py-2.5 font-inter text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ${
                filter === s ? 'bg-[var(--color-near-black)] text-white' : 'bg-white border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-near-black)]'
              }`}>
              {s ? STATUS_LABELS[s] : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-warm-gray)]/40">
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Cliente</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Items</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Total</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Fecha</th>
              <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                <td className="p-5">
                  <p className="font-headline text-sm text-[var(--color-near-black)]">{o.customer_name}</p>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-0.5">{o.email} {o.phone ? `· ${o.phone}` : ''}</p>
                </td>
                <td className="p-5">
                  {(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).map((item, i) => (
                    <span key={i} className="block font-inter text-xs text-[var(--color-on-surface-variant)]">{item.name} <span className="text-[var(--color-gold)]">x{item.quantity}</span></span>
                  ))}
                </td>
                <td className="p-5 font-headline text-sm font-semibold text-[var(--color-near-black)]">${Number(o.total).toLocaleString()}</td>
                <td className="p-5">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                    className={`px-3 py-1.5 font-inter text-[10px] uppercase tracking-[0.08em] border-l-2 cursor-pointer ${STATUS_COLORS[o.status] || 'border-l-gray-300 bg-gray-50 text-gray-700'}`}>
                    <option value="pending">Pendiente</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td className="p-5 font-inter text-xs text-[var(--color-on-surface-variant)]">{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete(o.id)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay pedidos {filter ? `en estado "${STATUS_LABELS[filter]}"` : ''}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
