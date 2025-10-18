import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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
        <div className="max-w-[980px] mx-auto px-6">
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
              <button className="hover:text-gray-600 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-4">
            Discover the world.
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Curated destinations from around the globe. {destinations.length} places to explore.
          </p>
          
          {/* Search */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base rounded-full border-gray-300 focus:border-blue-500 focus-visible:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] h-10 rounded-full border-gray-300">
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
          </div>

          {/* City Filter - Urban Manual Style */}
          <div className="max-w-4xl mx-auto">
            <div className="text-sm font-semibold mb-4 text-gray-600 uppercase tracking-wide">Places</div>
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
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex items-center justify-between">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.slug}
                  destination={destination}
                  colorIndex={index}
                  onClick={() => setLocation(`/destination/${destination.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-[980px] mx-auto px-6 py-8">
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

