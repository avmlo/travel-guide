'use client';

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DestinationCardEnhanced } from "@/components/DestinationCardEnhanced";
import { Destination } from "@/types/destination";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
}

export default function City(props: CityPageProps) {
  const params = use(props.params);
  const router = useRouter();
  const citySlug = params.city;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load user's saved and visited places
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Load saved places
        const { data: savedData } = await supabase
          .from('saved_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);

        if (savedData) {
          setSavedPlaces(savedData.map(s => s.destination_slug));
        }

        // Load visited places
        const { data: visitedData } = await supabase
          .from('visited_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);

        if (visitedData) {
          setVisitedPlaces(visitedData.map(v => v.destination_slug));
        }
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function loadDestinations() {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('city', citySlug)
        .order('name');

      if (!error && data) {
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
        setDestinations(transformed);
      }

      setLoading(false);
    }

    if (citySlug) {
      loadDestinations();
    }
  }, [citySlug]);

  const handleCardClick = (destination: Destination) => {
    router.push(`/destination/${destination.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-[1920px] mx-auto">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />

            {/* Title skeleton */}
            <div className="mb-12">
              <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-4" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>

            {/* Grid skeleton */}
            <SkeletonGrid count={16} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 animate-fade-in">
            <button onClick={() => router.push("/cities")} className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              ← Back to Cities
            </button>
          </div>

          {/* Page Title */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-4 text-black dark:text-white">
              {capitalizeCity(citySlug)}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'}
            </p>
          </div>

          {/* Destinations Grid with staggered animations */}
          {destinations.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-xl text-gray-400 dark:text-gray-600">No destinations found in this city.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
              {destinations.map((destination, index) => (
                <DestinationCardEnhanced
                  key={destination.slug}
                  destination={destination}
                  onClick={() => handleCardClick(destination)}
                  isSaved={savedPlaces.includes(destination.slug)}
                  isVisited={visitedPlaces.includes(destination.slug)}
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
