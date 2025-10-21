import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { MapPin } from "lucide-react";
import { WeatherWidget } from "@/components/WeatherWidget";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/AIAssistant";
import { supabase } from "@/lib/supabase";

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
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Transform Supabase data to match Destination type
        const transformedData: Destination[] = (data || []).map(d => ({
          name: d.name,
          slug: d.slug,
          city: d.city,
          category: d.category,
          content: d.content || d.description || '',
          mainImage: d.image || '',
          michelinStars: d.michelin_stars || 0,
          crown: d.crown || false,
          brand: '',
          cardTags: '',
          lat: 0,
          long: 0,
          myRating: 0,
          reviewed: false,
          subline: d.description || ''
        }));
        
        setDestinations(transformedData);
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
        <Navigation cities={cities} currentCity={citySlug} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{cityName}</h1>
          <p className="text-gray-600">No destinations found in this city.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <Navigation cities={cities} currentCity={citySlug} />

      {/* City Header */}
      <section className="py-8 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h1 className="text-4xl md:text-5xl font-bold">{cityName}</h1>
          </div>
          <p className="text-base text-gray-600 mb-4">
            {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""} to explore
          </p>
        </div>
      </section>

      {/* Weather Widget */}
      <section className="pb-4 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <WeatherWidget city={cityName} />
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2 text-gray-600 uppercase tracking-wide">
                  Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`pill-button px-4 py-2 rounded-full text-sm ${
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
                        className={`pill-button px-4 py-2 rounded-full text-sm ${
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
      <section className="pb-3 bg-[#f5f1e8]">
        <div className="container mx-auto px-4">
          <p className="text-sm text-gray-600">
            {displayedDestinations.length} destination{displayedDestinations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="pb-8 bg-[#f5f1e8]">
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
            <div className="flex justify-center mt-8">
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

      <AIAssistant destinations={destinations} />
      <Footer />
    </div>
  );
}

