const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('user:read'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
             u.last_login_at, u.created_at, u.updated_at,
             COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, data: { users: result.rows } });
  } catch (err) {
    console.error('[USERS] List error:', err.message);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to list users', status: 500 },
    });
  }
});

router.post('/', authenticate, authorize('user:create'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, roles } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email, password, first name, and last name are required', status: 400 },
      });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'User with this email already exists', status: 409 },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name',
      [email.toLowerCase(), passwordHash, firstName, lastName, phone]
    );

    const user = result.rows[0];

    if (roles && roles.length > 0) {
      for (const roleName of roles) {
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [
          roleName,
        ]);
        if (roleResult.rows.length > 0) {
          await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
            user.id,
            roleResult.rows[0].id,
          ]);
        }
      }
    }

    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    console.error('[USERS] Create error:', err.message);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create user', status: 500 },
    });
  }
});

router.put('/:id', authenticate, authorize('user:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, is_active, roles } = req.body;

    await db.query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE id = $5',
      [firstName, lastName, phone, is_active, id]
    );

    if (roles) {
      await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      for (const roleName of roles) {
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [
          roleName,
        ]);
        if (roleResult.rows.length > 0) {
          await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
            id,
            roleResult.rows[0].id,
          ]);
        }
      }
    }

    res.json({ success: true, data: { message: 'User updated' } });
  } catch (err) {
    console.error('[USERS] Update error:', err.message);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update user', status: 500 },
    });
  }
});

router.delete('/:id', authenticate, authorize('user:delete'), async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete your own account', status: 400 },
      });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) {
    console.error('[USERS] Delete error:', err.message);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete user', status: 500 },
    });
  }
});

module.exports = router;
