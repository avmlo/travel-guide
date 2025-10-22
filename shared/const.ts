export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Pagination constants
export const PAGINATION = {
  INITIAL_DISPLAY: 40,
  LOAD_MORE_INCREMENT: 40,
} as const;

// AI-related limits
export const AI_LIMITS = {
  MAX_DESTINATIONS_CONTEXT: 100,
  MAX_SUGGESTIONS: 5,
  MAX_CONVERSATION_MESSAGES: 50,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_ITINERARY_DAYS: 14,
  MAX_ACTIVITIES_PER_DAY: 30,
  MAX_RECENT_ACTIVITY: 50,
} as const;

// API timeouts
export const API_TIMEOUTS = {
  GOOGLE_PLACES: 10_000,
  GEMINI_AI: 60_000,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  AI_REQUESTS_PER_WINDOW: 20,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const;

// Database
export const DB_CONFIG = {
  CONNECTION_POOL_SIZE: 10,
  QUERY_TIMEOUT: 30_000,
} as const;
