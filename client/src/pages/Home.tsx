import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { AIAssistant } from "@/components/AIAssistant";
import { SmartSearch } from "@/components/SmartSearch";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { SEO } from "@/components/SEO";


export default function Home() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(40);
  const [aiSearchResults, setAiSearchResults] = useState<string[]>([]);
  const [isAISearch, setIsAISearch] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [hideVisited, setHideVisited] = useState(false);
  const [showFavoritesFirst, setShowFavoritesFirst] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

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
          subline: d.description || ''
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
    const cityArray = Array.from(citySet);
    
    // Sort cities by number of destinations (descending)
    return cityArray.sort((a, b) => {
      const countA = destinations.filter(d => d.city === a).length;
      const countB = destinations.filter(d => d.city === b).length;
      return countB - countA; // Descending order
    });
  }, [destinations]);

  const categories = useMemo(() => {
    const cats = new Set(destinations.map((d) => d.category).filter(Boolean));
    const sorted = Array.from(cats).sort();
    // Move "Other" to the end
    const otherIndex = sorted.indexOf("Other");
    if (otherIndex > -1) {
      sorted.splice(otherIndex, 1);
      sorted.push("Other");
    }
    return sorted;
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    let filtered = destinations;

    if (isAISearch && aiSearchResults.length > 0) {
      filtered = destinations.filter((dest) => aiSearchResults.includes(dest.slug));
    } else {
      filtered = destinations.filter((dest) => {
        const matchesSearch =
          searchQuery === "" ||
          dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCity =
          !selectedCity || dest.city === selectedCity;

        const matchesCategory =
          selectedCategory === "all" || dest.category === selectedCategory;

        return matchesSearch && matchesCity && matchesCategory;
      });
    }

    // Apply hide visited filter
    if (hideVisited && visitedPlaces.length > 0) {
      filtered = filtered.filter((dest) => !visitedPlaces.includes(dest.slug));
    }

    // Apply favorites first sorting
    if (showFavoritesFirst && savedPlaces.length > 0) {
      const favorites = filtered.filter((dest) => savedPlaces.includes(dest.slug));
      const others = filtered.filter((dest) => !savedPlaces.includes(dest.slug));
      filtered = [...favorites, ...others];
    }

    return filtered;
  }, [destinations, searchQuery, selectedCity, selectedCategory, isAISearch, aiSearchResults, hideVisited, visitedPlaces, showFavoritesFirst, savedPlaces]);

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = displayCount < filteredDestinations.length;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery, selectedCity, selectedCategory, isAISearch]);

  const handleAISearchResults = (slugs: string[], explanation: string) => {
    setAiSearchResults(slugs);
    setIsAISearch(true);
    setDisplayCount(40);
  };

  const handleClearAISearch = () => {
    setAiSearchResults([]);
    setIsAISearch(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO destination={selectedDestination} />
      <Navigation cities={cities} />

      {/* Hero Section */}
      <section className="py-4 sm:py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search 897 items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 border-none rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Places</h1>





            {/* City Filter - Pill Style with Counts */}
            <div>
              <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${!showAllCities ? 'max-h-[72px] overflow-hidden' : ''}`}>
                <button
                  onClick={() => setSelectedCity("")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
                    !selectedCity 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {cities.map((city) => {
                  const count = destinations.filter(d => d.city === city).length;
                  return (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all capitalize inline-flex items-center gap-1 sm:gap-1.5 ${
                        selectedCity === city 
                          ? "bg-black text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="truncate max-w-[80px] sm:max-w-none">{city}</span>
                      <span className={`text-[10px] px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ${
                        selectedCity === city
                          ? "bg-white/20"
                          : "bg-gray-200"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {cities.length > 10 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="mt-3 text-xs font-medium text-gray-600 hover:text-black transition-colors"
                >  
                  {showAllCities ? '− Show Less' : '+ Show More'}
                </button>
              )}
            </div>

            {/* User Filters - Only show if logged in */}
            {user && (savedPlaces.length > 0 || visitedPlaces.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {savedPlaces.length > 0 && (
                  <button
                    onClick={() => setShowFavoritesFirst(!showFavoritesFirst)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                      showFavoritesFirst
                        ? "bg-pink-100 text-pink-700 border border-pink-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>❤️</span>
                    <span>{showFavoritesFirst ? 'Favorites First' : 'Show Favorites First'}</span>
                  </button>
                )}
                {visitedPlaces.length > 0 && (
                  <button
                    onClick={() => setHideVisited(!hideVisited)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                      hideVisited
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>✓</span>
                    <span>{hideVisited ? 'Visited Hidden' : 'Hide Visited'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-8 sm:pb-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
            </p>
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400 mb-6">
                No destinations found.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedCity("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                {displayedDestinations.map((destination, index) => (
                  <DestinationCard
                    key={destination.slug}
                    destination={destination}
                    colorIndex={index}
                    onClick={() => {
                      setSelectedDestination(destination);
                      setIsDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-8 sm:mt-12">
                  <Button
                    onClick={() => setDisplayCount(prev => prev + 40)}
                    size="lg"
                    variant="outline"
                    className="px-8 border-gray-300 hover:bg-gray-50"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AIAssistant destinations={destinations} />
      <DestinationDrawer 
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <Footer />
    </div>
  );
}

