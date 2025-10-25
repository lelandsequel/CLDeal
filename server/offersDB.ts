import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { offers, InsertOffer } from "../drizzle/schema";

export async function createOffer(offer: InsertOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(offers).values(offer);
  return result;
}

export async function getUserOffers(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(offers)
    .where(eq(offers.userId, userId))
    .orderBy(desc(offers.createdAt));
}

export async function getPropertyOffers(propertyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(offers)
    .where(and(eq(offers.propertyId, propertyId), eq(offers.userId, userId)))
    .orderBy(desc(offers.createdAt));
}

export async function updateOffer(id: number, userId: number, updates: Partial<InsertOffer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(offers)
    .set(updates)
    .where(and(eq(offers.id, id), eq(offers.userId, userId)));
}

export async function deleteOffer(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(offers)
    .where(and(eq(offers.id, id), eq(offers.userId, userId)));
}

