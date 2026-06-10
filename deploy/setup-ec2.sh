#!/usr/bin/env bash
# One-time provisioning for an Ubuntu EC2 instance hosting lead.ipkwealth.com.
# Run as a sudo-capable user: bash setup-ec2.sh
set -euo pipefail

REPO_URL="https://github.com/IPK-Tech-Solutions/IPK_CRM.git"
APP_DIR="$HOME/IPK_CRM"

echo "==> Updating system packages"
sudo apt-get update -y
sudo apt-get upgrade -y

echo "==> Installing base tools"
sudo apt-get install -y curl git build-essential ufw

echo "==> Installing Node.js 20.x"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> Installing PM2"
sudo npm install -g pm2

echo "==> Installing Nginx"
sudo apt-get install -y nginx

echo "==> Installing Certbot (Let's Encrypt)"
sudo apt-get install -y certbot python3-certbot-nginx

echo "==> Configuring firewall"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "==> Cloning repository"
if [ -d "$APP_DIR" ]; then
  echo "Repo already exists at $APP_DIR, skipping clone"
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "==> Next steps:"
echo "1. Copy backend/.env.production.example to $APP_DIR/spotlight/backend/.env and fill in real values"
echo "2. Copy frontend/.env.production.example to $APP_DIR/spotlight/frontend/.env"
echo "3. Run $APP_DIR/spotlight/deploy/deploy.sh to build and start the apps with PM2"
echo "4. Install the Nginx config:"
echo "     sudo cp $APP_DIR/spotlight/deploy/nginx/lead.ipkwealth.com.conf /etc/nginx/sites-available/"
echo "     sudo ln -sf /etc/nginx/sites-available/lead.ipkwealth.com.conf /etc/nginx/sites-enabled/"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo "5. Issue SSL certificate:"
echo "     sudo certbot --nginx -d lead.ipkwealth.com"
echo "6. Enable PM2 on boot:"
echo "     pm2 startup systemd"
echo "     (run the printed sudo command), then: pm2 save"
