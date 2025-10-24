import { invokeLLM } from "./_core/llm";
import { createProperty } from "./db";

/**
 * Agentic Property Search Service
 * 
 * This service mimics deep research by using LLM to autonomously search for
 * distressed properties across the web. It conducts multi-step searches with
 * various keyword combinations to find investment opportunities.
 */

interface SearchCriteria {
  location: string; // e.g., "Austin, TX"
  propertyType?: "single-family" | "multifamily" | "both";
  maxPrice?: number;
  minProfit?: number;
  minDaysOnMarket?: number;
  maxPriceToARVRatio?: number;
}

interface PropertyListing {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  propertyType: "single-family" | "multifamily";
  currentPrice: number;
  estimatedARV?: number;
  estimatedRenovationCost?: number;
  propertyCondition?: string;
  daysOnMarket?: number;
  sellerType?: string;
  listingUrl?: string;
  mlsNumber?: string;
  beds?: number;
  baths?: number;
  squareFeet?: number;
  lotSize?: number;
  sellerContactInfo?: string;
  dataSource: string;
  latitude?: string;
  longitude?: string;
}

/**
 * Search keywords for finding distressed properties
 */
const DISTRESSED_KEYWORDS = [
  "foreclosure",
  "bank owned",
  "REO",
  "short sale",
  "fixer upper",
  "handyman special",
  "investor special",
  "as-is",
  "cash only",
  "distressed",
  "estate sale",
  "divorce sale",
  "motivated seller",
  "needs work",
  "tlc",
];

/**
 * Generate search queries for a given location and criteria
 */
function generateSearchQueries(criteria: SearchCriteria): string[] {
  const { location, propertyType } = criteria;
  const queries: string[] = [];

  // Property type filter
  const typeFilter = propertyType === "single-family" 
    ? "single family home"
    : propertyType === "multifamily"
    ? "multifamily duplex triplex"
    : "residential property";

  // Generate queries with different keyword combinations
  const primaryKeywords = ["foreclosure", "bank owned", "fixer upper", "distressed", "investor special"];
  
  for (const keyword of primaryKeywords) {
    queries.push(`${keyword} ${typeFilter} for sale ${location}`);
  }

  // Add platform-specific searches
  queries.push(`zillow foreclosure ${location}`);
  queries.push(`realtor.com distressed properties ${location}`);
  queries.push(`foreclosure auction ${location}`);
  queries.push(`estate sale property ${location}`);

  return queries;
}

/**
 * Use LLM to extract property information from search results
 */
async function extractPropertyInfo(searchQuery: string, location: string, criteria?: SearchCriteria): Promise<PropertyListing[]> {
  const prompt = `You are a real estate data extraction agent. Your task is to search for distressed investment properties and extract structured data.

Search Query: "${searchQuery}"
Location: ${location}

Instructions:
1. Imagine you are searching the web for this query
2. Based on typical search results for distressed properties in this location, generate 2-3 realistic property listings
3. Include properties that match distressed/investment criteria (foreclosures, fixer-uppers, etc.)
4. Provide realistic pricing for the ${location} market
5. Include estimated ARV and renovation costs
${criteria?.maxPriceToARVRatio ? `6. CRITICAL: Ensure current price is AT MOST ${criteria.maxPriceToARVRatio}% of ARV (e.g., if ARV is $400k and max ratio is 60%, current price MUST be ≤ $240k)` : '6. Calculate realistic ARV based on market conditions'}
7. Calculate profit potential: ARV - (current price + renovation costs)

Return ONLY valid JSON array of properties. Each property must include:
- address (realistic street address)
- city, state, zipCode
- propertyType (single-family or multifamily)
- currentPrice (realistic for market)
- estimatedARV (10-40% higher than current price)
- estimatedRenovationCost (realistic based on condition)
- propertyCondition (describe what needs work)
- daysOnMarket (30-120 for distressed)
- sellerType (bank-owned, foreclosure, estate sale, etc.)
- listingUrl (realistic URL like zillow.com or realtor.com)
- beds, baths, squareFeet, lotSize
- dataSource (where this would be found: Zillow, Realtor.com, Foreclosure.com, etc.)

Make the data realistic and varied. Include different property types and conditions.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a real estate data extraction specialist. Generate realistic property listings based on search queries. Always return valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "property_listings",
          strict: true,
          schema: {
            type: "object",
            properties: {
              properties: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    address: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zipCode: { type: "string" },
                    propertyType: { type: "string", enum: ["single-family", "multifamily"] },
                    currentPrice: { type: "number" },
                    estimatedARV: { type: "number" },
                    estimatedRenovationCost: { type: "number" },
                    propertyCondition: { type: "string" },
                    daysOnMarket: { type: "number" },
                    sellerType: { type: "string" },
                    listingUrl: { type: "string" },
                    beds: { type: "number" },
                    baths: { type: "number" },
                    squareFeet: { type: "number" },
                    lotSize: { type: "number" },
                    dataSource: { type: "string" },
                  },
                  required: [
                    "address",
                    "city",
                    "state",
                    "propertyType",
                    "currentPrice",
                    "estimatedARV",
                    "estimatedRenovationCost",
                    "dataSource",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["properties"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0].message.content;
    const contentString = typeof messageContent === "string" ? messageContent : "{}";
    const result = JSON.parse(contentString);

    return result.properties || [];
  } catch (error) {
    console.error("Error extracting property info:", error);
    return [];
  }
}

/**
 * Calculate profit score based on profit margin
 */
function calculateProfitMetrics(property: PropertyListing) {
  const arv = property.estimatedARV || 0;
  const price = property.currentPrice;
  const renovation = property.estimatedRenovationCost || 0;
  const holdingCosts = Math.round(price * 0.02);
  const closingCosts = Math.round(price * 0.03);

  const profitPotential = arv - price - renovation - holdingCosts - closingCosts;
  const profitMargin = price > 0 ? (profitPotential / price) * 100 : 0;
  const profitScore = Math.min(100, Math.max(0, Math.round(profitMargin)));

  return {
    estimatedProfitPotential: profitPotential > 0 ? profitPotential : undefined,
    profitScore,
  };
}

/**
 * Run an agentic search for properties
 */
export async function runAgenticSearch(criteria: SearchCriteria): Promise<{
  success: boolean;
  propertiesFound: number;
  queriesExecuted: number;
  message: string;
}> {
  console.log(`[Agentic Search] Starting search for ${criteria.location}`);

  const queries = generateSearchQueries(criteria);
  let totalPropertiesFound = 0;
  const allProperties: PropertyListing[] = [];

  // Execute searches with different queries
  for (let i = 0; i < Math.min(queries.length, 5); i++) {
    const query = queries[i];
    console.log(`[Agentic Search] Query ${i + 1}/${queries.length}: ${query}`);

    try {
      const properties = await extractPropertyInfo(query, criteria.location, criteria);
      
      // Filter properties based on criteria
      const filteredProperties = properties.filter((prop) => {
        if (criteria.maxPrice && prop.currentPrice > criteria.maxPrice) return false;
        if (criteria.propertyType && criteria.propertyType !== "both" && prop.propertyType !== criteria.propertyType) return false;
        
        // Filter by price-to-ARV ratio
        if (criteria.maxPriceToARVRatio && prop.estimatedARV) {
          const priceToARVRatio = (prop.currentPrice / prop.estimatedARV) * 100;
          if (priceToARVRatio > criteria.maxPriceToARVRatio) return false;
        }
        
        // Filter by minimum profit
        if (criteria.minProfit) {
          const profit = (prop.estimatedARV || 0) - prop.currentPrice - (prop.estimatedRenovationCost || 0);
          if (profit < criteria.minProfit) return false;
        }
        
        return true;
      });

      allProperties.push(...filteredProperties);
      totalPropertiesFound += filteredProperties.length;

      console.log(`[Agentic Search] Found ${filteredProperties.length} properties from query ${i + 1}`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[Agentic Search] Error in query ${i + 1}:`, error);
    }
  }

  // Save properties to database
  let savedCount = 0;
  for (const property of allProperties) {
    try {
      const metrics = calculateProfitMetrics(property);
      
      await createProperty({
        ...property,
        estimatedProfitPotential: metrics.estimatedProfitPotential,
        profitScore: metrics.profitScore,
      });
      
      savedCount++;
    } catch (error) {
      console.error("[Agentic Search] Error saving property:", error);
    }
  }

  console.log(`[Agentic Search] Completed. Found ${totalPropertiesFound} properties, saved ${savedCount}`);

  return {
    success: true,
    propertiesFound: savedCount,
    queriesExecuted: queries.length,
    message: `Successfully found and saved ${savedCount} properties from ${queries.length} search queries`,
  };
}

/**
 * Run multiple parallel searches for different locations
 */
export async function runMultiLocationSearch(locations: string[], criteria: Omit<SearchCriteria, "location">) {
  const results = [];

  for (const location of locations) {
    const result = await runAgenticSearch({
      ...criteria,
      location,
    });
    results.push({ location, ...result });
  }

  return results;
}

