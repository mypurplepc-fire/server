#!/bin/bash
set -e

echo "=== Ubuntu Server Setup ==="

apt update && apt upgrade -y

apt install -y docker.io docker-compose git

systemctl enable docker
systemctl start docker

mkdir -p /opt/construction-erp
cd /opt/construction-erp

git clone https://github.com/YOUR_USERNAME/construction-erp.git .

cp .env.example .env
echo "Edit .env with your production secrets!"

docker-compose up --build -d

echo "=== Setup complete. App running on port 80 ==="
