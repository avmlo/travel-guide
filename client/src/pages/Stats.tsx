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
  Lock,
  Map,
  Footprints,
  Zap,
  Share2,
  Settings,
  ChevronRight,
  ArrowUp
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-8">
            Please sign in to view your stats.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Menu</h1>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* Profile Section */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-3xl font-bold border-2 border-gray-700">
            {getUserInitials()}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{getUserName()}</h2>
            <p className="text-gray-400 text-lg">
              #{stats?.worldwide_rank?.toLocaleString() || '2029940'} Worldwide Rank
            </p>
          </div>
        </div>

        {/* Check-in Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-400">Check-in stats</h3>
            <button
              onClick={handleShareStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share Stats
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Level */}
            <StatsCard
              icon={stats?.level === 1 ? <Lock className="h-6 w-6" /> : <BarChart3 className="h-6 w-6" />}
              value={stats?.level || 1}
              label="Level"
              locked={stats?.level === 1}
            />

            {/* Points */}
            <StatsCard
              icon={<Star className="h-6 w-6" />}
              value={stats?.points || 0}
              label="Points"
            />

            {/* Cities */}
            <StatsCard
              icon={<Building2 className="h-6 w-6" />}
              value={stats?.cities_count || 1}
              label="Cities"
            />

            {/* Countries */}
            <StatsCard
              icon={<Globe className="h-6 w-6" />}
              value={stats?.countries_count || 1}
              label="Countries"
            />

            {/* Places */}
            <StatsCard
              icon={<MapPin className="h-6 w-6" />}
              value={stats?.places_count || 0}
              label="Places"
            />

            {/* Mayorships */}
            <StatsCard
              icon={<Crown className="h-6 w-6" />}
              value={stats?.mayorships_count || 0}
              label="Mayorships"
            />
          </div>
        </div>

        {/* Map Clearing Stats */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-400 mb-4">Map clearing stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* World Explored */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">
                  {stats?.world_explored_percentage?.toFixed(8) || '0.00000832'}%
                </span>
                <Map className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-gray-400">World Explored</p>
            </div>

            {/* Miles Explored */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">
                  {stats?.miles_explored?.toFixed(1) || '16.4'} mi
                </span>
                <Footprints className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-gray-400">Miles Explored</p>
            </div>
          </div>
        </div>

        {/* Premium Section */}
        {!stats?.is_premium && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 relative overflow-hidden">
            {/* Decorative background icons */}
            <div className="absolute inset-0 opacity-10">
              <Globe className="absolute top-4 right-4 h-16 w-16 text-blue-500" />
              <MapPin className="absolute bottom-8 left-8 h-12 w-12 text-purple-500" />
              <Star className="absolute top-1/2 right-1/4 h-10 w-10 text-yellow-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold">Superboost+</h3>
              </div>
              
              <p className="text-gray-300 mb-6 text-lg">
                Upgrade to the latest AI models, boost your worldwide rank, and more!
              </p>

              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-medium text-lg flex items-center justify-center gap-2 transition-all hover:scale-105">
                Learn more
                <ArrowUp className="h-5 w-5 rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, value, label, locked = false }: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  locked?: boolean;
}) {
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 transition-all hover:border-gray-700 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-3xl font-bold ${locked ? 'text-purple-400' : ''}`}>
          {value}
        </span>
        <div className={locked ? 'text-purple-400' : 'text-gray-500'}>
          {icon}
        </div>
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

