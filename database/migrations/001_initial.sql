-- Engineering Platform - Initial Database Schema

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  project_code VARCHAR(50) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  consultant VARCHAR(255),
  contractor VARCHAR(255),
  location TEXT,
  contract_value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  start_date DATE,
  planned_end_date DATE,
  actual_end_date DATE,
  status VARCHAR(50) DEFAULT 'planning',
  description TEXT,
  project_manager_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Members
CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Project Documents
CREATE TABLE IF NOT EXISTS project_documents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_number VARCHAR(100),
  revision VARCHAR(20),
  document_type VARCHAR(50) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  file_size_bytes BIGINT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculation Categories
CREATE TABLE IF NOT EXISTS calculation_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculations
CREATE TABLE IF NOT EXISTS calculations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES calculation_categories(id),
  calculation_type VARCHAR(100) NOT NULL,
  engineer_id INTEGER REFERENCES users(id),
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  assumptions TEXT,
  notes TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost Items
CREATE TABLE IF NOT EXISTS cost_items (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_code VARCHAR(50),
  description TEXT NOT NULL,
  unit VARCHAR(20),
  quantity DECIMAL(15,4),
  rate DECIMAL(15,4),
  amount DECIMAL(15,4),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'System Administrator'),
  ('project_manager', 'Project Manager'),
  ('civil_engineer', 'Civil Engineer'),
  ('structural_engineer', 'Structural Engineer'),
  ('quantity_surveyor', 'Quantity Surveyor'),
  ('site_engineer', 'Site Engineer'),
  ('surveyor', 'Surveyor'),
  ('document_controller', 'Document Controller'),
  ('viewer', 'Read-only Viewer')
ON CONFLICT (name) DO NOTHING;

-- Insert default calculation categories
INSERT INTO calculation_categories (name, description) VALUES
  ('concrete', 'Concrete quantity calculations'),
  ('rebar', 'Rebar quantity calculations'),
  ('formwork', 'Formwork quantity calculations'),
  ('earthwork', 'Earthwork quantity calculations'),
  ('survey', 'Survey calculations'),
  ('structural', 'Structural calculations'),
  ('shoring', 'Shoring and excavation support'),
  ('dewatering', 'Dewatering calculations')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_project ON calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_calculations_category ON calculations(category_id);
CREATE INDEX IF NOT EXISTS idx_cost_items_project ON cost_items(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
