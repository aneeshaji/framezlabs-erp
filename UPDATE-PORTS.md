# Update Ports in .env Files

It is much better to save the port in the `.env` file so you don't have to type it every time.

## 1. Update Atsense (Port 5001)

1. Open the file:
   ```bash
   nano ~/atsense/backend/.env
   ```
2. Find the line starting with `PORT=` and change it to:
   ```env
   PORT=5001
   ```
   *(If it's missing, add it on a new line)*
3. Save: Press `Ctrl+O`, `Enter`, then `Ctrl+X`.

## 2. Update FramezLabs (Port 5002)

1. Open the file:
   ```bash
   nano ~/framezlabs/server/.env
   ```
2. Change/Add:
   ```env
   PORT=5002
   ```
3. Save: `Ctrl+O`, `Enter`, `Ctrl+X`.

## 3. Restart Services

Now you can start them simply (without the `PORT=...` prefix):

```bash
# Restart Atsense
cd ~/atsense/backend
pm2 start server.js --name "atsense-backend" --update-env

# Restart FramezLabs
cd ~/framezlabs/server
pm2 start server.js --name "framezlabs-backend" --update-env

# Save
pm2 save
```
