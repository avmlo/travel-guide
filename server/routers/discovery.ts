import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  destinationStats,
  savedPlaces,
  userActivity,
  userFeedPreferences
} from "../../drizzle/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { safeJsonParse, safeJsonStringify } from "../_core/utils";
import { DestinationSchema } from "@shared/schemas";

interface ScoredDestination {
  slug: string;
  score: number;
  reason: string;
}

/**
 * Calculate trending score based on recent activity
 * Formula: (views * 1) + (saves * 5) + time decay
 */
function calculateTrendingScore(viewCount: number, saveCount: number, lastActivity: Date): number {
  const now = Date.now();
  const daysSinceActivity = (now - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

  // Time decay: lose 10% per day
  const timeDecay = Math.pow(0.9, daysSinceActivity);

  // Base score
  const baseScore = (viewCount * 1) + (saveCount * 5);

  return Math.floor(baseScore * timeDecay);
}

/**
 * Score destinations based on user preferences and activity
 */
function scoreDestinationsForUser(
  destinations: any[],
  savedSlugs: string[],
  viewedSlugs: string[],
  favoriteCategories: string[],
  favoriteCities: string[]
): ScoredDestination[] {
  const scored = destinations.map(dest => {
    let score = 0;
    let reasons: string[] = [];

    // Boost if in favorite categories
    if (favoriteCategories.includes(dest.category)) {
      score += 15;
      reasons.push(`You like ${dest.category}s`);
    }

    // Boost if in favorite cities
    if (favoriteCities.includes(dest.city)) {
      score += 12;
      reasons.push(`You love ${dest.city}`);
    }

    // Boost if similar to saved places (same city or category)
    const similarSaved = savedSlugs.filter(slug => {
      const saved = destinations.find(d => d.slug === slug);
      return saved && (saved.city === dest.city || saved.category === dest.category);
    });
    if (similarSaved.length > 0) {
      score += similarSaved.length * 8;
      reasons.push('Similar to your saved places');
    }

    // Penalty if already viewed recently
    if (viewedSlugs.includes(dest.slug)) {
      score -= 20;
    }

    // Bonus for highly rated
    if (dest.michelinStars && dest.michelinStars > 0) {
      score += dest.michelinStars * 3;
      reasons.push(`${dest.michelinStars} Michelin star${dest.michelinStars > 1 ? 's' : ''}`);
    }

    if (dest.crown) {
      score += 10;
      reasons.push('Highly acclaimed');
    }

    return {
      slug: dest.slug,
      score,
      reason: reasons.length > 0 ? reasons[0] : 'Recommended for you'
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export const discoveryRouter = router({
  // Get personalized discovery feed
  getFeed: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        feedType: z.enum(['for-you', 'trending', 'hidden-gems', 'new']).default('for-you'),
        allDestinations: z.array(DestinationSchema),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user's saved places
      const saved = await db
        .select()
        .from(savedPlaces)
        .where(eq(savedPlaces.userId, ctx.user.id));

      // Get user's recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentActivity = await db
        .select()
        .from(userActivity)
        .where(
          and(
            eq(userActivity.userId, ctx.user.id),
            sql`${userActivity.timestamp} > ${thirtyDaysAgo}`
          )
        )
        .orderBy(desc(userActivity.timestamp));

      // Get user preferences
      const prefs = await db
        .select()
        .from(userFeedPreferences)
        .where(eq(userFeedPreferences.userId, ctx.user.id))
        .limit(1);

      const savedSlugs = saved.map(s => s.destinationSlug);
      const viewedSlugs = recentActivity
        .filter(a => a.action === 'view')
        .map(a => a.destinationSlug);

      // Extract user preferences
      let favoriteCategories: string[] = [];
      let favoriteCities: string[] = [];

      if (prefs.length > 0) {
        favoriteCategories = safeJsonParse<string[]>(prefs[0].preferredRegions, []);
        favoriteCities = safeJsonParse<string[]>(prefs[0].excludedCategories, []);
      }

      // Infer preferences from saved places if not set
      if (favoriteCategories.length === 0 && saved.length > 0) {
        const savedDestinations = input.allDestinations.filter(d =>
          savedSlugs.includes(d.slug)
        );
        const categoryCount: Record<string, number> = {};
        savedDestinations.forEach(d => {
          categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
        });
        favoriteCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat);
      }

      if (favoriteCities.length === 0 && saved.length > 0) {
        const savedDestinations = input.allDestinations.filter(d =>
          savedSlugs.includes(d.slug)
        );
        const cityCount: Record<string, number> = {};
        savedDestinations.forEach(d => {
          cityCount[d.city] = (cityCount[d.city] || 0) + 1;
        });
        favoriteCities = Object.entries(cityCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([city]) => city);
      }

      // Filter out already saved and recently viewed
      let availableDestinations = input.allDestinations.filter(
        d => !savedSlugs.includes(d.slug)
      );

      let feedItems: any[] = [];

      switch (input.feedType) {
        case 'for-you':
          // Personalized recommendations
          const scored = scoreDestinationsForUser(
            availableDestinations,
            savedSlugs,
            viewedSlugs,
            favoriteCategories,
            favoriteCities
          );

          feedItems = scored
            .slice(input.offset, input.offset + input.limit)
            .map(item => ({
              ...input.allDestinations.find(d => d.slug === item.slug),
              feedReason: item.reason,
              feedScore: item.score
            }));
          break;

        case 'trending':
          // Get destination stats and sort by trending score
          const stats = await db
            .select()
            .from(destinationStats)
            .orderBy(desc(destinationStats.trendingScore))
            .limit(input.limit * 2); // Get more to filter

          const trendingSlugs = stats.map(s => s.destinationSlug);
          feedItems = availableDestinations
            .filter(d => trendingSlugs.includes(d.slug))
            .slice(input.offset, input.offset + input.limit)
            .map(d => ({
              ...d,
              feedReason: 'Trending now',
              feedScore: stats.find(s => s.destinationSlug === d.slug)?.trendingScore || 0
            }));
          break;

        case 'hidden-gems':
          // Low save count but high rating
          const allStats = await db
            .select()
            .from(destinationStats);

          const hiddenGems = availableDestinations
            .map(d => {
              const stat = allStats.find(s => s.destinationSlug === d.slug);
              const saveCount = stat?.saveCount || 0;
              const score = (d.michelinStars || 0) * 10 + (d.crown ? 15 : 0) - saveCount;
              return { ...d, feedScore: score, feedReason: 'Hidden gem' };
            })
            .filter(d => d.feedScore > 5)
            .sort((a, b) => b.feedScore - a.feedScore)
            .slice(input.offset, input.offset + input.limit);

          feedItems = hiddenGems;
          break;

        case 'new':
          // Recently added (for now, just random sample)
          feedItems = availableDestinations
            .sort(() => Math.random() - 0.5)
            .slice(input.offset, input.offset + input.limit)
            .map(d => ({
              ...d,
              feedReason: 'New addition',
              feedScore: 0
            }));
          break;
      }

      return {
        items: feedItems,
        hasMore: input.offset + input.limit < availableDestinations.length,
        metadata: {
          inferredCategories: favoriteCategories,
          inferredCities: favoriteCities,
          totalAvailable: availableDestinations.length
        }
      };
    }),

  // Update destination stats (called when user views/saves)
  updateStats: publicProcedure
    .input(
      z.object({
        destinationSlug: z.string(),
        action: z.enum(['view', 'save']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();

      // Check if stats exist
      const existing = await db
        .select()
        .from(destinationStats)
        .where(eq(destinationStats.destinationSlug, input.destinationSlug))
        .limit(1);

      if (existing.length === 0) {
        // Create new stats
        await db.insert(destinationStats).values({
          destinationSlug: input.destinationSlug,
          viewCount: input.action === 'view' ? 1 : 0,
          saveCount: input.action === 'save' ? 1 : 0,
          trendingScore: input.action === 'view' ? 1 : 5,
          lastViewed: input.action === 'view' ? now : null,
          lastSaved: input.action === 'save' ? now : null,
          updatedAt: now,
        });
      } else {
        // Update existing stats
        const stat = existing[0];
        const newViewCount = input.action === 'view' ? stat.viewCount + 1 : stat.viewCount;
        const newSaveCount = input.action === 'save' ? stat.saveCount + 1 : stat.saveCount;
        const lastActivity = input.action === 'view'
          ? now
          : (stat.lastViewed || now);

        const newTrendingScore = calculateTrendingScore(
          newViewCount,
          newSaveCount,
          lastActivity
        );

        await db
          .update(destinationStats)
          .set({
            viewCount: newViewCount,
            saveCount: newSaveCount,
            trendingScore: newTrendingScore,
            lastViewed: input.action === 'view' ? now : stat.lastViewed,
            lastSaved: input.action === 'save' ? now : stat.lastSaved,
            updatedAt: now,
          })
          .where(eq(destinationStats.destinationSlug, input.destinationSlug));
      }

      return { success: true };
    }),

  // Get trending destinations (public endpoint)
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        allDestinations: z.array(DestinationSchema),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const stats = await db
        .select()
        .from(destinationStats)
        .orderBy(desc(destinationStats.trendingScore))
        .limit(input.limit);

      const trendingSlugs = stats.map(s => s.destinationSlug);
      const trending = input.allDestinations
        .filter(d => trendingSlugs.includes(d.slug))
        .map(d => ({
          ...d,
          trendingScore: stats.find(s => s.destinationSlug === d.slug)?.trendingScore || 0,
          viewCount: stats.find(s => s.destinationSlug === d.slug)?.viewCount || 0,
          saveCount: stats.find(s => s.destinationSlug === d.slug)?.saveCount || 0,
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore);

      return trending;
    }),
});
