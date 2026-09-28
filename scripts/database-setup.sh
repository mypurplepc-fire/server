#!/bin/bash
set -e

DB_NAME="engineering_platform"
DB_USER="eng_platform_user"
DB_PASSWORD="${DB_PASSWORD:-changeme}"

echo "=== Engineering Platform - Database Setup ==="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] Please run with sudo: sudo bash scripts/database-setup.sh"
  exit 1
fi

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
  echo "[DB] Installing PostgreSQL..."
  apt-get update -qq
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl start postgresql
  systemctl enable postgresql
fi

echo "[DB] PostgreSQL version: $(psql --version)"

# Create user
echo "[DB] Creating database user..."
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || echo "[DB] User may already exist"

# Create database
echo "[DB] Creating database..."
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || echo "[DB] Database may already exist"

# Grant privileges
echo "[DB] Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -c "ALTER USER ${DB_USER} CREATEDB;"

# Run migrations
echo "[DB] Running migrations..."
sudo -u postgres psql -d ${DB_NAME} -f database/migrations/001_create_schema.sql

# Run seeds
echo "[DB] Running seeds..."
sudo -u postgres psql -d ${DB_NAME} -f database/seeds/001_reference_data.sql

echo ""
echo "=== Database Setup Complete ==="
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "Host: localhost"
echo "Port: 5432"
echo ""
echo "Update backend/.env with these credentials."
