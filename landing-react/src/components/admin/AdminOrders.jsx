import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    api.getOrders(filter || undefined).then(setOrders).catch(() => {});
  };

  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    await api.updateOrderStatus(id, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta orden?')) return;
    await api.deleteOrder(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl text-[var(--color-on-surface)]">Pedidos</h1>
        <div className="flex gap-2">
          {['', 'pending', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full font-manrope text-xs transition-all ${
                filter === s ? 'bg-[var(--color-primary)] text-white' : 'bg-white border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Todos'}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl luxury-shadow overflow-x-auto">
        <table className="w-full font-manrope text-sm">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]">
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Cliente</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Teléfono</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Items</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Total</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Estado</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Fecha</th>
              <th className="text-right p-4 text-[var(--color-outline)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-[var(--color-outline-variant)] last:border-0 hover:bg-[var(--color-surface-container-high)] transition-colors">
                <td className="p-4">
                  <p className="text-[var(--color-on-surface)] font-semibold">{o.customer_name}</p>
                  <p className="text-[var(--color-outline)] text-xs">{o.email}</p>
                </td>
                <td className="p-4 text-[var(--color-on-surface)]">{o.phone}</td>
                <td className="p-4">
                  {(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).map((item, i) => (
                    <span key={i} className="block text-[var(--color-on-surface-variant)] text-xs">{item.name} x{item.quantity}</span>
                  ))}
                </td>
                <td className="p-4 font-semibold text-[var(--color-on-surface)]">${Number(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[o.status] || 'bg-gray-50 text-gray-700'}`}>
                    <option value="pending">Pendiente</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td className="p-4 text-[var(--color-outline)] text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(o.id)} className="p-2 text-[var(--color-outline)] hover:text-red-500 transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-[var(--color-outline)]">No hay pedidos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
