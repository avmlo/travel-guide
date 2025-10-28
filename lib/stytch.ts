/**
 * Stytch client for passwordless authentication
 *
 * To enable Stytch:
 * 1. Get your public token from https://stytch.com/dashboard
 * 2. Add NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to your .env.local
 * 3. Configure OAuth redirect URLs in Stytch dashboard
 */

import { createStytchUIClient } from '@stytch/nextjs/ui';
import { StytchUIClient } from '@stytch/vanilla-js';

let stytchClient: StytchUIClient | null = null;

export function getStytchClient(): StytchUIClient | null {
  const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;

  if (!publicToken) {
    console.warn('Stytch not configured. Set NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN to enable authentication.');
    return null;
  }

  // Create singleton instance
  if (!stytchClient) {
    try {
      stytchClient = createStytchUIClient(publicToken);
    } catch (error) {
      console.error('Failed to initialize Stytch client:', error);
      return null;
    }
  }

  return stytchClient;
}
