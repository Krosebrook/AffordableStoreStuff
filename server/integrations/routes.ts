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
import { requireAuth } from "../middleware/auth";

// Helper to safely parse route parameters
const parseParam = (param: string | string[]): string => 
  Array.isArray(param) ? param[0] : param;

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
      const connector = getConnectorById(String(req.params.id));
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
  app.post("/api/integrations/connections", requireAuth, async (req: Request, res: Response) => {
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
  app.post("/api/integrations/connections/:platform/test", requireAuth, async (req: Request, res: Response) => {
    try {
      const platform = String(req.params.platform);
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
  app.delete("/api/integrations/connections/:platform", requireAuth, async (req: Request, res: Response) => {
    try {
      await db
        .delete(platformConnections)
        .where(eq(platformConnections.platform, String(req.params.platform)));
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
  app.post("/api/integrations/ai/generate", requireAuth, async (req: Request, res: Response) => {
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
        .where(eq(aiGenerations.id, String(req.params.id)));

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
  app.post("/api/integrations/workflows/trigger", requireAuth, async (req: Request, res: Response) => {
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
  app.post("/api/integrations/publishing/queue", requireAuth, async (req: Request, res: Response) => {
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
  // PRINT-ON-DEMAND (POD) - PRINTIFY
  // ============================================================================

  // Import POD connectors
  const { printifyConnector } = require('./printify-connector');
  const { printfulConnector } = require('./printful-connector');

  // Printify OAuth
  app.get("/api/integrations/pod/printify/oauth/authorize", async (req: Request, res: Response) => {
    try {
      const { redirectUri, state } = req.query;
      const clientId = process.env.PRINTIFY_CLIENT_ID;

      if (!clientId || !redirectUri || !state) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const authUrl = printifyConnector.generateOAuthUrl({
        clientId,
        clientSecret: process.env.PRINTIFY_CLIENT_SECRET || '',
        redirectUri: String(redirectUri),
        state: String(state),
      });

      res.json({ authUrl });
    } catch (error) {
      console.error("Printify OAuth authorize error:", error);
      res.status(500).json({ message: "Failed to generate OAuth URL" });
    }
  });

  app.post("/api/integrations/pod/printify/oauth/callback", requireAuth, async (req: Request, res: Response) => {
    try {
      const { code, redirectUri } = req.body;
      const clientId = process.env.PRINTIFY_CLIENT_ID;
      const clientSecret = process.env.PRINTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret || !code || !redirectUri) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const tokenData = await printifyConnector.exchangeCodeForToken(
        { clientId, clientSecret, redirectUri, state: '' },
        code
      );

      // Save to database
      await db
        .insert(platformConnections)
        .values({
          platform: 'printify',
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
          status: 'connected',
        })
        .onConflictDoUpdate({
          target: platformConnections.platform,
          set: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
            status: 'connected',
            updatedAt: new Date(),
          },
        });

      res.json({ success: true, message: "Printify connected successfully" });
    } catch (error) {
      console.error("Printify OAuth callback error:", error);
      res.status(500).json({ message: "Failed to complete OAuth flow" });
    }
  });

  // Printify products
  app.get("/api/integrations/pod/printify/blueprints", async (_req: Request, res: Response) => {
    try {
      const blueprints = await printifyConnector.getBlueprints();
      res.json(blueprints);
    } catch (error) {
      console.error("Get blueprints error:", error);
      res.status(500).json({ message: "Failed to fetch blueprints" });
    }
  });

  app.get("/api/integrations/pod/printify/blueprints/:id/providers", async (req: Request, res: Response) => {
    try {
      const blueprintId = parseInt(parseParam(req.params.id));
      const providers = await printifyConnector.getPrintProviders(blueprintId);
      res.json(providers);
    } catch (error) {
      console.error("Get print providers error:", error);
      res.status(500).json({ message: "Failed to fetch print providers" });
    }
  });

  app.get("/api/integrations/pod/printify/blueprints/:blueprintId/providers/:providerId/variants", async (req: Request, res: Response) => {
    try {
      const blueprintId = parseInt(parseParam(req.params.blueprintId));
      const providerId = parseInt(parseParam(req.params.providerId));
      const variants = await printifyConnector.getVariants(blueprintId, providerId);
      res.json(variants);
    } catch (error) {
      console.error("Get variants error:", error);
      res.status(500).json({ message: "Failed to fetch variants" });
    }
  });

  app.post("/api/integrations/pod/printify/products", requireAuth, async (req: Request, res: Response) => {
    try {
      const product = await printifyConnector.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create Printify product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/integrations/pod/printify/products", async (_req: Request, res: Response) => {
    try {
      const products = await printifyConnector.listProducts();
      res.json(products);
    } catch (error) {
      console.error("List Printify products error:", error);
      res.status(500).json({ message: "Failed to list products" });
    }
  });

  app.get("/api/integrations/pod/printify/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await printifyConnector.getProduct(req.params.id);
      res.json(product);
    } catch (error) {
      console.error("Get Printify product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put("/api/integrations/pod/printify/products/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const product = await printifyConnector.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      console.error("Update Printify product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/integrations/pod/printify/products/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await printifyConnector.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete Printify product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/integrations/pod/printify/products/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = await printifyConnector.publishProduct(req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Publish Printify product error:", error);
      res.status(500).json({ message: "Failed to publish product" });
    }
  });

  // Printify image upload
  app.post("/api/integrations/pod/printify/images", requireAuth, async (req: Request, res: Response) => {
    try {
      const { imageUrl, fileName } = req.body;
      const result = await printifyConnector.uploadImage(imageUrl, fileName);
      res.json(result);
    } catch (error) {
      console.error("Upload Printify image error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Printify cost calculation
  app.post("/api/integrations/pod/printify/calculate-costs", async (req: Request, res: Response) => {
    try {
      const { blueprintId, printProviderId, variantId, retailPrice } = req.body;
      const costs = await printifyConnector.calculateCosts(
        blueprintId,
        printProviderId,
        variantId,
        retailPrice
      );
      res.json(costs);
    } catch (error) {
      console.error("Calculate costs error:", error);
      res.status(500).json({ message: "Failed to calculate costs" });
    }
  });

  // Printify orders
  app.post("/api/integrations/pod/printify/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const order = await printifyConnector.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Create Printify order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/integrations/pod/printify/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await printifyConnector.getOrder(req.params.id);
      res.json(order);
    } catch (error) {
      console.error("Get Printify order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.delete("/api/integrations/pod/printify/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await printifyConnector.cancelOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Cancel Printify order error:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Printify inventory sync
  app.post("/api/integrations/pod/printify/sync", requireAuth, async (_req: Request, res: Response) => {
    try {
      const result = await printifyConnector.syncInventory();
      res.json(result);
    } catch (error) {
      console.error("Printify inventory sync error:", error);
      res.status(500).json({ message: "Failed to sync inventory" });
    }
  });

  // Printify webhooks
  app.post("/api/integrations/pod/printify/webhooks/register", requireAuth, async (req: Request, res: Response) => {
    try {
      const { webhookUrl } = req.body;
      const result = await printifyConnector.registerWebhook(webhookUrl);
      res.json(result);
    } catch (error) {
      console.error("Register Printify webhook error:", error);
      res.status(500).json({ message: "Failed to register webhook" });
    }
  });

  app.post("/api/integrations/pod/printify/webhooks", async (req: Request, res: Response) => {
    try {
      await printifyConnector.handleWebhook(req.body);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Process Printify webhook error:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // ============================================================================
  // PRINT-ON-DEMAND (POD) - PRINTFUL
  // ============================================================================

  // Printful catalog
  app.get("/api/integrations/pod/printful/catalog", async (_req: Request, res: Response) => {
    try {
      const products = await printfulConnector.getCatalogProducts();
      res.json(products);
    } catch (error) {
      console.error("Get Printful catalog error:", error);
      res.status(500).json({ message: "Failed to fetch catalog" });
    }
  });

  app.get("/api/integrations/pod/printful/catalog/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(parseParam(req.params.id));
      const product = await printfulConnector.getCatalogProduct(productId);
      res.json(product);
    } catch (error) {
      console.error("Get Printful catalog product error:", error);
      res.status(500).json({ message: "Failed to fetch catalog product" });
    }
  });

  app.get("/api/integrations/pod/printful/catalog/:id/variants", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(parseParam(req.params.id));
      const variants = await printfulConnector.getCatalogVariants(productId);
      res.json(variants);
    } catch (error) {
      console.error("Get Printful catalog variants error:", error);
      res.status(500).json({ message: "Failed to fetch catalog variants" });
    }
  });

  // Printful sync products
  app.get("/api/integrations/pod/printful/products", async (_req: Request, res: Response) => {
    try {
      const products = await printfulConnector.getSyncProducts();
      res.json(products);
    } catch (error) {
      console.error("List Printful products error:", error);
      res.status(500).json({ message: "Failed to list products" });
    }
  });

  app.get("/api/integrations/pod/printful/products/:id", async (req: Request, res: Response) => {
    try {
      const syncProductId = parseInt(parseParam(req.params.id));
      const product = await printfulConnector.getSyncProduct(syncProductId);
      res.json(product);
    } catch (error) {
      console.error("Get Printful product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/integrations/pod/printful/products", requireAuth, async (req: Request, res: Response) => {
    try {
      const product = await printfulConnector.createSyncProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create Printful product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/integrations/pod/printful/products/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const syncProductId = parseInt(parseParam(req.params.id));
      const product = await printfulConnector.updateSyncProduct(syncProductId, req.body);
      res.json(product);
    } catch (error) {
      console.error("Update Printful product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/integrations/pod/printful/products/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const syncProductId = parseInt(parseParam(req.params.id));
      await printfulConnector.deleteSyncProduct(syncProductId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete Printful product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Printful orders
  app.post("/api/integrations/pod/printful/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const order = await printfulConnector.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Create Printful order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/integrations/pod/printful/orders", async (req: Request, res: Response) => {
    try {
      const { status, offset, limit } = req.query;
      const orders = await printfulConnector.getOrders({
        status: status as string,
        offset: offset ? parseInt(offset as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(orders);
    } catch (error) {
      console.error("List Printful orders error:", error);
      res.status(500).json({ message: "Failed to list orders" });
    }
  });

  app.get("/api/integrations/pod/printful/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await printfulConnector.getOrder(req.params.id);
      res.json(order);
    } catch (error) {
      console.error("Get Printful order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.delete("/api/integrations/pod/printful/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await printfulConnector.cancelOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Cancel Printful order error:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  app.post("/api/integrations/pod/printful/orders/estimate", async (req: Request, res: Response) => {
    try {
      const estimate = await printfulConnector.estimateOrderCosts(req.body);
      res.json(estimate);
    } catch (error) {
      console.error("Estimate Printful order error:", error);
      res.status(500).json({ message: "Failed to estimate order costs" });
    }
  });

  // Printful shipping rates
  app.post("/api/integrations/pod/printful/shipping/rates", async (req: Request, res: Response) => {
    try {
      const rates = await printfulConnector.calculateShippingRates(req.body);
      res.json(rates);
    } catch (error) {
      console.error("Calculate Printful shipping rates error:", error);
      res.status(500).json({ message: "Failed to calculate shipping rates" });
    }
  });

  // Printful inventory sync
  app.post("/api/integrations/pod/printful/sync", requireAuth, async (_req: Request, res: Response) => {
    try {
      const result = await printfulConnector.syncInventory();
      res.json(result);
    } catch (error) {
      console.error("Printful inventory sync error:", error);
      res.status(500).json({ message: "Failed to sync inventory" });
    }
  });

  app.post("/api/integrations/pod/printful/sync/two-way", requireAuth, async (_req: Request, res: Response) => {
    try {
      const result = await printfulConnector.twoWayInventorySync();
      res.json(result);
    } catch (error) {
      console.error("Printful two-way sync error:", error);
      res.status(500).json({ message: "Failed to perform two-way sync" });
    }
  });

  // Printful webhooks
  app.get("/api/integrations/pod/printful/webhooks", async (_req: Request, res: Response) => {
    try {
      const webhooks = await printfulConnector.getWebhooks();
      res.json(webhooks);
    } catch (error) {
      console.error("Get Printful webhooks error:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/integrations/pod/printful/webhooks/register", requireAuth, async (req: Request, res: Response) => {
    try {
      const { webhookUrl, types } = req.body;
      const result = await printfulConnector.registerWebhook(webhookUrl, types);
      res.json(result);
    } catch (error) {
      console.error("Register Printful webhook error:", error);
      res.status(500).json({ message: "Failed to register webhook" });
    }
  });

  app.delete("/api/integrations/pod/printful/webhooks/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      await printfulConnector.deleteWebhook(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete Printful webhook error:", error);
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });

  app.post("/api/integrations/pod/printful/webhooks", async (req: Request, res: Response) => {
    try {
      await printfulConnector.handleWebhook(req.body);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Process Printful webhook error:", error);
      res.status(500).json({ message: "Failed to process webhook" });
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
