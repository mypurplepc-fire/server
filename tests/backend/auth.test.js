const { test } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const db = require('../../backend/src/db');

test('password hashing works correctly', async () => {
  const password = 'TestPassword123!';
  const hash = await bcrypt.hash(password, 12);
  const isValid = await bcrypt.compare(password, hash);
  assert.strictEqual(isValid, true);
});

test('password hashing rejects wrong password', async () => {
  const password = 'TestPassword123!';
  const wrongPassword = 'WrongPassword123!';
  const hash = await bcrypt.hash(password, 12);
  const isValid = await bcrypt.compare(wrongPassword, hash);
  assert.strictEqual(isValid, false);
});

test('users table has required columns', async () => {
  const result = await db.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'users'
     AND column_name IN ('id', 'email', 'password_hash', 'first_name', 'last_name', 'is_active')`
  );
  assert.strictEqual(result.rows.length, 6);
});

test('roles table has admin role', async () => {
  const result = await db.query("SELECT name FROM roles WHERE name = 'admin'");
  assert.strictEqual(result.rows.length, 1);
});

test('user_roles table has correct structure', async () => {
  const result = await db.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'user_roles'
     AND column_name IN ('user_id', 'role_id')`
  );
  assert.strictEqual(result.rows.length, 2);
});

test('role_permissions table has correct structure', async () => {
  const result = await db.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'role_permissions'
     AND column_name IN ('role_id', 'permission_id')`
  );
  assert.strictEqual(result.rows.length, 2);
});
