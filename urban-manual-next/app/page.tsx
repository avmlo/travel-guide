'use client';

import { useEffect, useState, useMemo, useCallback } from "react";

// Force dynamic rendering to avoid SSR issues with theme context
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { DestinationCardEnhanced } from "@/components/DestinationCardEnhanced";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { CookieBanner } from "@/components/CookieBanner";
import { AdvancedSearchOverlay } from "@/components/AdvancedSearchOverlay";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const ITEMS_PER_PAGE = 40;
const CATEGORIES = [
  { id: "", label: "All", icon: "🌍" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "cafe", label: "Cafe", icon: "☕" },
  { id: "hotel", label: "Hotel", icon: "🏨" },
  { id: "bar", label: "Bar", icon: "🍸" },
  { id: "shop", label: "Shop", icon: "🛍️" },
  { id: "bakery", label: "Bakery", icon: "🥐" },
];

export default function Home() {
  const router = useRouter();

  // State
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showAllCities, setShowAllCities] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Debounced search for smooth UX
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load user's saved and visited places
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Load saved places
        const { data: savedData } = await supabase
          .from('saved_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);

        if (savedData) {
          setSavedPlaces(savedData.map(s => s.destination_slug));
        }

        // Load visited places
        const { data: visitedData } = await supabase
          .from('visited_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);

        if (visitedData) {
          setVisitedPlaces(visitedData.map(v => v.destination_slug));
        }
      }
    }

    loadUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load destinations with smooth initial load
  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) throw error;

        // Transform Supabase data to match Destination type
        const transformedData: Destination[] = (data || []).map(d => ({
          name: d.name,
          slug: d.slug,
          city: d.city,
          category: d.category,
          content: d.content || d.description || '',
          mainImage: d.image || '',
          michelinStars: d.michelin_stars || 0,
          crown: d.crown || false,
          brand: '',
          cardTags: '',
          lat: 0,
          long: 0,
          myRating: 0,
          reviewed: false,
          subline: '',
        }));

        setDestinations(transformedData);
      } catch (error) {
        console.error("Error loading destinations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  // Get sorted cities
  const cities = useMemo(() => {
    const citySet = new Set(destinations.map((d) => d.city).filter(Boolean));
    const cityArray = Array.from(citySet);

    // Sort cities by country priority, then alphabetically within country
    return cityArray.sort((a, b) => {
      const countryA = cityCountryMap[a] || 'Other';
      const countryB = cityCountryMap[b] || 'Other';

      const indexA = countryOrder.indexOf(countryA);
      const indexB = countryOrder.indexOf(countryB);

      // If same country, sort alphabetically
      if (countryA === countryB) {
        return a.localeCompare(b);
      }

      // Sort by country priority
      if (indexA === -1 && indexB === -1) return countryA.localeCompare(countryB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [destinations]);

  // Filter destinations with debounced search
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        debouncedSearchQuery === "" ||
        dest.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        dest.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        dest.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        dest.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesCity =
        !selectedCity || dest.city === selectedCity;

      const matchesCategory =
        !selectedCategory || dest.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [destinations, debouncedSearchQuery, selectedCity, selectedCategory]);

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = displayCount < filteredDestinations.length;

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE);
        setLoadingMore(false);
      }, 300); // Small delay for smooth UX
    }
  }, [hasMore, loadingMore]);

  // Infinite scroll sentinel ref
  const sentinelRef = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: loadingMore,
    threshold: 400,
  });

  // Reset display count when filters change (with smooth transition)
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [debouncedSearchQuery, selectedCity, selectedCategory]);

  const handleCardClick = (destination: Destination) => {
    // Navigate to destination detail page
    router.push(`/destination/${destination.slug}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    // Smooth transition effect
    setSelectedCategory(categoryId);
  };

  const displayedCities = showAllCities ? cities : cities.slice(0, 20);

  // Show skeleton on initial load
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-[1920px] mx-auto">
            {/* Search skeleton */}
            <div className="mb-8 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-full max-w-[500px] animate-shimmer" />

            {/* Category skeleton */}
            <div className="mb-8 flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-shimmer" />
              ))}
            </div>

            {/* Grid skeleton */}
            <SkeletonGrid count={12} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
      >
        Skip to main content
      </a>
      <Header />

      {/* Main Content */}
      <main id="main-content" className="px-6 md:px-10 py-12 dark:text-white" role="main">
        <div className="max-w-[1920px] mx-auto">
          {/* Search Bar with smooth focus */}
          <div className="mb-8 animate-fade-in">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative max-w-[500px] w-full text-left group"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-[#efefef] dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  Search {destinations.length} items...
                </span>
              </div>
            </button>
          </div>

          {/* Category Filter - App Store Style with smooth transitions */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedCategory === category.id
                      ? "bg-black dark:bg-white text-white dark:text-black scale-105 focus:ring-black dark:focus:ring-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-102 focus:ring-gray-400"
                  }`}
                  aria-pressed={selectedCategory === category.id}
                >
                  <span aria-hidden="true">{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City Filter with smooth transitions */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase">Places</h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <button
                onClick={() => setSelectedCity("")}
                className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 rounded ${
                  !selectedCity
                    ? "font-medium text-black dark:text-white scale-105"
                    : "font-medium text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-gray-300"
                }`}
                aria-pressed={!selectedCity}
              >
                All
              </button>
              {displayedCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                  className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 rounded ${
                    selectedCity === city
                      ? "font-medium text-black dark:text-white scale-105"
                      : "font-medium text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-gray-300"
                  }`}
                  aria-pressed={selectedCity === city}
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

          {/* Results Count with loading indicator */}
          <div className="mb-6 flex items-center gap-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
            </p>
            {debouncedSearchQuery !== searchQuery && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          {/* Destination Grid with staggered animation */}
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-xl text-gray-400 mb-6">
                No destinations found.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("");
                  setSelectedCategory("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                {displayedDestinations.map((destination, index) => (
                  <DestinationCardEnhanced
                    key={destination.slug}
                    destination={destination}
                    onClick={() => handleCardClick(destination)}
                    isSaved={savedPlaces.includes(destination.slug)}
                    isVisited={visitedPlaces.includes(destination.slug)}
                    animationDelay={Math.min(index * 30, 500)} // Stagger animation up to 500ms
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center mt-12 py-8">
                  {loadingMore && (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  )}
                </div>
              )}

              {/* End of results indicator */}
              {!hasMore && displayedDestinations.length > ITEMS_PER_PAGE && (
                <div className="text-center mt-12 py-8 text-gray-400 dark:text-gray-600 text-sm">
                  You've reached the end
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SimpleFooter />

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Search Overlay */}
      <AdvancedSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        destinations={destinations}
        onSelectDestination={(dest) => {
          router.push(`/destination/${dest.slug}`);
        }}
      />
    </div>
  );
}
