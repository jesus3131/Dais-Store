import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query(
    'SELECT * FROM products ORDER BY created_at DESC',
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

export async function create({ name, price, currency, description, image_url, image_data, category }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, price, currency, description, image_url, image_data, category)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, price, currency || '$', description || null, image_url || null, image_data || null, category || 'general'],
  );
  return rows[0];
}

export async function update(id, fields) {
  const allowed = ['name', 'price', 'currency', 'description', 'image_url', 'image_data', 'category'];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) {
    return getById(id);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM products WHERE id = $1',
    [id],
  );
  return rowCount > 0;
}
