#!/bin/bash
# ============================================================
# ec2_setup.sh — Run once on a fresh Ubuntu 22.04 EC2 instance
# Usage: chmod +x ec2_setup.sh && sudo ./ec2_setup.sh
# ============================================================
set -e

echo "🔧 [1/6] Updating system packages..."
apt-get update -y && apt-get upgrade -y

echo "🐳 [2/6] Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "⚙️  [3/6] Configuring Docker..."
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu   # allow ubuntu user to run docker without sudo

echo "🌐 [4/6] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx

echo "🔒 [5/6] Configuring firewall (UFW)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'    # ports 80 + 443
ufw allow 8000            # FastAPI direct access (for testing)
ufw --force enable

echo "📁 [6/6] Creating app directory..."
mkdir -p /opt/forensics
chown ubuntu:ubuntu /opt/forensics

echo ""
echo "✅ EC2 setup complete!"
echo "   Next: copy your project to /opt/forensics and run docker compose up -d"
echo "   Or let GitHub Actions deploy automatically."
