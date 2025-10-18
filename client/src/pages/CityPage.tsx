import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function CityPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const citySlug = params.city;
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
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
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
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
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* City Header */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-gray-600" />
            <h1 className="text-5xl font-bold">{cityName}</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""} to explore
          </p>
          
          {/* Weather Widget */}
          <WeatherWidget city={cityName} />
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="py-6 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
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
                    onClick={() =>
                      setSelectedCategory(cat === selectedCategory ? "all" : cat)
                    }
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
        </section>
      )}

      {/* Destinations Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                onClick={() => setLocation(`/destination/${destination.slug}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

