# 🚀 Quick Deployment Reference

## Your EC2 Port Layout
```
devnest       → Port 5000 → Port 81 (custom)
atsense       → Port 5001 → atsense.online
framezlabs    → Port 5002 → framezlabs.store
framezlabs-erp → Port 5003 → erp.famezlabs.store ✨
```

## Files Created for Deployment

| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 process configuration (port 5003) |
| `nginx-config-erp.famezlabs.store` | Nginx reverse proxy config |
| `client/.env.production` | Production API URL template |
| `deploy-to-ec2.sh` | Automated deployment script |

## Step-by-Step Deployment

### 📤 1. Push to GitHub
```bash
git add .
git commit -m "Add EC2 deployment configuration"
git push origin main
```

### 🖥️ 2. On EC2 - Pull Latest Code
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
cd ~/framezlabs-erp
git pull origin main
```

### ⚙️ 3. Verify Environment Files

Ensure your `.env` files are already configured with the correct values:
- ✅ `.env` - MongoDB URI
- ✅ `server/.env` - MongoDB URI, JWT_SECRET, PORT=5003
- ✅ `client/.env` - API URL (https://erp.famezlabs.store/api)

### 🤖 4. Run Deployment Script
```bash
chmod +x deploy-to-ec2.sh
./deploy-to-ec2.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Build frontend and backend
- ✅ Start backend with PM2
- ✅ Save PM2 configuration

### 🌐 5. Configure Nginx
```bash
sudo cp nginx-config-erp.famezlabs.store /etc/nginx/sites-available/erp.famezlabs.store
sudo ln -s /etc/nginx/sites-available/erp.famezlabs.store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 🔒 6. Get SSL Certificate
```bash
sudo certbot --nginx -d erp.famezlabs.store
```

### 🌍 7. Configure Route 53
1. AWS Console → Route 53 → `famezlabs.store`
2. Create Record:
   - **Name:** `erp`
   - **Type:** `A`
   - **Value:** Your EC2 Elastic IP
   - Click **Create**

### ✅ 8. Verify
```bash
# Check PM2
pm2 status
pm2 logs framezlabs-erp

# Test backend locally
curl http://localhost:5003/api

# Visit your site
# https://erp.famezlabs.store
```

## 📝 Useful Commands

```bash
# PM2 Management
pm2 status                      # Check all apps
pm2 logs framezlabs-erp        # View logs
pm2 restart framezlabs-erp     # Restart app
pm2 monit                      # Live monitoring

# Update Application
cd ~/framezlabs-erp
git pull origin main
cd client && npm run build && cd ..
cd server && npm run build && cd ..
pm2 restart framezlabs-erp

# Check Ports
sudo netstat -tlnp | grep node

# Nginx
sudo nginx -t                  # Test config
sudo systemctl reload nginx    # Reload
sudo tail -f /var/log/nginx/erp.famezlabs.store.access.log
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check `pm2 logs framezlabs-erp` |
| Can't access site | Check Route 53 DNS with `nslookup erp.famezlabs.store` |
| API calls fail | Verify backend running on port 5003 |
| SSL issues | Re-run `sudo certbot --nginx -d erp.famezlabs.store` |

## 🎯 Success Checklist

- [ ] Code pushed to GitHub
- [ ] `.env` files configured on EC2
- [ ] Deployment script executed successfully
- [ ] PM2 shows `framezlabs-erp` as online
- [ ] Nginx config created and enabled
- [ ] SSL certificate obtained
- [ ] Route 53 A record created
- [ ] Site accessible at `https://erp.famezlabs.store`

**Estimated Time:** 30-45 minutes 🚀
