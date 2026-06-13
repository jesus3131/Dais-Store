import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 8001,
  user: 'postgres',
  password: 'Jr200131',
  database: 'dais_store',
});

pool.on('error', (err) => {
  console.error('DB pool error:', err);
});

export default pool;
