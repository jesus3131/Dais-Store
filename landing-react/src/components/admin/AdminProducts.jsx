import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', image_url: '', category: 'general' });

  const load = () => {
    setLoading(true);
    api.getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({ name: '', price: '', description: '', image_url: '', category: 'general' });
    setModal('create');
  };

  const openEdit = (p) => {
    setForm({ name: p.name, price: String(p.price), description: p.description || '', image_url: p.image_url || '', category: p.category || 'general' });
    setModal({ type: 'edit', id: p.id });
  };

  const handleSave = async () => {
    const payload = { ...form, price: parseFloat(form.price) };
    if (modal.type === 'edit') {
      await api.updateProduct(modal.id, payload);
    } else {
      await api.createProduct(payload);
    }
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await api.deleteProduct(id);
    load();
  };

  if (loading) return <p className="font-manrope text-[var(--color-outline)]">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl text-[var(--color-on-surface)]">Productos</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white font-manrope text-sm rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Producto
        </button>
      </div>
      <div className="bg-white rounded-xl luxury-shadow overflow-x-auto">
        <table className="w-full font-manrope text-sm">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]">
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Nombre</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Precio</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Categoría</th>
              <th className="text-right p-4 text-[var(--color-outline)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-[var(--color-outline-variant)] last:border-0 hover:bg-[var(--color-surface-container-high)] transition-colors">
                <td className="p-4 text-[var(--color-on-surface)]">{p.name}</td>
                <td className="p-4 text-[var(--color-on-surface)]">{p.currency || '$'}{p.price}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-primary-container)] text-[var(--color-primary)] text-xs">{p.category}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(p)} className="p-2 text-[var(--color-outline)] hover:text-[var(--color-primary)] transition-colors" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-[var(--color-outline)] hover:text-red-500 transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-[var(--color-outline)]">No hay productos aún</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline text-xl text-[var(--color-on-surface)] mb-6">
              {modal.type === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <div className="space-y-4">
              <input placeholder="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)]" />
              <input placeholder="Precio" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)]" />
              <input placeholder="URL de imagen" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)]" />
              <input placeholder="Categoría" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)]" />
              <textarea placeholder="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-6 py-2.5 font-manrope text-sm text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] rounded-full hover:bg-[var(--color-surface-container-high)] transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-manrope text-sm rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all">
                {modal.type === 'edit' ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
