import { getDb } from "./db";
import { properties } from "../drizzle/schema";
import { sql, eq, and, gte } from "drizzle-orm";

/**
 * Calculate market statistics for a given location
 */
export async function getMarketStats(city?: string, state?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(properties);

  if (city && state) {
    query = query.where(and(eq(properties.city, city), eq(properties.state, state))) as any;
  } else if (state) {
    query = query.where(eq(properties.state, state)) as any;
  }

  const props = await query;

  if (props.length === 0) {
    return null;
  }

  const prices = props.map((p) => p.currentPrice || 0).filter((p) => p > 0);
  const arvs = props.map((p) => p.estimatedARV || 0).filter((a) => a > 0);
  const profits = props.map((p) => {
    const arv = p.estimatedARV || 0;
    const price = p.currentPrice || 0;
    const reno = p.estimatedRenovationCost || 0;
    return arv - price - reno;
  }).filter((p) => p > 0);

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  const avgARV = arvs.reduce((a, b) => a + b, 0) / arvs.length;
  const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
  const avgDaysOnMarket =
    props.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0) / props.length;

  return {
    totalProperties: props.length,
    avgPrice: Math.round(avgPrice),
    medianPrice: Math.round(medianPrice),
    avgARV: Math.round(avgARV),
    avgProfit: Math.round(avgProfit),
    avgDaysOnMarket: Math.round(avgDaysOnMarket),
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
  };
}

/**
 * Get price trends over time (simulated for now)
 */
export async function getPriceTrends(city?: string, state?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // For now, return simulated trend data
  // In production, this would query historical price data
  const currentStats = await getMarketStats(city, state);

  if (!currentStats) {
    return [];
  }

  // Simulate 12 months of data
  const trends = [];
  const basePrice = currentStats.avgPrice;

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    const price = Math.round(basePrice * (1 + variance));

    trends.push({
      month: date.toISOString().slice(0, 7), // YYYY-MM
      avgPrice: price,
      propertyCount: Math.floor(currentStats.totalProperties * (0.8 + Math.random() * 0.4)),
    });
  }

  return trends;
}

/**
 * Get top performing markets
 */
export async function getTopMarkets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allProps = await db.select().from(properties);

  // Group by city/state
  const marketMap = new Map<string, any[]>();

  for (const prop of allProps) {
    if (!prop.city || !prop.state) continue;
    const key = `${prop.city}, ${prop.state}`;
    if (!marketMap.has(key)) {
      marketMap.set(key, []);
    }
    marketMap.get(key)!.push(prop);
  }

  // Calculate stats for each market
  const markets = Array.from(marketMap.entries()).map(([location, props]) => {
    const profits = props.map((p) => {
      const arv = p.estimatedARV || 0;
      const price = p.currentPrice || 0;
      const reno = p.estimatedRenovationCost || 0;
      return arv - price - reno;
    });

    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    const avgPrice = props.reduce((sum, p) => sum + (p.currentPrice || 0), 0) / props.length;

    return {
      location,
      propertyCount: props.length,
      avgProfit: Math.round(avgProfit),
      avgPrice: Math.round(avgPrice),
      roi: avgPrice > 0 ? Math.round((avgProfit / avgPrice) * 100) : 0,
    };
  });

  // Sort by average profit
  return markets.sort((a, b) => b.avgProfit - a.avgProfit).slice(0, 10);
}

/**
 * Predict property appreciation
 */
export async function predictAppreciation(propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const prop = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (prop.length === 0) {
    return null;
  }

  const property = prop[0];

  // Simple appreciation model (in production, use ML model)
  const marketStats = await getMarketStats(property.city || undefined, property.state || undefined);

  if (!marketStats) {
    return null;
  }

  // Estimate 3-5 year appreciation based on market trends
  const baseAppreciation = 0.03; // 3% annual baseline
  const marketFactor = marketStats.avgProfit > 50000 ? 0.02 : 0.01; // Hot market bonus

  const oneYear = Math.round((property.estimatedARV || 0) * (1 + baseAppreciation + marketFactor));
  const threeYear = Math.round(
    (property.estimatedARV || 0) * Math.pow(1 + baseAppreciation + marketFactor, 3)
  );
  const fiveYear = Math.round(
    (property.estimatedARV || 0) * Math.pow(1 + baseAppreciation + marketFactor, 5)
  );

  return {
    currentARV: property.estimatedARV || 0,
    oneYearProjection: oneYear,
    threeYearProjection: threeYear,
    fiveYearProjection: fiveYear,
    annualAppreciationRate: Math.round((baseAppreciation + marketFactor) * 100),
  };
}

