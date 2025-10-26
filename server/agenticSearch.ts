import { invokeLLM } from "./_core/llm";
import { createProperty } from "./db";

/**
 * Agentic Property Search Service (Web Search Version)
 * 
 * This service uses real web search to find actual distressed properties
 * from Zillow, Realtor.com, foreclosure sites, and other sources.
 * It mimics Manus deep research by conducting multi-step searches and
 * extracting structured data from real listings.
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
  yearBuilt?: number;
  description?: string;
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
  "needs TLC",
  "motivated seller",
  "as-is",
  "estate sale",
  "distressed property",
  "below market value",
];

/**
 * Run agentic property search using real web search
 */
export async function runAgenticSearch(
  criteria: SearchCriteria
): Promise<{ success: boolean; count: number; properties: any[] }> {
  try {
    console.log(`[Agentic Search] Starting search for ${criteria.location}`);
    
    // Step 1: Generate search queries
    const searchQueries = generateSearchQueries(criteria);
    console.log(`[Agentic Search] Generated ${searchQueries.length} search queries`);
    
    // Step 2: Use LLM with web search to find real properties
    const properties = await searchWebForProperties(searchQueries, criteria);
    console.log(`[Agentic Search] Found ${properties.length} properties from web search`);
    
    // Step 3: Filter properties based on criteria
    const filteredProperties = filterProperties(properties, criteria);
    console.log(`[Agentic Search] ${filteredProperties.length} properties match criteria`);
    
    // Step 4: Save to database
    const savedProperties = [];
    for (const property of filteredProperties) {
      try {
        const saved = await createProperty({
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode || null,
          propertyType: property.propertyType,
          currentPrice: property.currentPrice,
          estimatedARV: property.estimatedARV || null,
          estimatedRenovationCost: property.estimatedRenovationCost || null,
          beds: property.beds || null,
          baths: property.baths || null,
          squareFeet: property.squareFeet || null,
          lotSize: property.lotSize || null,
          propertyCondition: property.propertyCondition || null,
          daysOnMarket: property.daysOnMarket || null,
          listingUrl: property.listingUrl || null,
          sellerContactInfo: property.sellerContactInfo || null,
          latitude: property.latitude || null,
          longitude: property.longitude || null,
          dataSource: property.dataSource,
        });
        savedProperties.push(saved);
      } catch (error) {
        console.error(`[Agentic Search] Error saving property:`, error);
      }
    }
    
    console.log(`[Agentic Search] Successfully saved ${savedProperties.length} properties`);
    
    return {
      success: true,
      count: savedProperties.length,
      properties: savedProperties,
    };
  } catch (error) {
    console.error("[Agentic Search] Error:", error);
    throw error;
  }
}

/**
 * Generate search queries for finding distressed properties
 */
function generateSearchQueries(criteria: SearchCriteria): string[] {
  const queries: string[] = [];
  const { location, propertyType, maxPrice } = criteria;
  
  // Base property type queries
  const types = propertyType === "both" 
    ? ["single family home", "multifamily property", "duplex", "triplex"]
    : propertyType === "single-family"
    ? ["single family home", "house"]
    : ["multifamily", "duplex", "triplex", "apartment building"];
  
  // Combine with distressed keywords
  for (const type of types) {
    for (const keyword of DISTRESSED_KEYWORDS.slice(0, 5)) { // Use top 5 keywords
      const priceFilter = maxPrice ? ` under $${maxPrice}` : "";
      queries.push(`${keyword} ${type} for sale in ${location}${priceFilter}`);
    }
  }
  
  // Add specific site searches
  queries.push(`site:zillow.com foreclosure ${location}`);
  queries.push(`site:realtor.com fixer upper ${location}`);
  queries.push(`site:auction.com bank owned ${location}`);
  queries.push(`site:foreclosure.com ${location}`);
  
  return queries.slice(0, 10); // Limit to 10 queries to avoid rate limits
}

/**
 * Use LLM with web search capability to find real properties
 */
async function searchWebForProperties(
  queries: string[],
  criteria: SearchCriteria
): Promise<PropertyListing[]> {
  const allProperties: PropertyListing[] = [];
  
  // Search in batches to avoid overwhelming the LLM
  for (let i = 0; i < queries.length; i += 3) {
    const batchQueries = queries.slice(i, i + 3);
    
    const prompt = `You are a real estate investment property researcher. Search the web for distressed investment properties matching these criteria:

Location: ${criteria.location}
Property Type: ${criteria.propertyType || "any"}
Max Price: ${criteria.maxPrice ? `$${criteria.maxPrice}` : "no limit"}
Max Price % of ARV: ${criteria.maxPriceToARVRatio ? `${criteria.maxPriceToARVRatio}%` : "no limit"}

Search queries to use:
${batchQueries.map((q, idx) => `${idx + 1}. ${q}`).join("\n")}

For each property you find:
1. Extract the full address, city, state, zip code
2. Get the current listing price
3. Estimate the ARV (After Repair Value) based on comparable sales
4. Estimate renovation costs based on property condition
5. Get property details (beds, baths, sqft, lot size, year built)
6. Note the property condition and any distressed indicators
7. Get the listing URL and data source
8. Extract any seller contact information if available

Return ONLY a JSON array of properties (no other text):
[{
  "address": "123 Main St",
  "city": "Austin",
  "state": "TX",
  "zipCode": "78701",
  "propertyType": "single-family",
  "currentPrice": 250000,
  "estimatedARV": 350000,
  "estimatedRenovationCost": 50000,
  "propertyCondition": "Needs renovation",
  "daysOnMarket": 45,
  "listingUrl": "https://...",
  "beds": 3,
  "baths": 2,
  "squareFeet": 1800,
  "lotSize": 7500,
  "yearBuilt": 1975,
  "description": "Foreclosure property...",
  "dataSource": "Zillow",
  "latitude": "30.2672",
  "longitude": "-97.7431"
}]

If you cannot find any properties, return an empty array: []`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a real estate data extraction expert. Always return valid JSON arrays. Use web search to find real property listings.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') continue;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const properties = JSON.parse(jsonMatch[0]);
        allProperties.push(...properties);
      }
    } catch (error) {
      console.error(`[Agentic Search] Error in batch ${i / 3 + 1}:`, error);
      // Continue with next batch even if one fails
    }
    
    // Add delay between batches to avoid rate limits
    if (i + 3 < queries.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return allProperties;
}

/**
 * Filter properties based on criteria
 */
function filterProperties(
  properties: PropertyListing[],
  criteria: SearchCriteria
): PropertyListing[] {
  return properties.filter((property) => {
    // Filter by max price
    if (criteria.maxPrice && property.currentPrice > criteria.maxPrice) {
      return false;
    }
    
    // Filter by price-to-ARV ratio
    if (criteria.maxPriceToARVRatio && property.estimatedARV) {
      const ratio = (property.currentPrice / property.estimatedARV) * 100;
      if (ratio > criteria.maxPriceToARVRatio) {
        return false;
      }
    }
    
    // Filter by min profit
    if (criteria.minProfit && property.estimatedARV && property.estimatedRenovationCost) {
      const profit = property.estimatedARV - property.currentPrice - property.estimatedRenovationCost;
      if (profit < criteria.minProfit) {
        return false;
      }
    }
    
    // Filter by days on market
    if (criteria.minDaysOnMarket && property.daysOnMarket) {
      if (property.daysOnMarket < criteria.minDaysOnMarket) {
        return false;
      }
    }
    
    // Filter by property type
    if (criteria.propertyType && criteria.propertyType !== "both") {
      if (property.propertyType !== criteria.propertyType) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Run multi-location search
 */
export async function runMultiLocationSearch(
  locations: string[],
  criteria: Omit<SearchCriteria, "location">
): Promise<{ success: boolean; totalCount: number; results: any[] }> {
  const allResults: any[] = [];
  
  for (const location of locations) {
    try {
      const result = await runAgenticSearch({
        ...criteria,
        location,
      });
      allResults.push({
        location,
        count: result.count,
        properties: result.properties,
      });
    } catch (error) {
      console.error(`[Multi-Location Search] Error for ${location}:`, error);
      allResults.push({
        location,
        count: 0,
        properties: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    
    // Add delay between locations
    if (locations.indexOf(location) < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  const totalCount = allResults.reduce((sum, r) => sum + r.count, 0);
  
  return {
    success: true,
    totalCount,
    results: allResults,
  };
}

