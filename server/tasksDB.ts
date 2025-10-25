import { eq, and, desc, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { tasks, InsertTask } from "../drizzle/schema";

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tasks).values(task);
  return result;
}

export async function getUserTasks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}

export async function getPropertyTasks(propertyId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.propertyId, propertyId), eq(tasks.userId, userId)))
    .orderBy(desc(tasks.createdAt));
}

export async function getPendingTasks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")))
    .orderBy(desc(tasks.dueDate));
}

export async function updateTask(id: number, userId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

