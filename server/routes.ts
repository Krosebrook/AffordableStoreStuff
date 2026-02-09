import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerIntegrationRoutes } from "./integrations/routes";
import aiToolsRouter from "./integrations/ai-tools-routes";
import merchRouter from "./merch-routes";
import socialRouter from "./social-routes";
import teamRouter from "./team-routes";
import authRouter from "./routes/auth-routes";
import productRouter from "./routes/product-routes";
import categoryRouter from "./routes/category-routes";
import cartRouter from "./routes/cart-routes";
import orderRouter from "./routes/order-routes";
import seedRouter from "./routes/seed-routes";
import billingRouter from "./routes/billing-routes";
import publishingQueueRouter from "./routes/publishing-queue-routes";
import workflowRouter from "./integrations/workflow-routes";
import ecomTemplatesRouter from "./integrations/ecom-templates";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth (BEFORE other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Register integration routes (uses app.get/post directly)
  registerIntegrationRoutes(app);

  // Cache-Control for public GET endpoints
  app.use("/api/products", (req, res, next) => {
    if (req.method === "GET") res.setHeader("Cache-Control", "public, max-age=60");
    next();
  });
  app.use("/api/categories", (req, res, next) => {
    if (req.method === "GET") res.setHeader("Cache-Control", "public, max-age=300");
    next();
  });

  // Mount routers
  app.use("/api/ai", aiToolsRouter);
  app.use("/api/merch", merchRouter);
  app.use("/api/social", socialRouter);
  app.use("/api/team", teamRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/seed", seedRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/publishing-queue", publishingQueueRouter);
  app.use("/api/workflows", workflowRouter);
  app.use("/api/integrations/templates", ecomTemplatesRouter);

  return httpServer;
}
