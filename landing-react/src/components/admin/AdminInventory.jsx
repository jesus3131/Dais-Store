import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', min_stock: '' });

  const load = () => {
    api.getInventory().then(setInventory).catch(() => {});
  };

  useEffect(load, []);

  const startEdit = (item) => {
    setForm({ quantity: String(item.quantity), min_stock: String(item.min_stock) });
    setEditing(item.product_id);
  };

  const handleSave = async (productId) => {
    await api.updateStock(productId, parseInt(form.quantity));
    await api.updateMinStock(productId, parseInt(form.min_stock));
    setEditing(null);
    load();
  };

  const lowStock = inventory.filter(i => i.quantity <= i.min_stock);

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Inventario</h1>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 font-manrope font-semibold text-sm mb-2">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo
          </div>
          {lowStock.map(item => (
            <p key={item.product_id} className="font-manrope text-sm text-red-600 ml-7">
              {item.product_name} — {item.quantity} unidades (mín: {item.min_stock})
            </p>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl luxury-shadow overflow-x-auto">
        <table className="w-full font-manrope text-sm">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]">
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Producto</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Stock</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Stock Mínimo</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Estado</th>
              <th className="text-right p-4 text-[var(--color-outline)] font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.product_id} className={`border-b border-[var(--color-outline-variant)] last:border-0 ${item.quantity <= item.min_stock ? 'bg-red-50' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <span className="text-[var(--color-on-surface)]">{item.product_name}</span>
                  </div>
                </td>
                <td className="p-4">
                  {editing === item.product_id ? (
                    <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                      className="w-20 px-2 py-1 border border-[var(--color-outline-variant)] rounded text-sm" />
                  ) : (
                    <span className={`font-semibold ${item.quantity <= item.min_stock ? 'text-red-600' : 'text-[var(--color-on-surface)]'}`}>
                      {item.quantity}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {editing === item.product_id ? (
                    <input type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))}
                      className="w-20 px-2 py-1 border border-[var(--color-outline-variant)] rounded text-sm" />
                  ) : (
                    <span className="text-[var(--color-on-surface-variant)]">{item.min_stock}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.quantity <= item.min_stock ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {item.quantity <= item.min_stock ? 'Bajo' : 'OK'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {editing === item.product_id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(null)} className="px-3 py-1 text-xs border border-[var(--color-outline-variant)] rounded-full">Cancelar</button>
                      <button onClick={() => handleSave(item.product_id)} className="px-3 py-1 text-xs bg-[var(--color-primary)] text-white rounded-full">Guardar</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(item)} className="p-2 text-[var(--color-outline)] hover:text-[var(--color-primary)] transition-colors" title="Editar">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-[var(--color-outline)]">No hay datos de inventario</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
