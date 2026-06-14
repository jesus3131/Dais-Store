import pool from '../db.js';

export async function getMovements(filters = {}) {
  let sql = `SELECT im.*, p.name AS product_name
    FROM inventory_movements im JOIN products p ON p.id = im.product_id WHERE 1=1`;
  const params = []; let idx = 1;
  if (filters.product_id) { sql += ` AND im.product_id = $${idx++}`; params.push(filters.product_id); }
  if (filters.movement_type) { sql += ` AND im.movement_type = $${idx++}`; params.push(filters.movement_type); }
  sql += ' ORDER BY im.created_at DESC LIMIT 500';
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function createMovement(data) {
  const { rows: [inv] } = await pool.query(
    'SELECT quantity FROM inventory WHERE product_id = $1', [data.product_id]);
  const prev = inv ? parseInt(inv.quantity) : 0;
  const qty = parseInt(data.quantity);
  const newQty = data.movement_type === 'in' ? prev + qty
    : data.movement_type === 'out' ? Math.max(0, prev - qty)
    : data.movement_type === 'adjustment' ? qty
    : prev;

  await pool.query(
    `INSERT INTO inventory (product_id, quantity) VALUES ($1, $2)
     ON CONFLICT (product_id) DO UPDATE SET quantity = $2, updated_at = CURRENT_TIMESTAMP`,
    [data.product_id, newQty],
  );

  const { rows } = await pool.query(
    `INSERT INTO inventory_movements (product_id, movement_type, quantity, previous_stock, new_stock, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.product_id, data.movement_type, qty, prev, newQty, data.notes || ''],
  );
  return rows[0];
}
