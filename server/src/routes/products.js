import { Router } from 'express';
import * as Product from '../models/Product.js';
import { requireFields, sanitizeString, catchRoute } from '../utils/validate.js';

const router = Router();

router.get('/', catchRoute(async (_req, res) => {
  const products = await Product.getAll();
  res.json(products);
}));

router.post('/import', catchRoute(async (req, res) => {
  const products = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de productos' });
  }
  let count = 0;
  for (const p of products) {
    if (!p.name) return res.status(400).json({ error: 'Cada producto debe tener un nombre' });
    await Product.create({
      name: sanitizeString(p.name, 500),
      price: parseFloat(p.price) || 0,
      description: p.description || p.desc || null,
      image_url: p.image_url || null,
      image_data: p.image_data || null,
      category: p.category || 'general',
      sku: p.sku || null,
      stock: p.stock != null ? parseInt(p.stock) : null,
      old_price: p.old_price != null ? parseFloat(p.old_price) : null,
      wholesale_price: p.wholesale_price != null ? parseFloat(p.wholesale_price) : null,
      image_url_2: p.image_url_2 || null,
      currency: p.currency || null,
    });
    count++;
  }
  res.json({ count, message: `${count} productos importados` });
}));

router.get('/export', catchRoute(async (_req, res) => {
  const products = await Product.getAll();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=productos.json');
  res.json(products);
}));

router.get('/:id', catchRoute(async (req, res) => {
  const product = await Product.getById(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
}));

router.post('/', catchRoute(async (req, res) => {
  requireFields(req.body, ['name']);
  const data = {
    ...req.body,
    name: sanitizeString(req.body.name),
    description: sanitizeString(req.body.description, 5000),
    price: req.body.price != null && req.body.price >= 0 ? req.body.price : 0,
  };
  const product = await Product.create(data);
  res.status(201).json(product);
}));

router.put('/:id', catchRoute(async (req, res) => {
  const product = await Product.update(Number(req.params.id), req.body);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
}));

router.delete('/:id', catchRoute(async (req, res) => {
  const ok = await Product.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ message: 'Producto eliminado' });
}));

export default router;
