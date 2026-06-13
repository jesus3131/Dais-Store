import { Router } from 'express';
import * as Message from '../models/Message.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const messages = await Message.getAll();
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/unread-count', async (_req, res) => {
  try {
    const count = await Message.getUnreadCount();
    res.json({ count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const msg = await Message.getById(Number(req.params.id));
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const msg = await Message.markRead(Number(req.params.id));
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/unread', async (req, res) => {
  try {
    const msg = await Message.markUnread(Number(req.params.id));
    if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Message.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json({ message: 'Mensaje eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
