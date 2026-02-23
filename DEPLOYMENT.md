# 🚀 GovTech Intelligence Suite - Deployment Guide

Complete deployment guide for the GovTech Intelligence Suite enterprise platform.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Bun**: 1.x or higher (recommended) or npm/yarn
- **Database**: SQLite 3.x (included) or PostgreSQL/MySQL for production
- **Memory**: Minimum 2GB RAM, 4GB+ recommended
- **Disk**: 10GB+ free space
- **OS**: Linux, macOS, or Windows with WSL2

### Software Dependencies
```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or use npm
npm install -g npm@latest
```

---

## 🔧 Installation Steps

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd my-project

# Install dependencies
bun install

# Or with npm
npm install
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-long"

# AI Services (optional, for AI report generation)
ZAI_API_KEY="your-zai-api-key"
ZAI_API_URL="https://api.zai.com"

# Email Service (optional, for notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@govtech.ai"

# Application Settings
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Push schema to database
bun run db:push

# Or with npm
npx prisma db push
```

### 4. Initialize System

```bash
# Initialize all system components (permissions, workflows, demo data, settings)
curl -X POST http://localhost:3000/api/initialize

# Or initialize separately:
# 1. Permissions
curl -X POST http://localhost:3000/api/seed-permissions

# 2. Workflows
curl -X POST http://localhost:3000/api/seed-workflows

# 3. Demo Data
curl -X POST http://localhost:3000/api/seed
```

### 5. Start Development Server

```bash
bun run dev

# Or with npm
npm run dev
```

Visit: `http://localhost:3000`

---

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL (use Vercel Postgres or external DB)
# - NEXTAUTH_URL (your domain)
# - NEXTAUTH_SECRET
# - Other required environment variables
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json bun.lockb* package-lock.json* ./
RUN bun install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/db ./db
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t govtech-intelligence .
docker run -p 3000:3000 -e DATABASE_URL="file:./db/custom.db" govtech-intelligence
```

### Option 3: Traditional Server (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and setup
git clone <repository-url> /var/www/govtech
cd /var/www/govtech
bun install

# Build
bun run build

# Setup PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "govtech" -- start
pm2 save
pm2 startup
```

### Option 4: Kubernetes

Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: govtech-intelligence
spec:
  replicas: 3
  selector:
    matchLabels:
      app: govtech
  template:
    metadata:
      labels:
        app: govtech
    spec:
      containers:
      - name: govtech
        image: govtech-intelligence:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: govtech-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: govtech-secrets
              key: nextauth-secret
        - name: NEXTAUTH_URL
          value: "https://your-domain.com"
---
apiVersion: v1
kind: Service
metadata:
  name: govtech-service
spec:
  selector:
    app: govtech
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s/
```

---

## 🔐 Security Configuration

### 1. HTTPS/SSL

**Using Let's Encrypt with Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Using Cloudflare:**
1. Add domain to Cloudflare
2. Enable SSL/TLS in "Full" mode
3. Configure DNS records

### 2. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### 3. Rate Limiting

Rate limiting is built-in with different tiers:
- **AUTH**: 5 requests per 15 minutes
- **API**: 100 requests per minute
- **READ**: 200 requests per minute
- **WRITE**: 50 requests per minute
- **UPLOAD**: 10 requests per minute
- **SEARCH**: 30 requests per minute

Configure in `src/lib/security/rate-limiter.ts`

### 4. Password Policy

Default password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Password expires after 90 days
- Account locks after 5 failed attempts (15 minutes)

Configure in system settings or `src/lib/security/types.ts`

---

## 📊 Database Configuration

### SQLite (Default)
Already configured with `DATABASE_URL="file:./db/custom.db"`

### PostgreSQL (Production Recommended)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/govtech?schema=public"
```

```bash
# Create database
createdb govtech

# Run migrations
bun run db:push
```

### MySQL

```env
DATABASE_URL="mysql://user:password@localhost:3306/govtech"
```

---

## 🔄 Backup Strategy

### Database Backup

```bash
# SQLite backup
cp db/custom.db backups/custom-$(date +%Y%m%d-%H%M%S).db

# PostgreSQL backup
pg_dump govtech > backups/govtech-$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p backups
cp db/custom.db backups/custom-$DATE.db
# Keep last 7 days
find backups/ -name "custom-*.db" -mtime +7 -delete
```

### Restore from Backup

```bash
# SQLite
cp backups/custom-20240101-120000.db db/custom.db

# PostgreSQL
psql govtech < backups/govtech-20240101.sql
```

---

## 📈 Monitoring & Logging

### Application Logs

Logs are stored in:
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Audit logs: Database (AuditLog table)

### System Monitoring

Recommended tools:
- **Prometheus + Grafana** - Metrics and dashboards
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **New Relic** - APM

### Health Check Endpoint

```bash
curl http://localhost:3000/api/health
```

---

## 🧪 Testing Before Production

### Pre-Deployment Checklist

- [ ] All database migrations applied
- [ ] Permissions and workflows initialized
- [ ] Demo data loaded (if needed)
- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] Backup strategy tested
- [ ] Rate limiting tested
- [ ] Authentication flow tested
- [ ] All API endpoints tested
- [ ] Email notifications tested (if configured)
- [ ] Analytics dashboard tested
- [ ] Export functionality tested
- [ ] Search functionality tested

### Load Testing

```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.46.0/k6-v0.46.0-linux-amd64.tar.gz -L | tar xvz
sudo mv k6-v0.46.0-linux-amd64/k6 /usr/local/bin/

# Run load test
k6 run tests/load-test.js
```

---

## 🚀 Deployment Commands Quick Reference

```bash
# Development
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Database operations
bun run db:push          # Push schema
bun run db:studio        # Open Prisma Studio
bun run db:seed          # Seed demo data

# Code quality
bun run lint             # Check code
bun run lint:fix         # Fix lint issues

# Initialize system
curl -X POST http://localhost:3000/api/initialize

# Check initialization status
curl http://localhost:3000/api/initialize
```

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check DATABASE_URL in .env
# Ensure database file exists
ls -la db/
```

**Port Already in Use:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Permission Denied:**
```bash
# Fix file permissions
chmod -R 755 .
chmod 600 .env
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
bun install
bun run build
```

**Memory Issues:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" bun run dev
```

---

## 📞 Support

For deployment support:
- **Enterprise**: enterprise@govtech.ai
- **Documentation**: docs.govtech.ai
- **GitHub Issues**: github.com/govtech/enterprise/issues

---

## ✅ Post-Deployment Steps

1. **Verify all endpoints** are accessible
2. **Test authentication flow** with a test user
3. **Verify audit logs** are being created
4. **Test email notifications** (if configured)
5. **Set up monitoring alerts**
6. **Configure automated backups**
7. **Document deployment specifics**
8. **Train administrators**
9. **Create user accounts**
10. **Review security logs**

---

**Your GovTech Intelligence Suite is now deployed and ready to use! 🎉**
