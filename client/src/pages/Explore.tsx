import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { TrendingUp, Award, MapPin, Star, Users } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { PageHero } from "@/components/layout/PageHero";
import { SiteShell } from "@/components/layout/SiteShell";
import { ContentSection } from "@/components/layout/ContentSection";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-slate-400">Loading...</div>
      </div>
    );
  }

  const featuredDestination = useMemo(() => trendingDestinations[0], [trendingDestinations]);

  const hero = (
    <PageHero
      eyebrow="Community pulse"
      title="See what's trending across the Urban Manual community"
      description="Track the destinations everyone is bookmarking, the voices shaping reviews, and the travelers logging the most journeys right now."
      actions={
        <>
          <Button
            onClick={() => setLocation("/account")}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm transition hover:bg-emerald-700"
          >
            Personalize feed
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="rounded-full border-emerald-500/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-200"
          >
            Browse atlas
          </Button>
        </>
      }
      stats={[
        { label: "Trending spots", value: `${trendingDestinations.length}`, hint: "Past 30 days" },
        { label: "Top reviewers", value: `${topReviewers.length}`, hint: "Active voices" },
        { label: "Top travelers", value: `${topTravelers.length}`, hint: "Journeys logged" },
      ]}
      media={
        featuredDestination && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-emerald-500/20 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">
                <TrendingUp className="h-3.5 w-3.5" /> Spotlight
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{featuredDestination.name}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <MapPin className="h-4 w-4" /> {featuredDestination.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-emerald-600/80 dark:border-emerald-400/20 dark:text-emerald-200">
                  <Users className="h-3.5 w-3.5" /> {featuredDestination.visit_count} visits
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-emerald-600/80 dark:border-emerald-400/20 dark:text-emerald-200">
                  <Star className="h-3.5 w-3.5" /> {featuredDestination.avg_rating.toFixed(1)} avg
                </span>
              </div>
            </div>
          </div>
        )
      }
    />
  );

  const renderTrending = () => (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {trendingDestinations.map((destination) => (
        <button
          key={destination.slug}
          onClick={() => setLocation(`/destination/${destination.slug}`)}
          className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-500/15 bg-white/80 text-left shadow-sm transition hover:border-emerald-500/40 hover:shadow-[0_12px_40px_rgba(16,112,87,0.15)] dark:border-emerald-400/20 dark:bg-slate-950/70"
        >
          <div className="aspect-[4/3] overflow-hidden bg-emerald-100/60 dark:bg-emerald-900/40">
            {destination.main_image && (
              <img
                src={destination.main_image}
                alt={destination.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
              <TrendingUp className="h-4 w-4" /> Momentum
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{destination.name}</h3>
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <MapPin className="h-4 w-4" /> {destination.city}
            </p>
            <div className="mt-auto grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="rounded-2xl border border-emerald-500/15 bg-white/70 p-2 text-center dark:border-emerald-400/20 dark:bg-slate-950/60">
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{destination.save_count}</div>
                <div className="uppercase tracking-[0.3em]">Saves</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-white/70 p-2 text-center dark:border-emerald-400/20 dark:bg-slate-950/60">
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{destination.visit_count}</div>
                <div className="uppercase tracking-[0.3em]">Visits</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-white/70 p-2 text-center dark:border-emerald-400/20 dark:bg-slate-950/60">
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{destination.review_count}</div>
                <div className="uppercase tracking-[0.3em]">Reviews</div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderUsers = (users: TopUser[], emptyMessage: string) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.length === 0 ? (
        <div className="col-span-full rounded-3xl border border-dashed border-emerald-500/20 bg-white/80 px-6 py-14 text-center text-sm text-slate-500 dark:border-emerald-400/20 dark:bg-slate-950/70 dark:text-slate-300">
          {emptyMessage}
        </div>
      ) : (
        users.map((user) => (
          <button
            key={user.user_id}
            onClick={() => setLocation(`/user/${user.username || user.user_id}`)}
            className="flex items-center gap-4 rounded-3xl border border-emerald-500/15 bg-white/80 p-4 text-left shadow-sm transition hover:border-emerald-500/40 dark:border-emerald-400/20 dark:bg-slate-950/70"
          >
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100/60 text-lg font-semibold text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200">
              {user.profile_photo ? <img src={user.profile_photo} alt={user.display_name} className="h-full w-full object-cover" /> : user.display_name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.display_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">@{user.username}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-emerald-200">
              {user.count}
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <SiteShell hero={hero} background="canvas">
      <div className="space-y-16">
        <ContentSection
          tone="muted"
          title="Explore signals"
          description="Switch between destinations that are heating up and the community members driving the conversation."
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: "trending", label: "Trending destinations" },
              { key: "reviewers", label: "Top reviewers" },
              { key: "travelers", label: "Top travelers" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  activeTab === tab.key
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-500/20 text-emerald-700 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:text-emerald-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {activeTab === "trending" && renderTrending()}
            {activeTab === "reviewers" && renderUsers(topReviewers, "No reviewers have logged activity recently.")}
            {activeTab === "travelers" && renderUsers(topTravelers, "No recent travel logs yet. Be the first to share.")}
          </div>
        </ContentSection>
      </div>
    </SiteShell>
  );
}
