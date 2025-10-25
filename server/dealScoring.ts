import { invokeLLM } from "./_core/llm";
import type { Property } from "../drizzle/schema";

/**
 * Calculate comprehensive deal score for a property (0-100)
 */
export async function calculateDealScore(property: Property): Promise<{
  totalScore: number;
  breakdown: {
    financialScore: number;
    locationScore: number;
    conditionScore: number;
    marketScore: number;
  };
  reasoning: string;
}> {
  // Financial Score (0-30 points)
  const financialScore = calculateFinancialScore(property);

  // Location Score (0-30 points) - Use LLM for location analysis
  const locationScore = await calculateLocationScore(property);

  // Condition Score (0-20 points)
  const conditionScore = calculateConditionScore(property);

  // Market Score (0-20 points)
  const marketScore = calculateMarketScore(property);

  const totalScore = financialScore + locationScore + conditionScore + marketScore;

  const reasoning = generateScoreReasoning(property, {
    financialScore,
    locationScore,
    conditionScore,
    marketScore,
  });

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      financialScore: Math.round(financialScore),
      locationScore: Math.round(locationScore),
      conditionScore: Math.round(conditionScore),
      marketScore: Math.round(marketScore),
    },
    reasoning,
  };
}

/**
 * Calculate financial score based on profit potential and ROI
 */
function calculateFinancialScore(property: Property): number {
  const profit = (property.estimatedARV || 0) - (property.currentPrice || 0) - (property.estimatedRenovationCost || 0);
  const roi = property.currentPrice ? (profit / property.currentPrice) * 100 : 0;

  let score = 0;

  // Profit potential (0-15 points)
  if (profit >= 100000) score += 15;
  else if (profit >= 75000) score += 12;
  else if (profit >= 50000) score += 10;
  else if (profit >= 30000) score += 7;
  else if (profit >= 15000) score += 4;
  else if (profit > 0) score += 2;

  // ROI percentage (0-15 points)
  if (roi >= 50) score += 15;
  else if (roi >= 40) score += 12;
  else if (roi >= 30) score += 10;
  else if (roi >= 20) score += 7;
  else if (roi >= 10) score += 4;
  else if (roi > 0) score += 2;

  return score;
}

/**
 * Calculate location score using LLM analysis
 */
async function calculateLocationScore(property: Property): Promise<number> {
  const prompt = `Analyze this property location and provide a score from 0-30 based on investment potential:

Location: ${property.city}, ${property.state}
Property Type: ${property.propertyType}

Consider:
- School quality and ratings
- Crime rates and safety
- Job market and economic growth
- Walkability and amenities
- Property appreciation trends
- Rental demand

Respond with ONLY a number between 0 and 30.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a real estate location analyst. Respond with only a number.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const scoreText = response.choices[0]?.message?.content;
    
    if (typeof scoreText !== "string") {
      throw new Error("Invalid location score response");
    }

    const score = parseFloat(scoreText.replace(/[^0-9.]/g, ""));

    if (isNaN(score)) {
      return 15; // Default middle score
    }

    return Math.max(0, Math.min(30, score));
  } catch (error) {
    console.error("Error calculating location score:", error);
    return 15; // Default middle score
  }
}

/**
 * Calculate condition score based on property condition
 */
function calculateConditionScore(property: Property): number {
  const condition = property.propertyCondition?.toLowerCase() || "";

  if (condition.includes("excellent") || condition.includes("move-in ready")) {
    return 20;
  } else if (condition.includes("good") || condition.includes("minor")) {
    return 15;
  } else if (condition.includes("fair") || condition.includes("cosmetic")) {
    return 12;
  } else if (condition.includes("needs work") || condition.includes("fixer")) {
    return 8;
  } else if (condition.includes("distressed") || condition.includes("major")) {
    return 5;
  }

  return 10; // Default
}

/**
 * Calculate market score based on days on market and seller type
 */
function calculateMarketScore(property: Property): number {
  let score = 0;

  // Days on market (0-10 points)
  const dom = property.daysOnMarket || 0;
  if (dom >= 90) score += 10; // Motivated seller
  else if (dom >= 60) score += 8;
  else if (dom >= 30) score += 6;
  else if (dom >= 14) score += 4;
  else score += 2;

  // Seller type (0-10 points)
  const sellerType = property.sellerType?.toLowerCase() || "";
  if (sellerType.includes("bank") || sellerType.includes("foreclosure")) {
    score += 10; // Highly motivated
  } else if (sellerType.includes("estate") || sellerType.includes("probate")) {
    score += 8;
  } else if (sellerType.includes("investor") || sellerType.includes("flipper")) {
    score += 5;
  } else {
    score += 6; // Regular seller
  }

  return score;
}

/**
 * Generate human-readable reasoning for the score
 */
function generateScoreReasoning(
  property: Property,
  breakdown: {
    financialScore: number;
    locationScore: number;
    conditionScore: number;
    marketScore: number;
  }
): string {
  const reasons: string[] = [];

  // Financial reasoning
  const profit = (property.estimatedARV || 0) - (property.currentPrice || 0) - (property.estimatedRenovationCost || 0);
  if (breakdown.financialScore >= 20) {
    reasons.push(`Strong profit potential of $${profit.toLocaleString()}`);
  } else if (breakdown.financialScore >= 10) {
    reasons.push(`Moderate profit potential of $${profit.toLocaleString()}`);
  } else {
    reasons.push(`Limited profit potential of $${profit.toLocaleString()}`);
  }

  // Location reasoning
  if (breakdown.locationScore >= 20) {
    reasons.push(`Excellent location in ${property.city}, ${property.state}`);
  } else if (breakdown.locationScore >= 15) {
    reasons.push(`Good location in ${property.city}, ${property.state}`);
  } else {
    reasons.push(`Average location in ${property.city}, ${property.state}`);
  }

  // Condition reasoning
  if (breakdown.conditionScore >= 15) {
    reasons.push("Property in good condition");
  } else if (breakdown.conditionScore >= 10) {
    reasons.push("Property needs moderate repairs");
  } else {
    reasons.push("Property requires significant renovation");
  }

  // Market reasoning
  if (property.daysOnMarket && property.daysOnMarket >= 60) {
    reasons.push(`${property.daysOnMarket} days on market indicates motivated seller`);
  }

  return reasons.join(". ") + ".";
}

/**
 * Batch calculate scores for multiple properties
 */
export async function batchCalculateScores(properties: Property[]): Promise<
  Map<
    number,
    {
      totalScore: number;
      breakdown: {
        financialScore: number;
        locationScore: number;
        conditionScore: number;
        marketScore: number;
      };
      reasoning: string;
    }
  >
> {
  const scores = new Map();

  for (const property of properties) {
    try {
      const score = await calculateDealScore(property);
      scores.set(property.id, score);
    } catch (error) {
      console.error(`Error calculating score for property ${property.id}:`, error);
    }
  }

  return scores;
}

