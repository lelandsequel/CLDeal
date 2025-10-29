import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { runAgenticSearch, runMultiLocationSearch } from "./agenticSearch";
import { parseAndMapCSV } from "./csvMapper";
import { generateHTMLReport, generatePDFHTML } from "./exportUtils";
import { calculateRental, calculateFlip, calculateBRRRR } from "./financialCalculator";
import * as financialScenarioDB from "./financialScenarioDB";
import * as propertyNotesDB from "./propertyNotesDB";
import { generateCMA, estimateARV } from "./cmaService";
import { calculateDealScore, batchCalculateScores } from "./dealScoring";
import * as savedSearchesDB from "./savedSearchesDB";
import { notifyOwner } from "./_core/notification";
import * as offersDB from "./offersDB";
import * as tasksDB from "./tasksDB";
import * as contractorsDB from "./contractorsDB";
import { parseNaturalLanguageQuery, generateRecommendations } from "./nlSearch";
import { getMarketStats, getPriceTrends, getTopMarkets, predictAppreciation } from "./marketAnalytics";
import * as portfolioDB from "./portfolioDB";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  properties: router({
    search: publicProcedure
      .input(
        z.object({
          propertyType: z.enum(["single-family", "multifamily"]).optional(),
          propertySource: z.enum(["sample", "imported", "agentic"]).optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          minARV: z.number().optional(),
          maxARV: z.number().optional(),
          maxPriceToARVRatio: z.number().optional(), // e.g., 60 means max 60% of ARV
          minProfit: z.number().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          minDaysOnMarket: z.number().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        const results = await db.searchProperties(input);
        
        // Save search history if user is authenticated
        if (ctx.user) {
          await db.addSearchHistory({
            userId: ctx.user.id,
            searchParams: JSON.stringify(input),
            resultsCount: results.length,
          });
        }
        
        return results;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPropertyById(input.id);
      }),

    getRecent: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getRecentProperties(input.limit);
      }),

    // Admin procedure to add properties (can be called by search agents)
    create: protectedProcedure
      .input(
        z.object({
          address: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string().optional(),
          propertyType: z.enum(["single-family", "multifamily"]),
          currentPrice: z.number(),
          estimatedARV: z.number().optional(),
          estimatedRenovationCost: z.number().optional(),
          estimatedProfitPotential: z.number().optional(),
          propertyCondition: z.string().optional(),
          daysOnMarket: z.number().optional(),
          sellerType: z.string().optional(),
          listingUrl: z.string().optional(),
          mlsNumber: z.string().optional(),
          beds: z.number().optional(),
          baths: z.number().optional(),
          squareFeet: z.number().optional(),
          lotSize: z.number().optional(),
          sellerContactInfo: z.string().optional(),
          photoUrls: z.string().optional(),
          dataSource: z.string().optional(),
          profitScore: z.number().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createProperty(input);
      }),

    // Bulk delete properties by source
    bulkDeleteBySource: protectedProcedure
      .input(z.object({ source: z.enum(["sample", "imported", "agentic"]) }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can bulk delete
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        return await db.deletePropertiesBySource(input.source);
      }),

    // Import properties from CSV with intelligent mapping
    importCSV: protectedProcedure
      .input(z.object({ csvData: z.string() }))
      .mutation(async ({ input }) => {
        const { properties, errors: parseErrors } = parseAndMapCSV(input.csvData);
        
        const results = { 
          success: 0, 
          failed: parseErrors.length, 
          errors: [...parseErrors] 
        };

        for (const property of properties) {
          try {
            await db.createProperty(property);
            results.success++;
          } catch (error) {
            results.errors.push(`${property.address}: ${error instanceof Error ? error.message : 'Database error'}`);
            results.failed++;
          }
        }

        return results;
      }),

    // Intelligent search using LLM to parse natural language queries
    intelligentSearch: publicProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are a real estate search assistant. Extract search parameters from user queries and return them as JSON. Available parameters: propertyType (single-family, multifamily, or both), minPrice, maxPrice, minProfit, city, state, minDaysOnMarket.",
              },
              {
                role: "user",
                content: `Extract search parameters from this query: "${input.query}"`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "search_params",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    propertyType: { type: "string" },
                    minPrice: { type: "number" },
                    maxPrice: { type: "number" },
                    minProfit: { type: "number" },
                    city: { type: "string" },
                    state: { type: "string" },
                    minDaysOnMarket: { type: "number" },
                  },
                  required: [],
                  additionalProperties: false,
                },
              },
            },
          });

          const messageContent = response.choices[0].message.content;
          const contentString = typeof messageContent === "string" ? messageContent : "{}";
          const searchParams = JSON.parse(contentString);
          const results = await db.searchProperties(searchParams);

          // Save search history if user is authenticated
          if (ctx.user) {
            await db.addSearchHistory({
              userId: ctx.user.id,
              searchParams: JSON.stringify({ query: input.query, ...searchParams }),
              resultsCount: results.length,
            });
          }

          return { results, parsedParams: searchParams };
        } catch (error) {
          console.error("Intelligent search error:", error);
          throw new Error("Failed to process search query");
        }
      }),
  }),

  watchlist: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserWatchlist(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          propertyId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.addToWatchlist({
          userId: ctx.user.id,
          propertyId: input.propertyId,
          notes: input.notes,
        });
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.removeFromWatchlist(input.id, ctx.user.id);
      }),

    updateNotes: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          notes: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.updateWatchlistNotes(input.id, ctx.user.id, input.notes);
      }),

    isInWatchlist: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.isPropertyInWatchlist(ctx.user.id, input.propertyId);
      }),
  }),

  alerts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAlerts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          propertyType: z.enum(["single-family", "multifamily", "both"]),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          minProfitMargin: z.number().optional(),
          location: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createAlert({
          ...input,
          userId: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          propertyType: z.enum(["single-family", "multifamily", "both"]).optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          minProfitMargin: z.number().optional(),
          location: z.string().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return await db.updateAlert(id, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.deleteAlert(input.id, ctx.user.id);
      }),
  }),

  searchHistory: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        return await db.getUserSearchHistory(ctx.user.id, input.limit);
      }),
  }),

  agenticSearch: router({
    // Run agentic search for a single location
    runSearch: protectedProcedure
      .input(
        z.object({
          location: z.string(),
          propertyType: z.enum(["single-family", "multifamily", "both"]).optional(),
          maxPrice: z.number().optional(),
          minProfit: z.number().optional(),
          maxPriceToARVRatio: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await runAgenticSearch(input);
      }),

    // Run agentic search for multiple locations
    runMultiSearch: protectedProcedure
      .input(
        z.object({
          locations: z.array(z.string()),
          propertyType: z.enum(["single-family", "multifamily", "both"]).optional(),
          maxPrice: z.number().optional(),
          minProfit: z.number().optional(),
          maxPriceToARVRatio: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { locations, ...criteria } = input;
        return await runMultiLocationSearch(locations, criteria);
      }),
  }),

  financialCalculator: router({  
    // Calculate rental strategy ROI
    calculateRental: protectedProcedure
      .input(
        z.object({
          purchasePrice: z.number(),
          downPaymentPercent: z.number(),
          interestRate: z.number(),
          loanTermYears: z.number(),
          closingCosts: z.number(),
          monthlyRent: z.number(),
          vacancyRate: z.number(),
          propertyManagementPercent: z.number(),
          monthlyInsurance: z.number(),
          monthlyPropertyTax: z.number(),
          monthlyHOA: z.number(),
          monthlyMaintenance: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return calculateRental(input);
      }),

    // Calculate flip strategy ROI
    calculateFlip: protectedProcedure
      .input(
        z.object({
          purchasePrice: z.number(),
          downPaymentPercent: z.number(),
          interestRate: z.number(),
          closingCosts: z.number(),
          renovationCost: z.number(),
          holdingMonths: z.number(),
          afterRepairValue: z.number(),
          sellingCostsPercent: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return calculateFlip(input);
      }),

    // Calculate BRRRR strategy ROI
    calculateBRRRR: protectedProcedure
      .input(
        z.object({
          purchasePrice: z.number(),
          downPaymentPercent: z.number(),
          interestRate: z.number(),
          loanTermYears: z.number(),
          closingCosts: z.number(),
          renovationCost: z.number(),
          afterRepairValue: z.number(),
          refinanceLTV: z.number(),
          refinanceRate: z.number(),
          monthlyRent: z.number(),
          vacancyRate: z.number(),
          propertyManagementPercent: z.number(),
          monthlyInsurance: z.number(),
          monthlyPropertyTax: z.number(),
          monthlyHOA: z.number(),
          monthlyMaintenance: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return calculateBRRRR(input);
      }),

    // Save a financial scenario
    saveScenario: protectedProcedure
      .input(
        z.object({
          propertyId: z.number(),
          scenarioName: z.string(),
          strategyType: z.enum(["rental", "flip", "brrrr"]),
          calculationData: z.any(), // The full calculation input and results
        })
      )
      .mutation(async ({ input, ctx }) => {
        const data = input.calculationData;
        
        // Convert percentages to basis points for storage
        const toBasisPoints = (percent: number) => Math.round(percent * 100);
        
        await financialScenarioDB.createFinancialScenario({
          propertyId: input.propertyId,
          userId: ctx.user!.id,
          scenarioName: input.scenarioName,
          strategyType: input.strategyType,
          purchasePrice: data.purchasePrice,
          downPaymentPercent: toBasisPoints(data.downPaymentPercent),
          downPaymentAmount: data.downPayment || Math.round(data.purchasePrice * (data.downPaymentPercent / 100)),
          loanAmount: data.loanAmount,
          interestRate: toBasisPoints(data.interestRate),
          loanTermYears: data.loanTermYears,
          closingCosts: data.closingCosts,
          monthlyRent: data.monthlyRent || null,
          vacancyRate: data.vacancyRate ? toBasisPoints(data.vacancyRate) : null,
          propertyManagementPercent: data.propertyManagementPercent ? toBasisPoints(data.propertyManagementPercent) : null,
          monthlyInsurance: data.monthlyInsurance || null,
          monthlyPropertyTax: data.monthlyPropertyTax || null,
          monthlyHOA: data.monthlyHOA || null,
          monthlyMaintenance: data.monthlyMaintenance || null,
          renovationCost: data.renovationCost || null,
          holdingMonths: data.holdingMonths || null,
          sellingCostsPercent: data.sellingCostsPercent ? toBasisPoints(data.sellingCostsPercent) : null,
          afterRepairValue: data.afterRepairValue || null,
          refinanceARV: data.afterRepairValue || null,
          refinanceLTV: data.refinanceLTV ? toBasisPoints(data.refinanceLTV) : null,
          refinanceRate: data.refinanceRate ? toBasisPoints(data.refinanceRate) : null,
          monthlyMortgagePayment: data.monthlyMortgagePayment || null,
          monthlyCashFlow: data.monthlyCashFlow || null,
          annualCashFlow: data.annualCashFlow || null,
          cashOnCashReturn: data.cashOnCashReturn ? toBasisPoints(data.cashOnCashReturn) : null,
          capRate: data.capRate ? toBasisPoints(data.capRate) : null,
          totalProfit: data.netProfit || data.totalProfit || null,
          roi: data.roi ? toBasisPoints(data.roi) : null,
        });
        
        return { success: true };
      }),

    // Get scenarios for a property
    getScenarios: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input }) => {
        return await financialScenarioDB.getScenariosByProperty(input.propertyId);
      }),

    // Delete a scenario
    deleteScenario: protectedProcedure
      .input(z.object({ scenarioId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await financialScenarioDB.deleteFinancialScenario(input.scenarioId, ctx.user!.id);
        return { success: true };
      }),
  }),

  offers: router({
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        offerAmount: z.number(),
        contingencies: z.string().optional(),
        closingDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await offersDB.createOffer({
          ...input,
          userId: ctx.user.id,
          closingDate: input.closingDate ? new Date(input.closingDate) : null,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await offersDB.getUserOffers(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "submitted", "accepted", "rejected", "countered", "withdrawn"]).optional(),
        offerAmount: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await offersDB.updateOffer(id, ctx.user.id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await offersDB.deleteOffer(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  tasks: router({
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        taskType: z.enum(["inspection", "appraisal", "contractor_quote", "financing", "title_search", "insurance", "walkthrough", "closing", "other"]),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await tasksDB.createTask({
          ...input,
          userId: ctx.user.id,
          propertyId: input.propertyId || null,
          description: input.description || null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await tasksDB.getUserTasks(ctx.user.id);
    }),
    pending: protectedProcedure.query(async ({ ctx }) => {
      return await tasksDB.getPendingTasks(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        if (updates.status === "completed") {
          (updates as any).completedAt = new Date();
        }
        await tasksDB.updateTask(id, ctx.user.id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await tasksDB.deleteTask(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  analytics: router({
    marketStats: publicProcedure
      .input(z.object({ city: z.string().optional(), state: z.string().optional() }))
      .query(async ({ input }) => {
        return await getMarketStats(input.city, input.state);
      }),
    priceTrends: publicProcedure
      .input(z.object({ city: z.string().optional(), state: z.string().optional() }))
      .query(async ({ input }) => {
        return await getPriceTrends(input.city, input.state);
      }),
    topMarkets: publicProcedure.query(async () => {
        return await getTopMarkets();
      }),
    predictAppreciation: publicProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input }) => {
        return await predictAppreciation(input.propertyId);
      }),
  }),

  nlSearch: router({
    parse: protectedProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ input }) => {
        return await parseNaturalLanguageQuery(input.query);
      }),
    recommendations: protectedProcedure.query(async ({ ctx }) => {
        const searches = await db.getUserSearchHistory(ctx.user.id);
        return await generateRecommendations({}, searches);
      }),
  }),

  portfolio: router({
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number().optional(),
        address: z.string(),
        city: z.string().optional(),
        state: z.string().optional(),
        purchasePrice: z.number(),
        purchaseDate: z.string(),
        currentValue: z.number().optional(),
        renovationCost: z.number().optional(),
        monthlyRent: z.number().optional(),
        monthlyExpenses: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await portfolioDB.createPortfolioItem({
          ...input,
          userId: ctx.user.id,
          propertyId: input.propertyId || null,
          city: input.city || null,
          state: input.state || null,
          purchaseDate: new Date(input.purchaseDate),
          currentValue: input.currentValue || null,
          renovationCost: input.renovationCost || null,
          monthlyRent: input.monthlyRent || null,
          monthlyExpenses: input.monthlyExpenses || null,
          notes: input.notes || null,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await portfolioDB.getUserPortfolio(ctx.user.id);
    }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await portfolioDB.getPortfolioStats(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["owned", "under_contract", "renovating", "rented", "sold"]).optional(),
        currentValue: z.number().optional(),
        monthlyRent: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await portfolioDB.updatePortfolioItem(id, ctx.user.id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await portfolioDB.deletePortfolioItem(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  contractors: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        company: z.string().optional(),
        specialty: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await contractorsDB.createContractor({
          ...input,
          userId: ctx.user.id,
          company: input.company || null,
          specialty: input.specialty || null,
          phone: input.phone || null,
          email: input.email || null,
          rating: input.rating || null,
          notes: input.notes || null,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await contractorsDB.getUserContractors(ctx.user.id);
    }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await contractorsDB.updateContractor(id, ctx.user.id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await contractorsDB.deleteContractor(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  savedSearches: router({
    // Create a new saved search
    create: protectedProcedure
      .input(
        z.object({
          searchName: z.string(),
          propertyType: z.enum(["single-family", "multifamily"]).optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          minARV: z.number().optional(),
          maxARV: z.number().optional(),
          maxPriceToARVRatio: z.number().optional(),
          minProfit: z.number().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          minDaysOnMarket: z.number().optional(),
          notificationsEnabled: z.boolean().default(true),
          notificationFrequency: z.enum(["instant", "daily", "weekly"]).default("daily"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await savedSearchesDB.createSavedSearch({
          userId: ctx.user.id,
          searchName: input.searchName,
          propertyType: input.propertyType || null,
          minPrice: input.minPrice || null,
          maxPrice: input.maxPrice || null,
          minARV: input.minARV || null,
          maxARV: input.maxARV || null,
          maxPriceToARVRatio: input.maxPriceToARVRatio || null,
          minProfit: input.minProfit || null,
          city: input.city || null,
          state: input.state || null,
          minDaysOnMarket: input.minDaysOnMarket || null,
          notificationsEnabled: input.notificationsEnabled ? 1 : 0,
          notificationFrequency: input.notificationFrequency,
        });
        return { success: true };
      }),

    // Get all saved searches for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const searches = await savedSearchesDB.getUserSavedSearches(ctx.user.id);
      return searches;
    }),

    // Delete a saved search
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await savedSearchesDB.deleteSavedSearch(input.id, ctx.user.id);
        return { success: true };
      }),

    // Toggle notifications for a saved search
    toggleNotifications: protectedProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await savedSearchesDB.updateSavedSearch(input.id, ctx.user.id, {
          notificationsEnabled: input.enabled ? 1 : 0,
        });
        return { success: true };
      }),
  }),

  dealScore: router({
    // Calculate deal score for a single property
    calculate: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ input }) => {
        const property = await db.getPropertyById(input.propertyId);
        if (!property) {
          throw new Error("Property not found");
        }
        const score = await calculateDealScore(property);
        return score;
      }),

    // Calculate scores for all properties in search results
    batchCalculate: protectedProcedure
      .input(z.object({ propertyIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const properties = await Promise.all(
          input.propertyIds.map((id) => db.getPropertyById(id))
        );
        const validProperties = properties.filter((p): p is NonNullable<typeof p> => p !== undefined);
        const scores = await batchCalculateScores(validProperties);
        return Object.fromEntries(scores);
      }),
  }),

  cma: router({
    // Generate CMA report for a property
    generate: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ input }) => {
        const property = await db.getPropertyById(input.propertyId);
        if (!property) {
          throw new Error("Property not found");
        }
        const cmaReport = await generateCMA(property);
        return { cmaReport };
      }),

    // Estimate ARV for a property
    estimateARV: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ input }) => {
        const property = await db.getPropertyById(input.propertyId);
        if (!property) {
          throw new Error("Property not found");
        }
        const arv = await estimateARV(property);
        return { arv };
      }),
  }),

  propertyNotes: router({
    // Create a new note
    create: protectedProcedure
      .input(
        z.object({
          propertyId: z.number(),
          noteText: z.string(),
          noteType: z.enum(["general", "inspection", "contractor", "financing", "offer"]).default("general"),
          isPrivate: z.number().default(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await propertyNotesDB.createPropertyNote({
          ...input,
          userId: ctx.user!.id,
        });
        return { success: true };
      }),

    // Get notes for a property
    getByProperty: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await propertyNotesDB.getNotesByProperty(input.propertyId, ctx.user!.id);
      }),

    // Update a note
    update: protectedProcedure
      .input(
        z.object({
          noteId: z.number(),
          noteText: z.string().optional(),
          noteType: z.enum(["general", "inspection", "contractor", "financing", "offer"]).optional(),
          isPrivate: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { noteId, ...updates } = input;
        await propertyNotesDB.updatePropertyNote(noteId, ctx.user!.id, updates);
        return { success: true };
      }),

    // Delete a note
    delete: protectedProcedure
      .input(z.object({ noteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await propertyNotesDB.deletePropertyNote(input.noteId, ctx.user!.id);
        return { success: true };
      }),

    // Share a property
    share: protectedProcedure
      .input(
        z.object({
          propertyId: z.number(),
          sharedWithEmail: z.string().email(),
          accessLevel: z.enum(["view", "edit"]).default("view"),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await propertyNotesDB.shareProperty({
          ...input,
          sharedByUserId: ctx.user!.id,
        });
        return { success: true };
      }),

    // Get shares for a property
    getShares: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await propertyNotesDB.getPropertyShares(input.propertyId, ctx.user!.id);
      }),

    // Remove a share
    removeShare: protectedProcedure
      .input(z.object({ shareId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await propertyNotesDB.removePropertyShare(input.shareId, ctx.user!.id);
        return { success: true };
      }),
  }),

  export: router({
    html: protectedProcedure
      .input(
        z.object({
          propertyIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        let properties;
        if (input.propertyIds && input.propertyIds.length > 0) {
          // Export specific properties
          properties = await Promise.all(
            input.propertyIds.map(id => db.getPropertyById(id))
          );
          properties = properties.filter(p => p !== undefined) as any[];
        } else {
          // Export all properties
          properties = await db.searchProperties({});
        }
        
        const html = generateHTMLReport(properties);
        return { html };
      }),

    pdf: protectedProcedure
      .input(
        z.object({
          propertyIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        let properties;
        if (input.propertyIds && input.propertyIds.length > 0) {
          // Export specific properties
          properties = await Promise.all(
            input.propertyIds.map(id => db.getPropertyById(id))
          );
          properties = properties.filter(p => p !== undefined) as any[];
        } else {
          // Export all properties
          properties = await db.searchProperties({});
        }
        
        const html = generatePDFHTML(properties);
        return { html };
      }),
  }),
});

export type AppRouter = typeof appRouter;
