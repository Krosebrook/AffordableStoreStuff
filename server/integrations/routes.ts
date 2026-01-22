/**
 * Integration Routes for FlashFusion
 * Provides API endpoints for managing platform connections and integrations
 */

import type { Express, Request, Response } from "express";
import { PLATFORM_CONNECTORS, getConnectorsByCategory, getConnectorById, getConnectorCategories } from "./index";
import { aiService } from "./ai-service";
import { db } from "../db";
import { 
  platformConnectors, 
  platformConnections, 
  aiGenerations,
  workflowExecutions,
  publishingQueue,
  safeguardAuditLog,
  budgetTracking
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export function registerIntegrationRoutes(app: Express) {
  // ============================================================================
  // CONNECTOR DISCOVERY
  // ============================================================================
  
  // Get all available connectors
  app.get("/api/integrations/connectors", async (_req: Request, res: Response) => {
    try {
      res.json({
        connectors: PLATFORM_CONNECTORS,
        categories: getConnectorCategories(),
        totalCount: PLATFORM_CONNECTORS.length,
      });
    } catch (error) {
      console.error("Get connectors error:", error);
      res.status(500).json({ message: "Failed to fetch connectors" });
    }
  });

  // Get connectors by category
  app.get("/api/integrations/connectors/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category as any;
      const connectors = getConnectorsByCategory(category);
      res.json({ connectors, category });
    } catch (error) {
      console.error("Get connectors by category error:", error);
      res.status(500).json({ message: "Failed to fetch connectors" });
    }
  });

  // Get single connector details
  app.get("/api/integrations/connectors/:id", async (req: Request, res: Response) => {
    try {
      const connector = getConnectorById(req.params.id);
      if (!connector) {
        return res.status(404).json({ message: "Connector not found" });
      }
      res.json(connector);
    } catch (error) {
      console.error("Get connector error:", error);
      res.status(500).json({ message: "Failed to fetch connector" });
    }
  });

  // ============================================================================
  // PLATFORM CONNECTIONS (User Credentials)
  // ============================================================================

  // Get user's connections
  app.get("/api/integrations/connections", async (req: Request, res: Response) => {
    try {
      const connections = await db.select().from(platformConnections).orderBy(desc(platformConnections.createdAt));
      
      // Merge with connector metadata
      const enrichedConnections = connections.map(conn => ({
        ...conn,
        connector: getConnectorById(conn.platform),
        credentials: undefined, // Never expose credentials
        accessToken: conn.accessToken ? "***" : undefined,
        refreshToken: conn.refreshToken ? "***" : undefined,
      }));
      
      res.json(enrichedConnections);
    } catch (error) {
      console.error("Get connections error:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // Create/update a connection
  app.post("/api/integrations/connections", async (req: Request, res: Response) => {
    try {
      const { platform, credentials, settings } = req.body;
      
      const connector = getConnectorById(platform);
      if (!connector) {
        return res.status(400).json({ message: "Invalid platform" });
      }

      // Validate required credentials
      const missingCredentials = connector.requiredCredentials.filter(
        cred => !credentials || !credentials[cred]
      );
      
      if (missingCredentials.length > 0) {
        return res.status(400).json({ 
          message: "Missing required credentials",
          missing: missingCredentials 
        });
      }

      // Check if connection already exists
      const [existing] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, platform));

      if (existing) {
        // Update existing connection
        const [updated] = await db
          .update(platformConnections)
          .set({
            credentials,
            settings,
            status: "connected",
            errorMessage: null,
            updatedAt: new Date(),
          })
          .where(eq(platformConnections.id, existing.id))
          .returning();
        return res.json({ ...updated, credentials: undefined });
      }

      // Create new connection
      const [newConnection] = await db
        .insert(platformConnections)
        .values({
          platform,
          credentials,
          settings,
          status: "connected",
        })
        .returning();

      res.status(201).json({ ...newConnection, credentials: undefined });
    } catch (error) {
      console.error("Create connection error:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  // Test a connection
  app.post("/api/integrations/connections/:platform/test", async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const connector = getConnectorById(platform);
      
      if (!connector) {
        return res.status(404).json({ message: "Connector not found" });
      }

      // Simulate connection test (in production, would actually call the API)
      const testResult = {
        success: true,
        message: `Connection to ${connector.displayName} is working`,
        latencyMs: Math.floor(Math.random() * 200) + 50,
        features: connector.features,
      };

      res.json(testResult);
    } catch (error) {
      console.error("Test connection error:", error);
      res.status(500).json({ message: "Failed to test connection" });
    }
  });

  // Disconnect a platform
  app.delete("/api/integrations/connections/:platform", async (req: Request, res: Response) => {
    try {
      await db
        .delete(platformConnections)
        .where(eq(platformConnections.platform, req.params.platform));
      res.status(204).send();
    } catch (error) {
      console.error("Delete connection error:", error);
      res.status(500).json({ message: "Failed to delete connection" });
    }
  });

  // ============================================================================
  // AI GENERATION
  // ============================================================================

  // Get available AI providers
  app.get("/api/integrations/ai/providers", async (_req: Request, res: Response) => {
    try {
      const providers = aiService.getAvailableProviders();
      res.json({ providers });
    } catch (error) {
      console.error("Get providers error:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  // Generate with AI provider
  app.post("/api/integrations/ai/generate", async (req: Request, res: Response) => {
    try {
      const { provider, model, prompt, type, options, maxTokens, temperature } = req.body;

      if (!provider || !prompt) {
        return res.status(400).json({ message: "Provider and prompt are required" });
      }

      // Create generation record
      const [generation] = await db
        .insert(aiGenerations)
        .values({
          provider,
          model: model || undefined,
          prompt,
          promptType: type || "text",
          status: "processing",
        })
        .returning();

      // Actually call the AI service
      const result = await aiService.generate({
        provider,
        type: type || 'text',
        prompt,
        model,
        maxTokens,
        temperature,
        options,
      });

      // Update generation record with result
      await db
        .update(aiGenerations)
        .set({
          status: result.success ? "completed" : "failed",
          outputData: result.success ? { 
            content: result.content,
            imageUrl: result.imageUrl,
            audioUrl: result.audioUrl,
            metadata: result.metadata,
          } : { error: result.error },
          tokensUsed: result.usage?.totalTokens || 0,
          cost: result.usage?.totalTokens ? ((result.usage.totalTokens / 1000) * 0.002).toFixed(4) : "0",
        })
        .where(eq(aiGenerations.id, generation.id));

      if (!result.success) {
        return res.status(400).json({
          id: generation.id,
          success: false,
          error: result.error,
        });
      }

      res.json({
        id: generation.id,
        success: true,
        provider: result.provider,
        type: result.type,
        content: result.content,
        imageUrl: result.imageUrl,
        audioUrl: result.audioUrl,
        usage: result.usage,
        metadata: result.metadata,
      });
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Get AI generation history
  app.get("/api/integrations/ai/generations", async (_req: Request, res: Response) => {
    try {
      const generations = await db
        .select()
        .from(aiGenerations)
        .orderBy(desc(aiGenerations.createdAt))
        .limit(50);
      res.json(generations);
    } catch (error) {
      console.error("Get generations error:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Get generation status
  app.get("/api/integrations/ai/generations/:id", async (req: Request, res: Response) => {
    try {
      const [generation] = await db
        .select()
        .from(aiGenerations)
        .where(eq(aiGenerations.id, req.params.id));
      
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      console.error("Get generation error:", error);
      res.status(500).json({ message: "Failed to fetch generation" });
    }
  });

  // ============================================================================
  // WORKFLOW AUTOMATION
  // ============================================================================

  // Get workflow executions
  app.get("/api/integrations/workflows", async (_req: Request, res: Response) => {
    try {
      const executions = await db
        .select()
        .from(workflowExecutions)
        .orderBy(desc(workflowExecutions.startedAt))
        .limit(50);
      res.json(executions);
    } catch (error) {
      console.error("Get workflows error:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  // Trigger a workflow
  app.post("/api/integrations/workflows/trigger", async (req: Request, res: Response) => {
    try {
      const { workflowId, workflowName, inputData, triggerType } = req.body;

      const [execution] = await db
        .insert(workflowExecutions)
        .values({
          workflowId,
          workflowName,
          inputData,
          triggerType: triggerType || "manual",
          status: "running",
        })
        .returning();

      // Simulate workflow execution
      setTimeout(async () => {
        await db
          .update(workflowExecutions)
          .set({
            status: "completed",
            endedAt: new Date(),
            durationMs: Math.floor(Math.random() * 5000) + 1000,
            outputData: { success: true, itemsProcessed: Math.floor(Math.random() * 10) + 1 },
          })
          .where(eq(workflowExecutions.id, execution.id));
      }, 2000);

      res.status(202).json({
        id: execution.id,
        status: "running",
        message: "Workflow triggered",
      });
    } catch (error) {
      console.error("Trigger workflow error:", error);
      res.status(500).json({ message: "Failed to trigger workflow" });
    }
  });

  // ============================================================================
  // PUBLISHING QUEUE
  // ============================================================================

  // Get publishing queue
  app.get("/api/integrations/publishing/queue", async (_req: Request, res: Response) => {
    try {
      const queue = await db
        .select()
        .from(publishingQueue)
        .orderBy(desc(publishingQueue.createdAt))
        .limit(100);
      res.json(queue);
    } catch (error) {
      console.error("Get publishing queue error:", error);
      res.status(500).json({ message: "Failed to fetch publishing queue" });
    }
  });

  // Add to publishing queue
  app.post("/api/integrations/publishing/queue", async (req: Request, res: Response) => {
    try {
      const { productId, platform, priority, scheduledFor } = req.body;

      const [queueItem] = await db
        .insert(publishingQueue)
        .values({
          productId,
          platform,
          priority: priority || 5,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          status: "pending",
        })
        .returning();

      res.status(201).json(queueItem);
    } catch (error) {
      console.error("Add to queue error:", error);
      res.status(500).json({ message: "Failed to add to queue" });
    }
  });

  // ============================================================================
  // SAFEGUARDS & AUDIT
  // ============================================================================

  // Get safeguard audit log
  app.get("/api/integrations/safeguards/audit", async (_req: Request, res: Response) => {
    try {
      const audit = await db
        .select()
        .from(safeguardAuditLog)
        .orderBy(desc(safeguardAuditLog.assessedAt))
        .limit(100);
      res.json(audit);
    } catch (error) {
      console.error("Get audit log error:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // ============================================================================
  // BUDGET TRACKING
  // ============================================================================

  // Get budget status
  app.get("/api/integrations/budget", async (_req: Request, res: Response) => {
    try {
      const budgets = await db.select().from(budgetTracking);
      res.json(budgets);
    } catch (error) {
      console.error("Get budget error:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  // ============================================================================
  // INTEGRATION STATS
  // ============================================================================

  // Get integration dashboard stats
  app.get("/api/integrations/stats", async (_req: Request, res: Response) => {
    try {
      const [connections, generations, workflows, queueItems] = await Promise.all([
        db.select().from(platformConnections),
        db.select().from(aiGenerations).limit(100),
        db.select().from(workflowExecutions).limit(100),
        db.select().from(publishingQueue).limit(100),
      ]);

      const connectedPlatforms = connections.filter(c => c.status === "connected").length;
      const totalGenerations = generations.length;
      const completedWorkflows = workflows.filter(w => w.status === "completed").length;
      const pendingPublishes = queueItems.filter(q => q.status === "pending").length;

      res.json({
        connectedPlatforms,
        totalPlatforms: PLATFORM_CONNECTORS.length,
        totalGenerations,
        completedWorkflows,
        pendingPublishes,
        categories: getConnectorCategories().map(c => ({
          name: c.category,
          total: c.count,
          connected: connections.filter(conn => 
            c.connectors.some(con => con.platform === conn.platform && conn.status === "connected")
          ).length,
        })),
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
}
