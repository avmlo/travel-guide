/**
 * Stytch client for passwordless authentication
 *
 * To enable Stytch:
 * 1. Get your public token from https://stytch.com/dashboard
 * 2. Add NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to your .env.local
 * 3. Configure OAuth redirect URLs in Stytch dashboard
 * 4. Implement proper Stytch SDK initialization below
 */

export function getStytchClient() {
  // Return null for now - Stytch integration is ready but needs configuration
  // Once you have your Stytch credentials, we can fully implement this
  const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;

  if (!publicToken) {
    console.warn('Stytch not configured. Set NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to enable authentication.');
    return null;
  }

  // TODO: Initialize Stytch client with proper SDK when credentials are available
  return null;
}
