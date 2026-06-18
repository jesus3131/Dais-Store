import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const emptyItem = { product_name: '', description: '', quantity: 6, unit_price: 0, wholesale_price: 0, price_type: 'retail', product_id: null };

const emptyForm = {
  client_name: '', client_email: '', client_phone: '', client_document: '',
  items: [{ ...emptyItem }],
  discount: '0',
  notes: '', terms: '', valid_until: '',
};

const formatCurrency = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-600' },
  accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-600' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-600' },
  expired: { label: 'Vencida', color: 'bg-yellow-100 text-yellow-600' },
};

const WHOLESALE_THRESHOLD = 6;

function getEffectivePrice(item) {
  const qty = parseFloat(item.quantity) || 1;
  const retail = parseFloat(item.unit_price) || 0;
  const wholesale = parseFloat(item.wholesale_price) || 0;
  if (item.price_type === 'wholesale' && wholesale > 0) return wholesale;
  if (qty >= WHOLESALE_THRESHOLD && wholesale > 0) return wholesale;
  return retail;
}

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [products, setProducts] = useState([]);
  const [searchIdx, setSearchIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getQuotations().then(setQuotations).catch(() => addToast('Error al cargar cotizaciones', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const loadProducts = async () => {
    if (products.length) return;
    try { setProducts(await api.getProducts()); }
    catch { addToast('Error al cargar productos', 'error'); }
  };

  const openDetail = async (id) => {
    setDetailId(id);
    setDetail(null);
    try {
      const q = await api.getQuotation(id);
      if (typeof q.items === 'string') q.items = JSON.parse(q.items);
      setDetail(q);
    } catch (err) {
      addToast('Error al cargar detalle', 'error');
      setDetailId(null);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
    loadProducts();
  };

  const openEdit = (q) => {
    setForm({
      client_name: q.client_name, client_email: q.client_email || '', client_phone: q.client_phone || '',
      client_document: q.client_document || '',
      items: q.items.length ? q.items.map(i => ({ ...i })) : [{ ...emptyItem }],
      discount: String(q.discount || 0), notes: q.notes || '', terms: q.terms || '',
      valid_until: q.valid_until ? q.valid_until.slice(0, 10) : '',
    });
    setModal({ type: 'edit', id: q.id });
    loadProducts();
  };

  const calcTotals = (items, discount) => {
    const subtotal = items.reduce((s, i) => {
      const price = getEffectivePrice(i);
      return s + (parseFloat(i.quantity) || 0) * price;
    }, 0);
    const disc = parseFloat(discount) || 0;
    const total = Math.max(0, subtotal - disc);
    return { subtotal, discount: disc, total };
  };

  const updateItem = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };

      if (field === 'quantity') {
        const qty = parseInt(value) || 1;
        const wholesale = parseFloat(items[idx].wholesale_price) || 0;
        if (qty >= WHOLESALE_THRESHOLD && wholesale > 0) {
          items[idx].price_type = 'wholesale';
        } else {
          items[idx].price_type = 'retail';
        }
      }

      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  };

  const removeItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const selectProduct = (idx, product) => {
    setForm(f => {
      const items = [...f.items];
      const qty = parseInt(items[idx].quantity) || 1;
      const wholesale = parseFloat(product.wholesale_price) || 0;
      const priceType = qty >= WHOLESALE_THRESHOLD && wholesale > 0 ? 'wholesale' : 'retail';
      items[idx] = {
        ...items[idx],
        product_id: product.id,
        product_name: product.name,
        description: product.description || '',
        unit_price: parseFloat(product.price) || 0,
        wholesale_price: wholesale,
        price_type: priceType,
      };
      return { ...f, items };
    });
    setSearchIdx(null);
    setSearchQuery('');
  };

  const togglePriceType = (idx) => {
    setForm(f => {
      const items = [...f.items];
      const current = items[idx];
      const wholesale = parseFloat(current.wholesale_price) || 0;
      if (current.price_type === 'wholesale') {
        items[idx] = { ...current, price_type: 'retail' };
      } else if (wholesale > 0) {
        items[idx] = { ...current, price_type: 'wholesale' };
      }
      return { ...f, items };
    });
  };

  const openSearch = (idx) => {
    setSearchIdx(idx);
    setSearchQuery('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

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
        items: form.items.map(i => {
          const price = getEffectivePrice(i);
          return {
            product_name: i.product_name || '', description: i.description || '',
            quantity: parseFloat(i.quantity) || 1, unit_price: price,
            product_id: i.product_id || null,
            wholesale_price: parseFloat(i.wholesale_price) || 0,
            price_type: i.price_type || 'retail',
          };
        }),
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
                      <button onClick={() => openDetail(q.id)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Ver detalle">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button onClick={() => api.downloadQuotationPdf(q.id, q.number).catch(() => addToast('Error al descargar', 'error'))}
                        className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Descargar PDF">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
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
          <div className="bg-white w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
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
                  <div className="space-y-3">
                    {form.items.map((item, idx) => {
                      const effectivePrice = getEffectivePrice(item);
                      const wholesale = parseFloat(item.wholesale_price) || 0;
                      const canWholesale = wholesale > 0;
                      return (
                      <div key={idx} className="flex gap-3 items-start p-4 bg-[rgba(0,0,0,0.02)] rounded border border-[rgba(0,0,0,0.06)]">
                        <div className="flex-1 grid grid-cols-12 gap-2">
                          <div className="col-span-4 relative">
                            <input value={item.product_name}
                              onFocus={() => openSearch(idx)}
                              onChange={e => updateItem(idx, 'product_name', e.target.value)}
                              className="admin-input text-xs pr-8" placeholder="Buscar producto…" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] pointer-events-none">
                              <span className="material-symbols-outlined text-[14px]">search</span>
                            </span>
                            {searchIdx === idx && (
                              <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-[rgba(0,0,0,0.08)] rounded shadow-lg max-h-56 overflow-y-auto">
                                <div className="p-2 border-b border-[rgba(0,0,0,0.04)]">
                                  <input ref={searchRef} value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full text-xs p-2 border border-[rgba(0,0,0,0.1)] rounded outline-none focus:border-[var(--color-gold)]"
                                    placeholder="Escriba para buscar…" />
                                </div>
                                {filteredProducts.length === 0 && searchQuery.trim() && (
                                  <div className="p-4 text-center text-xs text-[var(--color-on-surface-variant)]">Sin resultados</div>
                                )}
                                {filteredProducts.map(p => (
                                  <button key={p.id} type="button" onClick={() => selectProduct(idx, p)}
                                    className="w-full text-left px-3 py-2 hover:bg-[rgba(232,207,166,0.1)] transition-colors flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-inter text-[var(--color-near-black)] truncate">{p.name}</div>
                                      {p.sku && <div className="text-[10px] text-[var(--color-on-surface-variant)]">{p.sku}</div>}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="text-xs font-inter text-[var(--color-gold)]">${Number(p.price).toLocaleString()}</div>
                                      {p.wholesale_price && <div className="text-[10px] text-[var(--color-on-surface-variant)]">x mayor: ${Number(p.wholesale_price).toLocaleString()}</div>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="col-span-3">
                            <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                              className="admin-input text-xs" placeholder="Descripción" />
                          </div>
                          <div className="col-span-1">
                            <input type="number" min="1" step="1" value={item.quantity}
                              onChange={e => updateItem(idx, 'quantity', e.target.value)}
                              className="admin-input text-xs text-center" />
                          </div>
                          <div className="col-span-2">
                            <div className="relative">
                              <input type="number" min="0" step="100" value={effectivePrice}
                                onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                                className="admin-input text-xs text-right pr-6" placeholder="$0" />
                              {canWholesale && (
                                <button type="button" onClick={() => togglePriceType(idx)}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                                  title={item.price_type === 'wholesale' ? 'Precio por mayor' : 'Precio por detal'}>
                                  <span className={`text-[10px] font-bold ${item.price_type === 'wholesale' ? 'text-blue-500' : 'text-[var(--color-on-surface-variant)]'}`}>
                                    {item.price_type === 'wholesale' ? '×M' : '×1'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-end font-inter text-xs text-[var(--color-near-black)]">
                            ${((parseFloat(item.quantity) || 0) * effectivePrice).toLocaleString()}
                          </div>
                        </div>
                        {form.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>
                    );
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] font-inter text-[var(--color-on-surface-variant)]">
                      <span className="inline-block w-3 h-3 rounded bg-blue-100 text-blue-600 text-[8px] text-center leading-3 font-bold mr-1">M</span>
                      Precio por mayor se aplica automáticamente desde {WHOLESALE_THRESHOLD} unidades
                    </span>
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

      {detailId && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setDetailId(null)}>
          <div className="bg-white w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            {!detail ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full" />
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
                  <h2 className="font-headline text-xl text-[var(--color-near-black)]">{detail.number || `COT-${String(detail.id).padStart(6, '0')}`}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => api.downloadQuotationPdf(detail.id, detail.number).catch(() => addToast('Error al descargar', 'error'))}
                      className="admin-btn-outline text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      PDF
                    </button>
                    <button onClick={() => setDetailId(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                      <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="border border-[rgba(0,0,0,0.06)] rounded-lg p-8 bg-white">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <div className="w-28 h-28 bg-[var(--color-warm-gray)] rounded flex items-center justify-center text-[var(--color-on-surface-variant)] text-xs font-inter">
                          <span className="material-symbols-outlined text-[40px]">store</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-headline text-xl text-[var(--color-gold)]">COTIZACIÓN</div>
                        <div className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{detail.number}</div>
                        <div className="font-inter text-xs text-[var(--color-on-surface-variant)]">Emisión: {new Date(detail.created_at).toLocaleDateString('es-CO')}</div>
                        {detail.valid_until && <div className="font-inter text-xs text-[var(--color-on-surface-variant)]">Válida hasta: {new Date(detail.valid_until).toLocaleDateString('es-CO')}</div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-[#fafafa] rounded p-4">
                        <div className="font-headline text-xs text-[var(--color-gold)] uppercase tracking-wider mb-2">Cliente</div>
                        <div className="font-inter text-sm text-[var(--color-near-black)]">{detail.client_name}</div>
                        {detail.client_document && <div className="font-inter text-xs text-[var(--color-on-surface-variant)]">Doc: {detail.client_document}</div>}
                        <div className="font-inter text-xs text-[var(--color-on-surface-variant)]">{detail.client_email}</div>
                        <div className="font-inter text-xs text-[var(--color-on-surface-variant)]">{detail.client_phone}</div>
                      </div>
                      <div className="bg-[#fafafa] rounded p-4">
                        <div className="font-headline text-xs text-[var(--color-gold)] uppercase tracking-wider mb-2">Estado</div>
                        <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded ${statusConfig[detail.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {statusConfig[detail.status]?.label || detail.status}
                        </span>
                        {detail.created_by_name && <div className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-2">Creado por: {detail.created_by_name}</div>}
                      </div>
                    </div>

                    <table className="w-full mb-6">
                      <thead>
                        <tr className="bg-[var(--color-gold)]">
                          <th className="p-2 text-left font-headline text-xs text-white uppercase">#</th>
                          <th className="p-2 text-left font-headline text-xs text-white uppercase">Producto</th>
                          <th className="p-2 text-left font-headline text-xs text-white uppercase">Descripción</th>
                          <th className="p-2 text-center font-headline text-xs text-white uppercase">Cant.</th>
                          <th className="p-2 text-right font-headline text-xs text-white uppercase">Precio</th>
                          <th className="p-2 text-right font-headline text-xs text-white uppercase">Tipo</th>
                          <th className="p-2 text-right font-headline text-xs text-white uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.items || []).map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-[#f9fafb]' : ''}>
                            <td className="p-2 font-inter text-xs text-[var(--color-near-black)]">{idx + 1}</td>
                            <td className="p-2 font-inter text-xs text-[var(--color-near-black)]">{item.product_name || '—'}</td>
                            <td className="p-2 font-inter text-xs text-[var(--color-on-surface-variant)]">{item.description || ''}</td>
                            <td className="p-2 text-center font-inter text-xs text-[var(--color-near-black)]">{item.quantity || 1}</td>
                            <td className="p-2 text-right font-inter text-xs text-[var(--color-near-black)]">{formatCurrency(item.unit_price)}</td>
                            <td className="p-2 text-right">
                              {item.price_type === 'wholesale' || (item.wholesale_price && (item.quantity || 1) >= WHOLESALE_THRESHOLD) ? (
                                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-600 rounded">× MAYOR</span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-500 rounded">× DETAL</span>
                              )}
                            </td>
                            <td className="p-2 text-right font-inter text-xs text-[var(--color-near-black)]">{formatCurrency((item.quantity || 1) * (item.unit_price || 0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end mb-8">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between font-inter text-sm">
                          <span className="text-[var(--color-on-surface-variant)]">Subtotal</span>
                          <span className="text-[var(--color-near-black)]">{formatCurrency(detail.subtotal)}</span>
                        </div>
                        {parseFloat(detail.discount || 0) > 0 && (
                          <div className="flex justify-between font-inter text-sm">
                            <span className="text-[var(--color-on-surface-variant)]">Descuento</span>
                            <span className="text-red-500">-{formatCurrency(detail.discount)}</span>
                          </div>
                        )}
                        {parseFloat(detail.tax || 0) > 0 && (
                          <div className="flex justify-between font-inter text-sm">
                            <span className="text-[var(--color-on-surface-variant)]">IVA</span>
                            <span className="text-[var(--color-near-black)]">{formatCurrency(detail.tax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-headline text-lg border-t border-[rgba(0,0,0,0.08)] pt-2">
                          <span className="text-[var(--color-near-black)]">Total</span>
                          <span className="text-[var(--color-gold)]">{formatCurrency(detail.total)}</span>
                        </div>
                      </div>
                    </div>

                    {detail.terms && (
                      <div className="mb-6">
                        <div className="font-headline text-xs text-[var(--color-gold)] uppercase tracking-wider mb-2">Términos y Condiciones</div>
                        <div className="font-inter text-xs text-[var(--color-on-surface-variant)] bg-[#fafafa] rounded p-4 whitespace-pre-wrap">{detail.terms}</div>
                      </div>
                    )}

                    {detail.notes && (
                      <div>
                        <div className="font-headline text-xs text-[var(--color-gold)] uppercase tracking-wider mb-2">Notas</div>
                        <div className="font-inter text-xs text-[var(--color-on-surface-variant)] bg-[#fafafa] rounded p-4 whitespace-pre-wrap">{detail.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
