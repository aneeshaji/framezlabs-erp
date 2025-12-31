#!/bin/bash

# EC2 Disk Cleanup Script
# Run this to free up space when you hit "no space left on device" errors

echo "🧹 Starting Disk Cleanup..."
echo "--------------------------------"

# 1. Check current space
echo "📊 Current Disk Usage:"
df -h / | grep /
echo "--------------------------------"

# 2. Clean NPM Cache
echo "🗑️  Cleaning NPM Cache..."
npm cache clean --force
rm -rf ~/.npm/_cacache
echo "✅ NPM Cache cleaned"

# 3. Clean System Logs (Journalctl)
echo "🗑️  Vacuuming System Logs..."
sudo journalctl --vacuum-time=1s
echo "✅ System logs cleaned"

# 4. Clean Apt Cache
echo "🗑️  Cleaning Apt Cache..."
sudo apt-get clean
sudo apt-get autoremove -y
echo "✅ Apt cache cleaned"

# 5. Flush PM2 Logs
echo "🗑️  Flushing PM2 Logs..."
pm2 flush
# Optional: remove old log files if flush isn't enough
rm -f ~/.pm2/logs/*.log
rm -f ~/.pm2/logs/*.gz
echo "✅ PM2 logs flushed"

# 6. Clean Temporary Files
echo "🗑️  Cleaning /tmp..."
sudo rm -rf /tmp/*
echo "✅ /tmp cleaned"

# 7. Yarn cache (if user used yarn previously)
if [ -d "~/.cache/yarn" ]; then
    echo "🗑️  Cleaning Yarn Cache..."
    rm -rf ~/.cache/yarn
    echo "✅ Yarn cache cleaned"
fi

echo "--------------------------------"
echo "✨ Cleanup Complete!"
echo "📊 New Disk Usage:"
df -h / | grep /
echo "--------------------------------"
echo "👉 Now try running your deployment script again: ./deploy-to-ec2.sh"
