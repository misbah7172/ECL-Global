# Render Deployment Checklist

Use this checklist to ensure your ECL Global application is ready for deployment on Render.

## Pre-Deployment Checklist

### ✅ Code Preparation
- [x] Build script (`build.sh`) created and configured
- [x] Health check endpoint added (`/api/health`)
- [x] Environment variables documented (`.env.example`)
- [x] Package.json scripts updated for production
- [x] Port configuration using environment variable
- [x] Prisma client generation in postinstall
- [x] Database migrations ready in `prisma/migrations/`

### ✅ Configuration Files
- [x] `render.yaml` - Blueprint configuration
- [x] `.gitignore` - Excludes sensitive files
- [x] `.renderignore` - Excludes unnecessary deployment files
- [x] `RENDER_DEPLOYMENT.md` - Deployment guide
- [x] `README.md` - Project documentation

### 📋 Before You Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Prepare Environment Variables**
   - Generate a SESSION_SECRET (32+ characters)
   - Generate a JWT_SECRET
   - Get your Stripe keys (if using payments)

3. **Review Database Schema**
   - Check `prisma/schema.prisma` is up to date
   - Ensure all migrations are committed

## Deployment Steps

### Option 1: Blueprint (Recommended)

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render detects `render.yaml` automatically

3. **Configure Stripe (if needed)**
   - Add `STRIPE_SECRET_KEY`
   - Add `STRIPE_PUBLISHABLE_KEY`

4. **Apply Blueprint**
   - Click "Apply"
   - Wait for deployment (~5-10 minutes)

### Option 2: Manual Setup

Follow the detailed steps in [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

## Post-Deployment Verification

### ✅ Check Service Health

1. **Visit Your App**
   - URL: `https://your-app-name.onrender.com`

2. **Check Health Endpoint**
   - URL: `https://your-app-name.onrender.com/api/health`
   - Should return: `{"status":"healthy","timestamp":"...","environment":"production"}`

3. **Review Logs**
   - Render Dashboard → Your Service → Logs
   - Look for: "serving on port XXXX"
   - No error messages

### ✅ Test Core Features

- [ ] Homepage loads correctly
- [ ] User can register
- [ ] User can login
- [ ] Courses page displays courses
- [ ] Course detail page works
- [ ] Free courses accessible
- [ ] Study abroad services page loads
- [ ] Events page shows events
- [ ] Mock tests page functional
- [ ] Branches page displays locations

### ✅ Database Verification

1. **Check Migrations**
   - Logs should show: "Running database migrations..."
   - No migration errors

2. **Test Database Connection**
   - Try creating a test user
   - Check if data persists after refresh

### ✅ Performance Check

- [ ] Page load times acceptable (< 3 seconds)
- [ ] No console errors in browser
- [ ] Images load properly
- [ ] API responses fast (< 1 second)

## Common Issues & Solutions

### Build Fails

**Problem**: Build script fails
- Check build logs for specific error
- Verify all dependencies in package.json
- Ensure Node version is compatible (18+)

**Solution**:
```bash
# Locally test the build
npm install
npm run build
```

### Database Connection Failed

**Problem**: Cannot connect to database
- DATABASE_URL not set correctly
- Database not created

**Solution**:
- Verify DATABASE_URL in environment variables
- Check database service is running
- Use "Internal Database URL" from Render

### Health Check Failing

**Problem**: Health check endpoint not responding
- Server not starting
- Port configuration issue

**Solution**:
- Check logs for startup errors
- Verify PORT environment variable
- Ensure health endpoint is registered

### 502 Bad Gateway

**Problem**: Application not responding
- Build succeeded but app crashed
- Environment variables missing

**Solution**:
- Check application logs for errors
- Verify all required env vars set
- Check for unhandled promise rejections

## Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   - Render Dashboard → Events
   - Find last successful deploy
   - Click "Rollback"

2. **Fix Issues Locally**
   - Test fix locally
   - Commit and push
   - Automatic redeploy

## Monitoring

### Set Up Alerts

1. **Health Check Alerts**
   - Render monitors `/api/health` automatically
   - Get notified if service goes down

2. **Performance Monitoring**
   - Monitor response times
   - Track error rates

### Regular Maintenance

- [ ] Check logs weekly
- [ ] Review performance metrics
- [ ] Update dependencies monthly
- [ ] Rotate secrets every 90 days
- [ ] Backup database regularly (automatic on Render)

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | ✅ Yes |
| `SESSION_SECRET` | `random-32-char-string` | ✅ Yes |
| `JWT_SECRET` | `random-secret-string` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ⚠️ If using Stripe |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ⚠️ If using Stripe |

## Success Criteria

Your deployment is successful when:

✅ Build completes without errors
✅ Service shows "Live" status
✅ Health check returns 200 OK
✅ Homepage loads correctly
✅ Users can register/login
✅ Database operations work
✅ No errors in logs
✅ All pages accessible

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Add your domain in Render settings
   - Configure DNS records

2. **SSL Certificate**
   - Automatically provided by Render
   - Verify HTTPS works

3. **Scaling** (If Needed)
   - Upgrade plan for more resources
   - Enable autoscaling

4. **Continuous Deployment**
   - Already enabled by default
   - Push to main branch = auto deploy

5. **Monitoring & Analytics**
   - Set up error tracking
   - Add analytics (Google Analytics, etc.)

## Support Resources

- 📖 [Render Documentation](https://render.com/docs)
- 💬 [Render Community](https://community.render.com)
- 📧 [Render Support](https://render.com/support)
- 📚 [Project Documentation](./RENDER_DEPLOYMENT.md)

---

**Ready to Deploy?** Follow Option 1 (Blueprint) above to get started! 🚀
