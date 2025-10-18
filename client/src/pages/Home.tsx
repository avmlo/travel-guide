import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";

export default function Home() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(48);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white">
        <div className="container py-6">
          {/* Logo */}
          <h1 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-none mb-4">
            THE TRAVEL GUIDE
          </h1>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs px-4 h-8 rounded-sm"
            >
              CATALOGUE
            </Button>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase text-xs px-4 h-8 rounded-sm"
            >
              INFO
            </Button>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase text-xs px-4 h-8 rounded-sm"
            >
              ARCHIVE
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs px-4 h-8 rounded-sm"
            >
              EDITORIAL
            </Button>
            <div className="ml-auto text-sm font-medium text-gray-600 hidden md:block">
              NEW YORK 3:03:34 PM
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${destinations.length} items...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-pink-400 focus:border-pink-500 focus-visible:ring-pink-500 rounded-sm h-10"
            />
          </div>

          {/* City Filter Tags */}
          <div className="mb-4">
            <div className="text-sm font-bold mb-3 uppercase">PLACES</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCity("")}
                className={`text-sm px-0 py-0 hover:underline ${
                  !selectedCity ? "font-bold underline" : ""
                }`}
              >
                All
              </button>
              {cities.slice(0, 40).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                  className={`text-sm px-0 py-0 hover:underline ${
                    selectedCity === city ? "font-bold underline" : ""
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Results Grid */}
      <div className="container pb-12">
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 mb-4">
              No destinations found matching your search.
            </p>
            <Button
              variant="outline"
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setDisplayCount(prev => prev + 48)}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold uppercase px-8"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container py-6">
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <a href="#" className="hover:underline font-bold uppercase">AVMLO LLC</a>
            <a href="#" className="hover:underline font-bold uppercase">TAPI GUIDE PROJECT</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold uppercase">INSTAGRAM</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold uppercase">TWITTER</a>
            <a href="#" className="hover:underline font-bold uppercase">SAVEE</a>
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}

