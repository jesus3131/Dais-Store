import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/products', label: 'Productos', icon: 'inventory_2' },
  { to: '/admin/inventory', label: 'Inventario', icon: 'shelf_auto' },
  { to: '/admin/orders', label: 'Pedidos', icon: 'receipt_long' },
  { to: '/admin/messages', label: 'Mensajes', icon: 'mail' },
  { to: '/admin/catalogs', label: 'Catálogos PDF', icon: 'description' },
  { to: '/admin/import', label: 'Importar Excel', icon: 'upload_file' },
  { to: '/admin/reports', label: 'Reportes', icon: 'bar_chart' },
  { to: '/admin/accounting', label: 'Contabilidad', icon: 'account_balance' },
  { to: '/admin/site-design', label: 'Diseño del Sitio', icon: 'palette' },
  { to: '/admin/settings', label: 'Configuración', icon: 'settings' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    const interval = setInterval(() => {
      api.getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex">
      <aside className="w-64 bg-[var(--color-near-black)] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="font-display text-xl italic text-[var(--color-gold)]">DAIS</Link>
          <p className="font-inter text-[10px] text-white/30 uppercase tracking-[0.15em] mt-1">Panel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 font-inter text-sm transition-all ${
                  isActive ? 'bg-white/5 text-[var(--color-gold)] font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }>
              <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.to === '/admin/messages' && unread > 0 && (
                <span className="px-2 py-0.5 bg-[var(--color-gold)] text-[var(--color-near-black)] text-[10px] font-bold">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-1">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full font-inter text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar Sesión
          </button>
          <a href="/"
            className="flex items-center gap-3 px-4 py-2.5 font-inter text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver a la Tienda
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div key={location.pathname} className="max-w-7xl mx-auto p-8 animate-page-enter">{children}</div>
      </main>
    </div>
  );
}
