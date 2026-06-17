import { useState } from 'react';
import { api } from '../../services/api.js';
import { Link } from 'react-router-dom';
import SocialIcon, { SOCIAL_LINKS } from '../ui/SocialIcons.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FOOTER_DEFAULTS = {
  site_name: 'DAIS',
  footer_tagline: 'Distribuidora mayorista de productos de belleza premium. Calidad excepcional para tu negocio.',
  social_instagram: 'https://instagram.com/dais_store',
  social_facebook: '#',
  social_tiktok: '#',
  address: 'Montería, Córdoba, Colombia',
  business_hours: 'Lun - Sáb: 8:00 AM - 6:00 PM',
};

export default function Footer({ settings = {} }) {
  const s = { ...FOOTER_DEFAULTS, ...settings };
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return;
    setStatus('sending');
    try {
      await api.createMessage({ name: 'Suscriptor Footer', email, phone: '', message: 'Suscripción footer' });
      setStatus('success');
      setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <footer id="footer" className="bg-[var(--color-near-black)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="font-display text-3xl italic text-[var(--color-gold)]">{s.site_name}</span>
            <p className="font-inter text-xs text-white/30 leading-relaxed mt-4 max-w-xs">
              {s.footer_tagline}
            </p>
            <div className="flex gap-4 mt-6">
              {SOCIAL_LINKS.map(sl => (
                <a key={sl.key} href={s[`social_${sl.key}`] || sl.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[var(--color-gold)] hover:bg-[rgba(232,207,166,0.1)] transition-all group" aria-label={sl.label}>
                  <SocialIcon icon={sl.key} size={16} className="text-white/50 group-hover:text-[var(--color-gold)] transition-colors" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-inter text-[11px] uppercase tracking-[0.18em] text-white/70 mb-6">Empresa</h4>
            <ul className="space-y-3 font-inter text-sm text-white/30">
              {['Nosotros', 'Historia', 'Blog'].map(item => (
                <li key={item}>
                  <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-[var(--color-gold)] transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-inter text-[11px] uppercase tracking-[0.18em] text-white/70 mb-6">Ayuda</h4>
            <ul className="space-y-3 font-inter text-sm text-white/30">
              {[
                { label: 'Contacto', target: 'footer' },
                { label: 'FAQ', target: 'faq' },
                { label: 'Envíos', target: 'faq' },
              ].map(item => (
                <li key={item.label}>
                  <button onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-[var(--color-gold)] transition-colors">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-inter text-[11px] uppercase tracking-[0.18em] text-white/70 mb-6">Newsletter</h4>
            <p className="font-inter text-xs text-white/30 mb-4">Recibe novedades y ofertas exclusivas.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-inter text-xs placeholder:text-white/20 focus:outline-none focus:border-[var(--color-gold)]/50 transition-all" />
              <button type="submit" disabled={status === 'sending'}
                className="px-4 py-2.5 bg-[var(--color-gold)] text-[var(--color-near-black)] font-inter text-[9px] uppercase tracking-[0.15em] hover:bg-[var(--color-gold-light)] transition-all disabled:opacity-50">
                OK
              </button>
            </form>
            {status === 'success' && <p className="text-[var(--color-gold)] font-inter text-[10px] mt-2">¡Gracias por suscribirte!</p>}
          </div>
        </div>
        <div className="py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-[11px] text-white/20">&copy; {new Date().getFullYear()} {s.site_name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/admin/login" className="font-inter text-[11px] text-white/20 hover:text-white/50 transition-colors">Admin</Link>
            <span className="font-inter text-[11px] text-white/20">Diseñado con elegancia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
