import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

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

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Contabilidad</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Ingresos Totales', value: `$${totalCost.toFixed(2)}`, icon: 'payments', color: 'text-green-600' },
          { label: 'Pendientes por Cobrar', value: `$${pendingRevenue.toFixed(2)}`, icon: 'hourglass_bottom', color: 'text-amber-600' },
          { label: 'Entregados (Cobrados)', value: `$${deliveredRevenue.toFixed(2)}`, icon: 'check_circle', color: 'text-blue-600' },
        ].map(card => (
          <div key={card.label} className="bg-white p-6 rounded-xl luxury-shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              <p className="font-manrope text-xs text-[var(--color-outline)]">{card.label}</p>
            </div>
            <p className={`font-headline text-2xl ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {stats && stats.revenueByDay && (
        <div className="bg-white p-6 rounded-xl luxury-shadow">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Ingresos Diarios (últimos 30 días)</h2>
          <div className="overflow-x-auto">
            <table className="w-full font-manrope text-sm">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]">
                  <th className="text-left p-3 text-[var(--color-outline)] font-semibold">Fecha</th>
                  <th className="text-right p-3 text-[var(--color-outline)] font-semibold">Pedidos</th>
                  <th className="text-right p-3 text-[var(--color-outline)] font-semibold">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {stats.revenueByDay.map(d => (
                  <tr key={d.day} className="border-b border-[var(--color-outline-variant)] last:border-0 hover:bg-[var(--color-surface-container-high)]">
                    <td className="p-3 text-[var(--color-on-surface)]">{d.day}</td>
                    <td className="p-3 text-right text-[var(--color-on-surface)]">{d.orders}</td>
                    <td className="p-3 text-right font-semibold text-green-600">${Number(d.revenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
