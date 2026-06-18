import { Router } from 'express';
import * as Order from '../models/Order.js';
import { requireFields, sanitizeString, catchRoute } from '../utils/validate.js';

const router = Router();

router.get('/', catchRoute(async (req, res) => {
  const orders = await Order.getAll(req.query);
  res.json(orders);
}));

router.get('/stats', catchRoute(async (_req, res) => {
  const stats = await Order.getStats();
  const revenueByDay = await Order.getRevenueByDay();
  const topProducts = await Order.getTopProducts();
  res.json({ stats, revenueByDay, topProducts });
}));

router.get('/:id', catchRoute(async (req, res) => {
  const order = await Order.getById(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json(order);
}));

router.post('/', catchRoute(async (req, res) => {
  requireFields(req.body, ['customer_name', 'total', 'items']);
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    return res.status(400).json({ error: 'La orden debe contener al menos un item' });
  }
  const data = {
    ...req.body,
    customer_name: sanitizeString(req.body.customer_name, 255),
    customer_email: req.body.customer_email ? sanitizeString(req.body.customer_email, 255) : null,
    customer_phone: req.body.customer_phone ? sanitizeString(req.body.customer_phone, 50) : null,
    shipping_address: req.body.shipping_address ? sanitizeString(req.body.shipping_address, 500) : null,
    notes: req.body.notes ? sanitizeString(req.body.notes, 2000) : null,
    payment_method: req.body.payment_method || 'transferencia',
  };
  const order = await Order.create(data);
  res.status(201).json(order);
}));

router.patch('/:id/status', catchRoute(async (req, res) => {
  const order = await Order.updateStatus(Number(req.params.id), req.body.status);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json(order);
}));

router.delete('/:id', catchRoute(async (req, res) => {
  const ok = await Order.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json({ message: 'Orden eliminada' });
}));

export default router;
