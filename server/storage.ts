import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  bookings, type Booking, type InsertBooking,
  feedback, type Feedback, type InsertFeedback
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Products
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getStaffBookings(staffId: number): Promise<Booking[]>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedback(id: number): Promise<Feedback | undefined>;
  getBookingFeedback(bookingId: number): Promise<Feedback | undefined>;
  getAllFeedback(): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private bookings: Map<number, Booking>;
  private feedback: Map<number, Feedback>;
  
  private userCurrentId: number;
  private categoryCurrentId: number;
  private productCurrentId: number;
  private bookingCurrentId: number;
  private feedbackCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.bookings = new Map();
    this.feedback = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    this.bookingCurrentId = 1;
    this.feedbackCurrentId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Add categories
    const sunglasses = this.createCategory({
      name: "Sunglasses",
      description: "Stylish sunglasses for all occasions",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=533"
    });
    
    const optical = this.createCategory({
      name: "Optical Frames",
      description: "Prescription eyeglasses with various frame styles",
      imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=533"
    });
    
    const blueLight = this.createCategory({
      name: "Blue Light Glasses",
      description: "Protective eyewear to filter blue light from digital screens",
      imageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=533"
    });
    
    // Add products
    this.createProduct({
      name: "Elegant Black Frame",
      description: "A sleek black frame that complements any face shape",
      price: 14999, // $149.99
      imageUrl: "https://pixabay.com/get/gd7b80624a3621b0fc8e3a47bd674f3c5e1ddeb2b5ed62524ab7623ee46d920ba5133ba2d3c3c15be98fa6c0536eababd6569c835fc1c4ddc472961cf9b46a14c_1280.jpg",
      categoryId: optical.id,
      brand: "Cleopatra",
      inStock: true,
      stockCount: 50,
      featured: true
    });
    
    this.createProduct({
      name: "Crystal Clear Round",
      description: "Transparent frame glasses with round lenses for a vintage look",
      price: 12999, // $129.99
      imageUrl: "https://pixabay.com/get/ge7d7358d1f2d7fac57cbd3739253fb8c13c414cf12fa361dba99806ef9d043acd64549333234743ee74578ef0a8e0f41e00739b5a59381e4efaba5af621eb1b9_1280.jpg",
      categoryId: optical.id,
      brand: "Cleopatra",
      inStock: true,
      stockCount: 35,
      featured: true
    });
    
    this.createProduct({
      name: "Gold Aviator Sunglasses",
      description: "Modern sunglasses with gold frame and dark lenses",
      price: 17999, // $179.99
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      categoryId: sunglasses.id,
      brand: "Cleopatra",
      inStock: true,
      stockCount: 25,
      featured: true
    });
    
    this.createProduct({
      name: "Purple Cat-Eye Classic",
      description: "Cat-eye style glasses with purple accents",
      price: 15999, // $159.99
      imageUrl: "https://images.unsplash.com/photo-1626178793926-22b28830aa30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      categoryId: optical.id,
      brand: "Cleopatra",
      inStock: true,
      stockCount: 15,
      featured: true
    });
    
    this.createProduct({
      name: "Digital Comfort Blue Light",
      description: "Computer glasses to reduce eye strain during screen time",
      price: 13999, // $139.99
      imageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=533",
      categoryId: blueLight.id,
      brand: "Cleopatra",
      inStock: true,
      stockCount: 40,
      featured: false
    });
    
    this.createProduct({
      name: "Modern Polarized Shades",
      description: "Premium polarized sunglasses for outdoor activities",
      price: 18999, // $189.99
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=533",
      categoryId: sunglasses.id,
      brand: "Cleopatra",
      inStock: true,
      stockCount: 30,
      featured: false
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      email: "admin@cleopatraeyewear.com",
      password: "admin123", // In a real app, this would be hashed
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });
    
    // Create staff user
    this.createUser({
      username: "staff",
      email: "staff@cleopatraeyewear.com",
      password: "staff123", // In a real app, this would be hashed
      firstName: "Staff",
      lastName: "Member",
      role: "staff"
    });
    
    // Create customer user
    this.createUser({
      username: "customer",
      email: "customer@example.com",
      password: "customer123", // In a real app, this would be hashed
      firstName: "John",
      lastName: "Doe",
      role: "customer"
    });
  }
  
  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // CATEGORY METHODS
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = await this.getCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // PRODUCT METHODS
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const createdAt = new Date();
    const newProduct: Product = { ...product, id, createdAt };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured,
    );
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // BOOKING METHODS
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingCurrentId++;
    const createdAt = new Date();
    const newBooking: Booking = { ...booking, id, createdAt };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }
  
  async getStaffBookings(staffId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.staffId === staffId,
    );
  }
  
  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }
  
  // FEEDBACK METHODS
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackCurrentId++;
    const createdAt = new Date();
    const newFeedback: Feedback = { ...feedbackData, id, createdAt };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }
  
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedback.get(id);
  }
  
  async getBookingFeedback(bookingId: number): Promise<Feedback | undefined> {
    return Array.from(this.feedback.values()).find(
      (feedback) => feedback.bookingId === bookingId,
    );
  }
  
  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values());
  }
}

export const storage = new MemStorage();
