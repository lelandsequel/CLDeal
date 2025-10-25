import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { propertyHistory, InsertPropertyHistory } from "../drizzle/schema";

/**
 * Add an event to property history
 */
export async function addHistoryEvent(event: InsertPropertyHistory) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(propertyHistory).values(event);
}

/**
 * Get history timeline for a property
 */
export async function getPropertyHistory(propertyId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const history = await db
    .select()
    .from(propertyHistory)
    .where(eq(propertyHistory.propertyId, propertyId))
    .orderBy(desc(propertyHistory.createdAt));

  return history;
}

/**
 * Get recent history events for a user
 */
export async function getUserHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const history = await db
    .select()
    .from(propertyHistory)
    .where(eq(propertyHistory.userId, userId))
    .orderBy(desc(propertyHistory.createdAt))
    .limit(limit);

  return history;
}

/**
 * Track property view
 */
export async function trackPropertyView(propertyId: number, userId?: number) {
  await addHistoryEvent({
    propertyId,
    userId: userId || null,
    eventType: "viewed",
    eventTitle: "Property Viewed",
    eventDescription: userId ? "User viewed property" : "Anonymous view",
  });
}

/**
 * Track price change
 */
export async function trackPriceChange(propertyId: number, oldPrice: number, newPrice: number) {
  await addHistoryEvent({
    propertyId,
    userId: null,
    eventType: "price_change",
    eventTitle: "Price Changed",
    eventDescription: `Price changed from $${oldPrice.toLocaleString()} to $${newPrice.toLocaleString()}`,
    oldValue: oldPrice.toString(),
    newValue: newPrice.toString(),
  });
}

/**
 * Track watchlist addition
 */
export async function trackWatchlistAdd(propertyId: number, userId: number) {
  await addHistoryEvent({
    propertyId,
    userId,
    eventType: "watchlist_added",
    eventTitle: "Added to Watchlist",
    eventDescription: "User added property to watchlist",
  });
}

/**
 * Track watchlist removal
 */
export async function trackWatchlistRemove(propertyId: number, userId: number) {
  await addHistoryEvent({
    propertyId,
    userId,
    eventType: "watchlist_removed",
    eventTitle: "Removed from Watchlist",
    eventDescription: "User removed property from watchlist",
  });
}

/**
 * Track note addition
 */
export async function trackNoteAdd(propertyId: number, userId: number, noteType: string) {
  await addHistoryEvent({
    propertyId,
    userId,
    eventType: "note_added",
    eventTitle: "Note Added",
    eventDescription: `Added ${noteType} note`,
    metadata: JSON.stringify({ noteType }),
  });
}

/**
 * Track CMA generation
 */
export async function trackCMAGeneration(propertyId: number, userId: number) {
  await addHistoryEvent({
    propertyId,
    userId,
    eventType: "cma_generated",
    eventTitle: "CMA Report Generated",
    eventDescription: "Comparative Market Analysis report generated",
  });
}

/**
 * Track score calculation
 */
export async function trackScoreCalculation(propertyId: number, userId: number, score: number) {
  await addHistoryEvent({
    propertyId,
    userId,
    eventType: "score_calculated",
    eventTitle: "Deal Score Calculated",
    eventDescription: `Property scored ${score}/100`,
    newValue: score.toString(),
  });
}

