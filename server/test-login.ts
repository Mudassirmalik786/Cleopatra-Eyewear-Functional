import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function testLogin() {
  try {
    console.log("🔍 Testing login with admin credentials...");
    
    // Check if admin user exists
    const adminUser = await db.select().from(users).where(eq(users.username, "admin"));
    console.log("Admin user found:", adminUser);
    
    if (adminUser.length > 0) {
      console.log("Password stored:", adminUser[0].password);
      console.log("Testing password 'admin123'...");
      
      // Test bcrypt comparison
      const isValid = await bcrypt.compare("admin123", adminUser[0].password);
      console.log("Password valid:", isValid);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testLogin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
