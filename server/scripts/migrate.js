import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'migrations');

async function runMigrations() {
  await pool.query(`CREATE TABLE IF NOT EXISTS _schema_migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const { rows: done } = await pool.query('SELECT filename FROM _schema_migrations');
  const doneSet = new Set(done.map(r => r.filename));

  for (const file of files) {
    if (doneSet.has(file)) {
      console.log(`[migrate] SKIP ${file} (already executed)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[migrate] RUN ${file}...`);
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`[migrate] OK ${file}`);
    } catch (err) {
      console.error(`[migrate] ERROR ${file}: ${err.message}`);
      throw err;
    }
  }

  console.log('[migrate] All migrations completed');
}

runMigrations()
  .then(async () => { await pool.end(); console.log('[migrate] Done'); process.exit(0); })
  .catch(async (err) => { await pool.end(); console.error('[migrate] Fatal:', err); process.exit(1); });
