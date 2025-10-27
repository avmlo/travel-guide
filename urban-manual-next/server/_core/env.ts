/**
 * Validates that a required environment variable is set
 * @param name - Environment variable name
 * @param value - Environment variable value
 * @returns The validated value
 * @throws Error if the value is empty in production
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    const isProduction = process.env.NODE_ENV === "production";
    const message = `Missing required environment variable: ${name}`;

    if (isProduction) {
      throw new Error(message);
    } else {
      console.warn(`[WARNING] ${message}`);
      return "";
    }
  }
  return value;
}

/**
 * Gets optional environment variable with fallback
 * @param value - Environment variable value
 * @param fallback - Fallback value (default: "")
 */
function optionalEnv(value: string | undefined, fallback: string = ""): string {
  return value ?? fallback;
}

export const ENV = {
  appId: requireEnv("VITE_APP_ID", process.env.VITE_APP_ID),
  cookieSecret: requireEnv("JWT_SECRET", process.env.JWT_SECRET),
  databaseUrl: optionalEnv(process.env.DATABASE_URL),
  oAuthServerUrl: requireEnv("OAUTH_SERVER_URL", process.env.OAUTH_SERVER_URL),
  ownerId: optionalEnv(process.env.OWNER_OPEN_ID),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: optionalEnv(process.env.BUILT_IN_FORGE_API_URL),
  forgeApiKey: optionalEnv(process.env.BUILT_IN_FORGE_API_KEY),
  geminiApiKey: optionalEnv(process.env.GOOGLE_CLOUD_API_KEY ?? process.env.GEMINI_API_KEY),
};
