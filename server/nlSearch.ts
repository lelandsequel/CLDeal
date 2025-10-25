import { invokeLLM } from "./_core/llm";

/**
 * Parse natural language query into structured search criteria
 */
export async function parseNaturalLanguageQuery(query: string): Promise<{
  propertyType?: "single-family" | "multifamily";
  minPrice?: number;
  maxPrice?: number;
  minARV?: number;
  maxARV?: number;
  maxPriceToARVRatio?: number;
  minProfit?: number;
  city?: string;
  state?: string;
  minDaysOnMarket?: number;
  interpretation: string;
}> {
  const prompt = `Parse this natural language property search query into structured criteria:

Query: "${query}"

Extract the following if mentioned:
- Property type (single-family or multifamily)
- Price range (min/max)
- ARV range (min/max)
- Max price as percentage of ARV (e.g., "60% ARV" means maxPriceToARVRatio: 60)
- Minimum profit potential
- Location (city, state)
- Days on market

Respond with ONLY valid JSON matching this schema:
{
  "propertyType": "single-family" | "multifamily" | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "minARV": number | null,
  "maxARV": number | null,
  "maxPriceToARVRatio": number | null,
  "minProfit": number | null,
  "city": string | null,
  "state": string | null,
  "minDaysOnMarket": number | null,
  "interpretation": "A human-readable summary of the search criteria"
}

Examples:
Query: "Find single family homes in Austin under 300k"
Response: {"propertyType": "single-family", "maxPrice": 300000, "city": "Austin", "state": "TX", "interpretation": "Single family homes in Austin, TX under $300,000"}

Query: "Show me properties at 60% ARV with at least 50k profit in Phoenix"
Response: {"maxPriceToARVRatio": 60, "minProfit": 50000, "city": "Phoenix", "state": "AZ", "interpretation": "Properties at 60% of ARV with minimum $50,000 profit in Phoenix, AZ"}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a real estate search query parser. Respond with only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "search_criteria",
          strict: true,
          schema: {
            type: "object",
            properties: {
              propertyType: { type: ["string", "null"] },
              minPrice: { type: ["number", "null"] },
              maxPrice: { type: ["number", "null"] },
              minARV: { type: ["number", "null"] },
              maxARV: { type: ["number", "null"] },
              maxPriceToARVRatio: { type: ["number", "null"] },
              minProfit: { type: ["number", "null"] },
              city: { type: ["string", "null"] },
              state: { type: ["string", "null"] },
              minDaysOnMarket: { type: ["number", "null"] },
              interpretation: { type: "string" },
            },
            required: ["interpretation"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response from LLM");
    }

    const parsed = JSON.parse(content);

    // Filter out null values
    const result: any = { interpretation: parsed.interpretation };
    if (parsed.propertyType) result.propertyType = parsed.propertyType;
    if (parsed.minPrice) result.minPrice = parsed.minPrice;
    if (parsed.maxPrice) result.maxPrice = parsed.maxPrice;
    if (parsed.minARV) result.minARV = parsed.minARV;
    if (parsed.maxARV) result.maxARV = parsed.maxARV;
    if (parsed.maxPriceToARVRatio) result.maxPriceToARVRatio = parsed.maxPriceToARVRatio;
    if (parsed.minProfit) result.minProfit = parsed.minProfit;
    if (parsed.city) result.city = parsed.city;
    if (parsed.state) result.state = parsed.state;
    if (parsed.minDaysOnMarket) result.minDaysOnMarket = parsed.minDaysOnMarket;

    return result;
  } catch (error) {
    console.error("Error parsing natural language query:", error);
    return {
      interpretation: "Unable to parse query. Please try rephrasing.",
    };
  }
}

/**
 * Generate property recommendations based on user preferences and history
 */
export async function generateRecommendations(
  userPreferences: {
    favoriteLocations?: string[];
    priceRange?: { min: number; max: number };
    preferredPropertyType?: string;
  },
  recentSearches: any[]
): Promise<{
  recommendations: string[];
  reasoning: string;
}> {
  const prompt = `Based on this user's preferences and search history, generate 3 property search recommendations:

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Recent Searches:
${JSON.stringify(recentSearches.slice(0, 5), null, 2)}

Provide 3 specific, actionable search recommendations that align with their interests.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a real estate investment advisor providing personalized property recommendations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response from LLM");
    }

    return {
      recommendations: content.split("\n").filter((line) => line.trim().length > 0).slice(0, 3),
      reasoning: content,
    };
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return {
      recommendations: [],
      reasoning: "Unable to generate recommendations at this time.",
    };
  }
}

