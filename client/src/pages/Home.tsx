import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
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
            <div className="flex items-center gap-6 bg-gray-100 px-6 py-2 rounded-full">
              <a href="#" className="text-sm font-medium hover:text-gray-600 transition-colors">Work</a>
              <a href="#" className="text-sm font-medium hover:text-gray-600 transition-colors">About</a>
              <a href="#" className="text-sm font-medium hover:text-gray-600 transition-colors">Contact</a>
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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-gray-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-10 border-gray-300">
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

              {(searchQuery || selectedCategory !== "all" || selectedCity) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedCity("");
                  }}
                  className="text-sm"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* City Filter */}
            <div>
              <div className="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Cities</div>
              <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`hover:underline transition-colors ${
                    !selectedCity ? "font-semibold underline" : "text-gray-600"
                  }`}
                >
                  All
                </button>
                {cities.slice(0, 50).map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                    className={`hover:underline transition-colors ${
                      selectedCity === city ? "font-semibold underline" : "text-gray-600"
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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

