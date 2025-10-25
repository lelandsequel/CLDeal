import { eq, and } from "drizzle-orm";
import { financialScenarios, InsertFinancialScenario } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new financial scenario
 */
export async function createFinancialScenario(scenario: InsertFinancialScenario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(financialScenarios).values(scenario);
  return result;
}

/**
 * Get all financial scenarios for a property
 */
export async function getScenariosByProperty(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const scenarios = await db
    .select()
    .from(financialScenarios)
    .where(eq(financialScenarios.propertyId, propertyId));
  
  return scenarios;
}

/**
 * Get all financial scenarios for a user
 */
export async function getScenariosByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const scenarios = await db
    .select()
    .from(financialScenarios)
    .where(eq(financialScenarios.userId, userId));
  
  return scenarios;
}

/**
 * Get a specific financial scenario
 */
export async function getScenarioById(scenarioId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(financialScenarios)
    .where(eq(financialScenarios.id, scenarioId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Update a financial scenario
 */
export async function updateFinancialScenario(
  scenarioId: number,
  userId: number,
  updates: Partial<InsertFinancialScenario>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(financialScenarios)
    .set(updates)
    .where(
      and(
        eq(financialScenarios.id, scenarioId),
        eq(financialScenarios.userId, userId)
      )
    );
}

/**
 * Delete a financial scenario
 */
export async function deleteFinancialScenario(scenarioId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(financialScenarios)
    .where(
      and(
        eq(financialScenarios.id, scenarioId),
        eq(financialScenarios.userId, userId)
      )
    );
}

