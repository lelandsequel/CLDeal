import { drizzle } from "drizzle-orm/mysql2";
import { properties } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const sampleProperties = [
  {
    address: "1234 Elm Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    propertyType: "single-family" as const,
    currentPrice: 250000,
    estimatedARV: 350000,
    estimatedRenovationCost: 50000,
    estimatedProfitPotential: 35000,
    propertyCondition: "Needs cosmetic updates, roof repair",
    daysOnMarket: 75,
    sellerType: "Bank-owned",
    listingUrl: "https://example.com/listing1",
    mlsNumber: "MLS12345",
    beds: 3,
    baths: 2,
    squareFeet: 1800,
    lotSize: 7500,
    sellerContactInfo: "Contact: John Doe, (512) 555-0100",
    dataSource: "MLS",
    profitScore: 85,
    latitude: "30.2672",
    longitude: "-97.7431",
  },
  {
    address: "5678 Oak Avenue",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    propertyType: "multifamily" as const,
    currentPrice: 450000,
    estimatedARV: 600000,
    estimatedRenovationCost: 80000,
    estimatedProfitPotential: 52000,
    propertyCondition: "Distressed, needs major renovation",
    daysOnMarket: 90,
    sellerType: "Foreclosure",
    listingUrl: "https://example.com/listing2",
    mlsNumber: "MLS67890",
    beds: 8,
    baths: 4,
    squareFeet: 3200,
    lotSize: 10000,
    sellerContactInfo: "Contact: Jane Smith, (214) 555-0200",
    dataSource: "Foreclosure.com",
    profitScore: 92,
    latitude: "32.7767",
    longitude: "-96.7970",
  },
  {
    address: "910 Maple Drive",
    city: "Houston",
    state: "TX",
    zipCode: "77002",
    propertyType: "single-family" as const,
    currentPrice: 180000,
    estimatedARV: 280000,
    estimatedRenovationCost: 40000,
    estimatedProfitPotential: 48000,
    propertyCondition: "Fixer-upper, dated interior",
    daysOnMarket: 65,
    sellerType: "Estate sale",
    listingUrl: "https://example.com/listing3",
    mlsNumber: "MLS24680",
    beds: 4,
    baths: 2,
    squareFeet: 2100,
    lotSize: 8000,
    sellerContactInfo: "Contact: Estate Attorney, (713) 555-0300",
    dataSource: "Zillow",
    profitScore: 88,
    latitude: "29.7604",
    longitude: "-95.3698",
  },
  {
    address: "1122 Pine Street",
    city: "San Antonio",
    state: "TX",
    zipCode: "78205",
    propertyType: "single-family" as const,
    currentPrice: 150000,
    estimatedARV: 220000,
    estimatedRenovationCost: 35000,
    estimatedProfitPotential: 25000,
    propertyCondition: "Handyman special",
    daysOnMarket: 45,
    sellerType: "Motivated seller",
    listingUrl: "https://example.com/listing4",
    mlsNumber: "MLS13579",
    beds: 3,
    baths: 1,
    squareFeet: 1500,
    lotSize: 6000,
    sellerContactInfo: "Contact: Bob Johnson, (210) 555-0400",
    dataSource: "Realtor.com",
    profitScore: 75,
    latitude: "29.4241",
    longitude: "-98.4936",
  },
  {
    address: "3344 Cedar Lane",
    city: "Austin",
    state: "TX",
    zipCode: "78702",
    propertyType: "multifamily" as const,
    currentPrice: 380000,
    estimatedARV: 520000,
    estimatedRenovationCost: 70000,
    estimatedProfitPotential: 54000,
    propertyCondition: "Needs updates, good bones",
    daysOnMarket: 80,
    sellerType: "Divorce sale",
    listingUrl: "https://example.com/listing5",
    mlsNumber: "MLS98765",
    beds: 6,
    baths: 3,
    squareFeet: 2800,
    lotSize: 9000,
    sellerContactInfo: "Contact: Real Estate Agent, (512) 555-0500",
    dataSource: "Redfin",
    profitScore: 90,
    latitude: "30.2630",
    longitude: "-97.7200",
  },
];

async function seed() {
  console.log("Seeding database with sample properties...");
  
  for (const property of sampleProperties) {
    await db.insert(properties).values(property);
    console.log(`Added: ${property.address}`);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
