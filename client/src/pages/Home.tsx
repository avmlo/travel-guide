import { useEffect, useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { CookieBanner } from "@/components/CookieBanner";
import { sanitizeSearchQuery, searchQuerySchema } from "@/lib/validation";

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(40);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load user's saved and visited places
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }
        
        setUser(session?.user || null);
        
        if (session?.user) {
          // Load saved places
          const { data: savedData, error: savedError } = await supabase
            .from('saved_places')
            .select('destination_slug')
            .eq('user_id', session.user.id);
          
          if (savedError) {
            console.error('Error loading saved places:', savedError);
          } else if (savedData) {
            setSavedPlaces(savedData.map(s => s.destination_slug));
          }

          // Load visited places
          const { data: visitedData, error: visitedError } = await supabase
            .from('visited_places')
            .select('destination_slug')
            .eq('user_id', session.user.id);
          
          if (visitedError) {
            console.error('Error loading visited places:', visitedError);
          } else if (visitedData) {
            setVisitedPlaces(visitedData.map(v => v.destination_slug));
          }
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
      }
    }

    loadUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSavedPlaces([]);
        setVisitedPlaces([]);
      } else {
        loadUserData();
      }
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
        
        if (error) {
          throw new Error(`Failed to load destinations: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('No destination data received');
        }
        
        // Transform Supabase data to match Destination type
        const transformedData: Destination[] = data.map(d => ({
          name: d.name || 'Unknown Destination',
          slug: d.slug || '',
          city: d.city || 'Unknown City',
          category: d.category || 'Other',
          content: d.content || d.description || '',
          mainImage: d.image || '',
          michelinStars: d.michelin_stars || 0,
          crown: d.crown || false,
          brand: '',
          cardTags: '',
          lat: d.lat || 0,
          long: d.long || 0,
          myRating: 0,
          reviewed: false,
          subline: '',
        }));
        
        setDestinations(transformedData);
      } catch (error) {
        console.error("Error loading destinations:", error);
        // Set empty array on error to prevent crashes
        setDestinations([]);
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

  const displayedDestinations = useMemo(() => 
    filteredDestinations.slice(0, displayCount), 
    [filteredDestinations, displayCount]
  );
  
  const hasMore = useMemo(() => 
    displayCount < filteredDestinations.length, 
    [displayCount, filteredDestinations.length]
  );

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery, selectedCity]);

  const handleCardClick = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedDestination(null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    try {
      const sanitized = sanitizeSearchQuery(value);
      setSearchQuery(sanitized);
      setSearchError(null);
    } catch (error) {
      setSearchError("Invalid search query");
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCity("");
    setSearchError(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => prev + 40);
  }, []);

  const handleCityFilter = useCallback((city: string) => {
    setSelectedCity(city === selectedCity ? "" : city);
  }, [selectedCity]);

  const handleShowAllCities = useCallback(() => {
    setShowAllCities(!showAllCities);
  }, [showAllCities]);

  const displayedCities = useMemo(() => 
    showAllCities ? cities : cities.slice(0, 20), 
    [cities, showAllCities]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Massive Header */}
      <header className="px-4 py-6 overflow-hidden border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <h1 className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight">
            The Urban Manual
          </h1>
          <button className="text-xs font-bold uppercase hover:opacity-60 transition-opacity px-4 py-2 border border-black">
            Sign In
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="px-4 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Info</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase">New York</span>
            <span className="text-xs font-bold">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-[500px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${destinations.length} items...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-[#efefef] border-none h-[42px] focus-visible:ring-2 focus-visible:ring-blue-500"
                maxLength={100}
              />
              {searchError && (
                <p className="text-red-500 text-xs mt-1">{searchError}</p>
              )}
            </div>
          </div>

          {/* City Filter */}
          <div className="mb-8">
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase">Places</h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <button
                onClick={() => setSelectedCity("")}
                className={`transition-colors ${
                  !selectedCity ? "font-medium text-black" : "font-medium text-black/30 hover:text-black/60"
                }`}
              >
                All
              </button>
              {displayedCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                  className={`transition-colors ${
                    selectedCity === city ? "font-medium text-black" : "font-medium text-black/30 hover:text-black/60"
                  }`}
                >
                  {city}
                </button>
              ))}
              {cities.length > 20 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="font-medium text-black/30 hover:text-black/60 transition-colors"
                >
                  {showAllCities ? '- Show Less' : '+ Show More'}
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {displayedDestinations.map((destination, index) => (
                  <DestinationCard
                    key={destination.slug}
                    destination={destination}
                    onClick={() => handleCardClick(destination)}
                    isSaved={savedPlaces.includes(destination.slug)}
                    isVisited={visitedPlaces.includes(destination.slug)}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={() => setDisplayCount(prev => prev + 40)}
                    size="lg"
                    variant="default"
                    className="px-12 py-6 bg-black text-white hover:bg-gray-800 text-sm font-medium"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="hover:underline">INSTAGRAM</a>
              <a href="#" className="hover:underline">TWITTER</a>
              <a href="#" className="hover:underline">SAVEE</a>
            </div>
            <div className="text-xs">
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Destination Drawer */}
      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedDestination(null);
          }}
          isSaved={savedPlaces.includes(selectedDestination.slug)}
          isVisited={visitedPlaces.includes(selectedDestination.slug)}
        />
      )}
    </div>
  );
}

