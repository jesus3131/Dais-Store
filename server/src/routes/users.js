import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = Router();

const ALL_MODULES = [
  'dashboard', 'products', 'orders', 'customers', 'coupons',
  'inventory', 'accounting', 'reports', 'settings', 'users',
  'page-builder', 'site-design', 'catalogs', 'messages',
];

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, modules, is_active, is_superuser, professional_card, created_at, updated_at FROM public.users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[USERS LIST ERROR]', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, modules, is_active, is_superuser, professional_card, created_at, updated_at FROM public.users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[USERS GET ERROR]', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, email, full_name, role, modules, is_active } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = await pool.query(
      `INSERT INTO public.users (username, email, full_name, password_hash, role, modules, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, username, email, full_name, role, modules, is_active, created_at`,
      [
        username,
        email || `${username}@daisstore.com`,
        full_name || username,
        hash,
        role || 'worker',
        JSON.stringify(modules || []),
        is_active !== undefined ? is_active : true,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El usuario ya existe' });
    console.error('[USERS CREATE ERROR]', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { password, email, full_name, role, modules, is_active, professional_card } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (password !== undefined) {
      const hash = bcrypt.hashSync(password, 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(hash);
    }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
    if (full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(full_name); }
    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    if (modules !== undefined) { fields.push(`modules = $${idx++}`); values.push(JSON.stringify(modules)); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
    if (professional_card !== undefined) { fields.push(`professional_card = $${idx++}`); values.push(professional_card); }

    if (fields.length === 0) return res.status(400).json({ error: 'Sin campos para actualizar' });

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE public.users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, username, email, full_name, role, modules, is_active, is_superuser, professional_card, created_at, updated_at`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[USERS UPDATE ERROR]', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM public.users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('[USERS DELETE ERROR]', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
export { ALL_MODULES };
