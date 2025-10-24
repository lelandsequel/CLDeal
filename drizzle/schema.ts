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
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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