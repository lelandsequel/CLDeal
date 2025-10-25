import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { contractors, contractorQuotes, InsertContractor, InsertContractorQuote } from "../drizzle/schema";

export async function createContractor(contractor: InsertContractor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contractors).values(contractor);
  return result;
}

export async function getUserContractors(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(contractors)
    .where(eq(contractors.userId, userId))
    .orderBy(desc(contractors.createdAt));
}

export async function updateContractor(id: number, userId: number, updates: Partial<InsertContractor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(contractors)
    .set(updates)
    .where(and(eq(contractors.id, id), eq(contractors.userId, userId)));
}

export async function deleteContractor(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(contractors)
    .where(and(eq(contractors.id, id), eq(contractors.userId, userId)));
}

export async function createQuote(quote: InsertContractorQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contractorQuotes).values(quote);
  return result;
}

export async function getPropertyQuotes(propertyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(contractorQuotes)
    .where(and(eq(contractorQuotes.propertyId, propertyId), eq(contractorQuotes.userId, userId)))
    .orderBy(desc(contractorQuotes.createdAt));
}

export async function updateQuote(id: number, userId: number, updates: Partial<InsertContractorQuote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(contractorQuotes)
    .set(updates)
    .where(and(eq(contractorQuotes.id, id), eq(contractorQuotes.userId, userId)));
}

