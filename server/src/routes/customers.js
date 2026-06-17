import { Router } from 'express';
import * as Customer from '../models/Customer.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.getById(Number(req.params.id));
    if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.update(Number(req.params.id), req.body);
    if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Customer.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
