import pool from '../db.js';

export async function getAll(filters = {}) {
  let sql = 'SELECT * FROM accounting_entries WHERE 1=1';
  const params = [];
  let idx = 1;

  if (filters.type) {
    sql += ` AND type = $${idx++}`;
    params.push(filters.type);
  }
  if (filters.category) {
    sql += ` AND category = $${idx++}`;
    params.push(filters.category);
  }
  if (filters.status) {
    sql += ` AND status = $${idx++}`;
    params.push(filters.status);
  }
  if (filters.from) {
    sql += ` AND entry_date >= $${idx++}`;
    params.push(filters.from);
  }
  if (filters.to) {
    sql += ` AND entry_date <= $${idx++}`;
    params.push(filters.to);
  }

  sql += ' ORDER BY entry_date DESC, created_at DESC';

  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM accounting_entries WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO accounting_entries (type, category, description, amount, entry_date, payment_method, reference, is_tax_deductible, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [data.type, data.category, data.description, data.amount, data.entry_date || new Date(),
     data.payment_method || 'transferencia', data.reference || '', data.is_tax_deductible || false, data.status || 'confirmed'],
  );
  return rows[0];
}

export async function update(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  for (const key of ['type', 'category', 'description', 'amount', 'entry_date', 'payment_method', 'reference', 'is_tax_deductible', 'status']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE accounting_entries SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM accounting_entries WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function getSummary(from, to) {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE type = 'income' AND status = 'confirmed'), 0) AS total_income,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND status = 'confirmed'), 0) AS total_expenses,
      COALESCE(SUM(amount) FILTER (WHERE type = 'income' AND status = 'pending'), 0) AS pending_income,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND status = 'pending'), 0) AS pending_expenses,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count
    FROM accounting_entries
    WHERE entry_date >= $1 AND entry_date <= $2
  `, [from, to]);
  return rows[0];
}

export async function getCategoryBreakdown(typeFilter, from, to) {
  const { rows } = await pool.query(`
    SELECT category, SUM(amount) AS total, COUNT(*) AS count
    FROM accounting_entries
    WHERE type = $1 AND status = 'confirmed' AND entry_date >= $2 AND entry_date <= $3
    GROUP BY category
    ORDER BY total DESC
  `, [typeFilter, from, to]);
  return rows;
}

export async function getDailyTotals(from, to) {
  const { rows } = await pool.query(`
    SELECT
      entry_date AS day,
      COALESCE(SUM(amount) FILTER (WHERE type = 'income' AND status = 'confirmed'), 0) AS income,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND status = 'confirmed'), 0) AS expense
    FROM accounting_entries
    WHERE entry_date >= $1 AND entry_date <= $2 AND status IN ('confirmed')
    GROUP BY entry_date
    ORDER BY day ASC
  `, [from, to]);
  return rows;
}

export async function getTaxSummary(year) {
  const { rows } = await pool.query(`
    SELECT
      TO_CHAR(entry_date, 'YYYY-MM') AS month,
      COALESCE(SUM(amount) FILTER (WHERE type = 'income' AND status = 'confirmed'), 0) AS income,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND status = 'confirmed'), 0) AS expense,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND status = 'confirmed' AND is_tax_deductible), 0) AS deductible_expenses
    FROM accounting_entries
    WHERE EXTRACT(YEAR FROM entry_date) = $1
    GROUP BY month
    ORDER BY month ASC
  `, [year]);
  return rows;
}
