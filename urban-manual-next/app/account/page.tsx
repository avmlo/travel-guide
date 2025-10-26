'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, Check, MapPin, Loader2 } from 'lucide-react';

interface SavedPlace {
  destination_slug: string;
  destination: {
    name: string;
    city: string;
    category: string;
    image: string | null;
  };
}

interface VisitedPlace extends SavedPlace {
  visited_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'visited'>('saved');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function loadUserData() {
      try {
        setLoading(true);

        const [savedResult, visitedResult] = await Promise.all([
          supabase
            .from('saved_places')
            .select('destination_slug')
            .eq('user_id', user!.id),
          supabase
            .from('visited_places')
            .select('destination_slug, visited_at')
            .eq('user_id', user!.id)
            .order('visited_at', { ascending: false })
        ]);

        const allSlugs = new Set<string>();
        if (savedResult.data) {
          savedResult.data.forEach(item => allSlugs.add(item.destination_slug));
        }
        if (visitedResult.data) {
          visitedResult.data.forEach(item => allSlugs.add(item.destination_slug));
        }

        if (allSlugs.size > 0) {
          const { data: destData } = await supabase
            .from('destinations')
            .select('slug, name, city, category, image')
            .in('slug', Array.from(allSlugs));

          if (destData) {
            if (savedResult.data) {
              setSavedPlaces(savedResult.data.map(item => {
                const dest = destData.find(d => d.slug === item.destination_slug);
                return dest ? {
                  destination_slug: dest.slug,
                  destination: {
                    name: dest.name,
                    city: dest.city,
                    category: dest.category,
                    image: dest.image
                  }
                } : null;
              }).filter(Boolean) as SavedPlace[]);
            }

            if (visitedResult.data) {
              setVisitedPlaces(visitedResult.data.map(item => {
                const dest = destData.find(d => d.slug === item.destination_slug);
                return dest ? {
                  destination_slug: item.destination_slug,
                  visited_at: item.visited_at,
                  destination: {
                    name: dest.name,
                    city: dest.city,
                    category: dest.category,
                    image: dest.image
                  }
                } : null;
              }).filter(Boolean) as VisitedPlace[]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const cities = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.map(p => p.destination.city)
  ]);

  return (
    <main className="px-6 md:px-10 py-12 dark:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved</span>
            </div>
            <div className="text-3xl font-bold">{savedPlaces.length}</div>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Visited</span>
            </div>
            <div className="text-3xl font-bold">{visitedPlaces.length}</div>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cities</span>
            </div>
            <div className="text-3xl font-bold">{cities.size}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-3 text-sm font-bold uppercase transition-colors ${
                activeTab === 'saved'
                  ? 'border-b-2 border-black dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Saved ({savedPlaces.length})
            </button>
            <button
              onClick={() => setActiveTab('visited')}
              className={`px-4 py-3 text-sm font-bold uppercase transition-colors ${
                activeTab === 'visited'
                  ? 'border-b-2 border-black dark:border-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Visited ({visitedPlaces.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Saved Tab */}
            {activeTab === 'saved' && (
              <div>
                {savedPlaces.length === 0 ? (
                  <div className="text-center py-20">
                    <Heart className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-xl text-gray-400 mb-6">No saved places yet</p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity font-medium"
                    >
                      Explore Destinations
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {savedPlaces.map(place => (
                      <button
                        key={place.destination_slug}
                        onClick={() => router.push(`/destination/${place.destination_slug}`)}
                        className="group text-left"
                      >
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                          {place.destination.image ? (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="h-12 w-12 opacity-20" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{place.destination.name}</h3>
                        <p className="text-xs text-gray-500">{place.destination.city}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visited Tab */}
            {activeTab === 'visited' && (
              <div>
                {visitedPlaces.length === 0 ? (
                  <div className="text-center py-20">
                    <Check className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-xl text-gray-400 mb-6">No visited places yet</p>
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity font-medium"
                    >
                      Explore Destinations
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {visitedPlaces.map(place => (
                      <button
                        key={place.destination_slug}
                        onClick={() => router.push(`/destination/${place.destination_slug}`)}
                        className="group text-left"
                      >
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                          {place.destination.image ? (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="h-12 w-12 opacity-20" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{place.destination.name}</h3>
                        <p className="text-xs text-gray-500">{place.destination.city}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
