import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

const CATEGORIES = ['Rostro', 'Corporal', 'Capilar', 'Maquillaje', 'Accesorios', 'General'];
const emptyForm = { name: '', sku: '', price: '', old_price: '', wholesale_price: '', stock: '', description: '', image_url: '', image_url_2: '', category: 'General', active: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const { addToast } = useToast();
  const nameRef = useRef();

  const load = () => {
    setLoading(true);
    api.getProducts().then(setProducts).catch(() => addToast('Error al cargar productos', 'error')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (q && !(p.name || '').toLowerCase().includes(q) && !(p.sku || '').toLowerCase().includes(q)) return false;
    if (catFilter && p.category !== catFilter) return false;
    return true;
  });

  const openCreate = () => { setForm(emptyForm); setModal('create'); setTimeout(() => nameRef.current?.focus(), 100); };
  const openEdit = (p) => {
    setForm({
      name: p.name, sku: p.sku || '', price: String(p.price), old_price: String(p.old_price || ''),
      wholesale_price: String(p.wholesale_price || ''), stock: String(p.stock ?? ''), description: p.description || '', image_url: p.image_url || '',
      image_url_2: p.image_url_2 || '', category: p.category || 'General', active: p.active !== false,
    });
    setModal({ type: 'edit', id: p.id });
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { addToast('Nombre y precio son obligatorios', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        old_price: form.old_price ? parseFloat(form.old_price) : null,
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : null,
        stock: form.stock !== '' ? parseInt(form.stock, 10) : null,
        sku: form.sku || null,
      };
      if (modal.type === 'edit') { await api.updateProduct(modal.id, payload); addToast('Producto actualizado'); }
      else { await api.createProduct(payload); addToast('Producto creado'); triggerFloatingNotification({ name: 'Nuevo producto', product: form.name, time: 'recién' }); }
      setModal(null); load();
    } catch (err) { addToast(err.message || 'Error al guardar producto', 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (p) => {
    try {
      await api.updateProduct(p.id, { active: !p.active });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
      addToast(p.active ? 'Producto desactivado' : 'Producto activado');
    } catch (err) { addToast(err.message || 'Error al cambiar estado', 'error'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await api.deleteProduct(id); addToast('Producto eliminado', 'info'); triggerFloatingNotification({ name: 'Producto eliminado', product: name, icon: 'delete', time: '' }); load();
    } catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  const handleExport = async () => {
    try {
      const data = await api.exportProducts();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'productos_export.json'; a.click();
      URL.revokeObjectURL(url);
      addToast('Productos exportados');
    } catch { addToast('Error al exportar', 'error'); }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Productos</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} · {products.filter(p => p.active !== false).length} activos</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="admin-btn-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Exportar
          </button>
          <button onClick={openCreate} className="admin-btn-primary">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] material-symbols-outlined text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-3 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-all" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-3 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)]">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {products.length === 0 && !loading && (
        <div className="bg-white border border-[rgba(0,0,0,0.04)] p-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-on-surface-variant)] mb-4">inventory_2</span>
          <p className="font-headline text-lg text-[var(--color-near-black)] mb-2">No hay productos</p>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">Crea tu primer producto para comenzar</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="bg-white border border-[rgba(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full admin-table-modern">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th className="text-right">Precio</th>
                <th className="text-center">Stock</th>
                <th className="text-center">Activo</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={p.active === false ? 'opacity-50' : ''}>
                  <td>
                    <div className="flex items-center gap-4">
                      {p.image_url ? (
                        <div className="w-12 h-12 overflow-hidden flex-shrink-0 bg-[var(--color-ivory)] rounded">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-[rgba(0,0,0,0.03)] flex items-center justify-center flex-shrink-0 rounded">
                          <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">inventory_2</span>
                        </div>
                      )}
                      <div>
                        <span className="font-headline text-sm text-[var(--color-near-black)]">{p.name}</span>
                        {p.description && <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-0.5 line-clamp-1">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{p.sku || '—'}</span></td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{p.category || '—'}</span></td>
                  <td className="text-right">
                    <span className="font-headline text-sm font-semibold text-[var(--color-near-black)]">${Number(p.price).toLocaleString('es-CO')}</span>
                    {p.old_price && <span className="font-inter text-[10px] text-[var(--color-on-surface-variant)] line-through ml-2">${Number(p.old_price).toLocaleString('es-CO')}</span>}
                  </td>
                  <td className="text-center">
                    <span className={`font-inter text-sm ${Number(p.stock) <= 0 ? 'text-red-400' : Number(p.stock) <= 5 ? 'text-amber-500' : ''}`}>{p.stock ?? '—'}</span>
                  </td>
                  <td className="text-center">
                    <button onClick={() => toggleActive(p)}
                      className={`p-1.5 rounded transition-colors ${p.active !== false ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                      title={p.active !== false ? 'Desactivar' : 'Activar'}>
                      <span className="material-symbols-outlined text-[18px]">{p.active !== false ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors rounded hover:bg-red-50" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">
                  {search || catFilter ? 'No se encontraron productos con esos filtros' : 'No hay productos'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)} onKeyDown={e => e.key === 'Escape' && setModal(null)}>
          <div className="bg-white w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">
                {modal.type === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-5">
                  <div className="col-span-2">
                    <label className="admin-label">Nombre del producto <span className="text-red-400">*</span></label>
                    <input ref={nameRef} placeholder="Ej: Crema Hidratante Facial" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={200}
                      className="admin-input" required />
                  </div>
                  <div>
                    <label className="admin-label">SKU / Código</label>
                    <input placeholder="CREMA-001" value={form.sku}
                      onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                      className="admin-input" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="admin-label">Precio <span className="text-red-400">*</span></label>
                    <input placeholder="28500" type="number" step="0.01" min="0" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="admin-input" required />
                  </div>
                  <div>
                    <label className="admin-label">Precio anterior</label>
                    <input placeholder="35000" type="number" step="0.01" min="0" value={form.old_price}
                      onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))}
                      className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Precio por mayor</label>
                    <input placeholder="22000" type="number" step="0.01" min="0" value={form.wholesale_price}
                      onChange={e => setForm(f => ({ ...f, wholesale_price: e.target.value }))}
                      className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Stock</label>
                    <input type="number" min="0" step="1" placeholder="0" value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      className="admin-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Categoría</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="admin-input">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Estado</label>
                    <div className="flex items-center gap-3 h-full pt-2">
                      <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                        className={`flex items-center gap-2 px-4 py-2 border rounded transition-all ${form.active ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                        <span className="material-symbols-outlined text-[18px]">{form.active ? 'check_circle' : 'radio_button_unchecked'}</span>
                        {form.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">URL de imagen principal</label>
                    <input placeholder="https://..." value={form.image_url}
                      onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} type="url"
                      className="admin-input" />
                    {form.image_url && (
                      <img src={form.image_url} alt="Preview" className="mt-3 w-20 h-20 object-cover border border-[rgba(0,0,0,0.06)] rounded"
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                  </div>
                  <div>
                    <label className="admin-label">URL imagen secundaria</label>
                    <input placeholder="https://..." value={form.image_url_2}
                      onChange={e => setForm(f => ({ ...f, image_url_2: e.target.value }))} type="url"
                      className="admin-input" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Descripción</label>
                  <textarea placeholder="Descripción del producto..." value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} maxLength={1000}
                    className="admin-input resize-none" />
                </div>
              </div>
              <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex justify-end gap-4">
                <button type="button" onClick={() => setModal(null)} className="admin-btn-outline">Cancelar</button>
                <button type="submit" disabled={saving} className="admin-btn">
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
