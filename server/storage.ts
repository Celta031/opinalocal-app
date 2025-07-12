import { users, restaurants, categories, reviews, pushSubscriptions, type User, type InsertUser, type Restaurant, type InsertRestaurant, type Category, type InsertCategory, type Review, type InsertReview } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and, or, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restaurants
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurants(validated?: boolean): Promise<Restaurant[]>;
  searchRestaurants(query: string, validated?: boolean): Promise<Restaurant[]>; 
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  validateRestaurant(id: number): Promise<Restaurant | undefined>;
  
  // Categories
  getCategories(status?: string): Promise<Category[]>;
  searchCategories(query: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategoryStatus(id: number, status: string): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  
  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByRestaurant(restaurantId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<any[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getRecentReviews(limit?: number): Promise<Review[]>;
  getAllReviewsWithDetails(): Promise<any[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Push Notifications
  savePushSubscription(userId: number, subscription: object): Promise<void>;
  getPushSubscriptions(userId: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private restaurants: Map<number, Restaurant> = new Map();
  private categories: Map<number, Category> = new Map();
  private reviews: Map<number, Review> = new Map();
  private pushSubscriptions: Map<number, any[]> = new Map();
  private userIdCounter = 1;
  private restaurantIdCounter = 1;
  private categoryIdCounter = 1;
  private reviewIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.categories = new Map();
    this.reviews = new Map();
    this.userIdCounter = 1;
    this.restaurantIdCounter = 1;
    this.categoryIdCounter = 1;
    this.reviewIdCounter = 1;

    this.initializeDefaultCategories();
    this.initializeSampleData();
  }
  
  

  private initializeDefaultCategories() {
    const defaultCategories = [
      { name: "Comida", createdBy: "admin", status: "approved" },
      { name: "Atendimento", createdBy: "admin", status: "approved" },
      { name: "Ambiente", createdBy: "admin", status: "approved" },
      { name: "Preço", createdBy: "admin", status: "approved" },
      { name: "Custo-benefício", createdBy: "admin", status: "approved" },
      { name: "Bom para famílias", createdBy: "admin", status: "approved" },
      { name: "Música ao vivo", createdBy: "admin", status: "approved" },
    ];
defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.categoryIdCounter++,
        name: cat.name,
        createdBy: cat.createdBy,
        status: cat.status,
        createdAt: new Date(),
      };
      this.categories.set(category.id, category);
    });
  }

  private initializeSampleData() {
    // Sample restaurants
    const sampleRestaurants = [
      {
        name: "Restaurante Dona Maria",
        address: {
          street: "Rua da Consolação, 123",
          city: "São Paulo",
          state: "SP",
          postalCode: "01234-567",
          fullAddress: "Rua da Consolação, 123 - Consolação, São Paulo - SP"
        },
        location: { lat: -23.5505, lng: -46.6333 },
        createdBy: 1,
        isValidated: true
      },
      {
        name: "Pizzaria Napoli",
        address: {
          street: "Rua Augusta, 456",
          city: "São Paulo", 
          state: "SP",
          postalCode: "01234-567",
          fullAddress: "Rua Augusta, 456 - Bela Vista, São Paulo - SP"
        },
        location: { lat: -23.5489, lng: -46.6388 },
        createdBy: 1,
        isValidated: true
      },
      {
        name: "Café Central",
        address: {
          street: "Av. Paulista, 789",
          city: "São Paulo",
          state: "SP", 
          postalCode: "01234-567",
          fullAddress: "Av. Paulista, 789 - Bela Vista, São Paulo - SP"
        },
        location: { lat: -23.5618, lng: -46.6565 },
        createdBy: 1,
        isValidated: true
      }
    ];

    sampleRestaurants.forEach(restaurant => {
      const newRestaurant: Restaurant = {
        id: this.restaurantIdCounter++,
        ...restaurant,
        createdAt: new Date()
      };
      this.restaurants.set(newRestaurant.id, newRestaurant);
    });

    // Sample user (admin)
    const adminUser: User = {
      id: this.userIdCounter++,
      firebaseUid: "admin-sample-uid",
      email: "admin@opinalocal.com",
      name: "Admin OpinaLocal",
      photoURL: null,
      role: "admin",
      notifyOnComment: true,
      notifyOnNewReview: true,
      notifyOnCategoryApproval: true,
      notifyOnNewsletter: false,
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    // Sample reviews
    const sampleReviews = [
      {
        userId: 1,
        restaurantId: 1,
        text: "Excelente comida caseira! O ambiente é acolhedor e o atendimento é muito bom. Recomendo o prato do dia, sempre fresquinho e saboroso.",
        photos: [],
        visitDate: new Date('2024-12-15'),
        ratings: {
          standard: {
            "Comida": 5,
            "Atendimento": 4,
            "Ambiente": 4,
            "Preço": 4
          },
          custom: {
            "Custo-benefício": 5
          }
        },
        overallRating: 4.4
      },
      {
        userId: 1,
        restaurantId: 2,
        text: "Pizza muito boa! Massa fina e crocante, ingredientes frescos. O ambiente é bem descontraído, perfeito para ir com a família.",
        photos: [],
        visitDate: new Date('2024-12-10'),
        ratings: {
          standard: {
            "Comida": 4,
            "Atendimento": 4,
            "Ambiente": 4,
            "Preço": 3
          },
          custom: {
            "Bom para famílias": 5
          }
        },
        overallRating: 4.0
      },
      {
        userId: 1,
        restaurantId: 3,
        text: "Ótimo local para trabalhar! Wi-fi rápido, café excelente e ambiente silencioso. Os doces são irresistíveis.",
        photos: [],
        visitDate: new Date('2024-12-05'),
        ratings: {
          standard: {
            "Comida": 4,
            "Atendimento": 5,
            "Ambiente": 5,
            "Preço": 4
          },
          custom: {}
        },
        overallRating: 4.5
      }
    ];

    sampleReviews.forEach(review => {
      const newReview: Review = {
        id: this.reviewIdCounter++,
        ...review,
        createdAt: new Date()
      };
      this.reviews.set(newReview.id, newReview);
    });
  }

  async getAllReviewsWithDetails(): Promise<any[]> {
        const reviews = Array.from(this.reviews.values()).sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        return reviews.map(review => ({
            ...review,
            user: this.users.get(review.userId),
            restaurant: this.restaurants.get(review.restaurantId),
        }));
    }

  // Users

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...data } as User;
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      ...insertUser,
      role: insertUser.role || "user",
      photoURL: insertUser.photoURL || null,
      notifyOnComment: insertUser.notifyOnComment ?? true,
      notifyOnNewReview: insertUser.notifyOnNewReview ?? true,
      notifyOnCategoryApproval: insertUser.notifyOnCategoryApproval ?? true,
      notifyOnNewsletter: insertUser.notifyOnNewsletter ?? false,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async savePushSubscription(userId: number, subscription: object): Promise<void> {}
  async getPushSubscriptions(userId: number): Promise<any[]> { return []; }

  // Restaurants
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurants(validated?: boolean): Promise<Restaurant[]> {
    const restaurants = Array.from(this.restaurants.values());
    if (validated !== undefined) {
      return restaurants.filter(r => r.isValidated === validated);
    }
    return restaurants;
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const restaurants = Array.from(this.restaurants.values());
    return restaurants.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      (r.address as any).fullAddress.toLowerCase().includes(query.toLowerCase())
    );
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const restaurant: Restaurant = {
      id: this.restaurantIdCounter++,
      ...insertRestaurant,
      location: insertRestaurant.location || null,
      isValidated: false,
      createdAt: new Date(),
    };
    this.restaurants.set(restaurant.id, restaurant);
    return restaurant;
  }

  async validateRestaurant(id: number): Promise<Restaurant | undefined> {
    const restaurant = this.restaurants.get(id);
    if (restaurant) {
      restaurant.isValidated = true;
      this.restaurants.set(id, restaurant);
    }
    return restaurant;
  }

  // Categories
  async getCategories(status?: string): Promise<Category[]> {
    const categories = Array.from(this.categories.values());
    if (status) {
      return categories.filter(c => c.status === status);
    }
    return categories;
  }

  async searchCategories(query: string): Promise<Category[]> {
    const categories = Array.from(this.categories.values());
    return categories.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) && c.status === "approved"
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.categoryIdCounter++,
      ...insertCategory,
      status: "pending",
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategoryStatus(id: number, status: string): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (category) {
      category.status = status;
      this.categories.set(id, category);
    }
    return category;
  }

  // Reviews
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByRestaurant(restaurantId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.restaurantId === restaurantId);
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.userId === userId);
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const reviews = Array.from(this.reviews.values());
    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      id: this.reviewIdCounter++,
      ...insertReview,
      photos: insertReview.photos || [],
      createdAt: new Date(),
    };
    this.reviews.set(review.id, review);
    return review;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
  }

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

    const searchCondition = or(
        ilike(restaurants.name, `%${query}%`),
        ilike(sql`(${restaurants.address} ->> 'fullAddress')`, `%${query}%`)
    );

    const conditions = [searchCondition];
    if (validated !== undefined) {
        conditions.push(eq(restaurants.isValidated, validated));
    }
    
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
    return await db.query.reviews.findMany({
      where: eq(reviews.restaurantId, restaurantId),
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      with: { user: true },
    });
  }

  async getReviewsByUser(userId: number): Promise<any[]> {
    return await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      with: { restaurant: true },
    });
  }

  async getRecentReviews(limit: number = 10): Promise<any[]> {
    return await db.query.reviews.findMany({
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      limit: limit,
      with: { user: true, restaurant: true },
    });
  }
  
  async getAllReviewsWithDetails(timeframe?: string): Promise<any[]> {
    const conditions = [];
    if (timeframe === 'today') {
      conditions.push(sql`date("reviews"."created_at") = current_date`);
    } else if (timeframe === 'week') {
      conditions.push(sql`date_trunc('week', "reviews"."created_at") = date_trunc('week', current_date)`);
    } else if (timeframe === 'month') {
      conditions.push(sql`date_trunc('month', "reviews"."created_at") = date_trunc('month', current_date)`);
    }
    const results = await db.select({ review: reviews, user: users, restaurant: restaurants })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(restaurants, eq(reviews.restaurantId, restaurants.id))
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt));
      
    return results.map(r => ({ ...r.review, user: r.user, restaurant: r.restaurant }));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async savePushSubscription(userId: number, subscription: object): Promise<void> {
    await db.insert(pushSubscriptions).values({ userId, subscription });
  }

  async getPushSubscriptions(userId: number): Promise<any[]> {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
