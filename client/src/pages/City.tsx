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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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

  // Category mapping with emojis (matching Home page)
  const categoryMap: Record<string, { emoji: string; label: string }> = {
    'Eat & Drink': { emoji: '🍽️', label: 'Eat & Drink' },
    'Stay': { emoji: '🏨', label: 'Stay' },
    'Space': { emoji: '🏛️', label: 'Space' },
    'Other': { emoji: '✨', label: 'Other' },
  };

  // Get unique categories from destinations
  const uniqueCategories = Array.from(new Set(destinations.map(d => d.category))).sort();
  
  // Build category buttons with emojis
  const categoryButtons = [
    { emoji: '🌍', label: 'All', value: '' },
    ...uniqueCategories.map(cat => ({
      emoji: categoryMap[cat]?.emoji || '✨',
      label: categoryMap[cat]?.label || cat,
      value: cat
    }))
  ];

  // Filter destinations by category
  const filteredDestinations = selectedCategory
    ? destinations.filter(d => d.category === selectedCategory)
    : destinations;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button 
              onClick={() => setLocation("/cities")} 
              className="text-xs font-bold uppercase text-black/60 dark:text-white/60 hover:opacity-60 transition-opacity"
            >
              ← CITIES
            </button>
          </div>

          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight mb-4 text-black dark:text-white">
              {capitalizeCity(citySlug)}
            </h1>
            <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
              {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'}
            </p>
          </div>

          {/* Category Filter - Matching Home page emoji pill design */}
          {uniqueCategories.length > 0 && (
            <div className="mb-8">
              <div className="mb-3">
                <h2 className="text-xs font-bold uppercase text-black dark:text-white">Categories</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryButtons.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-opacity ${
                      selectedCategory === cat.value
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:opacity-60'
                    }`}
                  >
                    <span className="mr-1.5">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Destinations Grid - Matching Home page grid */}
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40">
                No destinations found.
              </p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="mt-4 text-xs font-bold uppercase text-black dark:text-white hover:opacity-60 transition-opacity"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
              {filteredDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.slug}
                  destination={destination}
                  colorIndex={index}
                  onClick={() => handleCardClick(destination)}
                  isSaved={savedPlaces.includes(destination.slug)}
                  isVisited={visitedPlaces.includes(destination.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />

      {/* Destination Drawer */}
      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

