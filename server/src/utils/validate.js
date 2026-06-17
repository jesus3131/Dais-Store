export function requireFields(body, fields) {
  const missing = fields.filter(f => !body[f] && body[f] !== 0);
  if (missing.length > 0) {
    throw Object.assign(new Error(`Campos requeridos: ${missing.join(', ')}`), { status: 400 });
  }
}

export function sanitizeString(val, maxLen = 255) {
  if (typeof val !== 'string') return val;
  return val.slice(0, maxLen);
}

export function sanitizeNumeric(val) {
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export function catchRoute(fn) {
  return (req, res, next) => fn(req, res, next).catch(err => {
    const status = err.status || 500;
    const message = status === 500 ? 'Error interno del servidor' : err.message;
    res.status(status).json({ error: message });
  });
}
