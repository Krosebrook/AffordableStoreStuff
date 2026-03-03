import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, products, marketplaceListings, orders, brandProfiles,
  contentLibrary, aiGenerations, cartItems, styleProfiles, wardrobeItems,
  categories, orderItems, subscriptionPlans, subscriptions,
  publishingQueue, socialPlatforms, socialContent, socialAnalytics,
  teams, teamMembers, marketingCampaigns,
  type User, type InsertUser, type Product, type InsertProduct,
  type MarketplaceListing, type Order, type BrandProfile, type ContentLibraryItem,
  type CartItem, type StyleProfile, type WardrobeItem,
  type Category, type OrderItem, type SubscriptionPlan, type Subscription,
  type PublishingQueueItem, type SocialPlatform, type SocialContentItem,
  type SocialAnalyticsSnapshot, type Team, type TeamMember, type MarketingCampaign,
} from "../shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  getListingsByProduct(productId: number): Promise<MarketplaceListing[]>;
  getAllListings(): Promise<MarketplaceListing[]>;
  getListing(id: number): Promise<MarketplaceListing | undefined>;
  createListing(data: any): Promise<MarketplaceListing>;
  updateListing(id: number, data: any): Promise<MarketplaceListing | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(data: any): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getAllBrandProfiles(): Promise<BrandProfile[]>;
  getBrandProfile(id: number): Promise<BrandProfile | undefined>;
  createBrandProfile(data: any): Promise<BrandProfile>;
  updateBrandProfile(id: number, data: any): Promise<BrandProfile | undefined>;
  deleteBrandProfile(id: number): Promise<void>;
  getAllContent(): Promise<ContentLibraryItem[]>;
  createContent(data: any): Promise<ContentLibraryItem>;
  toggleContentFavorite(id: number): Promise<ContentLibraryItem | undefined>;
  deleteContent(id: number): Promise<void>;
  logAiGeneration(data: any): Promise<void>;
  getAiUsageStats(): Promise<{ totalGenerations: number; totalTokens: number }>;

  // Billing
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  createCategory(data: any): Promise<Category>;
  updateCategory(id: string, data: any): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  // Publishing Queue
  getPublishingQueueItems(): Promise<PublishingQueueItem[]>;
  getPublishingQueueStats(): Promise<{ pending: number; processing: number; published: number; failed: number }>;
  addToPublishingQueue(data: any): Promise<PublishingQueueItem>;
  updatePublishingQueueStatus(id: string, status: string): Promise<PublishingQueueItem | undefined>;
  removeFromPublishingQueue(id: string): Promise<void>;

  // Social Media
  getSocialPlatforms(userId: string): Promise<SocialPlatform[]>;
  createSocialContent(data: any): Promise<SocialContentItem>;
  getSocialContent(userId: string): Promise<SocialContentItem[]>;
  getSocialAnalytics(userId: string): Promise<SocialAnalyticsSnapshot[]>;

  // Teams
  getUserTeams(userId: string): Promise<Team[]>;
  createTeam(data: any): Promise<Team>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  addTeamMember(teamId: string, data: any): Promise<TeamMember>;
  updateTeamMember(memberId: string, data: any): Promise<TeamMember | undefined>;
  removeTeamMember(memberId: string): Promise<void>;

  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderId: number, data: any): Promise<OrderItem>;

  // Campaigns
  getAllCampaigns(): Promise<MarketingCampaign[]>;
  createCampaign(data: any): Promise<MarketingCampaign>;
  updateCampaign(id: string, data: any): Promise<MarketingCampaign | undefined>;
  deleteCampaign(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(marketplaceListings).where(eq(marketplaceListings.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  async getListingsByProduct(productId: number): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings).where(eq(marketplaceListings.productId, productId));
  }

  async getAllListings(): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
  }

  async getListing(id: number): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id));
    return listing || undefined;
  }

  async createListing(data: any): Promise<MarketplaceListing> {
    const [listing] = await db.insert(marketplaceListings).values(data).returning();
    return listing;
  }

  async updateListing(id: number, data: any): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.update(marketplaceListings).set(data).where(eq(marketplaceListings.id, id)).returning();
    return listing || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(data: any): Promise<Order> {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async getAllBrandProfiles(): Promise<BrandProfile[]> {
    return db.select().from(brandProfiles).orderBy(desc(brandProfiles.createdAt));
  }

  async getBrandProfile(id: number): Promise<BrandProfile | undefined> {
    const [profile] = await db.select().from(brandProfiles).where(eq(brandProfiles.id, id));
    return profile || undefined;
  }

  async createBrandProfile(data: any): Promise<BrandProfile> {
    const [profile] = await db.insert(brandProfiles).values(data).returning();
    return profile;
  }

  async updateBrandProfile(id: number, data: any): Promise<BrandProfile | undefined> {
    const [profile] = await db.update(brandProfiles).set(data).where(eq(brandProfiles.id, id)).returning();
    return profile || undefined;
  }

  async deleteBrandProfile(id: number): Promise<void> {
    await db.delete(brandProfiles).where(eq(brandProfiles.id, id));
  }

  async getAllContent(): Promise<ContentLibraryItem[]> {
    return db.select().from(contentLibrary).orderBy(desc(contentLibrary.createdAt));
  }

  async createContent(data: any): Promise<ContentLibraryItem> {
    const [item] = await db.insert(contentLibrary).values(data).returning();
    return item;
  }

  async toggleContentFavorite(id: number): Promise<ContentLibraryItem | undefined> {
    const [existing] = await db.select().from(contentLibrary).where(eq(contentLibrary.id, id));
    if (!existing) return undefined;
    const [item] = await db.update(contentLibrary).set({ isFavorite: !existing.isFavorite }).where(eq(contentLibrary.id, id)).returning();
    return item || undefined;
  }

  async deleteContent(id: number): Promise<void> {
    await db.delete(contentLibrary).where(eq(contentLibrary.id, id));
  }

  async logAiGeneration(data: any): Promise<void> {
    await db.insert(aiGenerations).values(data);
  }

  async getAiUsageStats(): Promise<{ totalGenerations: number; totalTokens: number }> {
    const all = await db.select().from(aiGenerations);
    return {
      totalGenerations: all.length,
      totalTokens: all.reduce((sum, g) => sum + g.tokensUsed, 0),
    };
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
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

  async addToCart(sessionId: string, data: { productId: number; quantity: number; selectedColor?: string; selectedSize?: string }): Promise<CartItem> {
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, data.productId)));
    if (existing.length > 0) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing[0].quantity + data.quantity })
        .where(eq(cartItems.id, existing[0].id)).returning();
      return updated;
    }
    const [item] = await db.insert(cartItems).values({ sessionId, ...data }).returning();
    return item;
  }

  async updateCartItem(id: number, data: { quantity: number }): Promise<CartItem | undefined> {
    const [item] = await db.update(cartItems).set(data).where(eq(cartItems.id, id)).returning();
    return item || undefined;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async getStyleProfile(sessionId: string): Promise<StyleProfile | undefined> {
    const [profile] = await db.select().from(styleProfiles).where(eq(styleProfiles.sessionId, sessionId));
    return profile || undefined;
  }

  async saveStyleProfile(sessionId: string, data: any): Promise<StyleProfile> {
    const existing = await this.getStyleProfile(sessionId);
    if (existing) {
      const [updated] = await db.update(styleProfiles).set(data).where(eq(styleProfiles.id, existing.id)).returning();
      return updated;
    }
    const [profile] = await db.insert(styleProfiles).values({ sessionId, ...data }).returning();
    return profile;
  }

  async getWardrobeItems(sessionId: string): Promise<WardrobeItem[]> {
    return db.select().from(wardrobeItems).where(eq(wardrobeItems.sessionId, sessionId)).orderBy(desc(wardrobeItems.createdAt));
  }

  async addWardrobeItem(sessionId: string, data: any): Promise<WardrobeItem> {
    const [item] = await db.insert(wardrobeItems).values({ sessionId, ...data }).returning();
    return item;
  }

  async removeWardrobeItem(id: number): Promise<void> {
    await db.delete(wardrobeItems).where(eq(wardrobeItems.id, id));
  }

  // ==========================================
  // Billing
  // ==========================================

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans);
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub || undefined;
  }

  // ==========================================
  // Categories
  // ==========================================

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(data: any): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async updateCategory(id: string, data: any): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // ==========================================
  // Publishing Queue
  // ==========================================

  async getPublishingQueueItems(): Promise<PublishingQueueItem[]> {
    return db.select().from(publishingQueue).orderBy(desc(publishingQueue.createdAt));
  }

  async getPublishingQueueStats(): Promise<{ pending: number; processing: number; published: number; failed: number }> {
    const all = await db.select().from(publishingQueue);
    return {
      pending: all.filter(i => i.status === "pending").length,
      processing: all.filter(i => i.status === "processing").length,
      published: all.filter(i => i.status === "published").length,
      failed: all.filter(i => i.status === "failed").length,
    };
  }

  async addToPublishingQueue(data: any): Promise<PublishingQueueItem> {
    const [item] = await db.insert(publishingQueue).values(data).returning();
    return item;
  }

  async updatePublishingQueueStatus(id: string, status: string): Promise<PublishingQueueItem | undefined> {
    const [item] = await db.update(publishingQueue).set({ status }).where(eq(publishingQueue.id, id)).returning();
    return item || undefined;
  }

  async removeFromPublishingQueue(id: string): Promise<void> {
    await db.delete(publishingQueue).where(eq(publishingQueue.id, id));
  }

  // ==========================================
  // Social Media
  // ==========================================

  async getSocialPlatforms(userId: string): Promise<SocialPlatform[]> {
    return db.select().from(socialPlatforms).where(eq(socialPlatforms.userId, userId));
  }

  async createSocialContent(data: any): Promise<SocialContentItem> {
    const [item] = await db.insert(socialContent).values(data).returning();
    return item;
  }

  async getSocialContent(userId: string): Promise<SocialContentItem[]> {
    return db.select().from(socialContent).where(eq(socialContent.userId, userId));
  }

  async getSocialAnalytics(userId: string): Promise<SocialAnalyticsSnapshot[]> {
    return db.select().from(socialAnalytics).where(eq(socialAnalytics.userId, userId));
  }

  // ==========================================
  // Teams
  // ==========================================

  async getUserTeams(userId: string): Promise<Team[]> {
    return db.select().from(teams).where(eq(teams.ownerId, userId));
  }

  async createTeam(data: any): Promise<Team> {
    const [team] = await db.insert(teams).values(data).returning();
    return team;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }

  async addTeamMember(teamId: string, data: any): Promise<TeamMember> {
    const [member] = await db.insert(teamMembers).values({ teamId, ...data }).returning();
    return member;
  }

  async updateTeamMember(memberId: string, data: any): Promise<TeamMember | undefined> {
    const [member] = await db.update(teamMembers).set(data).where(eq(teamMembers.id, memberId)).returning();
    return member || undefined;
  }

  async removeTeamMember(memberId: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));
  }

  // ==========================================
  // Order Items
  // ==========================================

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async addOrderItem(orderId: number, data: any): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values({ orderId, ...data }).returning();
    return item;
  }

  // ==========================================
  // Campaigns
  // ==========================================

  async getAllCampaigns(): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt));
  }

  async createCampaign(data: any): Promise<MarketingCampaign> {
    const [campaign] = await db.insert(marketingCampaigns).values(data).returning();
    return campaign;
  }

  async updateCampaign(id: string, data: any): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db.update(marketingCampaigns).set(data).where(eq(marketingCampaigns.id, id)).returning();
    return campaign || undefined;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
  }
}

export const storage = new DatabaseStorage();
