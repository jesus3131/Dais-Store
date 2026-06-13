import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#b08d6a', '#8b6f50', '#d4a373', '#c9a77b', '#a67c52', '#7a5d3e'];

export default function AdminReports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getOrderStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-primary)] border-t-transparent" />
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
      <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-[var(--color-outline-variant)] font-manrope text-sm">
        <p className="text-[var(--color-outline)] mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: ${Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Reportes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Ingresos (30 días)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#colorRev)"
                strokeWidth={2} name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Pedidos por Día</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-outline)' }} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-[var(--color-outline-variant)] font-manrope text-sm">
                    <p className="text-[var(--color-outline)] mb-1">{label}</p>
                    <p className="font-semibold text-[var(--color-primary)]">{payload[0].value} pedidos</p>
                  </div>
                ) : null
              } />
              <Bar dataKey="orders" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Productos Más Vendidos</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-outline)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-on-surface)' }}
                  width={120} />
                <Tooltip content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-[var(--color-outline-variant)] font-manrope text-sm">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="text-[var(--color-outline)]">{payload[0].value} vendidos</p>
                      <p className="text-green-600 font-semibold">${Number(payload[0].payload.total_revenue).toFixed(2)}</p>
                    </div>
                  ) : null
                } />
                <Bar dataKey="total_qty" name="Vendidos" radius={[0, 4, 4, 0]}>
                  {topProducts.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="font-manrope text-[var(--color-outline)] py-10 text-center">Sin datos aún</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Estado de Pedidos</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={4} dataKey="value" nameKey="name">
                  {statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-[var(--color-outline-variant)] font-manrope text-sm">
                      <p className="font-semibold">{payload[0].name}</p>
                      <p style={{ color: payload[0].color }} className="font-bold">{payload[0].value} pedidos</p>
                    </div>
                  ) : null
                } />
                <Legend
                  formatter={(value, entry) => (
                    <span className="font-manrope text-sm text-[var(--color-on-surface)]">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="font-manrope text-[var(--color-outline)] py-10 text-center">Sin datos aún</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow lg:col-span-2">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Resumen General</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Total Pedidos', value: stats.stats.total_orders },
              { label: 'Ingresos Totales', value: `$${Number(stats.stats.total_revenue).toFixed(2)}` },
              { label: 'Valor Promedio', value: `$${Number(stats.stats.avg_order_value).toFixed(2)}` },
              { label: 'Pendientes', value: stats.stats.pending_count },
              { label: 'Enviados', value: stats.stats.shipped_count },
              { label: 'Entregados', value: stats.stats.delivered_count },
            ].map(row => (
              <div key={row.label} className="text-center p-4 rounded-lg bg-[var(--color-surface-container-low)]">
                <p className="font-manrope text-xs text-[var(--color-outline)] mb-1">{row.label}</p>
                <p className="font-headline text-xl font-bold text-[var(--color-on-surface)]">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
