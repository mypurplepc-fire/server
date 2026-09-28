const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', status: 401 },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const userResult = await db.query(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found', status: 401 },
      });
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is deactivated', status: 401 },
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

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roles: rolesResult.rows.map((r) => r.name),
      permissions: permissionsResult.rows.map((p) => p.name),
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token', status: 401 },
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired', status: 401 },
      });
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Authentication error', status: 500 },
    });
  }
}

function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', status: 401 },
      });
    }

    if (req.user.roles.includes('admin')) {
      return next();
    }

    const hasPermission = requiredPermissions.every((perm) =>
      req.user.permissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions', status: 403 },
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
