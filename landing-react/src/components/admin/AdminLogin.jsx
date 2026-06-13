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
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-headline text-3xl italic text-[var(--color-gold)] hover:opacity-80 transition-opacity">DAIS STORE</Link>
          <p className="font-manrope text-sm text-[var(--color-warm-gray)] mt-2">Panel de Administración</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 luxury-shadow">
          {error && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 text-red-600 font-manrope text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block font-manrope text-xs uppercase tracking-[0.12em] text-[var(--color-warm-gray)] mb-2">Usuario</label>
              <input type="text" value={username} placeholder="Ingresa tu usuario"
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" />
            </div>
            <div>
              <label className="block font-manrope text-xs uppercase tracking-[0.12em] text-[var(--color-warm-gray)] mb-2">Contraseña</label>
              <input type="password" value={password} placeholder="Ingresa tu contraseña"
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors" />
            </div>
            <button type="submit"
              className="w-full py-3 bg-[var(--color-charcoal)] text-white font-manrope font-semibold text-sm uppercase tracking-[0.12em] hover:bg-[var(--color-gold)] transition-all duration-300">
              Ingresar
            </button>
          </div>
        </form>
        <p className="text-center mt-6">
          <Link to="/" className="font-manrope text-xs text-[var(--color-warm-gray)] hover:text-[var(--color-gold)] transition-colors">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
