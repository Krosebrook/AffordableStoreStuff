import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// PLATFORM INTEGRATIONS
// ============================================================================

// Platform connectors registry
export const platformConnectors = pgTable("platform_connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  category: text("category").notNull(), // 'ai', 'ecommerce', 'automation', 'infrastructure', 'business', 'productivity'
  connectorType: text("connector_type").notNull(), // 'oauth', 'api_key', 'webhook', 'basic_auth'
  baseUrl: text("base_url"),
  docsUrl: text("docs_url"),
  isEnabled: boolean("is_enabled").default(true),
  isBuiltIn: boolean("is_built_in").default(false),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User platform connections (credentials stored securely)
export const platformConnections = pgTable("platform_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  platform: text("platform").notNull().unique(),
  status: text("status").default("disconnected").notNull(), // 'connected', 'disconnected', 'error', 'pending'
  credentials: jsonb("credentials"), // encrypted credentials
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret"),
  settings: jsonb("settings"),
  lastSyncAt: timestamp("last_sync_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// API rate limits tracking
export const apiRateLimits = pgTable("api_rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(),
  endpoint: text("endpoint"),
  requestCount: integer("request_count").default(0),
  limitPerMinute: integer("limit_per_minute").default(60),
  windowStart: timestamp("window_start").defaultNow(),
  lastRequestAt: timestamp("last_request_at"),
});

// Workflow executions
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: text("workflow_id").notNull(),
  workflowName: text("workflow_name"),
  status: text("status").default("running").notNull(), // 'running', 'completed', 'failed', 'cancelled'
  triggerType: text("trigger_type"), // 'scheduled', 'manual', 'webhook', 'event'
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationMs: integer("duration_ms"),
});

// Safeguard audit log
export const safeguardAuditLog = pgTable("safeguard_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id"),
  safeguardName: text("safeguard_name").notNull(),
  decision: text("decision").notNull(), // 'pass', 'fail', 'warn', 'skip'
  reason: text("reason"),
  score: real("score"),
  threshold: real("threshold"),
  executionTimeMs: integer("execution_time_ms"),
  metadata: jsonb("metadata"),
  assessedAt: timestamp("assessed_at").defaultNow(),
});

// Budget tracking
export const budgetTracking = pgTable("budget_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  category: text("category").notNull(), // 'ai', 'publishing', 'total'
  currentSpend: decimal("current_spend", { precision: 10, scale: 2 }).default("0"),
  budgetLimit: decimal("budget_limit", { precision: 10, scale: 2 }).notNull(),
  periodStart: timestamp("period_start").defaultNow(),
  periodEnd: timestamp("period_end"),
  isExceeded: boolean("is_exceeded").default(false),
});

// AI generation history
export const aiGenerations = pgTable("ai_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  provider: text("provider").notNull(), // 'openai', 'anthropic', 'gemini', 'elevenlabs', 'grok', 'perplexity'
  model: text("model"),
  promptType: text("prompt_type"), // 'image', 'text', 'audio', 'code'
  prompt: text("prompt"),
  outputUrl: text("output_url"),
  outputData: jsonb("output_data"),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 4 }),
  status: text("status").default("pending"), // 'pending', 'processing', 'completed', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// AI TOOLS - Brand Voice, Marketing, Product Creator
// ============================================================================

// Brand voice profiles for AI consistency
export const brandVoiceProfiles = pgTable("brand_voice_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  // Voice characteristics
  tone: text("tone").default("professional"), // 'professional', 'casual', 'playful', 'authoritative', 'friendly'
  personality: text("personality").array().default(sql`ARRAY[]::text[]`), // ['innovative', 'trustworthy', 'bold']
  targetAudience: text("target_audience"),
  brandValues: text("brand_values").array().default(sql`ARRAY[]::text[]`),
  // Language preferences
  writingStyle: text("writing_style").default("conversational"), // 'formal', 'conversational', 'technical', 'creative'
  vocabularyLevel: text("vocabulary_level").default("intermediate"), // 'simple', 'intermediate', 'advanced', 'technical'
  avoidWords: text("avoid_words").array().default(sql`ARRAY[]::text[]`),
  preferredPhrases: text("preferred_phrases").array().default(sql`ARRAY[]::text[]`),
  // Examples for AI training
  exampleContent: jsonb("example_content"), // { headlines: [], descriptions: [], emails: [] }
  // Metadata
  industry: text("industry"),
  colorPalette: text("color_palette").array().default(sql`ARRAY[]::text[]`),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI-generated product concepts
export const productConcepts = pgTable("product_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  brandVoiceId: varchar("brand_voice_id").references(() => brandVoiceProfiles.id),
  // Input
  prompt: text("prompt").notNull(),
  marketplace: text("marketplace").default("general"), // 'tech', 'fashion', 'lifestyle', 'home', 'sports'
  targetPlatforms: text("target_platforms").array().default(sql`ARRAY[]::text[]`), // ['shopify', 'etsy', 'amazon']
  priceRange: text("price_range"), // 'budget', 'mid', 'premium', 'luxury'
  // AI Generated Content
  generatedTitle: text("generated_title"),
  generatedDescription: text("generated_description"),
  generatedTags: text("generated_tags").array().default(sql`ARRAY[]::text[]`),
  generatedFeatures: text("generated_features").array().default(sql`ARRAY[]::text[]`),
  // Generated Images
  generatedImages: jsonb("generated_images"), // [{ url, prompt, style }]
  heroImageUrl: text("hero_image_url"),
  thumbnailUrl: text("thumbnail_url"),
  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array().default(sql`ARRAY[]::text[]`),
  // Status & metadata
  status: text("status").default("draft"), // 'draft', 'generating', 'ready', 'published', 'archived'
  qualityScore: real("quality_score"),
  aiProvider: text("ai_provider"),
  generationCost: decimal("generation_cost", { precision: 10, scale: 4 }),
  publishedToProducts: boolean("published_to_products").default(false),
  productId: varchar("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketing campaigns with AI-generated assets
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  brandVoiceId: varchar("brand_voice_id").references(() => brandVoiceProfiles.id),
  // Campaign basics
  name: text("name").notNull(),
  objective: text("objective"), // 'awareness', 'traffic', 'engagement', 'conversions', 'sales'
  description: text("description"),
  // Targeting
  targetAudience: jsonb("target_audience"), // { age, gender, interests, locations }
  channels: text("channels").array().default(sql`ARRAY[]::text[]`), // ['email', 'social', 'ads', 'sms']
  platforms: text("platforms").array().default(sql`ARRAY[]::text[]`), // ['instagram', 'facebook', 'tiktok', 'email']
  // Schedule
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("draft"), // 'draft', 'scheduled', 'active', 'paused', 'completed'
  // Generated content
  generatedAssets: jsonb("generated_assets"), // { emails: [], socialPosts: [], adCopy: [], headlines: [] }
  // Metrics
  budget: decimal("budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  // AI metadata
  aiProvider: text("ai_provider"),
  generationCost: decimal("generation_cost", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI content library - reusable generated content
export const aiContentLibrary = pgTable("ai_content_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  brandVoiceId: varchar("brand_voice_id").references(() => brandVoiceProfiles.id),
  // Content details
  contentType: text("content_type").notNull(), // 'headline', 'description', 'email', 'social_post', 'ad_copy', 'image', 'video_script'
  title: text("title"),
  content: text("content"),
  mediaUrl: text("media_url"),
  // Organization
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  category: text("category"),
  isFavorite: boolean("is_favorite").default(false),
  usageCount: integer("usage_count").default(0),
  // AI metadata
  prompt: text("prompt"),
  aiProvider: text("ai_provider"),
  model: text("model"),
  generationCost: decimal("generation_cost", { precision: 10, scale: 4 }),
  // Quality
  rating: integer("rating"), // 1-5 user rating
  qualityScore: real("quality_score"), // AI-assessed quality
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product publishing queue
export const publishingQueue = pgTable("publishing_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id),
  platform: text("platform").notNull(),
  status: text("status").default("pending"), // 'pending', 'processing', 'published', 'failed', 'rejected'
  priority: integer("priority").default(5),
  safeguardsPassed: boolean("safeguards_passed").default(false),
  trademarkCleared: boolean("trademark_cleared").default(false),
  qualityScore: real("quality_score"),
  externalId: text("external_id"), // ID on the external platform
  externalUrl: text("external_url"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: text("role").default("customer").notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: varchar("parent_id"),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  categoryId: varchar("category_id").references(() => categories.id),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  stock: integer("stock").default(0).notNull(),
  sku: text("sku"),
  featured: boolean("featured").default(false),
  status: text("status").default("active").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  metadata: jsonb("metadata"),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// Integration insert schemas
export const insertPlatformConnectorSchema = createInsertSchema(platformConnectors).omit({ id: true, createdAt: true });
export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({ id: true, startedAt: true });
export const insertAiGenerationSchema = createInsertSchema(aiGenerations).omit({ id: true, createdAt: true });
export const insertPublishingQueueSchema = createInsertSchema(publishingQueue).omit({ id: true, createdAt: true });

// AI Tools insert schemas
export const insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductConceptSchema = createInsertSchema(productConcepts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiContentLibrarySchema = createInsertSchema(aiContentLibrary).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Extended types for frontend
export type ProductWithCategory = Product & {
  category?: Category | null;
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};

// Address schema for validation
export const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export type Address = z.infer<typeof addressSchema>;

// Integration types
export type PlatformConnector = typeof platformConnectors.$inferSelect;
export type InsertPlatformConnector = z.infer<typeof insertPlatformConnectorSchema>;

export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;

export type ApiRateLimit = typeof apiRateLimits.$inferSelect;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;

export type SafeguardAuditEntry = typeof safeguardAuditLog.$inferSelect;
export type BudgetTrack = typeof budgetTracking.$inferSelect;

export type AiGeneration = typeof aiGenerations.$inferSelect;
export type InsertAiGeneration = z.infer<typeof insertAiGenerationSchema>;

export type PublishingQueueItem = typeof publishingQueue.$inferSelect;
export type InsertPublishingQueueItem = z.infer<typeof insertPublishingQueueSchema>;

// AI Tools types
export type BrandVoiceProfile = typeof brandVoiceProfiles.$inferSelect;
export type InsertBrandVoiceProfile = z.infer<typeof insertBrandVoiceProfileSchema>;

export type ProductConcept = typeof productConcepts.$inferSelect;
export type InsertProductConcept = z.infer<typeof insertProductConceptSchema>;

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type AiContentItem = typeof aiContentLibrary.$inferSelect;
export type InsertAiContentItem = z.infer<typeof insertAiContentLibrarySchema>;

// Connector categories
export type ConnectorCategory = 'ai' | 'ecommerce' | 'automation' | 'infrastructure' | 'business' | 'productivity';
export type ConnectorType = 'oauth' | 'api_key' | 'webhook' | 'basic_auth';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';
