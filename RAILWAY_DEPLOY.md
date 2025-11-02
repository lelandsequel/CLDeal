# Deploy CLDeal to Railway

## 🚂 Complete Railway Deployment Guide

Railway is the **easiest and best** way to deploy your CLDeal app. It provides both the database and hosting in one platform!

---

## ⚡ Quick Deploy (5 Minutes)

### 1. Create Railway Account
- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Create New Project from GitHub

```bash
# In Railway dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: lelandsequel/CLDeal
4. Railway will start building immediately!
```

### 3. Add MySQL Database

```bash
# In your Railway project:
1. Click "+ New" button
2. Select "Database"
3. Choose "MySQL"
4. Railway creates the database instantly!
```

### 4. Configure Environment Variables

Click on your **CLDeal service** (not the MySQL database):

Go to **"Variables"** tab and add:

```env
# Database (auto-links to your MySQL)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# OpenAI API (required for AI features)
OPENAI_API_KEY=sk-your-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-secure-random-secret-here

# App Configuration
NODE_ENV=production
VITE_APP_TITLE=C&L Deal Intelligence

# Optional
VITE_APP_LOGO=/logo.png
```

**Pro Tip:** The `${{MySQL.DATABASE_URL}}` syntax automatically uses your MySQL connection string!

### 5. Initialize Database

Option A: **Use Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run pnpm db:push

# Seed data (optional)
railway run npx tsx seed-data.ts
```

Option B: **Use Railway Shell**
```bash
# In Railway dashboard:
1. Click on your CLDeal service
2. Go to "Deploy" tab
3. Click "Shell"
4. Run: pnpm db:push
5. Run: npx tsx seed-data.ts
```

### 6. Deploy!

```bash
# Railway auto-deploys on git push!
git add .
git commit -m "Ready for Railway deployment"
git push origin main

# Railway will:
# ✅ Pull latest code
# ✅ Install dependencies
# ✅ Build the app
# ✅ Start the server
# ✅ Give you a public URL!
```

---

## 🌐 Access Your App

After deployment:

1. Go to your Railway project
2. Click on the CLDeal service
3. Go to "Settings" tab
4. You'll see your app URL: `https://your-app.up.railway.app`

**Optional: Add Custom Domain**
```bash
# In Settings:
1. Click "Domains"
2. Click "Generate Domain" for a Railway subdomain
3. Or add your own custom domain
```

---

## 📊 Railway Project Structure

Your Railway project will have **two services**:

```
Railway Project: CLDeal
├── CLDeal (Node.js app)
│   ├── Build: pnpm install && pnpm build
│   ├── Start: pnpm start
│   └── Port: 3000 (auto-detected)
└── MySQL (Database)
    ├── Auto-provisioned
    └── DATABASE_URL: mysql://...
```

---

## 🔧 Environment Variables Explained

### Required Variables

```env
# Database Connection (use Railway's auto-link)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# OpenAI API Key (get from platform.openai.com)
OPENAI_API_KEY=sk-proj-...

# JWT Secret (random string, 32+ characters)
JWT_SECRET=generate-a-secure-random-string-here

# Node Environment
NODE_ENV=production
```

### Optional Variables

```env
# App Branding
VITE_APP_TITLE=C&L Deal Intelligence
VITE_APP_LOGO=/logo.png

# AWS S3 (if using document storage)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# OAuth (if needed)
OAUTH_SERVER_URL=your-oauth-server
VITE_OAUTH_PORTAL_URL=your-oauth-portal
VITE_APP_ID=your-app-id
```

---

## 🛠️ Database Management

### Run Migrations

```bash
# Using Railway CLI
railway run pnpm db:push

# Or in Railway Shell
pnpm db:push
```

### Seed Sample Data

```bash
# Using Railway CLI
railway run npx tsx seed-data.ts

# Or in Railway Shell
npx tsx seed-data.ts
```

### Access Database

```bash
# Get credentials from Railway:
# 1. Click MySQL service
# 2. Go to "Variables" tab
# 3. Use these to connect:
#    - MYSQLHOST
#    - MYSQLPORT
#    - MYSQLUSER
#    - MYSQLPASSWORD
#    - MYSQLDATABASE

# Connect via CLI
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE>
```

---

## 🔍 Monitoring & Logs

### View Logs

```bash
# In Railway dashboard:
1. Click on CLDeal service
2. Go to "Deployments" tab
3. Click on latest deployment
4. View real-time logs

# Or use CLI
railway logs
```

### Check Health

```bash
# Railway auto-monitors your app
# Check in the dashboard:
# - Memory usage
# - CPU usage
# - Request metrics
# - Error rates
```

---

## 🚀 Continuous Deployment

Railway auto-deploys on every push to your main branch!

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Railway will:
# 1. Detect the push
# 2. Build the app
# 3. Deploy automatically
# 4. Keep old version running until new one is ready
# 5. Switch traffic to new version
```

**Configure Deploy Triggers:**
```bash
# In Railway dashboard:
1. Click CLDeal service
2. Go to "Settings"
3. Scroll to "Deploys"
4. Choose branch (main)
5. Enable "Auto Deploy"
```

---

## 💰 Cost Estimate

Railway pricing:

```
Free Tier:
- $5 credit/month
- Enough for small apps
- Shared resources

Usage-based beyond free tier:
- ~$0.000463/GB-hour (memory)
- ~$0.000231/vCPU-hour (compute)
- MySQL: ~$0.02/hour

Typical CLDeal cost:
- Development: $0-5/month (within free tier)
- Light production: $10-20/month
- Medium traffic: $20-50/month
```

---

## 📈 Scaling

Railway scales automatically!

```bash
# In Railway dashboard:
1. Click CLDeal service
2. Go to "Settings"
3. Scroll to "Resources"
4. Adjust:
   - vCPU
   - Memory
   - Replicas (horizontal scaling)
```

**Auto-scaling triggers:**
- High CPU usage
- High memory usage
- Increased request volume

---

## 🔒 Security

Railway handles:
- ✅ HTTPS/SSL certificates (automatic)
- ✅ Environment variable encryption
- ✅ Private networking between services
- ✅ DDoS protection
- ✅ Regular security updates

**Best Practices:**
```bash
1. Use strong JWT_SECRET
2. Don't commit .env files
3. Use Railway's secret variables
4. Enable 2FA on Railway account
5. Rotate secrets regularly
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Check logs in Railway dashboard
# Common issues:
1. Missing dependencies - Check package.json
2. Build command errors - Verify "build" script
3. Node version - Railway uses latest LTS

# Fix:
- Update package.json
- Push changes
- Railway will rebuild
```

### Database Connection Errors

```bash
# Verify DATABASE_URL is set
railway variables

# Test connection
railway run npx tsx -e "console.log(process.env.DATABASE_URL)"

# Make sure MySQL service is running
# Check MySQL service in Railway dashboard
```

### App Not Starting

```bash
# Check start command in package.json:
"start": "NODE_ENV=production node dist/index.js"

# Verify build output exists
# Check if dist/ folder is created during build

# View detailed logs
railway logs --follow
```

### Port Issues

```bash
# Railway auto-detects port 3000
# Make sure your app uses PORT env var:
const PORT = process.env.PORT || 3000;

# Or let Railway detect it automatically
```

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Railway Templates**: https://railway.app/templates

---

## ✅ Deployment Checklist

Before deploying:

- [ ] GitHub repo is up to date
- [ ] `.env.example` is committed (not `.env`)
- [ ] Build script works locally (`pnpm build`)
- [ ] Start script works locally (`pnpm start`)
- [ ] OpenAI API key ready
- [ ] Database schema is finalized

After deploying:

- [ ] Railway build succeeded
- [ ] Environment variables set
- [ ] Database migrations ran (`pnpm db:push`)
- [ ] Sample data loaded (optional)
- [ ] App URL is accessible
- [ ] Test all features
- [ ] Check logs for errors

---

## 🎉 Success!

Once deployed, your CLDeal app will be:

✅ **Live on the internet** with a public URL
✅ **Auto-deploying** on every git push
✅ **Backed by MySQL** database
✅ **Monitored 24/7** by Railway
✅ **Scaled automatically** as needed
✅ **100% Manus-free!**

Your app URL will be something like:
`https://cldeal-production.up.railway.app`

---

**Questions?** Check the Railway docs or the troubleshooting section above!

**Ready to deploy?** Follow the Quick Deploy steps at the top!
