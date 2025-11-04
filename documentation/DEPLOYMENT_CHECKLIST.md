# Production Deployment Checklist

Complete checklist before deploying to production.

## Pre-Deployment (1-2 weeks before)

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No console errors or warnings
- [ ] No ESLint errors
- [ ] Code reviewed by team
- [ ] No hardcoded secrets or credentials
- [ ] All TODO comments resolved

### Security Audit
- [ ] All inputs validated
- [ ] All outputs escaped
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers enabled
- [ ] JWT secrets are strong (32+ chars)
- [ ] No sensitive data in logs
- [ ] Database credentials secured
- [ ] API keys rotated

### Performance
- [ ] Database queries optimized
- [ ] Indexes created for frequent queries
- [ ] Images optimized and compressed
- [ ] Code splitting enabled
- [ ] Lazy loading implemented
- [ ] Caching strategy defined
- [ ] CDN configured (optional)
- [ ] Load testing completed

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] Runbook created
- [ ] Disaster recovery plan documented
- [ ] Team trained on deployment

---

## 1 Week Before Deployment

### Infrastructure Setup

#### Backend (Render/Railway/Heroku)
- [ ] Create production account
- [ ] Set up production database (MongoDB Atlas)
- [ ] Configure environment variables
- [ ] Set up monitoring/logging
- [ ] Configure backups
- [ ] Set up SSL/TLS certificates
- [ ] Configure custom domain
- [ ] Set up email service (SendGrid/Gmail)

#### Frontend (Vercel/Netlify)
- [ ] Create production account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Set up CDN
- [ ] Configure redirects/rewrites

#### Database (MongoDB Atlas)
- [ ] Create production cluster
- [ ] Configure backup settings
- [ ] Set up IP whitelist
- [ ] Create database user
- [ ] Enable encryption at rest
- [ ] Configure monitoring

### Third-Party Services
- [ ] Cloudinary account created and configured
- [ ] Email service configured (Gmail/SendGrid)
- [ ] Push notification service set up
- [ ] Analytics configured (optional)
- [ ] Error tracking (Sentry) configured (optional)
- [ ] CDN configured (optional)

### Secrets Management
- [ ] Generate new JWT secrets
- [ ] Generate new VAPID keys
- [ ] Create strong database password
- [ ] Create strong session secret
- [ ] Store all secrets securely (1Password/Vault)
- [ ] Document secret rotation policy

---

## 24 Hours Before Deployment

### Final Testing
- [ ] Full regression testing completed
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Security testing completed
- [ ] Mobile testing completed
- [ ] Cross-browser testing completed
- [ ] All critical paths tested

### Backup & Recovery
- [ ] Database backup created
- [ ] Code backup created
- [ ] Disaster recovery plan tested
- [ ] Rollback procedure documented
- [ ] Team trained on rollback

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up
- [ ] Alerts configured
- [ ] Dashboard created

### Communication
- [ ] Deployment window scheduled
- [ ] Team notified
- [ ] Stakeholders informed
- [ ] Support team briefed
- [ ] Maintenance page prepared (if needed)

---

## Deployment Day

### Pre-Deployment (2 hours before)
- [ ] All team members available
- [ ] Communication channels open
- [ ] Monitoring dashboards open
- [ ] Rollback plan reviewed
- [ ] Database backup verified
- [ ] Final code review completed

### Backend Deployment
- [ ] Build Docker image (if using containers)
- [ ] Run final tests
- [ ] Deploy to staging first
- [ ] Verify staging deployment
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Check health endpoint: `/api/health`
- [ ] Monitor error logs
- [ ] Monitor performance metrics

### Frontend Deployment
- [ ] Build production bundle: `npm run build`
- [ ] Verify build size
- [ ] Deploy to CDN/hosting
- [ ] Verify production deployment
- [ ] Clear CDN cache
- [ ] Test all critical paths
- [ ] Monitor error tracking
- [ ] Monitor performance metrics

### Database Migration (if needed)
- [ ] Create backup before migration
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Monitor database performance
- [ ] Check replication status

### Post-Deployment Verification
- [ ] Health check passes
- [ ] API endpoints responding
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Database queries working
- [ ] Real-time features working
- [ ] Email service working
- [ ] File uploads working
- [ ] No 500 errors in logs
- [ ] Performance metrics normal

---

## Post-Deployment (First 24 Hours)

### Monitoring
- [ ] Monitor error logs continuously
- [ ] Monitor performance metrics
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Monitor user activity
- [ ] Check for any anomalies

### Testing
- [ ] Smoke tests every 30 minutes
- [ ] User acceptance testing
- [ ] Critical path testing
- [ ] Load testing (if applicable)
- [ ] Security scanning

### Communication
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Gather user feedback
- [ ] Document any issues
- [ ] Create incident reports (if needed)

### Rollback Readiness
- [ ] Keep rollback plan ready
- [ ] Monitor for critical issues
- [ ] Be prepared to rollback if needed
- [ ] Document any rollback decisions

---

## Post-Deployment (First Week)

### Monitoring
- [ ] Daily review of error logs
- [ ] Daily review of performance metrics
- [ ] Weekly security scan
- [ ] Monitor user feedback
- [ ] Track key metrics

### Optimization
- [ ] Optimize slow queries
- [ ] Optimize slow endpoints
- [ ] Optimize images/assets
- [ ] Implement caching improvements
- [ ] Monitor and optimize costs

### Documentation
- [ ] Update runbook with actual procedures
- [ ] Document any issues encountered
- [ ] Document any workarounds
- [ ] Update deployment guide
- [ ] Create post-mortem (if issues occurred)

### Team
- [ ] Debrief with team
- [ ] Celebrate successful deployment
- [ ] Identify improvements
- [ ] Plan for next deployment

---

## Ongoing (Monthly)

### Maintenance
- [ ] Review and rotate secrets
- [ ] Update dependencies
- [ ] Security patches
- [ ] Database maintenance
- [ ] Log cleanup
- [ ] Backup verification

### Monitoring
- [ ] Review error trends
- [ ] Review performance trends
- [ ] Review security logs
- [ ] Review cost trends
- [ ] Review user feedback

### Planning
- [ ] Plan next deployment
- [ ] Identify improvements
- [ ] Plan feature releases
- [ ] Plan infrastructure upgrades
- [ ] Plan disaster recovery drills

---

## Environment Variables Checklist

### Backend Production
- [ ] NODE_ENV=production
- [ ] PORT=5000 (or appropriate port)
- [ ] MONGODB_URI=<production-uri>
- [ ] JWT_SECRET=<strong-secret>
- [ ] JWT_REFRESH_SECRET=<strong-secret>
- [ ] FRONTEND_URL=<production-url>
- [ ] CLOUDINARY_CLOUD_NAME=<value>
- [ ] CLOUDINARY_API_KEY=<value>
- [ ] CLOUDINARY_API_SECRET=<value>
- [ ] EMAIL_USER=<production-email>
- [ ] EMAIL_PASSWORD=<production-password>
- [ ] VAPID_PUBLIC_KEY=<value>
- [ ] VAPID_PRIVATE_KEY=<value>
- [ ] VAPID_SUBJECT=<value>
- [ ] OPENAI_API_KEY=<value> (if using AI)

### Frontend Production
- [ ] VITE_API_URL=<production-api-url>

---

## Security Checklist

### HTTPS/SSL
- [ ] SSL certificate installed
- [ ] Certificate auto-renewal configured
- [ ] HSTS header enabled
- [ ] Redirect HTTP to HTTPS

### Authentication
- [ ] JWT secrets are strong
- [ ] Refresh token rotation enabled
- [ ] Session timeout configured
- [ ] Password requirements enforced
- [ ] 2FA available (optional)

### Authorization
- [ ] Role-based access control working
- [ ] Admin endpoints protected
- [ ] User data isolation verified
- [ ] Cross-user access prevented

### Data Protection
- [ ] Database encryption enabled
- [ ] Backups encrypted
- [ ] Sensitive data masked in logs
- [ ] PII handled correctly
- [ ] GDPR compliance verified (if applicable)

### API Security
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] Output encoding enabled
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled

### Infrastructure
- [ ] Firewall configured
- [ ] DDoS protection enabled
- [ ] WAF configured (if available)
- [ ] VPN access for admin (if applicable)
- [ ] SSH key-based auth only
- [ ] No default credentials

---

## Performance Checklist

### Backend
- [ ] Response time < 200ms (p95)
- [ ] Database queries optimized
- [ ] Indexes created
- [ ] Connection pooling configured
- [ ] Caching enabled
- [ ] Compression enabled
- [ ] Load balancing configured (if needed)

### Frontend
- [ ] Page load time < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Code splitting enabled
- [ ] Lazy loading enabled
- [ ] Images optimized
- [ ] CSS/JS minified

### Database
- [ ] Query response time < 100ms
- [ ] Connection pool size optimized
- [ ] Replication lag < 1s
- [ ] Backup time < 1 hour
- [ ] Restore time tested

---

## Disaster Recovery Checklist

### Backup Strategy
- [ ] Daily backups configured
- [ ] Backups stored off-site
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

### Incident Response
- [ ] Incident response plan documented
- [ ] On-call rotation established
- [ ] Escalation procedures defined
- [ ] Communication plan established
- [ ] Post-incident review process defined

### Failover
- [ ] Failover procedure documented
- [ ] Failover tested
- [ ] Failover time < 5 minutes
- [ ] Data loss < 1 minute
- [ ] Automatic failover configured (if possible)

---

## Sign-Off

- [ ] Project Manager: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] DevOps/Infrastructure: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______

---

## Deployment Notes

```
Date: _______________
Version: _______________
Deployed By: _______________
Deployment Time: _______________
Issues Encountered: _______________
Resolution: _______________
Rollback Required: Yes / No
Notes: _______________
```

---

**Last Updated:** January 15, 2024
**Version:** 1.0.0
