import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const emptyForm = { code: '', type: 'percentage', value: '', min_purchase: '0', max_uses: '0', starts_at: '', expires_at: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getCoupons().then(setCoupons).catch(() => addToast('Error al cargar cupones', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (c) => {
    setForm({
      code: c.code, type: c.type, value: String(c.value),
      min_purchase: String(c.min_purchase || 0), max_uses: String(c.max_uses || 0),
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
    });
    setModal({ type: 'edit', id: c.id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) { addToast('Código y valor son obligatorios', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(), type: form.type, value: parseFloat(form.value),
        min_purchase: parseFloat(form.min_purchase) || 0, max_uses: parseInt(form.max_uses) || 0,
        starts_at: form.starts_at || null, expires_at: form.expires_at || null,
      };
      if (modal.type === 'edit') { await api.updateCoupon(modal.id, payload); addToast('Cupón actualizado'); }
      else { await api.createCoupon(payload); addToast('Cupón creado'); }
      setModal(null); load();
    } catch (err) { addToast(err.message || 'Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (c) => {
    try {
      await api.updateCoupon(c.id, { is_active: !c.is_active });
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
      addToast(c.is_active ? 'Cupón desactivado' : 'Cupón activado');
    } catch (err) { addToast(err.message || 'Error', 'error'); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`¿Eliminar cupón "${code}"?`)) return;
    try { await api.deleteCoupon(id); addToast('Cupón eliminado', 'info'); load(); }
    catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  const now = new Date();

  return (
    <div className="max-w-5xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Cupones</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''}</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Cupón
        </button>
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
                <th>Código</th>
                <th>Tipo</th>
                <th className="text-right">Valor</th>
                <th className="text-right">Mínimo</th>
                <th className="text-center">Usos</th>
                <th>Vigencia</th>
                <th className="text-center">Activo</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => {
                const expired = c.expires_at && new Date(c.expires_at) < now;
                const notStarted = c.starts_at && new Date(c.starts_at) > now;
                return (
                <tr key={c.id} className={!c.is_active || expired ? 'opacity-50' : ''}>
                  <td><span className="font-headline text-sm text-[var(--color-near-black)] uppercase tracking-wider">{c.code}</span></td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{c.type === 'percentage' ? '% Descuento' : c.type === 'fixed' ? 'Fijo' : c.type}</span></td>
                  <td className="text-right font-headline text-sm text-[var(--color-gold)]">
                    {c.type === 'percentage' ? `${c.value}%` : `$${Number(c.value).toLocaleString()}`}
                  </td>
                  <td className="text-right font-inter text-xs text-[var(--color-on-surface-variant)]">${Number(c.min_purchase || 0).toLocaleString()}</td>
                  <td className="text-center">
                    <span className="font-inter text-xs">{c.used_count || 0}{c.max_uses > 0 ? ` / ${c.max_uses}` : ''}</span>
                  </td>
                  <td>
                    <span className="font-inter text-[10px] text-[var(--color-on-surface-variant)]">
                      {notStarted ? 'Próximo' : expired ? 'Vencido' : 'Vigente'}
                      {c.expires_at && ` · ${new Date(c.expires_at).toLocaleDateString()}`}
                    </span>
                  </td>
                  <td className="text-center">
                    <button onClick={() => toggleActive(c)}
                      className={`p-1.5 rounded transition-colors ${c.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                      title={c.is_active ? 'Desactivar' : 'Activar'}>
                      <span className="material-symbols-outlined text-[18px]">{c.is_active ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(c.id, c.code)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors rounded hover:bg-red-50" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
              {coupons.length === 0 && (
                <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay cupones creados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-lg mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">{modal.type === 'edit' ? 'Editar Cupón' : 'Nuevo Cupón'}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Código <span className="text-red-400">*</span></label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="EJ: VERANO20" className="admin-input uppercase" required />
                  </div>
                  <div>
                    <label className="admin-label">Tipo</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="admin-input">
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto fijo ($)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Valor <span className="text-red-400">*</span></label>
                    <input type="number" step="0.01" min="0" value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={form.type === 'percentage' ? '20' : '10000'} className="admin-input" required />
                  </div>
                  <div>
                    <label className="admin-label">Compra mínima</label>
                    <input type="number" step="100" min="0" value={form.min_purchase}
                      onChange={e => setForm(f => ({ ...f, min_purchase: e.target.value }))} className="admin-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Usos máximos (0 = ilimitado)</label>
                    <input type="number" min="0" value={form.max_uses}
                      onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Inicio (opcional)</label>
                    <input type="datetime-local" value={form.starts_at}
                      onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} className="admin-input" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Vencimiento</label>
                  <input type="datetime-local" value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="admin-input" />
                </div>
              </div>
              <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex justify-end gap-4">
                <button type="button" onClick={() => setModal(null)} className="admin-btn-outline">Cancelar</button>
                <button type="submit" disabled={saving} className="admin-btn">{saving ? 'Guardando...' : modal.type === 'edit' ? 'Guardar Cambios' : 'Crear Cupón'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
