import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  photoURL: text("photo_url"),
  role: text("role").default("user").notNull(),
  notifyOnComment: boolean("notify_on_comment").default(false).notNull(),
  notifyOnNewReview: boolean("notify_on_new_review").default(false).notNull(),
  notifyOnCategoryApproval: boolean("notify_on_category_approval").default(false).notNull(),
  notifyOnNewsletter: boolean("notify_on_newsletter").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: jsonb("address").notNull(),
  location: jsonb("location"),
  photoUrl: text("photo_url"), 
  isValidated: boolean("is_validated").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const restaurantOwners = pgTable("restaurant_owners", {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.restaurantId] }),
    }
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdBy: text("created_by").notNull(), // 'admin' or user id
  status: text("status").default("pending").notNull(), // 'approved' | 'pending'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  text: text("text").notNull(),
  photos: jsonb("photos").default([]), // array of photo URLs
  visitDate: timestamp("visit_date").notNull(),
  ratings: jsonb("ratings").notNull(), // { standard: { "Comida": 4, "Atendimento": 5 }, custom: { "Custo-benefício": 5 } }
  overallRating: real("overall_rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  createdAt: true,
  isValidated: true,
}).extend({
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    fullAddress: z.string(),
  }),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertReviewSchema = createInsertSchema(reviews, {
    visitDate: z.coerce.date(), 
}).omit({
  id: true,
  createdAt: true,
}).extend({
  ratings: z.object({
      standard: z.record(z.string(), z.number().min(1).max(5)),
      custom: z.record(z.string(), z.number().min(1).max(5)).optional(),
  }),
  photos: z.array(z.string()).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export const usersRelations = relations(users, ({ many }) => ({
	reviews: many(reviews),
  comments: many(comments), 
  ownedRestaurants: many(restaurantOwners),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
	reviews: many(reviews),
  owners: many(restaurantOwners),
}));

export const restaurantOwnersRelations = relations(restaurantOwners, ({ one }) => ({
  user: one(users, { fields: [restaurantOwners.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [restaurantOwners.restaurantId], references: [restaurants.id] }),
}));


export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [reviews.restaurantId], references: [restaurants.id] }),
  comments: many(comments),
}));

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscription: jsonb("subscription").notNull(), // Armazena o objeto de inscrição
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const updateRestaurantSchema = createInsertSchema(restaurants, {
  name: z.string().min(1, "O nome é obrigatório"),
  address: z.any(), // A validação do endereço é complexa, deixamos como 'any' por enquanto
  photoUrl: z.string().url("URL da foto inválida").optional().nullable(),
}).pick({ name: true, address: true, photoUrl: true });