import { useState } from 'react';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminInventory } from '../components/admin/AdminInventory';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminReports } from '../components/admin/AdminReports';
import { AdminMessages } from '../components/admin/AdminMessages';
import { AdminCatalogs } from '../components/admin/AdminCatalogs';

const TABS = [
  { key: 'products', label: 'Productos' },
  { key: 'inventory', label: 'Inventario' },
  { key: 'orders', label: 'Despachos' },
  { key: 'reports', label: 'Reportes' },
  { key: 'messages', label: 'Mensajes' },
  { key: 'catalogs', label: 'Catálogos' },
  { key: 'settings', label: 'Config.' },
];

const COMPONENTS = {
  products: AdminProducts,
  inventory: AdminInventory,
  orders: AdminOrders,
  reports: AdminReports,
  messages: AdminMessages,
  catalogs: AdminCatalogs,
  settings: AdminSettings,
};

export default function Admin() {
  const [tab, setTab] = useState('products');
  const Component = COMPONENTS[tab];

  return (
    <div>
      <div style={{
        background: '#1A1A1A', padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 8,
        overflowX: 'auto', flexWrap: 'nowrap',
      }}>
        <h1 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 0, whiteSpace: 'nowrap', marginRight: 16 }}>
          Dais Store — Admin
        </h1>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '7px 16px', whiteSpace: 'nowrap',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#1A1A1A' : '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              borderRadius: 2, transition: '0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
        <a href="/" style={{ color: '#999', fontSize: '0.75rem', marginLeft: 'auto', whiteSpace: 'nowrap', textDecoration: 'none' }}>
          Ver sitio →
        </a>
      </div>
      <Component />
    </div>
  );
}
