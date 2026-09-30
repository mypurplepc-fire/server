#!/bin/bash
set -e

echo "=== Construction ERP Deployment ==="

cd /opt/construction-erp

echo "Pulling latest code..."
git pull origin main

echo "Stopping existing containers..."
docker-compose down

echo "Rebuilding and starting containers..."
docker-compose up --build -d

echo "Running database migrations..."
docker-compose exec web flask db upgrade

echo "=== Deployment complete ==="
