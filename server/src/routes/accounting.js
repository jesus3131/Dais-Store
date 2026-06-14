import { Router } from 'express';
import * as Accounting from '../models/Accounting.js';

const router = Router();

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
};

router.get('/', async (req, res) => {
  try {
    const entries = await Accounting.getAll(req.query);
    res.json(entries);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/summary', async (req, res) => {
  try {
    const { from, to } = { ...defaultRange(), ...req.query };
    const summary = await Accounting.getSummary(from, to);
    const incomeBreakdown = await Accounting.getCategoryBreakdown('income', from, to);
    const expenseBreakdown = await Accounting.getCategoryBreakdown('expense', from, to);
    const dailyTotals = await Accounting.getDailyTotals(from, to);
    res.json({ summary, incomeBreakdown, expenseBreakdown, dailyTotals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tax-summary', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const data = await Accounting.getTaxSummary(year);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const entry = await Accounting.getById(Number(req.params.id));
    if (!entry) return res.status(404).json({ error: 'Entrada contable no encontrada' });
    res.json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const entry = await Accounting.create(req.body);
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const entry = await Accounting.update(Number(req.params.id), req.body);
    if (!entry) return res.status(404).json({ error: 'Entrada contable no encontrada' });
    res.json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Accounting.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Entrada contable no encontrada' });
    res.json({ message: 'Entrada eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
