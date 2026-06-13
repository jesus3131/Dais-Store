import pool from '../db.js';

export async function getAll(filters = {}) {
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  let idx = 1;

  if (filters.status) {
    sql += ` AND status = $${idx++}`;
    params.push(filters.status);
  }

  sql += ' ORDER BY created_at DESC';

  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function create({ customer_name, phone, email, items, total, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO orders (customer_name, phone, email, items, total, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [customer_name, phone, email, JSON.stringify(items), total, notes || null],
  );
  return rows[0];
}

export async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE orders SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id, status],
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function getStats(days = 30) {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS total_revenue,
      COALESCE(AVG(total), 0) AS avg_order_value,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
      COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_count,
      COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_count
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '1 day' * $1
  `, [days]);
  return rows[0];
}

export async function getRevenueByDay(days = 30) {
  const { rows } = await pool.query(`
    SELECT
      DATE(created_at) AS day,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '1 day' * $1
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `, [days]);
  return rows;
}

export async function getTopProducts(days = 30, limit = 10) {
  const { rows } = await pool.query(`
    SELECT
      item->>'name' AS name,
      SUM((item->>'qty')::int) AS total_qty,
      SUM((item->>'qty')::int * (item->>'price')::int) AS total_revenue
    FROM orders,
    LATERAL jsonb_array_elements(items) AS item
    WHERE created_at >= NOW() - INTERVAL '1 day' * $1
    GROUP BY item->>'name'
    ORDER BY total_revenue DESC
    LIMIT $2
  `, [days, limit]);
  return rows;
}
