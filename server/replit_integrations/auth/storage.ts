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
    const username = `replit_${userData.id.substring(0, 8)}`;
    
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
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
    
    if (userData.email) {
      const [existingByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingByEmail) {
        const [user] = await db
          .update(users)
          .set({
            firstName: userData.firstName || existingByEmail.firstName,
            lastName: userData.lastName || existingByEmail.lastName,
            avatar: userData.profileImageUrl || existingByEmail.avatar,
          })
          .where(eq(users.email, userData.email))
          .returning();
        return user;
      }
    }
    
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        username,
        email: userData.email || `${username}@replit.local`,
        password: "",
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
