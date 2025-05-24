import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, insertProductSchema, 
  insertCategorySchema, insertBookingSchema, 
  insertFeedbackSchema
} from "@shared/schema";
import passport from "./passport-config";

// Session augmentation to include user
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'cleopatraeyewear',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );

  // Initialize Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Auth Middleware
  const requireAuth = (req: Request, res: Response, next: () => void) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: () => void) => {
    if (!req.session.userId || req.session.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  const requireStaff = (req: Request, res: Response, next: () => void) => {
    if (!req.session.userId || (req.session.userRole !== "staff" && req.session.userRole !== "admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingByEmail = await storage.getUserByEmail(userData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const existingByUsername = await storage.getUserByUsername(userData.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
      
      // In a real app, password would be hashed here
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        email: z.string().min(1),
        password: z.string().min(1),
      });
      
      const credentials = loginSchema.parse(req.body);
      
      // Try to find user by email first, then by username
      let user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        user = await storage.getUserByUsername(credentials.email);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password - support both plain text (for existing users) and bcrypt (for admin/staff)
      const isPasswordValid = user.password.startsWith('$2b$') 
        ? await bcrypt.compare(credentials.password, user.password)
        : user.password === credentials.password;
        
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json(null);
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json(null);
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // USER ROUTES
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow admin or the user themselves to access
      if (req.session.userRole !== "admin" && req.session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow admin or the user themselves to update
      if (req.session.userRole !== "admin" && req.session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prevent role changes unless admin
      if (req.body.role && req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Cannot change role" });
      }
      
      const updateSchema = insertUserSchema.partial();
      const userData = updateSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during update" });
    }
  });

  // CATEGORY ROUTES
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating category" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      const updateSchema = insertCategorySchema.partial();
      const categoryData = updateSchema.parse(req.body);
      
      const updatedCategory = await storage.updateCategory(categoryId, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during update" });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Check if category exists
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Check if products use this category
      const products = await storage.getProductsByCategory(categoryId);
      if (products.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete category with associated products" 
        });
      }
      
      const success = await storage.deleteCategory(categoryId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete category" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error during deletion" });
    }
  });

  // PRODUCT ROUTES
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const featured = req.query.featured === "true";
      
      let products;
      
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else if (featured) {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve products" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Validate category exists if provided
      if (productData.categoryId) {
        const category = await storage.getCategory(productData.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating product" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      const updateSchema = insertProductSchema.partial();
      const productData = updateSchema.parse(req.body);
      
      // Validate category exists if provided
      if (productData.categoryId) {
        const category = await storage.getCategory(productData.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
      }
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during update" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const success = await storage.deleteProduct(productId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete product" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error during deletion" });
    }
  });

  // BOOKING ROUTES
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      let bookings;
      
      if (req.session.userRole === "admin") {
        // Admin can see all bookings
        bookings = await storage.getAllBookings();
      } else if (req.session.userRole === "staff") {
        // Staff can see bookings assigned to them
        bookings = await storage.getStaffBookings(req.session.userId);
      } else {
        // Customers can only see their own bookings
        bookings = await storage.getUserBookings(req.session.userId);
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });

  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.session.userId // Set current user as the booking owner
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating booking" });
    }
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check authorization
      if (
        req.session.userRole !== "admin" && 
        booking.userId !== req.session.userId && 
        (req.session.userRole !== "staff" || booking.staffId !== req.session.userId)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      // Get the booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check permissions
      if (req.session.userRole === "customer") {
        // Customers can only modify their own bookings
        if (booking.userId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // Customers cannot change staff assignment or status
        if (req.body.staffId !== undefined || req.body.status !== undefined) {
          return res.status(403).json({ 
            message: "Customers cannot change staff assignment or booking status" 
          });
        }
      } else if (req.session.userRole === "staff") {
        // Staff can only modify bookings assigned to them
        if (booking.staffId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        // Staff can only update status
        const allowedFields = ["status", "notes"];
        const attemptedFields = Object.keys(req.body);
        
        for (const field of attemptedFields) {
          if (!allowedFields.includes(field)) {
            return res.status(403).json({ 
              message: `Staff can only update ${allowedFields.join(", ")}` 
            });
          }
        }
      }
      
      const updateSchema = insertBookingSchema.partial();
      const bookingData = updateSchema.parse(req.body);
      
      const updatedBooking = await storage.updateBooking(bookingId, bookingData);
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during update" });
    }
  });

  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      // Get the booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only admins or the booking owner can delete it
      if (req.session.userRole !== "admin" && booking.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteBooking(bookingId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete booking" });
      }
      
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error during deletion" });
    }
  });

  // FEEDBACK ROUTES
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        userId: req.session.userId // Set current user as the feedback owner
      });
      
      // Verify the booking exists and belongs to the user
      const booking = await storage.getBooking(feedbackData.bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== req.session.userId) {
        return res.status(403).json({ 
          message: "You can only provide feedback for your own bookings" 
        });
      }
      
      // Check if feedback already exists for this booking
      const existingFeedback = await storage.getBookingFeedback(feedbackData.bookingId);
      if (existingFeedback) {
        return res.status(400).json({ 
          message: "Feedback already exists for this booking" 
        });
      }
      
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating feedback" });
    }
  });

  app.get("/api/feedback", requireStaff, async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve feedback" });
    }
  });

  app.get("/api/feedback/booking/:id", requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      // Verify the booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check authorization
      if (
        req.session.userRole !== "admin" && 
        booking.userId !== req.session.userId && 
        (req.session.userRole !== "staff" || booking.staffId !== req.session.userId)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const feedback = await storage.getBookingFeedback(bookingId);
      if (!feedback) {
        return res.status(404).json({ message: "No feedback found for this booking" });
      }
      
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
