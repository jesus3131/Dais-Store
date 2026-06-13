import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/products', label: 'Productos', icon: 'inventory_2' },
  { to: '/admin/inventory', label: 'Inventario', icon: 'shelf_auto' },
  { to: '/admin/orders', label: 'Pedidos', icon: 'receipt_long' },
  { to: '/admin/messages', label: 'Mensajes', icon: 'mail' },
  { to: '/admin/catalogs', label: 'Catálogos PDF', icon: 'description' },
  { to: '/admin/reports', label: 'Reportes', icon: 'bar_chart' },
  { to: '/admin/accounting', label: 'Contabilidad', icon: 'account_balance' },
  { to: '/admin/settings', label: 'Configuración', icon: 'settings' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      <aside className="w-64 bg-white border-r border-[var(--color-outline-variant)] flex flex-col">
        <div className="p-6 border-b border-[var(--color-outline-variant)]">
          <h2 className="font-headline text-lg text-[var(--color-on-surface)]">Dais Store</h2>
          <p className="font-manrope text-xs text-[var(--color-outline)]">Panel Administrativo</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg font-manrope text-sm transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary-container)] text-[var(--color-primary)] font-semibold'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--color-outline-variant)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-manrope text-sm text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] transition-all w-full"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Cerrar Sesión
          </button>
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-manrope text-sm text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] transition-all mt-1"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver a la Tienda
          </a>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
