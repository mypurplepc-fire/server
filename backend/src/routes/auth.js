const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required', status: 400 },
      });
    }

    const userResult = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password', status: 401 },
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated', status: 401 },
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password', status: 401 },
      });
    }

    const rolesResult = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    const permissionsResult = await db.query(
      `SELECT DISTINCT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    const roles = rolesResult.rows.map((r) => r.name);
    const permissions = permissionsResult.rows.map((p) => p.name);

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { userId: user.id, email: user.email, roles, permissions },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          roles,
          permissions,
        },
      },
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed', status: 500 },
    });
  }
});

router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

module.exports = router;
