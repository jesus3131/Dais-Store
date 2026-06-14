import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', min_stock: '' });
  const { addToast } = useToast();

  const load = () => { api.getInventory().then(setInventory).catch(() => {}); };
  useEffect(load, []);

  const startEdit = (item) => { setForm({ quantity: String(item.quantity), min_stock: String(item.min_stock) }); setEditing(item.product_id); };

  const handleSave = async (productId) => {
    await api.updateStock(productId, parseInt(form.quantity));
    await api.updateMinStock(productId, parseInt(form.min_stock));
    setEditing(null); addToast('Inventario actualizado'); load();
  };

  const lowStock = inventory.filter(i => i.quantity <= i.min_stock);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Inventario</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{inventory.length} producto{inventory.length !== 1 ? 's' : ''} · {lowStock.length} stock bajo</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="border-l-2 border-red-400 bg-red-50/50 p-6 mb-8">
          <div className="flex items-center gap-2 text-red-700 font-inter font-medium text-sm mb-4">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo
          </div>
          <div className="space-y-1.5">
            {lowStock.map(item => (
              <p key={item.product_id} className="font-inter text-sm text-red-600 ml-8">{item.product_name} — {item.quantity} unidades (mín: {item.min_stock})</p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-warm-gray)]/40">
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Producto</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Stock</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Stock Mínimo</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
              <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acción</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.product_id} className={`border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors ${item.quantity <= item.min_stock ? 'bg-red-50/30' : ''}`}>
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    {item.image_url && <div className="w-12 h-12 overflow-hidden bg-[var(--color-ivory-dark)] flex-shrink-0"><img src={item.image_url} alt="" className="w-full h-full object-cover" /></div>}
                    <span className="font-headline text-sm text-[var(--color-near-black)]">{item.product_name}</span>
                  </div>
                </td>
                <td className="p-5">
                  {editing === item.product_id ? (
                    <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                      className="w-20 px-3 py-2 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)]" />
                  ) : (
                    <span className={`font-headline text-sm ${item.quantity <= item.min_stock ? 'text-red-600' : 'text-[var(--color-near-black)]'}`}>{item.quantity}</span>
                  )}
                </td>
                <td className="p-5">
                  {editing === item.product_id ? (
                    <input type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))}
                      className="w-20 px-3 py-2 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)]" />
                  ) : (
                    <span className="font-inter text-sm text-[var(--color-on-surface-variant)]">{item.min_stock}</span>
                  )}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1.5 font-inter text-[10px] uppercase tracking-[0.08em] font-medium ${item.quantity <= item.min_stock ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {item.quantity <= item.min_stock ? 'Bajo' : 'OK'}
                  </span>
                </td>
                <td className="p-5 text-right">
                  {editing === item.product_id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.12em] hover:border-[var(--color-near-black)] transition-all">Cancelar</button>
                      <button onClick={() => handleSave(item.product_id)} className="px-4 py-2 bg-[var(--color-near-black)] text-white font-inter text-[10px] uppercase tracking-[0.12em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all">Guardar</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(item)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors" title="Editar">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr><td colSpan={5} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay datos de inventario</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
