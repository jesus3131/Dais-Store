import { useState } from 'react';
import { api } from '../../services/api.js';
import { Link } from 'react-router-dom';
import SocialIcon, { SOCIAL_LINKS } from '../ui/SocialIcons.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Footer() {
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
            <span className="font-display text-3xl italic text-[var(--color-gold)]">DAIS</span>
            <p className="font-inter text-xs text-white/30 leading-relaxed mt-4 max-w-xs">
              Distribuidora mayorista de productos de belleza premium. Calidad excepcional para tu negocio.
            </p>
            <div className="flex gap-4 mt-6">
              {SOCIAL_LINKS.map(s => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all group" aria-label={s.label}>
                  <SocialIcon icon={s.key} size={16} className="text-white/50 group-hover:text-[var(--color-gold)] transition-colors" />
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
            <h4 className="font-inter text-[11px] uppercase tracking-[0.18em] text-white/70 mb-6">Legal</h4>
            <ul className="space-y-3 font-inter text-sm text-white/30">
              {['Privacidad', 'Términos', 'Devoluciones'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-[var(--color-gold)] transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-[11px] text-white/20">&copy; {new Date().getFullYear()} DAIS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/admin/login" className="font-inter text-[11px] text-white/20 hover:text-white/50 transition-colors">Admin</Link>
            <span className="font-inter text-[11px] text-white/20">Diseñado con elegancia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
