import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

const router = Router();

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const base = `${protocol}://${host}`;
  const fileUrl = `${base}/uploads/${req.file.filename}`;
  const b64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
  const mime = req.file.mimetype;
  const dataUrl = `data:${mime};base64,${b64}`;
  res.json({ url: fileUrl, dataUrl, filename: req.file.filename });
});

export default router;
