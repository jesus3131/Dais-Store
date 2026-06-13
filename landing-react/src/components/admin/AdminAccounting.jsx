import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function AdminAccounting() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.getOrderStats().then(setStats).catch(() => {});
    api.getOrders().then(setOrders).catch(() => {});
  }, []);

  const totalCost = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + Number(o.total), 0);
  const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrder = orders.length > 0 ? totalCost / orders.length : 0;

  const revenueData = stats?.revenueByDay || [];

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
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Contabilidad</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ingresos Totales', value: `$${totalCost.toFixed(2)}`, icon: 'payments', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pendientes por Cobrar', value: `$${pendingRevenue.toFixed(2)}`, icon: 'hourglass_bottom', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Cobrados (Entregados)', value: `$${deliveredRevenue.toFixed(2)}`, icon: 'check_circle', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Valor Promedio', value: `$${avgOrder.toFixed(2)}`, icon: 'trending_up', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} p-5 rounded-xl luxury-shadow`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              <p className="font-manrope text-xs text-[var(--color-outline)]">{card.label}</p>
            </div>
            <p className={`font-headline text-2xl ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Ingresos Diarios</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#accGrad)"
                strokeWidth={2} name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Acumulado de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(() => {
              let acc = 0;
              return revenueData.map(d => ({ ...d, cumulative: (acc += Number(d.revenue)) }));
            })()} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-outline)' }}
                tickFormatter={(v) => `$${v}`} />
              <Tooltip content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-[var(--color-outline-variant)] font-manrope text-sm">
                    <p className="text-[var(--color-outline)] mb-1">{label}</p>
                    <p className="font-semibold text-green-600">Acumulado: ${Number(payload[0].value).toLocaleString()}</p>
                  </div>
                ) : null
              } />
              <Bar dataKey="cumulative" fill="#22c55e" radius={[4, 4, 0, 0]} name="Acumulado" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow lg:col-span-2">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Detalle de Ingresos por Día</h2>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full font-manrope text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[var(--color-outline-variant)]">
                  <th className="text-left p-3 text-[var(--color-outline)] font-semibold">Fecha</th>
                  <th className="text-right p-3 text-[var(--color-outline)] font-semibold">Pedidos</th>
                  <th className="text-right p-3 text-[var(--color-outline)] font-semibold">Ingresos</th>
                  <th className="text-right p-3 text-[var(--color-outline)] font-semibold">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let acc = 0;
                  return revenueData.map(d => {
                    acc += Number(d.revenue);
                    return (
                      <tr key={d.day} className="border-b border-[var(--color-outline-variant)] last:border-0 hover:bg-[var(--color-surface-container-high)] transition-colors">
                        <td className="p-3 text-[var(--color-on-surface)]">{d.day}</td>
                        <td className="p-3 text-right text-[var(--color-on-surface)]">{d.orders}</td>
                        <td className="p-3 text-right font-semibold text-green-600">${Number(d.revenue).toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold text-[var(--color-on-surface)]">${acc.toFixed(2)}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            {revenueData.length === 0 && (
              <p className="text-center py-8 font-manrope text-[var(--color-outline)]">Sin datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
