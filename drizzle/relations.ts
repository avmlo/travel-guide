import { relations } from "drizzle-orm";
import {
  users,
  savedPlaces,
  visitedPlaces,
  userPreferences,
  userActivity,
  trips,
  itineraryItems,
} from "./schema";

/**
 * User relations
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  savedPlaces: many(savedPlaces),
  visitedPlaces: many(visitedPlaces),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  activity: many(userActivity),
  trips: many(trips),
}));

/**
 * Saved places relations
 */
export const savedPlacesRelations = relations(savedPlaces, ({ one }) => ({
  user: one(users, {
    fields: [savedPlaces.userId],
    references: [users.id],
  }),
}));

/**
 * Visited places relations
 */
export const visitedPlacesRelations = relations(visitedPlaces, ({ one }) => ({
  user: one(users, {
    fields: [visitedPlaces.userId],
    references: [users.id],
  }),
}));

/**
 * User preferences relations
 */
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

/**
 * User activity relations
 */
export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id],
  }),
}));

/**
 * Trips relations
 */
export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  itineraryItems: many(itineraryItems),
}));

/**
 * Itinerary items relations
 */
export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
}));
