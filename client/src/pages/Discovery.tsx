import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { Destination } from "@/types/destination";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Gem, Compass, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { motion } from "framer-motion";

type FeedType = 'for-you' | 'trending' | 'hidden-gems' | 'new';

export default function Discovery() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<FeedType>('for-you');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);

  // Load all destinations
  useEffect(() => {
    async function loadDestinations() {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) throw error;

        const transformedData: Destination[] = (data || []).map(d => ({
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

        setDestinations(transformedData);

        // Extract unique cities
        const uniqueCities = Array.from(new Set(transformedData.map(d => d.city)));
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error loading destinations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  // Load user and saved places
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data: savedData } = await supabase
          .from('saved_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);

        if (savedData) {
          setSavedPlaces(savedData.map(s => s.destination_slug));
        }
      }
    }

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch feed data
  const { data: feedData, isLoading: feedLoading, refetch } = trpc.discovery.getFeed.useQuery(
    {
      limit: 20,
      offset: 0,
      feedType: selectedTab,
      allDestinations: destinations,
    },
    {
      enabled: destinations.length > 0 && !!user,
    }
  );

  // Fetch trending (public, doesn't require auth)
  const { data: trendingData, isLoading: trendingLoading } = trpc.discovery.getTrending.useQuery(
    {
      limit: 20,
      allDestinations: destinations,
    },
    {
      enabled: destinations.length > 0 && selectedTab === 'trending' && !user,
    }
  );

  // Update stats mutation
  const updateStatsMutation = trpc.discovery.updateStats.useMutation();

  // Save/unsave mutations
  const saveMutation = trpc.user.savePlace.useMutation({
    onSuccess: () => {
      // Refetch saved places
      refetch();
    }
  });

  const unsaveMutation = trpc.user.unsavePlace.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const handleViewDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDrawerOpen(true);

    // Update stats
    updateStatsMutation.mutate({
      destinationSlug: destination.slug,
      action: 'view'
    });
  };

  const handleSaveToggle = (slug: string) => {
    if (!user) {
      // Redirect to login or show message
      alert('Please log in to save destinations');
      return;
    }

    if (savedPlaces.includes(slug)) {
      unsaveMutation.mutate({ destinationSlug: slug });
      setSavedPlaces(prev => prev.filter(s => s !== slug));
    } else {
      saveMutation.mutate({ destinationSlug: slug });
      setSavedPlaces(prev => [...prev, slug]);

      // Update stats
      updateStatsMutation.mutate({
        destinationSlug: slug,
        action: 'save'
      });
    }
  };

  const feedItems = user ? (feedData?.items || []) : (selectedTab === 'trending' ? trendingData || [] : []);
  const isLoadingFeed = user ? feedLoading : trendingLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400 flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO />
      <Navigation cities={cities} />

      {/* Header */}
      <section className="py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl">
                <Compass className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Discover</h1>
                <p className="text-gray-600 mt-1">Personalized recommendations just for you</p>
              </div>
            </div>

            {user && feedData?.metadata && (
              <div className="flex flex-wrap gap-2 mt-4">
                {feedData.metadata.inferredCategories.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Your style:</span>{' '}
                    {feedData.metadata.inferredCategories.join(', ')}
                  </div>
                )}
                {feedData.metadata.inferredCities.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Favorite cities:</span>{' '}
                    {feedData.metadata.inferredCities.join(', ')}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Feed Tabs */}
      <section className="py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as FeedType)}>
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white">
              <TabsTrigger value="for-you" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">For You</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="hidden-gems" className="flex items-center gap-2">
                <Gem className="h-4 w-4" />
                <span className="hidden sm:inline">Hidden Gems</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </TabsTrigger>
            </TabsList>

            {/* For You Tab */}
            <TabsContent value="for-you">
              {!user ? (
                <div className="text-center py-20">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in for personalized recommendations</h3>
                  <p className="text-gray-600 mb-6">Get AI-powered suggestions based on your preferences</p>
                  <Button onClick={() => window.location.href = '/login'}>
                    Sign In
                  </Button>
                </div>
              ) : isLoadingFeed ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : feedItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">No recommendations yet. Start saving places to get personalized suggestions!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {feedItems.map((destination, index) => (
                    <DiscoveryCard
                      key={destination.slug}
                      destination={destination}
                      onView={handleViewDestination}
                      onSave={handleSaveToggle}
                      isSaved={savedPlaces.includes(destination.slug)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending">
              {isLoadingFeed ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : feedItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">No trending destinations yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {feedItems.map((destination, index) => (
                    <DiscoveryCard
                      key={destination.slug}
                      destination={destination}
                      onView={handleViewDestination}
                      onSave={user ? handleSaveToggle : undefined}
                      isSaved={savedPlaces.includes(destination.slug)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Hidden Gems Tab */}
            <TabsContent value="hidden-gems">
              {!user ? (
                <div className="text-center py-20">
                  <Gem className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to discover hidden gems</h3>
                  <p className="text-gray-600 mb-6">Find underrated destinations that match your taste</p>
                  <Button onClick={() => window.location.href = '/login'}>
                    Sign In
                  </Button>
                </div>
              ) : isLoadingFeed ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : feedItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">No hidden gems found. Try exploring more destinations!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {feedItems.map((destination, index) => (
                    <DiscoveryCard
                      key={destination.slug}
                      destination={destination}
                      onView={handleViewDestination}
                      onSave={handleSaveToggle}
                      isSaved={savedPlaces.includes(destination.slug)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* New Tab */}
            <TabsContent value="new">
              {!user ? (
                <div className="text-center py-20">
                  <Compass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to explore new additions</h3>
                  <p className="text-gray-600 mb-6">Be the first to discover newly added destinations</p>
                  <Button onClick={() => window.location.href = '/login'}>
                    Sign In
                  </Button>
                </div>
              ) : isLoadingFeed ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : feedItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">No new destinations yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {feedItems.map((destination, index) => (
                    <DiscoveryCard
                      key={destination.slug}
                      destination={destination}
                      onView={handleViewDestination}
                      onSave={handleSaveToggle}
                      isSaved={savedPlaces.includes(destination.slug)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <Footer />
    </div>
  );
}
