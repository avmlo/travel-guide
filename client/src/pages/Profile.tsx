import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Users, 
  Heart, 
  CheckCircle2,
  Star,
  Settings,
  UserPlus,
  UserMinus
} from "lucide-react";
import { toast } from "sonner";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  location?: string;
  profile_photo?: string;
  cover_image?: string;
  website?: string;
  is_public: boolean;
  travel_style?: string[];
  created_at: string;
}

interface ProfileStats {
  destinations_saved: number;
  destinations_visited: number;
  cities_count: number;
  countries_count: number;
  reviews_count: number;
  lists_count: number;
  followers_count: number;
  following_count: number;
}

export default function Profile() {
  const params = useParams<{ username: string }>();
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'visited' | 'reviews' | 'lists'>('saved');
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [visitedDestinations, setVisitedDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.user_id;

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (!params.username) return;

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', params.username)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        setLocation('/404');
        return;
      }

      // Check if profile is public or if it's the user's own profile
      if (!profileData.is_public && (!currentUser || currentUser.id !== profileData.user_id)) {
        toast.error("This profile is private");
        setLocation('/');
        return;
      }

      setProfile(profileData);

      // Fetch stats
      await fetchStats(profileData.user_id);

      // Check if current user is following this profile
      if (currentUser && currentUser.id !== profileData.user_id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileData.user_id)
          .single();

        setIsFollowing(!!followData);
      }

      setLoading(false);
    }

    fetchProfile();
  }, [params.username, currentUser, setLocation]);

  async function fetchStats(userId: string) {
    // This is a simplified version - you'll need to implement proper counting
    // For now, using placeholder data
    setStats({
      destinations_saved: 0,
      destinations_visited: 0,
      cities_count: 0,
      countries_count: 0,
      reviews_count: 0,
      lists_count: 0,
      followers_count: 0,
      following_count: 0
    });
  }

  async function handleFollow() {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }

    if (!profile) return;

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.user_id);

      if (error) {
        toast.error("Failed to unfollow");
      } else {
        setIsFollowing(false);
        toast.success("Unfollowed");
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: profile.user_id
        });

      if (error) {
        toast.error("Failed to follow");
      } else {
        setIsFollowing(true);
        toast.success("Following!");
      }
    }
  }

  const travelStyleBadges: Record<string, { label: string; color: string }> = {
    foodie: { label: '🍽️ Foodie', color: 'bg-red-100 text-red-800' },
    luxury: { label: '✨ Luxury Traveler', color: 'bg-purple-100 text-purple-800' },
    culture: { label: '🎨 Culture Seeker', color: 'bg-blue-100 text-blue-800' },
    adventure: { label: '🏔️ Adventurer', color: 'bg-green-100 text-green-800' },
    budget: { label: '💰 Budget Traveler', color: 'bg-yellow-100 text-yellow-800' },
    solo: { label: '🎒 Solo Traveler', color: 'bg-indigo-100 text-indigo-800' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading profile...</div>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Cover Image */}
      <div className="w-full h-64 bg-gray-100 relative">
        {profile.cover_image ? (
          <img
            src={profile.cover_image}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 -mt-20 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.display_name || profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-normal mb-1">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <button
                    onClick={() => setLocation('/account')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 transition-colors text-sm ${
                      isFollowing
                        ? 'border border-gray-300 hover:border-black'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Follow Stats */}
            <div className="flex gap-6 text-sm mb-4">
              <div>
                <span className="font-semibold">{stats?.following_count || 0}</span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
              <div>
                <span className="font-semibold">{stats?.followers_count || 0}</span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
            </div>

            {/* Travel Style Badges */}
            {profile.travel_style && profile.travel_style.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.travel_style.map((style) => {
                  const badge = travelStyleBadges[style];
                  if (!badge) return null;
                  return (
                    <span
                      key={style}
                      className={`px-3 py-1 text-xs ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-12">
          <div className="border border-gray-200 p-6 text-center">
            <div className="text-3xl font-normal mb-2">{stats?.destinations_saved || 0}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Saved</div>
          </div>
          <div className="border border-gray-200 p-6 text-center">
            <div className="text-3xl font-normal mb-2">{stats?.destinations_visited || 0}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Visited</div>
          </div>
          <div className="border border-gray-200 p-6 text-center">
            <div className="text-3xl font-normal mb-2">{stats?.cities_count || 0}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Cities</div>
          </div>
          <div className="border border-gray-200 p-6 text-center">
            <div className="text-3xl font-normal mb-2">{stats?.reviews_count || 0}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Reviews</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === 'saved'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Saved ({stats?.destinations_saved || 0})
            </button>
            <button
              onClick={() => setActiveTab('visited')}
              className={`pb-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === 'visited'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Visited ({stats?.destinations_visited || 0})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Reviews ({stats?.reviews_count || 0})
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`pb-4 text-sm uppercase tracking-wider transition-colors ${
                activeTab === 'lists'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Lists ({stats?.lists_count || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-24">
          {activeTab === 'saved' && (
            <div className="text-center py-12 text-gray-400">
              No saved destinations yet
            </div>
          )}
          {activeTab === 'visited' && (
            <div className="text-center py-12 text-gray-400">
              No visited destinations yet
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="text-center py-12 text-gray-400">
              No reviews yet
            </div>
          )}
          {activeTab === 'lists' && (
            <div className="text-center py-12 text-gray-400">
              No lists yet
            </div>
          )}
        </div>
      </div>

      <SimpleFooter />

      {/* Destination Drawer */}
      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedDestination(null);
          }}
        />
      )}
    </div>
  );
}

