import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const GOLD = '#d4af37';
const COLORS = ['#d4af37', '#1c1b1b', '#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16'];

const INCOME_CATEGORIES = ['Ventas', 'Servicios', 'Comisiones', 'Intereses', 'Otros Ingresos'];
const EXPENSE_CATEGORIES = ['Compras', 'Nómina', 'Servicios Públicos', 'Arriendo', 'Marketing', 'Transporte', 'Impuestos', 'Mantenimiento', 'Oficina', 'Otros Gastos'];
const PAYMENT_METHODS = ['transferencia', 'efectivo', 'tarjeta', 'cheque', 'otro'];

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function EntryModal({ open, onClose, onSave, edit }) {
  const [form, setForm] = useState({ type: 'income', category: '', description: '', amount: '', entry_date: new Date().toISOString().slice(0, 10), payment_method: 'transferencia', reference: '', is_tax_deductible: false, status: 'confirmed' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (edit) {
      setForm({ type: edit.type, category: edit.category, description: edit.description, amount: String(edit.amount), entry_date: edit.entry_date?.slice(0, 10), payment_method: edit.payment_method, reference: edit.reference || '', is_tax_deductible: edit.is_tax_deductible, status: edit.status });
    } else {
      setForm({ type: 'income', category: '', description: '', amount: '', entry_date: new Date().toISOString().slice(0, 10), payment_method: 'transferencia', reference: '', is_tax_deductible: false, status: 'confirmed' });
    }
  }, [edit, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (edit) {
        await api.updateAccountingEntry(edit.id, payload);
      } else {
        await api.createAccountingEntry(payload);
      }
      onSave();
      onClose();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (!open) return null;

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-near-black)]/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg shadow-luxury-lg animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-warm-gray)]/40">
            <h2 className="font-headline text-lg text-[var(--color-near-black)]">{edit ? 'Editar' : 'Nueva'} entrada</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-warm-gray)]/50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex gap-3">
              {['income', 'expense'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                  className={`flex-1 py-3 font-inter text-xs uppercase tracking-[0.15em] transition-all duration-300 border ${form.type === t ? (t === 'income' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-400 text-red-700') : 'bg-white border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)]'}`}>
                  {t === 'income' ? 'Ingreso' : 'Gasto'}
                </button>
              ))}
            </div>
            <div>
              <label className="admin-label">Categoría</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="admin-input" required>
                <option value="">Seleccionar categoría</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Descripción</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="admin-input" placeholder="Descripción opcional" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Valor</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Fecha</label>
                <input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Método de pago</label>
                <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} className="admin-input">
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Estado</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="admin-input">
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendiente</option>
                  <option value="cancelled">Anulado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="admin-label">Referencia (factura / recibo)</label>
              <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} className="admin-input" placeholder="Opcional" />
            </div>
            {form.type === 'expense' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_tax_deductible} onChange={e => setForm(f => ({ ...f, is_tax_deductible: e.target.checked }))} className="w-4 h-4 accent-[var(--color-gold)]" />
                <span className="font-inter text-sm text-[var(--color-on-surface-variant)]">Deducible de impuestos</span>
              </label>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="admin-btn-outline">Cancelar</button>
              <button type="submit" disabled={saving} className="admin-btn">
                {saving ? 'Guardando...' : edit ? 'Actualizar' : 'Crear entrada'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function ChartEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-[260px] text-center">
      <span className="material-symbols-outlined text-4xl text-[var(--color-warm-gray)] mb-3">bar_chart</span>
      <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">{message || 'Sin datos para mostrar'}</p>
      <p className="font-inter text-xs text-[var(--color-warm-gray-dark)] mt-1">Agrega movimientos contables para ver gráficos</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
      <p className="text-[var(--color-on-surface-variant)] text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-headline font-semibold" style={{ color: p.color }}>
          {p.name}: {format ? format(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminAccounting() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [incomeBreakdown, setIncomeBreakdown] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [dailyTotals, setDailyTotals] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); });
  const [filterDateTo, setFilterDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterDateFrom) filters.from = filterDateFrom;
      if (filterDateTo) filters.to = filterDateTo;
      if (filterType) filters.type = filterType;
      if (filterCategory) filters.category = filterCategory;
      if (filterStatus) filters.status = filterStatus;

      const [entriesData, summaryData, taxSummary] = await Promise.all([
        api.getAccountingEntries(Object.keys(filters).length ? filters : undefined).catch(() => []),
        api.getAccountingSummary({ from: filterDateFrom, to: filterDateTo }).catch(() => null),
        api.getTaxSummary(taxYear).catch(() => []),
      ]);
      setEntries(entriesData);
      if (summaryData) {
        setSummary(summaryData.summary);
        setIncomeBreakdown(summaryData.incomeBreakdown || []);
        setExpenseBreakdown(summaryData.expenseBreakdown || []);
        setDailyTotals(summaryData.dailyTotals || []);
      }
      setTaxData(taxSummary);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filterDateFrom, filterDateTo, filterType, filterCategory, filterStatus, taxYear]);

  const netProfit = useMemo(() => {
    if (!summary) return 0;
    return Number(summary.total_income) - Number(summary.total_expenses);
  }, [summary]);

  const cashFlowData = useMemo(() => {
    let balance = 0;
    return dailyTotals.map(d => {
      balance += Number(d.income) - Number(d.expense);
      return { ...d, balance, income: Number(d.income), expense: Number(d.expense) };
    });
  }, [dailyTotals]);

  const profitLossData = useMemo(() => {
    const incomeMap = {};
    const expenseMap = {};
    incomeBreakdown.forEach(i => { incomeMap[i.category] = Number(i.total); });
    expenseBreakdown.forEach(e => { expenseMap[e.category] = Number(e.total); });

    const allCats = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])];
    return allCats.map(cat => ({
      category: cat,
      income: incomeMap[cat] || 0,
      expense: expenseMap[cat] || 0,
      net: (incomeMap[cat] || 0) - (expenseMap[cat] || 0),
    }));
  }, [incomeBreakdown, expenseBreakdown]);

  const totalIncome = profitLossData.reduce((s, r) => s + r.income, 0);
  const totalExpenses = profitLossData.reduce((s, r) => s + r.expense, 0);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { Concepto: 'Ingresos Totales', Valor: totalIncome },
      { Concepto: 'Gastos Totales', Valor: totalExpenses },
      { Concepto: 'Utilidad Neta', Valor: totalIncome - totalExpenses },
      { Concepto: 'Ingresos Pendientes', Valor: Number(summary?.pending_income || 0) },
      { Concepto: 'Gastos Pendientes', Valor: Number(summary?.pending_expenses || 0) },
    ]), 'Resumen');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(profitLossData.map(r => ({
      Categoria: r.category,
      Ingresos: r.income,
      Gastos: r.expense,
      Neto: r.net,
    }))), 'PyG');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entries.map(e => ({
      Tipo: e.type === 'income' ? 'Ingreso' : 'Gasto',
      Categoria: e.category,
      Descripcion: e.description,
      Valor: Number(e.amount),
      Fecha: e.entry_date?.slice(0, 10),
      'Metodo Pago': e.payment_method,
      Referencia: e.reference,
      Estado: e.status,
      Deducible: e.is_tax_deductible ? 'Sí' : 'No',
    }))), 'Movimientos');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taxData.map(t => ({
      Mes: t.month,
      Ingresos: Number(t.income),
      Gastos: Number(t.expense),
      Deducible: Number(t.deductible_expenses),
      'Base Imponible': Number(t.income) - Number(t.deductible_expenses),
    }))), 'Impuestos');

    XLSX.writeFile(wb, `contabilidad_dais_${new Date().toISOString().slice(0, 10)}.xlsx`);
    addToast('Reporte exportado en Excel');
  };

  const handleSave = () => { loadData(); addToast(editEntry ? 'Entrada actualizada' : 'Entrada creada'); setEditEntry(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta entrada contable?')) return;
    try {
      await api.deleteAccountingEntry(id);
      loadData();
      addToast('Entrada eliminada');
    } catch { addToast('Error al eliminar'); }
  };

  const expenseTotal = expenseBreakdown.reduce((s, r) => s + Number(r.total), 0);
  const incomeTotal = incomeBreakdown.reduce((s, r) => s + Number(r.total), 0);

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'income', label: 'Ingresos', icon: 'arrow_upward' },
    { key: 'expenses', label: 'Gastos', icon: 'arrow_downward' },
    { key: 'tax', label: 'Impuestos', icon: 'receipt_long' },
    { key: 'entries', label: 'Movimientos', icon: 'format_list_bulleted' },
  ];

  if (loading && !entries.length && !summary) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" /></div>;
  }

  const filterForType = (type) => entries.filter(e => e.type === type);

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Contabilidad</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Gestión financiera completa</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditEntry(null); setModalOpen(true); }} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nueva entrada
          </button>
          <button onClick={exportExcel} className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-xs uppercase tracking-[0.18em] hover:border-[var(--color-near-black)] transition-all duration-300">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Exportar
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-5 bg-white border border-[var(--color-warm-gray)]/40">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Desde</span>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="admin-input !w-auto !py-2" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Hasta</span>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="admin-input !w-auto !py-2" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setFilterCategory(''); }} className="admin-input !w-auto !py-2">
          <option value="">Todos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-input !w-auto !py-2">
          <option value="">Todos los estados</option>
          <option value="confirmed">Confirmado</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Anulado</option>
        </select>
        {filterType && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="admin-input !w-auto !py-2">
            <option value="">Todas las categorías</option>
            {(filterType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-[var(--color-warm-gray)]/40 mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-4 font-inter text-xs uppercase tracking-[0.15em] border-b-2 transition-all duration-300 whitespace-nowrap ${tab === t.key ? 'border-[var(--color-gold)] text-[var(--color-near-black)]' : 'border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-near-black)]'}`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Ingresos', value: formatMoney(summary?.total_income || 0), icon: 'payments', color: 'text-green-600' },
              { label: 'Gastos', value: formatMoney(summary?.total_expenses || 0), icon: 'money_off', color: 'text-red-500' },
              { label: 'Utilidad', value: formatMoney(netProfit), icon: 'trending_up', color: netProfit >= 0 ? 'text-green-600' : 'text-red-500' },
              { label: 'Pendientes Cobrar', value: formatMoney(summary?.pending_income || 0), icon: 'hourglass_bottom', color: 'text-amber-600' },
              { label: 'Pendientes Pagar', value: formatMoney(summary?.pending_expenses || 0), icon: 'hourglass_top', color: 'text-orange-500' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-[var(--color-warm-gray)]/40 p-5 hover:border-[var(--color-gold)]/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-[18px] ${card.color}`}>{card.icon}</span>
                  <p className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{card.label}</p>
                </div>
                <p className={`font-headline text-xl ${card.color}`}>{card.value}</p>
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
                    <Tooltip content={<CustomTooltip format={formatMoney} />} />
                    <Area type="monotone" dataKey="balance" stroke={GOLD} fill="url(#cfG)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <ChartEmptyState message="No hay flujo de caja disponible" />}
            </div>
            <div className="bg-white border border-[var(--color-warm-gray)]/40 p-6">
              <h2 className="font-headline text-base text-[var(--color-near-black)] mb-4">Ingresos vs Gastos</h2>
              {profitLossData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={profitLossData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                    <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#8a8a8a' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#8a8a8a' }} tickFormatter={v => formatMoney(v)} />
                    <Tooltip content={<CustomTooltip format={formatMoney} />} />
                    <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <ChartEmptyState message="No hay datos de ingresos/gastos" />}
            </div>
            <div className="bg-white border border-[var(--color-warm-gray)]/40 p-6">
              <h2 className="font-headline text-base text-[var(--color-near-black)] mb-4">Gastos por Categoría</h2>
              {expenseBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip format={formatMoney} />} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <ChartEmptyState message="No hay gastos registrados" />}
            </div>
            <div className="bg-white border border-[var(--color-warm-gray)]/40 p-6">
              <h2 className="font-headline text-base text-[var(--color-near-black)] mb-4">Ingresos por Categoría</h2>
              {incomeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={incomeBreakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {incomeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip format={formatMoney} />} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <ChartEmptyState message="No hay ingresos registrados" />}
            </div>
          </div>

          {entries.length === 0 && (
            <div className="bg-white border border-[var(--color-warm-gray)]/40 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[var(--color-warm-gray)] mb-4">account_balance</span>
              <h3 className="font-headline text-xl text-[var(--color-near-black)] mb-2">Empieza a registrar tus movimientos</h3>
              <p className="font-inter text-sm text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-6">Agrega ingresos y gastos para ver gráficos financieros, flujo de caja y reportes fiscales.</p>
              <button onClick={() => { setEditEntry(null); setModalOpen(true); }} className="btn-gold">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Agregar primera entrada
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: INCOME / EXPENSES */}
      {(tab === 'income' || tab === 'expenses') && (
        <div className="space-y-6">
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="p-6 border-b border-[var(--color-warm-gray)]/40">
              <h2 className="font-headline text-base text-[var(--color-near-black)]">{tab === 'income' ? 'Ingresos' : 'Gastos'} por Categoría</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Categoría</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Total</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Transacciones</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">%</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'income' ? incomeBreakdown : expenseBreakdown).map(row => {
                    const total = tab === 'income' ? incomeTotal : expenseTotal;
                    const pct = total > 0 ? (Number(row.total) / total * 100).toFixed(1) : 0;
                    return (
                      <tr key={row.category} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                        <td className="p-5 font-inter text-sm">{row.category}</td>
                        <td className={`p-5 text-right font-headline text-sm font-semibold ${tab === 'income' ? 'text-green-600' : 'text-red-500'}`}>{formatMoney(row.total)}</td>
                        <td className="p-5 text-right font-inter text-sm">{row.count}</td>
                        <td className="p-5 text-right font-inter text-sm text-[var(--color-on-surface-variant)]">{pct}%</td>
                      </tr>
                    );
                  })}
                  {(tab === 'income' ? incomeBreakdown : expenseBreakdown).length === 0 && (
                    <tr><td colSpan={4} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">Sin datos en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="p-6 border-b border-[var(--color-warm-gray)]/40">
              <h2 className="font-headline text-base text-[var(--color-near-black)]">Movimientos recientes</h2>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Fecha</th>
                    <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Categoría</th>
                    <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Descripción</th>
                    <th className="text-right p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Valor</th>
                    <th className="text-center p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'income' ? filterForType('income') : filterForType('expense')).slice(0, 20).map(e => (
                    <tr key={e.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                      <td className="p-4 font-inter text-sm">{e.entry_date?.slice(0, 10)}</td>
                      <td className="p-4 font-inter text-sm">{e.category}</td>
                      <td className="p-4 font-inter text-sm text-[var(--color-on-surface-variant)] max-w-[200px] truncate">{e.description || '—'}</td>
                      <td className={`p-4 text-right font-headline text-sm font-semibold ${tab === 'income' ? 'text-green-600' : 'text-red-500'}`}>{formatMoney(e.amount)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 font-inter text-[9px] uppercase tracking-[0.1em] rounded ${e.status === 'confirmed' ? 'bg-green-50 text-green-700' : e.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-500'}`}>{e.status}</span>
                      </td>
                    </tr>
                  ))}
                  {(tab === 'income' ? filterForType('income') : filterForType('expense')).length === 0 && (
                    <tr><td colSpan={5} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">Sin registros</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TAX SUMMARY */}
      {tab === 'tax' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">Año fiscal</span>
            <select value={taxYear} onChange={e => setTaxYear(Number(e.target.value))} className="admin-input !w-auto !py-2">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { label: 'Ingresos Brutos', value: formatMoney(taxData.reduce((s, t) => s + Number(t.income), 0)), color: 'text-green-600' },
              { label: 'Gastos Totales', value: formatMoney(taxData.reduce((s, t) => s + Number(t.expense), 0)), color: 'text-red-500' },
              { label: 'Gastos Deducibles', value: formatMoney(taxData.reduce((s, t) => s + Number(t.deductible_expenses), 0)), color: 'text-blue-600' },
              { label: 'Base Imponible', value: formatMoney(taxData.reduce((s, t) => s + Number(t.income) - Number(t.deductible_expenses), 0)), color: 'text-amber-600' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-[var(--color-warm-gray)]/40 p-5">
                <p className="font-inter text-[9px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] mb-2">{card.label}</p>
                <p className={`font-headline text-xl ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[var(--color-warm-gray)]/40">
            <div className="p-6 border-b border-[var(--color-warm-gray)]/40">
              <h2 className="font-headline text-base text-[var(--color-near-black)]">Resumen Fiscal Mensual</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-warm-gray)]/40">
                    <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Mes</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Ingresos</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Gastos</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Deducibles</th>
                    <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Base Imponible</th>
                  </tr>
                </thead>
                <tbody>
                  {taxData.map(t => (
                    <tr key={t.month} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                      <td className="p-5 font-inter text-sm">{t.month}</td>
                      <td className="p-5 text-right font-headline text-sm font-semibold text-green-600">{formatMoney(t.income)}</td>
                      <td className="p-5 text-right font-inter text-sm text-red-500">{formatMoney(t.expense)}</td>
                      <td className="p-5 text-right font-inter text-sm text-blue-600">{formatMoney(t.deductible_expenses)}</td>
                      <td className="p-5 text-right font-headline text-sm font-semibold text-amber-600">{formatMoney(Number(t.income) - Number(t.deductible_expenses))}</td>
                    </tr>
                  ))}
                  {taxData.length === 0 && <tr><td colSpan={5} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">Sin datos fiscales para {taxYear}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALL ENTRIES */}
      {tab === 'entries' && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-warm-gray)]/40">
                  <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Fecha</th>
                  <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Tipo</th>
                  <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Categoría</th>
                  <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Descripción</th>
                  <th className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Método</th>
                  <th className="text-right p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Valor</th>
                  <th className="text-center p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Estado</th>
                  <th className="text-center p-4 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                    <td className="p-4 font-inter text-sm whitespace-nowrap">{e.entry_date?.slice(0, 10)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-inter text-xs ${e.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-[14px]">{e.type === 'income' ? 'arrow_upward' : 'arrow_downward'}</span>
                        {e.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="p-4 font-inter text-sm">{e.category}</td>
                    <td className="p-4 font-inter text-sm text-[var(--color-on-surface-variant)] max-w-[200px] truncate">{e.description || '—'}</td>
                    <td className="p-4 font-inter text-sm text-[var(--color-on-surface-variant)]">{e.payment_method}</td>
                    <td className={`p-4 text-right font-headline text-sm font-semibold ${e.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{formatMoney(e.amount)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 font-inter text-[9px] uppercase tracking-[0.1em] rounded ${e.status === 'confirmed' ? 'bg-green-50 text-green-700' : e.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-500'}`}>{e.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditEntry(e); setModalOpen(true); }} className="p-2 hover:bg-[var(--color-warm-gray)]/50 rounded-full transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="p-2 hover:bg-red-50 rounded-full transition-colors" title="Eliminar">
                          <span className="material-symbols-outlined text-[16px] text-red-400">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={8} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">Sin movimientos contables. ¡Agrega tu primera entrada!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EntryModal open={modalOpen} onClose={() => { setModalOpen(false); setEditEntry(null); }} onSave={handleSave} edit={editEntry} />
    </div>
  );
}
