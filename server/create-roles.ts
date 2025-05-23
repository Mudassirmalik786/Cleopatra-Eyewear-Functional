import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function createRoleUsers() {
  try {
    console.log("🔧 Creating admin and staff users...");
    
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create admin user
    await db.insert(users).values({
      username: "admin",
      email: "admin@cleopatraeyewear.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });
    
    // Create staff user
    await db.insert(users).values({
      username: "staff",
      email: "staff@cleopatraeyewear.com", 
      password: hashedPassword,
      firstName: "Staff",
      lastName: "Member",
      role: "staff"
    });
    
    console.log("✅ Admin and staff users created successfully!");
    console.log("📋 Login credentials (use username, not email):");
    console.log("   Admin: admin / admin123");
    console.log("   Staff: staff / admin123");
    
  } catch (error) {
    console.error("❌ Error creating users:", error);
  }
}

createRoleUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
