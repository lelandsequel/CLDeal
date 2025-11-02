# 🚂 Railway Quick Start - 5 Minutes to Live!

Since you already have **Railway** and **OpenAI API**, you're 95% done!

---

## ⚡ Super Quick Deploy

### 1. Go to Railway

```
https://railway.app
→ Login with GitHub
→ New Project
→ Deploy from GitHub repo
→ Select: lelandsequel/CLDeal
```

### 2. Add MySQL Database

```
In your Railway project:
→ Click "+ New"
→ Select "Database"
→ Choose "MySQL"
Done! Railway creates it instantly.
```

### 3. Set Environment Variables

Click on **CLDeal service** → **Variables** tab:

```env
DATABASE_URL=${{MySQL.DATABASE_URL}}
OPENAI_API_KEY=sk-your-openai-key-here
JWT_SECRET=make-up-a-random-secret-32-chars
NODE_ENV=production
VITE_APP_TITLE=C&L Deal Intelligence
```

**That's it!** Railway will auto-deploy.

### 4. Initialize Database

```bash
# Option A: Install Railway CLI
npm i -g @railway/cli
railway login
railway link
railway run pnpm db:push
railway run npx tsx seed-data.ts

# Option B: Use Railway web shell
# In dashboard → CLDeal service → Deploy → Shell
pnpm db:push
npx tsx seed-data.ts
```

### 5. Get Your URL

```
Railway dashboard → CLDeal service → Settings
Your app will be at: https://your-app.up.railway.app
```

---

## 🎯 What You Get

✅ **Full-stack hosting** - Backend + Database in one platform
✅ **Auto-deploys** - Every `git push` deploys automatically
✅ **MySQL included** - No separate database setup needed
✅ **HTTPS/SSL** - Automatic secure certificates
✅ **Monitoring** - Built-in logs and metrics
✅ **Scalable** - Auto-scales with traffic
✅ **$5 free/month** - Enough for development

---

## 💰 Cost

```
Free tier: $5 credit/month
Light usage: $10-20/month (beyond free tier)
Medium traffic: $20-50/month

Your setup:
- MySQL: ~$5-10/month
- App hosting: ~$5-10/month
- OpenAI API: Pay per use (~$5-50/month)
Total: $10-70/month (vs $$$ for Manus!)
```

---

## 🔄 Auto-Deploy Workflow

```bash
# Make changes locally
git add .
git commit -m "New feature"
git push origin main

# Railway automatically:
1. Detects the push
2. Installs dependencies
3. Builds the app
4. Runs migrations
5. Deploys to production
6. Switches traffic seamlessly
```

---

## 📚 Full Documentation

- **Detailed Guide**: See `RAILWAY_DEPLOY.md`
- **Setup Guide**: See `SETUP.md`
- **Quick Start**: See `NEXT_STEPS.md`

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] MySQL database added in Railway
- [ ] Environment variables set (DATABASE_URL, OPENAI_API_KEY, JWT_SECRET)
- [ ] Pushed latest code to GitHub
- [ ] Railway auto-deployed the app
- [ ] Ran `pnpm db:push` to create tables
- [ ] Ran `npx tsx seed-data.ts` for sample data
- [ ] Tested the app URL
- [ ] Navigation menu visible
- [ ] Properties showing up
- [ ] 🎉 **You're live!**

---

## 🎉 You're Done!

Your CLDeal app will be:
- ✨ **Live on the internet**
- ✨ **Manus-free** (no badge!)
- ✨ **Auto-deploying** on every push
- ✨ **Fully functional** with all features
- ✨ **Cost-effective** (~$10-20/month)

**Your app URL**: `https://your-app.up.railway.app`

---

**Questions?** See `RAILWAY_DEPLOY.md` for detailed troubleshooting!
