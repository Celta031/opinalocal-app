import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRestaurantSchema, insertCategorySchema, insertReviewSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    const user = await storage.getUserByFirebaseUid(req.params.uid);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.get("/api/users/email/:email", async (req, res) => {
    const user = await storage.getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid user data", details: error.flatten ? error.flatten() : error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(parseInt(req.params.id), userData);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid user data", details: error.flatten ? error.flatten() : error.message });
    }
  });

  // Restaurants
  app.get("/api/restaurants", async (req, res) => {
    const validated = req.query.validated === 'true' ? true : req.query.validated === 'false' ? false : undefined;
    const restaurants = await storage.getRestaurants(validated);
    res.json(restaurants);
  });

  app.get("/api/restaurants/search", async (req, res) => {
    const query = req.query.q as string;
    const validated = req.query.validated === 'true' ? true : undefined;
    const restaurants = await storage.searchRestaurants(query, validated);
    res.json(restaurants);
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    const restaurant = await storage.getRestaurant(parseInt(req.params.id));
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const restaurantData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(400).json({ message: "Invalid restaurant data" });
    }
  });

  app.patch("/api/restaurants/:id/validate", async (req, res) => {
    const restaurant = await storage.validateRestaurant(parseInt(req.params.id));
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  });

  // Categories
  // ESTA É A ROTA QUE ESTAVA FALTANDO OU COM PROBLEMA
  app.get("/api/categories", async (req, res) => {
    try {
      const status = req.query.status as string;
      const categories = await storage.getCategories(status);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/categories/search", async (req, res) => {
    const query = req.query.q as string;
    const categories = await storage.searchCategories(query);
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const existingCategory = await storage.getCategoryByName(categoryData.name);
      if (existingCategory) {
        return res.status(409).json({ message: "Essa categoria já existe." });
      }
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid category data", details: error.flatten ? error.flatten() : error.message });
    }
  });

  app.patch("/api/categories/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const category = await storage.updateCategoryStatus(parseInt(req.params.id), status);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    const { restaurantId, userId, recent } = req.query;
    if (restaurantId) {
      const reviews = await storage.getReviewsByRestaurant(parseInt(restaurantId as string));
      return res.json(reviews);
    }
    if (userId) {
      const reviews = await storage.getReviewsByUser(parseInt(userId as string));
      return res.json(reviews);
    }
    const recentReviews = await storage.getRecentReviews(10);
    res.json(recentReviews);
  });

  app.get("/api/reviews/all", async (req, res) => {
    const timeframe = req.query.timeframe as string | undefined;
    const reviews = await storage.getAllReviewsWithDetails(timeframe);
    res.json(reviews);
  });

  app.get("/api/reviews/:id", async (req, res) => {
    const review = await storage.getReview(parseInt(req.params.id));
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Erro de validação ao criar avaliação:", error); 
      res.status(400).json({ 
        message: "Dados da avaliação inválidos.", 
        details: error.flatten ? error.flatten() : error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}