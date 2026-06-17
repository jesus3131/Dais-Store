import { useState, useEffect, useMemo, Fragment } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function AdjustModal({ product, open, onClose, onSave }) {
  const [form, setForm] = useState({ quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ quantity: '', reason: '' });
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quantity) return;
    setSaving(true);
    try {
      await api.createInventoryMovement({
        product_id: product.product_id,
        movement_type: 'adjustment',
        quantity: Number(form.quantity),
        notes: form.reason.trim(),
      });
      onSave();
      onClose();
    } catch (err) { addToast(err?.message || 'Error al ajustar stock', 'error'); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-near-black)]/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md shadow-luxury-lg animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-[rgba(0,0,0,0.04)]">
            <h2 className="font-headline text-lg text-[var(--color-near-black)]">Ajustar Stock</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] rounded-full transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-[var(--color-ivory)] p-4 rounded">
              <p className="font-headline text-sm text-[var(--color-near-black)]">{product.product_name}</p>
              <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">Stock actual: <span className="font-headline text-[var(--color-near-black)]">{product.quantity}</span></p>
            </div>
            <div>
              <label className="admin-label">Cantidad a ajustar</label>
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="admin-input" placeholder="Ej: 5 o -3" required />
              <p className="font-inter text-[10px] text-[var(--color-on-surface-variant)] mt-1">Usa valores positivos para entrada, negativos para salida</p>
            </div>
            <div>
              <label className="admin-label">Motivo / Notas</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="admin-input !min-h-[80px] resize-none" placeholder="Ej: Recepción de proveedor, ajuste por inventario físico..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
              <button type="submit" disabled={saving} className="admin-btn">
                {saving ? 'Ajustando...' : 'Aplicar ajuste'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function AdminInventory() {
  const { addToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: '', min_stock: '' });
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [movements, setMovements] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch { setInventory([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadInventory(); }, []);

  const categories = useMemo(() => [...new Set(inventory.map(i => i.categoria || i.category).filter(Boolean))], [inventory]);

  const filtered = useMemo(() => {
    let result = inventory;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => (i.product_name || '').toLowerCase().includes(q));
    }
    if (categoryFilter) {
      result = result.filter(i => (i.categoria || i.category) === categoryFilter);
    }
    return result;
  }, [inventory, search, categoryFilter]);

  const totalProducts = inventory.length;
  const totalStock = inventory.reduce((s, i) => s + Number(i.quantity || 0), 0);
  const lowStockItems = inventory.filter(i => Number(i.quantity || 0) > 0 && Number(i.quantity || 0) <= Number(i.min_stock || 0));
  const outOfStockItems = inventory.filter(i => Number(i.quantity || 0) === 0);
  const stockValue = inventory.reduce((s, i) => s + (Number(i.quantity || 0) * Number(i.cost_price || i.price || 0)), 0);
  const lowStockAll = inventory.filter(i => Number(i.quantity || 0) <= Number(i.min_stock || 0));

  const getStatus = (item) => {
    const q = Number(item.quantity || 0);
    const m = Number(item.min_stock || 0);
    if (q === 0) return 'agotado';
    if (q <= m) return 'bajo';
    return 'ok';
  };

  const statusConfig = {
    ok: { label: 'OK', bg: 'bg-green-50', text: 'text-green-700', icon: 'check_circle' },
    bajo: { label: 'Bajo', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'warning' },
    agotado: { label: 'Agotado', bg: 'bg-red-50', text: 'text-red-600', icon: 'cancel' },
  };

  const startEdit = (item) => {
    setEditForm({ quantity: String(item.quantity), min_stock: String(item.min_stock) });
    setEditing(item.product_id);
  };

  const handleSaveEdit = async (productId) => {
    try {
      await api.updateStock(productId, parseInt(editForm.quantity) || 0);
      await api.updateMinStock(productId, parseInt(editForm.min_stock) || 0);
      setEditing(null);
      addToast('Stock actualizado');
      triggerFloatingNotification({ name: 'Inventario', product: editForm.productName || 'producto', icon: 'shelf_auto', time: 'recién' });
      loadInventory();
    } catch { addToast('Error al actualizar stock'); }
  };

  const handleAdjustSave = () => {
    setAdjustProduct(null);
    addToast('Ajuste de stock registrado');
    loadInventory();
  };

  const toggleMovements = async (productId) => {
    if (expandedRow === productId) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(productId);
    if (!movements[productId]) {
      try {
        const data = await api.getInventoryMovements(productId);
        setMovements(prev => ({ ...prev, [productId]: Array.isArray(data) ? data : [] }));
      } catch {
        setMovements(prev => ({ ...prev, [productId]: [] }));
        addToast('Error al cargar historial');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Inventario</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Gestión de existencias y movimientos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Productos', value: totalProducts, icon: 'inventory_2', color: 'text-[var(--color-gold)]' },
          { label: 'Unidades en Stock', value: totalStock, icon: 'warehouse', color: 'text-blue-600' },
          { label: 'Stock Bajo / Agotado', value: lowStockItems.length + outOfStockItems.length, icon: 'error_outline', color: outOfStockItems.length > 0 ? 'text-red-500' : 'text-amber-600' },
          { label: 'Valor del Inventario', value: formatMoney(stockValue), icon: 'payments', color: 'text-green-600' },
        ].map(card => (
          <div key={card.label} className="admin-stat-card border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
              <p className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{card.label}</p>
            </div>
            <p className={`font-headline text-xl ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {lowStockAll.length > 0 && (
        <div className="border-l-2 border-red-400 bg-red-50/50 p-6 mb-8 rounded-r">
          <div className="flex items-center gap-2 text-red-700 font-inter font-medium text-sm mb-4">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            {lowStockAll.length} producto{lowStockAll.length > 1 ? 's' : ''} con stock bajo
          </div>
          <div className="space-y-1.5">
            {lowStockAll.slice(0, 8).map(item => (
              <p key={item.product_id} className="font-inter text-sm text-red-600 ml-8">{item.product_name} — {item.quantity} unidades (mín: {item.min_stock})</p>
            ))}
            {lowStockAll.length > 8 && (
              <p className="font-inter text-sm text-[var(--color-on-surface-variant)] ml-8">y {lowStockAll.length - 8} más...</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-8 p-5 bg-white border border-[rgba(0,0,0,0.04)]">
        <div className="flex-1 min-w-[220px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-on-surface-variant)]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-10 pr-4 py-2.5 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="admin-input !w-auto !py-2.5">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full admin-table-modern">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>SKU / ID</th>
              <th>Stock</th>
              <th>Stock Mín</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const status = getStatus(item);
              const cfg = statusConfig[status];
              const isEditing = editing === item.product_id;
              const isExpanded = expandedRow === item.product_id;
              const itemCategory = item.categoria || item.category;
              return (
                <Fragment key={item.product_id}>
                  <tr className={`${status === 'bajo' ? 'bg-amber-50/20' : status === 'agotado' ? 'bg-red-50/20' : ''}`}>
                    <td>
                      {item.image_url ? (
                        <div className="w-12 h-12 overflow-hidden bg-[var(--color-ivory)] flex-shrink-0 rounded">
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-[rgba(0,0,0,0.03)] flex items-center justify-center rounded">
                          <span className="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]">inventory_2</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="font-headline text-sm text-[var(--color-near-black)]">{item.product_name}</span>
                      {itemCategory && <p className="font-inter text-[10px] text-[var(--color-on-surface-variant)] mt-0.5">{itemCategory}</p>}
                    </td>
                    <td className="font-inter text-xs text-[var(--color-on-surface-variant)] font-mono">{item.sku || item.product_id}</td>
                    <td>
                      {isEditing ? (
                        <input type="number" value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                          className="w-20 px-3 py-2 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] rounded" />
                      ) : (
                        <span className={`font-headline text-sm ${status === 'agotado' ? 'text-red-600' : status === 'bajo' ? 'text-amber-600' : 'text-[var(--color-near-black)]'}`}>
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" value={editForm.min_stock} onChange={e => setEditForm(f => ({ ...f, min_stock: e.target.value }))}
                          className="w-20 px-3 py-2 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] rounded" />
                      ) : (
                        <span className="font-inter text-sm text-[var(--color-on-surface-variant)]">{item.min_stock}</span>
                      )}
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 font-inter text-[10px] uppercase tracking-[0.08em] font-medium rounded ${cfg.bg} ${cfg.text}`}>
                        <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="font-inter text-xs text-[var(--color-on-surface-variant)]">
                      {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[rgba(0,0,0,0.08)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.12em] hover:border-[var(--color-near-black)] transition-all rounded">Cancelar</button>
                          <button onClick={() => handleSaveEdit(item.product_id)} className="px-4 py-2 bg-[var(--color-near-black)] text-white font-inter text-[10px] uppercase tracking-[0.12em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all rounded">Guardar</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(item)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Editar stock">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => setAdjustProduct(item)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-blue-600 transition-colors rounded hover:bg-blue-50" title="Ajustar stock">
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                          </button>
                          <button onClick={() => toggleMovements(item.product_id)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Ver historial">
                            <span className={`material-symbols-outlined text-[18px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`m-${item.product_id}`}>
                      <td colSpan={8} className="p-0 bg-[var(--color-ivory)]/40">
                        <div className="p-6">
                          <h3 className="font-headline text-sm text-[var(--color-near-black)] mb-4">Historial de movimientos — {item.product_name}</h3>
                          {movements[item.product_id] ? (
                            movements[item.product_id].length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[rgba(0,0,0,0.06)]">
                                      <th className="text-left py-3 pr-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Fecha</th>
                                      <th className="text-left py-3 pr-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Tipo</th>
                                      <th className="text-right py-3 pr-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Cantidad</th>
                                      <th className="text-right py-3 pr-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Resultante</th>
                                      <th className="text-left py-3 pl-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Motivo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {movements[item.product_id].map(m => {
                                      const qty = Number(m.quantity);
                                      return (
                                        <tr key={m.id} className="border-b border-[rgba(0,0,0,0.03)]">
                                          <td className="py-3 pr-4 font-inter text-xs whitespace-nowrap">{m.created_at?.slice(0, 10) || '—'}</td>
                                          <td className="py-3 pr-4">
                                            <span className={`inline-flex items-center gap-1 font-inter text-xs ${qty >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                              <span className="material-symbols-outlined text-[14px]">{qty >= 0 ? 'add_circle' : 'remove_circle'}</span>
                                              {qty >= 0 ? 'Entrada' : 'Salida'}
                                            </span>
                                          </td>
                                          <td className={`py-3 pr-4 text-right font-headline text-xs font-semibold ${qty >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {qty >= 0 ? '+' : ''}{m.quantity}
                                          </td>
                                          <td className="py-3 pr-4 text-right font-inter text-xs">{m.new_stock ?? '—'}</td>
                                          <td className="py-3 pl-4 font-inter text-xs text-[var(--color-on-surface-variant)]">{m.notes || '—'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="font-inter text-sm text-[var(--color-on-surface-variant)] py-6 text-center">Sin movimientos registrados</p>
                            )
                          ) : (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border border-[var(--color-gold)] border-t-transparent" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No se encontraron productos en inventario</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AdjustModal product={adjustProduct} open={!!adjustProduct} onClose={() => setAdjustProduct(null)} onSave={handleAdjustSave} />
    </div>
  );
}
