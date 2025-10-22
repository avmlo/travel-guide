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

