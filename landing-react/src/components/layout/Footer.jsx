import { useState } from 'react';
import { api } from '../../services/api.js';
import { Link } from 'react-router-dom';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return;
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
    <footer id="footer" className="bg-[var(--color-charcoal)] text-white">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="py-16 border-b border-white/10">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-manrope font-semibold text-sm uppercase tracking-[0.15em] text-[var(--color-gold)] mb-3">
              Mantente al Día
            </h3>
            <p className="font-manrope text-sm text-white/60 mb-6">
              Suscríbete para recibir novedades, promociones exclusivas y consejos de belleza.
            </p>
            {status === 'success' ? (
              <p className="text-[var(--color-gold)] font-manrope text-sm">¡Gracias por suscribirte!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-sm mx-auto">
                <input
                  type="email" value={email} placeholder="Tu correo electrónico"
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white text-sm font-manrope placeholder:text-white/40 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                />
                <button type="submit" disabled={status === 'sending'}
                  className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-charcoal)] font-manrope font-semibold text-xs uppercase tracking-[0.12em] hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50">
                  {status === 'sending' ? '...' : 'SUSCRIBIR'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-headline text-2xl italic text-[var(--color-gold)] mb-4">DAIS STORE</h3>
            <p className="font-manrope text-sm text-white/50 leading-relaxed">
              Distribuidora Mayorista de productos de belleza. Calidad premium para tu negocio.
            </p>
          </div>
          <div>
            <h4 className="font-manrope font-semibold text-xs uppercase tracking-[0.15em] text-white/70 mb-5">Enlaces</h4>
            <ul className="space-y-3 font-manrope text-sm text-white/50">
              {[
                { label: 'Catálogo', target: 'catalog' },
                { label: 'Nosotros', target: 'about' },
                { label: 'Cómo Comprar', target: 'how-it-works' },
                { label: 'FAQ', target: 'faq' },
              ].map(link => (
                <li key={link.label}>
                  <button onClick={() => document.getElementById(link.target)?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-manrope font-semibold text-xs uppercase tracking-[0.15em] text-white/70 mb-5">Contacto</h4>
            <ul className="space-y-3 font-manrope text-sm text-white/50">
              <li>Montería, Córdoba</li>
              <li><a href={`tel:${import.meta.env.VITE_WHATSAPP_NUMBER || '+573000000000'}`} className="hover:text-white transition-colors">{import.meta.env.VITE_WHATSAPP_NUMBER || '+57 300 000 0000'}</a></li>
              <li><a href="mailto:info@daisstore.co" className="hover:text-white transition-colors">info@daisstore.co</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-manrope font-semibold text-xs uppercase tracking-[0.15em] text-white/70 mb-5">Legal</h4>
            <ul className="space-y-3 font-manrope text-sm text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Devoluciones</a></li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-manrope text-xs text-white/30">&copy; {new Date().getFullYear()} Dais Store. Todos los derechos reservados.</p>
          <Link to="/admin/login" className="font-manrope text-xs text-white/20 hover:text-white/50 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
