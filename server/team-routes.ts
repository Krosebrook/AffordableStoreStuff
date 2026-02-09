import { Router, type Request, type Response } from "express";
import { db } from "./db";
import { teams, teamMembers, users, insertTeamSchema, insertTeamMemberSchema, TEAM_ROLE_PERMISSIONS } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "./middleware/auth";

const router = Router();

// ============ TEAM / WORKSPACE ============

// Get current user's team
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Check if user owns a team
    const [team] = await db.select().from(teams).where(eq(teams.ownerId, userId));
    if (team) {
      return res.json(team);
    }

    // Check if user is a member of any team
    const [membership] = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
    if (membership) {
      const [memberTeam] = await db.select().from(teams).where(eq(teams.id, membership.teamId));
      return res.json(memberTeam || null);
    }

    res.json(null);
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({ message: "Failed to fetch team" });
  }
});

// Create team
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Check if user already owns a team
    const [existing] = await db.select().from(teams).where(eq(teams.ownerId, userId));
    if (existing) {
      return res.status(400).json({ message: "You already own a team" });
    }

    const [team] = await db.insert(teams).values({
      name: name.trim(),
      ownerId: userId,
    }).returning();

    // Get user info
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    // Add owner as first member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: userId,
      email: user?.email || "",
      name: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.username || "",
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ message: "Failed to create team" });
  }
});

// Update team
router.patch("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [team] = await db.select().from(teams).where(eq(teams.ownerId, userId));
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const [updated] = await db.update(teams)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(teams.id, team.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({ message: "Failed to update team" });
  }
});

// ============ TEAM MEMBERS ============

// Get all members
router.get("/members", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Find user's team
    const [team] = await db.select().from(teams).where(eq(teams.ownerId, userId));
    if (!team) {
      // Check as member
      const [membership] = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
      if (!membership) {
        return res.json([]);
      }
      const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, membership.teamId));
      return res.json(members);
    }

    const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));
    res.json(members);
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});

// Invite member
router.post("/members", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const { email, name, role } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user's team
    const [team] = await db.select().from(teams).where(eq(teams.ownerId, userId));
    if (!team) {
      return res.status(403).json({ message: "Only team owners can invite members" });
    }

    // Check if member already exists
    const [existing] = await db.select().from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.email, email.trim().toLowerCase())));
    if (existing) {
      return res.status(400).json({ message: "Member with this email already exists" });
    }

    const [member] = await db.insert(teamMembers).values({
      teamId: team.id,
      email: email.trim().toLowerCase(),
      name: name?.trim() || email.split("@")[0],
      role: role || "viewer",
      status: "pending",
      invitedAt: new Date(),
    }).returning();

    res.status(201).json(member);
  } catch (error) {
    console.error("Invite member error:", error);
    res.status(500).json({ message: "Failed to invite member" });
  }
});

// Update member role
router.patch("/members/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, String(req.params.id)));

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    if (member.role === "owner") {
      return res.status(400).json({ message: "Cannot change owner role" });
    }

    const [updated] = await db.update(teamMembers)
      .set({ role, updatedAt: new Date() })
      .where(eq(teamMembers.id, String(req.params.id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update member error:", error);
    res.status(500).json({ message: "Failed to update member" });
  }
});

// Remove member
router.delete("/members/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, String(req.params.id)));
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    if (member.role === "owner") {
      return res.status(400).json({ message: "Cannot remove workspace owner" });
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, String(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Failed to remove member" });
  }
});

// Accept invite
router.post("/members/:id/accept", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [updated] = await db.update(teamMembers)
      .set({ status: "active", userId, joinedAt: new Date(), updatedAt: new Date() })
      .where(eq(teamMembers.id, String(req.params.id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Invite not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Accept invite error:", error);
    res.status(500).json({ message: "Failed to accept invite" });
  }
});

// Get team stats
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [team] = await db.select().from(teams).where(eq(teams.ownerId, userId));
    if (!team) {
      return res.json({ totalMembers: 0, activeMembers: 0, pendingInvites: 0, roleBreakdown: {} });
    }

    const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));
    const roleBreakdown: Record<string, number> = { owner: 0, admin: 0, editor: 0, viewer: 0 };
    let active = 0;
    let pending = 0;

    for (const m of members) {
      roleBreakdown[m.role] = (roleBreakdown[m.role] || 0) + 1;
      if (m.status === "active") active++;
      if (m.status === "pending") pending++;
    }

    res.json({
      totalMembers: members.length,
      activeMembers: active,
      pendingInvites: pending,
      roleBreakdown,
    });
  } catch (error) {
    console.error("Get team stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
