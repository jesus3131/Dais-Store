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

function parseItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try { return JSON.parse(items); } catch { return []; }
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const items = parseItems(order.items);

  return (
    <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <h2 className="font-headline text-xl text-[var(--color-near-black)]">Detalle del Pedido</h2>
            <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">#{order.id?.slice(0, 8) || '—'} · {new Date(order.created_at).toLocaleString('es-CO')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-2">Cliente</p>
              <p className="font-headline text-sm text-[var(--color-near-black)]">{order.customer_name || '—'}</p>
              <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{order.email}{order.phone ? ` · ${order.phone}` : ''}</p>
            </div>
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-2">Estado</p>
              <span className={`inline-block px-3 py-1.5 font-inter text-[10px] uppercase tracking-[0.08em] border-l-2 ${STATUS_COLORS[order.status] || 'border-l-gray-300 bg-gray-50 text-gray-700'} rounded`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-2">Total: <span className="font-bold text-[var(--color-near-black)]">${Number(order.total).toLocaleString()}</span></p>
            </div>
          </div>

          {order.shipping_address && (
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-2">Dirección de envío</p>
              <p className="font-inter text-sm text-[var(--color-on-surface)]">{order.shipping_address}</p>
              {order.shipping_city && <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">{order.shipping_city}{order.shipping_department ? `, ${order.shipping_department}` : ''}</p>}
            </div>
          )}

          {order.notes && (
            <div>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-2">Notas del cliente</p>
              <p className="font-inter text-sm text-[var(--color-on-surface)] bg-[var(--color-ivory)] p-4 rounded">{order.notes}</p>
            </div>
          )}

          <div>
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">Productos ({items.length})</p>
            <div className="divide-y divide-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.04)]">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-sm text-[var(--color-near-black)] truncate">{item.name}</p>
                    {item.sku && <p className="font-inter text-[10px] text-gray-400">SKU: {item.sku}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">x{item.quantity || 1}</p>
                    <p className="font-headline text-sm text-[var(--color-gold)]">${Number(item.price || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <p className="font-headline text-lg text-[var(--color-near-black)]">Total: <span className="text-[var(--color-gold)]">${Number(order.total).toLocaleString()}</span></p>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex justify-end">
          <button onClick={onClose} className="admin-btn-outline">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getOrders(filter || undefined).then(setOrders).catch(() => addToast('Error al cargar pedidos', 'error'))
    .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.customer_name || '').toLowerCase().includes(q) || (o.email || '').toLowerCase().includes(q) || (o.id || '').toLowerCase().includes(q);
  });

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
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Pedidos</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''}{filter ? ` · ${STATUS_LABELS[filter]}` : ''}</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-5 py-2.5 font-inter text-[10px] uppercase tracking-[0.15em] transition-all duration-300 rounded ${
                filter === s ? 'bg-[var(--color-near-black)] text-white' : 'bg-white border border-[rgba(0,0,0,0.08)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-near-black)]'
              }`}>
              {s ? STATUS_LABELS[s] : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] material-symbols-outlined text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, email o ID..."
            className="w-full pl-10 pr-4 py-3 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-all" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full" />
        </div>
      ) : (
      <div className="bg-white border border-[rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full admin-table-modern">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td>
                  <p className="font-headline text-sm text-[var(--color-near-black)]">{o.customer_name}</p>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-0.5">{o.email} {o.phone ? `· ${o.phone}` : ''}</p>
                </td>
                <td>
                  {parseItems(o.items).map((item, i) => (
                    <span key={i} className="block font-inter text-xs text-[var(--color-on-surface-variant)]">{item.name} <span className="text-[var(--color-gold)]">x{item.quantity}</span></span>
                  ))}
                </td>
                <td className="font-headline text-sm font-semibold text-[var(--color-near-black)]">${Number(o.total).toLocaleString()}</td>
                <td>
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                    className={`px-3 py-1.5 font-inter text-[10px] uppercase tracking-[0.08em] border-l-2 cursor-pointer ${STATUS_COLORS[o.status] || 'border-l-gray-300 bg-gray-50 text-gray-700'} rounded`}>
                    <option value="pending">Pendiente</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td className="font-inter text-xs text-[var(--color-on-surface-variant)]">{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setDetailOrder(o)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Ver detalle">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button onClick={() => api.downloadInvoice(o.id).catch(() => addToast('Error al descargar factura', 'error'))}
                      className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Descargar factura PDF">
                      <span className="material-symbols-outlined text-[18px]">receipt</span>
                    </button>
                    <button onClick={() => handleDelete(o.id)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors rounded hover:bg-red-50" title="Eliminar">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">
                {search ? 'No se encontraron pedidos con ese criterio de búsqueda' : `No hay pedidos${filter ? ` en estado "${STATUS_LABELS[filter]}"` : ''}`}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
    </div>
  );
}
