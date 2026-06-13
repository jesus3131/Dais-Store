import { useCart } from '../../context/CartContext';

export function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <button className="btn-plus" onClick={() => addItem(product)} aria-label="Agregar">+</button>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-price">{product.formattedPrice}</div>
        <div className="product-desc">{product.description}</div>
        <button className="btn-add" onClick={() => addItem(product)}>AÑADIR AL PEDIDO</button>
      </div>
    </div>
  );
}
