import { Router } from 'express';
import * as SiteSettings from '../models/SiteSettings.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const settings = await SiteSettings.getAll();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:key', async (req, res) => {
  try {
    const setting = await SiteSettings.upsert(req.params.key, req.body.value);
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
