# 🚀 Invoicing SaaS - Deployment Guide

Comprehensive deployment automation for development, staging, and production environments.

## 📋 Quick Start

### Development Environment
```bash
# Start development environment
make dev

# View logs
make dev-logs

# Build for development
make dev-build
```

### Production Deployment
```bash
# Deploy to production
./scripts/deploy.sh production

# Create backup
./scripts/backup.sh production

# Check health
make health
```

## 🛠️ Makefile Commands

### Development Commands
- `make dev` - Start development environment with hot reload
- `make dev-build` - Build Docker images for development
- `make dev-logs` - View development logs
- `make restart` - Quick restart of development environment

### Docker Operations
- `make docker-up` - Start all services
- `make docker-down` - Stop all services
- `make docker-build` - Build all Docker images
- `make docker-clean` - Clean up containers and volumes

### Database Management
- `make db-migrate` - Run database migrations
- `make db-seed` - Seed database with sample data
- `make db-reset` - Reset database (⚠️ destroys all data)

### Production Deployment
- `make prod-build` - Build optimized images for production
- `make prod-deploy` - Deploy to production environment
- `make prod-logs` - View production logs

### Testing & Quality
- `make test` - Run all Go tests
- `make test-api` - Test API endpoints
- `make lint` - Run linters (requires golangci-lint)
- `make format` - Format Go code

### Monitoring & Health
- `make health` - Check service health
- `make status` - Show service status and resource usage
- `make logs` - View all service logs

## 🌍 Environment Configuration

### Environment Files
Create environment-specific configuration files:

```bash
# Development
cp .env.example .env.dev

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.prod
```

### Environment Variables
```env
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
GIN_MODE=release
PORT=8080
```

## 🐳 Docker Environments

### Development
```bash
make dev
# Services: backend (localhost:8080), postgres (localhost:5432)
```

### Staging
```bash
make staging-deploy
# Services: backend (localhost:8081), postgres, nginx
```

### Production
```bash
./scripts/deploy.sh production
# Services: backend (port 8080), postgres, nginx (ports 80/443)
```

## 🔧 Manual Deployment (VPS/Server)

### 1. Server Setup
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo-url>
cd invoicing-saas
```

### 2. Environment Configuration
```bash
# Create production environment file
cat > .env.prod << EOF
DATABASE_URL=postgres://postgres:secure_password@postgres:5432/invoicing?sslmode=disable
JWT_SECRET=your-very-secure-production-jwt-secret
GIN_MODE=release
EOF
```

### 3. Deploy
```bash
# Deploy to production
./scripts/deploy.sh production

# Or using make
make prod-deploy
```

### 4. SSL/HTTPS Setup (Optional)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Update nginx configuration for SSL
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check all services
make health

# API endpoint test
make test-api

# Resource monitoring
make status
```

### Backups
```bash
# Create backup
./scripts/backup.sh production

# List backups
ls -la backups/

# Restore from backup
make restore BACKUP_FILE=backup_20240101_120000.sql.gz
```

### Logs
```bash
# View all logs
make logs

# Production logs only
make prod-logs

# Follow specific service
docker-compose logs -f backend
```

## 🔒 Security Considerations

### Production Security
- [ ] Use strong, unique passwords for database
- [ ] Generate secure JWT secrets (minimum 32 characters)
- [ ] Enable SSL/TLS in production
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Database backups to secure location

### SSL/TLS Setup
```bash
# Using Let's Encrypt (recommended)
sudo certbot --nginx -d yourdomain.com

# Or use self-signed for testing
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if postgres container is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Reset database
make db-reset
```

**Backend Won't Start**
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env

# Restart backend
make restart
```

**Port Already in Use**
```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill conflicting process
sudo kill -9 <PID>
```

**Permission Issues**
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER /opt/invoicing-*

# Or run with sudo
sudo make prod-deploy
```

### Getting Help
```bash
# View all available commands
make help

# Check service status
make status

# View detailed logs
make logs
```

## 📈 Scaling & Performance

### Horizontal Scaling
```yaml
# Add to docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
  # Load balancer configuration
```

### Database Optimization
```sql
-- Add to migration files for indexes
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_clients_user_name ON clients(user_id, name);
```

### Monitoring Setup
```bash
# Install monitoring tools
sudo apt install prometheus node-exporter

# Configure monitoring
# Add prometheus.yml configuration
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
make prod-build
make prod-deploy
```

### Database Migrations
```bash
# Create new migration
migrate create -ext sql -dir migrations -seq add_new_feature

# Run migrations
make db-migrate
```

### Backup Strategy
- **Daily**: Automated database backups
- **Weekly**: Full system snapshots
- **Monthly**: Offsite backup verification
- **Before Updates**: Pre-deployment backups

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs: `make logs`
3. Check service status: `make status`
4. Test basic functionality: `make health`

---

*This deployment guide provides a complete automation system for running the Invoicing SaaS application across development, staging, and production environments with proper monitoring, backups, and maintenance procedures.*
