import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { savedSearches, InsertSavedSearch } from "../drizzle/schema";

/**
 * Create a new saved search
 */
export async function createSavedSearch(search: InsertSavedSearch) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(savedSearches).values(search);
  return result;
}

/**
 * Get all saved searches for a user
 */
export async function getUserSavedSearches(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const searches = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId));

  return searches;
}

/**
 * Get a saved search by ID
 */
export async function getSavedSearchById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update a saved search
 */
export async function updateSavedSearch(
  id: number,
  userId: number,
  updates: Partial<InsertSavedSearch>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(savedSearches)
    .set(updates)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
}

/**
 * Get all saved searches with notifications enabled
 */
export async function getSearchesWithNotificationsEnabled() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const searches = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.notificationsEnabled, 1));

  return searches;
}

