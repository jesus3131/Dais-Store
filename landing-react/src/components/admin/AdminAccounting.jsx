import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api, getToken, API_BASE } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

const GOLD = '#d4af37';

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

async function req(url, options) {
  if (!options) options = {};
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'HTTP ' + res.status);
  }
  return res.json();
}

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Activo' },
  { value: 'liability', label: 'Pasivo' },
  { value: 'equity', label: 'Patrimonio' },
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
];

const THIRD_PARTY_TYPES = [
  { value: 'client', label: 'Cliente' },
  { value: 'supplier', label: 'Proveedor' },
  { value: 'employee', label: 'Empleado' },
  { value: 'other', label: 'Otro' },
];

const ENTRY_STATUS_LABELS = { draft: 'Borrador', posted: 'Contabilizado', cancelled: 'Anulado' };
const INVOICE_STATUS_LABELS = { draft: 'Borrador', issued: 'Emitida', paid: 'Pagada', cancelled: 'Anulada' };
const ARAP_STATUS_LABELS = { pending: 'Pendiente', partial: 'Parcial', paid: 'Pagada', overdue: 'Vencida' };

const STATUS_CLASSES = {
  draft: 'bg-gray-100 text-gray-600', posted: 'bg-green-50 text-green-700',
  issued: 'bg-blue-50 text-blue-700', paid: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600', pending: 'bg-amber-50 text-amber-700',
  partial: 'bg-blue-50 text-blue-700', overdue: 'bg-red-50 text-red-600',
  active: 'bg-green-50 text-green-700', inactive: 'bg-gray-100 text-gray-500',
};

const TYPE_CLASSES = {
  asset: 'bg-blue-50 text-blue-700', liability: 'bg-purple-50 text-purple-700',
  equity: 'bg-emerald-50 text-emerald-700', income: 'bg-green-50 text-green-700',
  expense: 'bg-red-50 text-red-600', client: 'bg-blue-50 text-blue-700',
  supplier: 'bg-orange-50 text-orange-700', employee: 'bg-purple-50 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
};

function StatusBadge({ status, labels }) {
  return (
    <span className={'inline-block font-inter uppercase tracking-[0.1em] rounded px-2 py-0.5 text-[9px] ' + (STATUS_CLASSES[status] || 'bg-gray-100 text-gray-600')}>
      {(labels || {})[status] || status}
    </span>
  );
}

function TypeBadge({ type, mapping }) {
  const m = (mapping || ACCOUNT_TYPES).find(t => t.value === type);
  return (
    <span className={'inline-block px-2.5 py-1 font-inter text-[9px] uppercase tracking-[0.1em] rounded ' + (TYPE_CLASSES[type] || 'bg-gray-100 text-gray-600')}>
      {m ? m.label : type}
    </span>
  );
}

function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-near-black)]/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={'bg-white w-full ' + (wide ? 'max-w-3xl' : 'max-w-lg') + ' max-h-[90vh] overflow-y-auto shadow-luxury-lg animate-scale-in'} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-warm-gray)]/40 sticky top-0 bg-white z-10">
            <h2 className="font-headline text-lg text-[var(--color-near-black)]">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-warm-gray)]/50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

function AccountModal({ open, onClose, onSave, edit }) {
  const [form, setForm] = useState({ code: '', name: '', type: 'income', level: 1, is_active: true });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const codeRef = useRef();

  useEffect(() => {
    if (edit) {
      setForm({ code: edit.code, name: edit.name, type: edit.type, level: edit.level, is_active: edit.is_active ?? true });
    } else {
      setForm({ code: '', name: '', type: 'income', level: 1, is_active: true });
    }
    if (open) setTimeout(() => codeRef.current?.focus(), 100);
  }, [edit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    setSaving(true);
    try {
      if (edit) {
        await req('/account-charts/' + edit.id, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await req('/account-charts', { method: 'POST', body: JSON.stringify(form) });
      }
      onSave();
      onClose();
    } catch (err) { addToast(err.message || 'Error al guardar cuenta', 'error'); }
    finally { setSaving(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={edit ? 'Editar cuenta' : 'Nueva cuenta'}>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Código <span className="text-red-400">*</span></label>
            <input ref={codeRef} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="admin-input" placeholder="Ej: 1105" required autoComplete="off" />
          </div>
          <div>
            <label className="admin-label">Nivel</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: Number(e.target.value) }))} className="admin-input">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nivel {n}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="admin-label">Nombre <span className="text-red-400">*</span></label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" placeholder="Ej: Caja General" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Tipo</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="admin-input">
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Estado</label>
            <select value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))} className="admin-input">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? 'Guardando...' : edit ? 'Actualizar' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ThirdPartyModal({ open, onClose, onSave, edit }) {
  const [form, setForm] = useState({ document_type: 'NIT', document_number: '', name: '', type: 'client', email: '', phone: '', city: '', address: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const docRef = useRef();

  useEffect(() => {
    if (edit) {
      setForm({
        document_type: edit.document_type || 'NIT', document_number: edit.document_number, name: edit.name, type: edit.type,
        email: edit.email || '', phone: edit.phone || '', city: edit.city || '',
        address: edit.address || '', is_active: edit.is_active ?? true,
      });
    } else {
      setForm({ document_type: 'NIT', document_number: '', name: '', type: 'client', email: '', phone: '', city: '', address: '', is_active: true });
    }
    if (open) setTimeout(() => docRef.current?.focus(), 100);
  }, [edit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.document_number || !form.name) return;
    setSaving(true);
    try {
      if (edit) {
        await req('/third-parties/' + edit.id, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await req('/third-parties', { method: 'POST', body: JSON.stringify(form) });
      }
      onSave();
      onClose();
    } catch (err) { addToast(err.message || 'Error al guardar tercero', 'error'); }
    finally { setSaving(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={edit ? 'Editar tercero' : 'Nuevo tercero'}>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Tipo Doc. <span className="text-red-400">*</span></label>
            <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className="admin-input">
              <option value="NIT">NIT</option>
              <option value="CC">CC</option>
              <option value="CE">CE</option>
            </select>
          </div>
          <div>
            <label className="admin-label">No. Documento <span className="text-red-400">*</span></label>
            <input ref={docRef} value={form.document_number} onChange={e => setForm(f => ({ ...f, document_number: e.target.value }))} className="admin-input" placeholder="Ej: 900123456-7" required autoComplete="off" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Nombre / Razón Social <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="admin-input" placeholder="Ej: María Fernanda López" required autoComplete="name" />
          </div>
          <div>
            <label className="admin-label">Tipo</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="admin-input">
              {THIRD_PARTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="admin-input" placeholder="correo@ejemplo.com" autoComplete="email" />
          </div>
          <div>
            <label className="admin-label">Teléfono</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="admin-input" placeholder="Ej: 3001234567" autoComplete="tel" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Ciudad</label>
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="admin-input" placeholder="Ej: Bogotá" autoComplete="address-level2" />
          </div>
          <div>
            <label className="admin-label">Estado</label>
            <select value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))} className="admin-input">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
        <div>
          <label className="admin-label">Dirección</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="admin-input" placeholder="Ej: Cra 7 #80-15" autoComplete="street-address" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? 'Guardando...' : edit ? 'Actualizar' : 'Crear tercero'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function JournalEntryModal({ open, onClose, onSave, accounts, thirdParties }) {
  const [form, setForm] = useState({ entry_date: new Date().toISOString().slice(0, 10), description: '', third_party_id: '', lines: [{ account_id: '', debit: '', credit: '' }] });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (open) {
      setForm({ entry_date: new Date().toISOString().slice(0, 10), description: '', third_party_id: '', lines: [{ account_id: '', debit: '', credit: '' }] });
    }
  }, [open]);

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { account_id: '', debit: '', credit: '' }] }));
  const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i, field, value) => setForm(f => {
    const lines = [...f.lines];
    lines[i] = { ...lines[i], [field]: value };
    return { ...f, lines };
  });

  const totals = useMemo(() => {
    const debit = form.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const credit = form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    return { debit, credit, diff: Math.abs(debit - credit) };
  }, [form.lines]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || form.lines.length === 0) return;
    if (totals.debit === 0 && totals.credit === 0) { addToast('Debe registrar débitos o créditos', 'error'); return; }
    setSaving(true);
    try {
      await req('/journal-entries', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          third_party_id: form.third_party_id ? Number(form.third_party_id) : null,
          lines: form.lines.map(l => ({ account_chart_id: Number(l.account_id), debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0 })),
        }),
      });
      onSave();
      onClose();
    } catch { addToast('Error al crear asiento', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo asiento contable" wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Fecha</label>
            <input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} className="admin-input" />
          </div>
          <div className="col-span-2">
            <label className="admin-label">Descripción</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input" required />
          </div>
        </div>
        <div>
          <label className="admin-label">Tercero (opcional)</label>
          <select value={form.third_party_id} onChange={e => setForm(f => ({ ...f, third_party_id: e.target.value }))} className="admin-input">
            <option value="">Sin tercero</option>
            {thirdParties.map(t => <option key={t.id} value={t.id}>{t.name} &mdash; {t.document_number}</option>)}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="admin-label !mb-0">Líneas del asiento</label>
            <button type="button" onClick={addLine} className="text-xs font-inter text-[var(--color-gold)] flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">add</span> Agregar línea
            </button>
          </div>
          <div className="border border-[var(--color-warm-gray)]/40 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-ivory)]">
                  <th className="text-left p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Cuenta</th>
                  <th className="text-right p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] w-28">Débito</th>
                  <th className="text-right p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] w-28">Crédito</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {form.lines.map((line, i) => (
                  <tr key={i} className="border-t border-[var(--color-warm-gray)]/20">
                    <td className="p-2">
                      <select value={line.account_id} onChange={e => updateLine(i, 'account_id', e.target.value)} className="admin-input !py-2 !text-xs" required>
                        <option value="">Seleccionar cuenta</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.code} &mdash; {a.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <input type="number" step="0.01" min="0" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} className="admin-input !py-2 !text-xs text-right" placeholder="0" />
                    </td>
                    <td className="p-2">
                      <input type="number" step="0.01" min="0" value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)} className="admin-input !py-2 !text-xs text-right" placeholder="0" />
                    </td>
                    <td className="p-2 text-center">
                      {form.lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 p-1">
                          <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--color-warm-gray)]/40 bg-[var(--color-ivory)]/50">
                  <td className="p-3 font-inter text-xs font-semibold text-[var(--color-near-black)]">Totales</td>
                  <td className="p-3 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(totals.debit)}</td>
                  <td className="p-3 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(totals.credit)}</td>
                  <td />
                </tr>
                {totals.debit !== totals.credit && (
                  <tr>
                    <td colSpan={4} className="p-2 text-center font-inter text-xs text-red-500">
                      Diferencia: {formatMoney(totals.diff)} &mdash; Los débitos y créditos deben ser iguales
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
          <button type="submit" disabled={saving || totals.debit !== totals.credit} className="admin-btn">
            {saving ? 'Guardando...' : 'Crear asiento (Borrador)'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InvoiceModal({ open, onClose, onSave, thirdParties }) {
  const [form, setForm] = useState({
    invoice_type: 'sales', third_party_id: '', issue_date: new Date().toISOString().slice(0, 10),
    due_date: '', items: [{ description: '', quantity: 1, unit_price: '', tax_rate: 0 }],
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (open) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setForm({
        invoice_type: 'sales', third_party_id: '', issue_date: new Date().toISOString().slice(0, 10),
        due_date: d.toISOString().slice(0, 10),
        items: [{ description: '', quantity: 1, unit_price: '', tax_rate: 0 }],
      });
    }
  }, [open]);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unit_price: '', tax_rate: 0 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, value) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [field]: value };
    return { ...f, items };
  });

  const totals = useMemo(() => {
    let subtotal = 0, tax = 0;
    form.items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const rate = parseFloat(item.tax_rate) || 0;
      const lineSub = qty * price;
      subtotal += lineSub;
      tax += lineSub * rate / 100;
    });
    return { subtotal, tax, total: subtotal + tax };
  }, [form.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.third_party_id || form.items.length === 0) return;
    setSaving(true);
    try {
      await req('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          third_party_id: Number(form.third_party_id),
          items: form.items.map(item => ({ ...item, quantity: parseFloat(item.quantity), unit_price: parseFloat(item.unit_price), tax_rate: parseFloat(item.tax_rate) })),
        }),
      });
      onSave();
      onClose();
    } catch (err) { addToast(err.message || 'Error al guardar factura', 'error'); }
    finally { setSaving(false); }
  };

  const filteredTP = thirdParties.filter(t => t.is_active !== false);

  return (
    <Modal open={open} onClose={onClose} title="Nueva factura" wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Tipo</label>
            <select value={form.invoice_type} onChange={e => setForm(f => ({ ...f, invoice_type: e.target.value }))} className="admin-input">
              <option value="sales">Factura de venta</option>
              <option value="purchase">Factura de compra</option>
            </select>
          </div>
          <div>
            <label className="admin-label">{form.invoice_type === 'sales' ? 'Cliente' : 'Proveedor'}</label>
            <select value={form.third_party_id} onChange={e => setForm(f => ({ ...f, third_party_id: e.target.value }))} className="admin-input" required>
              <option value="">Seleccionar</option>
              {filteredTP.filter(t => form.invoice_type === 'sales' ? ['client', 'other'].includes(t.type) : ['supplier', 'other'].includes(t.type)).map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.document_number})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Fecha de emisión</label>
            <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Fecha de vencimiento</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="admin-input" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="admin-label !mb-0">Items</label>
            <button type="button" onClick={addItem} className="text-xs font-inter text-[var(--color-gold)] flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[14px]">add</span> Agregar item
            </button>
          </div>
          <div className="border border-[var(--color-warm-gray)]/40 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-ivory)]">
                  <th className="text-left p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Descripción</th>
                  <th className="text-right p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] w-20">Cant.</th>
                  <th className="text-right p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] w-24">P. Unitario</th>
                  <th className="text-right p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] w-20">IVA %</th>
                  <th className="text-right p-3 font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] w-24">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => {
                  const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0) * (1 + (parseFloat(item.tax_rate) || 0) / 100);
                  return (
                    <tr key={i} className="border-t border-[var(--color-warm-gray)]/20">
                      <td className="p-2">
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="admin-input !py-2 !text-xs" placeholder="Descripción del item" required />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0.01" step="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="admin-input !py-2 !text-xs text-right" />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" step="100" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} className="admin-input !py-2 !text-xs text-right" />
                      </td>
                      <td className="p-2">
                        <select value={item.tax_rate} onChange={e => updateItem(i, 'tax_rate', e.target.value)} className="admin-input !py-2 !text-xs">
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="19">19%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-headline text-xs font-semibold">{formatMoney(total)}</td>
                      <td className="p-2 text-center">
                        {form.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1">
                            <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--color-warm-gray)]/40 bg-[var(--color-ivory)]/50">
                  <td colSpan={4} className="p-3 text-right font-inter text-xs font-semibold">Subtotal</td>
                  <td className="p-3 text-right font-headline text-sm font-semibold">{formatMoney(totals.subtotal)}</td>
                  <td />
                </tr>
                <tr className="bg-[var(--color-ivory)]/30">
                  <td colSpan={4} className="p-3 text-right font-inter text-xs font-semibold">Impuestos</td>
                  <td className="p-3 text-right font-headline text-sm font-semibold">{formatMoney(totals.tax)}</td>
                  <td />
                </tr>
                <tr className="border-t border-[var(--color-near-black)]/20 bg-[var(--color-ivory)]">
                  <td colSpan={4} className="p-3 text-right font-inter text-xs font-bold">Total</td>
                  <td className="p-3 text-right font-headline text-base font-bold text-[var(--color-near-black)]">{formatMoney(totals.total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div>
          <label className="admin-label">Notas</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="admin-input" rows={2} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? 'Guardando...' : 'Crear factura (Borrador)'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReconciliationModal({ open, onClose, onSave, bankAccounts }) {
  const [form, setForm] = useState({ bank_account_id: '', bank_balance: '', system_balance: '', reconciliation_date: new Date().toISOString().slice(0, 10), notes: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (open) {
      setForm({ bank_account_id: bankAccounts[0]?.id || '', bank_balance: '', system_balance: '', reconciliation_date: new Date().toISOString().slice(0, 10), notes: '' });
    }
  }, [open, bankAccounts]);

  const selAccount = bankAccounts.find(a => a.id === Number(form.bank_account_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bank_account_id || !form.bank_balance || !form.system_balance) return;
    setSaving(true);
    try {
      await req('/bank-reconciliation', {
        method: 'POST',
        body: JSON.stringify({ ...form, bank_account_id: Number(form.bank_account_id), bank_balance: parseFloat(form.bank_balance), system_balance: parseFloat(form.system_balance) }),
      });
      onSave();
      onClose();
    } catch (err) { addToast(err.message || 'Error al guardar conciliación', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva conciliación bancaria">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="admin-label">Cuenta bancaria</label>
          <select value={form.bank_account_id} onChange={e => setForm(f => ({ ...f, bank_account_id: e.target.value }))} className="admin-input" required>
            <option value="">Seleccionar cuenta</option>
            {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} &mdash; {a.account_number}</option>)}
          </select>
        </div>
        {selAccount && (
          <div className="bg-[var(--color-ivory)] p-4 text-sm font-inter text-[var(--color-on-surface-variant)]">
            Saldo actual en sistema: <strong className="text-[var(--color-near-black)]">{formatMoney(selAccount.balance || 0)}</strong>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Saldo según banco</label>
            <input type="number" step="0.01" value={form.bank_balance} onChange={e => setForm(f => ({ ...f, bank_balance: e.target.value }))} className="admin-input" required />
          </div>
          <div>
            <label className="admin-label">Saldo según sistema</label>
            <input type="number" step="0.01" value={form.system_balance} onChange={e => setForm(f => ({ ...f, system_balance: e.target.value }))} className="admin-input" required />
          </div>
        </div>
        {form.bank_balance && form.system_balance && (
          <div className={'p-3 font-inter text-xs rounded ' + (Math.abs(parseFloat(form.bank_balance) - parseFloat(form.system_balance)) < 0.01 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
            {Math.abs(parseFloat(form.bank_balance) - parseFloat(form.system_balance)) < 0.01
              ? '✓ Los saldos coinciden'
              : '✗ Diferencia: ' + formatMoney(Math.abs(parseFloat(form.bank_balance) - parseFloat(form.system_balance)))}
          </div>
        )}
        <div>
          <label className="admin-label">Fecha de conciliación</label>
          <input type="date" value={form.reconciliation_date} onChange={e => setForm(f => ({ ...f, reconciliation_date: e.target.value }))} className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Notas</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="admin-input" rows={2} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? 'Guardando...' : 'Crear conciliación'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminAccounting() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('dashboard');

  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [thirdParties, setThirdParties] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [arap, setArap] = useState([]);
  const [arapView, setArapView] = useState('receivable');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);

  const [reportType, setReportType] = useState('trial-balance');
  const [reportFrom, setReportFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); });
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [accountModal, setAccountModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [tpModal, setTpModal] = useState(false);
  const [editTp, setEditTp] = useState(null);
  const [entryModal, setEntryModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [reconModal, setReconModal] = useState(false);

  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [tpTypeFilter, setTpTypeFilter] = useState('');
  const [tpSearch, setTpSearch] = useState('');
  const [entryStatusFilter, setEntryStatusFilter] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');

  const loadTabData = useCallback(async (activeTab) => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          const [entries, resp, accts, tps, bkAccts] = await Promise.all([
            api.getAccountingEntries().catch(() => []),
            api.getAccountingSummary().catch(() => null),
            req('/account-charts').catch(() => []),
            req('/third-parties').catch(() => []),
            req('/bank-accounts').catch(() => []),
          ]);
          setAccounts(accts);
          setThirdParties(tps);
          setBankAccounts(bkAccts);
          setDashboardData({
            entries,
            summary: resp?.summary || null,
            dailyTotals: resp?.dailyTotals || [],
            incomeBreakdown: resp?.incomeBreakdown || [],
            expenseBreakdown: resp?.expenseBreakdown || [],
          });
          break;
        case 'chart-of-accounts':
          setAccounts(await req('/account-charts').catch(() => []));
          break;
        case 'third-parties':
          setThirdParties(await req('/third-parties').catch(() => []));
          break;
        case 'journal-entries':
          const [jeAccts, jeTPs, je] = await Promise.all([
            req('/account-charts').catch(() => []),
            req('/third-parties').catch(() => []),
            req('/journal-entries').catch(() => []),
          ]);
          setAccounts(jeAccts);
          setThirdParties(jeTPs);
          setJournalEntries(je);
          break;
        case 'invoicing':
          const [invTPs, invs] = await Promise.all([
            req('/third-parties').catch(() => []),
            req('/invoices').catch(() => []),
          ]);
          setThirdParties(invTPs);
          setInvoices(invs);
          break;
        case 'receivables-payables':
          const [rapTPs, rap] = await Promise.all([
            req('/third-parties').catch(() => []),
            req('/receivable-payable').catch(() => []),
          ]);
          setThirdParties(rapTPs);
          setArap(rap);
          break;
        case 'bank-reconciliation':
          const [bkAccts2, recs] = await Promise.all([
            req('/bank-accounts').catch(() => []),
            req('/bank-reconciliation').catch(() => []),
          ]);
          setBankAccounts(bkAccts2);
          setReconciliations(recs);
          break;
        case 'reports':
          const [accts3] = await Promise.all([
            req('/account-charts').catch(() => []),
          ]);
          setAccounts(accts3);
          break;
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTabData(tab); }, [tab, loadTabData]);

  const tpCache = {};
  thirdParties.forEach(t => { tpCache[t.id] = t; });

  const netProfit = useMemo(() => {
    const s = dashboardData?.summary;
    if (!s) return 0;
    return (Number(s.total_income) || 0) - (Number(s.total_expenses) || 0);
  }, [dashboardData]);

  const cashFlowData = useMemo(() => {
    if (!dashboardData?.dailyTotals?.length) return [];
    let balance = 0;
    return dashboardData.dailyTotals.map(d => {
      balance += Number(d.income) - Number(d.expense);
      return { ...d, balance, income: Number(d.income), expense: Number(d.expense) };
    });
  }, [dashboardData]);

  const profitLossData = useMemo(() => {
    if (!dashboardData?.incomeBreakdown?.length && !dashboardData?.expenseBreakdown?.length) return [];
    const incomeMap = {};
    const expenseMap = {};
    (dashboardData.incomeBreakdown || []).forEach(i => { incomeMap[i.category] = Number(i.total); });
    (dashboardData.expenseBreakdown || []).forEach(e => { expenseMap[e.category] = Number(e.total); });
    const allCats = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])];
    return allCats.map(cat => ({ category: cat, income: incomeMap[cat] || 0, expense: expenseMap[cat] || 0 }));
  }, [dashboardData]);

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'chart-of-accounts', label: 'Plan de Cuentas', icon: 'account_tree' },
    { key: 'third-parties', label: 'Terceros', icon: 'people' },
    { key: 'journal-entries', label: 'Asientos', icon: 'menu_book' },
    { key: 'invoicing', label: 'Facturación', icon: 'receipt' },
    { key: 'receivables-payables', label: 'CxC / CxP', icon: 'payments' },
    { key: 'bank-reconciliation', label: 'Conciliación', icon: 'account_balance' },
    { key: 'reports', label: 'Informes', icon: 'description' },
  ];

  const handleUpdateEntryStatus = async (id, status) => {
    try {
      await req('/journal-entries/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) });
      addToast(status === 'posted' ? 'Asiento contabilizado' : 'Asiento anulado');
      triggerFloatingNotification({ name: status === 'posted' ? 'Asiento contabilizado' : 'Asiento anulado', product: `#${id}`, icon: 'account_balance', time: 'recién' });
      setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch { addToast('Error al actualizar estado', 'error'); }
  };

  const handleUpdateInvoiceStatus = async (id, status) => {
    try {
      await req('/invoices/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) });
      const msgs = { issued: 'Factura emitida', paid: 'Factura marcada como pagada', cancelled: 'Factura anulada' };
      addToast(msgs[status] || 'Estado actualizado');
      triggerFloatingNotification({ name: 'Factura', product: msgs[status] || status, icon: 'receipt', time: 'recién' });
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    } catch { addToast('Error al actualizar estado', 'error'); }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('¿Eliminar este asiento contable?')) return;
    try {
      await api.deleteAccountingEntry(id);
      addToast('Asiento eliminado');
      triggerFloatingNotification({ name: 'Asiento', product: `#${id} eliminado`, icon: 'delete', time: '' });
      setJournalEntries(prev => prev.filter(e => e.id !== id));
    } catch { addToast('Error al eliminar', 'error'); }
  };

  const loadReport = async () => {
    setReportLoading(true);
    setReportData(null);
    try {
      let url;
      if (reportType === 'trial-balance') url = '/financial-reports/trial-balance?from=' + reportFrom + '&to=' + reportTo;
      else if (reportType === 'income-statement') url = '/financial-reports/income-statement?from=' + reportFrom + '&to=' + reportTo;
      else url = '/financial-reports/balance-sheet?as_of=' + (reportTo || new Date().toISOString().slice(0, 10));
      setReportData(await req(url));
    } catch { addToast('Error al generar reporte', 'error'); }
    finally { setReportLoading(false); }
  };

  if (loading && tab === 'dashboard' && !dashboardData) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Contabilidad</h1>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Gestión contable completa</p>
          </div>
        </div>
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Contabilidad</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Gestión contable completa</p>
        </div>
        <div className="flex items-center gap-3">
          {tab === 'chart-of-accounts' && (
            <button onClick={() => { setEditAccount(null); setAccountModal(true); }} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              <span className="material-symbols-outlined text-[16px]">add</span> Nueva cuenta
            </button>
          )}
          {tab === 'third-parties' && (
            <button onClick={() => { setEditTp(null); setTpModal(true); }} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              <span className="material-symbols-outlined text-[16px]">add</span> Nuevo tercero
            </button>
          )}
          {tab === 'journal-entries' && (
            <button onClick={() => setEntryModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              <span className="material-symbols-outlined text-[16px]">add</span> Nuevo asiento
            </button>
          )}
          {tab === 'invoicing' && (
            <button onClick={() => setInvoiceModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              <span className="material-symbols-outlined text-[16px]">add</span> Nueva factura
            </button>
          )}
          {tab === 'bank-reconciliation' && (
            <button onClick={() => setReconModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              <span className="material-symbols-outlined text-[16px]">add</span> Conciliar
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-[var(--color-warm-gray)]/40 mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={'flex items-center gap-2 px-6 py-4 font-inter text-[10px] uppercase tracking-[0.15em] border-b-2 transition-all duration-300 whitespace-nowrap ' + (tab === t.key ? 'border-[var(--color-gold)] text-[var(--color-near-black)]' : 'border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-near-black)]')}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Ingresos del mes', value: formatMoney(dashboardData?.summary?.total_income || 0), icon: 'payments', color: 'text-green-600' },
              { label: 'Gastos del mes', value: formatMoney(dashboardData?.summary?.total_expenses || 0), icon: 'money_off', color: 'text-red-500' },
              { label: 'Utilidad Neta', value: formatMoney(netProfit), icon: 'trending_up', color: netProfit >= 0 ? 'text-green-600' : 'text-red-500' },
              { label: 'Saldo en Caja', value: formatMoney(cashFlowData.length > 0 ? cashFlowData[cashFlowData.length - 1].balance : 0), icon: 'account_balance_wallet', color: 'text-[var(--color-near-black)]' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-[var(--color-warm-gray)]/40 p-5 hover:border-[var(--color-gold)]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={'material-symbols-outlined text-[18px] ' + card.color}>{card.icon}</span>
                  <p className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{card.label}</p>
                </div>
                <p className={'font-headline text-xl ' + card.color}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[var(--color-warm-gray)]/40 p-6">
              <h2 className="font-headline text-base text-[var(--color-near-black)] mb-4">Flujo de Caja</h2>
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={cashFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="cfG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.2} /><stop offset="95%" stopColor={GOLD} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#8a8a8a' }} tickFormatter={v => v?.slice(5) || ''} />
                    <YAxis tick={{ fontSize: 9, fill: '#8a8a8a' }} tickFormatter={v => formatMoney(v)} />
                    <Tooltip contentStyle={{ fontFamily: 'Inter' }} />
                    <Area type="monotone" dataKey="balance" stroke={GOLD} fill="url(#cfG)" strokeWidth={2} name="Saldo" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--color-warm-gray)] mb-3">bar_chart</span>
                  <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">Sin datos de flujo de caja</p>
                </div>
              )}
            </div>
            <div className="bg-white border border-[var(--color-warm-gray)]/40 p-6">
              <h2 className="font-headline text-base text-[var(--color-near-black)] mb-4">Ingresos vs Gastos</h2>
              {profitLossData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={profitLossData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                    <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#8a8a8a' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#8a8a8a' }} tickFormatter={v => formatMoney(v)} />
                    <Tooltip contentStyle={{ fontFamily: 'Inter' }} />
                    <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--color-warm-gray)] mb-3">bar_chart</span>
                  <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">Sin datos de ingresos/gastos</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Facturas pendientes', value: dashboardData?.entries?.filter(e => e.status === 'pending')?.length || 0, icon: 'receipt_long', color: 'text-amber-600' },
              { label: 'Por cobrar', value: formatMoney(dashboardData?.summary?.pending_income || 0), icon: 'arrow_upward', color: 'text-blue-600' },
              { label: 'Por pagar', value: formatMoney(dashboardData?.summary?.pending_expenses || 0), icon: 'arrow_downward', color: 'text-orange-500' },
              { label: 'Cuentas activas', value: accounts.filter(a => a.is_active !== false).length, icon: 'account_tree', color: 'text-[var(--color-gold)]' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-[var(--color-warm-gray)]/40 p-5 hover:border-[var(--color-gold)]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={'material-symbols-outlined text-[18px] ' + card.color}>{card.icon}</span>
                  <p className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{card.label}</p>
                </div>
                <p className={'font-headline text-xl ' + card.color}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'chart-of-accounts' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <select value={accountTypeFilter} onChange={e => setAccountTypeFilter(e.target.value)} className="admin-input !w-auto !py-2">
              <option value="">Todos los tipos</option>
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{accounts.filter(a => !accountTypeFilter || a.type === accountTypeFilter).length} cuentas</span>
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Código</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Nombre</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Tipo</th>
                    <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Nivel</th>
                    <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.filter(a => !accountTypeFilter || a.type === accountTypeFilter).sort((a, b) => (a.code || '').localeCompare(b.code || '')).map(acct => (
                    <tr key={acct.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                      <td className="p-5 font-inter text-sm font-mono text-[var(--color-near-black)]">{acct.code}</td>
                      <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{acct.name}</td>
                      <td className="p-5"><TypeBadge type={acct.type} /></td>
                      <td className="p-5 text-center font-inter text-sm">{acct.level}</td>
                      <td className="p-5 text-center"><StatusBadge status={acct.is_active !== false ? 'active' : 'inactive'} labels={{ active: 'Activo', inactive: 'Inactivo' }} /></td>
                      <td className="p-5 text-right">
                        <button onClick={() => { setEditAccount(acct); setAccountModal(true); }} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {accounts.filter(a => !accountTypeFilter || a.type === accountTypeFilter).length === 0 && (
                    <tr><td colSpan={6} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay cuentas contables</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'third-parties' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--color-on-surface-variant)]">search</span>
              <input value={tpSearch} onChange={e => setTpSearch(e.target.value)} className="admin-input !pl-9 !py-2" placeholder="Buscar por nombre o documento..." />
            </div>
            <select value={tpTypeFilter} onChange={e => setTpTypeFilter(e.target.value)} className="admin-input !w-auto !py-2">
              <option value="">Todos los tipos</option>
              {THIRD_PARTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Documento</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Nombre</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Tipo</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Email</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Teléfono</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Ciudad</th>
                    <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {thirdParties.filter(t => {
                    if (tpTypeFilter && t.type !== tpTypeFilter) return false;
                    if (tpSearch) {
                      const q = tpSearch.toLowerCase();
                      if (!t.name?.toLowerCase().includes(q) && !t.document_number?.toLowerCase().includes(q)) return false;
                    }
                    return true;
                  }).map(tp => (
                    <tr key={tp.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                      <td className="p-5 font-inter text-sm font-mono">{tp.document_number}</td>
                      <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{tp.name}</td>
                      <td className="p-5"><TypeBadge type={tp.type} mapping={THIRD_PARTY_TYPES} /></td>
                      <td className="p-5 font-inter text-sm text-[var(--color-on-surface-variant)]">{tp.email || '—'}</td>
                      <td className="p-5 font-inter text-sm text-[var(--color-on-surface-variant)]">{tp.phone || '—'}</td>
                      <td className="p-5 font-inter text-sm text-[var(--color-on-surface-variant)]">{tp.city || '—'}</td>
                      <td className="p-5 text-center"><StatusBadge status={tp.is_active !== false ? 'active' : 'inactive'} labels={{ active: 'Activo', inactive: 'Inactivo' }} /></td>
                      <td className="p-5 text-right">
                        <button onClick={() => { setEditTp(tp); setTpModal(true); }} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {thirdParties.length === 0 && (
                    <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay terceros registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'journal-entries' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <select value={entryStatusFilter} onChange={e => setEntryStatusFilter(e.target.value)} className="admin-input !w-auto !py-2">
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="posted">Contabilizado</option>
              <option value="cancelled">Anulado</option>
            </select>
            <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{journalEntries.length} asientos</span>
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">No.</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Fecha</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Descripción</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Tercero</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Débitos</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Créditos</th>
                    <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.filter(e => !entryStatusFilter || e.status === entryStatusFilter).map(entry => (
                    <tr key={entry.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                      <td className="p-5 font-inter text-sm font-mono">{entry.entry_number || entry.id}</td>
                      <td className="p-5 font-inter text-sm whitespace-nowrap">{(entry.date || entry.entry_date || '').slice(0, 10)}</td>
                      <td className="p-5 font-inter text-sm text-[var(--color-near-black)] max-w-[200px] truncate">{entry.description}</td>
                      <td className="p-5 font-inter text-sm text-[var(--color-on-surface-variant)]">{entry.third_party?.name || tpCache[entry.third_party_id]?.name || '—'}</td>
                      <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(entry.debit_total || entry.lines?.reduce?.((s, l) => s + Number(l.debit), 0) || 0)}</td>
                      <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(entry.credit_total || entry.lines?.reduce?.((s, l) => s + Number(l.credit), 0) || 0)}</td>
                      <td className="p-5 text-center"><StatusBadge status={entry.status || 'draft'} labels={ENTRY_STATUS_LABELS} /></td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {entry.status === 'draft' && (
                            <>
                              <button onClick={() => handleUpdateEntryStatus(entry.id, 'posted')} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Contabilizar">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              </button>
                              <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors" title="Eliminar">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                              <button onClick={() => handleUpdateEntryStatus(entry.id, 'cancelled')} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors" title="Anular">
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {journalEntries.length === 0 && (
                    <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay asientos contables. Crea el primer asiento.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'invoicing' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <select value={invoiceStatusFilter} onChange={e => setInvoiceStatusFilter(e.target.value)} className="admin-input !w-auto !py-2">
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="issued">Emitida</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Anulada</option>
            </select>
            <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{invoices.length} facturas</span>
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">No. Factura</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Tipo</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Cliente / Proveedor</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Emisión</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Vencimiento</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Total</th>
                    <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter(inv => !invoiceStatusFilter || inv.status === invoiceStatusFilter).map(inv => (
                    <tr key={inv.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                      <td className="p-5 font-inter text-sm font-mono">{inv.invoice_number || 'INV-' + String(inv.id).padStart(5, '0')}</td>
                      <td className="p-5">
                        <span className={'inline-flex items-center gap-1 font-inter text-xs ' + (inv.type === 'sales' ? 'text-blue-600' : 'text-orange-600')}>
                          <span className="material-symbols-outlined text-[14px]">{inv.invoice_type === 'sales' ? 'shopping_cart' : 'inventory'}</span>
                          {inv.invoice_type === 'sales' ? 'Venta' : 'Compra'}
                        </span>
                      </td>
                      <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{inv.third_party?.name || tpCache[inv.third_party_id]?.name || '—'}</td>
                      <td className="p-5 font-inter text-sm whitespace-nowrap">{(inv.issue_date || '').slice(0, 10)}</td>
                      <td className="p-5 font-inter text-sm whitespace-nowrap">{(inv.due_date || '').slice(0, 10)}</td>
                      <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(inv.total)}</td>
                      <td className="p-5 text-center"><StatusBadge status={inv.status || 'draft'} labels={INVOICE_STATUS_LABELS} /></td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status === 'draft' && (
                            <button onClick={() => handleUpdateInvoiceStatus(inv.id, 'issued')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Emitir">
                              <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                          )}
                          {inv.status === 'issued' && (
                            <button onClick={() => handleUpdateInvoiceStatus(inv.id, 'paid')} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Marcar pagada">
                              <span className="material-symbols-outlined text-[18px]">paid</span>
                            </button>
                          )}
                          {(inv.status === 'draft' || inv.status === 'issued') && (
                            <button onClick={() => handleUpdateInvoiceStatus(inv.id, 'cancelled')} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors" title="Anular">
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay facturas registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'receivables-payables' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex border border-[var(--color-warm-gray)]/40 overflow-hidden">
              {[{ key: 'receivable', label: 'Cuentas por Cobrar' }, { key: 'payable', label: 'Cuentas por Pagar' }].map(v => (
                <button key={v.key} onClick={() => setArapView(v.key)}
                  className={'px-6 py-3 font-inter text-xs uppercase tracking-[0.12em] transition-all duration-300 ' + (arapView === v.key ? 'bg-[var(--color-near-black)] text-white' : 'bg-white text-[var(--color-on-surface-variant)] hover:text-[var(--color-near-black)]')}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Tercero</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Valor Original</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Saldo</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Vencimiento</th>
                    <th className="text-center p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Días Vencidos</th>
                  </tr>
                </thead>
                <tbody>
                  {arap.filter(item => item.type === arapView).map(item => {
                    const daysOverdue = item.due_date ? Math.max(0, Math.floor((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24))) : 0;
                    const isOverdue = daysOverdue > 0 && item.status !== 'paid';
                    return (
                      <tr key={item.id} className={'border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors ' + (isOverdue ? 'bg-red-50/40' : '')}>
                        <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{item.third_party?.name || tpCache[item.third_party_id]?.name || '—'}</td>
                        <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(item.original_amount)}</td>
                        <td className={'p-5 text-right font-headline text-sm font-semibold ' + (isOverdue ? 'text-red-600' : 'text-[var(--color-near-black)]')}>{formatMoney(item.balance)}</td>
                        <td className="p-5 font-inter text-sm text-[var(--color-on-surface-variant)]">{(item.due_date || '').slice(0, 10)}</td>
                        <td className="p-5 text-center">
                          {isOverdue ? (
                            <span className="inline-block px-2 py-0.5 font-inter text-[9px] uppercase tracking-[0.1em] rounded bg-red-50 text-red-600">Vencido</span>
                          ) : (
                            <StatusBadge status={item.status || 'pending'} labels={ARAP_STATUS_LABELS} />
                          )}
                        </td>
                        <td className={'p-5 text-right font-inter text-sm font-semibold ' + (isOverdue ? 'text-red-600' : 'text-[var(--color-on-surface-variant)]')}>
                          {daysOverdue > 0 ? daysOverdue + ' días' : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {arap.filter(item => item.type === arapView).length === 0 && (
                    <tr><td colSpan={6} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay {arapView === 'receivable' ? 'cuentas por cobrar' : 'cuentas por pagar'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'bank-reconciliation' && (
        <div className="space-y-6">
          {bankAccounts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {bankAccounts.slice(0, 4).map(ba => (
                <div key={ba.id} className="bg-white border border-[var(--color-warm-gray)]/40 p-5">
                  <p className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] mb-1">{ba.bank_name}</p>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mb-2">{ba.account_number || '—'}</p>
                  <p className="font-headline text-lg text-[var(--color-near-black)]">{formatMoney(ba.balance || 0)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="p-6 border-b border-[var(--color-warm-gray)]/40">
              <h2 className="font-headline text-base text-[var(--color-near-black)]">Historial de Conciliaciones</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Fecha</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Cuenta</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Saldo Banco</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Saldo Sistema</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Diferencia</th>
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliations.map(r => {
                    const diff = Math.abs(Number(r.bank_balance) - Number(r.system_balance));
                    const matched = diff < 0.01;
                    return (
                      <tr key={r.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                        <td className="p-5 font-inter text-sm whitespace-nowrap">{(r.reconciliation_date || '').slice(0, 10)}</td>
                        <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{(bankAccounts.find(ba => ba.id === r.bank_account_id) || {}).name || 'Cuenta #' + r.bank_account_id}</td>
                        <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(r.bank_balance)}</td>
                        <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(r.system_balance)}</td>
                        <td className={'p-5 text-right font-headline text-sm font-semibold ' + (matched ? 'text-green-600' : 'text-red-500')}>
                          {matched ? '—' : formatMoney(diff)}
                        </td>
                        <td className="p-5">
                          {matched ? (
                            <span className="inline-flex items-center gap-1 font-inter text-xs text-green-600">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Conciliado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-inter text-xs text-red-500">
                              <span className="material-symbols-outlined text-[14px]">error</span> Diferencia
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {reconciliations.length === 0 && (
                    <tr><td colSpan={6} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay conciliaciones registradas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-[var(--color-warm-gray)]/40 p-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="admin-label">Tipo de reporte</label>
                <select value={reportType} onChange={e => { setReportType(e.target.value); setReportData(null); }} className="admin-input !w-auto">
                  <option value="trial-balance">Balance de Comprobación</option>
                  <option value="income-statement">Estado de Resultados</option>
                  <option value="balance-sheet">Balance General</option>
                </select>
              </div>
              <div>
                <label className="admin-label">{reportType === 'balance-sheet' ? 'Corte al' : 'Desde'}</label>
                <input type="date" value={reportType === 'balance-sheet' ? reportTo : reportFrom} onChange={e => { reportType === 'balance-sheet' ? setReportTo(e.target.value) : setReportFrom(e.target.value); }} className="admin-input !w-auto" />
              </div>
              {reportType !== 'balance-sheet' && (
                <div>
                  <label className="admin-label">Hasta</label>
                  <input type="date" value={reportTo} onChange={e => setReportTo(e.target.value)} className="admin-input !w-auto" />
                </div>
              )}
              <button onClick={loadReport} disabled={reportLoading} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
                <span className="material-symbols-outlined text-[16px]">description</span>
                {reportLoading ? 'Generando...' : 'Generar reporte'}
              </button>
            </div>
          </div>

          {reportLoading && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" />
            </div>
          )}

          {reportData && !reportLoading && (
            <div className="bg-white border border-[var(--color-warm-gray)]/40">
              <div className="p-6 border-b border-[var(--color-warm-gray)]/40">
                <h2 className="font-headline text-base text-[var(--color-near-black)]">
                  {reportType === 'trial-balance' ? 'Balance de Comprobación' : reportType === 'income-statement' ? 'Estado de Resultados' : 'Balance General'}
                </h2>
                <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{reportFrom} &mdash; {reportTo}</p>
              </div>
              <div className="overflow-x-auto">
                {reportType === 'balance-sheet' && !Array.isArray(reportData) ? (
                  <div className="divide-y divide-[var(--color-warm-gray)]/20">
                    {[{ key: 'assets', label: 'Activo', color: 'text-blue-600' },
                      { key: 'liabilities', label: 'Pasivo', color: 'text-purple-600' },
                      { key: 'equity', label: 'Patrimonio', color: 'text-emerald-600' }].map(section => (
                      <div key={section.key}>
                        <div className="p-5 bg-[var(--color-ivory)] border-b border-[var(--color-warm-gray)]/40">
                          <h3 className={'font-headline text-sm font-semibold ' + section.color}>{section.label}</h3>
                        </div>
                        <table className="w-full">
                          <tbody>
                            {reportData[section.key]?.map((row, i) => (
                              <tr key={i} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                                <td className="p-5 font-inter text-sm font-mono text-[var(--color-on-surface-variant)] w-[120px]">{row.code}</td>
                                <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{row.name}</td>
                                <td className={'p-5 text-right font-headline text-sm font-semibold ' + section.color}>{formatMoney(row.balance || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                    <div className="p-5 bg-[var(--color-ivory)] flex justify-between font-headline text-sm font-bold text-[var(--color-near-black)]">
                      <span>Total Activos</span>
                      <span className="text-blue-600">{formatMoney(reportData.totalAssets || 0)}</span>
                      <span>Total Pasivo + Patrimonio</span>
                      <span className="text-purple-600">{formatMoney(reportData.totalLiabilitiesEquity || 0)}</span>
                    </div>
                  </div>
                ) : Array.isArray(reportData) ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-warm-gray)]/40">
                        <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Cuenta</th>
                        <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Nombre</th>
                        {reportType === 'trial-balance' && (
                          <>
                            <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Débitos</th>
                            <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Créditos</th>
                          </>
                        )}
                        {reportType === 'income-statement' && (
                          <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Saldo</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                          <td className="p-5 font-inter text-sm font-mono text-[var(--color-on-surface-variant)]">{row.code || '—'}</td>
                          <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{row.name || '—'}</td>
                          {reportType === 'trial-balance' && (
                            <>
                              <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(row.total_debit || 0)}</td>
                              <td className="p-5 text-right font-headline text-sm font-semibold text-[var(--color-near-black)]">{formatMoney(row.total_credit || 0)}</td>
                            </>
                          )}
                          {reportType === 'income-statement' && (
                            <td className={'p-5 text-right font-headline text-sm font-semibold ' + (Number(row.balance || 0) >= 0 ? 'text-green-600' : 'text-red-500')}>{formatMoney(row.balance || 0)}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    {reportData.length > 0 && reportType === 'trial-balance' && (
                      <tfoot>
                        <tr className="border-t border-[var(--color-warm-gray)]/40 bg-[var(--color-ivory)]">
                          <td colSpan={2} className="p-5 text-right font-headline text-sm font-bold text-[var(--color-near-black)]">Totales</td>
                          <td className="p-5 text-right font-headline text-sm font-bold text-[var(--color-near-black)]">
                            {formatMoney(reportData.reduce((s, r) => s + Number(r.total_debit || 0), 0))}
                          </td>
                          <td className="p-5 text-right font-headline text-sm font-bold text-[var(--color-near-black)]">
                            {formatMoney(reportData.reduce((s, r) => s + Number(r.total_credit || 0), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                    {reportData.length > 0 && reportType === 'income-statement' && (
                      <tfoot>
                        <tr className="border-t border-[var(--color-warm-gray)]/40 bg-[var(--color-ivory)]">
                          <td colSpan={2} className="p-5 text-right font-headline text-sm font-bold text-[var(--color-near-black)]">Total Ingresos</td>
                          <td className="p-5 text-right font-headline text-sm font-bold text-green-600">{formatMoney(reportData.totalIncome || 0)}</td>
                        </tr>
                        <tr className="border-t border-[var(--color-warm-gray)]/20 bg-[var(--color-ivory)]/50">
                          <td colSpan={2} className="p-5 text-right font-headline text-sm font-bold text-[var(--color-near-black)]">Total Gastos</td>
                          <td className="p-5 text-right font-headline text-sm font-bold text-red-500">{formatMoney(reportData.totalExpenses || 0)}</td>
                        </tr>
                        <tr className="bg-[var(--color-near-black)] text-white">
                          <td colSpan={2} className="p-5 text-right font-headline text-sm font-bold">Utilidad Neta</td>
                          <td className="p-5 text-right font-headline text-sm font-bold">{formatMoney(reportData.netIncome || 0)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                ) : (
                  <p className="p-10 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">Datos del reporte no disponibles</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AccountModal open={accountModal} onClose={() => { setAccountModal(false); setEditAccount(null); }} onSave={() => { addToast(editAccount ? 'Cuenta actualizada' : 'Cuenta creada'); triggerFloatingNotification({ name: 'Cuenta', product: editAccount ? 'actualizada' : 'creada', icon: 'account_tree', time: 'recién' }); loadTabData('chart-of-accounts'); }} edit={editAccount} />
      <ThirdPartyModal open={tpModal} onClose={() => { setTpModal(false); setEditTp(null); }} onSave={() => { addToast(editTp ? 'Tercero actualizado' : 'Tercero creado'); triggerFloatingNotification({ name: 'Tercero', product: editTp ? 'actualizado' : 'creado', icon: 'people', time: 'recién' }); loadTabData('third-parties'); }} edit={editTp} />
      <JournalEntryModal open={entryModal} onClose={() => setEntryModal(false)} onSave={() => { addToast('Asiento creado como borrador'); triggerFloatingNotification({ name: 'Asiento', product: 'borrador creado', icon: 'account_balance', time: 'recién' }); loadTabData('journal-entries'); }} accounts={accounts} thirdParties={thirdParties} />
      <InvoiceModal open={invoiceModal} onClose={() => setInvoiceModal(false)} onSave={() => { addToast('Factura creada como borrador'); triggerFloatingNotification({ name: 'Factura', product: 'borrador creado', icon: 'receipt', time: 'recién' }); loadTabData('invoicing'); }} thirdParties={thirdParties} />
      <ReconciliationModal open={reconModal} onClose={() => setReconModal(false)} onSave={() => { addToast('Conciliación creada'); triggerFloatingNotification({ name: 'Conciliación', product: 'registrada', icon: 'account_balance', time: 'recién' }); loadTabData('bank-reconciliation'); }} bankAccounts={bankAccounts} />
    </div>
  );
}
