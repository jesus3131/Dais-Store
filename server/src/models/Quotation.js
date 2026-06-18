import pool from '../db.js';

const TABLE = 'quotations';

function pad(num) {
  return String(num).padStart(6, '0');
}

async function nextNumber() {
  const { rows } = await pool.query("SELECT nextval('quotation_number_seq') AS seq");
  const year = new Date().getFullYear();
  return `COT-${year}-${pad(rows[0].seq)}`;
}

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT q.*, u.username AS created_by_name
     FROM ${TABLE} q
     LEFT JOIN users u ON u.id = q.created_by
     ORDER BY q.created_at DESC`,
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT q.*, u.username AS created_by_name
     FROM ${TABLE} q
     LEFT JOIN users u ON u.id = q.created_by
     WHERE q.id = $1`,
    [id],
  );
  return rows[0] || null;
}

export async function getByNumber(number) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE number = $1`, [number]);
  return rows[0] || null;
}

export async function create(data, userId) {
  const {
    client_name, client_email, client_phone, client_document,
    items, subtotal, tax, discount, total,
    notes, terms, valid_until,
  } = data;

  if (!client_name) throw new Error('El nombre del cliente es obligatorio');
  if (!items || !items.length) throw new Error('Agregue al menos un item a la cotización');

  const number = await nextNumber();

  const { rows } = await pool.query(
    `INSERT INTO ${TABLE}
       (number, client_name, client_email, client_phone, client_document,
        items, subtotal, tax, discount, total, notes, terms, valid_until, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [number, client_name, client_email || null, client_phone || null, client_document || null,
     JSON.stringify(items), subtotal ?? 0, tax ?? 0, discount ?? 0, total ?? 0,
     notes || null, terms || null, valid_until || null, userId],
  );
  return rows[0];
}

export async function update(id, fields) {
  const allowed = [
    'client_name', 'client_email', 'client_phone', 'client_document',
    'items', 'subtotal', 'tax', 'discount', 'total', 'notes', 'terms',
    'status', 'valid_until', 'sent_at', 'accepted_at', 'rejected_at',
  ];
  const setClauses = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(key === 'items' ? JSON.stringify(fields[key]) : fields[key]);
    }
  }
  if (setClauses.length === 0) return getById(id);
  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
  return rowCount > 0;
}

export async function updateStatus(id, status) {
  const timestampCol = status === 'sent' ? 'sent_at'
    : status === 'accepted' ? 'accepted_at'
    : status === 'rejected' ? 'rejected_at' : null;
  let query;
  if (timestampCol) {
    query = `UPDATE ${TABLE} SET status = $1, ${timestampCol} = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
  } else {
    query = `UPDATE ${TABLE} SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
  }
  const { rows } = await pool.query(query, [status, id]);
  return rows[0] || null;
}
