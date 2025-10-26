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
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(destination => (
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

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-medium text-gray-500 dark:text-gray-500">
                    {destination.category}
                  </span>

                  {destination.michelin_stars && destination.michelin_stars > 0 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: destination.michelin_stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-red-500 text-red-500" />
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
  );
}
