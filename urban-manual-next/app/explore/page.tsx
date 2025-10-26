'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Star } from 'lucide-react';

interface CategoryStats {
  category: string;
  count: number;
  destinations: Destination[];
}

export default function ExplorePage() {
  const router = useRouter();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('category');

      if (error) throw error;

      const destinations = data as Destination[];
      const categoryMap = destinations.reduce((acc, dest) => {
        if (!acc[dest.category]) {
          acc[dest.category] = {
            category: dest.category,
            count: 0,
            destinations: []
          };
        }
        acc[dest.category].count++;
        acc[dest.category].destinations.push(dest);
        return acc;
      }, {} as Record<string, CategoryStats>);

      const stats = Object.values(categoryMap).sort((a, b) =>
        a.category.localeCompare(b.category)
      );

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
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const selectedCategoryData = selectedCategory
    ? categoryStats.find(c => c.category === selectedCategory)
    : null;

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Explore
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse destinations by category
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Categories
        </button>
        {categoryStats.map(({ category, count }) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category} ({count})
          </button>
        ))}
      </div>

      {/* Category Overview or Selected Category */}
      {selectedCategory === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryStats.map(({ category, count, destinations }) => (
            <div
              key={category}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-2">{category}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {count} destination{count !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setSelectedCategory(category)}
                className="text-sm font-medium hover:opacity-60 transition-opacity"
              >
                View all →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Selected Category Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedCategory}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategoryData?.count} destination{selectedCategoryData?.count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCategoryData?.destinations.map(destination => (
              <button
                key={destination.slug}
                onClick={() => router.push(`/destination/${destination.slug}`)}
                className="group text-left border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-900 dark:hover:border-gray-100 transition-colors"
              >
                {destination.image && (
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg group-hover:opacity-60 transition-opacity">
                      {destination.name}
                    </h3>
                    {destination.crown && (
                      <span className="text-yellow-500 text-xl flex-shrink-0">👑</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{destination.city}</span>
                  </div>

                  {destination.michelin_stars && destination.michelin_stars > 0 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: destination.michelin_stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-red-500 text-red-500" />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
