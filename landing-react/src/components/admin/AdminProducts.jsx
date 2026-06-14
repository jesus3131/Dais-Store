import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const CATEGORIES = ['Rostro', 'Corporal', 'Capilar', 'Maquillaje', 'Accesorios', 'General'];
const emptyForm = { name: '', price: '', description: '', image_url: '', category: 'General' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: String(p.price), description: p.description || '', image_url: p.image_url || '', category: p.category || 'General' });
    setModal({ type: 'edit', id: p.id });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { addToast('Nombre y precio son obligatorios', 'error'); return; }
    const payload = { ...form, price: parseFloat(form.price) };
    if (modal.type === 'edit') { await api.updateProduct(modal.id, payload); addToast('Producto actualizado'); }
    else { await api.createProduct(payload); addToast('Producto creado'); }
    setModal(null); load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    await api.deleteProduct(id); addToast('Producto eliminado', 'info'); load();
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Productos</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-warm-gray)]/40">
                <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Producto</th>
                <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Precio</th>
                <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Categoría</th>
                <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 overflow-hidden bg-[var(--color-ivory-dark)] flex-shrink-0">
                        <img src={p.image_url || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=80&q=80'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-headline text-sm text-[var(--color-near-black)]">{p.name}</p>
                        {p.description && <p className="font-inter text-xs text-[var(--color-on-surface-variant)] truncate max-w-[220px] mt-0.5">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 font-headline text-sm font-semibold text-[var(--color-near-black)]">{p.currency || '$'}{Number(p.price).toLocaleString()}</td>
                  <td className="p-5">
                    <span className="px-3 py-1.5 bg-[var(--color-ivory)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.08em]">{p.category}</span>
                  </td>
                  <td className="p-5">
                    {p.image_url ? (
                      <span className="flex items-center gap-1.5 font-inter text-xs text-green-600">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Con imagen
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-inter text-xs text-[var(--color-on-surface-variant)]">
                        <span className="material-symbols-outlined text-[14px]">hide_image</span> Sin imagen
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => openEdit(p)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors" title="Editar">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors" title="Eliminar">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay productos. Crea el primero.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--color-warm-gray)]/40 flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">
                {modal.type === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-warm-gray)]/30 transition-colors">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Nombre del producto</label>
                <input placeholder="Ej: Crema Hidratante Facial" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Precio</label>
                  <input placeholder="28500" type="number" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
                </div>
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Categoría</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">URL de imagen</label>
                <input placeholder="https://images.unsplash.com/..." value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="mt-3 w-20 h-20 object-cover border border-[var(--color-warm-gray)]/40"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div>
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Descripción</label>
                <textarea placeholder="Descripción del producto..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all resize-none" />
              </div>
            </div>
            <div className="p-8 border-t border-[var(--color-warm-gray)]/40 flex justify-end gap-4">
              <button onClick={() => setModal(null)} className="px-6 py-3 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-xs uppercase tracking-[0.15em] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)] transition-all">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all">
                {modal.type === 'edit' ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
