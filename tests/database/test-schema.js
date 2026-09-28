const { test } = require('node:test');
const assert = require('node:assert');
const { pool } = require('../../backend/src/db');

const expectedTables = [
  'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
  'clients', 'consultants', 'contractors', 'projects', 'project_members',
  'calculation_categories', 'calculations', 'documents',
  'cost_items', 'audit_logs', 'ai_conversations', 'ai_messages'
];

for (const tableName of expectedTables) {
  test(`table ${tableName} exists`, async () => {
    const result = await pool.query(
      'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)',
      [tableName]
    );
    assert.strictEqual(result.rows[0].exists, true, `Table ${tableName} does not exist`);
  });
}

test('roles are seeded with at least 9 roles', async () => {
  const result = await pool.query('SELECT COUNT(*) FROM roles');
  assert.ok(parseInt(result.rows[0].count) >= 9, 'Expected at least 9 roles');
});

test('permissions are seeded with at least 22 permissions', async () => {
  const result = await pool.query('SELECT COUNT(*) FROM permissions');
  assert.ok(parseInt(result.rows[0].count) >= 22, 'Expected at least 22 permissions');
});

test('role_permissions are seeded', async () => {
  const result = await pool.query('SELECT COUNT(*) FROM role_permissions');
  assert.ok(parseInt(result.rows[0].count) >= 20, 'Expected at least 20 role-permission links');
});

test('calculation categories are seeded with 8 categories', async () => {
  const result = await pool.query('SELECT COUNT(*) FROM calculation_categories');
  assert.strictEqual(parseInt(result.rows[0].count), 8, 'Expected 8 calculation categories');
});

test('calculations table has foreign keys', async () => {
  const result = await pool.query(`
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_name = 'calculations' AND constraint_type = 'FOREIGN KEY'
  `);
  assert.ok(parseInt(result.rows[0].count) >= 3, 'Expected at least 3 foreign keys on calculations');
});

test('projects table has foreign keys', async () => {
  const result = await pool.query(`
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_name = 'projects' AND constraint_type = 'FOREIGN KEY'
  `);
  assert.ok(parseInt(result.rows[0].count) >= 4, 'Expected at least 4 foreign keys on projects');
});

test('indexes exist on projects table', async () => {
  const result = await pool.query(`
    SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'projects'
  `);
  assert.ok(parseInt(result.rows[0].count) >= 5, 'Expected at least 5 indexes on projects');
});

test('indexes exist on calculations table', async () => {
  const result = await pool.query(`
    SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'calculations'
  `);
  assert.ok(parseInt(result.rows[0].count) >= 4, 'Expected at least 4 indexes on calculations');
});
