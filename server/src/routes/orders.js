import { Router } from 'express';
import * as Order from '../models/Order.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orders = await Order.getAll(req.query);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stats', async (_req, res) => {
  try {
    const stats = await Order.getStats();
    const revenueByDay = await Order.getRevenueByDay();
    const topProducts = await Order.getTopProducts();
    res.json({ stats, revenueByDay, topProducts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.getById(Number(req.params.id));
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const order = await Order.updateStatus(Number(req.params.id), req.body.status);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Order.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json({ message: 'Orden eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
