import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { TrendingUp, Award, MapPin, Star, Users } from "lucide-react";

interface TrendingDestination {
  slug: string;
  name: string;
  city: string;
  category: string;
  main_image: string;
  save_count: number;
  visit_count: number;
  review_count: number;
  avg_rating: number;
}

interface TopUser {
  user_id: string;
  username: string;
  display_name: string;
  profile_photo: string;
  count: number;
}

export default function Explore() {
  const [, setLocation] = useLocation();
  const [trendingDestinations, setTrendingDestinations] = useState<TrendingDestination[]>([]);
  const [topReviewers, setTopReviewers] = useState<TopUser[]>([]);
  const [topTravelers, setTopTravelers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'reviewers' | 'travelers'>('trending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchTrendingDestinations(),
        fetchTopReviewers(),
        fetchTopTravelers()
      ]);
    } catch (error) {
      console.error("Error fetching explore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingDestinations = async () => {
    try {
      // Get destinations with most activity in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch saved counts
      const { data: savedData } = await supabase
        .from('saved_destinations')
        .select('destination_slug')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Fetch visited counts
      const { data: visitedData } = await supabase
        .from('visited_destinations')
        .select('destination_slug')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Fetch review counts and ratings
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('destination_slug, rating')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Count occurrences
      const counts: Record<string, { saves: number; visits: number; reviews: number; totalRating: number }> = {};

      savedData?.forEach(item => {
        if (!counts[item.destination_slug]) {
          counts[item.destination_slug] = { saves: 0, visits: 0, reviews: 0, totalRating: 0 };
        }
        counts[item.destination_slug].saves++;
      });

      visitedData?.forEach(item => {
        if (!counts[item.destination_slug]) {
          counts[item.destination_slug] = { saves: 0, visits: 0, reviews: 0, totalRating: 0 };
        }
        counts[item.destination_slug].visits++;
      });

      reviewData?.forEach(item => {
        if (!counts[item.destination_slug]) {
          counts[item.destination_slug] = { saves: 0, visits: 0, reviews: 0, totalRating: 0 };
        }
        counts[item.destination_slug].reviews++;
        counts[item.destination_slug].totalRating += item.rating;
      });

      // Get top 20 destinations by activity score
      const topSlugs = Object.entries(counts)
        .map(([slug, data]) => ({
          slug,
          score: data.saves * 1 + data.visits * 2 + data.reviews * 3,
          ...data
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(item => item.slug);

      if (topSlugs.length === 0) {
        setTrendingDestinations([]);
        return;
      }

      // Fetch destination details
      const { data: destinations } = await supabase
        .from('destinations')
        .select('slug, name, city, category, main_image')
        .in('slug', topSlugs);

      if (destinations) {
        const enriched = destinations.map(dest => ({
          ...dest,
          save_count: counts[dest.slug]?.saves || 0,
          visit_count: counts[dest.slug]?.visits || 0,
          review_count: counts[dest.slug]?.reviews || 0,
          avg_rating: counts[dest.slug]?.reviews > 0
            ? Math.round((counts[dest.slug].totalRating / counts[dest.slug].reviews) * 10) / 10
            : 0
        }));

        // Sort by score
        enriched.sort((a, b) => {
          const scoreA = a.save_count * 1 + a.visit_count * 2 + a.review_count * 3;
          const scoreB = b.save_count * 1 + b.visit_count * 2 + b.review_count * 3;
          return scoreB - scoreA;
        });

        setTrendingDestinations(enriched);
      }
    } catch (error) {
      console.error("Error fetching trending destinations:", error);
    }
  };

  const fetchTopReviewers = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          user_id,
          user_profiles (
            username,
            display_name,
            profile_photo
          )
        `);

      if (data) {
        // Count reviews per user
        const counts: Record<string, { count: number; profile: any }> = {};
        data.forEach(review => {
          if (!counts[review.user_id]) {
            counts[review.user_id] = {
              count: 0,
              profile: review.user_profiles
            };
          }
          counts[review.user_id].count++;
        });

        // Sort and get top 10
        const top = Object.entries(counts)
          .map(([userId, data]) => ({
            user_id: userId,
            username: data.profile?.username || 'unknown',
            display_name: data.profile?.display_name || data.profile?.username || 'Unknown',
            profile_photo: data.profile?.profile_photo || '',
            count: data.count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopReviewers(top);
      }
    } catch (error) {
      console.error("Error fetching top reviewers:", error);
    }
  };

  const fetchTopTravelers = async () => {
    try {
      const { data } = await supabase
        .from('visited_destinations')
        .select(`
          user_id,
          user_profiles (
            username,
            display_name,
            profile_photo
          )
        `);

      if (data) {
        // Count visits per user
        const counts: Record<string, { count: number; profile: any }> = {};
        data.forEach(visit => {
          if (!counts[visit.user_id]) {
            counts[visit.user_id] = {
              count: 0,
              profile: visit.user_profiles
            };
          }
          counts[visit.user_id].count++;
        });

        // Sort and get top 10
        const top = Object.entries(counts)
          .map(([userId, data]) => ({
            user_id: userId,
            username: data.profile?.username || 'unknown',
            display_name: data.profile?.display_name || data.profile?.username || 'Unknown',
            profile_photo: data.profile?.profile_photo || '',
            count: data.count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopTravelers(top);
      }
    } catch (error) {
      console.error("Error fetching top travelers:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Explore</h1>
          <p className="text-gray-600">
            Discover trending destinations and top contributors
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'trending'
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Trending Destinations
            {activeTab === 'trending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviewers')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'reviewers'
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star className="h-4 w-4" />
            Top Reviewers
            {activeTab === 'reviewers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('travelers')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'travelers'
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Top Travelers
            {activeTab === 'travelers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'trending' && (
          <div>
            {trendingDestinations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No trending destinations yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingDestinations.map((dest, index) => (
                  <button
                    key={dest.slug}
                    onClick={() => setLocation(`/destination/${dest.slug}`)}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all text-left"
                  >
                    {/* Rank Badge */}
                    <div className="relative">
                      <img
                        src={dest.main_image}
                        alt={dest.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:underline">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {dest.city} • {dest.category}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {dest.save_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {dest.save_count} saved
                          </span>
                        )}
                        {dest.visit_count > 0 && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {dest.visit_count} visited
                          </span>
                        )}
                        {dest.review_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {dest.avg_rating} ({dest.review_count})
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviewers' && (
          <div>
            {topReviewers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviewers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topReviewers.map((user, index) => (
                  <button
                    key={user.user_id}
                    onClick={() => setLocation(`/user/${user.username}`)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {index < 3 ? (
                        <Award className={`h-8 w-8 mx-auto ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.profile_photo ? (
                          <img
                            src={user.profile_photo}
                            alt={user.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">
                            {user.display_name[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="font-semibold">{user.display_name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>

                    {/* Count */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold">{user.count}</div>
                      <div className="text-xs text-gray-500">reviews</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'travelers' && (
          <div>
            {topTravelers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No travelers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topTravelers.map((user, index) => (
                  <button
                    key={user.user_id}
                    onClick={() => setLocation(`/user/${user.username}`)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {index < 3 ? (
                        <Award className={`h-8 w-8 mx-auto ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.profile_photo ? (
                          <img
                            src={user.profile_photo}
                            alt={user.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-600">
                            {user.display_name[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="font-semibold">{user.display_name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>

                    {/* Count */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold">{user.count}</div>
                      <div className="text-xs text-gray-500">places visited</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}

