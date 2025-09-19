const { Pool } = require('pg');

let poolInstance;

function createPool() {
  const connectionString = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 15000,
    keepAlive: true,
    query_timeout: 15000
  });

  pool.on('error', (err) => {
    console.error('Postgres pool error:', err.message);
  });

  pool.on('connect', (client) => {
    // Safety timeouts on server side to avoid long-hanging queries
    client.query('SET statement_timeout TO 15000').catch(() => {});
    client.query('SET idle_in_transaction_session_timeout TO 10000').catch(() => {});
    client.query('SET lock_timeout TO 5000').catch(() => {});
  });

  return pool;
}

function getPool() {
  if (!poolInstance) {
    poolInstance = createPool();
  }
  return poolInstance;
}

module.exports = {
  getPool
};


