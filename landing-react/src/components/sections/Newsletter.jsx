import { useState } from 'react';
import { api } from '../../services/api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      await api.createMessage({ name: 'Suscriptor Newsletter', email, phone: '', message: 'Suscripción al newsletter' });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-[var(--color-primary)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block material-symbols-outlined text-5xl text-white/80 mb-6">mail</span>
          <h2 className="font-headline text-[var(--text-headline-lg)] text-white mb-4">
            Mantente al Día
          </h2>
          <p className="font-body-md text-white/80 mb-8">
            Suscríbete a nuestro newsletter y recibe las últimas novedades, promociones exclusivas y consejos de belleza directamente en tu correo.
          </p>
          {status === 'success' ? (
            <p className="text-green-300 font-manrope text-sm">¡Gracias por suscribirte! Pronto recibirás nuestras novedades.</p>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit} noValidate>
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                  placeholder="Tu correo electrónico"
                  className="w-full px-5 py-3.5 rounded-full font-manrope text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors"
                />
                {status === 'error' && (
                  <p className="text-red-300 font-manrope text-xs mt-2 text-left">Correo electrónico no válido</p>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-white text-[var(--color-primary)] font-manrope font-semibold text-sm uppercase tracking-[0.1em] rounded-full hover:bg-white/90 transition-all duration-300"
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
