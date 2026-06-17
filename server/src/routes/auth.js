import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const result = await pool.query(
      'SELECT id, username, password_hash, full_name, role, modules, is_active FROM public.users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    res.json({
      token,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      modules: user.modules,
    });
  } catch (err) {
    console.error('[AUTH ERROR]', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/verify', (req, res) => {
  res.json({ valid: true, username: req.user?.username, role: req.user?.role, modules: req.user?.modules });
});

export default router;
