import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin', { replace: true });
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl italic text-[var(--color-gold)] hover:opacity-80 transition-opacity">DAIS</Link>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-2">Panel de Administración</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 shadow-luxury-lg">
          {error && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 text-red-600 font-inter text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block font-inter text-xs uppercase tracking-[0.12em] text-gray-500 mb-2">Usuario</label>
              <input type="text" value={username} placeholder="Ingresa tu usuario"
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-all" />
            </div>
            <div>
              <label className="block font-inter text-xs uppercase tracking-[0.12em] text-gray-500 mb-2">Contraseña</label>
              <input type="password" value={password} placeholder="Ingresa tu contraseña"
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-all" />
            </div>
            <button type="submit"
              className="w-full py-3.5 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-dark-gray)] transition-all duration-300">
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
