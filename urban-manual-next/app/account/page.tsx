'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, Check, MapPin, Loader2, User, TrendingUp, Star, Map, Globe, Award, Calendar, LogOut, Sparkles, Navigation, Plus, X, Trash2 } from 'lucide-react';
import { cityCountryMap } from '@/data/cityCountryMap';

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

interface Destination {
  slug: string;
  michelin_stars?: number;
}

interface Trip {
  id: string;
  title: string;
  description: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'collection' | 'settings'>('overview');
  const [showCreateTripDialog, setShowCreateTripDialog] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: '',
    description: '',
    destination: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load all destinations for stats
  useEffect(() => {
    async function loadDestinations() {
      const { data } = await supabase
        .from('destinations')
        .select('slug, michelin_stars');

      if (data) {
        setAllDestinations(data);
      }
    }
    loadDestinations();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadUserData() {
      try {
        setLoading(true);

        const [savedResult, visitedResult, tripsResult] = await Promise.all([
          supabase
            .from('saved_places')
            .select('destination_slug')
            .eq('user_id', user!.id),
          supabase
            .from('visited_places')
            .select('destination_slug, visited_at')
            .eq('user_id', user!.id)
            .order('visited_at', { ascending: false }),
          supabase
            .from('trips')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })
        ]);

        // Check for errors
        if (savedResult.error) {
          console.error('Error fetching saved places:', savedResult.error);
          if (savedResult.error.code === '42P01') {
            console.error('⚠️ Table "saved_places" does not exist. Please run migrations/saved_visited_places.sql in Supabase.');
          }
        }
        if (visitedResult.error) {
          console.error('Error fetching visited places:', visitedResult.error);
          if (visitedResult.error.code === '42P01') {
            console.error('⚠️ Table "visited_places" does not exist. Please run migrations/saved_visited_places.sql in Supabase.');
          }
        }
        if (tripsResult.error) {
          console.error('Error fetching trips:', tripsResult.error);
          if (tripsResult.error.code === '42P01') {
            console.error('⚠️ Table "trips" does not exist. Please run migrations/trips.sql in Supabase.');
          }
        }

        // Set trips data
        if (tripsResult.data) {
          setTrips(tripsResult.data);
        }

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

  // Calculate stats
  const stats = useMemo(() => {
    const uniqueCities = new Set([
      ...savedPlaces.map(p => p.destination.city),
      ...visitedPlaces.map(p => p.destination.city)
    ]);

    const uniqueCountries = new Set(
      Array.from(uniqueCities).map(city => cityCountryMap[city] || 'Other')
    );

    const michelinCount = visitedPlaces.filter(p => {
      const dest = allDestinations.find(d => d.slug === p.destination_slug);
      return dest && dest.michelin_stars && dest.michelin_stars > 0;
    }).length;

    return {
      uniqueCities,
      uniqueCountries,
      michelinCount
    };
  }, [savedPlaces, visitedPlaces, allDestinations]);

  // Get sorted cities for dropdown
  const cities = Object.keys(cityCountryMap).sort();

  // Helper function to format city names
  const formatCityName = (city: string) => {
    return city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Trip functions
  const createTrip = async () => {
    if (!newTrip.title.trim()) {
      alert('Please enter a trip title');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{
          title: newTrip.title,
          description: newTrip.description || null,
          destination: newTrip.destination || null,
          start_date: newTrip.start_date || null,
          end_date: newTrip.end_date || null,
          status: 'planning',
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setTrips([data, ...trips]);
      setShowCreateTripDialog(false);
      setNewTrip({ title: '', description: '', destination: '', start_date: '', end_date: '' });
    } catch (error: any) {
      console.error('Error creating trip:', error);
      let errorMessage = 'Failed to create trip';
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      if (error?.code === '42P01') {
        errorMessage = 'Database table "trips" does not exist. Please run migrations/trips.sql in Supabase. See migrations/README.md for instructions.';
      }
      alert(errorMessage);
    }
  };

  const deleteTrip = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
      setTrips(trips.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <main className="px-4 md:px-6 lg:px-10 py-8 dark:text-white min-h-screen">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Account</h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'collection'
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Collection
              {activeTab === 'collection' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Visited</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{visitedPlaces.length}</div>
                    <p className="text-xs text-gray-500">Places explored</p>
                  </div>

                  <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-red-600 dark:text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{savedPlaces.length}</div>
                    <p className="text-xs text-gray-500">Wishlist items</p>
                  </div>

                  <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cities</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.uniqueCities.size}</div>
                    <p className="text-xs text-gray-500">Explored</p>
                  </div>

                  <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Countries</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.uniqueCountries.size}</div>
                    <p className="text-xs text-gray-500">Visited</p>
                  </div>
                </div>

                {/* Route Optimizer Quick Access */}
                {savedPlaces.length >= 3 && (
                  <button
                    onClick={() => router.push('/optimize')}
                    className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-bold mb-1">Create Your Perfect Day</div>
                          <div className="text-sm text-white/80">AI-powered route optimizer • {savedPlaces.length} saved places ready</div>
                        </div>
                      </div>
                      <Navigation className="h-6 w-6" />
                    </div>
                  </button>
                )}

                {/* My Trips */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <h2 className="text-xl font-bold">My Trips</h2>
                    </div>
                    <button
                      onClick={() => setShowCreateTripDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      New Trip
                    </button>
                  </div>

                  {trips.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                      <MapPin className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No trips planned yet</p>
                      <button
                        onClick={() => setShowCreateTripDialog(true)}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity text-sm font-medium"
                      >
                        Plan Your First Trip
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trips.slice(0, 3).map((trip) => (
                        <div
                          key={trip.id}
                          className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-lg transition-shadow group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold line-clamp-2 flex-1">{trip.title}</h3>
                            <button
                              onClick={() => deleteTrip(trip.id, trip.title)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {trip.destination && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="line-clamp-1">{formatCityName(trip.destination)}</span>
                            </div>
                          )}

                          {(trip.start_date || trip.end_date) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {formatDate(trip.start_date)}
                                {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                              </span>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full capitalize">
                              {trip.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {trips.length > 3 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => router.push('/trips')}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        View all {trips.length} trips →
                      </button>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                {(stats.michelinCount > 0 || stats.uniqueCountries.size >= 3 || visitedPlaces.length >= 10) && (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Award className="h-5 w-5" />
                      <h2 className="text-xl font-bold">Achievements</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats.michelinCount > 0 && (
                        <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl">
                          <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                            <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                          </div>
                          <div>
                            <p className="font-semibold">Michelin Explorer</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Visited {stats.michelinCount} Michelin-starred {stats.michelinCount === 1 ? 'restaurant' : 'restaurants'}
                            </p>
                          </div>
                        </div>
                      )}
                      {stats.uniqueCountries.size >= 3 && (
                        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                            <Map className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                          </div>
                          <div>
                            <p className="font-semibold">Globe Trotter</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Explored {stats.uniqueCountries.size} countries
                            </p>
                          </div>
                        </div>
                      )}
                      {visitedPlaces.length >= 10 && (
                        <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl">
                          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
                          </div>
                          <div>
                            <p className="font-semibold">Rising Explorer</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Visited {visitedPlaces.length} destinations
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trips Section */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <h2 className="text-xl font-bold">My Trips</h2>
                    </div>
                    <button
                      onClick={() => router.push('/trips')}
                      className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No trips planned yet</p>
                    <button
                      onClick={() => router.push('/trips')}
                      className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl hover:opacity-80 transition-opacity font-medium"
                    >
                      Plan Your First Trip
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Collection Tab */}
            {activeTab === 'collection' && (
              <div className="space-y-8">
                {/* Saved Places */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Saved Places</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {savedPlaces.length} {savedPlaces.length === 1 ? 'place' : 'places'} you want to visit
                      </p>
                    </div>
                  </div>
                  {savedPlaces.length === 0 ? (
                    <div className="text-center py-20 border border-gray-200 dark:border-gray-800 rounded-2xl">
                      <Heart className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-xl text-gray-400 mb-6">No saved places yet</p>
                      <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl hover:opacity-80 transition-opacity font-medium"
                      >
                        Explore Destinations
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                      {savedPlaces.map(place => (
                        <button
                          key={place.destination_slug}
                          onClick={() => router.push(`/destination/${place.destination_slug}`)}
                          className="group text-left"
                        >
                          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3">
                            {place.destination.image ? (
                              <img
                                src={place.destination.image}
                                alt={place.destination.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="h-12 w-12 opacity-20" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-black dark:text-white">{place.destination.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{place.destination.city}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visited Places */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Visited Places</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {visitedPlaces.length} {visitedPlaces.length === 1 ? 'place' : 'places'} you've been to
                      </p>
                    </div>
                  </div>
                  {visitedPlaces.length === 0 ? (
                    <div className="text-center py-20 border border-gray-200 dark:border-gray-800 rounded-2xl">
                      <Check className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-xl text-gray-400 mb-6">No visited places yet</p>
                      <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl hover:opacity-80 transition-opacity font-medium"
                      >
                        Explore Destinations
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                      {visitedPlaces.map(place => (
                        <button
                          key={place.destination_slug}
                          onClick={() => router.push(`/destination/${place.destination_slug}`)}
                          className="group text-left"
                        >
                          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3">
                            {place.destination.image ? (
                              <img
                                src={place.destination.image}
                                alt={place.destination.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="h-12 w-12 opacity-20" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-black dark:text-white">{place.destination.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{place.destination.city}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Profile Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                        Email
                      </label>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                        User ID
                      </label>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-mono text-sm">
                        {user.id.substring(0, 24)}...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Quick Stats</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Total Destinations</span>
                      <span className="font-semibold">{savedPlaces.length + visitedPlaces.length}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:border-gray-800" />
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Cities Explored</span>
                      <span className="font-semibold">{stats.uniqueCities.size}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Countries Visited</span>
                      <span className="font-semibold">{stats.uniqueCountries.size}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Michelin Restaurants</span>
                      <span className="font-semibold">{stats.michelinCount}</span>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">Account Actions</h2>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Sign Out</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sign out of your account on this device
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Trip Dialog */}
      {showCreateTripDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Trip</h2>
              <button
                onClick={() => setShowCreateTripDialog(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  value={newTrip.title}
                  onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                  placeholder="e.g., Summer in Paris"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTrip.description}
                  onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                  placeholder="What's this trip about?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <select
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                  <option value="">Select a city...</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {formatCityName(city)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTrip.start_date}
                    onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={newTrip.end_date}
                    onChange={(e) => setNewTrip({ ...newTrip, end_date: e.target.value })}
                    min={newTrip.start_date}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateTripDialog(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createTrip}
                  className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium"
                >
                  Create Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
