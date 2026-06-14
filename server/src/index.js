import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';
import inventoryRouter from './routes/inventory.js';
import ordersRouter from './routes/orders.js';
import messagesRouter from './routes/messages.js';
import catalogsRouter from './routes/catalogs.js';
import accountingRouter from './routes/accounting.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/products', productsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/catalogs', catalogsRouter);
app.use('/api/accounting', accountingRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
