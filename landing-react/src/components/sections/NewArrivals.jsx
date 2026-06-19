import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';

export default function NewArrivals() {
  const { addToCart, openCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const items = products.slice(0, 4);

  const handleAdd = (item) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    openCart();
  };

  return (
    <section id="new-arrivals" className="py-20 md:py-[120px] bg-[#FFF5F7] px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-12 reveal-on-scroll">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Nuevas Llegadas</h2>
            <div className="w-24 h-1 bg-burgundy-accent/50 rounded-full mt-2" />
          </div>
          <a href="#catalog" onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="text-burgundy-accent font-label-md hover:text-primary transition-colors uppercase tracking-wider border-b border-burgundy-accent/30 pb-1 hover:border-primary">
            Ver todo
          </a>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar">
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className="snap-start shrink-0 w-[280px] md:w-[320px] group cursor-pointer reveal-on-scroll bg-white border border-[#E8D3BA] rounded-2xl p-4 ambient-shadow hover:-translate-y-2 transition-all duration-500"
              onClick={() => handleAdd(item)}
            >
              <div className="relative aspect-square bg-white rounded-xl mb-4 overflow-hidden shadow-inner">
                <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md text-primary font-label-md text-[10px] rounded-full uppercase shadow-sm">
                  Nuevo
                </span>
              </div>
              <h3 className="font-headline-md text-[18px] text-on-background group-hover:text-primary transition-colors">{item.name}</h3>
              <p className="font-label-md text-base text-burgundy-accent mt-1">${Number(item.price).toLocaleString()} COP</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
