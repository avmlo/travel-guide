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
  const [selectedCity, setSelectedCity] = useState<string>("all");
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
        selectedCity === "all" || dest.city === selectedCity;

      const matchesCategory =
        selectedCategory === "all" || dest.category === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [destinations, searchQuery, selectedCity, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-border bg-background">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              THE TRAVEL GUIDE
            </h1>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase text-xs hidden md:inline-flex"
              >
                CATALOGUE
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase text-xs hidden md:inline-flex"
              >
                INFO
              </Button>
            </div>
          </div>

          {/* Search and Filters - Prominent */}
          <div className="grid md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder={`Search ${destinations.length} destinations...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 border-2 border-pink-400 focus:border-pink-500 focus:ring-pink-500 text-base"
              />
            </div>

            <div className="md:col-span-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 border-2">
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

            <div className="md:col-span-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12 border-2">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city.charAt(0).toUpperCase() + city.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== "all" || selectedCity !== "all") && (
            <div className="flex items-center gap-2 mt-3 text-sm">
              <span className="text-muted-foreground">Filters:</span>
              {searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-7 text-xs"
                >
                  "{searchQuery}" ×
                </Button>
              )}
              {selectedCategory !== "all" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="h-7 text-xs"
                >
                  {selectedCategory} ×
                </Button>
              )}
              {selectedCity !== "all" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCity("all")}
                  className="h-7 text-xs"
                >
                  {selectedCity} ×
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedCity("all");
                }}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Results */}
      <div className="container py-6">
        <div className="mb-4 text-sm text-muted-foreground font-medium">
          {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              No destinations found matching your search.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedCity("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

      {/* Footer */}
      <footer className="border-t bg-border bg-background mt-16">
        <div className="container py-6">
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <a href="#" className="hover:underline font-bold">ABOUT</a>
            <a href="#" className="hover:underline font-bold">CONTACT</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold">INSTAGRAM</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold">TWITTER</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}

