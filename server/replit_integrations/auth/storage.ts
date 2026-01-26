import type { User, UpsertUser } from "@shared/models/auth";
import { users } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Generate a unique username for Replit Auth users (they don't have passwords)
    const username = `replit_${userData.id.substring(0, 8)}`;
    
    // Check if user already exists
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Update existing user with new Replit Auth data
      const [user] = await db
        .update(users)
        .set({
          email: userData.email || existingUser.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.profileImageUrl,
        })
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    }
    
    // Create new user for Replit Auth (no password required)
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        username,
        email: userData.email || `${username}@replit.local`,
        password: "", // Empty password for social auth users
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.profileImageUrl,
        role: "customer",
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
