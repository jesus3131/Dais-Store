import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

const CATEGORIES = ['Rostro', 'Corporal', 'Capilar', 'Maquillaje', 'Accesorios', 'General'];
const emptyForm = { name: '', price: '', description: '', image_url: '', category: 'General' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const nameRef = useRef();

  const load = () => {
    setLoading(true);
    api.getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); setTimeout(() => nameRef.current?.focus(), 100); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: String(p.price), description: p.description || '', image_url: p.image_url || '', category: p.category || 'General' });
    setModal({ type: 'edit', id: p.id });
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { addToast('Nombre y precio son obligatorios', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (modal.type === 'edit') { await api.updateProduct(modal.id, payload); addToast('Producto actualizado'); }
      else { await api.createProduct(payload); addToast('Producto creado'); triggerFloatingNotification({ name: 'Nuevo producto', product: form.name, time: 'recién' }); }
      setModal(null); load();
    } catch (err) { addToast(err.message || 'Error al guardar producto', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await api.deleteProduct(id); addToast('Producto eliminado', 'info'); triggerFloatingNotification({ name: 'Producto eliminado', product: name, icon: 'delete', time: '' }); load();
    } catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') setModal(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" /></div>;
  }

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

      {products.length === 0 && !loading && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-on-surface-variant)] mb-4">inventory_2</span>
          <p className="font-headline text-lg text-[var(--color-near-black)] mb-2">No hay productos</p>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">Crea tu primer producto para comenzar</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-warm-gray)]/40">
                <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Producto</th>
                <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Categoría</th>
                <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Precio</th>
                <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Stock</th>
                <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {p.image_url ? (
                        <div className="w-12 h-12 overflow-hidden flex-shrink-0 bg-[var(--color-ivory)]">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-[var(--color-warm-gray)]/20 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">inventory_2</span>
                        </div>
                      )}
                      <div>
                        <span className="font-headline text-sm text-[var(--color-near-black)]">{p.name}</span>
                        {p.description && <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-0.5 line-clamp-1">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 font-inter text-xs text-[var(--color-on-surface-variant)]">{p.category || '—'}</td>
                  <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">${Number(p.price).toLocaleString('es-CO')}</td>
                  <td className="p-5 text-center font-inter text-sm">{p.stock ?? '—'}</td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)} onKeyDown={handleModalKeyDown}>
          <div className="bg-white w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--color-warm-gray)]/40 flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">
                {modal.type === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-warm-gray)]/30 transition-colors">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6">
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Nombre del producto <span className="text-red-400">*</span></label>
                  <input ref={nameRef} placeholder="Ej: Crema Hidratante Facial" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={200}
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" required />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Precio <span className="text-red-400">*</span></label>
                    <input placeholder="28500" type="number" step="0.01" min="0" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" required />
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
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} type="url"
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
                  {form.image_url && (
                    <img src={form.image_url} alt="Preview" className="mt-3 w-20 h-20 object-cover border border-[var(--color-warm-gray)]/40"
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                </div>
                <div>
                  <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Descripción</label>
                  <textarea placeholder="Descripción del producto..." value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} maxLength={1000}
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all resize-none" />
                </div>
              </div>
              <div className="p-8 border-t border-[var(--color-warm-gray)]/40 flex justify-end gap-4">
                <button type="button" onClick={() => setModal(null)} className="px-6 py-3 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-xs uppercase tracking-[0.15em] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)] transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all disabled:opacity-50">
                  {saving ? 'Guardando...' : modal.type === 'edit' ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
