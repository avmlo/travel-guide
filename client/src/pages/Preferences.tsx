import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User } from "@/types/user";
import { MapPin, Globe, Star, Calendar } from "lucide-react";

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

export default function Preferences() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
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
    const countries = new Set(visitedPlaces.map(vp => {
      // Extract country from city (simplified - you'd want a proper mapping)
      return vp.destination.city;
    }));
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation cities={[]} />

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Name</Label>
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
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              </div>

              {/* Travel Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Travel Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-2xl font-bold">{stats.placesVisited}</div>
                      <div className="text-xs text-gray-500">Places Visited</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-2xl font-bold">{stats.citiesVisited}</div>
                      <div className="text-xs text-gray-500">Cities Explored</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-2xl font-bold">{stats.averageRating}</div>
                      <div className="text-xs text-gray-500">Average Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visited Places */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Visited Places</h2>
                
                {visitedPlaces.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No visited places yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Mark places as visited from destination pages
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visitedPlaces.map((vp) => (
                      <div key={vp.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {vp.destination.image && (
                          <img 
                            src={vp.destination.image} 
                            alt={vp.destination.name}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-1">{vp.destination.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{vp.destination.city}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {vp.visited_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(vp.visited_date).toLocaleDateString()}
                              </div>
                            )}
                            {vp.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {vp.rating}/5
                              </div>
                            )}
                          </div>
                          
                          {vp.notes && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{vp.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

