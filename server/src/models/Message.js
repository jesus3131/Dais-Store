import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query(
    'SELECT * FROM messages ORDER BY created_at DESC',
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function create({ name, phone, email, message }) {
  const { rows } = await pool.query(
    `INSERT INTO messages (name, phone, email, message) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, phone, email, message],
  );
  return rows[0];
}

export async function markRead(id) {
  const { rows } = await pool.query(
    `UPDATE messages SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] || null;
}

export async function markUnread(id) {
  const { rows } = await pool.query(
    `UPDATE messages SET is_read = FALSE WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM messages WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function getUnreadCount() {
  const { rows } = await pool.query(
    'SELECT COUNT(*) AS count FROM messages WHERE is_read = FALSE',
  );
  return Number(rows[0].count);
}

export async function addReply(id, reply) {
  const { rows } = await pool.query(
    'UPDATE messages SET reply = $2, is_read = TRUE WHERE id = $1 RETURNING *',
    [id, reply],
  );
  return rows[0] || null;
}
