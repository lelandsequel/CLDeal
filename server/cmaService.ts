import { invokeLLM } from "./_core/llm";
import type { Property } from "../drizzle/schema";

/**
 * Generate Comparative Market Analysis using LLM
 * Analyzes market data and provides ARV estimates based on comparable properties
 */
export async function generateCMA(property: Property) {
  const prompt = `You are a real estate investment analyst specializing in Comparative Market Analysis (CMA). 

Analyze this property and provide a comprehensive market analysis:

**Property Details:**
- Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode || ""}
- Type: ${property.propertyType}
- Bedrooms: ${property.beds || "N/A"}
- Bathrooms: ${property.baths || "N/A"}
- Square Feet: ${property.squareFeet || "N/A"}
- Current Price: $${property.currentPrice?.toLocaleString() || "N/A"}
- Est. ARV: $${property.estimatedARV?.toLocaleString() || "N/A"}
- Condition: ${property.propertyCondition || "N/A"}
- Days on Market: ${property.daysOnMarket || "N/A"}

**Task:**
Generate a realistic CMA report including:

1. **Market Overview** - Current market conditions in ${property.city}, ${property.state}
2. **Comparable Properties** - List 3-5 similar properties that recently sold in the area (make them realistic for the location)
3. **ARV Analysis** - Justify the After Repair Value estimate
4. **Market Trends** - Price trends, days on market, buyer demand
5. **Investment Recommendation** - Is this a good deal? What are the risks?

Format your response as a detailed market analysis report. Be specific with numbers and realistic about the local market.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert real estate analyst with deep knowledge of property valuation and market analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const cmaReport = response.choices[0]?.message?.content;
    
    if (typeof cmaReport !== "string") {
      throw new Error("Invalid CMA response format");
    }

    return cmaReport;
  } catch (error) {
    console.error("Error generating CMA:", error);
    throw new Error("Failed to generate CMA report");
  }
}

/**
 * Generate quick ARV estimate using LLM
 */
export async function estimateARV(property: Property): Promise<number> {
  const prompt = `Based on this property data, estimate a realistic After Repair Value (ARV):

Address: ${property.address}, ${property.city}, ${property.state}
Type: ${property.propertyType}
Beds/Baths: ${property.beds}/${property.baths}
Square Feet: ${property.squareFeet}
Current Price: $${property.currentPrice}
Condition: ${property.propertyCondition}

Provide ONLY a number (the estimated ARV in dollars, no formatting or explanation).`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a real estate appraiser. Respond with only a number.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const arvText = response.choices[0]?.message?.content;
    
    if (typeof arvText !== "string") {
      throw new Error("Invalid ARV response format");
    }

    const arv = parseInt(arvText.replace(/[^0-9]/g, ""));
    
    if (isNaN(arv)) {
      throw new Error("Could not parse ARV estimate");
    }

    return arv;
  } catch (error) {
    console.error("Error estimating ARV:", error);
    // Fallback: use existing ARV or calculate based on current price
    return property.estimatedARV || Math.round((property.currentPrice || 0) * 1.3);
  }
}

