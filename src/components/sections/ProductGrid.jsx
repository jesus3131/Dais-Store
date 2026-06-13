import { ProductCard } from './ProductCard';

export function ProductGrid({ title, products }) {
  return (
    <section className="product-grid" id="productos">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="products-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
