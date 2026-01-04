# Restore Your PM2 Processes (Fixed for .env)

If `.env` files are not loading, we need to explicitly load them before starting the process.

## 1. Restore Atsense (Port 5001)

```bash
cd ~/atsense/backend
# Load .env variables into the environment
set -a; source .env; set +a
# Start with the loaded variables
PORT=5001 pm2 start server.js --name "atsense-backend"
```

## 2. Restore FramezLabs (Port 5002)

```bash
cd ~/framezlabs/server
# Load .env variables into the environment
set -a; source .env; set +a
# Start with the loaded variables
PORT=5002 pm2 start server.js --name "framezlabs-backend"
```

## 3. Deployment Script (Port 5003)

The deployment script handles this automatically for the new app.

```bash
cd ~/framezlabs-erp
./deploy-to-ec2.sh
```

## 4. Final Save

```bash
pm2 save
```

## Note on .env
Make sure your `.env` file actually exists in the directory!
```bash
ls -la .env
```
If it's missing, you'll need to recreate it.
