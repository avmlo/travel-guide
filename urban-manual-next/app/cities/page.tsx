'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin } from 'lucide-react';
import { cityCountryMap } from '@/data/cityCountryMap';

interface CityStats {
  city: string;
  country: string;
  count: number;
}

export default function CitiesPage() {
  const router = useRouter();
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('city');

      if (error) throw error;

      const destinations = data as Destination[];
      const cityCounts = destinations.reduce((acc, dest) => {
        acc[dest.city] = (acc[dest.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stats = Object.entries(cityCounts).map(([city, count]) => ({
        city,
        country: cityCountryMap[city] || 'Unknown',
        count
      })).sort((a, b) => a.city.localeCompare(b.city));

      setCityStats(stats);
    } catch (error) {
      console.error('Error fetching city stats:', error);
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

  return (
    <main className="px-6 md:px-10 py-12 dark:text-white">
      <div className="max-w-[1920px] mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Cities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore destinations across {cityStats.length} cities worldwide
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {cityStats.map(({ city, country, count }) => (
            <button
              key={city}
              onClick={() => router.push(`/city/${encodeURIComponent(city)}`)}
              className="group text-left p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-900 dark:hover:border-gray-100 transition-colors"
            >
              <div>
                <h2 className="text-xl font-bold mb-2 group-hover:opacity-60 transition-opacity line-clamp-2">
                  {city}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{country}</span>
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {count} destination{count !== 1 ? 's' : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
