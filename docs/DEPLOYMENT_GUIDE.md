# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ running
- Git configured
- Environment variables set

---

## Step 1: Environment Setup

### 1.1 Clone Repository
```bash
git clone https://github.com/ahmedrashadmoahmed-lang/TSC-CRM-github.git
cd TSC-CRM-github
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Configure Environment Variables
Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Monitoring
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"

# Optional: Notifications
SLACK_WEBHOOK_URL="your-slack-webhook"
EMAIL_SERVICE_API_KEY="your-email-key"
SMS_SERVICE_API_KEY="your-sms-key"
```

---

## Step 2: Database Setup

### 2.1 Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 2.2 Seed Database (Optional)
```bash
npx prisma db seed
```

### 2.3 Verify Connection
```bash
npx prisma studio
```

---

## Step 3: Build Application

### 3.1 Production Build
```bash
npm run build
```

### 3.2 Verify Build
Check for:
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Bundle size optimized
- ✅ All routes generated

---

## Step 4: Run Application

### 4.1 Development Mode
```bash
npm run dev
```
Access at: http://localhost:3000

### 4.2 Production Mode
```bash
npm run start
```

---

## Step 5: Configure Scheduled Tasks

### 5.1 Alert Evaluation (Every 5 minutes)
**Linux/Mac (crontab):**
```bash
*/5 * * * * curl -X POST http://your-domain.com/api/alerts/evaluate
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Every 5 minutes
4. Action: Start Program
5. Program: `curl`
6. Arguments: `-X POST http://your-domain.com/api/alerts/evaluate`

---

## Step 6: Production Deployment

### Option A: Vercel (Recommended)

#### 6.1 Install Vercel CLI
```bash
npm i -g vercel
```

#### 6.2 Deploy
```bash
vercel --prod
```

#### 6.3 Configure Environment
Add environment variables in Vercel dashboard.

#### 6.4 Configure Database
Use Vercel Postgres or external PostgreSQL.

---

### Option B: Docker

#### 6.1 Build Docker Image
```bash
docker build -t crm-dashboard .
```

#### 6.2 Run Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  crm-dashboard
```

#### 6.3 Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/crm
      - NEXTAUTH_SECRET=secret
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=crm
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

---

### Option C: Traditional Server

#### 6.1 Install PM2
```bash
npm install -g pm2
```

#### 6.2 Start Application
```bash
pm2 start npm --name "crm-dashboard" -- start
```

#### 6.3 Configure Auto-Restart
```bash
pm2 startup
pm2 save
```

#### 6.4 Monitor
```bash
pm2 monit
pm2 logs crm-dashboard
```

---

## Step 7: Configure Nginx (Optional)

### 7.1 Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.2 Enable SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com
```

---

## Step 8: Post-Deployment Verification

### 8.1 Health Check
```bash
curl http://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-25T10:00:00.000Z"
}
```

### 8.2 Test Dashboard
1. Open browser: http://your-domain.com/dashboard
2. Verify all charts load
3. Check KPIs display correctly
4. Test lead scoring
5. Verify alerts work

### 8.3 Performance Check
```bash
# Lighthouse audit
npx lighthouse http://your-domain.com/dashboard --view
```

Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

---

## Step 9: Monitoring Setup

### 9.1 Sentry Integration
Already configured in code. Just add DSN to environment.

### 9.2 Uptime Monitoring
Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### 9.3 Log Management
```bash
# PM2 logs
pm2 logs --lines 100

# Docker logs
docker logs -f container_name
```

---

## Step 10: Backup Strategy

### 10.1 Database Backups
```bash
# Daily backup script
pg_dump -U user crm_db > backup_$(date +%Y%m%d).sql
```

### 10.2 Automated Backups
```bash
# Cron job (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

### 10.3 Backup Retention
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

---

## Rollback Procedure

### If Issues Occur:

#### 1. Revert to Previous Version
```bash
git checkout v1.0.0-dashboard-enhanced
npm install
npm run build
pm2 restart crm-dashboard
```

#### 2. Restore Database
```bash
psql -U user crm_db < backup_20251125.sql
```

#### 3. Verify Rollback
```bash
curl http://your-domain.com/api/health
```

---

## Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Database Connection Issues
```bash
# Test connection
npx prisma db pull
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Security headers configured

---

## Performance Optimization

### 1. Enable Caching
```nginx
# Nginx caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
proxy_cache my_cache;
```

### 2. CDN Integration
Use Cloudflare or similar for:
- Static asset caching
- DDoS protection
- Global distribution

### 3. Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_opportunity_stage ON "Opportunity"(stage);
CREATE INDEX idx_stage_history_date ON "StageHistory"("changedAt");
```

---

## Support & Maintenance

### Regular Tasks:
- **Daily**: Check logs and error rates
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Update Procedure:
```bash
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart crm-dashboard
```

---

**Deployment Status**: ✅ Production Ready
**Last Updated**: 2025-11-25
**Version**: 1.0.0
