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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
          >
            The Urban Manual
          </button>
          <button 
            onClick={() => setLocation(user ? "/account" : "/auth/login")}
            className="text-xs font-bold uppercase hover:opacity-60 transition-opacity px-4 py-2 border border-black"
          >
            {user ? 'Account' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="px-6 md:px-10 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setLocation("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <button onClick={() => setLocation("/cities")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Cities</button>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase">New York</span>
            <span className="text-xs font-bold">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="max-w-[1920px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="hover:underline">INSTAGRAM</a>
              <a href="#" className="hover:underline">TWITTER</a>
              <a href="#" className="hover:underline">SAVEE</a>
            </div>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </footer>

      {/* Destination Drawer */}
      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

