import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, decimal, jsonb, boolean, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  aiCreditsUsed: integer("ai_credits_used").notNull().default(0),
  aiCreditsLimit: integer("ai_credits_limit").notNull().default(100),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  sku: text("sku").notNull().default(""),
  category: text("category").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  inventoryCount: integer("inventory_count").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export interface ListingData {
  title: string;
  description: string;
  bulletPoints: string[];
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  searchTerms: string[];
  images: string[];
  platformSpecific: Record<string, any>;
}

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  marketplace: text("marketplace").notNull(),
  externalId: text("external_id"),
  status: text("status").notNull().default("draft"),
  customTitle: text("custom_title"),
  customDescription: text("custom_description"),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  listingData: jsonb("listing_data").$type<ListingData>(),
  generatedImages: jsonb("generated_images").$type<string[]>().notNull().default([]),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  marketplace: text("marketplace").notNull(),
  externalOrderId: text("external_order_id"),
  productId: integer("product_id"),
  productTitle: text("product_title").notNull(),
  customerName: text("customer_name").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const brandProfiles = pgTable("brand_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tone: text("tone").notNull().default("professional"),
  targetAudience: text("target_audience").notNull().default(""),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  description: text("description").notNull().default(""),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const contentLibrary = pgTable("content_library", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  platform: text("platform"),
  productId: integer("product_id"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const aiGenerations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  output: text("output").notNull(),
  tokensUsed: integer("tokens_used").notNull().default(0),
  model: text("model").notNull().default("gpt-5.2"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const styleProfiles = pgTable("style_profiles", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  aesthetics: jsonb("aesthetics").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  patterns: jsonb("patterns").$type<string[]>().notNull().default([]),
  occasions: jsonb("occasions").$type<string[]>().notNull().default([]),
  lifestyle: text("lifestyle"),
  styleDna: jsonb("style_dna").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const wardrobeItems = pgTable("wardrobe_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color"),
  imageUrl: text("image_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  wearCount: integer("wear_count").notNull().default(0),
  lastWorn: timestamp("last_worn"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ==========================================
// New tables (ported from App 1 schema)
// ==========================================

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: varchar("parent_id"),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
}, (table) => [
  index("idx_order_items_order_id").on(table.orderId),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_subscriptions_user_id").on(table.userId),
  index("idx_subscriptions_status").on(table.status),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const publishingQueue = pgTable("publishing_queue", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_publishing_queue_status").on(table.status),
  index("idx_publishing_queue_scheduled_for").on(table.scheduledFor),
]);

export const brandVoiceProfiles = pgTable("brand_voice_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  tone: text("tone").default("professional"),
  personality: jsonb("personality").$type<string[]>().notNull().default([]),
  targetAudience: text("target_audience"),
  brandValues: jsonb("brand_values").$type<string[]>().notNull().default([]),
  writingStyle: text("writing_style").default("conversational"),
  vocabularyLevel: text("vocabulary_level").default("intermediate"),
  avoidWords: jsonb("avoid_words").$type<string[]>().notNull().default([]),
  preferredPhrases: jsonb("preferred_phrases").$type<string[]>().notNull().default([]),
  exampleContent: jsonb("example_content"),
  industry: text("industry"),
  colorPalette: jsonb("color_palette").$type<string[]>().notNull().default([]),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_brand_voice_profiles_user_id").on(table.userId),
]);

export const productConcepts = pgTable("product_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  brandVoiceId: varchar("brand_voice_id"),
  prompt: text("prompt").notNull(),
  marketplace: text("marketplace").default("general"),
  targetPlatforms: jsonb("target_platforms").$type<string[]>().notNull().default([]),
  priceRange: text("price_range"),
  generatedTitle: text("generated_title"),
  generatedDescription: text("generated_description"),
  generatedTags: jsonb("generated_tags").$type<string[]>().notNull().default([]),
  generatedFeatures: jsonb("generated_features").$type<string[]>().notNull().default([]),
  generatedImages: jsonb("generated_images"),
  heroImageUrl: text("hero_image_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: jsonb("seo_keywords").$type<string[]>().notNull().default([]),
  status: text("status").default("draft"),
  qualityScore: real("quality_score"),
  aiProvider: text("ai_provider"),
  generationCost: decimal("generation_cost", { precision: 10, scale: 4 }),
  publishedToProducts: boolean("published_to_products").default(false),
  linkedProductId: integer("linked_product_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_product_concepts_user_id").on(table.userId),
]);

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  brandVoiceId: varchar("brand_voice_id"),
  name: text("name").notNull(),
  objective: text("objective"),
  description: text("description"),
  targetAudience: jsonb("target_audience"),
  channels: jsonb("channels").$type<string[]>().notNull().default([]),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_marketing_campaigns_user_id").on(table.userId),
  index("idx_marketing_campaigns_status").on(table.status),
]);

export const socialPlatforms = pgTable("social_platforms", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_social_platforms_user_id").on(table.userId),
]);

export const socialContent = pgTable("social_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  title: text("title").notNull(),
  caption: text("caption").default(""),
  mediaUri: text("media_uri"),
  mediaType: text("media_type"),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
  status: text("status").default("draft").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  failedReason: text("failed_reason"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_social_content_user_id").on(table.userId),
  index("idx_social_content_status").on(table.status),
]);

export const socialAnalytics = pgTable("social_analytics", {
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
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_team_members_team_id").on(table.teamId),
  index("idx_team_members_user_id").on(table.userId),
]);

// ==========================================
// Relations (existing)
// ==========================================

export const productsRelations = relations(products, ({ many }) => ({
  listings: many(marketplaceListings),
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  product: one(products, {
    fields: [marketplaceListings.productId],
    references: [products.id],
  }),
}));

// ==========================================
// Relations (new tables)
// ==========================================

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const brandVoiceProfilesRelations = relations(brandVoiceProfiles, ({ one }) => ({
  // userId is text referencing users.id which is varchar - compatible
}));

export const productConceptsRelations = relations(productConcepts, ({ one }) => ({
  brandVoice: one(brandVoiceProfiles, { fields: [productConcepts.brandVoiceId], references: [brandVoiceProfiles.id] }),
}));

export const marketingCampaignsRelations = relations(marketingCampaigns, ({ one }) => ({
  brandVoice: one(brandVoiceProfiles, { fields: [marketingCampaigns.brandVoiceId], references: [brandVoiceProfiles.id] }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
}));

// ==========================================
// Insert schemas (existing)
// ==========================================

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandProfileSchema = createInsertSchema(brandProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertContentLibrarySchema = createInsertSchema(contentLibrary).omit({
  id: true,
  createdAt: true,
});

// ==========================================
// Insert schemas (new tables)
// ==========================================

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export const insertPublishingQueueSchema = createInsertSchema(publishingQueue).omit({ id: true, createdAt: true });
export const insertBrandVoiceProfileSchema = createInsertSchema(brandVoiceProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductConceptSchema = createInsertSchema(productConcepts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSocialPlatformSchema = createInsertSchema(socialPlatforms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSocialContentSchema = createInsertSchema(socialContent).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true, updatedAt: true });

// ==========================================
// Types (existing)
// ==========================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type BrandProfile = typeof brandProfiles.$inferSelect;
export type ContentLibraryItem = typeof contentLibrary.$inferSelect;
export type AiGeneration = typeof aiGenerations.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type StyleProfile = typeof styleProfiles.$inferSelect;
export type WardrobeItem = typeof wardrobeItems.$inferSelect;

// ==========================================
// Types (new tables)
// ==========================================

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PublishingQueueItem = typeof publishingQueue.$inferSelect;
export type InsertPublishingQueueItem = z.infer<typeof insertPublishingQueueSchema>;
export type BrandVoiceProfile = typeof brandVoiceProfiles.$inferSelect;
export type InsertBrandVoiceProfile = z.infer<typeof insertBrandVoiceProfileSchema>;
export type ProductConcept = typeof productConcepts.$inferSelect;
export type InsertProductConcept = z.infer<typeof insertProductConceptSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type SocialPlatform = typeof socialPlatforms.$inferSelect;
export type InsertSocialPlatform = z.infer<typeof insertSocialPlatformSchema>;
export type SocialContentItem = typeof socialContent.$inferSelect;
export type InsertSocialContentItem = z.infer<typeof insertSocialContentSchema>;
export type SocialAnalyticsSnapshot = typeof socialAnalytics.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
