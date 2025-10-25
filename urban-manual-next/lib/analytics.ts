import { getSupabaseClient } from './supabase';

// Check if user has consented to analytics
export function hasAnalyticsConsent(): boolean {
  const consent = localStorage.getItem('cookieConsent');
  return consent === 'accepted';
}

// Generate anonymous session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analyticsSessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analyticsSessionId', sessionId);
  }
  return sessionId;
}

// Get user ID if logged in, otherwise use session ID
async function getUserIdentifier(): Promise<{ userId: string | null; sessionId: string }> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    userId: session?.user?.id || null,
    sessionId: getSessionId()
  };
}

// Track page view
export async function trackPageView(page: string, title?: string) {
  if (!hasAnalyticsConsent()) return;

  try {
    const supabase = getSupabaseClient();
    const { userId, sessionId } = await getUserIdentifier();

    await supabase.from('analytics_page_views').insert({
      user_id: userId,
      session_id: sessionId,
      page,
      title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Track search query
export async function trackSearch(query: string, resultsCount: number, filters?: any) {
  if (!hasAnalyticsConsent()) return;

  try {
    const supabase = getSupabaseClient();
    const { userId, sessionId } = await getUserIdentifier();

    await supabase.from('analytics_searches').insert({
      user_id: userId,
      session_id: sessionId,
      query: query.trim(),
      results_count: resultsCount,
      filters: filters || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Track destination view
export async function trackDestinationView(destinationSlug: string, destinationName: string, source?: string) {
  if (!hasAnalyticsConsent()) return;

  try {
    const supabase = getSupabaseClient();
    const { userId, sessionId } = await getUserIdentifier();

    await supabase.from('analytics_destination_views').insert({
      user_id: userId,
      session_id: sessionId,
      destination_slug: destinationSlug,
      destination_name: destinationName,
      source: source || 'direct',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Track user action (save, visit, share, etc.)
export async function trackAction(
  action: 'save' | 'unsave' | 'visit' | 'unvisit' | 'share' | 'click' | 'filter' | 'sort',
  target: string,
  metadata?: any
) {
  if (!hasAnalyticsConsent()) return;

  try {
    const supabase = getSupabaseClient();
    const { userId, sessionId } = await getUserIdentifier();

    await supabase.from('analytics_actions').insert({
      user_id: userId,
      session_id: sessionId,
      action,
      target,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Track scroll depth
let maxScrollDepth = 0;
let scrollTrackingTimeout: NodeJS.Timeout;

export function initScrollTracking(page: string) {
  if (!hasAnalyticsConsent()) return;

  const trackScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = Math.round((scrollTop + windowHeight) / documentHeight * 100);

    if (scrollPercentage > maxScrollDepth) {
      maxScrollDepth = scrollPercentage;
    }

    // Debounce tracking
    clearTimeout(scrollTrackingTimeout);
    scrollTrackingTimeout = setTimeout(async () => {
      try {
        const supabase = getSupabaseClient();
        const { userId, sessionId } = await getUserIdentifier();

        await supabase.from('analytics_scroll_depth').upsert({
          user_id: userId,
          session_id: sessionId,
          page,
          max_depth: maxScrollDepth,
          timestamp: new Date().toISOString()
        }, {
          onConflict: 'session_id,page'
        });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    }, 1000);
  };

  window.addEventListener('scroll', trackScroll);
  
  // Cleanup
  return () => {
    window.removeEventListener('scroll', trackScroll);
    clearTimeout(scrollTrackingTimeout);
  };
}

// Track time on page
let pageStartTime = Date.now();

export function initTimeTracking(page: string) {
  if (!hasAnalyticsConsent()) return;

  pageStartTime = Date.now();

  const trackTime = async () => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000); // seconds

    try {
      const supabase = getSupabaseClient();
      const { userId, sessionId } = await getUserIdentifier();

      await supabase.from('analytics_time_on_page').insert({
        user_id: userId,
        session_id: sessionId,
        page,
        time_spent: timeSpent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  // Track on page unload
  window.addEventListener('beforeunload', trackTime);
  
  // Also track every 30 seconds for long sessions
  const interval = setInterval(trackTime, 30000);

  // Cleanup
  return () => {
    window.removeEventListener('beforeunload', trackTime);
    clearInterval(interval);
  };
}

// Track click events
export async function trackClick(element: string, text?: string, destination?: string) {
  if (!hasAnalyticsConsent()) return;

  try {
    const supabase = getSupabaseClient();
    const { userId, sessionId } = await getUserIdentifier();

    await supabase.from('analytics_clicks').insert({
      user_id: userId,
      session_id: sessionId,
      element,
      text,
      destination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Get popular searches (for admin dashboard)
export async function getPopularSearches(limit = 10, days = 7) {
  const supabase = getSupabaseClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('analytics_searches')
    .select('query')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (error || !data) return [];

  // Count occurrences
  const queryCounts: Record<string, number> = {};
  data.forEach(item => {
    const query = item.query.toLowerCase();
    queryCounts[query] = (queryCounts[query] || 0) + 1;
  });

  // Sort by count and return top results
  return Object.entries(queryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

// Get zero-result searches (for content improvement)
export async function getZeroResultSearches(limit = 20, days = 7) {
  const supabase = getSupabaseClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('analytics_searches')
    .select('query, timestamp')
    .eq('results_count', 0)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false })
    .limit(limit);

  return data || [];
}

// Get most viewed destinations
export async function getMostViewedDestinations(limit = 10, days = 7) {
  const supabase = getSupabaseClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('analytics_destination_views')
    .select('destination_slug, destination_name')
    .gte('timestamp', startDate.toISOString());

  if (error || !data) return [];

  // Count occurrences
  const destinationCounts: Record<string, { name: string; count: number }> = {};
  data.forEach(item => {
    if (!destinationCounts[item.destination_slug]) {
      destinationCounts[item.destination_slug] = {
        name: item.destination_name,
        count: 0
      };
    }
    destinationCounts[item.destination_slug].count++;
  });

  // Sort by count and return top results
  return Object.entries(destinationCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([slug, data]) => ({ slug, name: data.name, views: data.count }));
}

// Get analytics summary
export async function getAnalyticsSummary(days = 7) {
  const supabase = getSupabaseClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  const [pageViews, searches, destinationViews, actions] = await Promise.all([
    supabase.from('analytics_page_views').select('*', { count: 'exact', head: true }).gte('timestamp', startDateStr),
    supabase.from('analytics_searches').select('*', { count: 'exact', head: true }).gte('timestamp', startDateStr),
    supabase.from('analytics_destination_views').select('*', { count: 'exact', head: true }).gte('timestamp', startDateStr),
    supabase.from('analytics_actions').select('*', { count: 'exact', head: true }).gte('timestamp', startDateStr)
  ]);

  return {
    pageViews: pageViews.count || 0,
    searches: searches.count || 0,
    destinationViews: destinationViews.count || 0,
    actions: actions.count || 0
  };
}

