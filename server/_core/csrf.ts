import { nanoid } from "nanoid";
import { logger } from "./logger";

/**
 * In-memory store for CSRF tokens
 * In production, consider using Redis for distributed systems
 */
const tokenStore = new Map<string, { redirectUri: string; expiresAt: number }>();

/**
 * Cleanup expired tokens every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(token);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug({ cleaned, remaining: tokenStore.size }, "Cleaned expired CSRF tokens");
  }
}, 5 * 60 * 1000);

/**
 * Creates a secure CSRF token for OAuth state parameter
 * @param redirectUri - URI to redirect to after OAuth
 * @returns Secure random token
 */
export function createCsrfToken(redirectUri: string): string {
  const token = nanoid(32); // 32 character secure random string
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  tokenStore.set(token, { redirectUri, expiresAt });

  logger.debug({ token, expiresAt }, "Created CSRF token");

  return token;
}

/**
 * Validates and consumes a CSRF token (one-time use)
 * @param token - Token to validate
 * @returns Redirect URI if valid, null otherwise
 */
export function validateCsrfToken(token: string): string | null {
  const data = tokenStore.get(token);

  if (!data) {
    logger.warn({ token }, "Invalid CSRF token: not found");
    return null;
  }

  // Check if expired
  if (data.expiresAt < Date.now()) {
    tokenStore.delete(token);
    logger.warn({ token }, "Invalid CSRF token: expired");
    return null;
  }

  // One-time use: delete after validation
  tokenStore.delete(token);

  logger.debug({ token, redirectUri: data.redirectUri }, "Validated CSRF token");

  return data.redirectUri;
}

/**
 * Get statistics about token store (for monitoring)
 */
export function getTokenStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;

  for (const data of tokenStore.values()) {
    if (data.expiresAt >= now) {
      active++;
    } else {
      expired++;
    }
  }

  return { active, expired, total: tokenStore.size };
}
