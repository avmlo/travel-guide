import { z } from "zod";

// Destination schema
export const DestinationSchema = z.object({
  slug: z.string(),
  name: z.string(),
  city: z.string(),
  category: z.string(),
  content: z.string(),
  description: z.string().optional(),
  mainImage: z.string().optional(),
  image: z.string().optional(),
  michelinStars: z.number().optional(),
  michelin_stars: z.number().optional(),
  crown: z.boolean().optional(),
  brand: z.string().optional(),
  cardTags: z.string().optional(),
  lat: z.number().optional(),
  long: z.number().optional(),
  myRating: z.number().optional(),
  reviewed: z.boolean().optional(),
  subline: z.string().optional(),
  rating: z.string().or(z.number()).optional(),
});

export type Destination = z.infer<typeof DestinationSchema>;

// Simplified destination for AI context (to reduce payload size)
export const DestinationContextSchema = z.object({
  slug: z.string(),
  name: z.string(),
  city: z.string(),
  category: z.string(),
  description: z.string().optional(),
  michelinStars: z.number().optional(),
  crown: z.boolean().optional(),
});

export type DestinationContext = z.infer<typeof DestinationContextSchema>;

// Message schema for AI chat
export const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(5000),
});

export type Message = z.infer<typeof MessageSchema>;

// User preferences schema
export const UserPreferencesSchema = z.object({
  favoriteCategories: z.array(z.string()).default([]),
  favoriteCities: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Itinerary schemas
export const ItineraryActivitySchema = z.object({
  time: z.string(),
  activity: z.string(),
  destination: z.string(),
  destinationSlug: z.string().optional(),
  description: z.string(),
});

export const ItineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  activities: z.array(ItineraryActivitySchema),
});

export const ItinerarySchema = z.object({
  title: z.string(),
  description: z.string(),
  days: z.array(ItineraryDaySchema),
  tips: z.array(z.string()),
});

export type ItineraryActivity = z.infer<typeof ItineraryActivitySchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;

// Smart search result schema
export const SmartSearchResultSchema = z.object({
  keywords: z.array(z.string()),
  categories: z.array(z.string()),
  cities: z.array(z.string()),
  requirements: z.array(z.string()),
  matchedDestinations: z.array(z.string()),
  explanation: z.string(),
});

export type SmartSearchResult = z.infer<typeof SmartSearchResultSchema>;

// AI suggestion schema
export const AISuggestionSchema = z.object({
  slug: z.string(),
  reason: z.string(),
});

export const AISuggestionsResponseSchema = z.object({
  suggestions: z.array(AISuggestionSchema),
});

export type AISuggestion = z.infer<typeof AISuggestionSchema>;
export type AISuggestionsResponse = z.infer<typeof AISuggestionsResponseSchema>;
