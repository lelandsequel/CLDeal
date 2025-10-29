/**
 * Intelligent CSV Mapper
 * Auto-detects column names and transforms any CSV format to match the app's schema
 */

import Papa from 'papaparse';

interface ColumnMapping {
  [key: string]: string[];
}

// Map various column name variations to our standard fields
const COLUMN_MAPPINGS: ColumnMapping = {
  address: ['address', 'street', 'street_address', 'property_address'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'st', 'province'],
  zipCode: ['zip', 'zipcode', 'zip_code', 'postal_code', 'postalcode'],
  beds: ['beds', 'bedrooms', 'bed', 'bedroom', 'br'],
  baths: ['baths', 'bathrooms', 'bath', 'bathroom', 'ba'],
  squareFeet: ['square_feet', 'squarefeet', 'sqft', 'sq_ft', 'square_footage', 'area'],
  lotSize: ['lot_size', 'lotsize', 'lot', 'land_size'],
  currentPrice: ['price', 'current_price', 'currentprice', 'list_price', 'listprice', 'asking_price'],
  estimatedARV: ['arv', 'estimated_arv', 'after_repair_value', 'arv_estimate'],
  estimatedRenovationCost: ['renovation_cost', 'renovationcost', 'rehab_cost', 'rehabcost', 'repair_cost'],
  daysOnMarket: ['days_on_market', 'daysonmarket', 'dom', 'days_listed'],
  yearBuilt: ['year_built', 'yearbuilt', 'built', 'construction_year'],
  listingUrl: ['listing_url', 'listingurl', 'url', 'link', 'property_url'],
};

export interface MappedProperty {
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  propertyType: "single-family" | "multifamily";
  propertySource: "sample" | "imported" | "agentic";
  currentPrice: number;
  estimatedARV: number | null;
  estimatedRenovationCost: number | null;
  beds: number | null;
  baths: number | null;
  squareFeet: number | null;
  lotSize: number | null;
  propertyCondition: string | null;
  daysOnMarket: number | null;
  listingUrl: string | null;
  sellerContactInfo: string | null;
  latitude: string | null;
  longitude: string | null;
}

/**
 * Normalize column name for matching
 */
function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
}

/**
 * Find matching field for a CSV column
 */
function findMatchingField(columnName: string): string | null {
  const normalized = normalizeColumnName(columnName);
  
  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    // Check for exact match or contains match
    if (variations.some(v => {
      const normalizedVariation = normalizeColumnName(v);
      return normalized === normalizedVariation || 
             normalized.includes(normalizedVariation) || 
             normalizedVariation.includes(normalized);
    })) {
      return field;
    }
  }
  
  return null;
}

/**
 * Parse numeric value, handling ranges and various formats
 */
function parseNumericValue(value: string): number | null {
  if (!value || value === 'N/A') return null;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '');
  
  // Handle ranges (e.g., "280000-320000" or "28-32%")
  if (cleaned.includes('-')) {
    const [low, high] = cleaned.split('-').map(v => parseFloat(v.replace(/%/g, '')));
    if (!isNaN(low) && !isNaN(high)) {
      return (low + high) / 2; // Return average
    }
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Infer property type from beds/baths
 */
function inferPropertyType(beds: number | null, baths: number | null): "single-family" | "multifamily" {
  // If 5+ beds or 4+ baths, likely multifamily
  if ((beds !== null && beds >= 5) || (baths !== null && baths >= 4)) {
    return "multifamily";
  }
  return "single-family";
}

/**
 * Infer property condition from renovation cost
 */
function inferPropertyCondition(renovationCost: number | null, price: number): string | null {
  if (renovationCost === null) return "Needs assessment";
  
  const ratio = renovationCost / price;
  
  if (ratio < 0.1) return "Good condition, minor updates needed";
  if (ratio < 0.25) return "Fair condition, cosmetic updates required";
  if (ratio < 0.40) return "Fixer-upper, significant renovation needed";
  return "Distressed, major renovation required";
}

/**
 * Map CSV row to property object
 */
export function mapCSVRow(row: Record<string, string>, headers: string[]): MappedProperty | null {
  const mapped: Partial<MappedProperty> = {};
  
  // First, handle exact column name matches (case-insensitive)
  const exactMatches: Record<string, string> = {
    'Address': 'address',
    'City': 'city',
    'State': 'state',
    'Zip': 'zipCode',
    'Price': 'currentPrice',
    'Bedrooms': 'beds',
    'Bathrooms': 'baths',
    'Square_Feet': 'squareFeet',
    'Lot_Size': 'lotSize',
    'Days_on_Market': 'daysOnMarket',
    'Year_Built': 'yearBuilt',
    'Listing_URL': 'listingUrl',
  };
  
  for (const [csvCol, appField] of Object.entries(exactMatches)) {
    if (row[csvCol]) {
      const value = row[csvCol];
      // Handle numeric fields
      if (['currentPrice', 'beds', 'baths', 'squareFeet', 'daysOnMarket'].includes(appField)) {
        const numValue = parseNumericValue(value);
        if (numValue !== null) {
          (mapped as any)[appField] = numValue;
        }
      } else if (appField === 'lotSize') {
        // Lot size might be "3 lots" or a number
        const numValue = parseNumericValue(value);
        (mapped as any)[appField] = numValue;
      } else {
        // String fields
        (mapped as any)[appField] = value;
      }
    }
  }
  
  // Handle ARV ranges (ARV_Low, ARV_High)
  const arvLow = parseNumericValue(row['ARV_Low'] || '');
  const arvHigh = parseNumericValue(row['ARV_High'] || '');
  if (arvLow && arvHigh) {
    mapped.estimatedARV = (arvLow + arvHigh) / 2;
  }
  
  // Handle renovation cost ranges
  const renLow = parseNumericValue(row['Renovation_Cost_Low'] || '');
  const renHigh = parseNumericValue(row['Renovation_Cost_High'] || '');
  if (renLow && renHigh) {
    mapped.estimatedRenovationCost = (renLow + renHigh) / 2;
  }
  
  // Then, try fuzzy matching for any unmapped fields
  for (const header of headers) {
    const field = findMatchingField(header);
    if (field && !(mapped as any)[field] && row[header]) {
      const value = row[header];
      
      // Handle numeric fields
      if (['beds', 'baths', 'squareFeet', 'currentPrice', 'estimatedARV', 'estimatedRenovationCost', 'daysOnMarket'].includes(field)) {
        const numValue = parseNumericValue(value);
        if (numValue !== null) {
          (mapped as any)[field] = numValue;
        }
      } else {
        // String fields
        (mapped as any)[field] = value;
      }
    }
  }
  
  // Validate required fields
  if (!mapped.address || !mapped.city || !mapped.state || !mapped.currentPrice) {
    return null; // Missing required fields
  }
  
  // Infer property type if not provided
  if (!mapped.propertyType) {
    mapped.propertyType = inferPropertyType(mapped.beds || null, mapped.baths || null);
  }
  
  // Infer property condition if not provided
  if (!mapped.propertyCondition && mapped.currentPrice) {
    mapped.propertyCondition = inferPropertyCondition(
      mapped.estimatedRenovationCost || null,
      mapped.currentPrice
    );
  }
  
  // Set defaults for optional fields
  return {
    address: mapped.address,
    city: mapped.city,
    state: mapped.state,
    zipCode: mapped.zipCode || null,
    propertyType: mapped.propertyType,
    propertySource: 'imported' as const,
    currentPrice: mapped.currentPrice,
    estimatedARV: mapped.estimatedARV || null,
    estimatedRenovationCost: mapped.estimatedRenovationCost || null,
    beds: mapped.beds || null,
    baths: mapped.baths || null,
    squareFeet: mapped.squareFeet || null,
    lotSize: mapped.lotSize ? parseNumericValue(String(mapped.lotSize)) : null,
    propertyCondition: mapped.propertyCondition || null,
    daysOnMarket: mapped.daysOnMarket || null,
    listingUrl: mapped.listingUrl || null,
    sellerContactInfo: null,
    latitude: null,
    longitude: null,
  };
}

/**
 * Parse and map entire CSV file using papaparse for robust parsing
 */
export function parseAndMapCSV(csvData: string): { properties: MappedProperty[]; errors: string[] } {
  const properties: MappedProperty[] = [];
  const errors: string[] = [];
  
  // Use papaparse for robust CSV parsing
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  
  if (parsed.errors.length > 0) {
    parsed.errors.forEach(err => {
      errors.push(`Parse error at row ${err.row}: ${err.message}`);
    });
  }
  
  if (!parsed.data || parsed.data.length === 0) {
    return { properties: [], errors: ['CSV file must contain at least one data row'] };
  }
  
  const headers = parsed.meta.fields || [];
  
  parsed.data.forEach((row: any, index) => {
    try {
      const mapped = mapCSVRow(row, headers);
      if (mapped) {
        properties.push(mapped);
      } else {
        errors.push(`Row ${index + 2}: Missing required fields (address, city, state, or price)`);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  });
  
  return { properties, errors };
}

