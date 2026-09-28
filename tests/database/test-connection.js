const { test } = require('node:test');
const assert = require('node:assert');
const { pool, testConnection } = require('../../backend/src/db');

test('database connection succeeds', async () => {
  const result = await testConnection();
  assert.strictEqual(result.success, true, `Connection failed: ${result.error}`);
});

test('database version is PostgreSQL', async () => {
  const result = await testConnection();
  assert.ok(result.version.includes('PostgreSQL'), `Unexpected version: ${result.version}`);
});

test('pool can execute queries', async () => {
  const result = await pool.query('SELECT 1 as value');
  assert.strictEqual(result.rows[0].value, 1);
});
