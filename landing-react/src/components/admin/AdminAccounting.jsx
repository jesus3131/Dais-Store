import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GOLD = '#d4af37';

export default function AdminAccounting() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([api.getOrderStats().then(setStats).catch(() => {}), api.getOrders().then(setOrders).catch(() => {})])
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" /></div>;
  }

  const totalCost = orders.reduce((s, o) => s + Number(o.total), 0);
  const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((s, o) => s + Number(o.total), 0);
  const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = orders.length > 0 ? totalCost / orders.length : 0;
  const revenueData = stats?.revenueByDay || [];

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { Concepto: 'Ingresos Totales', Valor: totalCost },
      { Concepto: 'Pendientes por Cobrar', Valor: pendingRevenue },
      { Concepto: 'Cobrados (Entregados)', Valor: deliveredRevenue },
      { Concepto: 'Valor Promedio por Pedido', Valor: avgOrder },
      { Concepto: 'Total Pedidos', Valor: orders.length },
    ]), 'Resumen');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueData.map(d => ({ Fecha: d.day, Pedidos: d.orders, Ingresos: Number(d.revenue).toFixed(2) }))), 'Ingresos Diarios');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders.map(o => ({ Cliente: o.customer_name, Total: Number(o.total).toFixed(2), Estado: o.status, Fecha: o.created_at?.slice(0, 10) }))), 'Pedidos');
    XLSX.writeFile(wb, `contabilidad_dais_${new Date().toISOString().slice(0, 10)}.xlsx`);
    addToast('Reporte exportado en Excel');
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Contabilidad</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Reportes financieros</p>
        </div>
        <button onClick={exportExcel} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
          <span className="material-symbols-outlined text-[16px]">download</span>
          Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Ingresos Totales', value: `$${totalCost.toLocaleString()}`, icon: 'payments', color: 'text-green-600' },
          { label: 'Pendientes por Cobrar', value: `$${pendingRevenue.toLocaleString()}`, icon: 'hourglass_bottom', color: 'text-amber-600' },
          { label: 'Cobrados (Entregados)', value: `$${deliveredRevenue.toLocaleString()}`, icon: 'check_circle', color: 'text-blue-600' },
          { label: 'Valor Promedio', value: `$${avgOrder.toLocaleString()}`, icon: 'trending_up', color: 'text-purple-600' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[var(--color-warm-gray)]/40 p-6 hover:border-[var(--color-gold)]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]">{card.label}</p>
            </div>
            <p className={`font-headline text-2xl ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Ingresos Diarios</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
                  <p className="text-[var(--color-on-surface-variant)] text-xs mb-1">{label}</p><p className="font-headline font-semibold text-green-600">${Number(payload[0].value).toLocaleString()}</p>
                </div>
              ) : null} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#ag)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Acumulado</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(() => { let a = 0; return revenueData.map(d => ({ ...d, cum: (a += Number(d.revenue)) })); })()} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
                  <p className="text-[var(--color-on-surface-variant)] text-xs mb-1">{label}</p><p className="font-headline font-semibold text-green-600">Acumulado: ${Number(payload[0].value).toLocaleString()}</p>
                </div>
              ) : null} />
              <Bar dataKey="cum" fill={GOLD} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[var(--color-warm-gray)]/40 lg:col-span-2">
          <div className="p-8 border-b border-[var(--color-warm-gray)]/40 flex items-center justify-between">
            <h2 className="font-headline text-lg text-[var(--color-near-black)]">Detalle de Ingresos</h2>
            <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">{revenueData.length} días</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-warm-gray)]/40">
                  <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Fecha</th>
                  <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Pedidos</th>
                  <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Ingresos</th>
                  <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {(() => { let a = 0; return revenueData.map(d => { a += Number(d.revenue); return (
                  <tr key={d.day} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                    <td className="p-5 font-inter text-sm">{d.day}</td>
                    <td className="p-5 text-right font-inter text-sm">{d.orders}</td>
                    <td className="p-5 text-right font-headline text-sm font-semibold text-green-600">${Number(d.revenue).toLocaleString()}</td>
                    <td className="p-5 text-right font-headline text-sm font-semibold">${a.toLocaleString()}</td>
                  </tr>
                ); }); })()}
                {revenueData.length === 0 && <tr><td colSpan={4} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">Sin datos</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
