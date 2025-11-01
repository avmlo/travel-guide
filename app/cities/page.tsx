'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Search, X } from 'lucide-react';
import { CARD_WRAPPER, CARD_MEDIA, CARD_TITLE, CARD_META } from '@/components/CardStyles';
import { cityCountryMap } from '@/data/cityCountryMap';

interface CityStats {
  city: string;
  country: string;
  count: number;
  featuredImage?: string;
}

function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CitiesPage() {
  const router = useRouter();
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityStats();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cityStats.filter(
        (city) =>
          city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cityStats);
    }
  }, [searchTerm, cityStats]);

  const fetchCityStats = async () => {
    try {
      // Fetch all destinations with images
      const { data, error } = await supabase
        .from('destinations')
        .select('city, image');

      if (error) throw error;

      const destinations = data as Destination[];
      
      // Count cities and get featured image (first destination with image)
      const cityData = destinations.reduce((acc, dest) => {
        if (!acc[dest.city]) {
          acc[dest.city] = {
            count: 0,
            featuredImage: dest.image || undefined,
          };
        }
        acc[dest.city].count += 1;
        // Update featured image if current one doesn't have image but this one does
        if (!acc[dest.city].featuredImage && dest.image) {
          acc[dest.city].featuredImage = dest.image;
        }
        return acc;
      }, {} as Record<string, { count: number; featuredImage?: string }>);

      const stats = Object.entries(cityData)
        .map(([city, data]) => ({
          city,
          country: cityCountryMap[city] || 'Unknown',
          count: data.count,
          featuredImage: data.featuredImage,
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      setCityStats(stats);
      setFilteredCities(stats);
    } catch (error) {
      console.error('Error fetching city stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500">Loading cities...</div>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-6 lg:px-10 py-8 dark:text-white min-h-screen">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Cities</h1>
          <span className="text-base text-gray-600 dark:text-gray-400">
            Discover {cityStats.length} cities around the world
          </span>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-[680px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-base border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filteredCities.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-gray-500">No cities found</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 items-start">
            {filteredCities.map(({ city, country, count, featuredImage }) => (
              <button
                key={city}
                onClick={() => router.push(`/city/${encodeURIComponent(city)}`)}
                className={`${CARD_WRAPPER} cursor-pointer text-left`}
              >
                {/* Image Container */}
                <div className={`${CARD_MEDIA} mb-2`}>
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt={capitalizeCity(city)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <MapPin className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                  
                  {/* City count badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 dark:bg-white/70 backdrop-blur-sm text-white dark:text-black px-2 py-1 rounded text-xs font-medium">
                    {count}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-0.5">
                  <h3 className={`${CARD_TITLE}`}>
                    {capitalizeCity(city)}
                  </h3>

                  <div className={`${CARD_META}`}>
                    <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {country}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
