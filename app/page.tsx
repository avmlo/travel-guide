'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { Search, MapPin, Clock, Map, Grid3x3, SlidersHorizontal, X, Star } from 'lucide-react';
import { DestinationDrawer } from '@/components/DestinationDrawer';
import { CARD_WRAPPER, CARD_MEDIA, CARD_TITLE, CARD_META } from '@/components/CardStyles';
import { ChatGPTStyleAI } from '@/components/ChatGPTStyleAI';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
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
  const { user } = useAuth();
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
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (error) throw error;
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

  // AI-powered search using the new /api/search endpoint
  const performAISearch = async (query: string) => {
    setSearching(true);
    setSearchTier(null);

    try {
      const filters: any = {};
      if (selectedCity) filters.city = selectedCity;
      if (selectedCategory) filters.category = selectedCategory;
      if (openNowOnly) filters.openNow = true;

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          pageSize: 50,
          filters,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.results) {
        setFilteredDestinations(data.results);
        setSearchTier(data.searchTier);
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
        <div className="mb-6">
          <GreetingHero
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenFilters={() => setIsFiltersOpen(true)}
          />
        </div>
        {/* Old search and standalone filters removed (now inside GreetingHero) */}

        {/* Filters Drawer */}
        {isFiltersOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsFiltersOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-950 z-50 shadow-2xl overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">View</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewMode('grid');
                        trackFilterChange({ filterType: 'viewMode', value: 'grid' });
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'grid'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                      <span>Grid</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('map');
                        trackFilterChange({ filterType: 'viewMode', value: 'map' });
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'map'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Map className="h-4 w-4" />
                      <span>Map</span>
                    </button>
                  </div>
                </div>

                {/* Open Now Toggle */}
                <div className="mb-6">
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
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {/* All button */}
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          trackFilterChange({ filterType: 'category', value: 'all' });
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === ''
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span>🌍</span>
                        <span>All</span>
                      </button>

                      {/* Dynamic categories from database */}
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            trackFilterChange({ filterType: 'category', value: category });
                          }}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === category
                              ? "bg-black dark:bg-white text-white dark:text-black"
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

        {/* City Filter - Hidden during search */}
        {!searchTerm && (
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
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
          </p>
        </div>

        {/* Destination Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-6">
              No destinations found.
            </p>
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
        ) : viewMode === 'map' ? (
          <div className="h-[600px] rounded-2xl overflow-hidden">
            <MapView
              destinations={filteredDestinations}
              onMarkerClick={(dest) => {
                setSelectedDestination(dest);
                setIsDrawerOpen(true);
              }}
            />
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {capitalizeCity(destination.city)}
                    </p>
                    {destination.category && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-500 capitalize line-clamp-1">
                          {destination.category}
                        </p>
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
