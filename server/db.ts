import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  dealAlerts,
  InsertDealAlert,
  InsertProperty,
  InsertSearchHistory,
  InsertUser,
  InsertWatchlist,
  properties,
  searchHistory,
  users,
  watchlist,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Property queries
export async function searchProperties(filters: {
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minProfit?: number;
  city?: string;
  state?: string;
  minDaysOnMarket?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  
  if (filters.propertyType && filters.propertyType !== "both") {
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }
  if (filters.minPrice) {
    conditions.push(gte(properties.currentPrice, filters.minPrice));
  }
  if (filters.maxPrice) {
    conditions.push(lte(properties.currentPrice, filters.maxPrice));
  }
  if (filters.minProfit) {
    conditions.push(gte(properties.estimatedProfitPotential, filters.minProfit));
  }
  if (filters.city) {
    conditions.push(eq(properties.city, filters.city));
  }
  if (filters.state) {
    conditions.push(eq(properties.state, filters.state));
  }
  if (filters.minDaysOnMarket) {
    conditions.push(gte(properties.daysOnMarket, filters.minDaysOnMarket));
  }

  const query = conditions.length > 0
    ? db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.profitScore))
    : db.select().from(properties).orderBy(desc(properties.profitScore));

  return await query;
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(properties).values(property);
  return result;
}

export async function getRecentProperties(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(properties).orderBy(desc(properties.createdAt)).limit(limit);
}

// Watchlist queries
export async function getUserWatchlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: watchlist.id,
      notes: watchlist.notes,
      createdAt: watchlist.createdAt,
      property: properties,
    })
    .from(watchlist)
    .innerJoin(properties, eq(watchlist.propertyId, properties.id))
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.createdAt));
}

export async function addToWatchlist(data: InsertWatchlist) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(watchlist).values(data);
  return result;
}

export async function removeFromWatchlist(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.delete(watchlist).where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)));
  return result;
}

export async function updateWatchlistNotes(id: number, userId: number, notes: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(watchlist)
    .set({ notes })
    .where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)));
  return result;
}

export async function isPropertyInWatchlist(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.propertyId, propertyId)))
    .limit(1);
  return result.length > 0;
}

// Deal alerts queries
export async function getUserAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(dealAlerts).where(eq(dealAlerts.userId, userId)).orderBy(desc(dealAlerts.createdAt));
}

export async function createAlert(alert: InsertDealAlert) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(dealAlerts).values(alert);
  return result;
}

export async function updateAlert(id: number, userId: number, data: Partial<InsertDealAlert>) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.update(dealAlerts).set(data).where(and(eq(dealAlerts.id, id), eq(dealAlerts.userId, userId)));
  return result;
}

export async function deleteAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.delete(dealAlerts).where(and(eq(dealAlerts.id, id), eq(dealAlerts.userId, userId)));
  return result;
}

// Search history queries
export async function getUserSearchHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
}

export async function addSearchHistory(data: InsertSearchHistory) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(searchHistory).values(data);
  return result;
}
