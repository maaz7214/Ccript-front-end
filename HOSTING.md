# Tumlinson Frontend - Production Hosting

## Live Application

**URL:** http://13.62.55.60

## Architecture

- **Next.js** - React framework running in production mode
- **PM2** - Process manager keeping the app alive
- **Nginx** - Reverse proxy on port 80

## Management Commands

### Application Status
```bash
pm2 status
pm2 logs tumlinson-frontend
```

### Restart Application
```bash
pm2 restart tumlinson-frontend
```

### View Nginx Status
```bash
sudo systemctl status nginx
```

### Rebuild and Deploy
```bash
cd /home/ec2-user/tumlinson-frontend
npm run build
pm2 restart tumlinson-frontend
```

## Auto-Start on Reboot

Both PM2 and Nginx are configured to start automatically on server reboot.

## AWS Security Group

Ensure your EC2 security group allows:
- **Port 80** (HTTP) - for web traffic
- **Port 443** (HTTPS) - if you add SSL later
- **Port 22** (SSH) - for server access

## Adding SSL (Optional)

To add HTTPS with Let's Encrypt:
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Configuration Files

- **Nginx config:** `/etc/nginx/conf.d/tumlinson-frontend.conf`
- **PM2 config:** `~/.pm2/dump.pm2`
- **Environment:** `/home/ec2-user/tumlinson-frontend/.env.local`
