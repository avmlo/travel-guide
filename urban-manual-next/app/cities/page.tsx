'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Search, ChevronRight } from 'lucide-react';
import { cityCountryMap } from '@/data/cityCountryMap';

interface CityStats {
  city: string;
  country: string;
  count: number;
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
      const { data, error } = await supabase.from('destinations').select('city');

      if (error) throw error;

      const destinations = data as Destination[];
      const cityCounts = destinations.reduce((acc, dest) => {
        acc[dest.city] = (acc[dest.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stats = Object.entries(cityCounts)
        .map(([city, count]) => ({
          city,
          country: cityCountryMap[city] || 'Unknown',
          count,
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
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Cities
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Discover {cityStats.length} cities around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </div>

        {/* Cities List - App-like cards */}
        <div className="space-y-3">
          {filteredCities.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No cities found</p>
            </div>
          ) : (
            filteredCities.map(({ city, country, count }, index) => (
              <button
                key={city}
                onClick={() => router.push(`/city/${encodeURIComponent(city)}`)}
                className="group w-full text-left p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 30}ms`, animationDuration: '400ms' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold mb-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors truncate">
                      {city}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{country}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black dark:text-white">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">
                        {count === 1 ? 'place' : 'places'}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
