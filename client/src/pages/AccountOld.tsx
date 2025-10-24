import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MapPin, Heart, CheckCircle2 } from "lucide-react";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface SavedPlace {
  destination_slug: string;
  destination: {
    name: string;
    city: string;
    category: string;
    image: string;
  };
}

interface VisitedPlace {
  destination_slug: string;
  visited_date: string;
  rating: number;
  notes: string;
  destination: {
    name: string;
    city: string;
    category: string;
    image: string;
  } | null;
}

export default function Account() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'visited'>('saved');

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

  const handleCardClick = (destinationSlug: string) => {
    const dest = allDestinations.find(d => d.slug === destinationSlug);
    if (dest) {
      setSelectedDestination(dest);
      setIsDrawerOpen(true);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLocation("/auth/login");
        return;
      }

      setUser(session.user);

      // Load saved places
      const { data: savedData } = await supabase
        .from('saved_destinations')
        .select('destination_slug')
        .eq('user_id', session.user.id);

      if (savedData) {
        // Fetch destination details
        const slugs = savedData.map(item => item.destination_slug);
        if (slugs.length > 0) {
          const { data: destData } = await supabase
            .from('destinations')
            .select('slug, name, city, category, image')
            .in('slug', slugs);
          
          if (destData) {
            setSavedPlaces(destData.map((dest: any) => ({
              destination_slug: dest.slug,
              destination: {
                name: dest.name,
                city: dest.city,
                category: dest.category,
                image: dest.image
              }
            })));
          }
        }
      }

      // Load visited places
      const { data: visitedData } = await supabase
        .from('visited_destinations')
        .select('destination_slug, visited_date, rating, notes')
        .eq('user_id', session.user.id)
        .order('visited_date', { ascending: false });

      if (visitedData) {
        // Fetch destination details
        const slugs = visitedData.map(item => item.destination_slug);
        if (slugs.length > 0) {
          const { data: destData } = await supabase
            .from('destinations')
            .select('slug, name, city, category, image')
            .in('slug', slugs);
          
          if (destData) {
            setVisitedPlaces(visitedData.map((item: any) => {
              const dest = destData.find((d: any) => d.slug === item.destination_slug);
              return {
                destination_slug: item.destination_slug,
                visited_date: item.visited_date,
                rating: item.rating,
                notes: item.notes,
                destination: dest ? {
                  name: dest.name,
                  city: dest.city,
                  category: dest.category,
                  image: dest.image
                } : null
              };
            }).filter(item => item.destination !== null));
          }
        }
      }

      setLoading(false);
    }

    loadUser();
  }, [setLocation]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  const uniqueCities = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
  ]);

  const uniqueCountries = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
  ].map(city => {
    // Simple country mapping for major cities
    const cityCountryMap: Record<string, string> = {
      'tokyo': 'Japan', 'kyoto': 'Japan', 'osaka': 'Japan',
      'paris': 'France', 'lyon': 'France',
      'london': 'United Kingdom',
      'new-york': 'United States', 'los-angeles': 'United States',
      'barcelona': 'Spain', 'madrid': 'Spain',
      'rome': 'Italy', 'milan': 'Italy',
    };
    return cityCountryMap[city] || 'Other';
  }));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          
          {/* Profile Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-normal mb-2">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'Traveler'}</h1>
            <p className="text-base text-gray-600">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12 pb-12 border-b border-gray-200">
            <div>
              <div className="text-3xl font-normal mb-1">{visitedPlaces.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Places Visited</div>
            </div>
            <div>
              <div className="text-3xl font-normal mb-1">{savedPlaces.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Saved</div>
            </div>
            <div>
              <div className="text-3xl font-normal mb-1">{uniqueCities.size}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Cities</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('saved')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === 'saved' 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Saved ({savedPlaces.length})
              </button>
              <button
                onClick={() => setActiveTab('visited')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === 'visited' 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Visited ({visitedPlaces.length})
              </button>
            </div>
          </div>

          {/* Content Grid */}
          {activeTab === 'saved' && (
            <>
              {savedPlaces.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No saved places yet</p>
                  <button 
                    onClick={() => setLocation('/')}
                    className="mt-4 text-sm font-bold uppercase hover:opacity-60 transition-opacity"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {savedPlaces.map((place) => (
                    <button
                      key={place.destination_slug}
                      onClick={() => handleCardClick(place.destination_slug)}
                      className="group text-left"
                    >
                      <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
                        {place.destination.image && (
                          <img
                            src={place.destination.image}
                            alt={place.destination.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{place.destination.name}</h3>
                      <p className="text-xs text-gray-600">{capitalizeCity(place.destination.city)}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'visited' && (
            <>
              {visitedPlaces.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No visited places yet</p>
                  <button 
                    onClick={() => setLocation('/')}
                    className="mt-4 text-sm font-bold uppercase hover:opacity-60 transition-opacity"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {visitedPlaces.map((place) => (
                    place.destination && (
                      <button
                        key={place.destination_slug}
                        onClick={() => handleCardClick(place.destination_slug)}
                        className="group text-left"
                      >
                        <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
                          {place.destination.image && (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          {place.visited_date && (
                            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs">
                              {new Date(place.visited_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{place.destination.name}</h3>
                        <p className="text-xs text-gray-600">{capitalizeCity(place.destination.city)}</p>
                        {place.rating > 0 && (
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < place.rating ? 'text-black' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  ))}
                </div>
              )}
            </>
          )}
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

