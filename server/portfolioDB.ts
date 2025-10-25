import { eq, and, desc, sum } from "drizzle-orm";
import { getDb } from "./db";
import { portfolio, InsertPortfolio } from "../drizzle/schema";

export async function createPortfolioItem(item: InsertPortfolio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(portfolio).values(item);
  return result;
}

export async function getUserPortfolio(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.userId, userId))
    .orderBy(desc(portfolio.purchaseDate));
}

export async function getPortfolioStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const items = await getUserPortfolio(userId);
  
  const totalInvested = items.reduce((sum, item) => 
    sum + (item.purchasePrice || 0) + (item.renovationCost || 0), 0
  );
  
  const totalValue = items.reduce((sum, item) => 
    sum + (item.currentValue || item.purchasePrice || 0), 0
  );
  
  const totalEquity = totalValue - totalInvested;
  
  const monthlyIncome = items
    .filter(item => item.status === "rented")
    .reduce((sum, item) => sum + (item.monthlyRent || 0), 0);
    
  const monthlyExpenses = items
    .filter(item => item.status === "rented")
    .reduce((sum, item) => sum + (item.monthlyExpenses || 0), 0);
  
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  
  return {
    totalProperties: items.length,
    totalInvested,
    totalValue,
    totalEquity,
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow,
    roi: totalInvested > 0 ? ((totalEquity / totalInvested) * 100) : 0,
  };
}

export async function updatePortfolioItem(id: number, userId: number, updates: Partial<InsertPortfolio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(portfolio)
    .set(updates)
    .where(and(eq(portfolio.id, id), eq(portfolio.userId, userId)));
}

export async function deletePortfolioItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(portfolio)
    .where(and(eq(portfolio.id, id), eq(portfolio.userId, userId)));
}

