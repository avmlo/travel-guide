import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Heart, MapPin, Star, List, User } from "lucide-react";
import { useLocation } from "wouter";

interface Activity {
  id: string;
  user_id: string;
  type: string;
  destination_slug: string | null;
  list_id: string | null;
  review_id: string | null;
  content: string | null;
  created_at: string;
  user_profiles: {
    username: string;
    display_name: string;
    profile_photo: string;
  };
  destinations?: {
    name: string;
    slug: string;
  };
  lists?: {
    name: string;
  };
  reviews?: {
    rating: number;
  };
}

interface ActivityFeedProps {
  userId?: string; // If provided, show only this user's activities
  followingOnly?: boolean; // If true, show only activities from followed users
  limit?: number;
}

export function ActivityFeed({ userId, followingOnly = false, limit = 20 }: ActivityFeedProps) {
  const supabase = getSupabaseClient();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchActivities();
  }, [userId, followingOnly, limit]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            profile_photo
          ),
          destinations (
            name,
            slug
          ),
          lists (
            name
          ),
          reviews (
            rating
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (followingOnly) {
        // Get current user's following list
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: following } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

          if (following && following.length > 0) {
            const followingIds = following.map(f => f.following_id);
            query = query.in('user_id', followingIds);
          } else {
            // No following, return empty
            setActivities([]);
            setLoading(false);
            return;
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'saved':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'visited':
        return <MapPin className="h-5 w-5 text-green-500" />;
      case 'reviewed':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'created_list':
        return <List className="h-5 w-5 text-blue-500" />;
      case 'followed':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const displayName = activity.user_profiles?.display_name || activity.user_profiles?.username || 'Someone';
    
    switch (activity.type) {
      case 'saved':
        return (
          <>
            <span className="font-semibold">{displayName}</span> saved{' '}
            {activity.destinations && (
              <button
                onClick={() => setLocation(`/destination/${activity.destinations?.slug}`)}
                className="font-semibold hover:underline"
              >
                {activity.destinations.name}
              </button>
            )}
          </>
        );
      case 'visited':
        return (
          <>
            <span className="font-semibold">{displayName}</span> visited{' '}
            {activity.destinations && (
              <button
                onClick={() => setLocation(`/destination/${activity.destinations?.slug}`)}
                className="font-semibold hover:underline"
              >
                {activity.destinations.name}
              </button>
            )}
          </>
        );
      case 'reviewed':
        return (
          <>
            <span className="font-semibold">{displayName}</span> reviewed{' '}
            {activity.destinations && (
              <button
                onClick={() => setLocation(`/destination/${activity.destinations?.slug}`)}
                className="font-semibold hover:underline"
              >
                {activity.destinations.name}
              </button>
            )}
            {activity.reviews && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{activity.reviews.rating}</span>
              </span>
            )}
          </>
        );
      case 'created_list':
        return (
          <>
            <span className="font-semibold">{displayName}</span> created a list{' '}
            {activity.lists && (
              <span className="font-semibold">"{activity.lists.name}"</span>
            )}
          </>
        );
      case 'followed':
        return (
          <>
            <span className="font-semibold">{displayName}</span> started following someone
          </>
        );
      default:
        return (
          <>
            <span className="font-semibold">{displayName}</span> {activity.content || 'did something'}
          </>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          {followingOnly
            ? "No recent activity from people you follow"
            : "No activity yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {activity.user_profiles?.profile_photo ? (
                <img
                  src={activity.user_profiles.profile_photo}
                  alt={activity.user_profiles.display_name || activity.user_profiles.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {(activity.user_profiles?.display_name || activity.user_profiles?.username || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

