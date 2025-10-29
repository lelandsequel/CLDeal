import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Financial scenarios for property analysis
 * Stores different financing and investment strategy calculations
 */
export const financialScenarios = mysqlTable("financial_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  userId: int("userId").notNull(),
  scenarioName: varchar("scenarioName", { length: 100 }).notNull(),
  strategyType: mysqlEnum("strategyType", ["rental", "flip", "brrrr"]).notNull(),
  
  // Purchase details
  purchasePrice: int("purchasePrice").notNull(),
  downPaymentPercent: int("downPaymentPercent").notNull(),
  downPaymentAmount: int("downPaymentAmount").notNull(),
  loanAmount: int("loanAmount").notNull(),
  interestRate: int("interestRate").notNull(), // stored as basis points (e.g., 650 = 6.5%)
  loanTermYears: int("loanTermYears").notNull(),
  closingCosts: int("closingCosts").notNull(),
  
  // Rental strategy fields
  monthlyRent: int("monthlyRent"),
  vacancyRate: int("vacancyRate"), // basis points
  propertyManagementPercent: int("propertyManagementPercent"), // basis points
  monthlyInsurance: int("monthlyInsurance"),
  monthlyPropertyTax: int("monthlyPropertyTax"),
  monthlyHOA: int("monthlyHOA"),
  monthlyMaintenance: int("monthlyMaintenance"),
  
  // Flip strategy fields
  renovationCost: int("renovationCost"),
  holdingMonths: int("holdingMonths"),
  sellingCostsPercent: int("sellingCostsPercent"), // basis points
  afterRepairValue: int("afterRepairValue"),
  
  // BRRRR strategy fields
  refinanceARV: int("refinanceARV"),
  refinanceLTV: int("refinanceLTV"), // basis points
  refinanceRate: int("refinanceRate"), // basis points
  
  // Calculated results
  monthlyMortgagePayment: int("monthlyMortgagePayment"),
  monthlyCashFlow: int("monthlyCashFlow"),
  annualCashFlow: int("annualCashFlow"),
  cashOnCashReturn: int("cashOnCashReturn"), // basis points
  capRate: int("capRate"), // basis points
  totalProfit: int("totalProfit"),
  roi: int("roi"), // basis points
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialScenario = typeof financialScenarios.$inferSelect;
export type InsertFinancialScenario = typeof financialScenarios.$inferInsert;

/**
 * Property notes - private notes and collaboration
 */
export const propertyNotes = mysqlTable("property_notes", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  userId: int("userId").notNull(),
  noteText: text("noteText").notNull(),
  noteType: mysqlEnum("noteType", ["general", "inspection", "contractor", "financing", "offer"]).default("general").notNull(),
  isPrivate: int("isPrivate").default(1).notNull(), // 1 = private, 0 = shared with team
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyNote = typeof propertyNotes.$inferSelect;
export type InsertPropertyNote = typeof propertyNotes.$inferInsert;

/**
 * Property history timeline - tracks all events and changes for a property
 */
export const propertyHistory = mysqlTable("property_history", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull(),
  userId: int("user_id"),
  eventType: mysqlEnum("event_type", [
    "price_change",
    "status_change",
    "note_added",
    "viewed",
    "watchlist_added",
    "watchlist_removed",
    "alert_triggered",
    "cma_generated",
    "score_calculated",
    "offer_made",
    "inspection_scheduled",
    "other",
  ]).notNull(),
  eventTitle: varchar("event_title", { length: 255 }).notNull(),
  eventDescription: text("event_description"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyHistory = typeof propertyHistory.$inferSelect;
export type InsertPropertyHistory = typeof propertyHistory.$inferInsert;

/**
 * Saved searches - users can save search criteria and get auto-notifications
 */
export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  searchName: varchar("search_name", { length: 255 }).notNull(),
  propertyType: mysqlEnum("property_type", ["single-family", "multifamily"]),
  minPrice: int("min_price"),
  maxPrice: int("max_price"),
  minARV: int("min_arv"),
  maxARV: int("max_arv"),
  maxPriceToARVRatio: int("max_price_to_arv_ratio"),
  minProfit: int("min_profit"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  minDaysOnMarket: int("min_days_on_market"),
  notificationsEnabled: int("notifications_enabled").default(1).notNull(), // 1 = true, 0 = false
  notificationFrequency: mysqlEnum("notification_frequency", ["instant", "daily", "weekly"]).default("daily").notNull(),
  lastNotificationSent: timestamp("last_notification_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Offers - track offers made on properties
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull(),
  userId: int("user_id").notNull(),
  offerAmount: int("offer_amount").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "accepted", "rejected", "countered", "withdrawn"]).default("draft").notNull(),
  contingencies: text("contingencies"),
  closingDate: timestamp("closing_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Tasks - manage tasks related to properties and deals
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id"),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  taskType: mysqlEnum("task_type", [
    "inspection",
    "appraisal",
    "contractor_quote",
    "financing",
    "title_search",
    "insurance",
    "walkthrough",
    "closing",
    "other",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Contractors - manage contractor network and quotes
 */
export const contractors = mysqlTable("contractors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  specialty: varchar("specialty", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  rating: int("rating"), // 1-5 stars
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

/**
 * Contractor quotes for specific properties
 */
export const contractorQuotes = mysqlTable("contractor_quotes", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull(),
  contractorId: int("contractor_id").notNull(),
  userId: int("user_id").notNull(),
  workDescription: text("work_description").notNull(),
  quoteAmount: int("quote_amount").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  validUntil: timestamp("valid_until"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContractorQuote = typeof contractorQuotes.$inferSelect;
export type InsertContractorQuote = typeof contractorQuotes.$inferInsert;

/**
 * Portfolio - track owned/acquired properties
 */
export const portfolio = mysqlTable("portfolio", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  propertyId: int("property_id"),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  purchasePrice: int("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  currentValue: int("current_value"),
  renovationCost: int("renovation_cost"),
  monthlyRent: int("monthly_rent"),
  monthlyExpenses: int("monthly_expenses"),
  status: mysqlEnum("status", ["owned", "under_contract", "renovating", "rented", "sold"]).default("owned").notNull(),
  notes: text("notes"),
  soldPrice: int("sold_price"),
  soldDate: timestamp("sold_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = typeof portfolio.$inferInsert;

/**
 * Property shares - track who has access to view properties
 */
export const propertyShares = mysqlTable("property_shares", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  sharedByUserId: int("sharedByUserId").notNull(),
  sharedWithEmail: varchar("sharedWithEmail", { length: 320 }).notNull(),
  accessLevel: mysqlEnum("accessLevel", ["view", "edit"]).default("view").notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyShare = typeof propertyShares.$inferSelect;
export type InsertPropertyShare = typeof propertyShares.$inferInsert;

/**
 * Properties table - stores all discovered real estate properties
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }),
  propertyType: mysqlEnum("propertyType", ["single-family", "multifamily"]).notNull(),
  currentPrice: int("currentPrice").notNull(),
  estimatedARV: int("estimatedARV"),
  estimatedRenovationCost: int("estimatedRenovationCost"),
  estimatedProfitPotential: int("estimatedProfitPotential"),
  propertyCondition: varchar("propertyCondition", { length: 100 }),
  daysOnMarket: int("daysOnMarket"),
  sellerType: varchar("sellerType", { length: 100 }),
  listingUrl: text("listingUrl"),
  mlsNumber: varchar("mlsNumber", { length: 50 }),
  beds: int("beds"),
  baths: int("baths"),
  squareFeet: int("squareFeet"),
  lotSize: int("lotSize"),
  sellerContactInfo: text("sellerContactInfo"),
  photoUrls: text("photoUrls"),
  dataSource: varchar("dataSource", { length: 100 }),
  profitScore: int("profitScore"),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  propertySource: mysqlEnum("propertySource", ["sample", "imported", "agentic"]).default("sample").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Watchlist table - tracks properties users are interested in
 */
export const watchlist = mysqlTable("watchlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = typeof watchlist.$inferInsert;

/**
 * Deal alerts table - stores user-defined search criteria for notifications
 */
export const dealAlerts = mysqlTable("dealAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  propertyType: mysqlEnum("propertyType", ["single-family", "multifamily", "both"]).notNull(),
  minPrice: int("minPrice"),
  maxPrice: int("maxPrice"),
  minProfitMargin: int("minProfitMargin"),
  location: text("location"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DealAlert = typeof dealAlerts.$inferSelect;
export type InsertDealAlert = typeof dealAlerts.$inferInsert;

/**
 * Search history table - tracks user searches
 */
export const searchHistory = mysqlTable("searchHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  searchParams: text("searchParams").notNull(),
  resultsCount: int("resultsCount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;