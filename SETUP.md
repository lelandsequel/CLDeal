# CLDeal Setup Guide - Independent Deployment

## 🎉 Manus-Free Setup

This app has been successfully migrated from Manus and now runs independently! The Manus branding badge has been removed.

---

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **MySQL Database** (see options below)
- **OpenAI API Key** (for AI-powered features)
- **pnpm** (or npm)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

**Option A: PlanetScale (Recommended - Free Tier)**

1. Go to https://planetscale.com and sign up
2. Create a new database named "cldeal"
3. Copy the connection string
4. Add to `.env`:
   ```
   DATABASE_URL=mysql://your-connection-string
   ```

**Option B: Railway (Free $5 credit/month)**

1. Go to https://railway.app
2. Create new MySQL database
3. Copy the connection URL
4. Add to `.env`

**Option C: Local MySQL**

```bash
# Install MySQL and create database
mysql -u root -p -e "CREATE DATABASE cldeal;"

# Add to .env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/cldeal
```

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

### 4. Configure Environment

Edit the `.env` file in the root directory. **Required:**

```env
DATABASE_URL=mysql://user:password@host:port/cldeal
OPENAI_API_KEY=sk-your-key-here
VITE_APP_TITLE=C&L Deal Intelligence
```

**Optional (but recommended):**

```env
JWT_SECRET=random-secret-string-here
AWS_ACCESS_KEY_ID=your-key  # For file uploads
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

### 5. Initialize Database

```bash
pnpm db:push
```

This creates all the necessary tables.

### 6. Seed Sample Data (Optional)

```bash
npx tsx seed-data.ts
```

This adds sample properties for testing.

### 7. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 🎯 Features & Requirements

### ✅ Available Without Full Setup

- **UI/UX** - Full interface loads
- **Navigation** - All pages accessible
- **Property List** - View sample properties (if seeded)

### ⚠️ Requires Database

- **Property Management** - Add, edit, delete properties
- **CSV Import** - Bulk import property data
- **Watchlist** - Save favorite properties
- **Saved Searches** - Store search criteria
- **Analytics** - Deal metrics and charts

### 🤖 Requires OpenAI API

- **AI Offer Letters** - Generate purchase offers
- **CMA Reports** - Comparative Market Analysis
- **Seller Motivation Scoring** - AI-powered analysis
- **Property Analysis** - Detailed report generation

### 📦 Requires AWS S3 (Optional)

- **Document Upload** - Store property documents
- **PDF Reports** - Save generated reports

---

## 📁 Database Schema

The app uses these main tables:

- **properties** - Property listings with financial data
- **users** - User accounts and authentication
- **watchlist** - User's saved properties
- **saved_searches** - Stored search filters
- **alerts** - Price/status change notifications

All tables are automatically created when you run `pnpm db:push`.

---

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build

# Database
pnpm db:push          # Push schema to database
npx tsx seed-data.ts  # Add sample data

# Code Quality
pnpm check            # TypeScript check
pnpm format           # Format code with Prettier
pnpm test             # Run tests
```

---

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

Output will be in `dist/` directory.

### Environment Variables in Production

Make sure to set these in your hosting platform:

- `DATABASE_URL` - Production database URL
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - Secure random string (important!)
- `AWS_*` - S3 credentials (if using file uploads)

### Hosting Options

**Recommended platforms:**

1. **Railway** - Easy deployment with database included
2. **Vercel** - For frontend (use external DB)
3. **DigitalOcean App Platform** - Full-stack hosting
4. **Your own VPS** - Full control

---

## 🐛 Troubleshooting

### "Database not available" errors

- Verify `DATABASE_URL` is set correctly in `.env`
- Check database is running and accessible
- Make sure you ran `pnpm db:push`
- Test connection: `mysql -h host -u user -p database`

### OpenAI features not working

- Check `OPENAI_API_KEY` is valid
- Verify you have credits in your OpenAI account
- Check API rate limits

### Port already in use

If port 3000 is busy, the server will automatically try 3001, 3002, etc.

Or set a specific port in `.env`:
```
PORT=8080
```

### Build errors

- Delete `node_modules` and `pnpm-lock.yaml`
- Run `pnpm install` again
- Make sure Node.js version is 20.x or higher

---

## 📊 Key Features Explanation

### CSV Import

The app includes intelligent CSV mapping that:
- Auto-detects column formats
- Handles various naming conventions
- Calculates missing financial metrics
- Geocodes addresses automatically
- Validates data before import

### Deal Scoring

Properties are scored 0-100 based on:
- **Price vs Market** (30%) - Below-market deals score higher
- **Profit Potential** (25%) - Higher ARV minus price
- **ROI** (25%) - Return on investment percentage
- **Days on Market** (10%) - Longer = potentially motivated
- **Condition** (10%) - Better condition = better score

### AI-Powered Features

**CMA Reports:**
- Analyzes comparable properties
- Provides market insights
- Suggests pricing strategies
- Downloads as HTML/PDF/Markdown

**Offer Letters:**
- Professional purchase offer format
- Customizable terms and conditions
- Multiple closing date options
- Ready to send to sellers

**Seller Motivation:**
- AI analyzes property data
- Scores motivation 0-100
- Provides reasoning
- Helps prioritize outreach

---

## 🔐 Security Notes

- **Never commit `.env`** to version control (already in `.gitignore`)
- **Change JWT_SECRET** in production to a secure random string
- **Use HTTPS** in production
- **Rate limit** API endpoints (already implemented)
- **Sanitize** user inputs (handled by tRPC/Zod validation)

---

## 🎨 Customization

### Branding

Edit `.env`:
```env
VITE_APP_TITLE=Your Company Name
VITE_APP_LOGO=/your-logo.png
```

Place logo file in `client/public/` directory.

### Colors

Edit `client/src/index.css` for theme colors.

### Features

Add/remove pages in `client/src/App.tsx` router configuration.

---

## 📞 Support

For issues or questions:
- **Email**: leland@candlstrategy.com
- **GitHub**: https://github.com/lelandsequel/CLDeal

---

## 🎉 What's Changed from Manus

### ✅ Removed
- Manus branding badge (gone!)
- `vite-plugin-manus-runtime` dependency
- Manus-specific host configurations
- Platform lock-in

### ✅ Added
- Independent deployment capability
- Full control over hosting
- Custom domain support
- This comprehensive setup guide

### ✅ Maintained
- All features work exactly the same
- Same UI/UX experience
- All integrations (OpenAI, S3, etc.)
- Database schema unchanged

---

## 💰 Cost Comparison

**Before (with Manus):**
- Platform fees: $$$
- Limited control
- Vendor lock-in

**After (independent):**
- Hosting: $0-20/month (Railway, etc.)
- Database: $0-10/month (PlanetScale free tier)
- OpenAI API: Pay per use
- **Total**: As low as $0/month for small usage!

---

## 🚀 Next Steps

1. ✅ Set up database (5 minutes)
2. ✅ Get OpenAI API key (2 minutes)
3. ✅ Configure `.env` file (1 minute)
4. ✅ Run `pnpm db:push` (30 seconds)
5. ✅ Run `pnpm dev` (30 seconds)
6. 🎉 **You're live!**

---

**Built with ❤️ by C&L Strategy**
