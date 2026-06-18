import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '8001'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Jr200131',
        database: process.env.DB_NAME || 'dais_store',
      }
);

pool.on('error', (err) => {
  console.error('DB pool error:', err);
});

export default pool;
