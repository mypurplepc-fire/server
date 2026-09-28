-- Engineering Platform - Reference Data Seeds
-- Version: 1.0.0

-- ============================================
-- ROLES
-- ============================================

INSERT INTO roles (name, description) VALUES
  ('admin', 'System Administrator with full access'),
  ('project_manager', 'Project Manager'),
  ('civil_engineer', 'Civil Engineer'),
  ('structural_engineer', 'Structural Engineer'),
  ('quantity_surveyor', 'Quantity Surveyor'),
  ('site_engineer', 'Site Engineer'),
  ('surveyor', 'Surveyor'),
  ('document_controller', 'Document Controller'),
  ('viewer', 'Read-only Viewer')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PERMISSIONS
-- ============================================

INSERT INTO permissions (name, description) VALUES
  ('project:create', 'Create projects'),
  ('project:read', 'View projects'),
  ('project:update', 'Update projects'),
  ('project:delete', 'Delete projects'),
  ('calculation:create', 'Create calculations'),
  ('calculation:read', 'View calculations'),
  ('calculation:update', 'Update calculations'),
  ('calculation:delete', 'Delete calculations'),
  ('document:create', 'Upload documents'),
  ('document:read', 'View documents'),
  ('document:update', 'Update documents'),
  ('document:delete', 'Delete documents'),
  ('user:create', 'Create users'),
  ('user:read', 'View users'),
  ('user:update', 'Update users'),
  ('user:delete', 'Delete users'),
  ('cost:create', 'Create cost items'),
  ('cost:read', 'View cost items'),
  ('cost:update', 'Update cost items'),
  ('cost:delete', 'Delete cost items'),
  ('report:create', 'Create reports'),
  ('report:read', 'View reports'),
  ('ai:use', 'Use AI assistant')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ROLE PERMISSIONS
-- ============================================

-- Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Project Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'project_manager'
AND p.name IN (
  'project:create', 'project:read', 'project:update',
  'calculation:create', 'calculation:read', 'calculation:update',
  'document:create', 'document:read', 'document:update',
  'cost:create', 'cost:read', 'cost:update',
  'report:create', 'report:read',
  'ai:use'
)
ON CONFLICT DO NOTHING;

-- Civil Engineer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'civil_engineer'
AND p.name IN (
  'project:read',
  'calculation:create', 'calculation:read', 'calculation:update',
  'document:read', 'cost:read',
  'report:create', 'report:read',
  'ai:use'
)
ON CONFLICT DO NOTHING;

-- Structural Engineer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'structural_engineer'
AND p.name IN (
  'project:read',
  'calculation:create', 'calculation:read', 'calculation:update',
  'document:read', 'cost:read',
  'report:create', 'report:read',
  'ai:use'
)
ON CONFLICT DO NOTHING;

-- Quantity Surveyor
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'quantity_surveyor'
AND p.name IN (
  'project:read',
  'calculation:read',
  'document:read',
  'cost:create', 'cost:read', 'cost:update',
  'report:create', 'report:read'
)
ON CONFLICT DO NOTHING;

-- Site Engineer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'site_engineer'
AND p.name IN (
  'project:read',
  'calculation:read',
  'document:read',
  'cost:read',
  'report:read'
)
ON CONFLICT DO NOTHING;

-- Surveyor
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'surveyor'
AND p.name IN (
  'project:read',
  'calculation:create', 'calculation:read',
  'document:read'
)
ON CONFLICT DO NOTHING;

-- Document Controller
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'document_controller'
AND p.name IN (
  'project:read',
  'document:create', 'document:read', 'document:update', 'document:delete'
)
ON CONFLICT DO NOTHING;

-- Viewer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer'
AND p.name IN (
  'project:read',
  'calculation:read',
  'document:read',
  'cost:read',
  'report:read'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- CALCULATION CATEGORIES
-- ============================================

INSERT INTO calculation_categories (name, description) VALUES
  ('concrete', 'Concrete quantity calculations'),
  ('rebar', 'Rebar quantity calculations'),
  ('formwork', 'Formwork quantity calculations'),
  ('earthwork', 'Earthwork quantity calculations'),
  ('survey', 'Survey calculations'),
  ('structural', 'Structural calculations'),
  ('shoring', 'Shoring and excavation support calculations'),
  ('dewatering', 'Dewatering calculations')
ON CONFLICT (name) DO NOTHING;
