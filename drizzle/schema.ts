import { mysqlTable, varchar, int, timestamp, text, datetime, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  createdAt: datetime("created_at"),
  lastSignedIn: datetime("last_signed_in"),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const savedPlaces = mysqlTable("saved_places", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  destinationSlug: varchar("destination_slug", { length: 255 }).notNull(),
  savedAt: timestamp("saved_at").notNull(),
  notes: text("notes"),
}, (table) => ({
  userIdIdx: index("saved_places_user_id_idx").on(table.userId),
  destinationSlugIdx: index("saved_places_destination_slug_idx").on(table.destinationSlug),
  userDestinationIdx: index("saved_places_user_destination_idx").on(table.userId, table.destinationSlug),
}));

export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  favoriteCategories: text("favorite_categories"), // JSON array
  favoriteCities: text("favorite_cities"), // JSON array
  interests: text("interests"), // JSON array
  updatedAt: timestamp("updated_at").notNull(),
});

export const userActivity = mysqlTable("user_activity", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  destinationSlug: varchar("destination_slug", { length: 255 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // 'view', 'search', 'save', 'unsave'
  timestamp: timestamp("timestamp").notNull(),
  metadata: text("metadata"), // JSON for additional context
}, (table) => ({
  userIdIdx: index("user_activity_user_id_idx").on(table.userId),
  timestampIdx: index("user_activity_timestamp_idx").on(table.timestamp),
  userTimestampIdx: index("user_activity_user_timestamp_idx").on(table.userId, table.timestamp),
}));

// Destination statistics for trending/discovery feed
export const destinationStats = mysqlTable("destination_stats", {
  destinationSlug: varchar("destination_slug", { length: 255 }).primaryKey(),
  viewCount: int("view_count").notNull().default(0),
  saveCount: int("save_count").notNull().default(0),
  trendingScore: int("trending_score").notNull().default(0), // Algorithm-calculated score
  lastViewed: timestamp("last_viewed"),
  lastSaved: timestamp("last_saved"),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => ({
  trendingScoreIdx: index("destination_stats_trending_score_idx").on(table.trendingScore),
  viewCountIdx: index("destination_stats_view_count_idx").on(table.viewCount),
}));

// User feed preferences and algorithm tuning
export const userFeedPreferences = mysqlTable("user_feed_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  showTrending: int("show_trending").notNull().default(1), // boolean as tinyint
  showSimilar: int("show_similar").notNull().default(1),
  showHiddenGems: int("show_hidden_gems").notNull().default(1),
  showNewDestinations: int("show_new_destinations").notNull().default(1),
  preferredRegions: text("preferred_regions"), // JSON array of regions
  excludedCategories: text("excluded_categories"), // JSON array
  updatedAt: timestamp("updated_at").notNull(),
});

