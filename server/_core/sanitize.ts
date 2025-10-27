import validator from "validator";

/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitizes a string by escaping HTML entities
 * Prevents XSS attacks by converting dangerous characters to HTML entities
 * @param input - User input string
 * @returns Sanitized string safe for HTML rendering
 */
export function sanitizeHtml(input: string): string {
  return validator.escape(input);
}

/**
 * Sanitizes user notes/descriptions
 * Allows basic formatting but prevents XSS
 * @param input - User input text
 * @param maxLength - Maximum allowed length (default: 5000)
 * @returns Sanitized and truncated text
 */
export function sanitizeText(input: string, maxLength: number = 5000): string {
  if (!input) return "";

  // Trim whitespace
  let sanitized = input.trim();

  // Escape HTML
  sanitized = validator.escape(sanitized);

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates and sanitizes an email address
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    return null;
  }

  return validator.normalizeEmail(trimmed) || trimmed;
}

/**
 * Sanitizes a URL
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed URL protocols (default: ['http', 'https'])
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string, allowedProtocols: string[] = ['http', 'https']): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  if (!validator.isURL(trimmed, { protocols: allowedProtocols, require_protocol: true })) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitizes a slug (alphanumeric with hyphens)
 * Used for destination slugs, trip IDs, etc.
 * @param slug - Slug to sanitize
 * @param maxLength - Maximum length (default: 255)
 * @returns Sanitized slug or null if invalid
 */
export function sanitizeSlug(slug: string, maxLength: number = 255): string | null {
  if (!slug) return null;

  const trimmed = slug.trim().toLowerCase();

  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-z0-9_-]+$/.test(trimmed)) {
    return null;
  }

  if (trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitizes a number within a range
 * @param value - Value to sanitize
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(value: any, min?: number, max?: number): number | null {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

/**
 * Sanitizes an integer within a range
 * @param value - Value to sanitize
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized integer or null if invalid
 */
export function sanitizeInteger(value: any, min?: number, max?: number): number | null {
  const num = sanitizeNumber(value, min, max);

  if (num === null) {
    return null;
  }

  if (!Number.isInteger(num)) {
    return null;
  }

  return num;
}

/**
 * Sanitizes a rating (1-5)
 * @param rating - Rating value
 * @returns Sanitized rating or null if invalid
 */
export function sanitizeRating(rating: any): number | null {
  return sanitizeInteger(rating, 1, 5);
}

/**
 * Sanitizes a JSON string
 * @param jsonString - JSON string to parse and sanitize
 * @param maxDepth - Maximum nesting depth (default: 10)
 * @returns Parsed object or null if invalid
 */
export function sanitizeJson<T = any>(jsonString: string, maxDepth: number = 10): T | null {
  if (!jsonString) return null;

  try {
    const parsed = JSON.parse(jsonString);

    // Check depth to prevent deeply nested objects (DoS attack)
    const checkDepth = (obj: any, depth: number = 0): boolean => {
      if (depth > maxDepth) return false;
      if (typeof obj !== 'object' || obj === null) return true;

      for (const key in obj) {
        if (!checkDepth(obj[key], depth + 1)) {
          return false;
        }
      }

      return true;
    };

    if (!checkDepth(parsed)) {
      return null;
    }

    return parsed as T;
  } catch {
    return null;
  }
}
