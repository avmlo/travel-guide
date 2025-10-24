import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { DestinationCardEnhanced } from "@/components/DestinationCardEnhanced";
import { Destination } from "@/types/destination";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { supabase } from "@/lib/supabase";

export default function SavedPlaces() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Check auth
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Load saved places
        const { data: savedData } = await supabase
          .from('saved_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);

        const slugs = savedData?.map(s => s.destination_slug) || [];
        setSavedSlugs(slugs);

        // Load all destinations from Supabase
        const { data: destData } = await supabase
          .from('destinations')
          .select('*')
          .in('slug', slugs)
          .order('name');

        if (destData) {
          const transformed: Destination[] = destData.map(d => ({
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
            subline: '',
          }));
          setDestinations(transformed);
        }
      } catch (error) {
        console.error("Error loading saved places:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-[1920px] mx-auto">
            {/* Title skeleton */}
            <div className="mb-12">
              <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-4" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>

            {/* Grid skeleton */}
            <SkeletonGrid count={12} />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <div className="flex flex-col items-center justify-center p-6 min-h-[60vh] dark:text-white">
          <Heart className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Sign in to save places</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create an account to save your favorite destinations</p>
          <Button onClick={() => setLocation("/auth/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-4 text-black dark:text-white">
              Saved Places
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {destinations.length} {destinations.length === 1 ? 'place' : 'places'} saved
            </p>
          </div>

          {/* Grid */}
          {destinations.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Heart className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-xl text-gray-400 dark:text-gray-600 mb-6">
                No saved places yet.
              </p>
              <Button onClick={() => setLocation("/")} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                Explore Destinations
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
              {destinations.map((destination, index) => (
                <DestinationCardEnhanced
                  key={destination.slug}
                  destination={destination}
                  onClick={() => setLocation(`/destination/${destination.slug}`)}
                  isSaved={true}
                  isVisited={false}
                  animationDelay={Math.min(index * 30, 500)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}

