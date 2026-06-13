const faqs = [
  { q: '¿Cómo puedo realizar un pedido mayorista?', a: 'Puedes navegar por nuestro catálogo, agregar los productos a tu carrito y completar tu pedido. Uno de nuestros asesores se pondrá en contacto contigo para confirmar los detalles y coordinar el envío.' },
  { q: '¿Cuál es el monto mínimo para pedidos mayoristas?', a: 'El monto mínimo para pedidos mayoristas es de $150,000 COP. Consulta con nuestro equipo para conocer las condiciones especiales para nuevos clientes.' },
  { q: '¿Hacen envíos a todo Colombia?', a: 'Sí, realizamos envíos a todo el territorio colombiano a través de nuestras alianzas con transportadoras nacionales. Los tiempos de entrega varían según la ubicación.' },
  { q: '¿Cuáles son los métodos de pago disponibles?', a: 'Aceptamos transferencias bancarias, consignaciones, Nequi, Daviplata y pagos con tarjeta de crédito/débito a través de nuestra pasarela de pago segura.' },
  { q: '¿Puedo devolver un producto si no estoy satisfecho?', a: 'Sí, ofrecemos cambios y devoluciones dentro de los primeros 15 días posteriores a la compra, siempre que el producto esté sin usar y en su empaque original.' },
  { q: '¿Ofrecen muestras de productos?', a: 'Sí, para clientes mayoristas ofrecemos muestras de ciertos productos para que puedas evaluar la calidad antes de realizar tu pedido completo.' },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-[var(--color-surface-container-low)]">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] lg:px-[var(--spacing-margin-desktop)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[var(--color-label-sm)] uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4 font-manrope font-semibold">
              FAQ
            </span>
            <h2 className="font-headline text-[var(--text-headline-lg)] text-[var(--color-on-background)]">
              Preguntas <span className="text-[var(--color-secondary)]">Frecuentes</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl p-6 luxury-shadow cursor-pointer">
                <summary className="flex items-center justify-between font-headline text-[var(--text-headline-md)] text-[var(--color-on-surface)] [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="material-symbols-outlined text-[var(--color-secondary)] group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <p className="mt-4 font-body-md text-[var(--color-on-surface-variant)]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
