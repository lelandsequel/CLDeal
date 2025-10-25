import { eq, and, desc } from "drizzle-orm";
import { propertyNotes, propertyShares, InsertPropertyNote, InsertPropertyShare } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new property note
 */
export async function createPropertyNote(note: InsertPropertyNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(propertyNotes).values(note);
  return result;
}

/**
 * Get all notes for a property
 */
export async function getNotesByProperty(propertyId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get notes that are either created by the user or are shared (not private)
  const notes = await db
    .select()
    .from(propertyNotes)
    .where(
      and(
        eq(propertyNotes.propertyId, propertyId),
        // User can see their own notes or non-private notes
        // For simplicity, showing all notes for now - can add sharing logic later
        eq(propertyNotes.userId, userId)
      )
    )
    .orderBy(desc(propertyNotes.createdAt));
  
  return notes;
}

/**
 * Update a property note
 */
export async function updatePropertyNote(
  noteId: number,
  userId: number,
  updates: Partial<InsertPropertyNote>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(propertyNotes)
    .set(updates)
    .where(
      and(
        eq(propertyNotes.id, noteId),
        eq(propertyNotes.userId, userId)
      )
    );
}

/**
 * Delete a property note
 */
export async function deletePropertyNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(propertyNotes)
    .where(
      and(
        eq(propertyNotes.id, noteId),
        eq(propertyNotes.userId, userId)
      )
    );
}

/**
 * Share a property with another user
 */
export async function shareProperty(share: InsertPropertyShare) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(propertyShares).values(share);
  return result;
}

/**
 * Get all shares for a property
 */
export async function getPropertyShares(propertyId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const shares = await db
    .select()
    .from(propertyShares)
    .where(
      and(
        eq(propertyShares.propertyId, propertyId),
        eq(propertyShares.sharedByUserId, userId)
      )
    )
    .orderBy(desc(propertyShares.createdAt));
  
  return shares;
}

/**
 * Remove a property share
 */
export async function removePropertyShare(shareId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(propertyShares)
    .where(
      and(
        eq(propertyShares.id, shareId),
        eq(propertyShares.sharedByUserId, userId)
      )
    );
}

