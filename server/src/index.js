import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { authenticateToken, requireModule } from './middleware/auth.js';

import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';
import inventoryRouter from './routes/inventory.js';
import ordersRouter from './routes/orders.js';
import messagesRouter from './routes/messages.js';
import catalogsRouter from './routes/catalogs.js';
import pageSectionsRouter from './routes/pageSections.js';
import designTokensRouter from './routes/designTokens.js';
import accountingRouter from './routes/accounting.js';
import masterDataRouter from './routes/masterData.js';
import accountingCoreRouter from './routes/accountingCore.js';
import inventoryMovementRouter from './routes/inventoryMovement.js';
import financialReportRouter from './routes/financialReport.js';
import customersRouter from './routes/customers.js';
import couponsRouter from './routes/coupons.js';
import usersRouter from './routes/users.js';
import quotationsRouter from './routes/quotations.js';
import reportsRouter from './routes/reports.js';
import invoiceRouter from './routes/invoice.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.set('trust proxy', 1);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { error: 'Demasiadas solicitudes, intente de nuevo más tarde' },
  standardHeaders: true, legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión' },
  standardHeaders: true, legacyHeaders: false,
});
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, max: 5,
  message: { error: 'Demasiadas órdenes, espere un minuto' },
  standardHeaders: true, legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// CORS
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4000'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---- Auth-free routes (landing page & customer actions) ----
app.use('/api/auth', authRouter);
app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
app.get('/', (_req, res) => { res.redirect(301, 'https://dais-store.vercel.app'); });
app.post('/api/orders', orderLimiter, ordersRouter);  // customer places order
app.post('/api/messages', messagesRouter);              // contact form
app.post('/api/coupons/validate', couponsRouter);       // coupon validation

// ---- Routes: public read, admin write ----
function requireAuthForMethods(...methods) {
  return (req, res, next) => {
    if (methods.includes(req.method)) return authenticateToken(req, res, next);
    next();
  };
}
function requireAuthAndModule(moduleName, ...methods) {
  return (req, res, next) => {
    if (methods.includes(req.method)) {
      return authenticateToken(req, res, () => requireModule(moduleName)(req, res, next));
    }
    next();
  };
}
app.use('/api/products', requireAuthAndModule('products', 'POST', 'PUT', 'PATCH', 'DELETE'), productsRouter);
app.use('/api/page-sections', requireAuthAndModule('page-builder', 'POST', 'PUT', 'PATCH', 'DELETE'), pageSectionsRouter);
app.use('/api/design-tokens', requireAuthAndModule('site-design', 'POST', 'PUT', 'PATCH', 'DELETE'), designTokensRouter);

// ---- Admin-only routes (full auth required) ----
app.use('/api/settings', requireAuthForMethods('POST', 'PUT', 'PATCH', 'DELETE'), settingsRouter);
app.use('/api/upload', authenticateToken, requireModule('products'), uploadRouter);
app.use('/api/inventory', authenticateToken, requireModule('inventory'), inventoryRouter);
app.use('/api/orders', authenticateToken, requireModule('orders'), ordersRouter);
app.use('/api', authenticateToken, requireModule('orders'), invoiceRouter);
app.use('/api/messages', authenticateToken, requireModule('messages'), messagesRouter);
app.use('/api/catalogs', authenticateToken, requireModule('catalogs'), catalogsRouter);
app.use('/api/customers', authenticateToken, requireModule('customers'), customersRouter);
app.use('/api/coupons', authenticateToken, requireModule('coupons'), couponsRouter);
app.use('/api/users', authenticateToken, requireModule('users'), usersRouter);
app.use('/api/quotations', authenticateToken, requireModule('quotations'), quotationsRouter);
app.use('/api/accounting', authenticateToken, requireModule('accounting'), accountingRouter);
app.use('/api', authenticateToken, requireModule('accounting'), masterDataRouter);
app.use('/api', authenticateToken, requireModule('accounting'), accountingCoreRouter);
app.use('/api/inventory-movements', authenticateToken, requireModule('inventory'), inventoryMovementRouter);
app.use('/api/reports', authenticateToken, requireModule('reports'), reportsRouter);
app.use('/api/financial-reports', authenticateToken, requireModule('reports'), financialReportRouter);

// Self password change (any authenticated user)
app.patch('/api/users/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Contraseña actual y nueva requeridas' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    const { rows } = await pool.query('SELECT password_hash FROM public.users WHERE username = $1', [req.user.username]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!bcryptjs.compareSync(currentPassword, rows[0].password_hash))
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    const hash = bcryptjs.hashSync(newPassword, 10);
    await pool.query('UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE username = $2', [hash, req.user.username]);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('[PASSWORD CHANGE ERROR]', err);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// Analysis proxy to Python pandas service
app.get('/api/reports-analysis/:type', authenticateToken, requireModule('reports'), async (req, res) => {
  const { type } = req.params;
  const { period, from_date, to_date, limit } = req.query;
  const params = new URLSearchParams({ period: period || 'monthly', from_date: from_date || '', to_date: to_date || '', limit: String(limit || 10) });
  try {
    const response = await fetch(`http://127.0.0.1:5000/analyze/${type}?${params}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Python service returned ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.warn(`[ANALYSIS] Fallback for ${type}: ${err.message}`);
    res.json({ analysis: null, insights: {}, data: [] });
  }
});

process.on('uncaughtException', (err, origin) => {
  console.error(`[UNCAUGHT EXCEPTION] origin=${origin}`, err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION] reason=', reason);
});

// Ensure users table exists and sync .env admin credentials on startup
async function syncAdminUser() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) NOT NULL DEFAULT '',
      full_name VARCHAR(255) NOT NULL DEFAULT '',
      password_hash VARCHAR(255) NOT NULL,
      professional_card VARCHAR(255) DEFAULT '',
      role VARCHAR(50) DEFAULT 'worker',
      modules JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT true,
      is_superuser BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'worker'`);
    await pool.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS modules JSONB DEFAULT '[]'::jsonb`);
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'dais2024';
    const hash = bcryptjs.hashSync(password, 10);
    await pool.query(`
      INSERT INTO public.users (username, email, full_name, password_hash, role, modules, is_active, is_superuser, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'admin', '["*"]'::jsonb, true, true, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'admin',
        modules = '["*"]'::jsonb,
        is_active = true,
        is_superuser = true,
        updated_at = NOW()
    `, [username, `${username}@daisstore.com`, 'Administrador', hash]);
    console.log(`[AUTH] Admin user "${username}" synced`);
  } catch (err) {
    console.error('[AUTH] Sync failed:', err.message);
  }
}

// Security validation
function securityCheck() {
  const warnings = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dais-store-jwt-secret-change-in-production') warnings.push('JWT_SECRET no configurado o es el valor por defecto');
  if (!process.env.CORS_ORIGINS) warnings.push('CORS_ORIGINS no configurado — solo se aceptan peticiones locales');
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'dais2024') warnings.push('ADMIN_PASSWORD usa el valor por defecto — cámbielo en .env');
  if (warnings.length) console.warn(`\n⚠️  Advertencias de seguridad:\n  - ${warnings.join('\n  - ')}\n`);
}
const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await syncAdminUser();
  securityCheck();
});

const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    console.log('DB pool closed. Exiting.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced exit after timeout');
    process.exit(1);
  }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
