# Restaurant Inventory System - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- Server with Ubuntu/CentOS (recommended)

### Local Development
```bash
# Clone repository
git clone https://github.com/nopkhun/restaurant-inventory-system.git
cd restaurant-inventory-system

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Access application
# Frontend: http://localhost
# Backend API: http://localhost:3000
# Database: localhost:5432
```

## 🏗️ Production Deployment

### Server Setup

1. **Install Docker & Docker Compose**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone Repository**
```bash
cd /opt
sudo git clone https://github.com/nopkhun/restaurant-inventory-system.git
cd restaurant-inventory-system
sudo chown -R $USER:$USER .
```

3. **Configure Environment**
```bash
cp .env.example .env
nano .env  # Update with production values
```

4. **Deploy Application**
```bash
./scripts/deploy.sh
```

### GitHub Actions CI/CD Setup

1. **Add Repository Secrets**
   - `HOST`: `145.79.15.213` (your server IP)
   - `USERNAME`: `root`
   - `SSH_KEY`: (your private SSH key from ~/.ssh/id_rsa)
   - `PORT`: `22`

2. **Server SSH Setup**
```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "deployment@restaurant-system"

# Add public key to server
ssh-copy-id user@your-server-ip

# Add private key to GitHub Secrets
```

3. **Automatic Deployment**
   - Push to `main` branch triggers deployment
   - Tests run automatically
   - Docker images built and pushed to GitHub Container Registry
   - Server pulls and deploys latest images

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | Database name | `restaurant_inventory` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Required |
| `VITE_API_BASE_URL` | Frontend API URL | `http://localhost:3000/api/v1` |

### SSL/HTTPS Setup

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Generate SSL Certificate**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal**
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring

### Health Checks
- Backend: `GET /api/v1/health`
- Readiness: `GET /api/v1/ready`

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs
docker-compose logs -f
```

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres restaurant_inventory > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres restaurant_inventory < backup.sql
```

## 🔄 Updates

### Manual Update
```bash
git pull origin main
docker-compose pull
docker-compose up -d
```

### Rollback
```bash
# View previous images
docker images

# Use specific image tag
docker-compose down
# Edit docker-compose.yml to use previous tag
docker-compose up -d
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
sudo lsof -i :80
sudo lsof -i :3000
# Kill processes or change ports
```

2. **Database Connection Issues**
```bash
# Check database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres restaurant_inventory
```

3. **Frontend Build Issues**
```bash
# Rebuild frontend
docker-compose build frontend --no-cache
```

### Performance Optimization

1. **Database Tuning**
   - Adjust PostgreSQL configuration
   - Add database indexes
   - Monitor query performance

2. **Frontend Optimization**
   - Enable gzip compression
   - Add CDN for static assets
   - Implement caching headers

3. **Backend Optimization**
   - Add Redis for caching
   - Implement rate limiting
   - Monitor API performance

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Check server resources (CPU, memory, disk)
4. Review GitHub Actions logs for CI/CD issues

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] API rate limiting
- [ ] Input validation
- [ ] CORS configuration