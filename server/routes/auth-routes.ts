import { Router, type Request, type Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

const SALT_ROUNDS = 12;
const router = Router();

// Register
router.post("/register", async (req: Request, res: Response) => {
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
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
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
    res.json({ user: userWithoutPassword, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current user
router.get("/me", async (req: Request, res: Response) => {
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
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  if (req.user) {
    req.logout(() => {});
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// Forgot password
router.post("/forgot-password", async (req: Request, res: Response) => {
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

      const { sendPasswordResetEmail } = await import("../email");
      const emailSent = await sendPasswordResetEmail(user.email, token);

      if (!emailSent && process.env.NODE_ENV === "development") {
        console.log(`[DEV] Password reset link (email failed): /reset-password?token=${token}`);
      }
    }

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
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

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Verify reset token
router.get("/verify-reset-token", async (req: Request, res: Response) => {
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

    res.json({ valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ valid: false, message: "Failed to verify token" });
  }
});

export default router;
