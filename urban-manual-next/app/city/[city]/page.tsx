'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import { cityCountryMap } from '@/data/cityCountryMap';

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
    <main className="px-6 md:px-10 py-12 dark:text-white">
      <div className="max-w-[1920px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/cities')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:opacity-60 mb-8 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Cities</span>
        </button>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {city}
          </h1>
          <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="h-5 w-5" />
            <span>{country}</span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
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
            {destinations.map(destination => (
              <button
                key={destination.slug}
                onClick={() => router.push(`/destination/${destination.slug}`)}
                className="group cursor-pointer text-left"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <MapPin className="h-16 w-16 opacity-20" />
                    </div>
                  )}
                  {destination.crown && (
                    <div className="absolute top-2 right-2 text-2xl">👑</div>
                  )}
                </div>

                {/* Text Content */}
                <div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:opacity-60 transition-opacity">
                    {destination.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-medium text-gray-500 dark:text-gray-500">
                      {destination.category}
                    </span>
                    {destination.michelin_stars && destination.michelin_stars > 0 && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: destination.michelin_stars }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-red-500 text-red-500" />
                        ))}
                      </div>
                    )}
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
