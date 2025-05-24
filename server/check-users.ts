import { db } from "./db";
import { users } from "@shared/schema";

async function checkUsers() {
  try {
    console.log("🔍 Checking all users in database...");
    
    const allUsers = await db.select().from(users);
    
    console.log("📋 Users found:");
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    if (allUsers.length === 0) {
      console.log("❌ No users found in database!");
    }
    
  } catch (error) {
    console.error("❌ Error checking users:", error);
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
