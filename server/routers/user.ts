import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { savedPlaces, userPreferences, userActivity } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const userRouter = router({
  // Get saved places for current user
  getSavedPlaces: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const places = await db
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.userId, ctx.user.id))
      .orderBy(desc(savedPlaces.savedAt));

    return places;
  }),

  // Save a destination
  savePlace: protectedProcedure
    .input(
      z.object({
        destinationSlug: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already saved
      const existing = await db
        .select()
        .from(savedPlaces)
        .where(
          and(
            eq(savedPlaces.userId, ctx.user.id),
            eq(savedPlaces.destinationSlug, input.destinationSlug)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, message: "Already saved" };
      }

      await db.insert(savedPlaces).values({
        userId: ctx.user.id,
        destinationSlug: input.destinationSlug,
        savedAt: new Date(),
        notes: input.notes || null,
      });

      // Log activity
      await db.insert(userActivity).values({
        userId: ctx.user.id,
        destinationSlug: input.destinationSlug,
        action: "save",
        timestamp: new Date(),
      });

      return { success: true, message: "Place saved" };
    }),

  // Unsave a destination
  unsavePlace: protectedProcedure
    .input(
      z.object({
        destinationSlug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(savedPlaces)
        .where(
          and(
            eq(savedPlaces.userId, ctx.user.id),
            eq(savedPlaces.destinationSlug, input.destinationSlug)
          )
        );

      // Log activity
      await db.insert(userActivity).values({
        userId: ctx.user.id,
        destinationSlug: input.destinationSlug,
        action: "unsave",
        timestamp: new Date(),
      });

      return { success: true, message: "Place removed" };
    }),

  // Get user preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ctx.user.id))
      .limit(1);

    if (prefs.length === 0) {
      return {
        favoriteCategories: [],
        favoriteCities: [],
        interests: [],
      };
    }

    const pref = prefs[0];

    // Helper function to safely parse JSON with fallback
    const safeJsonParse = (jsonString: string | null): string[] => {
      if (!jsonString) return [];
      try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn("[User Router] Failed to parse JSON:", error);
        return [];
      }
    };

    return {
      favoriteCategories: safeJsonParse(pref.favoriteCategories),
      favoriteCities: safeJsonParse(pref.favoriteCities),
      interests: safeJsonParse(pref.interests),
    };
  }),

  // Update user preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        favoriteCategories: z.array(z.string()).optional(),
        favoriteCities: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, ctx.user.id))
        .limit(1);

      const data = {
        userId: ctx.user.id,
        favoriteCategories: input.favoriteCategories
          ? JSON.stringify(input.favoriteCategories)
          : null,
        favoriteCities: input.favoriteCities
          ? JSON.stringify(input.favoriteCities)
          : null,
        interests: input.interests ? JSON.stringify(input.interests) : null,
        updatedAt: new Date(),
      };

      if (existing.length === 0) {
        await db.insert(userPreferences).values(data);
      } else {
        await db
          .update(userPreferences)
          .set(data)
          .where(eq(userPreferences.userId, ctx.user.id));
      }

      return { success: true };
    }),

  // Log user activity (for AI personalization)
  logActivity: protectedProcedure
    .input(
      z.object({
        destinationSlug: z.string(),
        action: z.enum(["view", "search"]),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(userActivity).values({
        userId: ctx.user.id,
        destinationSlug: input.destinationSlug,
        action: input.action,
        timestamp: new Date(),
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });

      return { success: true };
    }),

  // Get personalized recommendations based on user activity
  getPersonalizedRecommendations: protectedProcedure
    .input(
      z.object({
        destinations: z.array(z.any()),
        limit: z.number().default(10),
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

      // Get user's recent activity
      const activity = await db
        .select()
        .from(userActivity)
        .where(eq(userActivity.userId, ctx.user.id))
        .orderBy(desc(userActivity.timestamp));

      const recentActivity = activity.slice(0, 50);

      // Get user preferences
      const prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, ctx.user.id))
        .limit(1);

      const savedSlugs = new Set(saved.map((s) => s.destinationSlug));
      const viewedSlugs = new Set(
        activity.filter((a) => a.action === "view").map((a) => a.destinationSlug)
      );

      let favoriteCategories: string[] = [];
      let favoriteCities: string[] = [];

      // Helper function to safely parse JSON with fallback
      const safeJsonParse = (jsonString: string | null): string[] => {
        if (!jsonString) return [];
        try {
          const parsed = JSON.parse(jsonString);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.warn("[User Router] Failed to parse JSON:", error);
          return [];
        }
      };

      if (prefs.length > 0) {
        favoriteCategories = safeJsonParse(prefs[0].favoriteCategories);
        favoriteCities = safeJsonParse(prefs[0].favoriteCities);
      }

      // Score destinations based on user preferences
      const scored = input.destinations
        .filter((d: any) => !savedSlugs.has(d.slug) && !viewedSlugs.has(d.slug))
        .map((d: any) => {
          let score = 0;

          // Boost if matches favorite categories
          if (favoriteCategories.includes(d.category)) {
            score += 10;
          }

          // Boost if matches favorite cities
          if (favoriteCities.includes(d.city)) {
            score += 10;
          }

          // Boost if similar to saved places
          const savedInSameCity = saved.filter((s) => {
            const dest = input.destinations.find(
              (dd: any) => dd.slug === s.destinationSlug
            );
            return dest && dest.city === d.city;
          });
          score += savedInSameCity.length * 5;

          // Boost if has high rating
          if (d.rating) {
            score += parseFloat(d.rating) || 0;
          }

          return { ...d, score };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, input.limit);

      return scored;
    }),
});

