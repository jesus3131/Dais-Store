import { useState } from 'react';

export default function QuickView({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    product.image_url || 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=800&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-[var(--color-near-black)]/60 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-4xl mx-6 max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-luxury"
        >
          <span className="material-symbols-outlined text-[var(--color-near-black)] text-[20px]">close</span>
        </button>

        <div className="grid lg:grid-cols-2">
          <div className="relative">
            <div className="aspect-square overflow-hidden bg-[var(--color-ivory)]">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 p-4 bg-[var(--color-ivory)]">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[var(--color-gold)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-10 lg:p-14 flex flex-col justify-center">
            <span className="font-inter text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-medium">{product.category}</span>
            <h2 className="font-headline text-[var(--text-headline-xl)] text-[var(--color-near-black)] mt-3 mb-4">{product.name}</h2>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-headline text-3xl font-semibold text-[var(--color-near-black)]">
                {product.currency || '$'}{Number(product.price).toLocaleString()}
              </span>
              {product.old_price && (
                <span className="font-inter text-sm text-[var(--color-on-surface-variant)] line-through">
                  {product.currency || '$'}{Number(product.old_price).toLocaleString()}
                </span>
              )}
            </div>

            <div className="w-12 h-[1px] bg-[var(--color-gold)] mb-6" />

            <p className="font-body text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-8">
              {product.description || 'Una experiencia sensorial única. Formulado con los mejores ingredientes para elevar tu rutina de belleza a un nuevo nivel de sofisticación.'}
            </p>

            <div className="mb-8">
              <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] mb-3 block">Cantidad</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border border-[var(--color-warm-gray)] flex items-center justify-center hover:border-[var(--color-near-black)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="font-inter text-sm w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(99, q + 1))}
                  className="w-10 h-10 border border-[var(--color-warm-gray)] flex items-center justify-center hover:border-[var(--color-near-black)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { onAdd(product); onClose(); }}
                className="flex-1 py-4 bg-[var(--color-near-black)] text-white font-inter text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-dark-gray)] transition-all duration-300"
              >
                Añadir al carrito
              </button>
              <button className="flex-1 py-4 border border-[var(--color-near-black)] text-[var(--color-near-black)] font-inter text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--color-near-black)] hover:text-white transition-all duration-300">
                Comprar ahora
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-warm-gray)]">
              <div className="flex items-center gap-6 text-[11px] font-inter text-[var(--color-on-surface-variant)]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                  Envío gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">autorenew</span>
                  Devolución fácil
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Pago seguro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
