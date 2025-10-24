import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MapPin, Heart, CheckCircle2, User, Settings, Shield, TrendingUp,
  Edit, Save, X, Loader2, Calendar, Plane, Star, Map
} from "lucide-react";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";
import { useAuth } from "@/_core/hooks/useAuth";
import { cityCountryMap } from "@/data/cityCountryMap";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function AccountNew() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { data: trips } = trpc.trips.list.useQuery(undefined, { enabled: !!user });

  // Load all destinations for drawer
  useEffect(() => {
    async function loadDestinations() {
      const { data } = await supabase
        .from('destinations')
        .select('*');

      if (data) {
        const transformed: Destination[] = data.map(d => ({
          name: d.name,
          slug: d.slug,
          city: d.city,
          category: d.category,
          content: d.content || d.description || '',
          mainImage: d.image || '',
          michelinStars: d.michelin_stars || 0,
          crown: d.crown || false,
          brand: '',
          cardTags: '',
          lat: 0,
          long: 0,
          myRating: 0,
          reviewed: false,
          subline: d.description || ''
        }));
        setAllDestinations(transformed);
      }
    }
    loadDestinations();
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

        setProfileData({
          name: user.name || "",
          email: user.email || ""
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoadingData(false);
          return;
        }

        // Load both saved and visited places in parallel
        const [savedResult, visitedResult] = await Promise.all([
          supabase
            .from('saved_destinations')
            .select('destination_slug')
            .eq('user_id', session.user.id),
          supabase
            .from('visited_destinations')
            .select('destination_slug, visited_date, rating, notes')
            .eq('user_id', session.user.id)
            .order('visited_date', { ascending: false })
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
                  visited_date: item.visited_date,
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
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-runs

  const handleCardClick = (destinationSlug: string) => {
    const dest = allDestinations.find(d => d.slug === destinationSlug);
    if (dest) {
      setSelectedDestination(dest);
      setIsDrawerOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update Supabase auth metadata
      const { error } = await supabase.auth.updateUser({
        data: { name: profileData.name }
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  // Memoize statistics to prevent recalculation on every render
  const stats = useMemo(() => {
    const uniqueCities = new Set([
      ...savedPlaces.map(p => p.destination?.city).filter(Boolean),
      ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
    ]);

    const uniqueCountries = new Set(
      Array.from(uniqueCities).map(city => cityCountryMap[city] || 'Other')
    );

    const michelinCount = visitedPlaces.filter(p => {
      const dest = allDestinations.find(d => d.slug === p.destination_slug);
      return dest && dest.michelinStars > 0;
    }).length;

    return {
      uniqueCities,
      uniqueCountries,
      michelinCount
    };
  }, [savedPlaces, visitedPlaces, allDestinations]);

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-2" />
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>

            {/* Tabs skeleton */}
            <div className="h-10 w-[600px] bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-6" />

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-shimmer" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile, view your travel stats, and customize your settings
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    <CardTitle className="text-sm font-medium">Countries</CardTitle>
                    <Map className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueCountries.size}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Explored
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trips</CardTitle>
                    <Plane className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{trips?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Planned adventures
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Trips */}
              {trips && trips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Trips
                    </CardTitle>
                    <CardDescription>Your latest travel plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trips.slice(0, 3).map((trip) => (
                        <div
                          key={trip.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                          onClick={() => setLocation(`/trip/${trip.id}`)}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold">{trip.title}</h3>
                            {trip.destination && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {trip.destination}
                              </p>
                            )}
                          </div>
                          <Badge>{trip.status || "planning"}</Badge>
                        </div>
                      ))}
                    </div>
                    {trips.length > 3 && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setLocation("/trips")}
                      >
                        View All Trips
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Travel Achievements */}
              {stats.michelinCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Travel Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.michelinCount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-semibold">Michelin Explorer</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Visited {stats.michelinCount} Michelin-starred {stats.michelinCount === 1 ? 'restaurant' : 'restaurants'}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{stats.michelinCount}</Badge>
                        </div>
                      )}
                      {stats.uniqueCountries.size >= 5 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Map className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                              <p className="font-semibold">Globe Trotter</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Explored {stats.uniqueCountries.size} countries
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{stats.uniqueCountries.size}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your profile details</CardDescription>
                    </div>
                    {!isEditingProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed. Contact support if you need to update it.
                      </p>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            name: user?.name || "",
                            email: user?.email || ""
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>View your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">User ID</dt>
                      <dd className="text-sm font-mono">{user?.id?.substring(0, 16)}...</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Member Since</dt>
                      <dd className="text-sm">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Collection Tab */}
            <TabsContent value="collection" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Places</CardTitle>
                  <CardDescription>Places you want to visit</CardDescription>
                </CardHeader>
                <CardContent>
                  {savedPlaces.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">No saved places yet</p>
                      <Button onClick={() => setLocation('/')}>
                        Explore Destinations
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {savedPlaces.slice(0, 8).map((place) => (
                        <button
                          key={place.destination_slug}
                          onClick={() => handleCardClick(place.destination_slug)}
                          className="group text-left"
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden rounded-lg">
                            {place.destination.image && (
                              <img
                                src={place.destination.image}
                                alt={place.destination.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            )}
                          </div>
                          <h3 className="font-medium text-sm line-clamp-1">{place.destination.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{capitalizeCity(place.destination.city)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {savedPlaces.length > 8 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => setLocation('/saved')}>
                      View All {savedPlaces.length} Saved Places
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visited Places</CardTitle>
                  <CardDescription>Places you've already been to</CardDescription>
                </CardHeader>
                <CardContent>
                  {visitedPlaces.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No visited places yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visitedPlaces.slice(0, 8).map((place) => (
                        place.destination && (
                          <button
                            key={place.destination_slug}
                            onClick={() => handleCardClick(place.destination_slug)}
                            className="group text-left"
                          >
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden rounded-lg relative">
                              {place.destination.image && (
                                <img
                                  src={place.destination.image}
                                  alt={place.destination.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              )}
                              <Badge className="absolute top-2 right-2" variant="secondary">
                                ✓
                              </Badge>
                            </div>
                            <h3 className="font-medium text-sm line-clamp-1">{place.destination.name}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{capitalizeCity(place.destination.city)}</p>
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Sign Out</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Total Destinations</dt>
                      <dd className="font-semibold">{savedPlaces.length + visitedPlaces.length}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Cities Explored</dt>
                      <dd className="font-semibold">{stats.uniqueCities.size}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Countries</dt>
                      <dd className="font-semibold">{stats.uniqueCountries.size}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Planned Trips</dt>
                      <dd className="font-semibold">{trips?.length || 0}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SimpleFooter />

      {/* Destination Drawer */}
      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedDestination(null);
          }}
        />
      )}
    </div>
  );
}
