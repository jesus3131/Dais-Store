import { Router } from 'express';
import * as Inventory from '../models/Inventory.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await Inventory.getAll();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/low-stock', async (_req, res) => {
  try {
    const data = await Inventory.getLowStock();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:productId/stock', async (req, res) => {
  try {
    const inv = await Inventory.updateStock(Number(req.params.productId), req.body.quantity);
    if (!inv) return res.status(404).json({ error: 'No encontrado' });
    res.json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:productId/min-stock', async (req, res) => {
  try {
    const inv = await Inventory.setMinStock(Number(req.params.productId), req.body.min_stock);
    if (!inv) return res.status(404).json({ error: 'No encontrado' });
    res.json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
