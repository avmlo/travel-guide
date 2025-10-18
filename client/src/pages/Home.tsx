import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { AIAssistant } from "@/components/AIAssistant";
import { SmartSearch } from "@/components/SmartSearch";
import { ItineraryGenerator } from "@/components/ItineraryGenerator";
import { UserMenu } from "@/components/UserMenu";


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
    if (isAISearch && aiSearchResults.length > 0) {
      return destinations.filter((dest) => aiSearchResults.includes(dest.slug));
    }

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
  }, [destinations, searchQuery, selectedCity, selectedCategory, isAISearch, aiSearchResults]);

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
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4L22.5 12.5L28 8L25 16L34 16L26 20L34 24L25 24L28 32L22.5 27.5L20 36L17.5 27.5L12 32L15 24L6 24L14 20L6 16L15 16L12 8L17.5 12.5L20 4Z" fill="black"/>
              </svg>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 bg-gray-100 px-6 py-2 rounded-full">
                <a href="#" className="text-sm font-medium hover:text-gray-600 transition-colors">Work</a>
                <a href="#" className="text-sm font-medium hover:text-gray-600 transition-colors">About</a>
                <a href="#" className="text-sm font-medium hover:text-gray-600 transition-colors">Contact</a>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Travel Guide
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Curated destinations from around the globe. {destinations.length} places to explore.
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="max-w-4xl space-y-6">
            <SmartSearch
              destinations={destinations}
              onSearchResults={handleAISearchResults}
              onClear={handleClearAISearch}
            />

            <div className="flex gap-3">
              <ItineraryGenerator destinations={destinations} cities={cities} />
            </div>

            {(searchQuery || selectedCategory !== "all" || selectedCity || isAISearch) && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedCity("");
                    handleClearAISearch();
                  }}
                  className="text-sm"
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <div className="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Categories</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === "all" 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? "all" : cat)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === cat 
                        ? "bg-black text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cities</div>
                <select
                  onChange={(e) => e.target.value && setLocation(`/city/${e.target.value}`)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50"
                  value=""
                >
                  <option value="">View City Page →</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    !selectedCity 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {cities.slice(0, 50).map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                    className={`px-4 py-2 rounded-full text-sm transition-all capitalize ${
                      selectedCity === city 
                        ? "bg-black text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="mb-8">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
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

      {/* AI Assistant */}
      <AIAssistant destinations={destinations} />

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Travel Guide</h3>
              <p className="text-sm text-gray-600">
                Discover curated destinations from around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Features</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Destinations</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Search</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Filters</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Learn more</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">About</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Blog</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Stories</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Contact</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Help</a>
                <a href="#" className="block text-sm text-gray-600 hover:text-gray-900">Legal</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Travel Guide. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

