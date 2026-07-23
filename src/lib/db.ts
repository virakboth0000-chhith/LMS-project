import mysql from 'mysql2/promise';

// Reuse a single pool across hot-reloads in dev so we don't open a new
// connection pool on every file save.
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const pool = global._mysqlPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

export default pool;
