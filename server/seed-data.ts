import { db } from "./db";
import { categories, products, users } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await db.delete(products);
    await db.delete(categories);

    // Insert categories
    const categoryData = [
      {
        name: "Sunglasses",
        description: "Stylish and protective sunglasses for every occasion",
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop"
      },
      {
        name: "Reading Glasses",
        description: "Comfortable reading glasses for everyday use",
        imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop"
      },
      {
        name: "Blue Light Glasses",
        description: "Protect your eyes from digital screens",
        imageUrl: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=300&fit=crop"
      },
      {
        name: "Prescription Glasses",
        description: "High-quality prescription eyewear",
        imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop"
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert products
    const productData = [
      // Sunglasses
      {
        name: "Elegant Black Frame",
        description: "A sophisticated black frame design perfect for professional and casual settings. Features UV protection and premium materials.",
        price: 12999, // $129.99
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=400&fit=crop",
        categoryId: insertedCategories[0].id,
        brand: "Cleopatra Elite",
        inStock: true,
        stockCount: 25,
        featured: true
      },
      {
        name: "Rose Gold Aviators",
        description: "Classic aviator style with a modern rose gold finish. Perfect for making a fashion statement.",
        price: 15999, // $159.99
        imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=500&h=400&fit=crop",
        categoryId: insertedCategories[0].id,
        brand: "Cleopatra Elite",
        inStock: true,
        stockCount: 18,
        featured: true
      },
      {
        name: "Vintage Round Sunglasses",
        description: "Retro-inspired round frames with gradient lenses. A timeless classic with modern protection.",
        price: 9999, // $99.99
        imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=500&h=400&fit=crop",
        categoryId: insertedCategories[0].id,
        brand: "Cleopatra Vintage",
        inStock: true,
        stockCount: 30,
        featured: false
      },
      {
        name: "Cat Eye Glamour",
        description: "Bold cat-eye design that adds drama and sophistication to any outfit. Premium Italian acetate.",
        price: 17999, // $179.99
        imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=400&fit=crop",
        categoryId: insertedCategories[0].id,
        brand: "Cleopatra Glamour",
        inStock: true,
        stockCount: 15,
        featured: true
      },

      // Reading Glasses
      {
        name: "Classic Reading Frames",
        description: "Comfortable and durable reading glasses with anti-reflective coating. Perfect for extended reading sessions.",
        price: 5999, // $59.99
        imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&h=400&fit=crop",
        categoryId: insertedCategories[1].id,
        brand: "Cleopatra Comfort",
        inStock: true,
        stockCount: 40,
        featured: false
      },
      {
        name: "Lightweight Titanium Readers",
        description: "Ultra-light titanium frames that provide all-day comfort. Scratch-resistant and hypoallergenic.",
        price: 8999, // $89.99
        imageUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=500&h=400&fit=crop",
        categoryId: insertedCategories[1].id,
        brand: "Cleopatra Tech",
        inStock: true,
        stockCount: 22,
        featured: true
      },

      // Blue Light Glasses
      {
        name: "Digital Shield Pro",
        description: "Advanced blue light blocking technology for digital device users. Reduces eye strain and improves sleep quality.",
        price: 7999, // $79.99
        imageUrl: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=500&h=400&fit=crop",
        categoryId: insertedCategories[2].id,
        brand: "Cleopatra Tech",
        inStock: true,
        stockCount: 35,
        featured: true
      },
      {
        name: "Clear Vision Blue Blockers",
        description: "Stylish frames with clear blue light filtering lenses. Perfect for work and gaming sessions.",
        price: 6999, // $69.99
        imageUrl: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=500&h=400&fit=crop",
        categoryId: insertedCategories[2].id,
        brand: "Cleopatra Tech",
        inStock: true,
        stockCount: 28,
        featured: false
      },

      // Prescription Glasses
      {
        name: "Professional Square Frames",
        description: "Modern square frames perfect for the workplace. Compatible with all prescription types including progressives.",
        price: 19999, // $199.99
        imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=400&fit=crop",
        categoryId: insertedCategories[3].id,
        brand: "Cleopatra Professional",
        inStock: true,
        stockCount: 20,
        featured: true
      },
      {
        name: "Designer Tortoiseshell",
        description: "Elegant tortoiseshell pattern with premium lens options. Handcrafted with attention to detail.",
        price: 24999, // $249.99
        imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=400&fit=crop",
        categoryId: insertedCategories[3].id,
        brand: "Cleopatra Designer",
        inStock: true,
        stockCount: 12,
        featured: true
      },
      {
        name: "Minimalist Wire Frames",
        description: "Ultra-thin wire frames for a barely-there look. Lightweight and comfortable for all-day wear.",
        price: 14999, // $149.99
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500&h=400&fit=crop",
        categoryId: insertedCategories[3].id,
        brand: "Cleopatra Minimal",
        inStock: true,
        stockCount: 16,
        featured: false
      },
      {
        name: "Bold Statement Frames",
        description: "Make a statement with these bold, oversized frames. Perfect for those who want to stand out.",
        price: 18999, // $189.99
        imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&h=400&fit=crop",
        categoryId: insertedCategories[3].id,
        brand: "Cleopatra Bold",
        inStock: true,
        stockCount: 14,
        featured: true
      }
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary: ${insertedCategories.length} categories, ${insertedProducts.length} products`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding function
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedDatabase };