# 🚀 Deployment Guide

This guide covers deployment strategies for the Tecno Gamerz Hub platform.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   API Server    │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (PostgreSQL)  │
│   Next.js       │    │   NestJS        │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌍 Environments

### Development
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: Local PostgreSQL + Redis via Docker

### Staging
- **Web**: https://staging.tecnogamerzhub.com
- **API**: https://api-staging.tecnogamerzhub.com
- **Database**: Railway PostgreSQL + Redis

### Production
- **Web**: https://tecnogamerzhub.com
- **API**: https://api.tecnogamerzhub.com
- **Database**: Railway PostgreSQL + Redis

## 📋 Prerequisites

### Required Accounts
- [GitHub](https://github.com) - Source code and CI/CD
- [Vercel](https://vercel.com) - Web app hosting
- [Railway](https://railway.app) - API and database hosting

### Required Tools
- Docker & Docker Compose
- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 🔐 Environment Variables

### Web App (.env)
```bash
# Required
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-secret"
DATABASE_URL="postgresql://..."
API_URL="https://api.your-domain.com"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TWITCH_CLIENT_ID="your-twitch-client-id"
TWITCH_CLIENT_SECRET="your-twitch-client-secret"

# Optional
REDIS_URL="redis://..."
SENTRY_DSN="https://..."
ANALYTICS_ID="GA-..."
```

### API Server (.env)
```bash
# Required
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# Configuration
API_PORT=3001
CORS_ORIGIN="https://your-domain.com"
NODE_ENV="production"

# Storage (optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Monitoring
SENTRY_DSN="https://..."
```

## 🚀 Deployment Steps

### 1. Initial Setup

#### Set up Railway Services
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway create tecno-gamerz-hub

# Add PostgreSQL service
railway add postgresql

# Add Redis service
railway add redis
```

#### Set up Vercel Project
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Database Setup

#### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE tecno_gamerz_hub;

-- Create user (Railway handles this automatically)
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tecno_gamerz_hub TO app_user;
```

#### Run Migrations
```bash
# Set database URL
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Deploy migrations
pnpm db:migrate:deploy

# Seed production data (optional)
export ADMIN_EMAIL="admin@yourdomain.com"
pnpm db:seed
```

### 3. Web App Deployment (Vercel)

#### Automatic Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

#### Manual Deployment
```bash
# Build and deploy
vercel --prod

# Set environment variables
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all required variables
```

### 4. API Deployment (Railway)

#### Automatic Deployment
1. Connect GitHub repository to Railway
2. Configure environment variables
3. Deploy automatically on push to `main`

#### Manual Deployment
```bash
# Deploy to Railway
railway up

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set REDIS_URL=redis://...
# ... add all required variables
```

### 5. Domain Configuration

#### Custom Domains
```bash
# Vercel - Web App
vercel domains add tecnogamerzhub.com
vercel domains add www.tecnogamerzhub.com

# Railway - API
# Configure custom domain in Railway dashboard
# Add CNAME record: api.tecnogamerzhub.com -> railway-host
```

#### SSL Certificates
- Vercel: Automatic SSL with Let's Encrypt
- Railway: Automatic SSL for custom domains

## 🔄 CI/CD Configuration

### GitHub Secrets

#### Repository Secrets
```bash
# Vercel
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-org-id"
VERCEL_PROJECT_ID="your-project-id"

# Railway
RAILWAY_TOKEN="your-railway-token"
RAILWAY_PROJECT_ID="your-project-id"

# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Authentication
NEXTAUTH_SECRET="your-secure-secret"
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TWITCH_CLIENT_ID="your-twitch-client-id"
TWITCH_CLIENT_SECRET="your-twitch-client-secret"

# URLs
NEXTAUTH_URL="https://tecnogamerzhub.com"
API_URL="https://api.tecnogamerzhub.com"
CORS_ORIGIN="https://tecnogamerzhub.com"

# Admin
ADMIN_EMAIL="admin@tecnogamerzhub.com"
```

#### Environment-Specific Secrets
Create environments in GitHub: `preview`, `staging`, `production`

### Workflow Configuration

The project includes three main workflows:

1. **CI (`ci.yml`)**: Testing, linting, building
2. **Preview Deployments**: Automatic preview environments for PRs
3. **Production Deployment**: Deployment to production on main branch

## 🔍 Health Checks

### Web App Health Check
```typescript
// apps/web/src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
}
```

### API Health Check
```typescript
// Built-in health check at /health
GET https://api.tecnogamerzhub.com/health
```

## 📊 Monitoring

### Application Monitoring

#### Vercel Analytics
```bash
# Add to next.config.js
module.exports = {
  analytics: {
    id: process.env.VERCEL_ANALYTICS_ID,
  },
}
```

#### Railway Metrics
- CPU usage
- Memory usage
- Request metrics
- Database connections

### Error Tracking

#### Sentry Integration
```bash
# Install Sentry
pnpm add @sentry/nextjs @sentry/node

# Configure in sentry.client.config.js and sentry.server.config.js
```

### Uptime Monitoring
- Use Uptime Robot or similar service
- Monitor both web app and API endpoints
- Set up alerts for downtime

## 🔧 Maintenance

### Regular Tasks

#### Database Maintenance
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Analyze query performance
EXPLAIN ANALYZE SELECT ...

# Update statistics
ANALYZE;
```

#### Security Updates
```bash
# Update dependencies
pnpm update

# Run security audit
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

### Scaling

#### Horizontal Scaling
- Railway: Automatic scaling based on traffic
- Vercel: Edge functions with global distribution

#### Database Scaling
- Connection pooling with PgBouncer
- Read replicas for read-heavy workloads
- Database sharding for very large datasets

## 🚨 Disaster Recovery

### Backup Strategy

#### Database Backups
```bash
# Automated daily backups
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

#### Redis Backups
```bash
# Redis persistence is handled automatically
# Use Redis Cloud or similar for production
```

### Recovery Procedures

#### Application Recovery
1. Check service status on hosting platforms
2. Review error logs and metrics
3. Rollback to previous deployment if needed
4. Scale resources if necessary

#### Database Recovery
1. Identify issue (connection, performance, corruption)
2. Check database logs
3. Restore from backup if necessary
4. Run health checks after recovery

## 🔒 Security

### Production Security Checklist

- [ ] All secrets stored in environment variables
- [ ] SSL certificates configured and valid
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database access restricted
- [ ] API authentication working
- [ ] OAuth providers configured correctly
- [ ] Audit logging enabled
- [ ] Error tracking configured

### Security Monitoring

#### Automated Security Scanning
- Dependency vulnerability scanning
- Code security analysis with CodeQL
- Container security scanning
- Infrastructure security checks

#### Manual Security Reviews
- Regular penetration testing
- Code security reviews
- Infrastructure security audits
- Compliance checks (GDPR, etc.)

## 📈 Performance Optimization

### Web App Optimization
- Image optimization with Next.js
- Code splitting and lazy loading
- CDN configuration
- Edge caching strategies

### API Optimization
- Database query optimization
- Redis caching
- Connection pooling
- Background job processing

### Database Optimization
- Index optimization
- Query performance tuning
- Connection management
- Regular maintenance tasks

## 🆘 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
vercel logs
railway logs

# Local build test
pnpm build
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL

# Check connection pool
SELECT * FROM pg_stat_activity;
```

#### Authentication Issues
- Verify OAuth redirect URIs
- Check environment variables
- Test JWT token generation
- Validate session configuration

### Performance Issues

#### High Response Times
1. Check database query performance
2. Review caching strategies
3. Analyze server metrics
4. Scale resources if needed

#### Memory Issues
1. Check for memory leaks
2. Review garbage collection
3. Optimize queries and data structures
4. Scale server resources

## 📞 Support

### Getting Help
- **Documentation**: Check deployment docs and README
- **Logs**: Review application and platform logs
- **Monitoring**: Check metrics and error tracking
- **Community**: GitHub Discussions and Issues

### Emergency Contacts
- Platform Status Pages: Vercel Status, Railway Status
- Support Channels: Platform-specific support
- Team Contacts: Internal escalation procedures

---

**Happy Deploying! 🚀**