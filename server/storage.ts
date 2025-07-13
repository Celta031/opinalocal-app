import { users, restaurants, categories, reviews, comments, pushSubscriptions, restaurantOwners, type User, type InsertUser, type Restaurant, type InsertRestaurant, type Category, type InsertCategory, type Review, type InsertReview, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and, or, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Restaurants
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurants(validated?: boolean): Promise<Restaurant[]>;
  searchRestaurants(query: string, validated?: boolean): Promise<any[]>; 
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  validateRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByOwner(userId: number): Promise<Restaurant[]>;
  updateRestaurant(restaurantId: number, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  isUserOwner(userId: number, restaurantId: number): Promise<boolean>;
  
  // Categories
  getCategories(status?: string): Promise<Category[]>;
  searchCategories(query: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategoryStatus(id: number, status: string): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByRestaurant(restaurantId: number): Promise<any[]>;
  getReviewsByUser(userId: number): Promise<any[]>;
  getRecentReviews(limit?: number): Promise<any[]>;
  getAllReviewsWithDetails(timeframe?: string): Promise<any[]>;
  createReview(review: InsertReview): Promise<Review>;
  getUsersWhoReviewedRestaurant(restaurantId: number): Promise<User[]>;
  getReviewWithAuthor(reviewId: number): Promise<{ review: Review, user: User } | undefined>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByReview(reviewId: number): Promise<any[]>;
  deleteComment(commentId: number): Promise<void>;

  // Push Notifications
  savePushSubscription(userId: number, subscription: object): Promise<void>;
  getPushSubscriptions(userId: number): Promise<any[]>;
}

// A classe MemStorage não é mais usada ativamente. As funções lançam um erro para indicar que não devem ser usadas.
export class MemStorage implements IStorage {
    async getUser(id: number): Promise<User | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getUserByEmail(email: string): Promise<User | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async createUser(user: InsertUser): Promise<User> { throw new Error("MemStorage: Method not implemented."); }
    async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getRestaurant(id: number): Promise<Restaurant | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getRestaurants(validated?: boolean): Promise<Restaurant[]> { throw new Error("MemStorage: Method not implemented."); }
    async searchRestaurants(query: string, validated?: boolean): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
    async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> { throw new Error("MemStorage: Method not implemented."); }
    async validateRestaurant(id: number): Promise<Restaurant | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getRestaurantsByOwner(userId: number): Promise<Restaurant[]> { throw new Error("MemStorage: Method not implemented."); }
    async updateRestaurant(restaurantId: number, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async isUserOwner(userId: number, restaurantId: number): Promise<boolean> { throw new Error("MemStorage: Method not implemented."); }
    async getCategories(status?: string): Promise<Category[]> { throw new Error("MemStorage: Method not implemented."); }
    async searchCategories(query: string): Promise<Category[]> { throw new Error("MemStorage: Method not implemented."); }
    async createCategory(category: InsertCategory): Promise<Category> { throw new Error("MemStorage: Method not implemented."); }
    async updateCategoryStatus(id: number, status: string): Promise<Category | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getCategoryByName(name: string): Promise<Category | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getCategoryById(id: number): Promise<Category | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getReview(id: number): Promise<Review | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async getReviewsByRestaurant(restaurantId: number): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
    async getReviewsByUser(userId: number): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
    async getRecentReviews(limit?: number): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
    async getAllReviewsWithDetails(timeframe?: string): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
    async createReview(review: InsertReview): Promise<Review> { throw new Error("MemStorage: Method not implemented."); }
    async getUsersWhoReviewedRestaurant(restaurantId: number): Promise<User[]> { throw new Error("MemStorage: Method not implemented."); }
    async getReviewWithAuthor(reviewId: number): Promise<{ review: Review, user: User } | undefined> { throw new Error("MemStorage: Method not implemented."); }
    async createComment(comment: InsertComment): Promise<Comment> { throw new Error("MemStorage: Method not implemented."); }
    async getCommentsByReview(reviewId: number): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
    async deleteComment(commentId: number): Promise<void> { throw new Error("MemStorage: Method not implemented."); }
    async savePushSubscription(userId: number, subscription: object): Promise<void> { throw new Error("MemStorage: Method not implemented."); }
    async getPushSubscriptions(userId: number): Promise<any[]> { throw new Error("MemStorage: Method not implemented."); }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }
  async getRestaurants(validated?: boolean): Promise<Restaurant[]> {
    if (validated !== undefined) {
      return await db.select().from(restaurants).where(eq(restaurants.isValidated, validated));
    }
    return await db.select().from(restaurants);
  }
  async searchRestaurants(query: string, validated?: boolean): Promise<any[]> {
    const sq = db.select({
        restaurantId: reviews.restaurantId,
        reviewCount: sql<number>`cast(${count(reviews.id)} as int)`.as("review_count"),
        averageRating: avg(reviews.overallRating).as("average_rating"),
    }).from(reviews).groupBy(reviews.restaurantId).as("sq");
    const conditions = [];
    if (query) {
      const searchCondition = or(
          ilike(restaurants.name, `%${query}%`),
          ilike(sql`(${restaurants.address} ->> 'fullAddress')`, `%${query}%`)
      );
      conditions.push(searchCondition);
    }
    if (validated !== undefined) {
        conditions.push(eq(restaurants.isValidated, validated));
    }
    if (conditions.length === 0) return [];
    const results = await db.select().from(restaurants).leftJoin(sq, eq(restaurants.id, sq.restaurantId)).where(and(...conditions));
    return results.map(r => ({ ...r.restaurants, reviewCount: r.sq?.reviewCount || 0, averageRating: parseFloat(r.sq?.averageRating || "0") }));
  }
  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db.insert(restaurants).values(insertRestaurant).returning();
    return restaurant;
  }
  async validateRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.update(restaurants).set({ isValidated: true }).where(eq(restaurants.id, id)).returning();
    return restaurant;
  }
  async getRestaurantsByOwner(userId: number): Promise<Restaurant[]> {
    const results = await db.select({ restaurant: restaurants }).from(restaurantOwners).where(eq(restaurantOwners.userId, userId)).innerJoin(restaurants, eq(restaurantOwners.restaurantId, restaurants.id));
    return results.map(r => r.restaurant);
  }
  async updateRestaurant(restaurantId: number, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const [updatedRestaurant] = await db.update(restaurants).set(data).where(eq(restaurants.id, restaurantId)).returning();
    return updatedRestaurant;
  }
  async isUserOwner(userId: number, restaurantId: number): Promise<boolean> {
    const result = await db.select().from(restaurantOwners).where(and(eq(restaurantOwners.userId, userId), eq(restaurantOwners.restaurantId, restaurantId)));
    return result.length > 0;
  }
  async getCategories(status?: string): Promise<Category[]> {
    if (status) {
      return await db.select().from(categories).where(eq(categories.status, status));
    }
    return await db.select().from(categories);
  }
  async searchCategories(query: string): Promise<Category[]> {
    return await db.select().from(categories).where(ilike(categories.name, `%${query}%`));
  }
  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(ilike(categories.name, name));
    return category;
  }
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async updateCategoryStatus(id: number, status: string): Promise<Category | undefined> {
    const [category] = await db.update(categories).set({ status }).where(eq(categories.id, id)).returning();
    return category;
  }
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  async getReviewsByRestaurant(restaurantId: number): Promise<any[]> {
    return await db.query.reviews.findMany({ where: eq(reviews.restaurantId, restaurantId), orderBy: desc(reviews.createdAt), with: { user: true } });
  }
  async getReviewsByUser(userId: number): Promise<any[]> {
    return await db.query.reviews.findMany({ where: eq(reviews.userId, userId), orderBy: desc(reviews.createdAt), with: { restaurant: true } });
  }
  async getRecentReviews(limit: number = 10): Promise<any[]> {
    return await db.query.reviews.findMany({ orderBy: desc(reviews.createdAt), limit: limit, with: { user: true, restaurant: true } });
  }
  async getAllReviewsWithDetails(timeframe?: string): Promise<any[]> {
    const conditions = [];
    if (timeframe === 'today') { conditions.push(sql`date("reviews"."created_at") = current_date`); }
    else if (timeframe === 'week') { conditions.push(sql`date_trunc('week', "reviews"."created_at") = date_trunc('week', current_date)`); }
    else if (timeframe === 'month') { conditions.push(sql`date_trunc('month', "reviews"."created_at") = date_trunc('month', current_date)`); }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const results = await db.select({ review: reviews, user: users, restaurant: restaurants }).from(reviews).innerJoin(users, eq(reviews.userId, users.id)).innerJoin(restaurants, eq(reviews.restaurantId, restaurants.id)).where(whereClause).orderBy(desc(reviews.createdAt));
    return results.map(r => ({ ...r.review, user: r.user, restaurant: r.restaurant }));
  }
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }
  async getUsersWhoReviewedRestaurant(restaurantId: number): Promise<User[]> {
    const results = await db.selectDistinct({ user: users }).from(reviews).innerJoin(users, eq(reviews.userId, users.id)).where(eq(reviews.restaurantId, restaurantId));
    return results.map(r => r.user);
  }
  async getReviewWithAuthor(reviewId: number): Promise<{ review: Review, user: User } | undefined> {
    const [result] = await db.select({ review: reviews, user: users }).from(reviews).innerJoin(users, eq(reviews.userId, users.id)).where(eq(reviews.id, reviewId));
    return result;
  }
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }
  async getCommentsByReview(reviewId: number): Promise<any[]> {
    const results = await db.select({ comment: comments, user: users }).from(comments).innerJoin(users, eq(comments.userId, users.id)).where(eq(comments.reviewId, reviewId)).orderBy(desc(comments.createdAt));
    return results.map(r => ({ ...r.comment, user: r.user }));
  }
  async deleteComment(commentId: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, commentId));
  }
  async savePushSubscription(userId: number, subscription: object): Promise<void> {
    await db.insert(pushSubscriptions).values({ userId, subscription });
  }
  async getPushSubscriptions(userId: number): Promise<any[]> {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }
}

export const storage = new DatabaseStorage();