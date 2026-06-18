import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import ChangePasswordModal from './ChangePasswordModal.jsx';

const allLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', module: 'dashboard' },
  { to: '/admin/products', label: 'Productos', icon: 'inventory_2', module: 'products' },
  { to: '/admin/inventory', label: 'Inventario', icon: 'shelf_auto', module: 'inventory' },
  { to: '/admin/orders', label: 'Pedidos', icon: 'receipt_long', module: 'orders' },
  { to: '/admin/customers', label: 'Clientes', icon: 'people', module: 'customers' },
  { to: '/admin/quotations', label: 'Cotizaciones', icon: 'request_quote', module: 'quotations' },
  { to: '/admin/coupons', label: 'Cupones', icon: 'confirmation_number', module: 'coupons' },
  { to: '/admin/messages', label: 'Mensajes', icon: 'mail', module: 'messages' },
  { to: '/admin/catalogs', label: 'Catálogos PDF', icon: 'description', module: 'catalogs' },
  { to: '/admin/import', label: 'Importar Excel', icon: 'upload_file', module: 'products' },
  { to: '/admin/reports', label: 'Reportes', icon: 'bar_chart', module: 'reports' },
  { to: '/admin/accounting', label: 'Contabilidad', icon: 'account_balance', module: 'accounting' },
  { to: '/admin/page-builder', label: 'Constructor', icon: 'dashboard_customize', module: 'page-builder' },
  { to: '/admin/site-design', label: 'Diseño del Sitio', icon: 'palette', module: 'site-design' },
  { to: '/admin/users', label: 'Usuarios', icon: 'manage_accounts', module: 'users' },
  { to: '/admin/settings', label: 'Configuración', icon: 'settings', module: 'settings' },
];

export default function AdminLayout({ children }) {
  const { logout, role, modules } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [logo, setLogo] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    api.getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    api.getSettings().then(s => setLogo(s?.site_logo_url)).catch(() => {});
    const interval = setInterval(() => {
      api.getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const canAccessAll = role === 'admin' || modules?.includes('*');
  const links = canAccessAll
    ? allLinks
    : allLinks.filter(l => modules?.includes(l.module));

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      <aside className="w-64 bg-[var(--color-near-black)] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="block">
            {logo ? (
              <img src={logo} alt="DAIS" className="h-10 object-contain" />
            ) : (
              <span className="font-display text-2xl italic text-[var(--color-gold)] tracking-wide">DAIS</span>
            )}
          </Link>
          <p className="font-inter text-[9px] text-white/25 uppercase tracking-[0.15em] mt-1.5">Panel de Administración</p>
        </div>
        <div className="px-6 py-2">
          <p className="font-inter text-[9px] text-white/20 uppercase tracking-[0.15em]">{role === 'admin' ? 'Admin' : 'Usuario'}</p>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 font-inter text-sm transition-all duration-200 ${
                  isActive ? 'bg-white/5 text-[var(--color-gold)] border-r-2 border-[var(--color-gold)]' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`
              }>
              <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.to === '/admin/messages' && unread > 0 && (
                <span className="px-2 py-0.5 bg-[var(--color-gold)] text-[var(--color-near-black)] text-[9px] font-bold rounded">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-0.5">
          <button onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-3 px-6 py-2.5 w-full font-inter text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[18px]">key</span>
            Cambiar Contraseña
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-2.5 w-full font-inter text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar Sesión
          </button>
          <a href="/"
            className="flex items-center gap-3 px-6 py-2.5 font-inter text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver a la Tienda
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div key={location.pathname} className="max-w-7xl mx-auto p-8 animate-page-enter">{children}</div>
      </main>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
