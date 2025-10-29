# C&L Deal Intelligence Platform

**Data-Driven Real Estate Investment Platform**

A comprehensive real estate deal analysis and management platform designed for C&L Strategy. This platform provides AI-powered tools to streamline property acquisition, analysis, and decision-making for real estate investors.

🌐 **Live Site:** [cl-deal.com](https://cl-deal.com)

---

## 🎯 Features

### Property Management
- **Advanced Property Search** - Multi-criteria filtering (price, ARV, ROI, location, property type)
- **Interactive Map View** - Visualize properties geographically with clustering
- **Property Source Tracking** - Distinguish between Sample, Imported, and AI-generated properties
- **Bulk CSV Import** - Intelligent auto-detection and transformation of any CSV format
- **Property Details** - Comprehensive property cards with financial metrics and deal scores

### Acquisition Tools
- **AI Offer Letter Generator** - Generate professional purchase offers with customizable terms
- **CMA Reports** - Comparative Market Analysis with downloadable reports
- **Property Analysis Reports** - One-page deal summaries with key metrics
- **Motivated Seller Scoring** - AI-powered analysis to predict seller motivation (0-100 scale)
- **Multi-Format Downloads** - Export reports as HTML, PDF, Markdown, or Plain Text

### Deal Analysis
- **Deal Score Calculator** - Comprehensive scoring based on price, profit potential, ROI, and market factors
- **Financial Metrics** - ARV, profit potential, ROI, price-to-ARV ratio calculations
- **Market Insights** - Location analysis and market trend data
- **Watchlist** - Save and track favorite properties

### Admin Features
- **Bulk Property Management** - Delete properties by source type
- **CSV Import Interface** - Upload and preview property data before import
- **Property Source Filters** - Quick filtering by data source
- **User Management** - Role-based access control

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **tRPC** - End-to-end typesafe APIs

### Backend
- **Node.js** with TypeScript
- **Express** - Web framework
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - Type-safe database access
- **PostgreSQL** - Primary database
- **OpenAI API** - AI-powered features

### Infrastructure
- **Manus Platform** - Deployment and hosting
- **S3** - File storage
- **Cloudflare CDN** - Global content delivery
- **Auto-scaling** - Dynamic resource allocation

---

## 📁 Project Structure

```
deal-finder/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── _core/         # Core authentication and hooks
├── server/                # Backend Node.js application
│   ├── _core/            # Core server functionality
│   ├── routers.ts        # tRPC API routes
│   ├── db.ts             # Database queries
│   ├── csvMapper.ts      # CSV import logic
│   ├── dealScoring.ts    # Deal analysis algorithms
│   ├── cmaService.ts     # CMA generation
│   ├── pdfGenerator.ts   # Report generation
│   └── formatConverter.ts # Multi-format exports
├── drizzle/              # Database schemas and migrations
├── shared/               # Shared types and constants
└── public/               # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22.x
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lelandsequel/CLDeal.git
   cd CLDeal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   JWT_SECRET=your-secret-key
   VITE_APP_TITLE=C&L Deal Intelligence
   ```

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

---

## 📊 Database Schema

### Properties Table
- Property details (address, price, ARV, condition)
- Financial metrics (profit potential, ROI)
- Deal scoring data
- Source tracking (sample/imported/agentic)
- Geographic data (lat/lng)

### Users Table
- Authentication and profile data
- Role-based permissions
- Watchlist relationships

### Watchlist Table
- User-property relationships
- Saved properties tracking

---

## 🔧 Key Features Implementation

### CSV Import
The platform includes an intelligent CSV mapper that automatically detects and transforms various CSV formats:
- Auto-detects column mappings
- Handles different naming conventions
- Validates and cleans data
- Geocodes addresses
- Calculates financial metrics

### AI-Powered Analysis
- **CMA Generation**: Uses OpenAI to analyze market conditions and comparable properties
- **Seller Motivation**: AI analyzes days on market, pricing, and condition to score motivation
- **Offer Letters**: Generates professional, customizable purchase offers

### Deal Scoring Algorithm
Comprehensive scoring based on:
- Price relative to market (30%)
- Profit potential (25%)
- ROI percentage (25%)
- Days on market (10%)
- Property condition (10%)

---

## 🔐 Security

- JWT-based authentication
- OAuth 2.0 integration
- Rate limiting on API endpoints
- SQL injection protection via Drizzle ORM
- Environment variable protection
- HTTPS enforcement in production

---

## 📈 Future Enhancements

- [ ] Real web search for agentic property discovery
- [ ] Custom branded authentication (for white-label deployments)
- [ ] Advanced analytics dashboard
- [ ] Email notifications for new properties
- [ ] Mobile application
- [ ] Integration with MLS data feeds
- [ ] Automated property valuation models

---

## 🤝 Contributing

This is a private project for C&L Strategy. For authorized team members:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

Proprietary - C&L Strategy © 2025

---

## 👥 Team

**C&L Strategy**
- Internal real estate investment tool
- Built with Manus AI Platform

---

## 📞 Support

For technical support or questions:
- Internal team: Contact the development team
- Platform issues: https://help.manus.im

---

## 🎉 Acknowledgments

- Built on the Manus AI Platform
- Powered by OpenAI for AI features
- UI components from shadcn/ui
- Maps powered by Leaflet and OpenStreetMap

