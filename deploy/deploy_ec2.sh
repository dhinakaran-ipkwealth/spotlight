#!/usr/bin/env bash
# Single-command setup + deploy for the Spotlight feedback app on Ubuntu EC2.
# Builds the backend (port 4000) and frontend (port 4001), runs both under
# PM2, and configures Nginx so the app is reachable at https://lead.ipkwealth.com/.
#
# Usage: bash spotlight/deploy/deploy_ec2.sh
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/ubuntu/spotlight/}"
BRANCH_NAME="${BRANCH_NAME:-origin/main}"
SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"
SPOTLIGHT_DIR="$PROJECT_DIR/spotlight"

echo "======================================="
echo "🚀 SPOTLIGHT EC2 DEPLOY"
echo "======================================="
echo "Project dir : $PROJECT_DIR"
echo "Branch      : $BRANCH_NAME"

#################################################
# SWAP (helps `next build` on small instances)
#################################################
REQUIRED_SWAP_BYTES=$((SWAP_SIZE_GB * 1024 * 1024 * 1024))
CURRENT_SWAP_BYTES=0
[ -f /swapfile ] && CURRENT_SWAP_BYTES=$(stat -c%s /swapfile || echo 0)
if [ "$CURRENT_SWAP_BYTES" -lt "$REQUIRED_SWAP_BYTES" ]; then
  echo "==> Creating ${SWAP_SIZE_GB}GB swapfile"
  swapon --show=NAME --noheadings | grep -qx "/swapfile" && sudo swapoff /swapfile || true
  sudo rm -f /swapfile
  sudo fallocate -l "${SWAP_SIZE_GB}G" /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=$((SWAP_SIZE_GB * 1024))
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

#################################################
# SYSTEM DEPENDENCIES (skipped if already installed)
#################################################
if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20.x"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  sudo npm install -g pm2
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "==> Installing Nginx"
  sudo apt-get update -y
  sudo apt-get install -y nginx
fi

#################################################
# UPDATE SOURCE
#################################################
echo "==> Updating source code"
cd "$PROJECT_DIR"
git fetch origin "$BRANCH_NAME"
git checkout -B "$BRANCH_NAME" "origin/$BRANCH_NAME"
git reset --hard "origin/$BRANCH_NAME"
echo "HEAD: $(git log -1 --oneline)"

#################################################
# BACKEND BUILD
#################################################
echo "==> Building backend (NestJS)"
cd "$SPOTLIGHT_DIR/backend"
[ -f .env ] || cp .env.production.example .env
npm ci
npm run build

#################################################
# FRONTEND BUILD
#################################################
echo "==> Building frontend (Next.js)"
cd "$SPOTLIGHT_DIR/frontend"
[ -f .env ] || cp .env.production.example .env
npm ci
npm run build

#################################################
# PM2 (start or reload both apps)
#################################################
echo "==> Starting/reloading PM2 processes"
pm2 startOrReload "$SPOTLIGHT_DIR/deploy/ecosystem.config.js"
pm2 save

#################################################
# NGINX (reverse proxy for lead.ipkwealth.com)
#################################################
NGINX_CONF="/etc/nginx/sites-available/lead.ipkwealth.com.conf"
if [ ! -f "$NGINX_CONF" ]; then
  echo "==> Installing Nginx config (first run)"
  sudo cp "$SPOTLIGHT_DIR/deploy/nginx/lead.ipkwealth.com.conf" "$NGINX_CONF"
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/lead.ipkwealth.com.conf
  sudo nginx -t
  sudo systemctl reload nginx
  echo ""
  echo "⚠️  Nginx is configured for HTTP only. Once DNS for lead.ipkwealth.com"
  echo "   points to this instance, run:"
  echo "     sudo apt-get install -y certbot python3-certbot-nginx"
  echo "     sudo certbot --nginx -d lead.ipkwealth.com"
else
  echo "==> Reloading existing Nginx config"
  sudo nginx -t
  sudo systemctl reload nginx
fi

#################################################
# DONE
#################################################
echo ""
echo "======================================="
echo "✅ DEPLOY COMPLETE"
echo "======================================="
echo "Feedback form : https://lead.ipkwealth.com/  (or http:// until certbot runs)"
echo "Feedback API  : https://lead.ipkwealth.com/feedback"
pm2 status
