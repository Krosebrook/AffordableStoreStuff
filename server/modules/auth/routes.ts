import type { Express } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { insertUserSchema } from "@shared/schema";
import type { IStorage } from "../../storage";

const SALT_ROUNDS = 12;

export function registerAuthApiRoutes(app: Express, storage: IStorage) {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      req.session.userId = user.id;

      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Register error:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      let userId = req.session.userId;
      let oidcEmail: string | undefined;

      if (!userId && req.user && (req.user as any).claims?.sub) {
        userId = (req.user as any).claims.sub;
        oidcEmail = (req.user as any).claims?.email;
      }

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let user = await storage.getUser(userId);
      if (!user && oidcEmail) {
        user = await storage.getUserByEmail(oidcEmail);
      }

      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (req.user) {
      req.logout(() => {});
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = randomUUID() + randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await storage.deletePasswordResetTokensForUser(user.id);
        await storage.createPasswordResetToken({ userId: user.id, token, expiresAt });

        const { sendPasswordResetEmail } = await import("../../email");
        const emailSent = await sendPasswordResetEmail(user.email, token);

        if (!emailSent && process.env.NODE_ENV === "development") {
          console.log(`[DEV] Password reset link (email failed): /reset-password?token=${token}`);
        }
      }

      return res.json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Reset link has expired" });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({ message: "Reset link has already been used" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      await storage.markPasswordResetTokenUsed(token);

      return res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ valid: false, message: "Token is required" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ valid: false, message: "Invalid reset link" });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ valid: false, message: "Reset link has expired" });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({ valid: false, message: "Reset link has already been used" });
      }

      return res.json({ valid: true });
    } catch (error) {
      console.error("Verify reset token error:", error);
      return res.status(500).json({ valid: false, message: "Failed to verify token" });
    }
  });
}
