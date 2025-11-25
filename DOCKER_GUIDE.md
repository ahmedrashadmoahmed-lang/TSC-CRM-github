# 🐳 Docker Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### Step 1: Configure Environment
```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env and set your values:
# - POSTGRES_PASSWORD (required)
# - NEXTAUTH_SECRET (required, min 32 chars)
# - GOOGLE_GEMINI_API_KEY (optional)
```

### Step 2: Build and Run
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### Step 3: Initialize Database
```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Or push schema (development)
docker-compose exec app npx prisma db push

# Seed database (optional)
docker-compose exec app node prisma/seed.js
```

### Step 4: Access Application
- Application: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart app
```

### Rebuild Application
```bash
docker-compose up -d --build app
```

### Execute Commands
```bash
# Run Prisma commands
docker-compose exec app npx prisma studio

# Access database
docker-compose exec postgres psql -U postgres -d erp_database

# Shell access
docker-compose exec app sh
```

---

## Production Deployment

### Step 1: Build Production Image
```bash
docker build -t erp-system:latest .
```

### Step 2: Run with Environment Variables
```bash
docker run -d \
  --name erp-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  erp-system:latest
```

### Step 3: Use Docker Compose (Recommended)
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: erp-system:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
```

---

## Health Checks

### Application Health
```bash
curl http://localhost:3000/api/health
```

### Database Health
```bash
docker-compose exec postgres pg_isready -U postgres
```

### Redis Health
```bash
docker-compose exec redis redis-cli ping
```

---

## Backup and Restore

### Backup Database
```bash
# Using Docker
docker-compose exec postgres pg_dump -U postgres erp_database > backup.sql

# Or use the backup script
./scripts/backup.sh  # Linux/Mac
scripts\backup.bat   # Windows
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres erp_database < backup.sql
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Issues
```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec app npx prisma db pull
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Clear Everything and Start Fresh
```bash
# Stop and remove all containers, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

---

## Performance Optimization

### Multi-stage Build
The Dockerfile uses multi-stage builds to minimize image size:
- deps: Install dependencies
- builder: Build application
- runner: Production runtime (smallest)

### Volume Mounts (Development)
```yaml
# Add to docker-compose.yml for hot reload
volumes:
  - ./src:/app/src
  - ./public:/app/public
```

---

## Security Best Practices

1. **Never commit .env files**
2. **Use strong passwords**
3. **Keep images updated**
4. **Use non-root user** (already configured)
5. **Limit exposed ports**
6. **Use secrets management** in production

---

## Monitoring

### Container Stats
```bash
docker stats
```

### Application Logs
```bash
docker-compose logs -f --tail=100 app
```

### Database Logs
```bash
docker-compose logs -f postgres
```

---

## Scaling

### Horizontal Scaling
```bash
# Scale application instances
docker-compose up -d --scale app=3
```

### Load Balancer (Nginx)
```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - app
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t erp-system:latest .
      - name: Push to registry
        run: docker push erp-system:latest
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_SECRET | Yes | NextAuth secret (min 32 chars) |
| NEXTAUTH_URL | Yes | Application URL |
| GOOGLE_GEMINI_API_KEY | No | Google Gemini API key |
| REDIS_URL | No | Redis connection string |
| LOG_LEVEL | No | Logging level (info, debug, warn, error) |

---

## Support

For issues with Docker deployment:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Ensure ports are not in use
4. Check Docker/Docker Compose versions

**Minimum Requirements:**
- Docker: 20.10+
- Docker Compose: 2.0+
