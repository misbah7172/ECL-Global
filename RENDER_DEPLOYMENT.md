# Deploying ECL Global to Render

This guide will walk you through deploying the ECL Global application to Render.

## Prerequisites

- A [Render](https://render.com) account
- Your code pushed to a GitHub repository
- A PostgreSQL database (Render will create this for you)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Connect Your Repository**
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create the services

2. **Configure Environment Variables**
   
   The following environment variables will be automatically configured:
   - `DATABASE_URL` - Auto-configured from the database
   - `SESSION_SECRET` - Auto-generated
   - `JWT_SECRET` - Auto-generated
   - `NODE_ENV` - Set to "production"

   **Manual Configuration Required:**
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (if using Stripe)
   - `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (if using Stripe)

3. **Deploy**
   - Click "Apply" to create the services
   - Render will:
     - Create a PostgreSQL database
     - Build your application
     - Run database migrations
     - Deploy your app

### Option 2: Manual Setup

1. **Create a PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `ecl-global-db`
   - Plan: Choose your plan (Free tier available)
   - Click "Create Database"
   - Copy the "Internal Database URL"

2. **Create a Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ecl-global`
     - **Environment**: `Node`
     - **Build Command**: `chmod +x build.sh && ./build.sh`
     - **Start Command**: `npm start`
     - **Plan**: Choose your plan

3. **Add Environment Variables**
   - In the web service settings, add:
     ```
     NODE_ENV=production
     DATABASE_URL=[paste Internal Database URL from step 1]
     SESSION_SECRET=[generate a random 32+ character string]
     JWT_SECRET=[generate a random string]
     STRIPE_SECRET_KEY=[your Stripe secret key]
     STRIPE_PUBLISHABLE_KEY=[your Stripe publishable key]
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app

## Post-Deployment

### Verify Deployment

1. Visit your Render URL (e.g., `https://ecl-global.onrender.com`)
2. Check the logs for any errors
3. Test key functionality:
   - User registration/login
   - Course browsing
   - Enrollment process

### Database Management

**Run Migrations:**
```bash
# Render runs migrations automatically during build
# To run manually, use Render Shell:
npx prisma migrate deploy
```

**Seed Database:**
```bash
# Access Render Shell from dashboard
npx prisma db seed
```

**View Database:**
```bash
# Use Prisma Studio (local only)
npx prisma studio
```

### Environment Variables

To update environment variables:
1. Go to your service in Render Dashboard
2. Click "Environment"
3. Add/edit variables
4. Save changes (triggers auto-redeploy)

### Custom Domain (Optional)

1. Go to your web service settings
2. Click "Custom Domains"
3. Add your domain
4. Configure DNS records as instructed

## Health Check

The application includes a health check endpoint at `/api/health`. Render uses this to monitor your service.

## Monitoring & Logs

- **View Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Available in the service dashboard
- **Alerts**: Configure in service settings

## Troubleshooting

### Build Fails

- Check build logs in Render Dashboard
- Ensure all dependencies are in `package.json`
- Verify `build.sh` has execute permissions

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check database is running and accessible
- Review connection string format

### Application Errors

- Check application logs in Render Dashboard
- Verify all required environment variables are set
- Ensure migrations ran successfully

### Performance Issues

- Consider upgrading to a paid plan
- Enable auto-scaling in service settings
- Optimize database queries

## Automatic Deployments

Render automatically deploys when you push to your main branch. To disable:
1. Go to service settings
2. Uncheck "Auto-Deploy"

## Scaling

To handle more traffic:
1. Upgrade to a paid plan
2. Increase instance size
3. Enable horizontal scaling (multiple instances)

## Cost Optimization

- Free tier: Good for testing
- Starter plan: Best for small projects
- Standard+: For production apps with traffic

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check logs first for error details

## Security Notes

1. **Never commit `.env` files** - Use environment variables in Render
2. **Rotate secrets regularly** - Update `SESSION_SECRET` and `JWT_SECRET` periodically
3. **Use HTTPS** - Enabled by default on Render
4. **Keep dependencies updated** - Run `npm audit` regularly

## Maintenance

### Update Dependencies
```bash
npm update
npm audit fix
```

### Database Backups
- Render automatically backs up PostgreSQL databases
- Configure backup retention in database settings

### Rolling Back
1. Go to "Events" in your service
2. Find the previous successful deploy
3. Click "Rollback"

---

## Quick Reference

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
npm start
```

**Health Check:**
```
/api/health
```

**Required Environment Variables:**
- `DATABASE_URL`
- `SESSION_SECRET`
- `JWT_SECRET`
- `NODE_ENV`

**Optional Environment Variables:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
