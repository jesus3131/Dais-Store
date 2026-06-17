import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query('SELECT * FROM design_tokens ORDER BY category, token_name');
  const map = {};
  for (const r of rows) {
    map[r.token_name] = r.token_value;
  }
  return map;
}

export async function getByName(name) {
  const { rows } = await pool.query('SELECT * FROM design_tokens WHERE token_name = $1', [name]);
  return rows[0] || null;
}

export async function upsert(name, value, category) {
  const { rows } = await pool.query(
    `INSERT INTO design_tokens (token_name, token_value, category)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_name) DO UPDATE SET token_value = EXCLUDED.token_value, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [name, value, category || 'general']
  );
  return rows[0];
}

export async function bulkUpsert(tokens) {
  for (const { token_name, token_value, category } of tokens) {
    await upsert(token_name, token_value, category);
  }
  return getAll();
}

export async function remove(name) {
  const { rowCount } = await pool.query('DELETE FROM design_tokens WHERE token_name = $1', [name]);
  return rowCount > 0;
}
