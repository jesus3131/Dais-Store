import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query(
    'SELECT * FROM page_sections ORDER BY sort_order ASC, id ASC'
  );
  return rows.map(r => ({ ...r, content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content }));
}

export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM page_sections WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  r.content = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
  return r;
}

export async function create({ type, title, content, visible, sort_order }) {
  const { rows } = await pool.query(
    `INSERT INTO page_sections (type, title, content, visible, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [type, title || '', JSON.stringify(content || {}), visible !== false, sort_order || 0]
  );
  const r = rows[0];
  r.content = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
  return r;
}

export async function update(id, { type, title, content, visible, sort_order }) {
  const fields = [];
  const params = [];
  let idx = 1;
  if (type !== undefined) { fields.push(`type = $${idx++}`); params.push(type); }
  if (title !== undefined) { fields.push(`title = $${idx++}`); params.push(title); }
  if (content !== undefined) { fields.push(`content = $${idx++}`); params.push(JSON.stringify(content)); }
  if (visible !== undefined) { fields.push(`visible = $${idx++}`); params.push(visible); }
  if (sort_order !== undefined) { fields.push(`sort_order = $${idx++}`); params.push(sort_order); }
  if (fields.length === 0) return getById(id);
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE page_sections SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  if (!rows[0]) return null;
  const r = rows[0];
  r.content = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
  return r;
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM page_sections WHERE id = $1', [id]);
  return rowCount > 0;
}
