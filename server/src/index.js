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
app.use('/api/products', requireAuthForMethods('POST', 'PUT', 'PATCH', 'DELETE'), productsRouter);
app.use('/api/page-sections', requireAuthForMethods('POST', 'PUT', 'PATCH', 'DELETE'), pageSectionsRouter);
app.use('/api/design-tokens', requireAuthForMethods('POST', 'PUT', 'PATCH', 'DELETE'), designTokensRouter);

// ---- Admin-only routes (full auth required) ----
app.use('/api/settings', requireAuthForMethods('POST', 'PUT', 'PATCH', 'DELETE'), settingsRouter);
app.use('/api/upload', authenticateToken, requireModule('products'), uploadRouter);
app.use('/api/inventory', authenticateToken, requireModule('inventory'), inventoryRouter);
app.use('/api/orders', authenticateToken, requireModule('orders'), ordersRouter);
app.use('/api/messages', authenticateToken, requireModule('messages'), messagesRouter);
app.use('/api/catalogs', authenticateToken, requireModule('catalogs'), catalogsRouter);
app.use('/api/customers', authenticateToken, requireModule('customers'), customersRouter);
app.use('/api/coupons', authenticateToken, requireModule('coupons'), couponsRouter);
app.use('/api/users', authenticateToken, requireModule('users'), usersRouter);
app.use('/api/accounting', authenticateToken, requireModule('accounting'), accountingRouter);
app.use('/api', authenticateToken, requireModule('accounting'), masterDataRouter);
app.use('/api', authenticateToken, requireModule('accounting'), accountingCoreRouter);
app.use('/api/inventory-movements', authenticateToken, requireModule('inventory'), inventoryMovementRouter);
app.use('/api/financial-reports', authenticateToken, requireModule('reports'), financialReportRouter);

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

const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await syncAdminUser();
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
