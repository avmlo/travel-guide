'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { Search, MapPin, Clock, Map, Grid3x3, SlidersHorizontal, X, Star, Sparkles } from 'lucide-react';
import { DestinationDrawer } from '@/components/DestinationDrawer';
import { CARD_WRAPPER, CARD_MEDIA, CARD_TITLE, CARD_META } from '@/components/CardStyles';
import { ChatGPTStyleAI } from '@/components/ChatGPTStyleAI';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  initializeSession,
  trackPageView,
  trackDestinationClick,
  trackSearch,
  trackFilterChange,
  getSessionId,
} from '@/lib/tracking';
import GreetingHero from '@/components/GreetingHero';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

// Category icons mapping - comprehensive list
const CATEGORY_ICONS: Record<string, string> = {
  // Food & Dining
  'dining': '🍴',
  'restaurant': '🍽️',
  'restaurants': '🍽️',
  'food': '🍜',
  'cafe': '☕',
  'cafes': '☕',
  'coffee': '☕',
  'bakery': '🥐',
  'bakeries': '🥐',
  'dessert': '🍰',
  'desserts': '🍰',
  'patisserie': '🧁',
  'breakfast': '🥞',
  'brunch': '🥐',
  'lunch': '🍱',
  'dinner': '🍽️',
  'pizza': '🍕',
  'italian': '🍝',
  'french': '🥖',
  'asian': '🥢',
  'japanese': '🍜',
  'sushi': '🍣',
  'mexican': '🌮',
  'burger': '🍔',
  'burgers': '🍔',
  'seafood': '🦞',
  'steakhouse': '🥩',

  // Drinks & Nightlife
  'bar': '🍸',
  'bars': '🍸',
  'pub': '🍺',
  'pubs': '🍺',
  'cocktail': '🍹',
  'cocktails': '🍹',
  'wine': '🍷',
  'nightlife': '🌙',
  'club': '💃',
  'clubs': '💃',

  // Accommodation
  'hotel': '🏨',
  'hotels': '🏨',
  'accommodation': '🛏️',
  'hostel': '🏠',
  'lodging': '🏨',

  // Culture & Entertainment
  'culture': '🎭',
  'museum': '🏛️',
  'museums': '🏛️',
  'art': '🎨',
  'gallery': '🖼️',
  'galleries': '🖼️',
  'theater': '🎭',
  'theatre': '🎭',
  'cinema': '🎬',
  'music': '🎵',
  'concert': '🎤',

  // Shopping
  'shopping': '🛍️',
  'shop': '🛍️',
  'store': '🏪',
  'market': '🏪',
  'boutique': '👗',
  'retail': '🛍️',

  // Activities & Recreation
  'activity': '🎯',
  'activities': '🎯',
  'sport': '⚽',
  'sports': '⚽',
  'fitness': '💪',
  'gym': '🏋️',
  'park': '🌳',
  'parks': '🌳',
  'outdoor': '🏞️',
  'beach': '🏖️',
  'hiking': '🥾',

  // Services
  'spa': '💆',
  'wellness': '🧘',
  'salon': '💇',
  'beauty': '💄',

  // Other
  'other': '✨',
  'attraction': '🎡',
  'attractions': '🎡',
  'landmark': '🗿',
  'landmarks': '🗿',
};

function getCategoryIcon(category: string): string {
  const key = category.toLowerCase().trim();
  return CATEGORY_ICONS[key] || '📍';
}

function capitalizeCategory(category: string): string {
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Check if AI is enabled (client-side check via API)
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [visitedSlugs, setVisitedSlugs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTier, setSearchTier] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchIntent, setSearchIntent] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [displayedCount, setDisplayedCount] = useState(24); // Initial load: 24 items
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const LOAD_MORE_INCREMENT = 24;

  useEffect(() => {
    fetchDestinations();

    // Initialize session tracking
    initializeSession();

    // Track homepage view
    trackPageView({ pageType: 'home' });
  }, []);

  useEffect(() => {
    if (user) {
      fetchVisitedPlaces();
    }
  }, [user]);

  // Debounced AI search
  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      const timer = setTimeout(() => {
        performAISearch(searchTerm);
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    } else {
      filterDestinations();
    }
    // Reset displayed count when filters change
    setDisplayedCount(24);

    // Track search if there's a search term
    if (searchTerm.trim().length > 2) {
      setTimeout(() => {
        trackSearch({
          query: searchTerm,
          resultsCount: filteredDestinations.length,
          filters: {
            city: selectedCity || undefined,
            category: selectedCategory || undefined,
            openNow: openNowOnly || undefined,
          },
        });
      }, 600);
    }
  }, [searchTerm, selectedCity, selectedCategory, destinations, visitedSlugs, openNowOnly]);

  const fetchDestinations = async () => {
    try {
      // Select only essential columns to avoid issues with missing columns
      const { data, error } = await supabase
        .from('destinations')
        .select('slug, name, city, category, description, content, image, michelin_stars, crown')
        .order('name');

      if (error) {
        console.error('Error fetching destinations:', error);
        setDestinations([]);
        setCategories([]);
        setLoading(false);
        return;
      }

      setDestinations(data || []);

      // Extract unique categories from actual data
      const uniqueCategories = Array.from(
        new Set(
          (data || [])
            .map(d => d.category?.trim())
            .filter(Boolean)
        )
      ).sort();

      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setDestinations([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitedPlaces = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('visited_places')
        .select('destination_slug')
        .eq('user_id', user.id);

      if (error) throw error;

      const slugs = new Set(data?.map(v => v.destination_slug) || []);
      setVisitedSlugs(slugs);
    } catch (error) {
      console.error('Error fetching visited places:', error);
    }
  };

  // AI-powered search using the chat function with conversation context
  const [chatResponse, setChatResponse] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string, destinations?: Destination[]}>>([]);

  // Exact copy of getAIResponse from ChatGPTStyleAI
  const getAIResponse = async (query: string): Promise<{content: string; destinations?: Destination[]}> => {
    const lowerQuery = query.toLowerCase();

    // 🎯 PROACTIVE: Check for upcoming trips
    if (user && (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('help'))) {
      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(1);

      if (trips && trips.length > 0) {
        const trip = trips[0];
        const city = trip.destination || '';
        if (city) {
          const { data } = await supabase
            .from('destinations')
            .select('*')
            .ilike('city', `%${city}%`)
            .order('michelin_stars', { ascending: false })
            .limit(5);

          if (data && data.length > 0) {
            const list = data.map(d => {
              const stars = d.michelin_stars ? ' ' + '⭐'.repeat(d.michelin_stars) : '';
              return `• **${d.name}**${stars} - ${d.category}`;
            }).join('\n');
            return { content: `I see you're visiting **${city}** soon! 🎉 Here are 5 must-visit places:\n\n${list}\n\nWould you like me to create an itinerary?` };
          }
        }
      }
    }

    // 🎯 TIME-BASED MICRO ITINERARIES (like "I'm in Shibuya for 3 hours")
    const timeMatch = lowerQuery.match(/(\d+)\s*(hour|hr|hours|hrs|h)/i);
    const areaMatch = lowerQuery.match(/(?:in|at)\s+([a-z\s-]+?)(?:\s+for|\s*$)/i);

    if (timeMatch && areaMatch) {
      const hours = parseInt(timeMatch[1]);
      const area = areaMatch[1].trim().replace(/\s+/g, '-');

      const { data } = await supabase
        .from('destinations')
        .select('*')
        .or(`city.ilike.%${area}%,name.ilike.%${area}%`)
        .limit(15);

      if (data && data.length > 0) {
        const cafes = data.filter(d => d.category?.toLowerCase().includes('cafe'));
        const restaurants = data.filter(d => d.category?.toLowerCase().includes('restaurant') || d.category?.toLowerCase().includes('dining'));
        const culture = data.filter(d => d.category?.toLowerCase().includes('culture'));
        const bars = data.filter(d => d.category?.toLowerCase().includes('bar'));

        let route = `Perfect! Here's a ${hours}-hour route for **${area}**:\n\n`;
        let timeUsed = 0;
        let step = 1;

        if (hours >= 1 && cafes.length > 0) {
          route += `${step}. **${cafes[0].name}** (15 min) ☕\n`;
          timeUsed += 0.25;
          step++;
        }

        if (hours >= 1.5 && culture.length > 0) {
          route += `${step}. Walk to **${culture[0].name}** (10 min)\n`;
          timeUsed += 0.17;
          step++;
        }

        if (hours >= 2 && restaurants.length > 0) {
          route += `${step}. Lunch at **${restaurants[0].name}** (45 min) 🍜\n`;
          timeUsed += 0.75;
          step++;
        }

        if (hours >= 2.5 && data.length > 3) {
          route += `${step}. Browse at **${data[3].name}** (30 min) 📚\n`;
          timeUsed += 0.5;
          step++;
        }

        if (hours >= 3 && restaurants.length > 1) {
          route += `${step}. Dessert or drink at **${restaurants[1].name || bars[0]?.name}** (20 min) 🍰\n`;
          timeUsed += 0.33;
          step++;
        }

        const timeLeft = hours - timeUsed;
        if (timeLeft > 0.5) {
          route += `\n💡 You'll have about ${Math.round(timeLeft * 60)} minutes of buffer time for photos and exploring!`;
        }

        return { content: route };
      }
    }

    // 🎯 ITINERARY GENERATION (full day/multi-day)
    if (lowerQuery.includes('itinerary') || lowerQuery.includes('plan') || lowerQuery.includes('schedule')) {
      const cityMatch = lowerQuery.match(/(?:for|in|to)\s+([a-z\s-]+)/i);
      const city = cityMatch ? cityMatch[1].trim().replace(/\s+/g, '-') : null;

      if (city) {
        const { data } = await supabase
          .from('destinations')
          .select('*')
          .ilike('city', `%${city}%`)
          .limit(10);

        if (data && data.length > 0) {
          // Group by category for balanced itinerary
          const restaurants = data.filter(d => d.category?.toLowerCase().includes('restaurant') || d.category?.toLowerCase().includes('dining'));
          const cafes = data.filter(d => d.category?.toLowerCase().includes('cafe'));
          const culture = data.filter(d => d.category?.toLowerCase().includes('culture'));

          let itinerary = `Here's a suggested itinerary for **${city}**:\n\n`;
          itinerary += `**Morning:**\n• Start with breakfast at **${cafes[0]?.name || restaurants[0]?.name}**\n\n`;
          itinerary += `**Afternoon:**\n• Explore **${culture[0]?.name || data[0]?.name}**\n• Lunch at **${restaurants[0]?.name}**\n\n`;
          itinerary += `**Evening:**\n• Dinner at **${restaurants[1]?.name || restaurants[0]?.name}**${restaurants[1]?.michelin_stars ? ' ⭐'.repeat(restaurants[1].michelin_stars) : ''}\n\n`;
          itinerary += `Would you like me to save this to your trips?`;

          return { content: itinerary };
        }
      }
      return { content: `I can create a custom itinerary! Try:\n• "I'm in Shibuya for 3 hours"\n• "Plan a day in Paris"\n• "Create an itinerary for Tokyo"` };
    }

    // 🎯 CONTEXTUAL: Based on saved places
    if (user && (lowerQuery.includes('like') || lowerQuery.includes('similar') || lowerQuery.includes('more'))) {
      const { data: savedPlaces } = await supabase
        .from('saved_places')
        .select('destination_slug')
        .eq('user_id', user.id)
        .limit(1);

      if (savedPlaces && savedPlaces.length > 0) {
        const { data: savedDest } = await supabase
          .from('destinations')
          .select('*')
          .eq('slug', savedPlaces[0].destination_slug)
          .single();

        if (savedDest) {
          // Find similar destinations (same category or city)
          const { data: similar } = await supabase
            .from('destinations')
            .select('*')
            .or(`category.eq.${savedDest.category},city.eq.${savedDest.city}`)
            .neq('slug', savedDest.slug)
            .limit(5);

          if (similar && similar.length > 0) {
            const list = similar.map(d => `• **${d.name}** - ${d.city.replace(/-/g, ' ')}`).join('\n');
            return { content: `Based on your interest in **${savedDest.name}**, you might like:\n\n${list}` };
          }
        }
      }
    }

    // Check for city queries
    const cityMatch = lowerQuery.match(/(?:in|at|near)\s+([a-z\s-]+)/i);
    if (cityMatch) {
      const city = cityMatch[1].trim().replace(/\s+/g, '-');
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .ilike('city', `%${city}%`)
        .limit(6);

      if (data && data.length > 0) {
        return {
          content: `I found these places in ${city}:`,
          destinations: data
        };
      }
    }

    // Check for category queries (cozy cafe, etc.)
    const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
    const foundCategory = categories.find(cat => lowerQuery.includes(cat));
    if (foundCategory) {
      // Check for city in query too
      const cityInQuery = lowerQuery.match(/(?:in|at)\s+([a-z\s-]+)/i);
      let query = supabase
        .from('destinations')
        .select('*')
        .ilike('category', `%${foundCategory}%`);

      if (cityInQuery) {
        const city = cityInQuery[1].trim().replace(/\s+/g, '-');
        query = query.ilike('city', `%${city}%`);
      }

      const { data } = await query.limit(6);

      if (data && data.length > 0) {
        const location = cityInQuery ? ` in ${cityInQuery[1]}` : '';
        return {
          content: `Here are some great ${foundCategory}s${location}:`,
          destinations: data
        };
      }
    }

    // Check for Michelin queries
    if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .gt('michelin_stars', 0)
        .order('michelin_stars', { ascending: false })
        .limit(6);

      if (data && data.length > 0) {
        return {
          content: `Here are our top Michelin-starred restaurants:`,
          destinations: data
        };
      }
    }

    // Default greeting with personalization
    const greetings = ['hi', 'hello', 'hey'];
    if (greetings.some(g => lowerQuery.includes(g))) {
      const userName = user ? 'there' : 'there';
      return { content: `Hello ${userName}! 👋 I can help you:\n\n• Find places in specific cities\n• Discover restaurants, cafes, or hotels\n• Create custom itineraries\n• Get personalized recommendations\n\nWhat would you like to explore?` };
    }

    // Fallback
    return { content: `I can help you:\n\n• Find destinations in any city\n• Search by type (restaurant, cafe, hotel)\n• Create custom itineraries\n• Get recommendations based on your preferences\n\nTry asking: "Find me a cozy cafe in Paris" or "Plan an itinerary for Tokyo"` };
  };

  const performAISearch = async (query: string) => {
    setSearching(true);
    setSearchTier(null);
    setSearchIntent(null);
    setSearchSuggestions([]);

    try {
      const response = await getAIResponse(query);

      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: query },
        { role: 'assistant' as const, content: response.content || '', destinations: response.destinations }
      ];
      setConversationHistory(newHistory.slice(-10)); // Keep last 10 messages

      if (response.destinations && response.destinations.length > 0) {
        setFilteredDestinations(response.destinations);
        setChatResponse(response.content || '');
        setSearchTier('ai-enhanced');
      } else if (response.content) {
        // No destinations but has a response
        setFilteredDestinations([]);
        setChatResponse(response.content);
        setSearchTier('ai-enhanced');
      } else {
        // Fallback to basic search
        filterDestinations();
      }
    } catch (error) {
      console.error('AI search error, falling back to basic:', error);
      filterDestinations();
    } finally {
      setSearching(false);
    }
  };

  // Pinterest-like recommendation algorithm
  const getRecommendationScore = (dest: Destination, index: number): number => {
    let score = 0;

    // Priority signals (like Pinterest's quality score)
    if (dest.crown) score += 20; // Crown badge = featured (reduced from 50)
    if (dest.image) score += 10; // Images get boost
    // Michelin stars are displayed but don't affect ranking

    // Category diversity bonus (ensures mixed content like Pinterest)
    const categoryBonus = (index % 7) * 5; // Rotate through categories (increased from 2)
    score += categoryBonus;

    // Random discovery factor (increased for more serendipity)
    score += Math.random() * 30;

    return score;
  };

  const filterDestinations = () => {
    let filtered = destinations;

    if (selectedCity) {
      filtered = filtered.filter(d => d.city === selectedCity);
    }

    if (selectedCategory) {
      filtered = filtered.filter(d =>
        d.category && d.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.category && d.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.content && d.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Pinterest-style recommendation sorting
    // Only apply smart sorting when no search term (natural discovery)
    if (!searchTerm) {
      filtered = filtered
        .map((dest, index) => ({
          ...dest,
          _score: getRecommendationScore(dest, index)
        }))
        .sort((a, b) => b._score - a._score);
    }

    // 🎯 When user is signed in: separate visited & unvisited, move visited to bottom
    if (user && visitedSlugs.size > 0) {
      const unvisited = filtered.filter(d => !visitedSlugs.has(d.slug));
      const visited = filtered.filter(d => visitedSlugs.has(d.slug));
      filtered = [...unvisited, ...visited];
    }

    setFilteredDestinations(filtered);
  };

  const cities = Array.from(new Set(destinations.map(d => d.city))).sort();
  const displayedCities = showAllCities ? cities : cities.slice(0, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-6 lg:px-10 py-8 dark:text-white min-h-screen">
      <div className="max-w-[1920px] mx-auto">
        {/* Greeting Hero above the search bar */}
        <div className="mb-6 relative" id="greeting-hero-container">
          <GreetingHero
            searchQuery={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              // Clear conversation history only if search is cleared
              if (!value.trim()) {
                setConversationHistory([]);
                setSearchSuggestions([]);
                setSearchIntent(null);
                setSearchTier(null);
                setChatResponse('');
              }
            }}
            onOpenFilters={() => setIsFiltersOpen(true)}
            userName={(function () {
              const raw = ((user?.user_metadata as any)?.name || (user?.email ? user.email.split('@')[0] : undefined)) as string | undefined;
              if (!raw) return undefined;
              return raw
                .split(/[\s._-]+/)
                .filter(Boolean)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            })()}
            isAIEnabled={isAIEnabled}
          />
        </div>
        {/* Old search and standalone filters removed (now inside GreetingHero) */}

        {/* Filters Popup - positioned 10px below filter button */}
        {isFiltersOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsFiltersOpen(false)} />
            <div className="fixed right-4 top-[180px] z-50 w-80 sm:w-96 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase">Filters</h2>
                  <button onClick={() => setIsFiltersOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Open Now Toggle */}
                <div className="mb-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-semibold">Open Now</span>
                    </div>
                    <button
                      onClick={() => {
                        const newValue = !openNowOnly;
                        setOpenNowOnly(newValue);
                        trackFilterChange({ filterType: 'openNow', value: newValue });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        openNowOnly ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                          openNowOnly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          trackFilterChange({ filterType: 'category', value: 'all' });
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                          selectedCategory === ''
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span>🌍</span>
                        <span>All</span>
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            trackFilterChange({ filterType: 'category', value: category });
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                            selectedCategory === category
                              ? "bg-black dark:bg.white text-white dark:text-black"
                              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>{getCategoryIcon(category)}</span>
                          <span>{capitalizeCategory(category)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* City Filter - Hidden during search, replaced by search results summary */}
        {!searchTerm ? (
          <div className="mb-8 text-center">
            <div className="max-w-[680px] mx-auto px-[24px]">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
              <button
                onClick={() => {
                  setSelectedCity("");
                  trackFilterChange({ filterType: 'city', value: 'all' });
                }}
                  className={`transition-all ${
                  !selectedCity
                    ? "font-medium text-black dark:text-white"
                    : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
                  }`}
              >
                All
              </button>
              {displayedCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    const newCity = city === selectedCity ? "" : city;
                    setSelectedCity(newCity);
                    trackFilterChange({ filterType: 'city', value: newCity || 'all' });
                  }}
                    className={`transition-all ${
                      selectedCity === city
                        ? "font-medium text-black dark:text-white"
                        : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
                    }`}
                >
                  {capitalizeCity(city)}
                </button>
              ))}
              {cities.length > 20 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                    className="font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300 transition-colors"
            >
                  {showAllCities ? '- Show Less' : '+ Show More'}
                </button>
              )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* AI Chat Response - replaces city filter when searching */}
            <div className="mb-8">
              <div className="max-w-[680px] mx-auto px-[24px]">
                {searching ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <span className="animate-pulse">✨</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Searching...</span>
                  </div>
                ) : chatResponse ? (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Sparkles className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          AI Assistant
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {chatResponse}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : filteredDestinations.length > 0 ? (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ✨ Found <strong className="text-black dark:text-white">{filteredDestinations.length}</strong> {filteredDestinations.length === 1 ? 'place' : 'places'}
                    </span>
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      No results found for "<strong className="text-black dark:text-white">{searchTerm}</strong>"
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
          </span>
        </div>

        {/* Destination Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-xl text-gray-400 mb-6">
              No destinations found.
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCity("");
                setSelectedCategory("");
              }}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-80 transition-opacity font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 items-start">
            {filteredDestinations.slice(0, displayedCount).map((destination, index) => {
              const isVisited = user && visitedSlugs.has(destination.slug);
              return (
              <button
                key={destination.slug}
                onClick={() => {
                  setSelectedDestination(destination);
                  setIsDrawerOpen(true);

                  // Track destination click
                  trackDestinationClick({
                    destinationSlug: destination.slug,
                    position: index,
                    source: 'grid',
                  });
                }}
                className={`${CARD_WRAPPER} cursor-pointer text-left ${isVisited ? 'opacity-60' : ''}`}
              >
                {/* Image Container */}
                <div className={`${CARD_MEDIA} mb-2`}>
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isVisited ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <MapPin className="h-12 w-12 opacity-20" />
                    </div>
                  )}

                  {/* Crown Badge */}
                  {/* Feature badge hidden for now */}

                  {/* Michelin Stars */}
                  {destination.michelin_stars && destination.michelin_stars > 0 && (
                    <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                      <img
                        src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                        alt="Michelin star"
                        className="h-3 w-3"
                      />
                      <span>{destination.michelin_stars}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-0.5">
                  <h3 className={`${CARD_TITLE}`}>
                    {destination.name}
                  </h3>

                  <div className={`${CARD_META}`}>
                    <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {capitalizeCity(destination.city)}
                    </span>
                    {destination.category && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 capitalize line-clamp-1">
                          {destination.category}
                        </span>
                      </>
                    )}
                    </div>
                </div>
              </button>
            );
            })}
          </div>

          {/* Load More Button */}
          {displayedCount < filteredDestinations.length && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setDisplayedCount(prev => prev + LOAD_MORE_INCREMENT)}
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-80 transition-opacity font-medium"
              >
                Load More ({filteredDestinations.length - displayedCount} remaining)
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {/* Destination Drawer */}
      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setTimeout(() => setSelectedDestination(null), 300);
        }}
      />

      {/* AI Chat Assistant */}
      <ChatGPTStyleAI />
    </main>
  );
}
