import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { MapPin } from "lucide-react";
import { WeatherWidget } from "@/components/WeatherWidget";
import { UserMenu } from "@/components/UserMenu";
import { AIAssistant } from "@/components/AIAssistant";

export default function CityPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const citySlug = params.city;
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayedCount, setDisplayedCount] = useState(40);

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

  const cityDestinations = useMemo(() => {
    return destinations.filter(
      (d) => d.city.toLowerCase() === citySlug?.toLowerCase()
    );
  }, [destinations, citySlug]);

  const categories = useMemo(() => {
    const cats = new Set(cityDestinations.map((d) => d.category).filter(Boolean));
    const sorted = Array.from(cats).sort();
    const otherIndex = sorted.indexOf("Other");
    if (otherIndex > -1) {
      sorted.splice(otherIndex, 1);
      sorted.push("Other");
    }
    return sorted;
  }, [cityDestinations]);

  const filteredDestinations = useMemo(() => {
    if (selectedCategory === "all") return cityDestinations;
    return cityDestinations.filter((d) => d.category === selectedCategory);
  }, [cityDestinations, selectedCategory]);

  const displayedDestinations = filteredDestinations.slice(0, displayedCount);
  const hasMore = displayedCount < filteredDestinations.length;

  const cityName = citySlug
    ? citySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (cityDestinations.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f1e8]">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
              className="text-4xl font-bold hover:opacity-70 transition-opacity"
            >
              ✱
            </button>
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{cityName}</h1>
          <p className="text-gray-600">No destinations found in this city.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
              className="text-4xl font-bold hover:opacity-70 transition-opacity"
            >
              ✱
            </button>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <button onClick={() => setLocation("/")} className="hover:opacity-70">
                Work
              </button>
              <button className="hover:opacity-70">About</button>
              <button className="hover:opacity-70">Contact</button>
            </nav>
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* City Header */}
      <section className="py-16 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-6 w-6 text-gray-600" />
            <h1 className="text-6xl md:text-7xl font-bold">{cityName}</h1>
          </div>
          <p className="text-lg text-gray-600 mb-8">
            {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""} to explore
          </p>
        </div>
      </section>

      {/* Weather Widget */}
      <section className="pb-8 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <WeatherWidget city={cityName} />
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">
                  Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === "all"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All ({cityDestinations.length})
                  </button>
                  {categories.map((cat) => {
                    const count = cityDestinations.filter((d) => d.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat === selectedCategory ? "all" : cat);
                          setDisplayedCount(40);
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          selectedCategory === cat
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Destinations Count */}
      <section className="pb-6 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            {displayedDestinations.length} destination{displayedDestinations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="pb-12 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {displayedDestinations.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                onClick={() => setLocation(`/destination/${destination.slug}`)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setDisplayedCount((prev) => prev + 40)}
                className="px-8 py-3 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Travel Guide</h3>
              <p className="text-sm text-gray-600">
                Discover curated destinations from around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="border-l-2 border-blue-500 pl-3">Destinations</li>
                <li className="border-l-2 border-green-500 pl-3">Search</li>
                <li className="border-l-2 border-purple-500 pl-3">Filters</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Learn more</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="border-l-2 border-orange-500 pl-3">About</li>
                <li className="border-l-2 border-red-500 pl-3">Blog</li>
                <li className="border-l-2 border-teal-500 pl-3">Stories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="border-l-2 border-pink-500 pl-3">Contact</li>
                <li className="border-l-2 border-yellow-500 pl-3">Help</li>
                <li className="border-l-2 border-indigo-500 pl-3">Legal</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
            © 2025 Travel Guide. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AI Assistant */}
      <AIAssistant destinations={destinations} />
    </div>
  );
}

