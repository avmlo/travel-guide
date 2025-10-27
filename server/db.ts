import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from './_core/logger';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

/**
 * Gets or creates a MySQL connection pool
 * Connection pooling improves performance by reusing connections
 */
function getPool() {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      logger.info("Database connection pool created");
    } catch (error) {
      logger.error({ err: error }, "Failed to create database pool");
      _pool = null;
    }
  }
  return _pool;
}

/**
 * Lazily create the drizzle instance with connection pooling
 * This allows local tooling to run without a DB
 */
export async function getDb() {
  if (!_db) {
    const pool = getPool();
    if (!pool) {
      logger.warn("Database pool not available");
      return null;
    }

    try {
      _db = drizzle(pool) as ReturnType<typeof drizzle>;
    } catch (error) {
      logger.warn({ err: error }, "Database connection failed");
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    logger.warn({ userId: user.id }, "Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    logger.error({ err: error, userId: user.id }, "Failed to upsert user");
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    logger.warn({ userId: id }, "Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
