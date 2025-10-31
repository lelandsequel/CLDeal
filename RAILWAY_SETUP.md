# Railway Deployment Guide for C&L Deal Intelligence

This guide walks you through deploying the C&L Deal Intelligence app on Railway.

## Prerequisites

- Railway Pro account (you have this)
- GitHub repository (CLDeal)
- OpenAI API key
- Domain name (optional, for custom domain)

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect to your GitHub account (if not already connected)
5. Select the `CLDeal` repository
6. Select the `railway-migration` branch

## Step 2: Add Services

Railway will auto-detect the Node.js app from `package.json`. You need to add a MySQL database:

1. In the Railway project, click "Add Service"
2. Select "Database" → "MySQL"
3. Railway will provision a MySQL database with auto-generated credentials

## Step 3: Configure Environment Variables

Once both services are added, click on the Node.js service and go to "Variables".

Add these environment variables:

```
# App Configuration
VITE_APP_ID=cl-deal
VITE_APP_TITLE=C&L Deal Intelligence
VITE_APP_LOGO=https://your-domain.com/logo.png

# OAuth (replace with your OAuth provider)
VITE_OAUTH_PORTAL_URL=https://your-oauth-provider.com
OAUTH_SERVER_URL=https://your-oauth-provider.com

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-analytics-id

# JWT Secret (generate a random string)
JWT_SECRET=your-random-jwt-secret-min-32-chars

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Database (Railway provides this automatically)
DATABASE_URL=mysql://user:password@host:port/database

# Server
PORT=3000
NODE_ENV=production
```

**Important:** Railway will automatically inject the `DATABASE_URL` from the MySQL service. You only need to set the others.

## Step 4: Deploy

1. Once variables are set, Railway will automatically build and deploy
2. The build will:
   - Install dependencies with `npm install`
   - Run `npm run build` (Vite + esbuild)
   - Start the server with `npm run start`

3. Check the deployment logs in the "Deployments" tab

## Step 5: Database Migration

The app uses Drizzle ORM for migrations. To set up the database:

1. After first deployment, you need to run migrations
2. Open the Railway project shell (click on the Node.js service, "Connect")
3. Run: `npm run db:push`

Alternatively, you can push migrations before deploying by:
1. Connecting to the MySQL database locally
2. Running migrations locally
3. Then deploying the app

## Step 6: Connect Custom Domain (Optional)

1. In the Railway project, click on the Node.js service
2. Go to "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `cl-deal.com`)
5. Railway will show you DNS records to update

Update your domain registrar with the CNAME record provided by Railway.

## Environment Variables Reference

### Frontend (VITE_*)
- `VITE_APP_ID` - Unique app identifier
- `VITE_APP_TITLE` - App name shown in browser
- `VITE_APP_LOGO` - Logo URL
- `VITE_OAUTH_PORTAL_URL` - OAuth provider portal
- `VITE_ANALYTICS_ENDPOINT` - Analytics service URL (optional)
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics tracking ID (optional)

### Backend
- `DATABASE_URL` - MySQL connection string (auto-provided by Railway)
- `JWT_SECRET` - Secret for JWT signing (generate a random string)
- `OPENAI_API_KEY` - OpenAI API key for LLM features
- `OAUTH_SERVER_URL` - OAuth server endpoint
- `PORT` - Server port (default: 3000, Railway manages this)
- `NODE_ENV` - Environment (development/production)

## OAuth Migration

Currently, the app is configured for Manus OAuth. You need to update the OAuth provider:

### Option 1: Use Auth0 (Recommended)
1. Create Auth0 account
2. Create a new application
3. Update `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` with Auth0 URLs
4. Update `oauth.ts` to use Auth0

### Option 2: Use Clerk
1. Create Clerk account
2. Create new application
3. Update OAuth configuration

### Option 3: Custom JWT
If you prefer JWT-only auth without OAuth:
1. Keep `JWT_SECRET` configured
2. Create login endpoint that returns JWT
3. Client stores token in secure cookie

The current implementation uses cookies for session management, so any OAuth provider should work.

## Troubleshooting

### Build Fails
Check the build logs in Railway's "Deployments" tab:
- Missing environment variables
- Database connection issues
- Node.js version incompatibility

### App Crashes
Check "Runtime Logs" in the Node.js service:
- Missing DATABASE_URL
- Invalid OpenAI API key
- OAuth configuration errors

### Database Issues
1. Verify `DATABASE_URL` is set correctly
2. Check MySQL service is running (see "Services" tab)
3. Run `npm run db:push` to create tables

### Slow Deployments
- First deployment takes longer (npm install + build)
- Subsequent deployments are faster
- Check Railway logs for build time

## Monitoring & Logs

1. Click on the Node.js service
2. Go to "Logs" to see real-time logs
3. Go to "Metrics" to see CPU, memory, disk usage
4. Set up alerts if needed

## Next Steps

Once this app is running on Railway:
1. Test all features (search, CMA reports, deal scoring)
2. Verify OpenAI integration works
3. Test user authentication
4. Migrate the other 4 apps using the same setup
