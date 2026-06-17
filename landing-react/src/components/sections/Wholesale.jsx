import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function Wholesale() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.getSettings().then(s => setContent(s)).catch(() => {});
  }, []);

  const headline = content?.wholesale_headline || '¿Eres Profesional de la Belleza?';
  const desc = content?.wholesale_description || 'Únete a nuestra exclusiva red de distribuidores mayoristas. Obtén precios preferenciales, capacitación especializada y acceso anticipado a toda nuestra línea de productos de lujo en Colombia.';
  const cta = content?.wholesale_cta || 'Solicitar Cuenta Mayorista';
  const whatsapp = content?.whatsapp || import.meta.env.VITE_WHATSAPP_NUMBER || '573000000000';
  const message = encodeURIComponent('Hola DAIS, quiero solicitar una cuenta mayorista y conocer el catálogo profesional.');

  return (
    <section id="mayoristas" className="py-20 md:py-[110px] bg-[#6f7f78] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%),linear-gradient(90deg,rgba(63,49,43,0.22),rgba(63,49,43,0))]" />
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center reveal-on-scroll">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[11px] font-label-md uppercase tracking-[0.12em] text-white">
              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              Programa profesional
            </span>
            <h2 className="font-headline-lg text-headline-lg text-white mt-5 mb-5">{headline}</h2>
            <p className="font-body-lg text-white/90 max-w-3xl leading-relaxed">{desc}</p>
          </div>
          <div className="bg-white/12 border border-white/20 p-6 md:p-8 rounded-[8px] backdrop-blur-md shadow-[0_24px_70px_rgba(48,43,36,0.18)]">
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              {[
                ['sell', 'Precios especiales'],
                ['school', 'Capacitación'],
                ['inventory_2', 'Acceso anticipado'],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-[8px] bg-white/12 p-4">
                  <span className="material-symbols-outlined text-[24px] text-white">{icon}</span>
                  <p className="mt-2 text-[11px] leading-4 font-label-md uppercase tracking-[0.08em] text-white/85">{label}</p>
                </div>
              ))}
            </div>
            <a
              href={`https://wa.me/${whatsapp}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center items-center gap-3 px-8 py-4 bg-white text-[#516161] font-label-md text-label-md rounded-[8px] hover:bg-[#fff7f1] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
