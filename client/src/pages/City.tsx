import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { DestinationDrawer } from "@/components/DestinationDrawer";

import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function City() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/city/:city");
  const citySlug = params?.city || "";
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);

  // Load user's saved and visited places
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();

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
    setSelectedDestination(destination);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button onClick={() => setLocation("/cities")} className="text-xs text-gray-500 hover:text-black">
              ← Back to Cities
            </button>
          </div>

          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-4">
              {capitalizeCity(citySlug)}
            </h1>
            <p className="text-sm text-gray-600">
              {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'}
            </p>
          </div>

          {/* Destinations Grid */}
          {destinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No destinations found in this city.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.slug}
                  destination={destination}
                  onClick={() => handleCardClick(destination)}
                  isSaved={savedPlaces.includes(destination.slug)}
                  isVisited={visitedPlaces.includes(destination.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <SimpleFooter />
    </div>
  );
}

