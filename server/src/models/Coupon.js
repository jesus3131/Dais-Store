import pool from '../db.js';

export async function getAll() {
  const { rows } = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getByCode(code) {
  const { rows } = await pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
  return rows[0] || null;
}

export async function create({ code, type, value, min_purchase, max_uses, starts_at, expires_at }) {
  if (!code) throw new Error('El código del cupón es obligatorio');
  const { rows } = await pool.query(
    `INSERT INTO coupons (code, type, value, min_purchase, max_uses, starts_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [code.toUpperCase(), type || 'percentage', value ?? 0, min_purchase || 0, max_uses || 0, starts_at || null, expires_at || null],
  );
  return rows[0];
}

export async function update(id, fields) {
  const allowed = ['code', 'type', 'value', 'min_purchase', 'max_uses', 'used_count', 'starts_at', 'expires_at', 'is_active'];
  const setClauses = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(key === 'code' ? (fields[key] || '').toUpperCase() : fields[key]);
    }
  }
  if (setClauses.length === 0) return getById(id);
  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE coupons SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function validate(code) {
  const coupon = await getByCode(code);
  if (!coupon) return { valid: false, reason: 'Cupón no encontrado' };
  if (!coupon.is_active) return { valid: false, reason: 'Cupón inactivo' };
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) return { valid: false, reason: 'Cupón agotado' };
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return { valid: false, reason: 'Cupón aún no vigente' };
  if (coupon.expires_at && new Date(coupon.expires_at) < now) return { valid: false, reason: 'Cupón expirado' };
  return { valid: true, coupon };
}
