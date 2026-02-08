import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { registerIntegrationRoutes } from "./integrations/routes";
import aiToolsRouter from "./integrations/ai-tools-routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerAuthApiRoutes } from "./modules/auth/routes";
import { registerCatalogRoutes } from "./modules/catalog/routes";
import { registerCartRoutes } from "./modules/cart/routes";
import { registerOrderRoutes } from "./modules/orders/routes";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  registerIntegrationRoutes(app);
  app.use("/api/ai", aiToolsRouter);

  registerAuthApiRoutes(app, storage);
  registerCatalogRoutes(app, storage);
  registerCartRoutes(app, storage);
  registerOrderRoutes(app, storage);

  return httpServer;
}
