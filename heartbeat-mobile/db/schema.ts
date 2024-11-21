import { int, sqliteTable } from "drizzle-orm/sqlite-core";

export const historicalHeartbeats = sqliteTable("historical_heartbeats", {
  timestamp: int().notNull(),
  value: int().notNull(),
});
