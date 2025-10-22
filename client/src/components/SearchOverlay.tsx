import { useState, useEffect } from "react";
import { X, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Destination } from "@/types/destination";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
}

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function SearchOverlay({ isOpen, onClose, destinations, onSelectDestination }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<Destination[]>([]);
  const [introText, setIntroText] = useState("");

  useEffect(() => {
    if (query.trim()) {
      // Filter destinations based on query
      const results = destinations.filter(dest =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.city.toLowerCase().includes(query.toLowerCase()) ||
        dest.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit to 10 results

      setFilteredResults(results);

      // Generate intro text based on query
      if (results.length > 0) {
        const cities = Array.from(new Set(results.map(r => capitalizeCity(r.city))));
        const categories = Array.from(new Set(results.map(r => r.category)));
        
        let intro = `Here are some great ${categories[0]?.toLowerCase() || 'places'}`;
        if (cities.length === 1) {
          intro += ` in ${cities[0]}`;
        } else if (cities.length > 1) {
          intro += ` across ${cities.slice(0, 2).join(' and ')}`;
        }
        intro += ` that match your search. Each offers a unique experience worth exploring!`;
        
        setIntroText(intro);
      } else {
        setIntroText(`No results found for "${query}". Try searching for a city, restaurant, hotel, or attraction.`);
      }
    } else {
      setFilteredResults([]);
      setIntroText("");
    }
  }, [query, destinations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search destinations, cities, or categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base border-gray-200 focus:border-black"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {query.trim() && (
          <>
            {/* Query Title */}
            <h2 className="text-xl font-normal mb-6">
              {query}
            </h2>

            {/* Intro Text */}
            {introText && (
              <p className="text-base text-gray-600 leading-relaxed mb-8">
                {introText}
              </p>
            )}

            {/* Results List */}
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((destination) => (
                  <button
                    key={destination.slug}
                    onClick={() => {
                      onSelectDestination(destination);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {destination.mainImage ? (
                        <img
                          src={destination.mainImage}
                          alt={destination.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium mb-1 truncate">
                        {destination.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {destination.content?.slice(0, 100) || destination.subline?.slice(0, 100) || `${destination.category} in ${capitalizeCity(destination.city)}`}
                      </p>
                    </div>

                    {/* Location & Arrow */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {capitalizeCity(destination.city)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() && (
              <div className="text-center py-12">
                <p className="text-gray-400">No results found</p>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!query.trim() && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">Start typing to search destinations</p>
          </div>
        )}
      </div>
    </div>
  );
}

