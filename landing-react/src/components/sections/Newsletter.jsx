import { useState } from 'react';
import { api } from '../../services/api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter({ sectionData = {} }) {
  const { title = 'Únete a nuestra newsletter', subtitle = 'Sé la primera en enterarte de nuevos lanzamientos, ofertas exclusivas y contenido de belleza.', btnText = 'Suscribirme' } = sectionData;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return;
    setStatus('sending');
    try {
      await api.createMessage({ name: 'Newsletter', email, phone: '', message: 'suscripcion newsletter' });
      setStatus('success');
      setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <section className="py-20 lg:py-24 bg-[var(--color-near-black)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">Mantente al día</span>
          <h3 className="font-display text-3xl lg:text-5xl text-white mt-4 mb-4 leading-tight">{title}</h3>
          <p className="font-body text-white/40 max-w-md mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-[18px]">mail</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu correo electrónico"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-[var(--color-gold)]/50 transition-all" />
            </div>
            <button type="submit" disabled={status === 'sending'}
              className="btn-gold whitespace-nowrap">
              {status === 'sending' ? 'Enviando...' : btnText}
            </button>
          </form>
          <p className="font-inter text-[10px] text-white/20 mt-4">Sin spam. Cancela cuando quieras.</p>
          {status === 'success' && (
            <p className="text-[var(--color-gold)] font-inter text-sm mt-4">¡Gracias por suscribirte!</p>
          )}
          {status === 'error' && (
            <p className="text-red-400 font-inter text-sm mt-4">Ocurrió un error. Intenta de nuevo.</p>
          )}
        </div>
      </div>
    </section>
  );
}
