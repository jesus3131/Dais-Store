import pool from '../db.js';

/* ===== PLAN DE CUENTAS ===== */
export async function getAccounts() {
  const { rows } = await pool.query('SELECT * FROM account_charts ORDER BY code');
  return rows;
}

export async function getAccount(id) {
  const { rows } = await pool.query('SELECT * FROM account_charts WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createAccount(data) {
  const { rows } = await pool.query(
    `INSERT INTO account_charts (code, name, type, level, parent_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.code, data.name, data.type, data.level || 3, data.parent_id || null],
  );
  return rows[0];
}

export async function updateAccount(id, data) {
  const { rows } = await pool.query(
    `UPDATE account_charts SET code=$1,name=$2,type=$3,level=$4,parent_id=$5,is_active=$6 WHERE id=$7 RETURNING *`,
    [data.code, data.name, data.type, data.level, data.parent_id || null, data.is_active ?? true, id],
  );
  return rows[0] || null;
}

/* ===== TERCEROS ===== */
export async function getThirdParties(filters = {}) {
  let sql = 'SELECT * FROM third_parties WHERE 1=1';
  const params = [];
  let idx = 1;
  if (filters.type) { sql += ` AND type = $${idx++}`; params.push(filters.type); }
  if (filters.search) { sql += ` AND (name ILIKE $${idx} OR document_number ILIKE $${idx})`; params.push(`%${filters.search}%`); idx++; }
  sql += ' ORDER BY name ASC';
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getThirdParty(id) {
  const { rows } = await pool.query('SELECT * FROM third_parties WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createThirdParty(data) {
  const { rows } = await pool.query(
    `INSERT INTO third_parties (type, document_type, document_number, name, email, phone, address, city)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.type, data.document_type || 'NIT', data.document_number, data.name, data.email || '', data.phone || '', data.address || '', data.city || ''],
  );
  return rows[0];
}

export async function updateThirdParty(id, data) {
  const fields = []; const params = []; let idx = 1;
  for (const key of ['type', 'document_type', 'document_number', 'name', 'email', 'phone', 'address', 'city', 'is_active']) {
    if (data[key] !== undefined) { fields.push(`${key}=$${idx++}`); params.push(data[key]); }
  }
  if (!fields.length) return null;
  params.push(id);
  const { rows } = await pool.query(`UPDATE third_parties SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`, params);
  return rows[0] || null;
}

/* ===== CENTROS DE COSTO ===== */
export async function getCostCenters() {
  const { rows } = await pool.query('SELECT * FROM cost_centers ORDER BY code');
  return rows;
}

export async function createCostCenter(data) {
  const { rows } = await pool.query(
    'INSERT INTO cost_centers (code, name) VALUES ($1,$2) RETURNING *',
    [data.code, data.name],
  );
  return rows[0];
}

/* ===== CUENTAS BANCARIAS ===== */
export async function getBankAccounts() {
  const { rows } = await pool.query('SELECT * FROM bank_accounts WHERE is_active = true ORDER BY bank_name');
  return rows;
}

export async function createBankAccount(data) {
  const { rows } = await pool.query(
    `INSERT INTO bank_accounts (bank_name, account_type, account_number, account_chart_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.bank_name, data.account_type, data.account_number, data.account_chart_id || null],
  );
  return rows[0];
}
