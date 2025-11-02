# 🚂 Railway Crash Fix

## The Issue

Railway is crashing with: `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined`

This was caused by `import.meta.dirname` which doesn't work in Node.js v18.

## ✅ The Fix (Just Pushed)

I've updated the code to use `process.cwd()` instead, which works reliably in all Node.js versions and in production builds.

## 🔄 Force Railway to Rebuild

Railway might be using a cached build. Here's how to force a fresh deploy:

### Option 1: Redeploy in Dashboard (Easiest)

```
1. Go to Railway dashboard
2. Click on your CLDeal service
3. Click "Deployments" tab
4. Click on the latest deployment
5. Click the "..." menu (three dots)
6. Click "Redeploy"
```

### Option 2: Trigger with Empty Commit

```bash
git commit --allow-empty -m "Force Railway redeploy"
git push origin main
```

### Option 3: Clear Build Cache

```
1. Railway dashboard
2. CLDeal service
3. Settings tab
4. Scroll to "Danger Zone"
5. Click "Clear Build Cache"
6. Then redeploy
```

## ✅ Verify the Fix

After redeployment, check the logs. You should see:

```
✅ [Server] Serving static files from: /app/dist/public
✅ Server running on http://localhost:3000/
```

Instead of:

```
❌ TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument...
```

## 🎯 What Changed

**Before (broken on Railway):**
```js
const distPath = path.resolve(import.meta.dirname, "public");
```

**After (works everywhere):**
```js
const distPath = path.join(process.cwd(), "dist", "public");
```

## 📋 Quick Checklist

- [x] Code fixed and pushed to GitHub
- [ ] Railway detected the push
- [ ] Railway is rebuilding
- [ ] Check deploy logs for success
- [ ] App should start without errors

## 🆘 If Still Crashing

If it's still crashing after redeploy:

1. Check the **Build Logs** tab - did the build succeed?
2. Check the **Deploy Logs** tab - what's the exact error?
3. Verify environment variables are set:
   - `DATABASE_URL=${{MySQL.DATABASE_URL}}`
   - `OPENAI_API_KEY=sk-proj-...`
   - `NODE_ENV=production`

## 💡 Pro Tip

Railway should auto-deploy whenever you push to `main`. If it's not auto-deploying:

```
Settings → Deploys → Watch Paths
Make sure it's watching the right branch (main)
```

---

**The fix is live in GitHub. Just trigger a Railway redeploy and it should work!** 🚀
