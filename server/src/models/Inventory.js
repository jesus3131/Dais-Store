import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query(`
    SELECT i.*, p.name AS product_name, p.image_url, p.price
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    ORDER BY p.name
  `);
  return rows;
}

export async function getLowStock() {
  const { rows } = await pool.query(`
    SELECT i.*, p.name AS product_name, p.image_url, p.price
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    WHERE i.quantity <= i.min_stock
    ORDER BY i.quantity ASC
  `);
  return rows;
}

export async function updateStock(productId, quantity) {
  const { rows } = await pool.query(
    `INSERT INTO inventory (product_id, quantity)
     VALUES ($1, $2)
     ON CONFLICT (product_id)
     DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [productId, quantity],
  );
  return rows[0];
}

export async function setMinStock(productId, minStock) {
  const { rows } = await pool.query(
    `UPDATE inventory SET min_stock = $2, updated_at = CURRENT_TIMESTAMP
     WHERE product_id = $1 RETURNING *`,
    [productId, minStock],
  );
  return rows[0];
}
