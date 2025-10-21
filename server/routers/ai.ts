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
      // Format destinations for better context
      const destinationsContext = input.destinations ? input.destinations.slice(0, 100).map((d: any) => ({
        name: d.name,
        city: d.city,
        category: d.category,
        description: d.description || d.content?.substring(0, 150),
        michelinStars: d.michelinStars,
        crown: d.crown
      })) : [];

      const systemInstruction = `You are a helpful travel assistant for a curated travel guide. Your role is to help users discover destinations from our exclusive collection and create personalized itineraries.

**CRITICAL RULES:**
1. You MUST ONLY recommend destinations that are in the provided database below
2. NEVER suggest or mention places that are not in our database
3. When users ask for recommendations, only suggest from the available destinations
4. If a user asks about a place not in our database, politely say it's not in our current collection and suggest similar alternatives from our database
5. Always mention the city and category when recommending a place
6. Highlight special features like Michelin stars or crown ratings when relevant

**CAPABILITIES:**
- Recommend destinations based on preferences (romantic, budget, luxury, family-friendly, etc.)
- Create detailed day-by-day itineraries for any city in our database
- Suggest restaurants, hotels, cafes, and attractions
- Answer travel questions about our destinations

**ITINERARY CREATION:**
When users ask for an itinerary (e.g., "Create a 3-day itinerary for Paris"):
1. Create a detailed day-by-day plan
2. Include breakfast, lunch, dinner, and activities
3. ONLY use destinations from our database for that city
4. Organize by time of day (morning, afternoon, evening)
5. Include realistic travel times between locations
6. Add helpful tips for the trip

**OUR CURATED DESTINATIONS DATABASE:**
${destinationsContext.length > 0 ? JSON.stringify(destinationsContext, null, 2) : "No destinations available"}

Be friendly, enthusiastic, and helpful. Provide detailed recommendations and itineraries from our collection. If you don't have relevant destinations for a query, be honest and suggest the closest matches from what we have.`;

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
        allDestinations: z.array(z.any()),
        savedPlaces: z.array(z.string()).optional(),
        visitedPlaces: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemInstruction = `You are a personalized travel recommendation engine. 
      
Analyze the current destination and the user's preferences (based on their saved places) to suggest similar destinations they might enjoy.
      
RULES:
1. ONLY suggest destinations from the provided list
2. DO NOT suggest destinations the user has already visited
3. Prioritize destinations similar to their saved places
4. Consider location, category, style, and special features (like Michelin stars)
5. Suggest 3-5 destinations maximum
6. Provide a brief reason why each suggestion matches their taste`;

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
        (d: any) => 
          d.slug !== input.currentDestination.slug &&
          !input.visitedPlaces?.includes(d.slug)
      );

      // Get saved destinations for context
      const savedDestinations = input.savedPlaces
        ? input.allDestinations.filter((d: any) => input.savedPlaces?.includes(d.slug))
        : [];

      const prompt = `Current destination the user is viewing:
${JSON.stringify(input.currentDestination, null, 2)}

User's saved places (shows their preferences):
${savedDestinations.length > 0 ? JSON.stringify(savedDestinations.slice(0, 10).map((d: any) => ({ name: d.name, city: d.city, category: d.category, michelinStars: d.michelinStars })), null, 2) : "No saved places yet"}

Available destinations to recommend (excluding visited):
${JSON.stringify(availableDestinations.slice(0, 50).map((d: any) => ({ slug: d.slug, name: d.name, city: d.city, category: d.category, michelinStars: d.michelinStars })), null, 2)}

Based on the current destination and the user's saved places, suggest 3-5 similar destinations they would enjoy.`;

      const result = await generateStructuredWithGemini<{
        suggestions: Array<{
          slug: string;
          reason: string;
        }>;
      }>(prompt, schema, systemInstruction);

      return result;
    }),
});

