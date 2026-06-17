import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const emptyForm = { name: '', email: '', phone: '', city: '', department: '', address: '', notes: '' };

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getCustomers().then(setCustomers).catch(() => addToast('Error al cargar clientes', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
  });

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (c) => { setForm({ name: c.name, email: c.email || '', phone: c.phone || '', city: c.city || '', department: c.department || '', address: c.address || '', notes: c.notes || '' }); setModal({ type: 'edit', id: c.id }); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { addToast('El nombre es obligatorio', 'error'); return; }
    setSaving(true);
    try {
      if (modal.type === 'edit') { await api.updateCustomer(modal.id, form); addToast('Cliente actualizado'); }
      else { await api.createCustomer(form); addToast('Cliente creado'); }
      setModal(null); load();
    } catch (err) { addToast(err.message || 'Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar a "${name}"?`)) return;
    try { await api.deleteCustomer(id); addToast('Cliente eliminado', 'info'); load(); }
    catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  return (
    <div className="max-w-6xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Clientes</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{customers.length} cliente{customers.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Cliente
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] material-symbols-outlined text-[18px]">search</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, email o teléfono..."
          className="w-full pl-10 pr-4 py-3 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-all" />
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
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Ubicación</th>
                <th className="text-center">Pedidos</th>
                <th className="text-right">Gastado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><span className="font-headline text-sm text-[var(--color-near-black)]">{c.name}</span></td>
                  <td>
                    <p className="font-inter text-xs text-[var(--color-on-surface)]">{c.email || '—'}</p>
                    <p className="font-inter text-[10px] text-[var(--color-on-surface-variant)]">{c.phone || ''}</p>
                  </td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{c.city || c.department ? [c.city, c.department].filter(Boolean).join(', ') : '—'}</span></td>
                  <td className="text-center font-inter text-sm">{c.total_orders || 0}</td>
                  <td className="text-right font-headline text-sm text-[var(--color-gold)]">${Number(c.total_spent || 0).toLocaleString()}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors rounded hover:bg-red-50" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">
                  {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">{modal.type === 'edit' ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6">
                <div>
                  <label className="admin-label">Nombre <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" required />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Teléfono</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="admin-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Ciudad</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Departamento</label>
                    <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="admin-input" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Dirección</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Notas</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="admin-input resize-none" />
                </div>
              </div>
              <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex justify-end gap-4">
                <button type="button" onClick={() => setModal(null)} className="admin-btn-outline">Cancelar</button>
                <button type="submit" disabled={saving} className="admin-btn">{saving ? 'Guardando...' : modal.type === 'edit' ? 'Guardar Cambios' : 'Crear Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
