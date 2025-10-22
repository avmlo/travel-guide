/**
 * Safely parse JSON string with fallback
 * @param text - JSON string to parse
 * @param fallback - Value to return if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(text: string | null | undefined, fallback: T): T {
  if (!text || text === null || text === undefined) {
    return fallback;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Safely stringify JSON with error handling
 * @param value - Value to stringify
 * @returns JSON string or null on error
 */
export function safeJsonStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Failed to stringify JSON:', error);
    return null;
  }
}

/**
 * Validate that user ID is valid
 */
export function validateUserId(userId: string | null | undefined): userId is string {
  return typeof userId === 'string' && userId.length > 0;
}

/**
 * Create error response with consistent format
 */
export function createErrorResponse(message: string, code?: string) {
  return {
    error: message,
    code: code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };
}
