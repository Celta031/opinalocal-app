import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRestaurantSchema, insertCategorySchema, insertReviewSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  // Restaurants
  app.get("/api/restaurants", async (req, res) => {
    try {
      const validated = req.query.validated === 'true' ? true : req.query.validated === 'false' ? false : undefined;
      const restaurants = await storage.getRestaurants(validated);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const restaurants = await storage.searchRestaurants(query);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(parseInt(req.params.id));
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
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
    try {
      const restaurant = await storage.validateRestaurant(parseInt(req.params.id));
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Categories
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
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const categories = await storage.searchCategories(query);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.patch("/api/categories/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const category = await storage.updateCategoryStatus(parseInt(req.params.id), status);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const restaurantId = req.query.restaurantId as string;
      const userId = req.query.userId as string;
      const recent = req.query.recent === 'true';

      if (restaurantId) {
        const reviews = await storage.getReviewsByRestaurant(parseInt(restaurantId));
        res.json(reviews);
      } else if (userId) {
        const reviews = await storage.getReviewsByUser(parseInt(userId));
        res.json(reviews);
      } else if (recent) {
        const reviews = await storage.getRecentReviews(10);
        res.json(reviews);
      } else {
        res.status(400).json({ message: "Invalid query parameters" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const review = await storage.getReview(parseInt(req.params.id));
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
