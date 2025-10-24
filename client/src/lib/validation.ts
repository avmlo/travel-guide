import { z } from 'zod';

/**
 * Validation schemas for form inputs and API data
 */

// User-related schemas
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().nullable(),
  email: z.string().email('Invalid email format').nullable(),
  avatar: z.string().url('Invalid avatar URL').nullable(),
  createdAt: z.date().optional(),
  lastSignedIn: z.date().optional(),
});

export const userProfileSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  avatar: z.string().url('Invalid avatar URL').nullable(),
  bio: z.string().max(500, 'Bio too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  createdAt: z.date(),
  lastSignedIn: z.date(),
});

// Destination schemas
export const destinationSchema = z.object({
  name: z.string().min(1, 'Destination name is required').max(200, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  category: z.enum(['restaurant', 'cafe', 'hotel', 'bar', 'shop', 'bakery', 'attraction', 'other'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  content: z.string().max(5000, 'Content too long'),
  mainImage: z.string().url('Invalid image URL').optional(),
  michelinStars: z.number().min(0).max(3, 'Invalid Michelin stars'),
  crown: z.boolean(),
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  long: z.number().min(-180).max(180, 'Invalid longitude'),
  subline: z.string().max(500, 'Subline too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
});

// Review schemas
export const reviewSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  destinationSlug: z.string().min(1, 'Destination slug is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(1, 'Review title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Review content is required').max(2000, 'Content too long'),
  photos: z.array(z.string().url('Invalid photo URL')).max(10, 'Too many photos'),
  helpfulVotes: z.number().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createReviewSchema = reviewSchema.omit({
  id: true,
  userId: true,
  helpfulVotes: true,
  createdAt: true,
  updatedAt: true,
});

// List schemas
export const listSchema = z.object({
  id: z.string().min(1, 'List ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'List name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  isPublic: z.boolean(),
  isCollaborative: z.boolean(),
  itemCount: z.number().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createListSchema = listSchema.omit({
  id: true,
  userId: true,
  itemCount: true,
  createdAt: true,
  updatedAt: true,
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
  category: z.string().optional(),
  city: z.string().optional(),
  sortBy: z.enum(['name', 'city', 'category', 'rating', 'created']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// AI Chat schemas
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content is required').max(4000, 'Message too long'),
  timestamp: z.date().optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message is required'),
  destinations: z.array(destinationSchema).optional(),
});

// Itinerary schemas
export const itinerarySchema = z.object({
  title: z.string().min(1, 'Itinerary title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long'),
  city: z.string().min(1, 'City is required'),
  days: z.number().min(1, 'At least 1 day required').max(14, 'Maximum 14 days'),
  interests: z.array(z.string()).min(1, 'At least one interest required'),
});

// User preferences schemas
export const userPreferencesSchema = z.object({
  favoriteCategories: z.array(z.string()).max(10, 'Too many favorite categories'),
  favoriteCities: z.array(z.string()).max(20, 'Too many favorite cities'),
  interests: z.array(z.string()).max(15, 'Too many interests'),
});

// Form validation helpers
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

// Type exports for use in components
export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Destination = z.infer<typeof destinationSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type CreateReview = z.infer<typeof createReviewSchema>;
export type List = z.infer<typeof listSchema>;
export type CreateList = z.infer<typeof createListSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;