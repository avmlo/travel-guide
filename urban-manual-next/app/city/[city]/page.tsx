'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import { cityCountryMap } from '@/data/cityCountryMap';

function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CityPage() {
  const router = useRouter();
  const params = useParams();
  const city = decodeURIComponent(params.city as string);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, [city]);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('city', city)
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const country = cityCountryMap[city] || 'Unknown';

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
        {/* Back Button */}
        <button
          onClick={() => router.push('/cities')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Cities</span>
        </button>

        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {capitalizeCity(city)}
          </h1>
          <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="h-5 w-5" />
            <span>{country}</span>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {destinations.length} destination{destinations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Destinations Grid */}
        {destinations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No destinations found in {city}.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {destinations.map((destination, index) => (
              <button
                key={destination.slug}
                onClick={() => router.push(`/destination/${destination.slug}`)}
                className="group cursor-pointer text-left animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 10}ms`, animationDuration: '300ms' }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2">
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
                      <img
                        src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                        alt="Michelin star"
                        className="h-3 w-3"
                      />
                      <span>{destination.michelin_stars}</span>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-0.5">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-black dark:text-white">
                    {destination.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize line-clamp-1">
                    {destination.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
