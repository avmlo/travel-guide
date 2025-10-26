'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { Search, MapPin, Star } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchTerm, selectedCity, destinations]);

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

  const filterDestinations = () => {
    let filtered = destinations;

    if (selectedCity !== 'all') {
      filtered = filtered.filter(d => d.city === selectedCity);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDestinations(filtered);
  };

  const cities = Array.from(new Set(destinations.map(d => d.city))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Catalogue
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore {destinations.length} curated destinations across {cities.length} cities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search destinations, cities, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCity === 'all'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Cities
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCity === city
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No destinations found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(destination => (
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
