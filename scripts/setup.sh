#!/bin/bash
set -e

echo "=== Engineering Platform Setup ==="

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "[SETUP] Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "[SETUP] Node.js version: $(node --version)"
echo "[SETUP] npm version: $(npm --version)"

# Install backend dependencies
echo "[SETUP] Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "[SETUP] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "[SETUP] Setup complete!"
echo "[SETUP] Next steps:"
echo "  1. Configure backend/.env"
echo "  2. Set up PostgreSQL database"
echo "  3. Run migrations: psql -U eng_platform_user -d engineering_platform -f database/migrations/001_initial.sql"
echo "  4. Start backend: cd backend && npm run dev"
echo "  5. Start frontend: cd frontend && npm run dev"
