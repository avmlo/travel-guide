import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { chatWithGemini, generateStructuredWithGemini } from "../_core/gemini";

export const aiRouter = router({
  // AI Travel Assistant Chat
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        destinations: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemInstruction = `You are a helpful travel assistant. You help users discover and plan trips to amazing destinations around the world. 
      
${input.destinations ? `Here are the available destinations in our database:\n${JSON.stringify(input.destinations.slice(0, 50), null, 2)}` : ""}

Be friendly, enthusiastic, and provide specific recommendations. When suggesting destinations, mention specific places from our database if relevant.`;

      const response = await chatWithGemini(input.messages, systemInstruction);
      
      return {
        message: response,
      };
    }),

  // Smart Natural Language Search
  smartSearch: publicProcedure
    .input(
      z.object({
        query: z.string(),
        destinations: z.array(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const systemInstruction = `You are a search query analyzer for a travel guide website. 
      
Analyze the user's natural language query and extract:
1. Keywords to search for
2. Categories (e.g., restaurant, hotel, cafe, bar, etc.)
3. Cities or locations mentioned
4. Special requirements (e.g., romantic, budget-friendly, luxury, family-friendly)
5. Cuisine types if mentioned

Return relevant destination IDs or slugs from the provided list that match the query.`;

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

      const prompt = `User query: "${input.query}"

Available destinations (first 100):
${JSON.stringify(input.destinations.slice(0, 100), null, 2)}

Analyze this query and return matching destinations.`;

      const result = await generateStructuredWithGemini<{
        keywords: string[];
        categories: string[];
        cities: string[];
        requirements: string[];
        matchedDestinations: string[];
        explanation: string;
      }>(prompt, schema, systemInstruction);

      return result;
    }),

  // Itinerary Generator
  generateItinerary: publicProcedure
    .input(
      z.object({
        city: z.string(),
        days: z.number().min(1).max(14),
        interests: z.array(z.string()),
        destinations: z.array(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const systemInstruction = `You are a travel itinerary planner. Create detailed, realistic day-by-day itineraries based on user preferences.`;

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
        (d: any) => d.city.toLowerCase() === input.city.toLowerCase()
      );

      const prompt = `Create a ${input.days}-day itinerary for ${input.city}.

User interests: ${input.interests.join(", ")}

Available destinations in ${input.city}:
${JSON.stringify(relevantDestinations.slice(0, 30).map((d: any) => ({ name: d.name, slug: d.slug, category: d.category, description: d.description })), null, 2)}

IMPORTANT: You MUST ONLY use destinations from the provided list above. Do not suggest any destinations not in this list.
For each activity, include the exact 'slug' field from the destination data as 'destinationSlug'.
Create a realistic, well-paced itinerary. Include breakfast, lunch, dinner, and activities using ONLY the destinations provided.`;

      const result = await generateStructuredWithGemini<{
        title: string;
        description: string;
        days: Array<{
          day: number;
          title: string;
          activities: Array<{
            time: string;
            activity: string;
            destination: string;
            description: string;
          }>;
        }>;
        tips: string[];
      }>(prompt, schema, systemInstruction);

      return result;
    }),
});

