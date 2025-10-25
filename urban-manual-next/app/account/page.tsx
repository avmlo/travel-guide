'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import {
  MapPin, Heart, CheckCircle2, Map, Loader2
} from "lucide-react";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cityCountryMap } from "@/data/cityCountryMap";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Account() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Show sign in options if not authenticated
        setAuthChecked(true);
        setIsLoadingData(false);
        return;
      }

      setUser(session.user);
      setAuthChecked(true);
    }

    checkAuth();
  }, []);

  // Load user data and places
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);

        // Load both saved and visited places in parallel
        const [savedResult, visitedResult] = await Promise.all([
          supabase
            .from('saved_places')
            .select('destination_slug')
            .eq('user_id', user.id),
          supabase
            .from('visited_places')
            .select('destination_slug, visited_at, rating, notes')
            .eq('user_id', user.id)
            .order('visited_at', { ascending: false })
        ]);

        // Collect all unique slugs
        const allSlugs = new Set<string>();
        if (savedResult.data) {
          savedResult.data.forEach(item => allSlugs.add(item.destination_slug));
        }
        if (visitedResult.data) {
          visitedResult.data.forEach(item => allSlugs.add(item.destination_slug));
        }

        // Fetch all destinations in one query
        if (allSlugs.size > 0) {
          const { data: destData } = await supabase
            .from('destinations')
            .select('slug, name, city, category, image')
            .in('slug', Array.from(allSlugs));

          if (destData) {
            // Map saved places
            if (savedResult.data) {
              setSavedPlaces(savedResult.data.map((item: any) => {
                const dest = destData.find((d: any) => d.slug === item.destination_slug);
                return dest ? {
                  destination_slug: dest.slug,
                  destination: {
                    name: dest.name,
                    city: dest.city,
                    category: dest.category,
                    image: dest.image
                  }
                } : null;
              }).filter((item: any) => item !== null));
            }

            // Map visited places
            if (visitedResult.data) {
              setVisitedPlaces(visitedResult.data.map((item: any) => {
                const dest = destData.find((d: any) => d.slug === item.destination_slug);
                return dest ? {
                  destination_slug: item.destination_slug,
                  visited_at: item.visited_at,
                  rating: item.rating,
                  notes: item.notes,
                  destination: {
                    name: dest.name,
                    city: dest.city,
                    category: dest.category,
                    image: dest.image
                  }
                } : null;
              }).filter((item: any) => item !== null));
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadUserData();
  }, [user?.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  // Memoize statistics
  const stats = useMemo(() => {
    const uniqueCities = new Set([
      ...savedPlaces.map(p => p.destination?.city).filter(Boolean),
      ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
    ]);

    const uniqueCountries = new Set(
      Array.from(uniqueCities).map(city => cityCountryMap[city] || 'Other')
    );

    return {
      uniqueCities,
      uniqueCountries
    };
  }, [savedPlaces, visitedPlaces]);

  // Show loading state
  if (!authChecked || isLoadingData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <main className="px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  // Show coming soon screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-md mx-auto">
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center mb-4">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  User accounts are coming soon. You'll be able to save your favorite places, track visits, and plan trips.
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  Browse Destinations
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Account</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="visited">Visited</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Places Visited</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{visitedPlaces.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across {stats.uniqueCities.size} cities
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saved</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{savedPlaces.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Wishlist items
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cities</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueCities.size}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Explored
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Countries</CardTitle>
                    <Map className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueCountries.size}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Visited
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {visitedPlaces.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visitedPlaces.slice(0, 5).map((place) => (
                        <div
                          key={place.destination_slug}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          onClick={() => router.push(`/destination/${place.destination_slug}`)}
                        >
                          {place.destination.image && (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{place.destination.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {capitalizeCity(place.destination.city)} • {place.destination.category}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(place.visited_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Saved Tab */}
            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Places ({savedPlaces.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedPlaces.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No saved places yet. Start exploring and save your favorites!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedPlaces.map((place) => (
                        <div
                          key={place.destination_slug}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                          onClick={() => router.push(`/destination/${place.destination_slug}`)}
                        >
                          {place.destination.image && (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold mb-1">{place.destination.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {capitalizeCity(place.destination.city)}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {place.destination.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visited Tab */}
            <TabsContent value="visited" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visited Places ({visitedPlaces.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {visitedPlaces.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No visited places yet. Mark places you've been to!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visitedPlaces.map((place) => (
                        <div
                          key={place.destination_slug}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                          onClick={() => router.push(`/destination/${place.destination_slug}`)}
                        >
                          {place.destination.image && (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold mb-1">{place.destination.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {capitalizeCity(place.destination.city)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary">
                                {place.destination.category}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(place.visited_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
