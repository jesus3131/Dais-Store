import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

const COLORS = ['#1A1A1A', '#C9A96E', '#FCEAEB', '#e74c3c', '#3498db', '#2ecc71'];

export function AdminReports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getOrderStats().then(setData).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: 40 }}>Cargando reportes...</div>;

  const { stats, revenueByDay, topProducts } = data;

  const statusData = [
    { name: 'Pendientes', value: Number(stats.pending_count), color: '#f39c12' },
    { name: 'Enviados', value: Number(stats.shipped_count), color: '#3498db' },
    { name: 'Entregados', value: Number(stats.delivered_count), color: '#2ecc71' },
  ];

  const formatCurrency = (val) => `$${Number(val).toLocaleString('es-CO')}`;

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 32 }}>Reportes y Ganancias</h2>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Ingresos totales (30d)', value: formatCurrency(stats.total_revenue), bg: '#1A1A1A', color: '#fff' },
          { label: 'Pedidos totales', value: stats.total_orders, bg: '#FCEAEB', color: '#1A1A1A' },
          { label: 'Valor promedio por pedido', value: formatCurrency(stats.avg_order_value), bg: '#C9A96E', color: '#fff' },
          { label: 'Pendientes por despachar', value: stats.pending_count, bg: '#fff3cd', color: '#1A1A1A' },
        ].map((card, i) => (
          <div key={i} style={{ background: card.bg, color: card.color, padding: '24px 20px', borderRadius: 4 }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        {/* Revenue chart */}
        <div style={{ background: '#fff', padding: 24, border: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 16 }}>Ingresos diarios</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#1A1A1A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div style={{ background: '#fff', padding: 24, border: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 16 }}>Estado de pedidos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div style={{ background: '#fff', padding: 24, border: '1px solid #eee' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 16 }}>Productos más vendidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="total_revenue" fill="#C9A96E" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
