import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, Map as MapIcon } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { MapView } from "@/components/MapView";
import { Destination } from "@/types/destination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(40);
  const [showMap, setShowMap] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/destinations.json");
        const data: Destination[] = await response.json();
        setDestinations(data);
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

  const categories = useMemo(() => {
    const cats = new Set(destinations.map((d) => d.category).filter(Boolean));
    return Array.from(cats).sort();
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

      const matchesCategory =
        selectedCategory === "all" || dest.category === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [destinations, searchQuery, selectedCity, selectedCategory]);

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = displayCount < filteredDestinations.length;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery, selectedCity, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold">Travel Guide</h1>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <a href="#" className="hover:text-gray-600 transition-colors">Destinations</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Collections</a>
                <a href="#" className="hover:text-gray-600 transition-colors">About</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => searchInputRef.current?.focus()}
                className="hover:text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-3">
              Discover the world.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Curated destinations from around the globe. {destinations.length} places to explore.
            </p>
          </div>
          
          {/* Search */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-full border-gray-300 focus:border-blue-500 focus-visible:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-9 rounded-full border-gray-300">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{showMap ? "Hide Map" : "Show Map"}</span>
                <span className="sm:hidden">{showMap ? "Hide" : "Map"}</span>
              </button>
            </div>

            {/* City Filter */}
            <div className="text-center">
              <div className="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Places</div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-sm">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`hover:underline transition-colors ${
                    !selectedCity ? "font-semibold underline text-gray-900" : "text-gray-600"
                  }`}
                >
                  All
                </button>
                {cities.slice(0, 50).map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                    className={`hover:underline transition-colors ${
                      selectedCity === city ? "font-semibold underline text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Split Layout */}
      <section className="pb-12">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
            </p>
            
            {(searchQuery || selectedCategory !== "all" || selectedCity) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedCity("");
                }}
                className="rounded-full text-sm"
              >
                Clear all filters
              </Button>
            )}
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
                className="rounded-full px-6"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="flex gap-6 relative">
              {/* Cards Column */}
              <div className={`flex-1 ${showMap ? 'lg:w-2/3' : 'w-full'}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedDestinations.map((destination, index) => (
                    <DestinationCard
                      key={destination.slug}
                      destination={destination}
                      colorIndex={index}
                      onClick={() => setLocation(`/destination/${destination.slug}`)}
                    />
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={() => setDisplayCount(prev => prev + 40)}
                      size="lg"
                      variant="outline"
                      className="rounded-full px-8 border-gray-300 hover:bg-gray-50"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>

              {/* Map Column - Fixed on Desktop, Full Screen on Mobile */}
              {showMap && (
                <>
                  {/* Mobile Map - Full Screen Overlay */}
                  <div className="lg:hidden fixed inset-0 z-40 bg-white">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold">Map View</h3>
                        <button
                          onClick={() => setShowMap(false)}
                          className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-sm"
                        >
                          Close
                        </button>
                      </div>
                      <div className="flex-1">
                        <MapView
                          destinations={filteredDestinations}
                          onDestinationClick={(slug) => {
                            setShowMap(false);
                            setLocation(`/destination/${slug}`);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Map - Side Panel */}
                  <div className="hidden lg:block lg:w-1/3">
                    <div className="sticky top-20">
                      <MapView
                        destinations={filteredDestinations}
                        onDestinationClick={(slug) => setLocation(`/destination/${slug}`)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Twitter</a>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Travel Guide. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

