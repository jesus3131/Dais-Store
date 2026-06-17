import { Router } from 'express';
import * as PageSection from '../models/PageSection.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const sections = await PageSection.getAll();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const section = await PageSection.getById(Number(req.params.id));
    if (!section) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const section = await PageSection.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const section = await PageSection.update(Number(req.params.id), req.body);
    if (!section) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reorder', async (req, res) => {
  try {
    const { sort_order } = req.body;
    const section = await PageSection.update(Number(req.params.id), { sort_order });
    if (!section) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await PageSection.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json({ message: 'Sección eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
