import { Router } from 'express';
import * as IM from '../models/InventoryMovement.js';

const router = Router();

router.get('/', async (req, res) => {
  try { res.json(await IM.getMovements(req.query)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await IM.createMovement(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
