import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminReports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getOrderStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <p className="font-manrope text-[var(--color-outline)]">Cargando...</p>;

  const maxRev = Math.max(...(stats.revenueByDay?.map(d => d.revenue) || [0]));

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Reportes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Ingresos por Día</h2>
          <div className="space-y-1">
            {stats.revenueByDay?.slice(-14).map(d => (
              <div key={d.day} className="flex items-center gap-3 font-manrope text-xs">
                <span className="w-24 text-[var(--color-outline)]">{d.day.slice(5)}</span>
                <div className="flex-1 h-5 bg-[var(--color-surface-container-high)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${(d.revenue / (maxRev || 1)) * 100}%` }} />
                </div>
                <span className="w-20 text-right font-semibold text-[var(--color-on-surface)]">${Number(d.revenue).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Productos Más Vendidos</h2>
          <div className="space-y-4">
            {stats.topProducts?.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-full bg-[var(--color-primary-container)] text-[var(--color-primary)] flex items-center justify-center font-manrope text-xs font-bold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-manrope text-sm text-[var(--color-on-surface)] truncate">{p.name}</p>
                  <p className="font-manrope text-xs text-[var(--color-outline)]">{p.total_qty} vendidos · ${Number(p.total_revenue).toFixed(2)}</p>
                </div>
              </div>
            ))}
            {(!stats.topProducts || stats.topProducts.length === 0) && (
              <p className="font-manrope text-[var(--color-outline)]">Sin datos aún</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Resumen General</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Pedidos', value: stats.stats.total_orders },
              { label: 'Ingresos Totales', value: `$${Number(stats.stats.total_revenue).toFixed(2)}` },
              { label: 'Valor Promedio', value: `$${Number(stats.stats.avg_order_value).toFixed(2)}` },
              { label: 'Pendientes', value: stats.stats.pending_count },
              { label: 'Enviados', value: stats.stats.shipped_count },
              { label: 'Entregados', value: stats.stats.delivered_count },
            ].map(row => (
              <div key={row.label} className="flex justify-between font-manrope text-sm py-2 border-b border-[var(--color-outline-variant)] last:border-0">
                <span className="text-[var(--color-on-surface-variant)]">{row.label}</span>
                <span className="font-semibold text-[var(--color-on-surface)]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
