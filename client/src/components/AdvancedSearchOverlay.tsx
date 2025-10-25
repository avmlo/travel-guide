import { useState, useEffect } from "react";
import { X, Search, ChevronRight, Clock, TrendingUp, SlidersHorizontal, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Destination } from "@/types/destination";

interface AdvancedSearchOverlayProps {
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

export function AdvancedSearchOverlay({ isOpen, onClose, destinations, onSelectDestination }: AdvancedSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<Destination[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'popular' | 'newest'>('relevance');

  // Get unique categories and cities
  const categories = Array.from(new Set(destinations.map(d => d.category))).sort();
  const cities = Array.from(new Set(destinations.map(d => d.city))).sort();

  // Popular searches (mock data - in production, track actual searches)
  const popularSearches = ["Michelin restaurants", "Tokyo cafes", "Paris hotels", "New York bars"];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Filter and sort results
  useEffect(() => {
    let results = destinations;

    // Text search
    if (query.trim()) {
      results = results.filter(dest =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.city.toLowerCase().includes(query.toLowerCase()) ||
        dest.category.toLowerCase().includes(query.toLowerCase()) ||
        dest.content?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter(dest => selectedCategories.includes(dest.category));
    }

    // City filter
    if (selectedCities.length > 0) {
      results = results.filter(dest => selectedCities.includes(dest.city));
    }

    // Michelin stars filter
    if (selectedStars.length > 0) {
      results = results.filter(dest => selectedStars.includes(dest.michelinStars || 0));
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        results = results.sort((a, b) => (b.michelinStars || 0) - (a.michelinStars || 0));
        break;
      case 'popular':
        // Mock popularity - in production, use actual metrics
        results = results.sort(() => Math.random() - 0.5);
        break;
      case 'newest':
        results = results.reverse();
        break;
      default:
        // relevance - keep as is
        break;
    }

    setFilteredResults(results.slice(0, 20));
  }, [query, destinations, selectedCategories, selectedCities, selectedStars, sortBy]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCities([]);
    setSelectedStars([]);
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedCities.length > 0 || selectedStars.length > 0 || sortBy !== 'relevance';

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleStars = (stars: number) => {
    setSelectedStars(prev =>
      prev.includes(stars) ? prev.filter(s => s !== stars) : [...prev, stars]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 bg-white dark:bg-gray-950 z-40 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search destinations, cities, or categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  saveSearch(query);
                }
              }}
              className="pl-10 h-12 text-sm border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white dark:bg-gray-900 dark:text-white rounded-lg"
              autoFocus
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 h-12 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white dark:bg-black text-black dark:text-white">
                {(selectedCategories.length + selectedCities.length + selectedStars.length + (sortBy !== 'relevance' ? 1 : 0))}
              </span>
            )}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 dark:text-white" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
            {/* Sort By */}
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Sort By</div>
              <div className="flex flex-wrap gap-2">
                {(['relevance', 'rating', 'popular', 'newest'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      sortBy === sort
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Categories</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Michelin Stars */}
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Michelin Stars</div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => toggleStars(stars)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedStars.includes(stars)
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <Star className="h-3 w-3 fill-current" />
                    <span>{stars}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cities */}
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Cities</div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {cities.slice(0, 20).map((city) => (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedCities.includes(city)
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    {capitalizeCity(city)}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {!query.trim() && filteredResults.length === 0 ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors text-left"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-base text-black dark:text-white">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <TrendingUp className="h-4 w-4" />
                <span>Popular Searches</span>
              </div>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors text-left"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-base text-black dark:text-white">{search}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-gray-500">Start typing to search destinations</p>
            </div>
          </>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
              {query.trim() && ` for "${query}"`}
            </div>

            {/* Results List/Grid */}
            {filteredResults.length > 0 ? (
              <div className="md:hidden space-y-4">
                {filteredResults.map((destination) => (
                  <button
                    key={destination.slug}
                    onClick={() => {
                      onSelectDestination(destination);
                      saveSearch(query);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium truncate text-black dark:text-white">
                          {destination.name}
                        </h3>
                        {destination.michelinStars > 0 && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(destination.michelinStars)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{destination.category}</span>
                        <span>•</span>
                        <span>{capitalizeCity(destination.city)}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Desktop Grid */}
            {filteredResults.length > 0 ? (
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((destination) => (
                  <button
                    key={destination.slug}
                    onClick={() => {
                      onSelectDestination(destination);
                      saveSearch(query);
                      onClose();
                    }}
                    className="group text-left"
                  >
                    {/* Image */}
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                      {destination.mainImage ? (
                        <img
                          src={destination.mainImage}
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search className="h-12 w-12" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium truncate text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                          {destination.name}
                        </h3>
                        {destination.michelinStars > 0 && (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {[...Array(destination.michelinStars)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{destination.category}</span>
                        <span>•</span>
                        <span>{capitalizeCity(destination.city)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 dark:text-gray-500">No results found</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-sm text-black dark:text-white hover:underline"
                >
                  Clear filters and try again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

