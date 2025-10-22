/**
 * Cookie Consent Management
 * Handles user's cookie preferences and consent state
 */

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface ConsentState {
  hasConsented: boolean;
  timestamp: number;
  preferences: CookiePreferences;
}

const CONSENT_STORAGE_KEY = 'cookie_consent';
const CONSENT_VERSION = '1.0';

/**
 * Default cookie preferences (only necessary enabled)
 */
export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

/**
 * Get stored consent state
 */
export function getConsentState(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const state: ConsentState = JSON.parse(stored);
    return state;
  } catch (error) {
    console.error('Error reading consent state:', error);
    return null;
  }
}

/**
 * Check if user has given consent
 */
export function hasConsented(): boolean {
  const state = getConsentState();
  return state?.hasConsented || false;
}

/**
 * Save consent state
 */
export function saveConsent(preferences: CookiePreferences): void {
  const state: ConsentState = {
    hasConsented: true,
    timestamp: Date.now(),
    preferences,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));

    // Trigger custom event for analytics/tracking scripts to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: preferences
    }));
  } catch (error) {
    console.error('Error saving consent state:', error);
  }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  saveConsent({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
}

/**
 * Reject optional cookies (keep only necessary)
 */
export function rejectOptionalCookies(): void {
  saveConsent(DEFAULT_PREFERENCES);
}

/**
 * Clear consent (for testing or user request)
 */
export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing consent:', error);
  }
}

/**
 * Check if specific cookie category is allowed
 */
export function isCookieTypeAllowed(type: keyof CookiePreferences): boolean {
  const state = getConsentState();
  if (!state) return false;

  // Necessary cookies are always allowed
  if (type === 'necessary') return true;

  return state.preferences[type] || false;
}

/**
 * Get current preferences
 */
export function getCurrentPreferences(): CookiePreferences {
  const state = getConsentState();
  return state?.preferences || DEFAULT_PREFERENCES;
}
