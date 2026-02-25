import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cities = pgTable(
  "cities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    country: varchar("country", { length: 10 }).notNull(),
    lat: decimal("lat", { precision: 9, scale: 6 }),
    lon: decimal("lon", { precision: 9, scale: 6 }),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    notes: text("notes"), // for City Notes feature
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserCity: unique().on(table.userId, table.name, table.country),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
