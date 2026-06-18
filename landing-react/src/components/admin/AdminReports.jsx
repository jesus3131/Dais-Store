import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6', '#eab308'];

const DATA_SOURCES = [
  { id: 'salesDaily', label: 'Ventas Diarias', group: 'sales', icon: 'bar_chart' },
  { id: 'salesWeekly', label: 'Ventas Semanales', group: 'sales', icon: 'bar_chart' },
  { id: 'salesMonthly', label: 'Ventas Mensuales', group: 'sales', icon: 'bar_chart' },
  { id: 'salesAnnual', label: 'Ventas Anuales', group: 'sales', icon: 'bar_chart' },
  { id: 'salesByDayOfWeek', label: 'Ventas por Día Semana', group: 'sales', icon: 'calendar_view_week' },
  { id: 'salesByHour', label: 'Ventas por Hora', group: 'sales', icon: 'schedule' },
  { id: 'salesByCategory', label: 'Ventas por Categoría', group: 'sales', icon: 'category' },
  { id: 'monthOverMonth', label: 'Comparativa Mensual', group: 'sales', icon: 'trending_up' },
  { id: 'aovTrend', label: 'Ticket Promedio', group: 'financial', icon: 'payments' },
  { id: 'discountAnalysis', label: 'Análisis Descuentos', group: 'financial', icon: 'money_off' },
  { id: 'orderValueDist', label: 'Distribución por Valor', group: 'financial', icon: 'account_balance' },
  { id: 'topProducts', label: 'Productos Más Vendidos', group: 'products', icon: 'inventory_2' },
  { id: 'productCategories', label: 'Cant. por Categoría', group: 'products', icon: 'category' },
  { id: 'priceDistribution', label: 'Distribución Precios', group: 'products', icon: 'attach_money' },
  { id: 'ordersByStatus', label: 'Pedidos por Estado', group: 'orders', icon: 'receipt_long' },
  { id: 'customerNew', label: 'Clientes Nuevos', group: 'customers', icon: 'person_add' },
  { id: 'topCustomers', label: 'Top Clientes', group: 'customers', icon: 'people' },
  { id: 'repeatPurchase', label: 'Recompra', group: 'customers', icon: 'repeat' },
  { id: 'customersByCity', label: 'Clientes por Ciudad', group: 'customers', icon: 'location_on' },
  { id: 'inventorySummary', label: 'Resumen Inventario', group: 'inventory', icon: 'inventory' },
  { id: 'inventoryValue', label: 'Valor por Producto', group: 'inventory', icon: 'price_check' },
];

const DATA_SOURCE_GROUPS = [
  { id: 'sales', label: '📊 Ventas' },
  { id: 'financial', label: '💰 Financiero' },
  { id: 'products', label: '📦 Productos' },
  { id: 'orders', label: '📋 Pedidos' },
  { id: 'customers', label: '👥 Clientes' },
  { id: 'inventory', label: '🏪 Inventario' },
];

const CHART_TYPES = [
  { id: 'bar', label: 'Barras', icon: 'bar_chart' },
  { id: 'line', label: 'Línea', icon: 'show_chart' },
  { id: 'area', label: 'Área', icon: 'area_chart' },
  { id: 'pie', label: 'Pastel', icon: 'pie_chart' },
];

function isPieCompatible(s) {
  return ['ordersByStatus', 'productCategories', 'orderValueDist', 'priceDistribution', 'salesByDayOfWeek', 'salesByCategory', 'customersByCity', 'repeatPurchase'].includes(s);
}
function needsDateRange(s) {
  return !['inventorySummary', 'inventoryValue', 'productCategories', 'priceDistribution', 'orderValueDist', 'topCustomers', 'repeatPurchase', 'customersByCity', 'yearOverYear'].includes(s);
}
function getDetailEndpoint(s) {
  const map = {
    salesDaily: 'getReportSalesDetail', salesWeekly: 'getReportSalesDetail', salesMonthly: 'getReportSalesDetail', salesAnnual: 'getReportSalesDetail',
    topProducts: 'getReportProductDetail',
    ordersByStatus: 'getReportOrderDetail',
    orderValueDist: 'getReportFinancialDetail',
    discountAnalysis: 'getReportFinancialDetail',
    customersByCity: 'getReportCustomerDetail',
    topCustomers: 'getReportCustomerDetail',
    customerNew: 'getReportCustomerDetail',
    repeatPurchase: 'getReportCustomerDetail',
    inventorySummary: 'getReportInventoryDetail',
    inventoryValue: 'getReportInventoryDetail',
  };
  return map[s] || null;
}

const MONEY_KEYS = new Set([
  'revenue', 'total_revenue', 'gross_revenue', 'net_revenue',
  'total_spent', 'stock_value', 'total_discounts', 'avg_discount',
  'avg_order_value', 'price', 'total',
]);
const PCT_KEYS = new Set(['growth_pct', 'pct_discounted', 'repeat_rate', 'revenue_pct', 'value_pct']);

const LABEL_ES = {
  revenue: 'Ingresos', orders: 'Pedidos', count: 'Cantidad', total_qty: 'Vendidos',
  total_spent: 'Gasto Total', stock_value: 'Valor Inventario', avg_order_value: 'Ticket Prom.',
  total_discounts: 'Descuentos', discounted_orders: 'Pedidos con desc.', avg_discount: 'Desc. Prom.',
  pct_discounted: '% Descontado', total_orders: 'Total Pedidos', total_revenue: 'Ingresos',
  growth_pct: 'Crecimiento', products: 'Productos', total_stock: 'Stock Total', stock: 'Stock',
  repeat_customers: 'Clientes Recurrentes', one_time_customers: 'Una Sola Compra',
  repeat_rate: 'Tasa Recompra', total_customers: 'Total Clientes', gross_revenue: 'Ingreso Bruto',
  net_revenue: 'Ingreso Neto', total_items: 'Unidades', products_with_stock: 'Con Stock',
  out_of_stock: 'Sin Stock', low_stock: 'Stock Bajo', price: 'Precio',
};

const STATUS_ES = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
const DAY_ES = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };

function esLabel(key) { return LABEL_ES[key] || key.replace(/_/g, ' '); }
function esStatus(s) { return STATUS_ES[s] || s; }
function esDay(d) { const key = (d || '').trim().toLowerCase(); return DAY_ES[key] || d; }
function fmtVal(key, val) {
  if (val == null || val === '—') return '—';
  const n = Number(val);
  if (isNaN(n)) return val;
  if (PCT_KEYS.has(key)) return `${n}%`;
  if (MONEY_KEYS.has(key)) return `$${n.toLocaleString()}`;
  return n.toLocaleString();
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-5 py-4 shadow-lg border border-gray-100 font-inter text-sm">
      <p className="text-gray-400 mb-1 text-xs">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-headline font-semibold">
          {esLabel(entry.name)}: {fmtVal(entry.name, entry.value)}
        </p>
      ))}
    </div>
  );
};

function fmt(n) { return Number(n || 0).toLocaleString(); }
function fmt$(n) { return `$${Number(n || 0).toLocaleString()}`; }
function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function KpiCard({ label, value, sub, icon, color }) {
  return (
    <div className="bg-white border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400">{label}</p>
        <p className="font-headline text-xl font-semibold text-[var(--color-near-black)]">{value}</p>
        {sub && <p className="font-inter text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="font-inter text-[11px] text-gray-500">{label}</span>
      <span className="font-headline text-xs font-semibold" style={{ color: color || 'var(--color-near-black)' }}>{value}</span>
    </div>
  );
}

const BARKEY_MAP = {
  salesDaily: ['revenue', 'orders'], salesWeekly: ['revenue', 'orders'],
  salesMonthly: ['revenue', 'orders'], salesAnnual: ['revenue', 'orders'],
  salesByHour: ['revenue', 'orders'], salesByDayOfWeek: ['revenue', 'orders'],
  salesByCategory: ['count', 'revenue'],
  monthOverMonth: ['revenue', 'orders'], aovTrend: ['avg_order_value'],
  discountAnalysis: ['total_discounts', 'avg_discount'],
  topProducts: ['total_qty'], productCategories: ['count'],
  priceDistribution: ['count'], ordersByStatus: ['count', 'revenue'],
  orderValueDist: ['count', 'revenue'], customerNew: ['count'],
  topCustomers: ['total_spent'], repeatPurchase: ['repeat_rate'],
  customersByCity: ['count'], inventorySummary: ['total_stock', 'stock_value'],
  inventoryValue: ['stock', 'stock_value'],
};

function ChartRenderer({ data, chartType, dataSource, colors }) {
  const raw = Array.isArray(data) ? data : (data ? [data] : []);
  if (!raw.length) return <p className="font-inter text-sm text-gray-400 text-center py-10">Sin datos</p>;
  const isPie = chartType === 'pie';

  if (isPie) {
    const r0 = raw[0];
    const nameKey = r0.name !== undefined ? 'name' : r0.status !== undefined ? 'status' : r0.range !== undefined ? 'range' : r0.category !== undefined ? 'category' : r0.day_name !== undefined ? 'day_name' : 'name';
    const valKey = r0.count !== undefined ? 'count' : r0.revenue !== undefined ? 'revenue' : r0.total_qty !== undefined ? 'total_qty' : r0.total_stock !== undefined ? 'total_stock' : r0.stock_value !== undefined ? 'stock_value' : r0.products !== undefined ? 'products' : 'count';
    const displayData = raw.map(d => {
      const rawName = d[nameKey] || '—';
      return { ...d, _name: nameKey === 'status' ? esStatus(rawName) : nameKey === 'day_name' ? esDay(rawName) : rawName, _val: Number(d[valKey]) || 0 };
    });
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart><Pie data={displayData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="_val" nameKey="_name">
          {displayData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie><Tooltip content={<CustomTooltip />} />
          <Legend formatter={(v) => <span className="font-inter text-[10px] text-gray-500">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const r0 = raw[0];
  const xKey = r0.date ? 'date' : r0.day ? 'day' : r0.label ? 'label' : r0.hour !== undefined ? 'hour' : r0.day_name ? 'day_name' : r0.name ? 'name' : r0.range ? 'range' : r0.category ? 'category' : 'name';
  const barKeys = BARKEY_MAP[dataSource] || ['count'];

  const ChartComp = chartType === 'area' ? AreaChart : chartType === 'line' ? LineChart : BarChart;
  const xFmt = v => {
    if (!v || v === '—') return '';
    if (xKey === 'day_name') return esDay(v).slice(0, 3);
    if (xKey === 'hour') return `${v}:00`;
    const s = String(v);
    if (s.length > 10) return s.slice(5, 10);
    return s.slice(0, 12);
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ChartComp data={raw} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>{barKeys.map(k => (
          <linearGradient key={k} id={`g-${dataSource}-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[0]} stopOpacity={0.25}/><stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
          </linearGradient>
        ))}</defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)"/>
        <XAxis dataKey={xKey} tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={xFmt}/>
        <YAxis tick={{fontSize:10,fill:'#9ca3af'}} tickFormatter={v => typeof v==='number'&&v>1000?`${(v/1000).toFixed(1)}K`:String(v)}/>
        <Tooltip content={<CustomTooltip/>}/>
        <Legend formatter={v=><span className="font-inter text-[10px] text-gray-500">{esLabel(v)}</span>}/>
        {barKeys.map((key,i) => {
          const Comp = chartType === 'area' ? Area : chartType === 'line' ? Line : Bar;
          return <Comp key={key} dataKey={key} fill={colors[i%colors.length]} stroke={colors[i%colors.length]}
            radius={[2,2,0,0]} name={esLabel(key)}/>;
        })}
      </ChartComp>
    </ResponsiveContainer>
  );
}

// ── Detail panels per category ─────────────────────────

function SalesDetail({ data, detail }) {
  if (!data?.length && !detail) return null;
  const summary = detail?.summary;
  const bestDay = detail?.bestDay;
  const totalRev = data?.reduce((s, d) => s + Number(d.revenue || 0), 0) || 0;
  const totalOrd = data?.reduce((s, d) => s + Number(d.orders || 0), 0) || 0;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">📋 Detalle de Ventas</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Ingresos</p><p className="font-headline text-sm font-semibold text-[var(--color-near-black)]">{fmt$(summary?.total_revenue || totalRev)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Pedidos</p><p className="font-headline text-sm font-semibold text-[var(--color-near-black)]">{fmt(summary?.total_orders || totalOrd)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Ticket Prom.</p><p className="font-headline text-sm font-semibold text-[var(--color-near-black)]">{fmt$(summary?.avg_order_value)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Mejor día</p><p className="font-headline text-sm font-semibold text-green-600">{bestDay ? `${fmt$(bestDay.revenue)} (${bestDay.orders} pedidos)` : '—'}</p></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Mínimo</p><p className="font-headline text-xs font-semibold">{fmt$(summary?.min_order)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Máximo</p><p className="font-headline text-xs font-semibold">{fmt$(summary?.max_order)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Entregados</p><p className="font-headline text-xs font-semibold text-green-600">{fmt(summary?.delivered_count)} ({pct(summary?.delivered_count, summary?.total_orders)}%)</p></div>
      </div>
      {data && data.length > 0 && (
        <div className="mt-3 max-h-32 overflow-y-auto">
          <table className="w-full text-[10px] font-inter">
            <thead><tr className="text-gray-400 uppercase tracking-wider">
              <th className="text-left py-1 pr-2">Período</th>
              <th className="text-right px-2">Pedidos</th>
              <th className="text-right pl-2">Ingresos</th>
            </tr></thead>
            <tbody>
              {data.slice(-12).map((d, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="py-1 pr-2 text-gray-500">{d.date?.slice(0,10) || d.day_name || d.label || `#${i+1}`}</td>
                  <td className="text-right px-2 text-gray-700">{fmt(d.orders)}</td>
                  <td className="text-right pl-2 text-[var(--color-near-black)] font-semibold">{fmt$(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductDetail({ data, detail }) {
  if (!data?.length && !detail?.products?.length) return null;
  const products = detail?.products || data || [];
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">
        📋 Detalle Productos · {products.length} productos · {fmt$(detail?.totalRevenue)} total
      </p>
      <div className="max-h-48 overflow-y-auto">
        <table className="w-full text-[10px] font-inter">
          <thead><tr className="text-gray-400 uppercase tracking-wider sticky top-0 bg-white">
            <th className="text-left py-1 pr-2 w-6">#</th>
            <th className="text-left py-1 pr-2">Producto</th>
            <th className="text-right px-2">Cant.</th>
            <th className="text-right px-2">Precio Prom.</th>
            <th className="text-right px-2">Ingresos</th>
            <th className="text-right pl-2">%</th>
          </tr></thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="py-1 pr-2 text-gray-400">{i + 1}</td>
                <td className="py-1 pr-2 text-gray-700 max-w-[120px] truncate">{p.name}</td>
                <td className="text-right px-2 text-gray-700">{fmt(p.total_qty)}</td>
                <td className="text-right px-2 text-gray-500">{fmt$(p.avg_price || p.total_revenue / p.total_qty)}</td>
                <td className="text-right px-2 text-[var(--color-near-black)] font-semibold">{fmt$(p.total_revenue)}</td>
                <td className="text-right pl-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${(p.revenue_pct || 0) >= 20 ? 'bg-green-100 text-green-700' : (p.revenue_pct || 0) >= 10 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.revenue_pct || pct(p.total_revenue, detail?.totalRevenue) || 0}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerDetail({ data, detail }) {
  if (!detail) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">📋 Detalle Clientes</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Total Clientes</p><p className="font-headline text-sm font-semibold">{fmt(detail.totalCustomers)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Clientes Únicos</p><p className="font-headline text-sm font-semibold text-blue-600">{fmt(detail.uniqueCustomers)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Pedidos Período</p><p className="font-headline text-sm font-semibold">{fmt(detail.periodOrders)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Recompra</p><p className="font-headline text-sm font-semibold text-green-600">{fmt(detail.returningOrders)} pedidos</p></div>
      </div>
      {detail.topCustomers?.length > 0 && (
        <>
          <p className="font-inter text-[9px] uppercase text-gray-400 mb-2">🏆 Top Clientes</p>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-[10px] font-inter">
              <thead><tr className="text-gray-400 uppercase tracking-wider">
                <th className="text-left py-1 pr-2">Nombre</th>
                <th className="text-left px-2">Ciudad</th>
                <th className="text-right px-2">Pedidos</th>
                <th className="text-right pl-2">Gasto Total</th>
              </tr></thead>
              <tbody>
                {detail.topCustomers.map((c, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-1 pr-2 text-gray-700 max-w-[100px] truncate">{c.name || c.email || '—'}</td>
                    <td className="px-2 text-gray-400">{c.city || '—'}</td>
                    <td className="text-right px-2 text-gray-700">{fmt(c.total_orders)}</td>
                    <td className="text-right pl-2 text-[var(--color-near-black)] font-semibold">{fmt$(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function InventoryDetail({ data, detail }) {
  if (!data && !detail) return null;
  const s = detail?.summary;
  if (!s) {
    const cats = data || [];
    const totalVal = cats.reduce((a, c) => a + Number(c.stock_value || 0), 0);
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">📋 Inventario</p>
        <div className="grid grid-cols-3 gap-2">
          {cats.map((c, i) => (
            <div key={i} className="bg-gray-50 p-2 rounded text-center">
              <p className="font-inter text-[8px] uppercase text-gray-400">{c.category}</p>
              <p className="font-headline text-xs font-semibold">{fmt(c.total_stock)}</p>
              <p className="font-inter text-[9px] text-gray-400">{fmt$(c.stock_value)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">📋 Detalle Inventario</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Valor Total</p><p className="font-headline text-sm font-semibold">{fmt$(s.total_value)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Items</p><p className="font-headline text-sm font-semibold">{fmt(s.total_items)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Productos</p><p className="font-headline text-sm font-semibold">{fmt(s.total_products)}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Stock Bajo</p><p className="font-headline text-sm font-semibold" style={{ color: (s.low_stock || 0) > 0 ? '#ef4444' : '#22c55e' }}>{fmt(s.low_stock)}</p></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-green-50 p-2 rounded text-center"><p className="font-inter text-[8px] uppercase text-green-600">Con Stock</p><p className="font-headline text-sm font-semibold text-green-700">{fmt(s.products_with_stock)}</p></div>
        <div className="bg-red-50 p-2 rounded text-center"><p className="font-inter text-[8px] uppercase text-red-600">Sin Stock</p><p className="font-headline text-sm font-semibold text-red-600">{fmt(s.out_of_stock)}</p></div>
        <div className="bg-yellow-50 p-2 rounded text-center"><p className="font-inter text-[8px] uppercase text-yellow-600">Stock Bajo</p><p className="font-headline text-sm font-semibold text-yellow-600">{fmt(s.low_stock)}</p></div>
      </div>
      {detail?.categories?.length > 0 && (
        <div className="max-h-36 overflow-y-auto">
          <table className="w-full text-[10px] font-inter">
            <thead><tr className="text-gray-400 uppercase tracking-wider">
              <th className="text-left py-1 pr-2">Categoría</th>
              <th className="text-right px-2">Prod.</th>
              <th className="text-right px-2">Stock</th>
              <th className="text-right px-2">Valor</th>
              <th className="text-right pl-2">%</th>
            </tr></thead>
            <tbody>
              {detail.categories.map((c, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="py-1 pr-2 text-gray-700">{c.category}</td>
                  <td className="text-right px-2 text-gray-500">{fmt(c.products)}</td>
                  <td className="text-right px-2 text-gray-700">{fmt(c.total_stock)}</td>
                  <td className="text-right px-2 text-[var(--color-near-black)] font-semibold">{fmt$(c.stock_value)}</td>
                  <td className="text-right pl-2">{c.value_pct ? `${c.value_pct}%` : `${pct(c.stock_value, s.total_value)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail?.lowStockItems?.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 rounded">
          <p className="font-inter text-[9px] uppercase text-red-600 mb-2">⚠️ Productos con Stock Bajo</p>
          <div className="max-h-28 overflow-y-auto">
            <table className="w-full text-[10px] font-inter">
              <thead><tr className="text-red-400 uppercase tracking-wider">
                <th className="text-left py-1 pr-2">Producto</th>
                <th className="text-right px-2">Stock</th>
                <th className="text-right px-2">Mínimo</th>
                <th className="text-right pl-2">Estado</th>
              </tr></thead>
              <tbody>
                {detail.lowStockItems.map((item, i) => (
                  <tr key={i} className="border-t border-red-100">
                    <td className="py-1 pr-2 text-red-800 max-w-[120px] truncate">{item.name}</td>
                    <td className="text-right px-2 text-red-700">{fmt(item.quantity)}</td>
                    <td className="text-right px-2 text-red-400">{fmt(item.min_stock)}</td>
                    <td className="text-right pl-2">
                      <span className="px-1 py-0.5 bg-red-200 text-red-800 rounded text-[8px] font-bold">{item.stock_status_pct || 0}%</span>
                    </td>
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

function FinancialDetail({ data, detail }) {
  if (!detail) return null;
  const r = detail.revenue;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">📋 Detalle Financiero</p>
      {r && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Ingreso Bruto</p><p className="font-headline text-sm font-semibold">{fmt$(r.gross_revenue)}</p></div>
          <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Descuentos</p><p className="font-headline text-sm font-semibold text-red-500">{fmt$(r.total_discounts)}</p></div>
          <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Ingreso Neto</p><p className="font-headline text-sm font-semibold text-green-600">{fmt$(r.net_revenue)}</p></div>
          <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Ticket Prom.</p><p className="font-headline text-sm font-semibold">{fmt$(r.avg_order_value)}</p></div>
          <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Desc. Promedio</p><p className="font-headline text-sm font-semibold">{fmt$(r.avg_discount)}</p></div>
          <div className="bg-gray-50 p-3 rounded"><p className="font-inter text-[9px] uppercase text-gray-400">Total Pedidos</p><p className="font-headline text-sm font-semibold">{fmt(r.total_orders)}</p></div>
        </div>
      )}
      {detail.orderValues?.length > 0 && (
        <>
          <p className="font-inter text-[9px] uppercase text-gray-400 mb-2">Distribución por Valor</p>
          <div className="max-h-36 overflow-y-auto">
            <table className="w-full text-[10px] font-inter">
              <thead><tr className="text-gray-400 uppercase tracking-wider">
                <th className="text-left py-1 pr-2">Rango</th>
                <th className="text-right px-2">Pedidos</th>
                <th className="text-right px-2">Ingresos</th>
                <th className="text-right pl-2">%</th>
              </tr></thead>
              <tbody>
                {detail.orderValues.map((v, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-1 pr-2 text-gray-700">{v.range}</td>
                    <td className="text-right px-2 text-gray-700">{fmt(v.count)}</td>
                    <td className="text-right px-2 text-[var(--color-near-black)] font-semibold">{fmt$(v.revenue)}</td>
                    <td className="text-right pl-2">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[8px]">{v.pct || pct(v.count, detail.orderValues.reduce((a, x) => a + Number(x.count), 0))}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function OrderDetailPanel({ data, detail }) {
  if (!detail) return null;
  const statuses = detail.byStatus || [];
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-gray-400 mb-3">📋 Detalle Pedidos</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        {statuses.map((s, i) => (
          <div key={i} className={`p-3 rounded text-center ${
            s.status === 'delivered' ? 'bg-green-50' : s.status === 'pending' ? 'bg-yellow-50' : s.status === 'shipped' ? 'bg-blue-50' : s.status === 'cancelled' ? 'bg-red-50' : 'bg-gray-50'
          }`}>
            <p className="font-inter text-[8px] uppercase tracking-wider text-gray-400">{esStatus(s.status) || '—'}</p>
            <p className="font-headline text-sm font-semibold">{fmt(s.count)}</p>
            <p className="font-inter text-[9px] text-gray-400">{fmt$(s.revenue)}</p>
            <p className="font-inter text-[8px] text-gray-400">{s.pct || pct(s.count, statuses.reduce((a, x) => a + Number(x.count), 0))}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Widget detail router ───────────────────────────────

function WidgetDetailPanel({ widget, data, detail }) {
  const group = DATA_SOURCES.find(s => s.id === widget.dataSource)?.group;
  switch (group) {
    case 'sales': return <SalesDetail data={data} detail={detail} />;
    case 'products': return <ProductDetail data={data} detail={detail} />;
    case 'customers': return <CustomerDetail data={data} detail={detail} />;
    case 'inventory': return <InventoryDetail data={data} detail={detail} />;
    case 'financial': return <FinancialDetail data={data} detail={detail} />;
    case 'orders': return <OrderDetailPanel data={data} detail={detail} />;
    default: return null;
  }
}

function AnalysisPanel({ analysis, expanded, onToggle }) {
  if (!analysis?.analysis) return null;
  const text = analysis.analysis;
  const ins = analysis.insights || {};
  const insightEntries = Object.entries(ins).filter(([k]) => !['total_revenue','total_orders'].includes(k) || ins.total_revenue != null).slice(0, 6);
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={onToggle} className="flex items-center gap-1.5 text-[10px] font-inter uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
        <span className="material-symbols-outlined text-[14px]">{expanded ? 'expand_less' : 'info'}</span>
        Análisis con Pandas
      </button>
      {expanded && (
          <div className="mt-2" style={{animation:'fadeIn .2s ease'}}>
          <p className="font-inter text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{text.replace(/\*\*/g, '').replace(/\*/g, '')}</p>
          {Object.keys(ins).length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {insightEntries.map(([k, v]) => (
                <span key={k} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-inter font-medium">
                  {k.replace(/_/g, ' ')}: {v ?? '—'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function genId() { return `w${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const DEFAULT_WIDGETS = [
  { id: genId(), dataSource: 'salesMonthly', chartType: 'bar', title: 'Ventas Mensuales' },
  { id: genId(), dataSource: 'salesByDayOfWeek', chartType: 'bar', title: 'Ventas por Día de la Semana' },
  { id: genId(), dataSource: 'topProducts', chartType: 'bar', title: 'Productos Más Vendidos' },
  { id: genId(), dataSource: 'ordersByStatus', chartType: 'pie', title: 'Pedidos por Estado' },
  { id: genId(), dataSource: 'aovTrend', chartType: 'line', title: 'Evolución Ticket Promedio' },
  { id: genId(), dataSource: 'inventorySummary', chartType: 'pie', title: 'Stock por Categoría' },
];

export default function AdminReports() {
  const { addToast } = useToast();
  const [widgets, setWidgets] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('report_widgets')) || DEFAULT_WIDGETS; }
    catch { return DEFAULT_WIDGETS; }
  });
  const [chartData, setChartData] = useState({});
  const [detailData, setDetailData] = useState({});
  const [analysisData, setAnalysisData] = useState({});
  const [expandedAnalysis, setExpandedAnalysis] = useState({});
  const [loading, setLoading] = useState({});
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addSource, setAddSource] = useState('salesMonthly');
  const [addChart, setAddChart] = useState('bar');
  const [addTitle, setAddTitle] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [kpi, setKpi] = useState(null);

  useEffect(() => { sessionStorage.setItem('report_widgets', JSON.stringify(widgets)); }, [widgets]);

  useEffect(() => {
    const p = {};
    if (fromDate) p.from = fromDate;
    if (toDate) p.to = toDate;
    api.getReportKpiSummary(p).then(setKpi).catch(() => {});
  }, [fromDate, toDate]);

  const loadWidget = useCallback(async (w) => {
    setLoading(l => ({ ...l, [w.id]: true }));
    try {
      const p = {};
      if (fromDate && needsDateRange(w.dataSource)) p.from = fromDate;
      if (toDate && needsDateRange(w.dataSource)) p.to = toDate;

      let data, detail;
      const ds = w.dataSource;
      switch (ds) {
        case 'salesDaily': p.period = 'daily'; data = await api.getReportSales(p); break;
        case 'salesWeekly': p.period = 'weekly'; data = await api.getReportSales(p); break;
        case 'salesMonthly': p.period = 'monthly'; data = await api.getReportSales(p); break;
        case 'salesAnnual': p.period = 'annual'; data = await api.getReportSales(p); break;
        case 'salesByDayOfWeek': data = await api.getReportSalesByDay(p); break;
        case 'salesByHour': data = await api.getReportSalesByHour(p); break;
        case 'salesByCategory': data = await api.getReportSalesByCategory(p); break;
        case 'monthOverMonth': data = await api.getReportMonthOverMonth(p); break;
        case 'aovTrend': p.period = 'monthly'; data = await api.getReportAovTrend(p); break;
        case 'discountAnalysis': data = await api.getReportDiscountAnalysis(p); break;
        case 'topProducts': data = await api.getReportTopProducts({ ...p, limit: 10 }); break;
        case 'productCategories': data = await api.getReportProductCategories(); break;
        case 'priceDistribution': data = await api.getReportPriceDistribution(); break;
        case 'ordersByStatus': data = await api.getReportOrdersByStatus(p); break;
        case 'orderValueDist': data = await api.getReportOrderValueDistribution(); break;
        case 'customerNew': data = await api.getReportCustomerStats(p); break;
        case 'topCustomers': data = await api.getReportTopCustomers({ limit: 10 }); break;
        case 'repeatPurchase': data = await api.getReportRepeatPurchase(); break;
        case 'customersByCity': data = await api.getReportCustomersByCity(); break;
        case 'inventorySummary': data = await api.getReportInventorySummary(); break;
        case 'inventoryValue': data = await api.getReportInventoryValue({ limit: 10 }); break;
        default: data = [];
      }

      // Fetch detail if available
      const detailEp = getDetailEndpoint(ds);
      if (detailEp) {
        try {
          let dp = {};
          if (['salesDaily','salesWeekly','salesMonthly','salesAnnual'].includes(ds)) dp = { ...p, period: p.period || 'monthly' };
          else if (['topProducts','ordersByStatus','orderValueDist','discountAnalysis'].includes(ds)) dp = p;
          detail = await api[detailEp](dp);
        } catch {}
      }

      // Normalize data for chart rendering
      let chartDataNormalized = data;
      if (ds === 'inventorySummary' && data?.categories) chartDataNormalized = data.categories;
      else if (ds === 'discountAnalysis') chartDataNormalized = data ? [data] : [];
      else if (ds === 'customerNew') chartDataNormalized = data?.newByDay || [];
      else if (ds === 'repeatPurchase') chartDataNormalized = data ? [{ label: 'General', ...data }] : [];
      else if (!Array.isArray(chartDataNormalized)) chartDataNormalized = chartDataNormalized ? [chartDataNormalized] : [];

      setChartData(d => ({ ...d, [w.id]: chartDataNormalized }));
      if (detail) setDetailData(d => ({ ...d, [w.id]: detail }));

      // Fetch pandas analysis
      try {
        const ap = {};
        if (fromDate) ap.from_date = fromDate;
        if (toDate) ap.to_date = toDate;
        if (['salesDaily','salesWeekly','salesMonthly','salesAnnual','aovTrend'].includes(ds)) ap.period = p.period || 'monthly';
        if (['topProducts','inventoryValue','topCustomers'].includes(ds)) ap.limit = 10;
        const analysisResult = await api.getReportAnalysis(ds, ap);
        setAnalysisData(d => ({ ...d, [w.id]: analysisResult }));
      } catch {}
    } catch (err) {
      addToast(`Error al cargar ${w.title}`, 'error');
    } finally {
      setLoading(l => ({ ...l, [w.id]: false }));
    }
  }, [fromDate, toDate, addToast]);

  useEffect(() => { widgets.forEach(w => loadWidget(w)); }, [widgets]);
  useEffect(() => { if (fromDate || toDate) widgets.forEach(w => loadWidget(w)); }, [fromDate, toDate]);

  const addWidget = () => {
    const source = DATA_SOURCES.find(s => s.id === addSource);
    setWidgets(w => [...w, { id: genId(), dataSource: addSource, chartType: addChart, title: addTitle || source?.label || addSource }]);
    setShowAddPanel(false);
    setAddTitle('');
  };

  const removeWidget = (id) => {
    setWidgets(w => w.filter(x => x.id !== id));
    setChartData(d => { const n = { ...d }; delete n[id]; return n; });
    setDetailData(d => { const n = { ...d }; delete n[id]; return n; });
  };

  const updateWidget = (id, field, value) => {
    setWidgets(w => w.map(x => x.id === id ? { ...x, [field]: value } : x));
    if (field !== 'title') { setChartData(d => { const n = { ...d }; delete n[id]; return n; }); setDetailData(d => { const n = { ...d }; delete n[id]; return n; }); }
  };

  const resetDefaults = () => {
    setWidgets(DEFAULT_WIDGETS.map(w => ({ ...w, id: genId() })));
    setChartData({});
    setDetailData({});
    addToast('Panel restaurado');
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Reportes</h1>
          <p className="font-inter text-sm text-gray-400 mt-1">
            {widgets.length} gráficos · {fromDate || toDate ? `${fromDate || '—'} al ${toDate || 'hoy'}` : 'Todos los datos'}
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded p-1.5">
            <span className="material-symbols-outlined text-[16px] text-gray-400">calendar_today</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-auto text-xs font-inter border-0 focus:outline-none py-0.5" />
            <span className="text-gray-300">—</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-auto text-xs font-inter border-0 focus:outline-none py-0.5" />
          </div>
          <button onClick={resetDefaults}
            className="text-xs font-inter text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-100 rounded hover:border-gray-200 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>Restaurar
          </button>
          <button onClick={() => setShowAddPanel(true)}
            className="text-xs font-inter text-white bg-[var(--color-near-black)] px-4 py-1.5 rounded hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">add</span>Agregar Gráfico
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <KpiCard label="Ingresos" value={fmt$(kpi.total_revenue)} icon="payments" color="#6366f1"/>
          <KpiCard label="Pedidos" value={fmt(kpi.total_orders)} sub={`${kpi.delivered_orders} entregados`} icon="receipt_long" color="#22c55e"/>
          <KpiCard label="Ticket Prom." value={fmt$(kpi.avg_order_value)} icon="shopping_cart" color="#f59e0b"/>
          <KpiCard label="Pendientes" value={fmt(kpi.pending_orders)} icon="pending" color="#f97316"/>
          <KpiCard label="Descuentos" value={fmt$(kpi.total_discounts)} icon="money_off" color="#ef4444"/>
          <KpiCard label="Entregados" value={`${kpi.total_orders ? pct(kpi.delivered_orders, kpi.total_orders) : 0}%`} sub="tasa entrega" icon="check_circle" color="#14b8a6"/>
        </div>
      )}

      {/* Empty state */}
      {widgets.length === 0 && (
        <div className="text-center py-20 bg-white border border-gray-100">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">bar_chart</span>
          <p className="font-inter text-sm text-gray-400">No hay gráficos configurados</p>
          <button onClick={() => setShowAddPanel(true)} className="mt-4 text-sm font-inter text-white bg-[var(--color-near-black)] px-5 py-2 rounded hover:opacity-90">
            Agregar tu primer gráfico
          </button>
        </div>
      )}

      {/* Widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.map(w => {
          const source = DATA_SOURCES.find(s => s.id === w.dataSource);
          const data = chartData[w.id];
          const detail = detailData[w.id];
          const canPie = isPieCompatible(w.dataSource);
          const isDiscount = w.dataSource === 'discountAnalysis';

          return (
            <div key={w.id} className="bg-white border border-gray-100 p-6 hover:border-gray-200 transition-all">
              {/* Header controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-gray-300 flex-shrink-0">{source?.icon || 'bar_chart'}</span>
                  <h2 className="font-headline text-sm text-[var(--color-near-black)] truncate">{w.title}</h2>
                  <span className="px-2 py-0.5 bg-gray-50 text-[8px] font-inter uppercase tracking-wider text-gray-400 rounded flex-shrink-0">
                    {DATA_SOURCE_GROUPS.find(g => g.id === source?.group)?.label || source?.group}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <select value={w.dataSource} onChange={e => { updateWidget(w.id, 'dataSource', e.target.value); updateWidget(w.id, 'title', DATA_SOURCES.find(s => s.id === e.target.value)?.label || ''); }}
                    className="text-[10px] border border-gray-100 rounded py-1 px-2 font-inter bg-white focus:outline-none focus:border-gray-300 max-w-[110px]">
                    {DATA_SOURCE_GROUPS.map(g => (
                      <optgroup key={g.id} label={g.label}>
                        {DATA_SOURCES.filter(s => s.group === g.id).map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <select value={w.chartType} onChange={e => updateWidget(w.id, 'chartType', e.target.value)}
                    className="text-[10px] border border-gray-100 rounded py-1 px-2 font-inter bg-white focus:outline-none focus:border-gray-300">
                    {CHART_TYPES.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === 'pie' && !canPie}>{t.label}</option>
                    ))}
                  </select>
                  <button onClick={() => removeWidget(w.id)}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors rounded hover:bg-red-50" title="Eliminar">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              </div>

              {/* Loading / Content */}
              {loading[w.id] ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-[#6366f1] rounded-full" />
                </div>
              ) : (
                <>
                  {/* Chart */}
                  <ChartRenderer data={data} chartType={w.chartType} dataSource={w.dataSource} colors={COLORS} />
                  {/* Detail panel */}
                  <WidgetDetailPanel widget={w} data={data} detail={detail} />
                  {/* Pandas analysis */}
                  <AnalysisPanel analysis={analysisData[w.id]} expanded={expandedAnalysis[w.id]} onToggle={() => setExpandedAnalysis(d => ({ ...d, [w.id]: !d[w.id] }))} />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add widget modal */}
      {showAddPanel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowAddPanel(false)}>
          <div className="bg-white w-full max-w-lg mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">Nuevo Gráfico</h2>
              <button onClick={() => setShowAddPanel(false)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors rounded">
                <span className="material-symbols-outlined text-gray-400 text-[18px]">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-xs font-inter text-gray-500 mb-1.5 block">Título</label>
                <input value={addTitle} onChange={e => setAddTitle(e.target.value)}
                  className="w-full border border-gray-100 rounded px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-gray-300" placeholder="Ej: Ventas del último mes" />
              </div>
              <div>
                <label className="text-xs font-inter text-gray-500 mb-1.5 block">Datos</label>
                <select value={addSource} onChange={e => setAddSource(e.target.value)}
                  className="w-full border border-gray-100 rounded px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-gray-300 bg-white">
                  {DATA_SOURCE_GROUPS.map(g => (
                    <optgroup key={g.id} label={g.label}>
                      {DATA_SOURCES.filter(s => s.group === g.id).map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-inter text-gray-500 mb-1.5 block">Tipo de gráfico</label>
                <div className="grid grid-cols-4 gap-3">
                  {CHART_TYPES.map(t => {
                    const disabled = t.id === 'pie' && !isPieCompatible(addSource);
                    return (
                      <button key={t.id} type="button" onClick={() => !disabled && setAddChart(t.id)}
                        className={`flex flex-col items-center gap-1 p-4 border rounded transition-all ${addChart === t.id ? 'border-[#6366f1] bg-indigo-50' : 'border-gray-100 hover:border-gray-200'} ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <span className="material-symbols-outlined text-[22px] text-gray-400">{t.icon}</span>
                        <span className="font-inter text-[10px] text-gray-500">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-gray-100 flex justify-end gap-4">
              <button type="button" onClick={() => setShowAddPanel(false)}
                className="text-sm font-inter text-gray-500 px-5 py-2 border border-gray-100 rounded hover:border-gray-200 transition-colors">Cancelar</button>
              <button type="button" onClick={addWidget}
                className="text-sm font-inter text-white bg-[var(--color-near-black)] px-6 py-2 rounded hover:opacity-90 transition-opacity">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
