import { z } from 'zod';

// Input sanitization utilities
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 100); // Limit search query length
}

// Validation schemas
export const searchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(100, 'Search query too long')
  .transform(sanitizeSearchQuery);

export const destinationSlugSchema = z.string()
  .min(1, 'Destination slug is required')
  .max(255, 'Destination slug too long')
  .regex(/^[a-z0-9-]+$/, 'Invalid destination slug format');

export const cityNameSchema = z.string()
  .min(1, 'City name is required')
  .max(100, 'City name too long')
  .transform(sanitizeString);

export const userNotesSchema = z.string()
  .max(1000, 'Notes too long')
  .transform(sanitizeString)
  .optional();

export const preferencesSchema = z.object({
  favoriteCategories: z.array(z.string().max(50)).max(20).optional(),
  favoriteCities: z.array(z.string().max(100)).max(20).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
});

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// XSS protection for user content
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Rate limiting helper (client-side)
const rateLimitMap = new Map<string, number>();

export function checkRateLimit(key: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const requests = rateLimitMap.get(key) || 0;
  
  if (requests >= limit) {
    return false;
  }
  
  rateLimitMap.set(key, requests + 1);
  
  // Clean up old entries
  setTimeout(() => {
    const currentTime = Date.now();
    for (const [k, v] of rateLimitMap.entries()) {
      if (v < currentTime - windowMs) {
        rateLimitMap.delete(k);
      }
    }
  }, windowMs);
  
  return true;
}