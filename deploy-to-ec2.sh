#!/bin/bash

# FramezLabs ERP Deployment Script for EC2
# Run this script on your EC2 instance after cloning the repository

set -e  # Exit on error

echo "🚀 Starting FramezLabs ERP Deployment..."

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$HOME/framezlabs-erp"

# Step 1: Navigate to project directory
echo -e "${BLUE}📁 Navigating to project directory...${NC}"
cd $PROJECT_DIR

# Step 2: Verify environment files exist
echo -e "${BLUE}⚙️  Checking environment files...${NC}"

if [ ! -f .env ] || [ ! -f server/.env ] || [ ! -f client/.env ]; then
    echo -e "${RED}❌ Error: Environment files missing!${NC}"
    echo "Please ensure the following files exist and are configured:"
    echo "  - .env"
    echo "  - server/.env"
    echo "  - client/.env"
    exit 1
else
    echo -e "${GREEN}✓ All environment files found${NC}"
fi

# Step 3: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}📦 Installing server dependencies...${NC}"
cd server
npm install
cd ..

echo -e "${BLUE}📦 Installing client dependencies...${NC}"
cd client
npm install
cd ..

# Step 4: Build applications
echo -e "${BLUE}🔨 Building frontend...${NC}"
cd client
npm run build
cd ..

echo -e "${BLUE}🔨 Building backend...${NC}"
cd server
npm run build
cd ..

# Step 5: Create logs directory
echo -e "${BLUE}📋 Creating logs directory...${NC}"
mkdir -p logs

# Step 6: PM2 Setup
echo -e "${BLUE}🚦 Starting with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✓ PM2 started and saved${NC}"

# Step 7: Nginx Configuration
echo -e "${BLUE}⚙️  Nginx configuration...${NC}"
echo "To complete Nginx setup, run these commands with sudo:"
echo ""
echo "sudo cp $PROJECT_DIR/nginx-config-erp.famezlabs.store /etc/nginx/sites-available/erp.famezlabs.store"
echo "sudo ln -s /etc/nginx/sites-available/erp.famezlabs.store /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""

# Step 8: SSL Certificate
echo -e "${BLUE}🔒 SSL Certificate...${NC}"
echo "To get SSL certificate, run:"
echo "sudo certbot --nginx -d erp.famezlabs.store"
echo ""

# Step 9: Check status
echo -e "${BLUE}📊 Checking PM2 status...${NC}"
pm2 status

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Route 53 A record for erp.famezlabs.store"
echo "2. Run the Nginx commands shown above"
echo "3. Run certbot for SSL"
echo "4. Visit https://erp.famezlabs.store"
echo ""
echo "Useful commands:"
echo "  pm2 logs framezlabs-erp   # View logs"
echo "  pm2 restart framezlabs-erp # Restart app"
echo "  pm2 monit                 # Monitor resources"
