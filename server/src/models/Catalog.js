import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query(
    'SELECT * FROM catalogs ORDER BY uploaded_at DESC',
  );
  return rows;
}

export async function create({ title, filename, url }) {
  const { rows } = await pool.query(
    `INSERT INTO catalogs (title, filename, url) VALUES ($1, $2, $3) RETURNING *`,
    [title, filename || null, url],
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM catalogs WHERE id = $1', [id]);
  return rowCount > 0;
}
