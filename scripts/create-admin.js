const bcrypt = require('bcryptjs');
const db = require('../backend/src/db');

async function createAdmin(email, password) {
  try {
    const existing = await db.query(
      `SELECT u.id FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE r.name = $1`,
      ['admin']
    );

    if (existing.rows.length > 0) {
      console.log('[SETUP] Admin user already exists');
      return;
    }

    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    if (userExists.rows.length > 0) {
      console.log('[SETUP] User with this email already exists');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [email.toLowerCase(), passwordHash, 'Admin', 'User']
    );

    const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', ['admin']);
    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
      result.rows[0].id,
      roleResult.rows[0].id,
    ]);

    console.log('[SETUP] Admin user created successfully');
    console.log(`[SETUP] Email: ${email}`);
  } catch (err) {
    console.error('[SETUP] Error:', err.message);
  } finally {
    process.exit(0);
  }
}

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'Admin123!';

createAdmin(email, password);
