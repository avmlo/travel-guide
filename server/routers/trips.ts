import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { trips, itineraryItems, type Trip, type ItineraryItem } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const tripsRouter = router({
  // Get all trips for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userTrips = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, ctx.user.id))
      .orderBy(desc(trips.createdAt));

    return userTrips;
  }),

  // Get a single trip with all itinerary items
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [trip] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, input.id), eq(trips.userId, ctx.user.id)))
        .limit(1);

      if (!trip) {
        throw new Error("Trip not found");
      }

      const items = await db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.tripId, input.id))
        .orderBy(itineraryItems.day, itineraryItems.orderIndex);

      return {
        trip,
        items,
      };
    }),

  // Create a new trip
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        destination: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        coverImage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();

      const [newTrip] = await db.insert(trips).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        destination: input.destination,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        coverImage: input.coverImage,
        status: "planning",
        isPublic: 0,
        createdAt: now,
        updatedAt: now,
      });

      return newTrip;
    }),

  // Update a trip
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        destination: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["planning", "upcoming", "ongoing", "completed"]).optional(),
        isPublic: z.boolean().optional(),
        coverImage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      // Verify ownership
      const [trip] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, id), eq(trips.userId, ctx.user.id)))
        .limit(1);

      if (!trip) {
        throw new Error("Trip not found");
      }

      await db.update(trips)
        .set({
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          isPublic: updateData.isPublic !== undefined ? (updateData.isPublic ? 1 : 0) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(trips.id, id));

      return { success: true };
    }),

  // Delete a trip
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const [trip] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, input.id), eq(trips.userId, ctx.user.id)))
        .limit(1);

      if (!trip) {
        throw new Error("Trip not found");
      }

      // Delete all itinerary items first
      await db.delete(itineraryItems).where(eq(itineraryItems.tripId, input.id));

      // Delete the trip
      await db.delete(trips).where(eq(trips.id, input.id));

      return { success: true };
    }),

  // Add an itinerary item
  addItem: protectedProcedure
    .input(
      z.object({
        tripId: z.number(),
        destinationSlug: z.string().optional(),
        day: z.number().min(1),
        orderIndex: z.number().min(0),
        time: z.string().optional(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify trip ownership
      const [trip] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, input.tripId), eq(trips.userId, ctx.user.id)))
        .limit(1);

      if (!trip) {
        throw new Error("Trip not found");
      }

      const [newItem] = await db.insert(itineraryItems).values({
        tripId: input.tripId,
        destinationSlug: input.destinationSlug,
        day: input.day,
        orderIndex: input.orderIndex,
        time: input.time,
        title: input.title,
        description: input.description,
        notes: input.notes,
        createdAt: new Date(),
      });

      return newItem;
    }),

  // Update an itinerary item
  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        destinationSlug: z.string().optional(),
        day: z.number().min(1).optional(),
        orderIndex: z.number().min(0).optional(),
        time: z.string().optional(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      // Verify ownership through trip
      const [item] = await db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.id, id))
        .limit(1);

      if (!item) {
        throw new Error("Itinerary item not found");
      }

      const [trip] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, item.tripId), eq(trips.userId, ctx.user.id)))
        .limit(1);

      if (!trip) {
        throw new Error("Unauthorized");
      }

      await db.update(itineraryItems)
        .set(updateData)
        .where(eq(itineraryItems.id, id));

      return { success: true };
    }),

  // Delete an itinerary item
  deleteItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership through trip
      const [item] = await db
        .select()
        .from(itineraryItems)
        .where(eq(itineraryItems.id, input.id))
        .limit(1);

      if (!item) {
        throw new Error("Itinerary item not found");
      }

      const [trip] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, item.tripId), eq(trips.userId, ctx.user.id)))
        .limit(1);

      if (!trip) {
        throw new Error("Unauthorized");
      }

      await db.delete(itineraryItems).where(eq(itineraryItems.id, input.id));

      return { success: true };
    }),

  // Create trip from AI-generated itinerary
  createFromAI: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        destination: z.string(),
        days: z.array(
          z.object({
            day: z.number(),
            title: z.string(),
            activities: z.array(
              z.object({
                time: z.string(),
                activity: z.string(),
                destination: z.string(),
                destinationSlug: z.string().optional(),
                description: z.string(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();

      // Create the trip
      const [newTrip] = await db.insert(trips).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        destination: input.destination,
        status: "planning",
        isPublic: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Create itinerary items
      for (const day of input.days) {
        for (let i = 0; i < day.activities.length; i++) {
          const activity = day.activities[i];
          await db.insert(itineraryItems).values({
            tripId: newTrip.insertId as number,
            destinationSlug: activity.destinationSlug,
            day: day.day,
            orderIndex: i,
            time: activity.time,
            title: activity.activity || activity.destination,
            description: activity.description,
            createdAt: now,
          });
        }
      }

      return { tripId: newTrip.insertId };
    }),
});
