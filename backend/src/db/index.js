const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    client.release();
    return {
      success: true,
      time: result.rows[0].time,
      version: result.rows[0].version,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
};
