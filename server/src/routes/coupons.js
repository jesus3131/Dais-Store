import { Router } from 'express';
import * as Coupon from '../models/Coupon.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const coupons = await Coupon.getAll();
    res.json(coupons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.getById(Number(req.params.id));
    if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json(coupon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El código ya existe' });
    if (err.message?.includes('obligatorio')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.update(Number(req.params.id), req.body);
    if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json(coupon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Coupon.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json({ message: 'Cupón eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/validate', async (req, res) => {
  try {
    const result = await Coupon.validate(req.body.code);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
