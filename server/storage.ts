import { users, restaurants, categories, reviews, type User, type InsertUser, type Restaurant, type InsertRestaurant, type Category, type InsertCategory, type Review, type InsertReview } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and, sql } from "drizzle-orm";

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
  getReviewsByUser(userId: number): Promise<Review[]>;
  getRecentReviews(limit?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private categories: Map<number, Category>;
  private reviews: Map<number, Review>;
  private userIdCounter: number;
  private restaurantIdCounter: number;
  private categoryIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.categories = new Map();
    this.reviews = new Map();
    this.userIdCounter = 1;
    this.restaurantIdCounter = 1;
    this.categoryIdCounter = 1;
    this.reviewIdCounter = 1;

    // Initialize with default categories
    this.initializeDefaultCategories();
    // Initialize with sample data
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

  // Users
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
      photoURL: insertUser.photoURL || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select()
      .from(categories)
      .where(ilike(categories.name, name));
    return category;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant || undefined;
  }

  async getRestaurants(validated?: boolean): Promise<Restaurant[]> {
    if (validated !== undefined) {
      return await db.select().from(restaurants).where(eq(restaurants.isValidated, validated));
    }
    return await db.select().from(restaurants);
  }

  async searchRestaurants(query: string, validated?: boolean): Promise<Restaurant[]> {
    
    // Adicionamos um log para ver o que a função está recebendo
    console.log(`[STORAGE] Recebido para busca -> query: "${query}", validated: ${validated}`);

    // Cria a query base
    const queryBuilder = db.select().from(restaurants);

    // Cria as condições
    const conditions = [];
    if (query) {
      conditions.push(ilike(restaurants.name, `%${query}%`));
    }
    if (validated !== undefined) {
      conditions.push(eq(restaurants.isValidated, validated));
    }

    // Se houver condições, aplica. Senão, retorna array vazio.
    if (conditions.length > 0) {
      const results = await queryBuilder.where(and(...conditions));
      console.log(`[STORAGE] Encontrados ${results.length} resultados.`);
      return results;
    } else {
      console.log(`[STORAGE] Nenhuma condição de busca, retornando vazio.`);
      return [];
    }
}

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db
      .insert(restaurants)
      .values(insertRestaurant)
      .returning();
    return restaurant;
  }

  async validateRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .update(restaurants)
      .set({ isValidated: true })
      .where(eq(restaurants.id, id))
      .returning();
    return restaurant || undefined;
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

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategoryStatus(id: number, status: string): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set({ status })
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewsByRestaurant(restaurantId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.restaurantId, restaurantId));
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(limit);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }
}

export const storage = new DatabaseStorage();
