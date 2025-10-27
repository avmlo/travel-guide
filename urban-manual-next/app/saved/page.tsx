'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { DestinationCardEnhanced } from "@/components/DestinationCardEnhanced";
import { Destination } from "@/types/destination";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { getSupabaseClient } from "@/lib/supabase";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function SavedPlaces() {
  const supabase = getSupabaseClient();
  const router = useRouter();
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

        if (slugs.length === 0) {
          setLoading(false);
          return;
        }

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
            <div className="mb-12">
              <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-4" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>
            <SkeletonGrid count={12} />
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <Heart className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-6" />
              <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Sign in to view saved places</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save your favorite destinations and access them anytime
              </p>
              <Button onClick={() => router.push("/account")}>
                Sign In
              </Button>
            </div>
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
        <div className="max-w-[1920px] mx-auto">
          {/* Page Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              <h1 className="text-4xl font-bold text-black dark:text-white">Saved Places</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {destinations.length} {destinations.length === 1 ? 'place' : 'places'} saved
            </p>
          </div>

          {/* Empty State */}
          {destinations.length === 0 ? (
            <div className="text-center py-20 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Heart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
              <h2 className="text-2xl font-semibold mb-2 text-black dark:text-white">No saved places yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start exploring and save your favorites
              </p>
              <Button onClick={() => router.push("/")} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                Explore Destinations
              </Button>
            </div>
          ) : (
            /* Destinations Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
              {destinations.map((destination, index) => (
                <DestinationCardEnhanced
                  key={destination.slug}
                  destination={destination}
                  onClick={() => router.push(`/destination/${destination.slug}`)}
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
