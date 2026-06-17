import { Router } from 'express';
import * as DesignToken from '../models/DesignToken.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const tokens = await DesignToken.getAll();
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:name', async (req, res) => {
  try {
    const token = await DesignToken.upsert(req.params.name, req.body.value, req.body.category);
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { tokens } = req.body;
    if (!Array.isArray(tokens)) return res.status(400).json({ error: 'tokens debe ser un array' });
    const result = await DesignToken.bulkUpsert(tokens);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const ok = await DesignToken.remove(req.params.name);
    if (!ok) return res.status(404).json({ error: 'Token no encontrado' });
    res.json({ message: 'Token eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
