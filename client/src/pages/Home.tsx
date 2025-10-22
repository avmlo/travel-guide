import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { CookieBanner } from "@/components/CookieBanner";
import { SearchOverlay } from "@/components/SearchOverlay";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { ModernAIChat } from "@/components/ModernAIChat";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";
import { ChevronDown, ChevronRight } from "lucide-react";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(40);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['Taiwan']));
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  useEffect(() => {
    async function loadDestinations() {
      try {
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

  const cities = useMemo(() => {
    const citySet = new Set(destinations.map((d) => d.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [destinations]);

  const citiesByCountry = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    
    cities.forEach(city => {
      const country = cityCountryMap[city] || 'Other';
      if (!grouped[country]) {
        grouped[country] = [];
      }
      grouped[country].push(city);
    });
    
    // Sort cities within each country
    Object.keys(grouped).forEach(country => {
      grouped[country].sort();
    });
    
    // Sort countries by priority order
    const sortedCountries = Object.keys(grouped).sort((a, b) => {
      const indexA = countryOrder.indexOf(a);
      const indexB = countryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    
    const result: Record<string, string[]> = {};
    sortedCountries.forEach(country => {
      result[country] = grouped[country];
    });
    
    return result;
  }, [cities]);

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        searchQuery === "" ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity =
        !selectedCity || dest.city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [destinations, searchQuery, selectedCity]);

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = displayCount < filteredDestinations.length;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery, selectedCity]);

  const handleCardClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDrawerOpen(true);
  };

  const displayedCities = showAllCities ? cities : cities.slice(0, 20);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative max-w-[500px] w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-[#efefef] dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Search {destinations.length} items...</span>
              </div>
            </button>
          </div>

          {/* City Filter by Country */}
          <div className="mb-8">
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase">Places</h2>
            </div>
            <div className="space-y-3">
              {/* All button */}
              <button
                onClick={() => setSelectedCity("")}
                className={`text-xs transition-colors ${
                  !selectedCity ? "font-medium text-black dark:text-white" : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
                }`}
              >
                All
              </button>
              
              {/* Countries */}
              {Object.entries(citiesByCountry).map(([country, countryCities]) => (
                <div key={country} className="space-y-1">
                  <button
                    onClick={() => toggleCountry(country)}
                    className="flex items-center gap-2 text-xs font-bold uppercase text-black dark:text-white hover:opacity-60 transition-opacity"
                  >
                    {expandedCountries.has(country) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    {country}
                  </button>
                  
                  {expandedCountries.has(country) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs pl-5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {countryCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                          className={`transition-colors ${
                            selectedCity === city ? "font-medium text-black dark:text-white" : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
                          }`}
                        >
                          {capitalizeCity(city)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 animate-in fade-in duration-500">
                {displayedDestinations.map((destination, index) => (
                  <DestinationCard
                    key={destination.slug}
                    destination={destination}
                    colorIndex={index}
                    onClick={() => handleCardClick(destination)}
                    isSaved={savedPlaces.includes(destination.slug)}
                    isVisited={visitedPlaces.includes(destination.slug)}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 40)}
                    className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                  >
                    Load More
                  </button>
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
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        destinations={destinations}
        onSelectDestination={(dest) => {
          setSelectedDestination(dest);
          setIsDrawerOpen(true);
        }}
      />

      {/* Destination Drawer */}
      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedDestination(null);
          }}
        />
      )}

      {/* AI Assistant */}
      <ModernAIChat />
    </div>
  );
}

