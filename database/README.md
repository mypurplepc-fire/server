# Database Documentation

## Overview

PostgreSQL database for the Engineering Platform.

## Setup

### Quick Start

```bash
sudo bash scripts/database-setup.sh
```

This will:
1. Install PostgreSQL (if not present)
2. Create the database user and database
3. Run all migrations
4. Seed reference data

### Manual Setup

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create user and database
sudo -u postgres psql -c "CREATE USER eng_platform_user WITH PASSWORD 'changeme';"
sudo -u postgres psql -c "CREATE DATABASE engineering_platform OWNER eng_platform_user;"

# Run migrations
sudo -u postgres psql -d engineering_platform -f database/migrations/001_create_schema.sql

# Run seeds
sudo -u postgres psql -d engineering_platform -f database/seeds/001_reference_data.sql
```

## Schema

### Core Tables

| Table | Description |
|---|---|
| `users` | System users |
| `roles` | User roles (admin, engineer, etc.) |
| `permissions` | Granular permissions |
| `user_roles` | User-role assignments |
| `role_permissions` | Role-permission assignments |

### Project Tables

| Table | Description |
|---|---|
| `clients` | Client organizations |
| `consultants` | Consulting firms |
| `contractors` | Contracting companies |
| `projects` | Construction projects |
| `project_members` | Project team assignments |

### Calculation Tables

| Table | Description |
|---|---|
| `calculation_categories` | Calculation types (concrete, rebar, etc.) |
| `calculations` | Saved calculations with JSONB input/output |

### Document Tables

| Table | Description |
|---|---|
| `documents` | Project documents metadata |

### Cost Tables

| Table | Description |
|---|---|
| `cost_items` | BOQ cost items |

### Audit Tables

| Table | Description |
|---|---|
| `audit_logs` | System audit trail |

### AI Tables

| Table | Description |
|---|---|
| `ai_conversations` | AI chat conversations |
| `ai_messages` | AI chat messages |

## Migrations

Migrations are in `database/migrations/`. Run them in order:

```bash
sudo -u postgres psql -d engineering_platform -f database/migrations/001_create_schema.sql
```

## Seeds

Reference data is in `database/seeds/`. This includes:
- 9 system roles
- 22 permissions
- Role-permission mappings
- 8 calculation categories

## Testing

```bash
cd backend
npm test
```

## Backup

```bash
sudo -u postgres pg_dump engineering_platform > backup.sql
```

## Restore

```bash
sudo -u postgres psql engineering_platform < backup.sql
```
