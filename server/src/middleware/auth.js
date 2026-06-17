import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dais-store-jwt-secret-change-in-production';

export function generateToken(user) {
  return jwt.sign(
    { username: user.username, role: user.role, modules: user.modules || [] },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
}

export function requireModule(moduleName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (req.user.role === 'admin' || req.user.modules?.includes('*')) {
      return next();
    }
    if (req.user.modules?.includes(moduleName)) {
      return next();
    }
    return res.status(403).json({ error: `No tienes permiso para acceder a este módulo` });
  };
}
