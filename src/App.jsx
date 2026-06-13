import { useState, useEffect } from 'react';
import { SiteDataModel } from './models/SiteDataModel.js';
import { StepModel } from './models/StepModel.js';
import { ProductModel } from './models/ProductModel.js';
import { siteData, steps as stepsData, products as productsData } from './data/content.js';
import { api } from './services/api.js';
import { EventBus } from './services/EventBus.js';
import { CartService } from './services/CartService.js';
import { CartProvider } from './context/CartContext.jsx';
import { Hero } from './components/sections/Hero.jsx';
import { Steps } from './components/sections/Steps.jsx';
import { ProductGrid } from './components/sections/ProductGrid.jsx';
import { Footer } from './components/sections/Footer.jsx';

const eventBus = new EventBus();
const cartService = new CartService(eventBus);

const site = new SiteDataModel({ ...siteData, year: new Date().getFullYear() });
const stepModels = stepsData.map(s => new StepModel(s));

eventBus.on('cart:updated', (summary) => {
  console.info('[Cart]', summary);
});

export default function App() {
  const [remoteProducts, setRemoteProducts] = useState(null);

  useEffect(() => {
    api.getProducts()
      .then((data) => {
        const mapped = data.map((p) => new ProductModel(p));
        setRemoteProducts(mapped.map((p) => p.toJSON()));
      })
      .catch(() => {
        // Fallback to static data if server is unavailable
        const fallback = productsData.map((p) => new ProductModel(p));
        setRemoteProducts(fallback.map((p) => p.toJSON()));
      });
  }, []);

  return (
    <CartProvider cartService={cartService}>
      <Hero site={site} />
      <Steps title={site.sectionTitles.steps} items={stepModels} />
      {remoteProducts && (
        <ProductGrid title={site.sectionTitles.products} products={remoteProducts} />
      )}
      <Footer site={site} />
    </CartProvider>
  );
}
