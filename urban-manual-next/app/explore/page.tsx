'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Star, ChevronRight, Sparkles } from 'lucide-react';
import { DestinationDrawer } from '@/components/DestinationDrawer';

interface CategoryStats {
  category: string;
  count: number;
  destinations: Destination[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Dining: '🍽️',
  Hotels: '🏨',
  Culture: '🎭',
  Bars: '🍸',
  Cafes: '☕',
  Restaurants: '🍴',
  Bakeries: '🥐',
  Other: '✨',
};

const CATEGORY_COLORS: Record<string, string> = {
  Dining: 'from-orange-500 to-red-500',
  Hotels: 'from-blue-500 to-indigo-500',
  Culture: 'from-purple-500 to-pink-500',
  Bars: 'from-amber-500 to-yellow-500',
  Cafes: 'from-green-500 to-emerald-500',
  Restaurants: 'from-red-500 to-rose-500',
  Bakeries: 'from-yellow-500 to-orange-500',
  Other: 'from-gray-500 to-slate-500',
};

export default function ExplorePage() {
  const router = useRouter();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      const { data, error } = await supabase.from('destinations').select('*').order('category');

      if (error) throw error;

      const destinations = data as Destination[];
      const categoryMap = destinations.reduce((acc, dest) => {
        if (!acc[dest.category]) {
          acc[dest.category] = {
            category: dest.category,
            count: 0,
            destinations: [],
          };
        }
        acc[dest.category].count++;
        acc[dest.category].destinations.push(dest);
        return acc;
      }, {} as Record<string, CategoryStats>);

      const stats = Object.values(categoryMap).sort((a, b) => b.count - a.count);

      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const selectedCategoryData = selectedCategory
    ? categoryStats.find((c) => c.category === selectedCategory)
    : null;

  return (
    <div className="px-4 md:px-6 lg:px-10 py-8 dark:text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold">Explore</h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            {selectedCategory
              ? `Browsing ${selectedCategoryData?.count} ${selectedCategory.toLowerCase()}`
              : 'Discover destinations by category'}
          </p>
        </div>

        {/* Category Pills */}
        {!selectedCategory && (
          <div className="mb-8 flex gap-2 flex-wrap">
            {categoryStats.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="group px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[category] || '📍'}</span>
                  <span className="font-medium text-sm">{category}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back Button when category selected */}
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Back to all categories</span>
          </button>
        )}

        {/* Category Grid or Destinations */}
        {selectedCategory === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map(({ category, count, destinations }, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="group relative overflow-hidden rounded-2xl h-48 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationDuration: '500ms' }}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    CATEGORY_COLORS[category] || 'from-gray-400 to-gray-600'
                  } opacity-90 group-hover:opacity-100 transition-opacity`}
                />

                {/* Sample destination image if available */}
                {destinations[0]?.image && (
                  <img
                    src={destinations[0].image}
                    alt={category}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                  />
                )}

                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="text-3xl mb-2">{CATEGORY_ICONS[category] || '📍'}</div>
                    <h2 className="text-2xl font-bold mb-1">{category}</h2>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {count} {count === 1 ? 'destination' : 'destinations'}
                    </span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedCategoryData?.destinations.map((destination, index) => (
              <button
                key={destination.slug}
                onClick={() => {
                  setSelectedDestination(destination);
                  setIsDrawerOpen(true);
                }}
                className="group text-left animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 20}ms`, animationDuration: '400ms' }}
              >
                {/* Image Container with fixed aspect ratio */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <MapPin className="h-12 w-12 opacity-20" />
                    </div>
                  )}

                  {/* Crown Badge */}
                  {destination.crown && (
                    <div className="absolute top-2 left-2 text-xl">👑</div>
                  )}

                  {/* Michelin Stars */}
                  {destination.michelin_stars && destination.michelin_stars > 0 && (
                    <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg">
                      <span>⭐</span>
                      <span>{destination.michelin_stars}</span>
                    </div>
                  )}
                </div>

                {/* Info with consistent height */}
                <div className="space-y-1">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-black dark:text-white">
                    {destination.name}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {destination.city}
                    </p>
                  </div>
                </div>
              </button>
            ))}
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
    </div>
  );
}
