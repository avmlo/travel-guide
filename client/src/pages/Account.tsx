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

interface VisitedPlace {
  id: number;
  destination_id: number;
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
      
      // Load visited places
      await loadVisitedPlaces(session.user.id);
      
      setLoading(false);
    }

    loadUser();
  }, [setLocation]);

  const loadVisitedPlaces = async (userId: string) => {
    const { data, error } = await supabase
      .from('visited_places')
      .select(`
        *,
        destination:destinations(name, city, category, image)
      `)
      .eq('user_id', userId)
      .order('visited_date', { ascending: false });

    if (!error && data) {
      setVisitedPlaces(data as any);
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
        data: { name, bio }
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation cities={[]} />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{name || "Traveler"}</h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {email}
                  </p>
                  {bio && <p className="text-gray-600 mt-2 max-w-2xl">{bio}</p>}
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.placesVisited}</div>
                  <div className="text-sm text-gray-500">Places Visited</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.citiesVisited}</div>
                  <div className="text-sm text-gray-500">Cities Explored</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.averageRating}</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.countriesVisited}</div>
                  <div className="text-sm text-gray-500">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="visited" className="space-y-6">
            <TabsList className="bg-white border border-gray-200">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                      <div key={vp.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {vp.destination.image && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={vp.destination.image} 
                              alt={vp.destination.name}
                              className="w-full h-full object-cover"
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Saved Places Tab */}
            <TabsContent value="saved">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">Saved for Later</h2>
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved places</h3>
                  <p className="text-gray-500">
                    Save places you want to visit in the future
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                
                <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-6">
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
    </div>
  );
}

