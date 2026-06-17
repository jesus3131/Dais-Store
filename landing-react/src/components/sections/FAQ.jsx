import { useState } from 'react';

const defaultFaqs = [
  { q: '¿Cómo realizo un pedido al por mayor?', a: 'Puedes explorar nuestro catálogo, agregar los productos a tu carrito y enviar tu pedido a través de WhatsApp.' },
  { q: '¿Cuál es el monto mínimo de compra?', a: 'Trabajamos con pedidos desde $1,500 MXN.' },
  { q: '¿Cuánto tiempo tarda el envío?', a: 'Los envíos se realizan dentro de las siguientes 72 horas hábiles posteriores a la confirmación del pago.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos transferencia bancaria, depósito en efectivo y pagos con tarjeta.' },
  { q: '¿Puedo devolver un producto?', a: 'Aceptamos cambios y devoluciones dentro de los primeros 15 días.' },
  { q: '¿Ofrecen muestras?', a: 'Sí, ofrecemos la venta de muestras para que puedas evaluar la calidad.' },
];

export default function FAQ({ sectionData = {} }) {
  const faqs = sectionData.items || defaultFaqs;
  const [openId, setOpenId] = useState(null);

  return (
    <section id="faq" className="py-20 lg:py-24 bg-[var(--color-ivory)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="text-center mb-12">
          <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">FAQ</span>
          <div className="section-divider mt-4" />
          <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
            Preguntas frecuentes
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openId === idx;
            return (
              <div key={idx}
                className={`border transition-all duration-300 ${isOpen ? 'border-[var(--color-gold)] bg-white' : 'border-[rgba(0,0,0,0.06)] bg-white/60 hover:bg-white'}`}>
                <button onClick={() => setOpenId(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 lg:p-6 text-left">
                  <span className="font-headline text-sm lg:text-base text-[var(--color-near-black)] pr-4">{faq.q}</span>
                  <span className={`material-symbols-outlined text-lg text-[var(--color-gold)] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80' : 'max-h-0'}`}>
                  <p className="px-5 lg:px-6 pb-5 lg:pb-6 font-inter text-xs lg:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
