'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { Search, MapPin } from 'lucide-react';
import { DestinationDrawer } from '@/components/DestinationDrawer';
import { ChatGPTStyleAI } from '@/components/ChatGPTStyleAI';
import { useAuth } from '@/contexts/AuthContext';

// Categories based on actual Supabase data
const CATEGORIES = [
  { id: "", label: "All", icon: "🌍" },
  { id: "Dining", label: "Dining", icon: "🍴" },
  { id: "Hotels", label: "Hotels", icon: "🏨" },
  { id: "Culture", label: "Culture", icon: "🎭" },
  { id: "Bars", label: "Bars", icon: "🍸" },
  { id: "Cafes", label: "Cafes", icon: "☕" },
  { id: "Restaurants", label: "Restaurants", icon: "🍽️" },
  { id: "Bakeries", label: "Bakeries", icon: "🥐" },
  { id: "Other", label: "Other", icon: "✨" },
];

function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Home() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [visitedSlugs, setVisitedSlugs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (user) {
      fetchVisitedPlaces();
    }
  }, [user]);

  useEffect(() => {
    filterDestinations();
  }, [searchTerm, selectedCity, selectedCategory, destinations, visitedSlugs]);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitedPlaces = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('visited_places')
        .select('destination_slug')
        .eq('user_id', user.id);

      if (error) throw error;

      const slugs = new Set(data?.map(v => v.destination_slug) || []);
      setVisitedSlugs(slugs);
    } catch (error) {
      console.error('Error fetching visited places:', error);
    }
  };

  // Pinterest-like recommendation algorithm
  const getRecommendationScore = (dest: Destination, index: number): number => {
    let score = 0;

    // Priority signals (like Pinterest's quality score)
    if (dest.michelin_stars) score += dest.michelin_stars * 100; // Michelin is top priority
    if (dest.crown) score += 50; // Crown badge = featured
    if (dest.image) score += 10; // Images get boost

    // Category diversity bonus (ensures mixed content like Pinterest)
    const categoryBonus = (index % 7) * 2; // Rotate through categories
    score += categoryBonus;

    // Random discovery factor (15% variance for serendipity)
    score += Math.random() * 15;

    return score;
  };

  const filterDestinations = () => {
    let filtered = destinations;

    if (selectedCity) {
      filtered = filtered.filter(d => d.city === selectedCity);
    }

    if (selectedCategory) {
      filtered = filtered.filter(d =>
        d.category && d.category.trim() === selectedCategory.trim()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.category && d.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.content && d.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Pinterest-style recommendation sorting
    // Only apply smart sorting when no search term (natural discovery)
    if (!searchTerm) {
      filtered = filtered
        .map((dest, index) => ({
          ...dest,
          _score: getRecommendationScore(dest, index)
        }))
        .sort((a, b) => b._score - a._score);
    }

    // 🎯 When user is signed in: separate visited & unvisited, move visited to bottom
    if (user && visitedSlugs.size > 0) {
      const unvisited = filtered.filter(d => !visitedSlugs.has(d.slug));
      const visited = filtered.filter(d => visitedSlugs.has(d.slug));
      filtered = [...unvisited, ...visited];
    }

    setFilteredDestinations(filtered);
  };

  const cities = Array.from(new Set(destinations.map(d => d.city))).sort();
  const displayedCities = showAllCities ? cities : cities.slice(0, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-6 lg:px-10 py-8 dark:text-white min-h-screen">
      <div className="max-w-[1920px] mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Discover
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Explore {destinations.length} curated destinations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search destinations...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </div>

        {/* Category Filter - Hidden during search */}
        {!searchTerm && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* City Filter - Hidden during search */}
        {!searchTerm && (
          <div className="mb-8">
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase">Places</h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <button
                onClick={() => setSelectedCity("")}
                className={`transition-all ${
                  !selectedCity
                    ? "font-medium text-black dark:text-white"
                    : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
                }`}
              >
                All
              </button>
              {displayedCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                  className={`transition-all ${
                    selectedCity === city
                      ? "font-medium text-black dark:text-white"
                      : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
                  }`}
                >
                  {capitalizeCity(city)}
                </button>
              ))}
              {cities.length > 20 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300 transition-colors"
                >
                  {showAllCities ? '- Show Less' : '+ Show More'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
          </p>
        </div>

        {/* Destination Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-6">
              No destinations found.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCity("");
                setSelectedCategory("");
              }}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-80 transition-opacity font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {filteredDestinations.map((destination, index) => {
              const isVisited = user && visitedSlugs.has(destination.slug);
              return (
              <button
                key={destination.slug}
                onClick={() => {
                  setSelectedDestination(destination);
                  setIsDrawerOpen(true);
                }}
                className={`group cursor-pointer text-left animate-in fade-in slide-in-from-bottom-4 ${isVisited ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${index * 10}ms`, animationDuration: '300ms' }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 hover-lift">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isVisited ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <MapPin className="h-12 w-12 opacity-20" />
                    </div>
                  )}

                  {/* Crown Badge */}
                  {destination.crown && (
                    <div className="absolute top-2 left-2 text-xl">
                      👑
                    </div>
                  )}

                  {/* Michelin Stars */}
                  {destination.michelin_stars && destination.michelin_stars > 0 && (
                    <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                      <img
                        src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                        alt="Michelin star"
                        className="h-3 w-3"
                      />
                      <span>{destination.michelin_stars}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-0.5">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-black dark:text-white">
                    {destination.name}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {capitalizeCity(destination.city)}
                    </p>
                    {destination.category && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-500 capitalize line-clamp-1">
                          {destination.category}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
            })}
          </div>
        )}
      </div>

      {/* Destination Drawer */}
      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setTimeout(() => setSelectedDestination(null), 300);
        }}
      />

      {/* AI Chat Assistant */}
      <ChatGPTStyleAI />
    </main>
  );
}
