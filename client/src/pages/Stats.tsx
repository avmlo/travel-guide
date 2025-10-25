import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserStats } from "@/types/userStats";
import { 
  BarChart3, 
  Star, 
  Building2, 
  Globe, 
  MapPin, 
  Crown,
  Map,
  Footprints,
  Share2
} from "lucide-react";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { toast } from "sonner";

export default function Stats() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Load or create user stats
      let { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!userStats) {
        // Create initial stats
        const { data: newStats, error } = await supabase
          .from('user_stats')
          .insert([{ user_id: session.user.id }])
          .select()
          .single();

        if (error) throw error;
        userStats = newStats;
      }

      setStats(userStats);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user stats');
    } finally {
      setLoading(false);
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const handleShareStats = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Travel Stats',
        text: `I'm level ${stats?.level} with ${stats?.points} points! Check out my travel stats.`,
        url: window.location.href,
      });
    } else {
      toast.success('Share link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-[1920px] mx-auto px-6 md:px-10 py-20 text-center">
          <h1 className="text-2xl font-bold uppercase mb-4 dark:text-white">Sign In Required</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mb-8">
            Please sign in to view your stats.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold uppercase hover:opacity-60 transition-opacity"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight mb-2">
              Your Stats
            </h1>
            <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
              Track your travel journey
            </p>
          </div>

          {/* Profile Section */}
          <div className="mb-12 pb-12 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl font-bold border border-gray-200 dark:border-gray-700">
                {getUserInitials()}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{getUserName()}</h2>
                <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                  #{stats?.worldwide_rank?.toLocaleString() || '2029940'} Worldwide Rank
                </p>
              </div>
              <button
                onClick={handleShareStats}
                className="ml-auto px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold uppercase hover:opacity-60 transition-opacity flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Stats
              </button>
            </div>
          </div>

          {/* Check-in Stats */}
          <div className="mb-12">
            <h2 className="text-xs font-bold uppercase mb-6">Check-in Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: BarChart3, label: 'Level', value: stats?.level || 0, locked: stats?.level === 0 },
                { icon: Star, label: 'Points', value: stats?.points || 0, locked: false },
                { icon: Building2, label: 'Cities', value: stats?.cities_visited || 0, locked: false },
                { icon: Globe, label: 'Countries', value: stats?.countries_visited || 0, locked: false },
                { icon: MapPin, label: 'Places', value: stats?.places_visited || 0, locked: false },
                { icon: Crown, label: 'Mayorships', value: stats?.mayorships || 0, locked: false },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="h-5 w-5 text-black/60 dark:text-white/60" />
                    {stat.locked && <span className="text-xs">🔒</span>}
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Clearing Stats */}
          <div className="mb-12">
            <h2 className="text-xs font-bold uppercase mb-6">Map Clearing Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <Map className="h-5 w-5 text-black/60 dark:text-white/60" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {stats?.world_explored_percentage?.toFixed(8) || '0.00000000'}%
                </div>
                <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                  World Explored
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <Footprints className="h-5 w-5 text-black/60 dark:text-white/60" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {stats?.miles_explored?.toFixed(1) || '0.0'} mi
                </div>
                <div className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
                  Miles Explored
                </div>
              </div>
            </div>
          </div>

          {/* Premium Section */}
          <div className="border border-gray-200 dark:border-gray-800 p-8 rounded-lg">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">Premium Features</h2>
              <p className="text-sm text-black/60 dark:text-white/60 mb-6">
                Upgrade to unlock advanced travel tracking, detailed analytics, and exclusive features.
              </p>
              <button className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold uppercase hover:opacity-60 transition-opacity">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}

