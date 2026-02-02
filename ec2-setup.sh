#!/bin/bash

# EC2 Initial Setup Script
# Run this script on your EC2 instance to prepare it for deployment

set -e

echo "🚀 Starting EC2 setup for neura-frontend..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed: $(node --version)"
fi

# Install PM2
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "PM2 installed successfully"
else
    echo "PM2 is already installed: $(pm2 --version)"
fi

# Setup PM2 startup
echo "⚙️  Configuring PM2 startup..."
pm2 startup | grep -v "PM2" | bash || true

# Create application directory
APP_DIR="/var/www/neura-frontend"
echo "📁 Creating application directory at $APP_DIR..."
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

# Install Nginx (optional)
read -p "Do you want to install Nginx as a reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Nginx..."
    sudo apt-get install -y nginx
    
    # Create Nginx config
    echo "⚙️  Creating Nginx configuration..."
    sudo tee /etc/nginx/sites-available/neura-frontend > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/neura-frontend /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx installed and configured"
fi

# Setup firewall (UFW)
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo "Firewall rules added (SSH, HTTP, HTTPS)"
fi

echo ""
echo "✅ EC2 setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Generate SSH key pair for GitHub Actions"
echo "2. Add public key to this server's ~/.ssh/authorized_keys"
echo "3. Configure GitHub Secrets (see DEPLOYMENT_SETUP.md)"
echo "4. Push to main branch to trigger deployment"
echo ""
echo "Application directory: $APP_DIR"

