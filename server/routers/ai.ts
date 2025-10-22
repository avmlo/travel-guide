import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chatWithGemini, generateStructuredWithGemini } from "../_core/gemini";
import { TRPCError } from "@trpc/server";
import {
  MessageSchema,
  DestinationSchema,
  DestinationContextSchema,
  SmartSearchResultSchema,
  ItinerarySchema,
  AISuggestionsResponseSchema,
  type DestinationContext,
  type SmartSearchResult,
  type Itinerary,
  type AISuggestionsResponse
} from "@shared/schemas";
import { AI_LIMITS } from "@shared/const";
import {
  getTravelAssistantPrompt,
  SMART_SEARCH_PROMPT,
  ITINERARY_PLANNER_PROMPT,
  getPersonalizationPrompt
} from "../prompts/travel-assistant";

export const aiRouter = router({
  // AI Travel Assistant Chat
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(MessageSchema).min(1).max(AI_LIMITS.MAX_CONVERSATION_MESSAGES),
        destinations: z.array(DestinationSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Format destinations for better context (limit size)
        const destinationsContext: DestinationContext[] = input.destinations
          ? input.destinations.slice(0, AI_LIMITS.MAX_DESTINATIONS_CONTEXT).map(d => ({
              slug: d.slug,
              name: d.name,
              city: d.city,
              category: d.category,
              description: d.description || d.content?.substring(0, 150),
              michelinStars: d.michelinStars || d.michelin_stars,
              crown: d.crown
            }))
          : [];

        const systemInstruction = getTravelAssistantPrompt(destinationsContext);
        const response = await chatWithGemini(input.messages, systemInstruction);

        return {
          message: response,
        };
      } catch (error) {
        console.error('[AI Chat] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process your message. Please try again.',
          cause: error,
        });
      }
    }),

  // Smart Natural Language Search
  smartSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(500),
        destinations: z.array(DestinationSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const schema = {
          type: "object",
          properties: {
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Keywords extracted from the query",
            },
            categories: {
              type: "array",
              items: { type: "string" },
              description: "Categories mentioned or implied",
            },
            cities: {
              type: "array",
              items: { type: "string" },
              description: "Cities or locations mentioned",
            },
            requirements: {
              type: "array",
              items: { type: "string" },
              description: "Special requirements like romantic, budget, luxury",
            },
            matchedDestinations: {
              type: "array",
              items: { type: "string" },
              description: "Slugs of destinations that match the criteria",
            },
            explanation: {
              type: "string",
              description: "Brief explanation of the search results",
            },
          },
          required: ["keywords", "categories", "cities", "requirements", "matchedDestinations", "explanation"],
        };

        const limitedDestinations = input.destinations.slice(0, AI_LIMITS.MAX_DESTINATIONS_CONTEXT);

        const prompt = `User query: "${input.query}"

Available destinations (first ${AI_LIMITS.MAX_DESTINATIONS_CONTEXT}):
${JSON.stringify(limitedDestinations, null, 2)}

Analyze this query and return matching destinations.`;

        const result = await generateStructuredWithGemini<SmartSearchResult>(
          prompt,
          schema,
          SMART_SEARCH_PROMPT
        );

        return result;
      } catch (error) {
        console.error('[AI Smart Search] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process search query. Please try again.',
          cause: error,
        });
      }
    }),

  // Itinerary Generator
  generateItinerary: publicProcedure
    .input(
      z.object({
        city: z.string().min(1),
        days: z.number().min(1).max(AI_LIMITS.MAX_ITINERARY_DAYS),
        interests: z.array(z.string()),
        destinations: z.array(DestinationSchema),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const schema = {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the itinerary",
            },
            description: {
              type: "string",
              description: "Brief description of the trip",
            },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  title: { type: "string" },
                  activities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string" },
                        activity: { type: "string" },
                        destination: { type: "string" },
                        destinationSlug: { type: "string", description: "Slug of the destination for linking" },
                        description: { type: "string" },
                      },
                      required: ["time", "activity", "destination", "description"],
                    },
                  },
                },
                required: ["day", "title", "activities"],
              },
            },
            tips: {
              type: "array",
              items: { type: "string" },
              description: "Travel tips for this itinerary",
            },
          },
          required: ["title", "description", "days", "tips"],
        };

        const relevantDestinations = input.destinations.filter(
          d => d.city.toLowerCase() === input.city.toLowerCase()
        );

        if (relevantDestinations.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `No destinations found for ${input.city}. Please try a different city.`,
          });
        }

        const limitedDestinations = relevantDestinations.slice(0, AI_LIMITS.MAX_ACTIVITIES_PER_DAY);

        const prompt = `Create a ${input.days}-day itinerary for ${input.city}.

User interests: ${input.interests.join(", ")}

Available destinations in ${input.city}:
${JSON.stringify(limitedDestinations.map(d => ({
  name: d.name,
  slug: d.slug,
  category: d.category,
  description: d.description || d.content?.substring(0, 100)
})), null, 2)}

IMPORTANT: You MUST ONLY use destinations from the provided list above. Do not suggest any destinations not in this list.
For each activity, include the exact 'slug' field from the destination data as 'destinationSlug'.
Create a realistic, well-paced itinerary. Include breakfast, lunch, dinner, and activities using ONLY the destinations provided.`;

        const result = await generateStructuredWithGemini<Itinerary>(
          prompt,
          schema,
          ITINERARY_PLANNER_PROMPT
        );

        return result;
      } catch (error) {
        console.error('[AI Itinerary] Error:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate itinerary. Please try again.',
          cause: error,
        });
      }
    }),

  // Get personalized suggestions for a destination
  getSuggestions: publicProcedure
    .input(
      z.object({
        currentDestination: z.object({
          slug: z.string(),
          name: z.string(),
          city: z.string(),
          category: z.string(),
          michelinStars: z.number().optional(),
        }),
        allDestinations: z.array(DestinationSchema),
        savedPlaces: z.array(z.string()).optional(),
        visitedPlaces: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const schema = {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  slug: { type: "string", description: "Destination slug" },
                  reason: { type: "string", description: "Why this destination is recommended" },
                },
                required: ["slug", "reason"],
              },
              description: "List of recommended destinations",
            },
          },
          required: ["suggestions"],
        };

        // Filter out visited places and current destination
        const availableDestinations = input.allDestinations.filter(
          d =>
            d.slug !== input.currentDestination.slug &&
            !input.visitedPlaces?.includes(d.slug)
        );

        // Get saved destinations for context
        const savedDestinations = input.savedPlaces
          ? input.allDestinations.filter(d => input.savedPlaces?.includes(d.slug))
          : [];

        const limitedAvailable = availableDestinations.slice(0, 50);
        const limitedSaved = savedDestinations.slice(0, 10);

        const prompt = `Current destination the user is viewing:
${JSON.stringify(input.currentDestination, null, 2)}

User's saved places (shows their preferences):
${limitedSaved.length > 0 ? JSON.stringify(limitedSaved.map(d => ({
  name: d.name,
  city: d.city,
  category: d.category,
  michelinStars: d.michelinStars || d.michelin_stars
})), null, 2) : "No saved places yet"}

Available destinations to recommend (excluding visited):
${JSON.stringify(limitedAvailable.map(d => ({
  slug: d.slug,
  name: d.name,
  city: d.city,
  category: d.category,
  michelinStars: d.michelinStars || d.michelin_stars
})), null, 2)}

Based on the current destination and the user's saved places, suggest ${AI_LIMITS.MAX_SUGGESTIONS} similar destinations they would enjoy.`;

        const result = await generateStructuredWithGemini<AISuggestionsResponse>(
          prompt,
          schema,
          getPersonalizationPrompt()
        );

        return result;
      } catch (error) {
        console.error('[AI Suggestions] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate suggestions. Please try again.',
          cause: error,
        });
      }
    }),
});
