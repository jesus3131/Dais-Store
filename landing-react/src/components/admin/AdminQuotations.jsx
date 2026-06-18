import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const emptyItem = { product_name: '', description: '', quantity: 1, unit_price: 0 };

const emptyForm = {
  client_name: '', client_email: '', client_phone: '', client_document: '',
  items: [{ ...emptyItem }],
  discount: '0',
  notes: '', terms: '', valid_until: '',
};

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-600' },
  accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-600' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-600' },
  expired: { label: 'Vencida', color: 'bg-yellow-100 text-yellow-600' },
};

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getQuotations().then(setQuotations).catch(() => addToast('Error al cargar cotizaciones', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (q) => {
    setForm({
      client_name: q.client_name, client_email: q.client_email || '', client_phone: q.client_phone || '',
      client_document: q.client_document || '',
      items: q.items.length ? q.items.map(i => ({ ...i })) : [{ ...emptyItem }],
      discount: String(q.discount || 0), notes: q.notes || '', terms: q.terms || '',
      valid_until: q.valid_until ? q.valid_until.slice(0, 10) : '',
    });
    setModal({ type: 'edit', id: q.id });
  };

  const calcTotals = (items, discount) => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0), 0);
    const disc = parseFloat(discount) || 0;
    const total = Math.max(0, subtotal - disc);
    return { subtotal, discount: disc, total };
  };

  const updateItem = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  };

  const removeItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client_name) { addToast('El nombre del cliente es obligatorio', 'error'); return; }
    if (!form.items.length || form.items.every(i => !i.product_name && !i.description)) {
      addToast('Agregue al menos un item con descripción', 'error'); return;
    }
    setSaving(true);
    try {
      const { subtotal, discount, total } = calcTotals(form.items, form.discount);
      const payload = {
        client_name: form.client_name, client_email: form.client_email || null,
        client_phone: form.client_phone || null, client_document: form.client_document || null,
        items: form.items.map(i => ({
          product_name: i.product_name || '', description: i.description || '',
          quantity: parseFloat(i.quantity) || 1, unit_price: parseFloat(i.unit_price) || 0,
        })),
        subtotal, discount, tax: 0, total,
        notes: form.notes || null, terms: form.terms || null,
        valid_until: form.valid_until || null,
      };
      if (modal.type === 'edit') { await api.updateQuotation(modal.id, payload); addToast('Cotización actualizada'); }
      else { await api.createQuotation(payload); addToast('Cotización creada'); }
      setModal(null); load();
    } catch (err) { addToast(err.message || 'Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateQuotationStatus(id, status);
      addToast(`Estado actualizado a "${statusConfig[status]?.label}"`);
      load();
    } catch (err) { addToast(err.message || 'Error', 'error'); }
  };

  const handleDelete = async (id, number) => {
    if (!window.confirm(`¿Eliminar cotización "${number}"?`)) return;
    try { await api.deleteQuotation(id); addToast('Cotización eliminada', 'info'); load(); }
    catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  const filtered = statusFilter ? quotations.filter(q => q.status === statusFilter) : quotations;
  const totals = calcTotals(form.items, form.discount);

  return (
    <div className="max-w-6xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Cotizaciones</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{quotations.length} cotización{quotations.length !== 1 ? 'es' : ''}</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva Cotización
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 text-xs font-inter rounded transition-colors ${
              statusFilter === s ? 'bg-[var(--color-near-black)] text-white' : 'bg-white text-[var(--color-on-surface-variant)] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.2)]'
            }`}>
            {s ? statusConfig[s]?.label : 'Todas'}
          </button>
        ))}
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
                <th>Número</th>
                <th>Cliente</th>
                <th>Items</th>
                <th className="text-right">Total</th>
                <th>Estado</th>
                <th>Vence</th>
                <th>Creada</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const expired = q.valid_until && new Date(q.valid_until) < new Date() && q.status === 'draft';
                const displayStatus = expired ? 'expired' : q.status;
                const cfg = statusConfig[displayStatus];
                return (
                <tr key={q.id}>
                  <td><span className="font-headline text-sm text-[var(--color-near-black)]">{q.number}</span></td>
                  <td>
                    <div className="font-inter text-sm text-[var(--color-near-black)]">{q.client_name}</div>
                    {q.client_email && <div className="font-inter text-[10px] text-[var(--color-on-surface-variant)]">{q.client_email}</div>}
                  </td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{q.items?.length || 0}</span></td>
                  <td className="text-right font-headline text-sm text-[var(--color-gold)]">${Number(q.total).toLocaleString()}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded ${cfg?.color || 'bg-gray-100 text-gray-600'}`}>
                      {cfg?.label || q.status}
                    </span>
                  </td>
                  <td className="font-inter text-xs text-[var(--color-on-surface-variant)]">
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}
                  </td>
                  <td className="font-inter text-xs text-[var(--color-on-surface-variant)]">
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(q)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {(q.status === 'draft') && (
                        <button onClick={() => handleStatusChange(q.id, 'sent')}
                          className="p-2 text-blue-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50" title="Marcar como enviada">
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                      )}
                      {(q.status === 'sent') && (
                        <>
                          <button onClick={() => handleStatusChange(q.id, 'accepted')}
                            className="p-2 text-green-400 hover:text-green-600 transition-colors rounded hover:bg-green-50" title="Aceptada">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                          <button onClick={() => handleStatusChange(q.id, 'rejected')}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors rounded hover:bg-red-50" title="Rechazada">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(q.id, q.number)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors rounded hover:bg-red-50" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay cotizaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">
                {modal.type === 'edit' ? 'Editar Cotización' : 'Nueva Cotización'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Cliente <span className="text-red-400">*</span></label>
                    <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                      className="admin-input" required placeholder="Nombre del cliente" />
                  </div>
                  <div>
                    <label className="admin-label">Email</label>
                    <input type="email" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                      className="admin-input" placeholder="cliente@ejemplo.com" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="admin-label">Teléfono</label>
                    <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
                      className="admin-input" placeholder="+57 300 000 0000" />
                  </div>
                  <div>
                    <label className="admin-label">Documento</label>
                    <input value={form.client_document} onChange={e => setForm(f => ({ ...f, client_document: e.target.value }))}
                      className="admin-input" placeholder="NIT / CC" />
                  </div>
                  <div>
                    <label className="admin-label">Válido hasta</label>
                    <input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                      className="admin-input" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="admin-label mb-0">Items</label>
                    <button type="button" onClick={addItem} className="text-xs font-inter text-[var(--color-gold)] hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Agregar item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 bg-[rgba(0,0,0,0.02)] rounded border border-[rgba(0,0,0,0.04)]">
                        <div className="flex-1 grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <input value={item.product_name} onChange={e => updateItem(idx, 'product_name', e.target.value)}
                              className="admin-input text-xs" placeholder="Producto / Servicio" />
                          </div>
                          <div className="col-span-4">
                            <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                              className="admin-input text-xs" placeholder="Descripción" />
                          </div>
                          <div className="col-span-1">
                            <input type="number" min="1" step="1" value={item.quantity}
                              onChange={e => updateItem(idx, 'quantity', e.target.value)}
                              className="admin-input text-xs text-center" />
                          </div>
                          <div className="col-span-2">
                            <input type="number" min="0" step="100" value={item.unit_price}
                              onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                              className="admin-input text-xs text-right" placeholder="$0" />
                          </div>
                          <div className="col-span-1 flex items-center justify-center font-inter text-xs text-[var(--color-on-surface-variant)]">
                            ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toLocaleString()}
                          </div>
                        </div>
                        {form.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between font-inter text-sm">
                      <span className="text-[var(--color-on-surface-variant)]">Subtotal</span>
                      <span className="text-[var(--color-near-black)]">${totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-inter text-sm items-center">
                      <span className="text-[var(--color-on-surface-variant)]">Descuento</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--color-on-surface-variant)]">$</span>
                        <input type="number" min="0" step="100" value={form.discount}
                          onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                          className="w-24 text-right text-sm border-b border-dashed border-[rgba(0,0,0,0.15)] focus:outline-none focus:border-[var(--color-gold)] py-0.5" />
                      </div>
                    </div>
                    <div className="flex justify-between font-headline text-lg border-t border-[rgba(0,0,0,0.08)] pt-2">
                      <span className="text-[var(--color-near-black)]">Total</span>
                      <span className="text-[var(--color-gold)]">${totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Notas</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="admin-input h-24 resize-none" placeholder="Notas internas o comentarios" />
                  </div>
                  <div>
                    <label className="admin-label">Términos</label>
                    <textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
                      className="admin-input h-24 resize-none" placeholder="Términos y condiciones de la cotización" />
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex justify-end gap-4">
                <button type="button" onClick={() => setModal(null)} className="admin-btn-outline">Cancelar</button>
                <button type="submit" disabled={saving} className="admin-btn">
                  {saving ? 'Guardando...' : modal.type === 'edit' ? 'Guardar Cambios' : 'Crear Cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
