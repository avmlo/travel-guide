import { supabase } from './supabase';

function trackingDisabled(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !url || !key || url.includes('placeholder.supabase.co') || key === 'placeholder-key';
}

// Generate or retrieve session ID from localStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Get user context for tracking
export async function getUserContext() {
  if (trackingDisabled()) return { userId: undefined, sessionId: getSessionId(), timestamp: new Date().toISOString(), deviceType: getDeviceType(), timeOfDay: getTimeOfDay() };
  const { data: { user } } = await supabase.auth.getUser();

  return {
    userId: user?.id,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    deviceType: getDeviceType(),
    timeOfDay: getTimeOfDay(),
  };
}

// Detect device type
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
    return 'mobile';
  }
  if (/tablet|ipad/.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

// Get time of day category
function getTimeOfDay(): string {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Track user interaction
export async function trackInteraction(params: {
  type: 'view' | 'click' | 'save' | 'visit' | 'search' | 'filter' | 'scroll';
  destinationSlug?: string;
  city?: string;
  category?: string;
  duration?: number;
  metadata?: Record<string, any>;
}) {
  try {
    if (trackingDisabled()) return;
    const context = await getUserContext();

    const { error } = await supabase
      .from('user_interactions')
      .insert({
        session_id: context.sessionId,
        user_id: context.userId || null,
        interaction_type: params.type,
        destination_slug: params.destinationSlug || null,
        city: params.city || null,
        category: params.category || null,
        duration_seconds: params.duration || null,
        metadata: params.metadata || {},
      });

    if (error) {
      console.error('Error tracking interaction:', error);
    }
  } catch (error) {
    console.error('Failed to track interaction:', error);
  }
}

// Track page view
export async function trackPageView(params: {
  pageType: 'home' | 'destination' | 'city' | 'category';
  destinationSlug?: string;
  city?: string;
  category?: string;
}) {
  await trackInteraction({
    type: 'view',
    destinationSlug: params.destinationSlug,
    city: params.city,
    category: params.category,
    metadata: { page_type: params.pageType },
  });
}

// Track destination click
export async function trackDestinationClick(params: {
  destinationSlug: string;
  position: number;
  source: 'grid' | 'map' | 'search' | 'recommendation';
}) {
  await trackInteraction({
    type: 'click',
    destinationSlug: params.destinationSlug,
    metadata: {
      position: params.position,
      source: params.source,
    },
  });
}

// Track search
export async function trackSearch(params: {
  query: string;
  resultsCount: number;
  filters?: {
    city?: string;
    category?: string;
    openNow?: boolean;
  };
}) {
  await trackInteraction({
    type: 'search',
    city: params.filters?.city,
    category: params.filters?.category,
    metadata: {
      query: params.query,
      results_count: params.resultsCount,
      filters: params.filters,
    },
  });
}

// Track filter change
export async function trackFilterChange(params: {
  filterType: 'city' | 'category' | 'openNow' | 'viewMode';
  value: string | boolean;
}) {
  await trackInteraction({
    type: 'filter',
    metadata: {
      filter_type: params.filterType,
      value: params.value,
    },
  });
}

// Track save/favorite
export async function trackSave(destinationSlug: string) {
  await trackInteraction({
    type: 'save',
    destinationSlug,
  });
}

// Track visit marking
export async function trackVisit(destinationSlug: string) {
  await trackInteraction({
    type: 'visit',
    destinationSlug,
  });
}

// Track scroll depth
export async function trackScrollDepth(params: {
  page: string;
  depthPercent: number;
}) {
  await trackInteraction({
    type: 'scroll',
    metadata: {
      page: params.page,
      depth_percent: params.depthPercent,
    },
  });
}

// Initialize session tracking
export async function initializeSession() {
  if (trackingDisabled()) return;
  const context = await getUserContext();

  // Create or update session record
  // Silently fail if table doesn't exist (optional feature)
  const { error } = await supabase
    .from('user_sessions')
    .upsert({
      session_id: context.sessionId,
      user_id: context.userId || null,
      started_at: new Date().toISOString(),
      device_type: context.deviceType,
      referrer: typeof window !== 'undefined' ? document.referrer : null,
    }, {
      onConflict: 'session_id',
      ignoreDuplicates: false,
    });

  // Silently fail if table doesn't exist (optional tracking feature)
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = relation does not exist, which is fine
    console.error('Error initializing session:', error);
  }
}

// End session tracking
export async function endSession() {
  if (trackingDisabled()) return;
  const sessionId = getSessionId();

  const { error } = await supabase
    .from('user_sessions')
    .update({
      ended_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);

  // Silently fail if table doesn't exist (optional tracking feature)
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = relation does not exist, which is fine
    console.error('Error ending session:', error);
  }
}
