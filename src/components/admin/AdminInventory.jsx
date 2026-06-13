import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api.getInventory().then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaveStock = async (productId, quantity) => {
    try {
      await api.updateStock(productId, Number(quantity));
      setEditing(null);
      load();
    } catch (e) { alert(e.message); }
  };

  const lowStockItems = items.filter((i) => i.quantity <= i.min_stock);

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Inventario</h2>
      </div>

      {lowStockItems.length > 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '12px 20px', borderRadius: 4, marginBottom: 24 }}>
          <strong>⚠ {lowStockItems.length} producto(s) con stock bajo:</strong>
          {lowStockItems.map((i) => (
            <span key={i.product_id} style={{ marginLeft: 16 }}>{i.product_name} ({i.quantity} uni.)</span>
          ))}
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Producto</th>
              <th style={{ padding: 12 }}>Stock actual</th>
              <th style={{ padding: 12 }}>Stock mínimo</th>
              <th style={{ padding: 12 }}>Estado</th>
              <th style={{ padding: 12 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.product_id} style={{ borderBottom: '1px solid #f0f0f0', background: i.quantity <= i.min_stock ? '#fff8e1' : 'transparent' }}>
                <td style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {i.image_url && <img src={i.image_url} alt="" style={{ width: 40, height: 53, objectFit: 'cover' }} />}
                  {i.product_name}
                </td>
                <td style={{ padding: 12, fontWeight: 600 }}>{i.quantity}</td>
                <td style={{ padding: 12 }}>{i.min_stock}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem',
                    background: i.quantity <= i.min_stock ? '#ffc107' : '#4caf50', color: '#fff',
                  }}>
                    {i.quantity <= i.min_stock ? 'Bajo' : 'Normal'}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  {editing === i.product_id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveStock(i.product_id, e.target.qty.value); }} style={{ display: 'flex', gap: 8 }}>
                      <input name="qty" type="number" defaultValue={i.quantity} style={{ width: 80, padding: '6px 8px', border: '1px solid #ddd' }} />
                      <button type="submit" style={{ padding: '6px 14px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>Guardar</button>
                      <button type="button" onClick={() => setEditing(null)} style={{ padding: '6px 14px', background: '#999', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                    </form>
                  ) : (
                    <button onClick={() => setEditing(i.product_id)} style={{ padding: '6px 16px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Ajustar stock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
