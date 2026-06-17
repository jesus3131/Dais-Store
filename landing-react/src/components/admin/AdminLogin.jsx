import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    api.getSettings().then(s => setLogo(s?.site_logo_url)).catch(() => {});
  }, []);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await login(username, password);
    if (ok) {
      navigate('/admin', { replace: true });
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, var(--color-gold) 0%, transparent 50%), radial-gradient(circle at 70% 50%, var(--color-gold) 0%, transparent 50%)' }} />
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            {logo ? (
              <img src={logo} alt="DAIS" className="h-16 mx-auto object-contain" />
            ) : (
              <span className="font-display text-4xl italic text-[var(--color-gold)] hover:opacity-80 transition-opacity tracking-wide">DAIS</span>
            )}
          </Link>
          <div className="w-10 h-px bg-[var(--color-gold)]/40 mx-auto my-4" />
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">Panel de Administración</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 shadow-luxury-lg border border-[rgba(0,0,0,0.04)]">
          {error && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 text-red-600 font-inter text-sm rounded">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-2">Usuario</label>
              <input type="text" value={username} placeholder="Ingresa tu usuario"
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[rgba(232,207,166,0.2)] transition-all" />
            </div>
            <div>
              <label className="block font-inter text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-2">Contraseña</label>
              <input type="password" value={password} placeholder="Ingresa tu contraseña"
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[rgba(0,0,0,0.08)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[rgba(232,207,166,0.2)] transition-all" />
            </div>
            <button type="submit"
              className="w-full py-3.5 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              Ingresar
            </button>
          </div>
        </form>
        <p className="text-center mt-6">
          <Link to="/" className="font-inter text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
