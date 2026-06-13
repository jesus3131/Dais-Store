import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      setError('');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 rounded-xl luxury-shadow">
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl text-[var(--color-on-surface)]">Admin</h1>
          <p className="font-manrope text-sm text-[var(--color-outline)] mt-1">Inicia sesión para gestionar</p>
        </div>
        {error && (
          <p className="font-manrope text-sm text-red-500 mb-4 text-center">{error}</p>
        )}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[var(--color-primary)] text-white font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all"
          >
            Ingresar
          </button>
        </div>
      </form>
    </div>
  );
}
