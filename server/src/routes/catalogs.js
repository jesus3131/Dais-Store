import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import * as Catalog from '../models/Catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/catalogs'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  },
});

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const catalogs = await Catalog.getAll();
    res.json(catalogs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const url = req.file ? `/uploads/catalogs/${req.file.filename}` : req.body.url;
    const catalog = await Catalog.create({
      title: req.body.title,
      filename: req.file?.filename || null,
      url,
    });
    res.status(201).json(catalog);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Catalog.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Catálogo no encontrado' });
    res.json({ message: 'Catálogo eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
