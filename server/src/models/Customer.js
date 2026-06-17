import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function create({ name, email, phone, city, department, address, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO customers (name, email, phone, city, department, address, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, email || null, phone || null, city || null, department || null, address || null, notes || null],
  );
  return rows[0];
}

export async function update(id, fields) {
  const allowed = ['name', 'email', 'phone', 'city', 'department', 'address', 'notes', 'total_orders', 'total_spent', 'last_order_date'];
  const setClauses = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }
  if (setClauses.length === 0) return getById(id);
  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE customers SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function upsertFromOrder({ name, email, phone, shipping_city, shipping_department, shipping_address, total }) {
  const existing = email
    ? (await pool.query('SELECT * FROM customers WHERE email = $1', [email])).rows[0]
    : null;
  if (existing) {
    const { rows } = await pool.query(
      `UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + $1,
       last_order_date = CURRENT_TIMESTAMP, phone = COALESCE(NULLIF($2, ''), phone),
       city = COALESCE(NULLIF($3, ''), city), department = COALESCE(NULLIF($4, ''), department),
       updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
      [total, phone || '', shipping_city || '', shipping_department || '', existing.id],
    );
    return rows[0];
  }
  const { rows } = await pool.query(
    `INSERT INTO customers (name, email, phone, city, department, address, total_orders, total_spent, last_order_date)
     VALUES ($1, $2, $3, $4, $5, $6, 1, $7, CURRENT_TIMESTAMP) RETURNING *`,
    [name, email || null, phone || null, shipping_city || null, shipping_department || null, shipping_address || null, total],
  );
  return rows[0];
}
