const faqs = [
  { q: '¿Cómo puedo realizar un pedido?', a: 'Navega por nuestro catálogo, selecciona los productos que desees y agrégalos a tu carrito. Completa tu pedido y uno de nuestros asesores se pondrá en contacto contigo para confirmar los detalles y coordinar el envío.' },
  { q: '¿Cuál es el monto mínimo para pedidos?', a: 'El monto mínimo para pedidos es de $150,000 COP. Consulta con nuestro equipo para conocer las condiciones especiales para nuevos clientes.' },
  { q: '¿Hacen envíos a todo Colombia?', a: 'Sí, realizamos envíos a todo el territorio colombiano a través de transportadoras nacionales. Los tiempos de entrega varían según la ubicación.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos transferencias bancarias, consignaciones, Nequi, Daviplata y pagos con tarjeta de crédito/débito a través de nuestra pasarela de pago segura.' },
  { q: '¿Puedo devolver un producto?', a: 'Ofrecemos cambios y devoluciones dentro de los primeros 15 días posteriores a la compra, siempre que el producto esté sin usar y en su empaque original.' },
  { q: '¿Ofrecen muestras de productos?', a: 'Sí, para clientes mayoristas ofrecemos muestras selectas para que puedas evaluar la calidad antes de realizar tu pedido completo.' },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-28 lg:py-36 bg-[var(--color-surface-container)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-inter text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">FAQ</span>
            <div className="section-divider mt-4" />
            <h2 className="font-headline text-[var(--text-display-md)] text-[var(--color-near-black)] mt-6">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-[var(--color-warm-gray)] hover:border-[var(--color-gold)]/30 transition-all duration-300">
                <summary className="flex items-center justify-between px-8 py-6 font-headline text-[var(--text-headline-md)] text-[var(--color-near-black)] cursor-pointer [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[var(--color-gold)] group-open:rotate-180 transition-transform duration-500">add</span>
                </summary>
                <div className="px-8 pb-6">
                  <div className="w-8 h-[1px] bg-[var(--color-gold)] mb-4" />
                  <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
