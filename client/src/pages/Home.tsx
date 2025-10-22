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
import { Breadcrumbs, getHomeBreadcrumbs, getDestinationBreadcrumbs } from "@/components/Breadcrumbs";


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
          
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={selectedDestination ? getDestinationBreadcrumbs(selectedDestination) : getHomeBreadcrumbs()}
            destination={selectedDestination}
          />
          
          {/* Search Bar - Square Design */}
          <div className="mb-8 sm:mb-12">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 bg-white border-2 border-black rounded-none text-base font-medium focus:border-black focus:ring-0 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 sm:mb-12 uppercase tracking-tight">PLACES</h1>





            {/* City Filter - Clean Typography */}
            <div>
              <div className={`flex flex-wrap gap-6 sm:gap-8 ${!showAllCities ? 'max-h-[48px] overflow-hidden' : ''}`}>
                <button
                  onClick={() => setSelectedCity("")}
                  className={`text-sm font-medium transition-all uppercase tracking-wide ${
                    !selectedCity 
                      ? "text-black font-bold" 
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  all
                </button>
                {cities.map((city) => {
                  const count = destinations.filter(d => d.city === city).length;
                  return (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                      className={`text-sm font-medium transition-all uppercase tracking-wide ${
                        selectedCity === city 
                          ? "text-black font-bold" 
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
              {cities.length > 10 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="mt-6 text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
                >  
                  {showAllCities ? '− Show Less' : '+ Show More'}
                </button>
              )}
            </div>

            {/* User Filters - Only show if logged in */}
            {user && (savedPlaces.length > 0 || visitedPlaces.length > 0) && (
              <div className="mt-8 flex flex-wrap gap-4">
                {savedPlaces.length > 0 && (
                  <button
                    onClick={() => setShowFavoritesFirst(!showFavoritesFirst)}
                    className={`px-4 py-2 border-2 border-black text-sm font-medium transition-all inline-flex items-center gap-2 uppercase tracking-wide ${
                      showFavoritesFirst
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    <span>❤️</span>
                    <span>{showFavoritesFirst ? 'Favorites First' : 'Show Favorites First'}</span>
                  </button>
                )}
                {visitedPlaces.length > 0 && (
                  <button
                    onClick={() => setHideVisited(!hideVisited)}
                    className={`px-4 py-2 border-2 border-black text-sm font-medium transition-all inline-flex items-center gap-2 uppercase tracking-wide ${
                      hideVisited
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-black hover:text-white"
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
      <section className="pb-12 sm:pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
              {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
            </p>
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-8 font-medium">
                No destinations found.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedCity("");
                }}
                className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-none border-2 border-black font-medium uppercase tracking-wide"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6">
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
                <div className="flex justify-center mt-12 sm:mt-16">
                  <Button
                    onClick={() => setDisplayCount(prev => prev + 40)}
                    size="lg"
                    variant="outline"
                    className="px-8 py-3 border-2 border-black hover:bg-black hover:text-white rounded-none font-medium uppercase tracking-wide"
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

