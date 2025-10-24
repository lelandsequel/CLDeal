# Deal Finder - Real Estate Investment Property Finder

A full-stack web application that helps real estate investors discover distressed fix-and-flip properties across single-family and multifamily residential properties.

## Features Implemented

### Core Functionality

#### 1. **Homepage Dashboard**
- Interactive search with comprehensive filters:
  - Property type (single-family or multifamily)
  - Price range (min/max)
  - Minimum profit margin
  - Location (city, state)
  - Days on market (highlighting motivated sellers at 60+ days)
- Property display with key metrics:
  - Address and location
  - Current price and estimated ARV
  - Estimated profit potential
  - Property condition
  - Days on market badges
  - Beds, baths, square footage
- Quick filter buttons for common searches
- Responsive grid layout

#### 2. **Property Detail Page**
- Complete property information including:
  - Full address and MLS number
  - Bedrooms, bathrooms, square footage, lot size
  - Property condition description
  - Seller type and contact information
- **Profit Calculator** with detailed breakdown:
  - After Repair Value (ARV)
  - Purchase price
  - Estimated renovation costs
  - Holding costs (2% of purchase price)
  - Closing costs (3% of purchase price)
  - **Calculated net profit**
- "Add to Watchlist" functionality
- External listing link
- Data source attribution

#### 3. **Watchlist/Favorites**
- View all saved properties
- Add personal notes to each property
- Edit and save notes inline
- Remove properties from watchlist
- **Export to CSV** functionality for offline analysis
- Quick access to property details

#### 4. **Alert System**
- Create custom deal alerts with criteria:
  - Alert name
  - Property type preference
  - Price range
  - Minimum profit margin
  - Location filter
- Toggle alerts active/inactive
- Delete alerts
- Visual status indicators

#### 5. **Admin Panel** (Admin users only)
- Add new properties to the database
- Comprehensive form with all property fields:
  - Basic information (address, city, state, zip)
  - Financial data (price, ARV, renovation costs)
  - Property details (beds, baths, square feet, lot size)
  - Listing information (MLS, seller type, data source)
  - Location coordinates
- Automatic profit calculation and scoring
- Form validation

### Technical Features

#### Backend (tRPC + Express)
- **Properties Router**: Search, filter, and retrieve properties
- **Watchlist Router**: Manage user's saved properties with notes
- **Alerts Router**: CRUD operations for deal alerts
- **Search History**: Track user searches for analytics
- **Intelligent Search**: LLM-powered natural language query parsing (ready for future enhancement)

#### Database Schema
- **Properties table**: Comprehensive property data storage
- **Watchlist table**: User-property associations with notes
- **Deal Alerts table**: User-defined search criteria
- **Search History table**: Query tracking and analytics
- **Users table**: Authentication with role-based access (admin/user)

#### Frontend (React + Tailwind)
- Modern, responsive design with gradient hero section
- Clean card-based property listings
- Intuitive navigation between pages
- Real-time search and filtering
- Toast notifications for user actions
- Role-based UI rendering (admin links for admins only)

## Sample Data

The application includes 5 sample properties across Texas cities (Austin, Dallas, Houston, San Antonio) demonstrating various investment scenarios:
- Bank-owned properties
- Foreclosures
- Estate sales
- Distressed properties
- Properties with 60+ days on market

## Architecture Highlights

### Profit Calculation Algorithm
Properties automatically calculate:
- **Profit Potential**: ARV - Purchase Price - Renovation - Holding Costs (2%) - Closing Costs (3%)
- **Profit Score**: Percentage-based scoring (0-100) for ranking properties

### Search Capabilities
- Filter by multiple criteria simultaneously
- Quick filter presets for common searches
- Search history tracking (for authenticated users)
- Future-ready for LLM-powered natural language search

### User Experience
- **Public Access**: Browse properties without login
- **Authenticated Features**: Watchlist, alerts, search history
- **Admin Features**: Add properties via admin panel

## Future Enhancement Opportunities

Based on the original specifications, the following features are architected but not yet implemented:

### Agentic Search System
The backend is structured to support autonomous search agents that could:
- Conduct exhaustive multi-platform searches across MLS, Zillow, Realtor.com, Redfin, Foreclosure.com, etc.
- Use keyword variations ("distressed," "handyman special," "foreclosure," etc.)
- Cross-reference properties across sources
- Run scheduled searches (hourly/daily)
- Track price reductions and listing changes

### Data Integration
Ready to integrate with:
- MLS listings APIs
- Zillow, Realtor.com, Redfin APIs
- Foreclosure databases (Foreclosure.com, Auction.com, HUBZU)
- County assessor records
- Tax sale databases
- FSBO platforms

### Advanced Features
- Map view with property markers
- Side-by-side property comparison (up to 4 properties)
- Photo galleries
- Automated comps analysis for ARV estimation
- Real-time notification system for new deals
- Property comparison PDF export
- Admin dashboard with search analytics

## Getting Started

### Prerequisites
- Node.js 22+
- MySQL/TiDB database
- Manus account for authentication

### Installation
```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Seed sample data (optional)
npx tsx seed-data.ts

# Start development server
pnpm dev
```

### User Roles
- **Regular Users**: Can search, save to watchlist, create alerts
- **Admin Users**: Can add properties via admin panel

To promote a user to admin, update the `role` field in the database:
```sql
UPDATE users SET role = 'admin' WHERE openId = 'user_open_id';
```

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui components
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **Type Safety**: TypeScript with end-to-end type inference
- **AI Integration**: LLM support for intelligent search (ready to use)

## API Endpoints (tRPC)

### Properties
- `properties.search` - Filter and search properties
- `properties.getById` - Get single property details
- `properties.getRecent` - Get recent listings
- `properties.create` - Add new property (admin only)
- `properties.intelligentSearch` - LLM-powered natural language search

### Watchlist
- `watchlist.list` - Get user's watchlist
- `watchlist.add` - Add property to watchlist
- `watchlist.remove` - Remove from watchlist
- `watchlist.updateNotes` - Update property notes
- `watchlist.isInWatchlist` - Check if property is saved

### Alerts
- `alerts.list` - Get user's alerts
- `alerts.create` - Create new alert
- `alerts.update` - Update alert settings
- `alerts.delete` - Delete alert

### Search History
- `searchHistory.list` - Get user's search history

## Notes for Deployment

When ready to deploy with real data:

1. **Integrate Real Estate APIs**: Connect to MLS, Zillow, Realtor.com APIs
2. **Implement Search Agents**: Build scheduled jobs to fetch new listings
3. **Add Map View**: Integrate Google Maps or Mapbox for property visualization
4. **Enable Notifications**: Use the built-in notification system for deal alerts
5. **Photo Storage**: Implement S3 storage for property images
6. **Analytics Dashboard**: Build admin analytics using search history data

## License

Proprietary - Deal Finder Application

