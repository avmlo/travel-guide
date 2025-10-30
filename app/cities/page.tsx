'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Search } from 'lucide-react';
import { CARD_MEDIA, CARD_TITLE } from '@/components/CardStyles';
import { cityCountryMap } from '@/data/cityCountryMap';

interface CityStats {
  city: string;
  country: string;
  count: number;
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
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Cities</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Discover {cityStats.length} cities around the world
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-[680px] mx-auto">
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

        {/* Grid */}
        {filteredCities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No cities found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredCities.map(({ city, country, count }) => (
              <button
                key={city}
                onClick={() => router.push(`/city/${encodeURIComponent(city)}`)}
                className="group text-left"
              >
                <div className={`${CARD_MEDIA} flex items-center justify-center`}>
                  <span className="text-3xl md:text-4xl">🏙️</span>
                </div>
                <div className="mt-2">
                  <h2 className={`${CARD_TITLE} md:text-base truncate`}>{capitalizeCity(city)}</h2>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span className="truncate flex items-center gap-1"><MapPin className="h-3 w-3" />{country}</span>
                    <span className="ml-2 whitespace-nowrap">{count} {count === 1 ? 'place' : 'places'}</span>
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
