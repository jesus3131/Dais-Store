import { useState } from 'react';
import { api } from '../../services/api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) { setStatus('error'); return; }
    setStatus('sending');
    try {
      await api.createMessage({ name: 'Suscriptor Newsletter', email, phone: '', message: 'Suscripción al newsletter' });
      setStatus('success');
      setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <section className="py-28 lg:py-36 bg-[var(--color-near-black)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, var(--color-gold) 0%, transparent 50%), radial-gradient(circle at 75% 50%, var(--color-gold) 0%, transparent 50%)' }} />
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)] relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="glass-gold inline-flex px-6 py-3 mb-8">
            <span className="font-inter text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">Acceso Exclusivo</span>
          </div>
          <h2 className="font-headline text-[var(--text-display-md)] text-white mb-4">
            Únete al círculo exclusivo
          </h2>
          <p className="font-body text-sm text-white/50 mb-10 max-w-sm mx-auto">
            Sé la primera en recibir lanzamientos, ediciones limitadas y acceso anticipado a colecciones premium.
          </p>
          {status === 'success' ? (
            <p className="text-[var(--color-gold)] font-inter text-sm">Bienvenida al círculo DAIS. Pronto recibirás nuestras novedades.</p>
          ) : (
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubmit} noValidate>
              <div className="flex-1">
                <input
                  type="email" value={email} placeholder="Tu correo electrónico"
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white font-inter text-sm placeholder:text-white/30 focus:outline-none focus:border-[var(--color-gold)]/50 transition-all"
                />
                {status === 'error' && <p className="text-red-400/80 font-inter text-xs mt-2 text-left">Correo no válido</p>}
              </div>
              <button type="submit" disabled={status === 'sending'}
                className="px-8 py-4 bg-[var(--color-gold)] text-[var(--color-near-black)] font-inter text-xs uppercase tracking-[0.2em] font-medium hover:bg-[var(--color-gold-light)] transition-all duration-300 disabled:opacity-50">
                {status === 'sending' ? '...' : 'Suscribirme'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
