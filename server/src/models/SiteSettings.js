import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query('SELECT key, value FROM site_settings');
  const map = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getByKey(key) {
  const { rows } = await pool.query(
    'SELECT value FROM site_settings WHERE key = $1',
    [key],
  );
  return rows[0]?.value || null;
}

export async function upsert(key, value) {
  const { rows } = await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [key, value],
  );
  return rows[0];
}
