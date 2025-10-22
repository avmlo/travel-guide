import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MapPin, Globe, Star, Calendar, User, Heart, Settings, LogOut, Mail } from "lucide-react";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Breadcrumbs, getAccountBreadcrumbs } from "@/components/Breadcrumbs";
import { Destination } from "@/types/destination";

interface VisitedPlace {
  id: number;
  destination_id: number;
  destination_slug: string;
  visited_date: string;
  notes: string;
  rating: number;
  destination: {
    name: string;
    city: string;
    category: string;
    image: string;
  };
}

export default function Account() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [uploading, setUploading] = useState(false);

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
      setEmail(session.user.email || "");
      setName(session.user.user_metadata?.name || "");
      setBio(session.user.user_metadata?.bio || "");
      setProfilePicture(session.user.user_metadata?.profile_picture || "");
      
      // Load visited places
      await loadVisitedPlaces(session.user.id);
      
      // Load saved places
      await loadSavedPlaces(session.user.id);
      
      setLoading(false);
    }

    loadUser();
  }, [setLocation]);

  const loadVisitedPlaces = async (userId: string) => {
    const { data, error } = await supabase
      .from('visited_places')
      .select(`
        *,
        destination:destinations(name, city, category, image, slug)
      `)
      .eq('user_id', userId)
      .order('visited_date', { ascending: false });

    if (!error && data) {
      setVisitedPlaces(data as any);
    }
  };

  const loadSavedPlaces = async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_places')
      .select(`
        *,
        destination:destinations(name, city, category, image, slug, michelin_stars)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedPlaces(data as any);
    }
  };

  const stats = useMemo(() => {
    const cities = new Set(visitedPlaces.map(vp => vp.destination.city));
    const countries = new Set(visitedPlaces.map(vp => vp.destination.city));
    
    return {
      placesVisited: visitedPlaces.length,
      citiesVisited: cities.size,
      countriesVisited: countries.size,
      averageRating: visitedPlaces.length > 0 
        ? (visitedPlaces.reduce((sum, vp) => sum + (vp.rating || 0), 0) / visitedPlaces.length).toFixed(1)
        : 0
    };
  }, [visitedPlaces]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name, bio, profile_picture: profilePicture }
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setProfilePicture(publicUrl);

      // Update user metadata
      await supabase.auth.updateUser({
        data: { profile_picture: publicUrl }
      });

      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="px-4 py-6 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
          >
            The Urban Manual
          </button>
          <button 
            onClick={handleSignOut}
            className="text-xs font-bold uppercase hover:opacity-60 transition-opacity px-4 py-2 border border-black"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="px-4 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setLocation("/")} className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Catalogue</button>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Info</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Archive</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Editorial</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase">New York</span>
            <span className="text-xs font-bold">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-12">
        <div className="max-w-[1920px] mx-auto px-4">
          
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt={name || "Profile"}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 text-3xl font-bold">
                      {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{name || "Traveler"}</h1>
                  <p className="text-gray-500 flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    {email}
                  </p>
                  {bio && <p className="text-gray-600 mt-2 max-w-2xl">{bio}</p>}
                </div>
              </div>

            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: '#E8D5B7' }}>
                  <MapPin className="h-10 w-10 p-2 text-gray-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.placesVisited}</div>
                  <div className="text-xs text-gray-500">Places Visited</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: '#B8D8E8' }}>
                  <Globe className="h-10 w-10 p-2 text-gray-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.citiesVisited}</div>
                  <div className="text-xs text-gray-500">Cities Explored</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100">
                  <Heart className="h-10 w-10 p-2 text-pink-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.countriesVisited}</div>
                  <div className="text-xs text-gray-500">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="visited" className="space-y-4">
            <TabsList className="bg-white border-b border-gray-200">
              <TabsTrigger value="visited" className="gap-2">
                <MapPin className="h-4 w-4" />
                Visited Places
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <Heart className="h-4 w-4" />
                Saved Places
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Visited Places Tab */}
            <TabsContent value="visited">
              <div className="border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">My Travel Journey</h2>
                
                {visitedPlaces.length === 0 ? (
                  <div className="text-center py-16">
                    <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No places visited yet</h3>
                    <p className="text-gray-500">
                      Start exploring and mark places you've visited!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visitedPlaces.map((vp) => (
                      <button 
                        key={vp.id} 
                        onClick={() => handleCardClick(vp.destination_slug)}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left w-full">
                        {vp.destination.image && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={vp.destination.image} 
                              alt={`${vp.destination.name} - Visited place`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg line-clamp-1 mb-1">{vp.destination.name}</h3>
                          <p className="text-sm text-gray-500 capitalize mb-3">{vp.destination.city}</p>
                          
                          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                            {vp.visited_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(vp.visited_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>
                            )}
                            {vp.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {vp.rating}/5
                              </div>
                            )}
                          </div>
                          
                          {vp.notes && (
                            <p className="text-sm text-gray-600 line-clamp-2 italic">"{vp.notes}"</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Saved Places Tab */}
            <TabsContent value="saved">
              <div className="border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">Saved for Later</h2>
                
                {savedPlaces.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved places</h3>
                    <p className="text-gray-500">
                      Save places you want to visit in the future
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPlaces.map((sp) => (
                      <button 
                        key={sp.id} 
                        onClick={() => handleCardClick(sp.destination_slug)}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left w-full group"
                      >
                        {sp.destination.image && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={sp.destination.image} 
                              alt={`${sp.destination.name} - Saved place`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            {sp.destination.michelin_stars > 0 && (
                              <div className="absolute top-2 left-2 flex gap-0.5">
                                {[...Array(sp.destination.michelin_stars)].map((_, i) => (
                                  <img 
                                    key={i}
                                    src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                                    alt={`Michelin Star ${i + 1}`}
                                    className="h-5 w-5"
                                    loading="lazy"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg line-clamp-1 mb-1">{sp.destination.name}</h3>
                          <p className="text-sm text-gray-500 capitalize mb-2">
                            {sp.destination.city} • {sp.destination.category}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                            <span>Saved {new Date(sp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                
                <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-6">
                  {/* Profile Picture Upload */}
                  <div>
                    <Label>Profile Picture</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt="Profile picture preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
                          {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <Input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          disabled={uploading}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploading ? "Uploading..." : "Upload a profile picture (JPG, PNG, max 5MB)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself and your travel style..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" size="lg">
                    Save Changes
                  </Button>
                </form>

                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>User ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user?.id}</code></p>
                    <p><strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      
      {/* Destination Drawer */}
      <DestinationDrawer
        destination={selectedDestination}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

