import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Filter } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

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

  const categories = useMemo(() => {
    const cats = new Set(destinations.map((d) => d.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [destinations]);

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
        dest.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || dest.category === selectedCategory;

      const matchesCity =
        selectedCity === "all" || dest.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [destinations, searchQuery, selectedCategory, selectedCity]);

  const featuredDestinations = useMemo(() => {
    return destinations
      .filter((d) => d.crown || d.michelinStars > 0)
      .slice(0, 6);
  }, [destinations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading destinations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-b">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Amazing Destinations
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore curated travel destinations from around the world, featuring top-rated restaurants, 
              cafés, hotels, and unique experiences.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{cities.length} Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{categories.length} Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{destinations.length} Destinations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      {featuredDestinations.length > 0 && (
        <div className="container py-12">
          <h2 className="text-3xl font-bold mb-6">Featured Destinations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                onClick={() => setLocation(`/destination/${destination.slug}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="container py-8">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
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

          {(searchQuery || selectedCategory !== "all" || selectedCity !== "all") && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-2 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCity !== "all" && (
                <Badge variant="secondary">
                  {selectedCity}
                  <button
                    onClick={() => setSelectedCity("all")}
                    className="ml-2 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedCity("all");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {filteredDestinations.length} Destination{filteredDestinations.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No destinations found matching your criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4"
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                onClick={() => setLocation(`/destination/${destination.slug}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8">
          <p className="text-center text-sm text-muted-foreground">
            Travel Guide • {destinations.length} destinations across {cities.length} cities
          </p>
        </div>
      </footer>
    </div>
  );
}

