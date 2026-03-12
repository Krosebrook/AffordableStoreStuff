var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import { createServer as createServer2 } from "node:http";

// server/routes.ts
import { createServer } from "node:http";
import OpenAI3 from "openai";
import bcrypt from "bcryptjs";

// server/storage.ts
import { eq, desc, and } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiGenerations: () => aiGenerations,
  brandProfiles: () => brandProfiles,
  brandVoiceProfiles: () => brandVoiceProfiles,
  brandVoiceProfilesRelations: () => brandVoiceProfilesRelations,
  cartItems: () => cartItems,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  contentLibrary: () => contentLibrary,
  insertBrandProfileSchema: () => insertBrandProfileSchema,
  insertBrandVoiceProfileSchema: () => insertBrandVoiceProfileSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertContentLibrarySchema: () => insertContentLibrarySchema,
  insertMarketingCampaignSchema: () => insertMarketingCampaignSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertProductConceptSchema: () => insertProductConceptSchema,
  insertProductSchema: () => insertProductSchema,
  insertPublishingQueueSchema: () => insertPublishingQueueSchema,
  insertSocialContentSchema: () => insertSocialContentSchema,
  insertSocialPlatformSchema: () => insertSocialPlatformSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertUserSchema: () => insertUserSchema,
  marketingCampaigns: () => marketingCampaigns,
  marketingCampaignsRelations: () => marketingCampaignsRelations,
  marketplaceListings: () => marketplaceListings,
  marketplaceListingsRelations: () => marketplaceListingsRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  passwordResetTokens: () => passwordResetTokens,
  productConcepts: () => productConcepts,
  productConceptsRelations: () => productConceptsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  publishingQueue: () => publishingQueue,
  socialAnalytics: () => socialAnalytics,
  socialContent: () => socialContent,
  socialPlatforms: () => socialPlatforms,
  styleProfiles: () => styleProfiles,
  subscriptionPlans: () => subscriptionPlans,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  teamMembers: () => teamMembers,
  teamMembersRelations: () => teamMembersRelations,
  teams: () => teams,
  teamsRelations: () => teamsRelations,
  users: () => users,
  wardrobeItems: () => wardrobeItems
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, decimal, jsonb, boolean, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  aiCreditsUsed: integer("ai_credits_used").notNull().default(0),
  aiCreditsLimit: integer("ai_credits_limit").notNull().default(100),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  sku: text("sku").notNull().default(""),
  category: text("category").notNull().default(""),
  tags: jsonb("tags").$type().notNull().default([]),
  images: jsonb("images").$type().notNull().default([]),
  inventoryCount: integer("inventory_count").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  marketplace: text("marketplace").notNull(),
  externalId: text("external_id"),
  status: text("status").notNull().default("draft"),
  customTitle: text("custom_title"),
  customDescription: text("custom_description"),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  listingData: jsonb("listing_data").$type(),
  generatedImages: jsonb("generated_images").$type().notNull().default([]),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  marketplace: text("marketplace").notNull(),
  externalOrderId: text("external_order_id"),
  productId: integer("product_id"),
  productTitle: text("product_title").notNull(),
  customerName: text("customer_name").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var brandProfiles = pgTable("brand_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tone: text("tone").notNull().default("professional"),
  targetAudience: text("target_audience").notNull().default(""),
  keywords: jsonb("keywords").$type().notNull().default([]),
  description: text("description").notNull().default(""),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var contentLibrary = pgTable("content_library", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  platform: text("platform"),
  productId: integer("product_id"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var aiGenerations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  output: text("output").notNull(),
  tokensUsed: integer("tokens_used").notNull().default(0),
  model: text("model").notNull().default("gpt-5.2"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var styleProfiles = pgTable("style_profiles", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  aesthetics: jsonb("aesthetics").$type().notNull().default([]),
  colors: jsonb("colors").$type().notNull().default([]),
  patterns: jsonb("patterns").$type().notNull().default([]),
  occasions: jsonb("occasions").$type().notNull().default([]),
  lifestyle: text("lifestyle"),
  styleDna: jsonb("style_dna").$type(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var wardrobeItems = pgTable("wardrobe_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color"),
  imageUrl: text("image_url"),
  tags: jsonb("tags").$type().notNull().default([]),
  wearCount: integer("wear_count").notNull().default(0),
  lastWorn: timestamp("last_worn"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});
var categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: varchar("parent_id")
});
var orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull()
}, (table) => [
  index("idx_order_items_order_id").on(table.orderId)
]);
var subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stripePriceId: text("stripe_price_id"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: text("interval").default("month").notNull(),
  productLimit: integer("product_limit"),
  aiCreditsLimit: integer("ai_credits_limit"),
  teamMembersLimit: integer("team_members_limit"),
  storageLimit: integer("storage_limit"),
  features: jsonb("features"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  planId: varchar("plan_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_subscriptions_user_id").on(table.userId),
  index("idx_subscriptions_status").on(table.status)
]);
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var publishingQueue = pgTable("publishing_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: integer("product_id").notNull(),
  platform: text("platform").notNull(),
  status: text("status").default("pending"),
  priority: integer("priority").default(5),
  safeguardsPassed: boolean("safeguards_passed").default(false),
  trademarkCleared: boolean("trademark_cleared").default(false),
  qualityScore: real("quality_score"),
  externalId: text("external_id"),
  externalUrl: text("external_url"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("idx_publishing_queue_status").on(table.status),
  index("idx_publishing_queue_scheduled_for").on(table.scheduledFor)
]);
var brandVoiceProfiles = pgTable("brand_voice_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  tone: text("tone").default("professional"),
  personality: jsonb("personality").$type().notNull().default([]),
  targetAudience: text("target_audience"),
  brandValues: jsonb("brand_values").$type().notNull().default([]),
  writingStyle: text("writing_style").default("conversational"),
  vocabularyLevel: text("vocabulary_level").default("intermediate"),
  avoidWords: jsonb("avoid_words").$type().notNull().default([]),
  preferredPhrases: jsonb("preferred_phrases").$type().notNull().default([]),
  exampleContent: jsonb("example_content"),
  industry: text("industry"),
  colorPalette: jsonb("color_palette").$type().notNull().default([]),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_brand_voice_profiles_user_id").on(table.userId)
]);
var productConcepts = pgTable("product_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  brandVoiceId: varchar("brand_voice_id"),
  prompt: text("prompt").notNull(),
  marketplace: text("marketplace").default("general"),
  targetPlatforms: jsonb("target_platforms").$type().notNull().default([]),
  priceRange: text("price_range"),
  generatedTitle: text("generated_title"),
  generatedDescription: text("generated_description"),
  generatedTags: jsonb("generated_tags").$type().notNull().default([]),
  generatedFeatures: jsonb("generated_features").$type().notNull().default([]),
  generatedImages: jsonb("generated_images"),
  heroImageUrl: text("hero_image_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: jsonb("seo_keywords").$type().notNull().default([]),
  status: text("status").default("draft"),
  qualityScore: real("quality_score"),
  aiProvider: text("ai_provider"),
  generationCost: decimal("generation_cost", { precision: 10, scale: 4 }),
  publishedToProducts: boolean("published_to_products").default(false),
  linkedProductId: integer("linked_product_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_product_concepts_user_id").on(table.userId)
]);
var marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  brandVoiceId: varchar("brand_voice_id"),
  name: text("name").notNull(),
  objective: text("objective"),
  description: text("description"),
  targetAudience: jsonb("target_audience"),
  channels: jsonb("channels").$type().notNull().default([]),
  platforms: jsonb("platforms").$type().notNull().default([]),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("draft"),
  generatedAssets: jsonb("generated_assets"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  aiProvider: text("ai_provider"),
  generationCost: decimal("generation_cost", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_marketing_campaigns_user_id").on(table.userId),
  index("idx_marketing_campaigns_status").on(table.status)
]);
var socialPlatforms = pgTable("social_platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  followerCount: integer("follower_count").default(0),
  connected: boolean("connected").default(true),
  connectedAt: timestamp("connected_at").defaultNow(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_social_platforms_user_id").on(table.userId)
]);
var socialContent = pgTable("social_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  title: text("title").notNull(),
  caption: text("caption").default(""),
  mediaUri: text("media_uri"),
  mediaType: text("media_type"),
  platforms: jsonb("platforms").$type().notNull().default([]),
  status: text("status").default("draft").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  failedReason: text("failed_reason"),
  tags: jsonb("tags").$type().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_social_content_user_id").on(table.userId),
  index("idx_social_content_status").on(table.status)
]);
var socialAnalytics = pgTable("social_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  platform: text("platform").notNull(),
  totalViews: integer("total_views").default(0),
  totalLikes: integer("total_likes").default(0),
  totalComments: integer("total_comments").default(0),
  totalShares: integer("total_shares").default(0),
  followerCount: integer("follower_count").default(0),
  engagementRate: real("engagement_rate").default(0),
  postsCount: integer("posts_count").default(0),
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull()
});
var teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  userId: text("user_id"),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").default("viewer").notNull(),
  status: text("status").default("pending").notNull(),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("idx_team_members_team_id").on(table.teamId),
  index("idx_team_members_user_id").on(table.userId)
]);
var productsRelations = relations(products, ({ many }) => ({
  listings: many(marketplaceListings)
}));
var marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  product: one(products, {
    fields: [marketplaceListings.productId],
    references: [products.id]
  })
}));
var categoriesRelations = relations(categories, ({ many, one }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] })
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] })
}));
var subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] })
}));
var brandVoiceProfilesRelations = relations(brandVoiceProfiles, ({ one }) => ({
  // userId is text referencing users.id which is varchar - compatible
}));
var productConceptsRelations = relations(productConcepts, ({ one }) => ({
  brandVoice: one(brandVoiceProfiles, { fields: [productConcepts.brandVoiceId], references: [brandVoiceProfiles.id] })
}));
var marketingCampaignsRelations = relations(marketingCampaigns, ({ one }) => ({
  brandVoice: one(brandVoiceProfiles, { fields: [marketingCampaigns.brandVoiceId], references: [brandVoiceProfiles.id] })
}));
var teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers)
}));
var teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBrandProfileSchema = createInsertSchema(brandProfiles).omit({
  id: true,
  createdAt: true
});
var insertContentLibrarySchema = createInsertSchema(contentLibrary).omit({
  id: true,
  createdAt: true
});
var insertCategorySchema = createInsertSchema(categories).omit({ id: true });
var insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
var insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
var insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
var insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
var insertPublishingQueueSchema = createInsertSchema(publishingQueue).omit({ id: true, createdAt: true });
var insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles).omit({ id: true, createdAt: true, updatedAt: true });
var insertProductConceptSchema = createInsertSchema(productConcepts).omit({ id: true, createdAt: true, updatedAt: true });
var insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
var insertSocialPlatformSchema = createInsertSchema(socialPlatforms).omit({ id: true, createdAt: true, updatedAt: true });
var insertSocialContentSchema = createInsertSchema(socialContent).omit({ id: true, createdAt: true, updatedAt: true });
var insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true, updatedAt: true });
var insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true, updatedAt: true });

// server/db.ts
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.VERCEL ? 3 : 10
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAllProducts() {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(data) {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }
  async updateProduct(id, data) {
    const [product] = await db.update(products).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return product || void 0;
  }
  async deleteProduct(id) {
    await db.delete(marketplaceListings).where(eq(marketplaceListings.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }
  async getListingsByProduct(productId) {
    return db.select().from(marketplaceListings).where(eq(marketplaceListings.productId, productId));
  }
  async getAllListings() {
    return db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
  }
  async getListing(id) {
    const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id));
    return listing || void 0;
  }
  async createListing(data) {
    const [listing] = await db.insert(marketplaceListings).values(data).returning();
    return listing;
  }
  async updateListing(id, data) {
    const [listing] = await db.update(marketplaceListings).set(data).where(eq(marketplaceListings.id, id)).returning();
    return listing || void 0;
  }
  async getAllOrders() {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async createOrder(data) {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }
  async updateOrderStatus(id, status) {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order || void 0;
  }
  async getAllBrandProfiles() {
    return db.select().from(brandProfiles).orderBy(desc(brandProfiles.createdAt));
  }
  async getBrandProfile(id) {
    const [profile] = await db.select().from(brandProfiles).where(eq(brandProfiles.id, id));
    return profile || void 0;
  }
  async createBrandProfile(data) {
    const [profile] = await db.insert(brandProfiles).values(data).returning();
    return profile;
  }
  async updateBrandProfile(id, data) {
    const [profile] = await db.update(brandProfiles).set(data).where(eq(brandProfiles.id, id)).returning();
    return profile || void 0;
  }
  async deleteBrandProfile(id) {
    await db.delete(brandProfiles).where(eq(brandProfiles.id, id));
  }
  async getAllContent() {
    return db.select().from(contentLibrary).orderBy(desc(contentLibrary.createdAt));
  }
  async createContent(data) {
    const [item] = await db.insert(contentLibrary).values(data).returning();
    return item;
  }
  async toggleContentFavorite(id) {
    const [existing] = await db.select().from(contentLibrary).where(eq(contentLibrary.id, id));
    if (!existing) return void 0;
    const [item] = await db.update(contentLibrary).set({ isFavorite: !existing.isFavorite }).where(eq(contentLibrary.id, id)).returning();
    return item || void 0;
  }
  async deleteContent(id) {
    await db.delete(contentLibrary).where(eq(contentLibrary.id, id));
  }
  async logAiGeneration(data) {
    await db.insert(aiGenerations).values(data);
  }
  async getAiUsageStats() {
    const all = await db.select().from(aiGenerations);
    return {
      totalGenerations: all.length,
      totalTokens: all.reduce((sum, g) => sum + g.tokensUsed, 0)
    };
  }
  async getCartItems(sessionId) {
    const items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId)).orderBy(desc(cartItems.createdAt));
    const result = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) {
        result.push({ ...item, product });
      }
    }
    return result;
  }
  async addToCart(sessionId, data) {
    const existing = await db.select().from(cartItems).where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, data.productId)));
    if (existing.length > 0) {
      const [updated] = await db.update(cartItems).set({ quantity: existing[0].quantity + data.quantity }).where(eq(cartItems.id, existing[0].id)).returning();
      return updated;
    }
    const [item] = await db.insert(cartItems).values({ sessionId, ...data }).returning();
    return item;
  }
  async updateCartItem(id, data) {
    const [item] = await db.update(cartItems).set(data).where(eq(cartItems.id, id)).returning();
    return item || void 0;
  }
  async removeCartItem(id) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }
  async getStyleProfile(sessionId) {
    const [profile] = await db.select().from(styleProfiles).where(eq(styleProfiles.sessionId, sessionId));
    return profile || void 0;
  }
  async saveStyleProfile(sessionId, data) {
    const existing = await this.getStyleProfile(sessionId);
    if (existing) {
      const [updated] = await db.update(styleProfiles).set(data).where(eq(styleProfiles.id, existing.id)).returning();
      return updated;
    }
    const [profile] = await db.insert(styleProfiles).values({ sessionId, ...data }).returning();
    return profile;
  }
  async getWardrobeItems(sessionId) {
    return db.select().from(wardrobeItems).where(eq(wardrobeItems.sessionId, sessionId)).orderBy(desc(wardrobeItems.createdAt));
  }
  async addWardrobeItem(sessionId, data) {
    const [item] = await db.insert(wardrobeItems).values({ sessionId, ...data }).returning();
    return item;
  }
  async removeWardrobeItem(id) {
    await db.delete(wardrobeItems).where(eq(wardrobeItems.id, id));
  }
  // ==========================================
  // Billing
  // ==========================================
  async getSubscriptionPlans() {
    return db.select().from(subscriptionPlans);
  }
  async getUserSubscription(userId) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub || void 0;
  }
  // ==========================================
  // Categories
  // ==========================================
  async getAllCategories() {
    return db.select().from(categories);
  }
  async createCategory(data) {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }
  async updateCategory(id, data) {
    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category || void 0;
  }
  async deleteCategory(id) {
    await db.delete(categories).where(eq(categories.id, id));
  }
  // ==========================================
  // Publishing Queue
  // ==========================================
  async getPublishingQueueItems() {
    return db.select().from(publishingQueue).orderBy(desc(publishingQueue.createdAt));
  }
  async getPublishingQueueStats() {
    const all = await db.select().from(publishingQueue);
    return {
      pending: all.filter((i) => i.status === "pending").length,
      processing: all.filter((i) => i.status === "processing").length,
      published: all.filter((i) => i.status === "published").length,
      failed: all.filter((i) => i.status === "failed").length
    };
  }
  async addToPublishingQueue(data) {
    const [item] = await db.insert(publishingQueue).values(data).returning();
    return item;
  }
  async updatePublishingQueueStatus(id, status) {
    const [item] = await db.update(publishingQueue).set({ status }).where(eq(publishingQueue.id, id)).returning();
    return item || void 0;
  }
  async removeFromPublishingQueue(id) {
    await db.delete(publishingQueue).where(eq(publishingQueue.id, id));
  }
  // ==========================================
  // Social Media
  // ==========================================
  async getSocialPlatforms(userId) {
    return db.select().from(socialPlatforms).where(eq(socialPlatforms.userId, userId));
  }
  async createSocialContent(data) {
    const [item] = await db.insert(socialContent).values(data).returning();
    return item;
  }
  async getSocialContent(userId) {
    return db.select().from(socialContent).where(eq(socialContent.userId, userId));
  }
  async getSocialAnalytics(userId) {
    return db.select().from(socialAnalytics).where(eq(socialAnalytics.userId, userId));
  }
  // ==========================================
  // Teams
  // ==========================================
  async getUserTeams(userId) {
    return db.select().from(teams).where(eq(teams.ownerId, userId));
  }
  async createTeam(data) {
    const [team] = await db.insert(teams).values(data).returning();
    return team;
  }
  async getTeamMembers(teamId) {
    return db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }
  async addTeamMember(teamId, data) {
    const [member] = await db.insert(teamMembers).values({ teamId, ...data }).returning();
    return member;
  }
  async updateTeamMember(memberId, data) {
    const [member] = await db.update(teamMembers).set(data).where(eq(teamMembers.id, memberId)).returning();
    return member || void 0;
  }
  async removeTeamMember(memberId) {
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
  }
  // ==========================================
  // Order Items
  // ==========================================
  async getOrderItems(orderId) {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  async addOrderItem(orderId, data) {
    const [item] = await db.insert(orderItems).values({ orderId, ...data }).returning();
    return item;
  }
  // ==========================================
  // Campaigns
  // ==========================================
  async getAllCampaigns() {
    return db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt));
  }
  async createCampaign(data) {
    const [campaign] = await db.insert(marketingCampaigns).values(data).returning();
    return campaign;
  }
  async updateCampaign(id, data) {
    const [campaign] = await db.update(marketingCampaigns).set(data).where(eq(marketingCampaigns.id, id)).returning();
    return campaign || void 0;
  }
  async deleteCampaign(id) {
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
  }
};
var storage = new DatabaseStorage();

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
var ObjectStorageService = class {
  storage;
  bucketId;
  publicObjectSearchPaths;
  privateObjectDir;
  constructor() {
    this.storage = new Storage();
    this.bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
    this.publicObjectSearchPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").filter(Boolean);
    this.privateObjectDir = process.env.PRIVATE_OBJECT_DIR || ".private";
  }
  async searchPublicObject(filePath) {
    for (const searchPath of this.publicObjectSearchPaths) {
      const fullPath = `${searchPath}/${filePath}`;
      const file = this.storage.bucket(this.bucketId).file(fullPath);
      const [exists] = await file.exists();
      if (exists) return file;
    }
    return null;
  }
  async downloadObject(file, res) {
    const [metadata] = await file.getMetadata();
    if (metadata.contentType) res.setHeader("Content-Type", metadata.contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    file.createReadStream().pipe(res);
  }
  async getObjectEntityUploadURL() {
    const fileName = `${this.privateObjectDir}/uploads/${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const file = this.storage.bucket(this.bucketId).file(fileName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1e3,
      contentType: "application/octet-stream"
    });
    return url;
  }
  normalizeObjectEntityPath(imageURL) {
    try {
      const url = new URL(imageURL);
      return url.pathname.replace(/^\//, "");
    } catch {
      return imageURL;
    }
  }
};

// server/publishPipeline.ts
import OpenAI2 from "openai";

// server/services/image-generation.ts
import OpenAI, { toFile } from "openai";
import { Buffer as Buffer2 } from "node:buffer";
var openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});
async function generateImageBuffer(prompt, size = "1024x1024") {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size
  });
  const base64 = response.data[0]?.b64_json ?? "";
  return Buffer2.from(base64, "base64");
}

// server/publishPipeline.ts
var openai2 = new OpenAI2({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});
var AI_MODEL = process.env.AI_MODEL || "gpt-4o";
var MARKETPLACE_PROMPTS = {
  amazon: `You are an expert Amazon product listing specialist. Generate content optimized for Amazon's A9 search algorithm.
Requirements:
- Title: Follow Amazon title format (Brand + Model + Key Feature + Product Type + Size/Color). Max 200 chars.
- Description: HTML-formatted product description with feature highlights. 2000+ chars recommended.
- bulletPoints: Exactly 5 bullet points, each starting with a CAPITALIZED benefit keyword. Max 500 chars each.
- tags: Backend search terms (no brand names, no ASINs). 10 terms max.
- seoTitle: Amazon SEO title variant
- metaDescription: Not used on Amazon but fill for completeness
- searchTerms: Amazon backend search terms (comma-separated, max 250 bytes total)
- platformSpecific: Include { "productType": string, "browseNode": string, "targetAudience": string, "itemTypeKeyword": string, "subjectMatter": string[], "usageKeywords": string[] }`,
  etsy: `You are an expert Etsy shop listing specialist. Generate content that appeals to Etsy's handmade/vintage/unique marketplace culture.
Requirements:
- Title: SEO-rich title using long-tail keywords. Max 140 chars.
- Description: Story-driven description with personality. Include materials, dimensions, care instructions. 1000+ chars.
- bulletPoints: 5 key product highlights
- tags: Exactly 13 Etsy tags (Etsy allows max 13). Mix of broad and long-tail keywords.
- seoTitle: Optimized for Etsy search
- metaDescription: Shop listing summary
- searchTerms: Long-tail search phrases buyers use on Etsy
- platformSpecific: Include { "materials": string[], "occasion": string, "style": string, "primaryColor": string, "secondaryColor": string, "whoMadeIt": "i_did"|"collective"|"someone_else", "whenWasItMade": string, "section": string }`,
  tiktok: `You are an expert TikTok Shop listing specialist. Generate content optimized for TikTok's younger, trend-driven audience.
Requirements:
- Title: Short, punchy, trend-aware title. Max 100 chars. Use trending words.
- Description: Short, engaging description with emojis. Focus on viral appeal and social proof. 500-800 chars.
- bulletPoints: 5 quick-hit selling points with emojis
- tags: 10 hashtag-style tags (without #) optimized for TikTok discovery
- seoTitle: TikTok-optimized title
- metaDescription: Short hook for TikTok listing preview
- searchTerms: Trending search terms on TikTok Shop
- platformSpecific: Include { "videoScript": string, "hookLine": string, "trendingHashtags": string[], "targetDemographic": string, "contentAngle": string }`,
  woocommerce: `You are an expert WooCommerce/WordPress e-commerce specialist. Generate content for a self-hosted WooCommerce store.
Requirements:
- Title: Clean, SEO-optimized product title. Max 100 chars.
- Description: Full HTML-compatible description with structured content (headers, lists, paragraphs). 1500+ chars.
- bulletPoints: 5 feature highlights for the product page
- tags: 10 WordPress/WooCommerce product tags for categories and filtering
- seoTitle: Yoast SEO optimized title (max 60 chars)
- metaDescription: Yoast SEO meta description (max 160 chars)
- searchTerms: WordPress search-optimized terms
- platformSpecific: Include { "shortDescription": string, "categories": string[], "attributes": { name: string, values: string[] }[], "crossSellKeywords": string[], "upsellKeywords": string[] }`,
  shopify: `You are an expert Shopify store listing specialist. Generate content optimized for Shopify's e-commerce platform and its built-in SEO.
Requirements:
- Title: Clean, keyword-rich product title. Max 120 chars.
- Description: Rich HTML-compatible description with benefit-driven copy, feature lists, and lifestyle context. 1500+ chars.
- bulletPoints: 5 key product features for the description
- tags: 10 Shopify product tags for collections, filtering, and search
- seoTitle: Shopify SEO page title (max 70 chars)
- metaDescription: Shopify SEO meta description (max 160 chars)
- searchTerms: Terms shoppers search for on Shopify stores
- platformSpecific: Include { "productType": string, "vendor": string, "collections": string[], "variants": { option: string, values: string[] }[], "metafields": { namespace: string, key: string, value: string }[] }`,
  printify: `You are an expert print-on-demand product listing specialist for Printify. Generate content that highlights customization, print quality, and unique design appeal.
Requirements:
- Title: Eye-catching title emphasizing the design/print. Max 120 chars.
- Description: Description focusing on print quality, materials, fit/sizing (for apparel), and design uniqueness. Include care instructions. 1000+ chars.
- bulletPoints: 5 selling points covering design, material, comfort/quality, care, and shipping
- tags: 10 tags optimized for Printify/marketplace discovery (design themes, product type, style)
- seoTitle: SEO title for the Printify listing
- metaDescription: Meta description highlighting the design
- searchTerms: Search terms for print-on-demand shoppers
- platformSpecific: Include { "printProvider": string, "printAreas": string[], "designDescription": string, "materialComposition": string, "sizeGuide": string, "careInstructions": string, "mockupAngles": string[] }`,
  wix: `You are an expert Wix e-commerce store listing specialist. Generate content optimized for Wix Stores and its built-in SEO tools.
Requirements:
- Title: Professional, SEO-optimized product title. Max 100 chars.
- Description: Wix-compatible rich text description with visual formatting. 1200+ chars.
- bulletPoints: 5 key product highlights
- tags: 10 product tags for Wix store categories and search
- seoTitle: Wix SEO page title (max 60 chars)
- metaDescription: Wix SEO meta description (max 160 chars)
- searchTerms: Search terms for Wix store internal search
- platformSpecific: Include { "productType": "physical"|"digital", "collections": string[], "customFields": { title: string, value: string }[], "ribbonText": string, "brand": string, "infoSections": { title: string, description: string }[] }`,
  instagram: `You are an expert Instagram Shopping and social commerce specialist. Generate content optimized for Instagram's visual-first shopping experience.
Requirements:
- Title: Short, catchy, Instagram-friendly product name. Max 80 chars.
- Description: Engaging copy with emojis, lifestyle language, and social proof hooks. 500-800 chars. Write like an influencer, not a catalog.
- bulletPoints: 5 punchy features with emojis that work in Instagram captions
- tags: 15 Instagram hashtags (without #) mixing branded, niche, and trending tags
- seoTitle: Instagram Shopping product title
- metaDescription: Short product tagline for the shop tab
- searchTerms: Instagram Explore and search discovery terms
- platformSpecific: Include { "captionTemplate": string, "storyTemplate": string, "reelHook": string, "collabTags": string[], "aestheticStyle": string, "bestPostTime": string, "contentPillars": string[] }`,
  gumroad: `You are an expert Gumroad product listing specialist. Generate content optimized for Gumroad's creator-economy marketplace, ideal for digital products, courses, memberships, and unique physical goods.
Requirements:
- Title: Clear, value-driven product title. Max 80 chars.
- Description: Creator-style product page copy. Conversational, benefit-focused. Include what the buyer gets, who it's for, and social proof hooks. 800-1200 chars. Use markdown formatting.
- bulletPoints: 5 "what you'll get" style bullet points
- tags: 8 Gumroad discovery tags
- seoTitle: SEO title for Gumroad product page
- metaDescription: Short value proposition for search
- searchTerms: Terms Gumroad shoppers search for
- platformSpecific: Include { "pricingModel": "one_time"|"subscription"|"pay_what_you_want", "suggestedPrice": number, "minimumPrice": number, "deliverables": string[], "targetCreator": string, "category": string, "coverImagePrompt": string, "previewContent": string }`,
  website: `You are an expert e-commerce website copywriter for affordablestorestuff.com. Generate content for a custom storefront.
Requirements:
- Title: Clean, benefit-driven product title. Max 80 chars.
- Description: Rich product description with storytelling, benefits, and specifications. 1000+ chars.
- bulletPoints: 5 key selling points
- tags: 10 SEO keywords for the website
- seoTitle: SEO-optimized page title (max 60 chars)
- metaDescription: SEO meta description (max 160 chars)
- searchTerms: Internal site search terms
- platformSpecific: Include { "shortDescription": string, "features": string[], "specifications": Record<string, string>, "faqItems": { question: string, answer: string }[] }`
};
function buildProductContext(product, brandProfile) {
  let context = `Product: ${product.title}
Description: ${product.description || "No description provided"}
Price: $${product.price}
Category: ${product.category || "General"}
SKU: ${product.sku || "N/A"}`;
  if (product.tags && product.tags.length > 0) {
    context += `
Tags: ${product.tags.join(", ")}`;
  }
  if (brandProfile) {
    context += `

Brand Voice:
- Tone: ${brandProfile.tone}
- Target Audience: ${brandProfile.targetAudience}
- Brand Keywords: ${brandProfile.keywords.join(", ")}
- Brand Description: ${brandProfile.description}`;
  }
  return context;
}
async function generateListingContent(product, marketplace, brandProfile) {
  const systemPrompt = MARKETPLACE_PROMPTS[marketplace] || MARKETPLACE_PROMPTS.website;
  const productContext = buildProductContext(product, brandProfile);
  const response = await openai2.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate a complete marketplace listing for this product. Return ONLY valid JSON with these exact fields: title, description, bulletPoints (array of strings), tags (array of strings), seoTitle, metaDescription, searchTerms (array of strings), platformSpecific (object with marketplace-specific fields as described).

${productContext}`
      }
    ],
    max_completion_tokens: 4096,
    response_format: { type: "json_object" }
  });
  const raw = response.choices[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return {
    title: parsed.title || product.title,
    description: parsed.description || product.description,
    bulletPoints: parsed.bulletPoints || [],
    tags: parsed.tags || product.tags || [],
    seoTitle: parsed.seoTitle || product.title,
    metaDescription: parsed.metaDescription || "",
    searchTerms: parsed.searchTerms || [],
    images: [],
    platformSpecific: parsed.platformSpecific || {}
  };
}
async function generateProductImage(product, marketplace, index2 = 0) {
  const styleGuides = {
    amazon: "Professional white background product photography, clean studio lighting, high resolution commercial product shot, no text overlays, centered product",
    etsy: "Lifestyle product photography with warm natural lighting, cozy aesthetic setting, handcrafted feel, styled flat lay or in-use context",
    tiktok: "Trendy social media product photo, vibrant colors, eye-catching composition, lifestyle context, youthful aesthetic, Instagram-worthy",
    shopify: "Premium e-commerce product photography, clean modern aesthetic, neutral background, professional studio quality, brand-forward styling",
    printify: "Print-on-demand product mockup photography, showing print/design clearly, lifestyle context, multiple product angles showing the print quality",
    wix: "Elegant product photography for modern web store, clean background with subtle styling, professional commercial quality",
    instagram: "Instagram-worthy aesthetic product photography, beautiful styling, natural lighting, lifestyle flat lay, social media optimized square composition",
    gumroad: "Creator-economy product visual, modern and minimal, clean digital product showcase, bold typography-friendly composition",
    woocommerce: "Clean e-commerce product photography, white or light gray background, professional studio quality, multiple angle feel",
    website: "Modern e-commerce product photography, clean background, professional lighting, detail-focused, hero image quality"
  };
  const style = styleGuides[marketplace] || styleGuides.website;
  const angles = ["front view hero shot", "angled detail view", "lifestyle context shot", "close-up texture/detail"];
  const angle = angles[index2 % angles.length];
  const prompt = `${style}. ${angle} of: ${product.title}. ${product.description ? product.description.slice(0, 200) : ""}. Professional e-commerce product image, no text, no watermarks.`;
  return generateImageBuffer(prompt, "1024x1024");
}
async function uploadImageToStorage(imageBuffer, fileName) {
  const objectStorage = new ObjectStorageService();
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) {
    throw new Error("Object storage not configured");
  }
  const { Storage: Storage2 } = await import("@google-cloud/storage");
  const gcs = new Storage2();
  const bucket = gcs.bucket(bucketId);
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").filter(Boolean);
  const basePath = publicPaths[0] || "public";
  const filePath = `${basePath}/product-images/${fileName}`;
  const file = bucket.file(filePath);
  await file.save(imageBuffer, {
    metadata: { contentType: "image/png" }
  });
  try {
    await file.makePublic();
  } catch (e) {
  }
  return `product-images/${fileName}`;
}
async function runPublishPipeline(product, marketplace, brandProfile, generateImages = true, imageCount = 2) {
  const listingData = await generateListingContent(product, marketplace, brandProfile);
  const generatedImages = [];
  if (generateImages) {
    for (let i = 0; i < imageCount; i++) {
      try {
        const imageBuffer = await generateProductImage(product, marketplace, i);
        const fileName = `${product.id}-${marketplace}-${Date.now()}-${i}.png`;
        const imagePath = await uploadImageToStorage(imageBuffer, fileName);
        generatedImages.push(imagePath);
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error);
      }
    }
  }
  listingData.images = generatedImages;
  return { listingData, generatedImages };
}

// server/auth.ts
import crypto from "node:crypto";
var JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production-please";
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[AUTH] FATAL: JWT_SECRET environment variable is not set. Set JWT_SECRET before starting the server in production."
    );
  } else {
    console.warn(
      "[AUTH] WARNING: JWT_SECRET is not set. Using an insecure default. This is only acceptable for local development."
    );
  }
}
function createToken(payload, expiresInSec = 7 * 24 * 3600) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const now = Math.floor(Date.now() / 1e3);
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  const sigBuf = Buffer.from(sig, "base64url");
  const expectedBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    );
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.user = payload;
  next();
}
var rateLimitStore = /* @__PURE__ */ new Map();
var cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 6e4);
cleanupInterval.unref?.();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || entry.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (entry.count >= max) {
      res.setHeader(
        "Retry-After",
        String(Math.ceil((entry.resetAt - now) / 1e3))
      );
      res.status(429).json({ error: "Too many requests, please try again later" });
      return;
    }
    entry.count++;
    next();
  };
}

// server/services/stripe-service.ts
import Stripe from "stripe";
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
function getStripe() {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.");
  }
  return stripe;
}
async function createCustomer(email, name) {
  const s = getStripe();
  const customer = await s.customers.create({
    email,
    name: name || void 0
  });
  return customer.id;
}
async function createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
  const s = getStripe();
  const session = await s.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return session.url || "";
}
async function constructWebhookEvent(payload, signature) {
  const s = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return s.webhooks.constructEvent(payload, signature, webhookSecret);
}

// server/routes.ts
var openai3 = new OpenAI3({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
});
var AI_MODEL2 = process.env.AI_MODEL || "gpt-4o";
var aiRateLimit = rateLimit(20, 6e4);
var chatRateLimit = rateLimit(30, 6e4);
async function registerRoutes(app2) {
  app2.use((req, res, next) => {
    if (!req.path.startsWith("/api/")) return next();
    const publicPaths = [
      "/api/auth/",
      // registration & login
      "/api/shop/",
      // guest shopping (session-based)
      "/api/billing/webhook"
      // verified via Stripe signature instead
    ];
    if (publicPaths.some((p) => req.path.startsWith(p))) return next();
    if (req.method === "GET" && (req.path.startsWith("/api/products") || req.path.startsWith("/api/listings") || req.path.startsWith("/api/categories") || req.path === "/api/billing/plans")) {
      return next();
    }
    return authMiddleware(req, res, next);
  });
  app2.get("/api/products", async (_req, res) => {
    try {
      const products2 = await storage.getAllProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) return res.status(404).json({ error: "Not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!product) return res.status(404).json({ error: "Not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.get("/api/listings", async (_req, res) => {
    try {
      const listings = await storage.getAllListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });
  app2.get("/api/products/:id/listings", async (req, res) => {
    try {
      const listings = await storage.getListingsByProduct(parseInt(req.params.id));
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });
  app2.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(parseInt(req.params.id));
      if (!listing) return res.status(404).json({ error: "Not found" });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });
  app2.post("/api/listings", async (req, res) => {
    try {
      const listing = await storage.createListing(req.body);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to create listing" });
    }
  });
  app2.put("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.updateListing(parseInt(req.params.id), req.body);
      if (!listing) return res.status(404).json({ error: "Not found" });
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing" });
    }
  });
  app2.get("/api/orders", async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  app2.put("/api/orders/:id/status", async (req, res) => {
    try {
      const order = await storage.updateOrderStatus(parseInt(req.params.id), req.body.status);
      if (!order) return res.status(404).json({ error: "Not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  app2.get("/api/brand-profiles", async (_req, res) => {
    try {
      const profiles = await storage.getAllBrandProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brand profiles" });
    }
  });
  app2.post("/api/brand-profiles", async (req, res) => {
    try {
      const profile = await storage.createBrandProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create brand profile" });
    }
  });
  app2.put("/api/brand-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.updateBrandProfile(parseInt(req.params.id), req.body);
      if (!profile) return res.status(404).json({ error: "Not found" });
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update brand profile" });
    }
  });
  app2.delete("/api/brand-profiles/:id", async (req, res) => {
    try {
      await storage.deleteBrandProfile(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete brand profile" });
    }
  });
  app2.get("/api/content", async (_req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });
  app2.post("/api/content", async (req, res) => {
    try {
      const item = await storage.createContent(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });
  app2.put("/api/content/:id/favorite", async (req, res) => {
    try {
      const item = await storage.toggleContentFavorite(parseInt(req.params.id));
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });
  app2.delete("/api/content/:id", async (req, res) => {
    try {
      await storage.deleteContent(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });
  app2.get("/api/ai/usage", async (_req, res) => {
    try {
      const stats = await storage.getAiUsageStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI usage" });
    }
  });
  app2.post("/api/ai/generate-product", aiRateLimit, async (req, res) => {
    try {
      const { productType, brandProfile, features } = req.body;
      let systemPrompt = "You are an expert e-commerce product copywriter. Generate compelling, SEO-optimized product content.";
      if (brandProfile) {
        systemPrompt += ` Brand tone: ${brandProfile.tone}. Target audience: ${brandProfile.targetAudience}.`;
        if (brandProfile.keywords?.length) {
          systemPrompt += ` Key brand terms: ${brandProfile.keywords.join(", ")}.`;
        }
      }
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      const stream = await openai3.chat.completions.create({
        model: AI_MODEL2,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a complete product listing for: "${productType}".
${features ? `Features: ${features}` : ""}

Return a JSON object with these fields:
- title: A compelling product title (max 80 chars)
- description: A detailed product description (150-200 words) with benefits and features
- bulletPoints: Array of 5 key selling points
- tags: Array of 8-10 SEO tags/keywords
- suggestedPrice: A reasonable price as a number
- category: The best product category
- seoTitle: SEO-optimized title for search engines
- metaDescription: Meta description for search (max 160 chars)`
          }
        ],
        stream: true,
        max_completion_tokens: 8192
      });
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}

`);
        }
      }
      await storage.logAiGeneration({
        type: "product",
        prompt: productType,
        output: fullContent,
        tokensUsed: Math.ceil(fullContent.length / 4),
        model: AI_MODEL2
      });
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
    } catch (error) {
      console.error("AI generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Generation failed" })}

`);
        res.end();
      } else {
        res.status(500).json({ error: "AI generation failed" });
      }
    }
  });
  app2.post("/api/ai/generate-marketing", aiRateLimit, async (req, res) => {
    try {
      const { productTitle, productDescription, platform, brandProfile } = req.body;
      let systemPrompt = "You are an expert digital marketing copywriter specializing in e-commerce.";
      if (brandProfile) {
        systemPrompt += ` Brand tone: ${brandProfile.tone}. Target audience: ${brandProfile.targetAudience}.`;
      }
      const platformInstructions = {
        tiktok: "Write a viral TikTok video script. Hook in first 3 seconds. Casual, energetic tone. 15-30 seconds. Include trending hashtags.",
        instagram: "Write an Instagram caption. Aesthetic storytelling approach. Include emojis naturally and 10 relevant hashtags.",
        pinterest: "Write a Pinterest pin description. SEO-optimized with seasonal and search keywords. Include a call to action.",
        amazon: "Write Amazon product listing copy. Focus on A+ content structure with feature bullets, comparison points, and FAQ.",
        etsy: "Write Etsy listing copy. Handcrafted feel, story-driven. Include long-tail search keywords naturally.",
        email: "Write a promotional email. Compelling subject line, preview text, and body with a clear CTA.",
        general: "Write versatile marketing copy that works across platforms."
      };
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      const stream = await openai3.chat.completions.create({
        model: AI_MODEL2,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create marketing copy for this product:
Title: ${productTitle}
Description: ${productDescription}
Platform: ${platform}

Instructions: ${platformInstructions[platform] || platformInstructions.general}

Return a JSON object with:
- headline: Attention-grabbing headline
- body: The main copy
- callToAction: Strong CTA
- hashtags: Array of relevant hashtags (if applicable)
- tips: Array of 3 tips for maximizing this content's performance`
          }
        ],
        stream: true,
        max_completion_tokens: 8192
      });
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}

`);
        }
      }
      await storage.logAiGeneration({
        type: "marketing",
        prompt: `${platform}: ${productTitle}`,
        output: fullContent,
        tokensUsed: Math.ceil(fullContent.length / 4),
        model: AI_MODEL2
      });
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
    } catch (error) {
      console.error("Marketing generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Generation failed" })}

`);
        res.end();
      } else {
        res.status(500).json({ error: "AI generation failed" });
      }
    }
  });
  app2.post("/api/listings/:id/publish", aiRateLimit, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id, 10);
      const listing = await storage.getListing(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      const product = await storage.getProduct(listing.productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
      const { generateImages = true, imageCount = 2, brandProfileId } = req.body;
      let brandProfile;
      if (brandProfileId) {
        brandProfile = await storage.getBrandProfile(brandProfileId);
      } else {
        const profiles = await storage.getAllBrandProfiles();
        brandProfile = profiles.find((p) => p.isDefault) || profiles[0];
      }
      await storage.updateListing(listingId, { status: "generating" });
      const result = await runPublishPipeline(
        product,
        listing.marketplace,
        brandProfile || void 0,
        generateImages,
        imageCount
      );
      const updatedListing = await storage.updateListing(listingId, {
        listingData: result.listingData,
        generatedImages: result.generatedImages,
        customTitle: result.listingData.title,
        customDescription: result.listingData.description,
        status: "ready"
      });
      await storage.logAiGeneration({
        type: "listing",
        prompt: `${listing.marketplace} listing for: ${product.title}`,
        output: JSON.stringify(result.listingData),
        tokensUsed: Math.ceil(JSON.stringify(result.listingData).length / 4),
        model: AI_MODEL2
      });
      res.json(updatedListing);
    } catch (error) {
      console.error("Publish pipeline error:", error);
      const listingId = parseInt(req.params.id, 10);
      await storage.updateListing(listingId, { status: "draft" }).catch(() => {
      });
      res.status(500).json({ error: "Failed to generate listing content" });
    }
  });
  app2.post("/api/listings/:id/confirm-publish", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      const updatedListing = await storage.updateListing(listingId, {
        status: "published",
        publishedAt: /* @__PURE__ */ new Date()
      });
      const product = await storage.getProduct(listing.productId);
      if (product && product.status === "draft") {
        await storage.updateProduct(listing.productId, { status: "active" });
      }
      res.json(updatedListing);
    } catch (error) {
      console.error("Confirm publish error:", error);
      res.status(500).json({ error: "Failed to confirm publish" });
    }
  });
  app2.post("/api/listings/:id/regenerate-content", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      const product = await storage.getProduct(listing.productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
      const { brandProfileId } = req.body;
      let brandProfile;
      if (brandProfileId) {
        brandProfile = await storage.getBrandProfile(brandProfileId);
      }
      const listingData = await generateListingContent(
        product,
        listing.marketplace,
        brandProfile || void 0
      );
      listingData.images = listing.generatedImages;
      const updatedListing = await storage.updateListing(listingId, {
        listingData,
        customTitle: listingData.title,
        customDescription: listingData.description,
        status: "ready"
      });
      res.json(updatedListing);
    } catch (error) {
      console.error("Regenerate content error:", error);
      res.status(500).json({ error: "Failed to regenerate content" });
    }
  });
  const getSessionId = (req) => {
    return req.headers["x-session-id"] || "guest-default";
  };
  app2.get("/api/shop/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });
  app2.post("/api/shop/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const item = await storage.addToCart(sessionId, req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });
  app2.put("/api/shop/cart/:id", async (req, res) => {
    try {
      const item = await storage.updateCartItem(parseInt(req.params.id), req.body);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });
  app2.delete("/api/shop/cart/:id", async (req, res) => {
    try {
      await storage.removeCartItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });
  app2.get("/api/shop/style-profile", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const profile = await storage.getStyleProfile(sessionId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch style profile" });
    }
  });
  app2.post("/api/shop/style-profile", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const profile = await storage.saveStyleProfile(sessionId, req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error saving style profile:", error);
      res.status(500).json({ error: "Failed to save style profile" });
    }
  });
  app2.post("/api/shop/stylist-chat", chatRateLimit, async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      const stream = await openai3.chat.completions.create({
        model: AI_MODEL2,
        messages: [
          {
            role: "system",
            content: `You are an expert AI fashion stylist for AffordableStoreStuff. You help customers with:
- Outfit recommendations based on occasions, weather, and personal style
- Color coordination and pattern mixing advice
- Wardrobe essentials and building a capsule wardrobe
- Styling tips for different body types
- Trend advice and how to incorporate trends affordably
- Shopping recommendations from our product catalog

Be friendly, enthusiastic, and specific with your recommendations. Use fashion terminology naturally but explain when needed. Keep responses concise but helpful.`
          },
          ...history.slice(-10),
          { role: "user", content: message }
        ],
        stream: true,
        max_completion_tokens: 2048
      });
      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}

`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
    } catch (error) {
      console.error("Stylist chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Chat failed" })}

`);
        res.end();
      } else {
        res.status(500).json({ error: "AI stylist chat failed" });
      }
    }
  });
  app2.get("/api/shop/wardrobe", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const items = await storage.getWardrobeItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wardrobe" });
    }
  });
  app2.post("/api/shop/wardrobe", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const item = await storage.addWardrobeItem(sessionId, req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add wardrobe item" });
    }
  });
  app2.delete("/api/shop/wardrobe/:id", async (req, res) => {
    try {
      await storage.removeWardrobeItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove wardrobe item" });
    }
  });
  app2.get("/public-objects/:filePath", async (req, res) => {
    const filePath = decodeURIComponent(req.params.filePath);
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/objects/upload", async (_req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });
  app2.put("/api/product-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = createToken({ id: user.id, username: user.username });
      res.json({ id: user.id, username: user.username, subscriptionTier: user.subscriptionTier, token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/request-reset", async (req, res) => {
    try {
      const { email } = req.body;
      res.json({ message: "If an account exists with that email, a reset link has been sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to process reset request" });
    }
  });
  app2.get("/api/billing/plans", async (_req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });
  app2.get("/api/billing/subscription", async (req, res) => {
    try {
      const userId = req.user.id;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });
  app2.post("/api/billing/checkout", async (req, res) => {
    try {
      const userId = req.user.id;
      const { planId } = req.body;
      if (!planId) return res.status(400).json({ error: "planId is required" });
      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return res.status(404).json({ error: "Plan not found" });
      if (!plan.stripePriceId) {
        return res.status(422).json({ error: "Plan is not configured for billing" });
      }
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const existingSub = await storage.getUserSubscription(userId);
      let stripeCustomerId = existingSub?.stripeCustomerId ?? null;
      if (!stripeCustomerId) {
        stripeCustomerId = await createCustomer(user.username);
      }
      const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5000");
      const sessionUrl = await createCheckoutSession(
        stripeCustomerId,
        plan.stripePriceId,
        `${baseUrl}/billing?success=true`,
        `${baseUrl}/billing?cancelled=true`
      );
      res.json({ url: sessionUrl });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });
  app2.post("/api/billing/webhook", async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).json({ error: "Missing Stripe signature header" });
      }
      const payload = req.rawBody;
      if (!payload) {
        return res.status(400).json({ error: "Missing raw body" });
      }
      let event;
      try {
        event = await constructWebhookEvent(payload, sig);
      } catch (err) {
        console.error("Stripe webhook signature verification failed:", err);
        return res.status(400).json({ error: "Webhook signature verification failed" });
      }
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object;
          console.log(`Stripe subscription ${event.type}:`, sub.id, sub.status);
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object;
          console.log("Stripe subscription cancelled:", sub.id);
          break;
        }
        default:
          break;
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  app2.get("/api/categories", async (_req, res) => {
    try {
      const allCategories = await storage.getAllCategories();
      res.json(allCategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });
  app2.put("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ error: "Not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
  app2.get("/api/publishing-queue", async (_req, res) => {
    try {
      const items = await storage.getPublishingQueueItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue" });
    }
  });
  app2.get("/api/publishing-queue/stats", async (_req, res) => {
    try {
      const stats = await storage.getPublishingQueueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue stats" });
    }
  });
  app2.post("/api/publishing-queue", async (req, res) => {
    try {
      const item = await storage.addToPublishingQueue(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to queue" });
    }
  });
  app2.put("/api/publishing-queue/:id/status", async (req, res) => {
    try {
      const item = await storage.updatePublishingQueueStatus(req.params.id, req.body.status);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update queue item" });
    }
  });
  app2.delete("/api/publishing-queue/:id", async (req, res) => {
    try {
      await storage.removeFromPublishingQueue(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from queue" });
    }
  });
  app2.get("/api/social/platforms", async (req, res) => {
    try {
      const userId = req.user.id;
      const platforms = await storage.getSocialPlatforms(userId);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });
  app2.post("/api/social/content", async (req, res) => {
    try {
      const content = await storage.createSocialContent(req.body);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
  });
  app2.get("/api/social/content", async (req, res) => {
    try {
      const userId = req.user.id;
      const content = await storage.getSocialContent(userId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });
  app2.get("/api/social/analytics", async (req, res) => {
    try {
      const userId = req.user.id;
      const analytics = await storage.getSocialAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/teams", async (req, res) => {
    try {
      const userId = req.user.id;
      const userTeams = await storage.getUserTeams(userId);
      res.json(userTeams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });
  app2.post("/api/teams", async (req, res) => {
    try {
      const team = await storage.createTeam(req.body);
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team" });
    }
  });
  app2.get("/api/teams/:id/members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });
  app2.post("/api/teams/:id/members", async (req, res) => {
    try {
      const member = await storage.addTeamMember(req.params.id, req.body);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to add team member" });
    }
  });
  app2.put("/api/teams/:teamId/members/:memberId", async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.memberId, req.body);
      if (!member) return res.status(404).json({ error: "Not found" });
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });
  app2.delete("/api/teams/:teamId/members/:memberId", async (req, res) => {
    try {
      await storage.removeTeamMember(req.params.memberId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove team member" });
    }
  });
  app2.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(parseInt(req.params.id));
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });
  app2.post("/api/orders/:id/items", async (req, res) => {
    try {
      const item = await storage.addOrderItem(parseInt(req.params.id), req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add order item" });
    }
  });
  app2.get("/api/campaigns", async (_req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });
  app2.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });
  app2.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) return res.status(404).json({ error: "Not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });
  app2.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.VERCEL_URL) {
      origins.add(`https://${process.env.VERCEL_URL}`);
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (!origin || origins.has(origin) || isLocalhost) {
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
      } else {
        res.header("Access-Control-Allow-Origin", "*");
      }
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
async function initApp() {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  if (!process.env.VERCEL) {
    configureExpoAndLanding(app);
  }
  await registerRoutes(app);
  setupErrorHandler(app);
}
if (!process.env.VERCEL) {
  initApp().then(() => {
    const port = parseInt(process.env.PORT || "5000", 10);
    const server = createServer2(app);
    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true
      },
      () => {
        log(`express server serving on port ${port}`);
      }
    );
  });
}
export {
  app,
  initApp
};
