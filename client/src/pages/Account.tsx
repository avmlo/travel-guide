import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MapPin, Heart, CheckCircle2, Settings, User, Mail, Lock, Trash2 } from "lucide-react";
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
  visited_at: string;
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
  const [activeTab, setActiveTab] = useState<'saved' | 'visited' | 'settings'>('saved');
  
  // Settings state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
          lat: d.lat || 0,
          long: d.long || 0,
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
      setEmail(session.user.email || "");
      setDisplayName(session.user.user_metadata?.display_name || "");

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
        .select('destination_slug, visited_at')
        .eq('user_id', session.user.id)
        .order('visited_at', { ascending: false });

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
                visited_at: item.visited_at,
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

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">Loading...</div>
      </div>
    );
  }

  const uniqueCities = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight mb-4 text-black dark:text-white">
              Account
            </h1>
            <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
              {user?.email}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
              <div className="text-[clamp(24px,4vw,36px)] font-bold text-black dark:text-white mb-2">
                {savedPlaces.length}
              </div>
              <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                Saved Places
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
              <div className="text-[clamp(24px,4vw,36px)] font-bold text-black dark:text-white mb-2">
                {visitedPlaces.length}
              </div>
              <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                Visited Places
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
              <div className="text-[clamp(24px,4vw,36px)] font-bold text-black dark:text-white mb-2">
                {uniqueCities.size}
              </div>
              <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                Cities Explored
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
              <div className="text-[clamp(24px,4vw,36px)] font-bold text-black dark:text-white mb-2">
                {((visitedPlaces.length / allDestinations.length) * 100).toFixed(1)}%
              </div>
              <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                Completion
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-opacity ${
                  activeTab === 'saved'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:opacity-60'
                }`}
              >
                <Heart className="inline-block w-3 h-3 mr-1.5" />
                Saved ({savedPlaces.length})
              </button>
              <button
                onClick={() => setActiveTab('visited')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-opacity ${
                  activeTab === 'visited'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:opacity-60'
                }`}
              >
                <CheckCircle2 className="inline-block w-3 h-3 mr-1.5" />
                Visited ({visitedPlaces.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-opacity ${
                  activeTab === 'settings'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:opacity-60'
                }`}
              >
                <Settings className="inline-block w-3 h-3 mr-1.5" />
                Settings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'saved' && (
            <div>
              {savedPlaces.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-black/20 dark:text-white/20" />
                  <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40 mb-4">
                    No saved places yet
                  </p>
                  <button
                    onClick={() => setLocation("/")}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-black text-white dark:bg-white dark:text-black hover:opacity-60 transition-opacity"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                  {savedPlaces.map((place, index) => (
                    <button
                      key={place.destination_slug}
                      onClick={() => handleCardClick(place.destination_slug)}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden rounded-lg mb-3 bg-gray-100 dark:bg-gray-900">
                        <img
                          src={place.destination.image}
                          alt={place.destination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60 mb-1">
                          {capitalizeCity(place.destination.city)}
                        </p>
                        <h3 className="text-sm font-bold text-black dark:text-white group-hover:opacity-60 transition-opacity">
                          {place.destination.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'visited' && (
            <div>
              {visitedPlaces.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-black/20 dark:text-white/20" />
                  <p className="text-xs font-bold uppercase text-black/40 dark:text-white/40 mb-4">
                    No visited places yet
                  </p>
                  <button
                    onClick={() => setLocation("/")}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-black text-white dark:bg-white dark:text-black hover:opacity-60 transition-opacity"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                  {visitedPlaces.map((place, index) => (
                    place.destination && (
                      <button
                        key={place.destination_slug}
                        onClick={() => handleCardClick(place.destination_slug)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square overflow-hidden rounded-lg mb-3 bg-gray-100 dark:bg-gray-900 relative">
                          <img
                            src={place.destination.image}
                            alt={place.destination.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold">
                            ✓
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60 mb-1">
                            {capitalizeCity(place.destination.city)}
                          </p>
                          <h3 className="text-sm font-bold text-black dark:text-white group-hover:opacity-60 transition-opacity mb-1">
                            {place.destination.name}
                          </h3>
                          <p className="text-xs text-black/40 dark:text-white/40">
                            {new Date(place.visited_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              {/* Profile Settings */}
              <div className="mb-12">
                <h2 className="text-sm font-bold uppercase text-black dark:text-white mb-6">
                  Profile Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-black/60 dark:text-white/60 mb-2">
                      <User className="inline-block w-3 h-3 mr-1.5" />
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-black/60 dark:text-white/60 mb-2">
                      <Mail className="inline-block w-3 h-3 mr-1.5" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-gray-50 dark:bg-gray-900/50 text-black/60 dark:text-white/60"
                    />
                    <p className="text-xs text-black/40 dark:text-white/40 mt-2">
                      Email cannot be changed
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 rounded-lg text-xs font-bold uppercase bg-black text-white dark:bg-white dark:text-black hover:opacity-60 transition-opacity disabled:opacity-40"
                  >
                    {isUpdatingProfile ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
                <h2 className="text-sm font-bold uppercase text-red-600 dark:text-red-400 mb-6">
                  Danger Zone
                </h2>
                <div className="border border-red-200 dark:border-red-900/30 rounded-lg p-6">
                  <h3 className="text-sm font-bold text-black dark:text-white mb-2">
                    Delete Account
                  </h3>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => toast.error("Account deletion is not yet implemented")}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="inline-block w-3 h-3 mr-1.5" />
                    Delete Account
                  </button>
                </div>
              </div>
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

