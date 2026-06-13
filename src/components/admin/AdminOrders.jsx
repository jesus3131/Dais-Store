import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const STATUS_LABELS = { pending: 'Pendiente', shipped: 'Enviado', delivered: 'Entregado' };
const STATUS_COLORS = { pending: '#f39c12', shipped: '#3498db', delivered: '#2ecc71' };

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    api.getOrders(filter ? { status: filter } : {}).then(setOrders).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Despacho de Pedidos</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'pending', 'shipped', 'delivered'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '8px 16px', cursor: 'pointer',
                background: filter === s ? '#1A1A1A' : 'transparent',
                color: filter === s ? '#fff' : '#1A1A1A',
                border: '1px solid #1A1A1A', fontSize: '0.8rem',
              }}
            >{s ? STATUS_LABELS[s] : 'Todos'}</button>
          ))}
        </div>
      </div>

      {detail && (
        <div style={{ background: '#f9f9f9', padding: 24, marginBottom: 24, borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)' }}>Pedido #{detail.id}</h3>
            <button onClick={() => setDetail(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>✕</button>
          </div>
          <p><strong>Cliente:</strong> {detail.customer_name}</p>
          <p><strong>Teléfono:</strong> {detail.phone || '—'}</p>
          <p><strong>Email:</strong> {detail.email || '—'}</p>
          <p><strong>Estado:</strong> {STATUS_LABELS[detail.status]}</p>
          <p><strong>Notas:</strong> {detail.notes || '—'}</p>
          <p><strong>Fecha:</strong> {new Date(detail.created_at).toLocaleDateString('es-CO')}</p>
          <h4 style={{ marginTop: 16, marginBottom: 8 }}>Productos</h4>
          {detail.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.name} x{item.qty}</span>
              <span>${(item.price * item.qty).toLocaleString('es-CO')}</span>
            </div>
          ))}
          <p style={{ marginTop: 12, fontWeight: 700, fontSize: '1.1rem' }}>Total: ${detail.total?.toLocaleString('es-CO')}</p>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>#</th>
              <th style={{ padding: 12 }}>Cliente</th>
              <th style={{ padding: 12 }}>Productos</th>
              <th style={{ padding: 12 }}>Total</th>
              <th style={{ padding: 12 }}>Estado</th>
              <th style={{ padding: 12 }}>Fecha</th>
              <th style={{ padding: 12 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>{o.id}</td>
                <td style={{ padding: 12 }}>{o.customer_name}<br /><span style={{ fontSize: '0.75rem', color: '#999' }}>{o.phone}</span></td>
                <td style={{ padding: 12 }}>{o.items?.length || 0} producto(s)</td>
                <td style={{ padding: 12, fontWeight: 600 }}>${o.total?.toLocaleString('es-CO')}</td>
                <td style={{ padding: 12 }}>
                  <select value={o.status} onChange={(e) => handleStatus(o.id, e.target.value)}
                    style={{
                      padding: '4px 8px', border: `1px solid ${STATUS_COLORS[o.status]}`,
                      color: STATUS_COLORS[o.status], fontWeight: 500, borderRadius: 2, cursor: 'pointer',
                    }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                  </select>
                </td>
                <td style={{ padding: 12, fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => setDetail(o)} style={{ padding: '6px 14px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No hay pedidos</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
