import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#d4af37', '#b8962e', '#e5c572', '#c9a77b', '#a67c52', '#7a5d3e'];
const GOLD = '#d4af37';
const GOLD_OPACITY = 'rgba(212, 175, 55, 0.15)';

export default function AdminReports() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.getOrderStats().then(setStats).catch(() => {}); }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border border-[var(--color-gold)] border-t-transparent" />
      </div>
    );
  }

  const revenueData = stats.revenueByDay || [];
  const topProducts = (stats.topProducts || []).map((p, i) => ({ ...p, fill: COLORS[i % COLORS.length] }));
  const statusData = [
    { name: 'Pendientes', value: stats.stats.pending_count, fill: '#f59e0b' },
    { name: 'Enviados', value: stats.stats.shipped_count, fill: '#3b82f6' },
    { name: 'Entregados', value: stats.stats.delivered_count, fill: '#22c55e' },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
        <p className="text-[var(--color-on-surface-variant)] mb-1 text-xs">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-headline font-semibold">${Number(entry.value).toLocaleString()}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Reportes</h1>
        <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Analítica y estadísticas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Ingresos (30 días)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GOLD_OPACITY} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke={GOLD} fill="url(#r1)" strokeWidth={2} name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Pedidos por Día</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GOLD_OPACITY} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8a8a8a' }} tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 10, fill: '#8a8a8a' }} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
                  <p className="text-[var(--color-on-surface-variant)] text-xs mb-1">{label}</p>
                  <p className="font-headline font-semibold text-[var(--color-near-black)]">{payload[0].value} pedidos</p>
                </div>
              ) : null} />
              <Bar dataKey="orders" fill={GOLD} radius={[2, 2, 0, 0]} name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Productos Más Vendidos</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GOLD_OPACITY} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8a8a8a' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#1c1b1b' }} width={120} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
                    <p className="font-headline font-semibold">{payload[0].payload.name}</p>
                    <p className="text-[var(--color-on-surface-variant)] text-xs mt-1">{payload[0].value} vendidos</p>
                    <p className="text-[var(--color-gold)] font-headline font-semibold mt-1">${Number(payload[0].payload.total_revenue).toLocaleString()}</p>
                  </div>
                ) : null} />
                <Bar dataKey="total_qty" name="Vendidos" radius={[0, 3, 3, 0]}>
                  {topProducts.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] text-center py-10">Sin datos aún</p>
          )}
        </div>

        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Estado de Pedidos</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name">
                  {statusData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-white px-5 py-4 shadow-luxury-lg border border-[var(--color-warm-gray)]/40 font-inter text-sm">
                    <p className="font-headline font-semibold">{payload[0].name}</p>
                    <p style={{ color: payload[0].color }} className="font-bold mt-1">{payload[0].value} pedidos</p>
                  </div>
                ) : null} />
                <Legend formatter={(value) => <span className="font-inter text-xs text-[var(--color-on-surface)]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] text-center py-10">Sin datos aún</p>
          )}
        </div>

        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 lg:col-span-2">
          <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Resumen General</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Total Pedidos', value: stats.stats.total_orders },
              { label: 'Ingresos Totales', value: `$${Number(stats.stats.total_revenue).toLocaleString()}` },
              { label: 'Valor Promedio', value: `$${Number(stats.stats.avg_order_value).toLocaleString()}` },
              { label: 'Pendientes', value: stats.stats.pending_count },
              { label: 'Enviados', value: stats.stats.shipped_count },
              { label: 'Entregados', value: stats.stats.delivered_count },
            ].map(row => (
              <div key={row.label} className="text-center p-5 bg-[var(--color-ivory)]">
                <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] mb-1.5">{row.label}</p>
                <p className="font-headline text-xl font-semibold text-[var(--color-near-black)]">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
