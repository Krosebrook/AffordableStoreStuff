/**
 * FlashFusion Integration Hub
 * 
 * Unified integration system for 25+ platforms:
 * - AI Services: OpenAI, Anthropic, Gemini, ElevenLabs, Grok, Perplexity
 * - E-commerce: Shopify, Printify, Etsy, TikTok Shop, Amazon, Amazon KDP, WooCommerce, Pinterest, Gumroad
 * - Additional: Redbubble, TeePublic, Society6, Creative Fabrica, Zazzle
 * - Automation: n8n, Zapier
 * - Productivity: Notion, GitHub
 * - Infrastructure: Redis (Upstash), Cloudflare, Supabase, Vercel
 * - Business: HubSpot, Stripe
 */

export interface ConnectorConfig {
  id: string;
  platform: string;
  displayName: string;
  description: string;
  category: 'ai' | 'ecommerce' | 'automation' | 'infrastructure' | 'business' | 'productivity';
  connectorType: 'oauth' | 'api_key' | 'webhook' | 'basic_auth';
  baseUrl: string;
  docsUrl: string;
  logoUrl?: string;
  requiredCredentials: string[];
  optionalCredentials?: string[];
  rateLimitPerMinute: number;
  features: string[];
  isBuiltIn: boolean;
}

// All 25+ Platform Connectors
export const PLATFORM_CONNECTORS: ConnectorConfig[] = [
  // ============================================================================
  // AI SERVICES
  // ============================================================================
  {
    id: 'openai',
    platform: 'openai',
    displayName: 'OpenAI',
    description: 'GPT-4, DALL-E, Whisper, and more for AI-powered content generation',
    category: 'ai',
    connectorType: 'api_key',
    baseUrl: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs',
    requiredCredentials: ['OPENAI_API_KEY'],
    rateLimitPerMinute: 60,
    features: ['text-generation', 'image-generation', 'audio-transcription', 'embeddings'],
    isBuiltIn: true,
  },
  {
    id: 'anthropic',
    platform: 'anthropic',
    displayName: 'Anthropic (Claude)',
    description: 'Claude AI for advanced reasoning, coding, and content creation',
    category: 'ai',
    connectorType: 'api_key',
    baseUrl: 'https://api.anthropic.com/v1',
    docsUrl: 'https://docs.anthropic.com',
    requiredCredentials: ['ANTHROPIC_API_KEY'],
    rateLimitPerMinute: 60,
    features: ['text-generation', 'code-generation', 'analysis'],
    isBuiltIn: true,
  },
  {
    id: 'gemini',
    platform: 'gemini',
    displayName: 'Google Gemini',
    description: 'Gemini Pro and Ultra for multimodal AI capabilities',
    category: 'ai',
    connectorType: 'api_key',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    docsUrl: 'https://ai.google.dev/docs',
    requiredCredentials: ['GOOGLE_AI_API_KEY'],
    rateLimitPerMinute: 60,
    features: ['text-generation', 'image-analysis', 'multimodal'],
    isBuiltIn: true,
  },
  {
    id: 'elevenlabs',
    platform: 'elevenlabs',
    displayName: 'ElevenLabs',
    description: 'AI voice synthesis and text-to-speech',
    category: 'ai',
    connectorType: 'api_key',
    baseUrl: 'https://api.elevenlabs.io/v1',
    docsUrl: 'https://docs.elevenlabs.io',
    requiredCredentials: ['ELEVENLABS_API_KEY'],
    rateLimitPerMinute: 30,
    features: ['text-to-speech', 'voice-cloning', 'audio-generation'],
    isBuiltIn: true,
  },
  {
    id: 'grok',
    platform: 'grok',
    displayName: 'Grok (xAI)',
    description: 'xAI Grok for real-time information and witty responses',
    category: 'ai',
    connectorType: 'api_key',
    baseUrl: 'https://api.x.ai/v1',
    docsUrl: 'https://docs.x.ai',
    requiredCredentials: ['XAI_API_KEY'],
    rateLimitPerMinute: 60,
    features: ['text-generation', 'real-time-info'],
    isBuiltIn: true,
  },
  {
    id: 'perplexity',
    platform: 'perplexity',
    displayName: 'Perplexity AI',
    description: 'AI-powered search and research assistant',
    category: 'ai',
    connectorType: 'api_key',
    baseUrl: 'https://api.perplexity.ai',
    docsUrl: 'https://docs.perplexity.ai',
    requiredCredentials: ['PERPLEXITY_API_KEY'],
    rateLimitPerMinute: 50,
    features: ['search', 'research', 'citations'],
    isBuiltIn: true,
  },

  // ============================================================================
  // E-COMMERCE PLATFORMS
  // ============================================================================
  {
    id: 'shopify',
    platform: 'shopify',
    displayName: 'Shopify',
    description: 'Full e-commerce platform integration for product management',
    category: 'ecommerce',
    connectorType: 'oauth',
    baseUrl: 'https://{shop}.myshopify.com/admin/api/2024-01',
    docsUrl: 'https://shopify.dev/docs/api',
    requiredCredentials: ['SHOPIFY_ACCESS_TOKEN', 'SHOPIFY_SHOP_DOMAIN'],
    rateLimitPerMinute: 40,
    features: ['products', 'orders', 'inventory', 'customers'],
    isBuiltIn: true,
  },
  {
    id: 'printify',
    platform: 'printify',
    displayName: 'Printify',
    description: 'Print-on-demand product creation and fulfillment',
    category: 'ecommerce',
    connectorType: 'oauth',
    baseUrl: 'https://api.printify.com/v1',
    docsUrl: 'https://developers.printify.com',
    requiredCredentials: ['PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID'],
    optionalCredentials: ['PRINTIFY_CLIENT_ID', 'PRINTIFY_CLIENT_SECRET'],
    rateLimitPerMinute: 60,
    features: ['products', 'mockups', 'publishing', 'fulfillment', 'oauth', 'webhooks'],
    isBuiltIn: true,
  },
  {
    id: 'printful',
    platform: 'printful',
    displayName: 'Printful',
    description: 'Print-on-demand with product sync and fulfillment',
    category: 'ecommerce',
    connectorType: 'api_key',
    baseUrl: 'https://api.printful.com',
    docsUrl: 'https://developers.printful.com/docs',
    requiredCredentials: ['PRINTFUL_API_KEY'],
    optionalCredentials: ['PRINTFUL_STORE_ID'],
    rateLimitPerMinute: 120,
    features: ['products', 'sync', 'inventory', 'fulfillment', 'webhooks', 'two-way-sync'],
    isBuiltIn: true,
  },
  {
    id: 'etsy',
    platform: 'etsy',
    displayName: 'Etsy',
    description: 'Marketplace for handmade and vintage items',
    category: 'ecommerce',
    connectorType: 'oauth',
    baseUrl: 'https://openapi.etsy.com/v3',
    docsUrl: 'https://developers.etsy.com',
    requiredCredentials: ['ETSY_API_KEY', 'ETSY_ACCESS_TOKEN'],
    rateLimitPerMinute: 100,
    features: ['listings', 'orders', 'reviews', 'inventory'],
    isBuiltIn: true,
  },
  {
    id: 'tiktok-shop',
    platform: 'tiktok-shop',
    displayName: 'TikTok Shop',
    description: 'Social commerce through TikTok',
    category: 'ecommerce',
    connectorType: 'oauth',
    baseUrl: 'https://open-api.tiktokglobalshop.com',
    docsUrl: 'https://partner.tiktokshop.com/doc',
    requiredCredentials: ['TIKTOK_APP_KEY', 'TIKTOK_APP_SECRET', 'TIKTOK_ACCESS_TOKEN'],
    rateLimitPerMinute: 60,
    features: ['products', 'orders', 'inventory', 'promotions'],
    isBuiltIn: true,
  },
  {
    id: 'amazon-sp',
    platform: 'amazon-sp',
    displayName: 'Amazon Seller',
    description: 'Amazon Selling Partner API for marketplace sellers',
    category: 'ecommerce',
    connectorType: 'oauth',
    baseUrl: 'https://sellingpartnerapi-na.amazon.com',
    docsUrl: 'https://developer-docs.amazon.com/sp-api/',
    requiredCredentials: ['AMAZON_CLIENT_ID', 'AMAZON_CLIENT_SECRET', 'AMAZON_REFRESH_TOKEN'],
    rateLimitPerMinute: 30,
    features: ['listings', 'orders', 'inventory', 'reports'],
    isBuiltIn: true,
  },
  {
    id: 'amazon-kdp',
    platform: 'amazon-kdp',
    displayName: 'Amazon KDP',
    description: 'Kindle Direct Publishing for ebooks and paperbacks',
    category: 'ecommerce',
    connectorType: 'basic_auth',
    baseUrl: 'https://kdp.amazon.com',
    docsUrl: 'https://kdp.amazon.com/help',
    requiredCredentials: ['AMAZON_KDP_EMAIL', 'AMAZON_KDP_PASSWORD'],
    optionalCredentials: ['AMAZON_KDP_TOTP_SECRET'],
    rateLimitPerMinute: 10,
    features: ['books', 'manuscripts', 'covers', 'publishing'],
    isBuiltIn: true,
  },
  {
    id: 'woocommerce',
    platform: 'woocommerce',
    displayName: 'WooCommerce',
    description: 'WordPress e-commerce integration',
    category: 'ecommerce',
    connectorType: 'api_key',
    baseUrl: '{store_url}/wp-json/wc/v3',
    docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    requiredCredentials: ['WOOCOMMERCE_URL', 'WOOCOMMERCE_KEY', 'WOOCOMMERCE_SECRET'],
    rateLimitPerMinute: 60,
    features: ['products', 'orders', 'customers', 'coupons'],
    isBuiltIn: true,
  },
  {
    id: 'pinterest',
    platform: 'pinterest',
    displayName: 'Pinterest',
    description: 'Visual discovery and shopping platform',
    category: 'ecommerce',
    connectorType: 'oauth',
    baseUrl: 'https://api.pinterest.com/v5',
    docsUrl: 'https://developers.pinterest.com',
    requiredCredentials: ['PINTEREST_ACCESS_TOKEN'],
    rateLimitPerMinute: 1000,
    features: ['pins', 'boards', 'catalogs', 'ads'],
    isBuiltIn: true,
  },
  {
    id: 'gumroad',
    platform: 'gumroad',
    displayName: 'Gumroad',
    description: 'Digital products and creator monetization',
    category: 'ecommerce',
    connectorType: 'api_key',
    baseUrl: 'https://api.gumroad.com/v2',
    docsUrl: 'https://app.gumroad.com/api',
    requiredCredentials: ['GUMROAD_ACCESS_TOKEN'],
    rateLimitPerMinute: 60,
    features: ['products', 'sales', 'subscriptions', 'analytics'],
    isBuiltIn: true,
  },
  {
    id: 'redbubble',
    platform: 'redbubble',
    displayName: 'Redbubble',
    description: 'Print-on-demand marketplace for artists',
    category: 'ecommerce',
    connectorType: 'basic_auth',
    baseUrl: 'https://www.redbubble.com',
    docsUrl: 'https://help.redbubble.com',
    requiredCredentials: ['REDBUBBLE_EMAIL', 'REDBUBBLE_PASSWORD'],
    rateLimitPerMinute: 20,
    features: ['artworks', 'products', 'analytics'],
    isBuiltIn: true,
  },
  {
    id: 'teepublic',
    platform: 'teepublic',
    displayName: 'TeePublic',
    description: 'T-shirt and merch marketplace',
    category: 'ecommerce',
    connectorType: 'basic_auth',
    baseUrl: 'https://www.teepublic.com',
    docsUrl: 'https://www.teepublic.com/sell',
    requiredCredentials: ['TEEPUBLIC_EMAIL', 'TEEPUBLIC_PASSWORD'],
    rateLimitPerMinute: 20,
    features: ['designs', 'products', 'sales'],
    isBuiltIn: true,
  },
  {
    id: 'society6',
    platform: 'society6',
    displayName: 'Society6',
    description: 'Art and home decor marketplace',
    category: 'ecommerce',
    connectorType: 'basic_auth',
    baseUrl: 'https://society6.com',
    docsUrl: 'https://society6.com/sell',
    requiredCredentials: ['SOCIETY6_EMAIL', 'SOCIETY6_PASSWORD'],
    rateLimitPerMinute: 20,
    features: ['artworks', 'products', 'promotions'],
    isBuiltIn: true,
  },
  {
    id: 'creative-fabrica',
    platform: 'creative-fabrica',
    displayName: 'Creative Fabrica',
    description: 'Digital assets and fonts marketplace',
    category: 'ecommerce',
    connectorType: 'api_key',
    baseUrl: 'https://www.creativefabrica.com/api',
    docsUrl: 'https://www.creativefabrica.com/designers',
    requiredCredentials: ['CREATIVE_FABRICA_API_KEY'],
    rateLimitPerMinute: 30,
    features: ['fonts', 'graphics', 'crafts', 'analytics'],
    isBuiltIn: true,
  },
  {
    id: 'zazzle',
    platform: 'zazzle',
    displayName: 'Zazzle',
    description: 'Customizable products marketplace',
    category: 'ecommerce',
    connectorType: 'api_key',
    baseUrl: 'https://api.zazzle.com',
    docsUrl: 'https://www.zazzle.com/developer',
    requiredCredentials: ['ZAZZLE_API_KEY'],
    rateLimitPerMinute: 30,
    features: ['products', 'designs', 'analytics'],
    isBuiltIn: true,
  },

  // ============================================================================
  // AUTOMATION PLATFORMS
  // ============================================================================
  {
    id: 'n8n',
    platform: 'n8n',
    displayName: 'n8n',
    description: 'Workflow automation and integration platform',
    category: 'automation',
    connectorType: 'api_key',
    baseUrl: '{n8n_url}/api/v1',
    docsUrl: 'https://docs.n8n.io',
    requiredCredentials: ['N8N_URL', 'N8N_API_KEY'],
    rateLimitPerMinute: 100,
    features: ['workflows', 'triggers', 'executions', 'webhooks'],
    isBuiltIn: true,
  },
  {
    id: 'zapier',
    platform: 'zapier',
    displayName: 'Zapier',
    description: 'No-code automation between apps',
    category: 'automation',
    connectorType: 'api_key',
    baseUrl: 'https://api.zapier.com/v1',
    docsUrl: 'https://platform.zapier.com/docs',
    requiredCredentials: ['ZAPIER_API_KEY'],
    rateLimitPerMinute: 100,
    features: ['zaps', 'triggers', 'actions', 'webhooks'],
    isBuiltIn: true,
  },

  // ============================================================================
  // PRODUCTIVITY
  // ============================================================================
  {
    id: 'notion',
    platform: 'notion',
    displayName: 'Notion',
    description: 'Workspace for notes, docs, and databases',
    category: 'productivity',
    connectorType: 'oauth',
    baseUrl: 'https://api.notion.com/v1',
    docsUrl: 'https://developers.notion.com',
    requiredCredentials: ['NOTION_API_KEY'],
    rateLimitPerMinute: 30,
    features: ['pages', 'databases', 'blocks', 'users'],
    isBuiltIn: true,
  },
  {
    id: 'github',
    platform: 'github',
    displayName: 'GitHub',
    description: 'Code hosting and version control',
    category: 'productivity',
    connectorType: 'oauth',
    baseUrl: 'https://api.github.com',
    docsUrl: 'https://docs.github.com/rest',
    requiredCredentials: ['GITHUB_TOKEN'],
    rateLimitPerMinute: 60,
    features: ['repos', 'issues', 'pull-requests', 'actions'],
    isBuiltIn: true,
  },

  // ============================================================================
  // INFRASTRUCTURE
  // ============================================================================
  {
    id: 'upstash-redis',
    platform: 'upstash-redis',
    displayName: 'Upstash Redis',
    description: 'Serverless Redis for caching and rate limiting',
    category: 'infrastructure',
    connectorType: 'api_key',
    baseUrl: '{redis_url}',
    docsUrl: 'https://docs.upstash.com/redis',
    requiredCredentials: ['UPSTASH_REDIS_URL', 'UPSTASH_REDIS_TOKEN'],
    rateLimitPerMinute: 1000,
    features: ['caching', 'rate-limiting', 'sessions', 'queues'],
    isBuiltIn: true,
  },
  {
    id: 'cloudflare',
    platform: 'cloudflare',
    displayName: 'Cloudflare',
    description: 'CDN, DNS, and edge computing',
    category: 'infrastructure',
    connectorType: 'api_key',
    baseUrl: 'https://api.cloudflare.com/client/v4',
    docsUrl: 'https://developers.cloudflare.com/api/',
    requiredCredentials: ['CLOUDFLARE_API_TOKEN'],
    optionalCredentials: ['CLOUDFLARE_ZONE_ID'],
    rateLimitPerMinute: 1200,
    features: ['dns', 'cdn', 'workers', 'r2-storage'],
    isBuiltIn: true,
  },
  {
    id: 'supabase',
    platform: 'supabase',
    displayName: 'Supabase',
    description: 'Open source Firebase alternative',
    category: 'infrastructure',
    connectorType: 'api_key',
    baseUrl: '{supabase_url}',
    docsUrl: 'https://supabase.com/docs',
    requiredCredentials: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'],
    optionalCredentials: ['SUPABASE_SERVICE_KEY'],
    rateLimitPerMinute: 100,
    features: ['database', 'auth', 'storage', 'realtime'],
    isBuiltIn: true,
  },
  {
    id: 'vercel',
    platform: 'vercel',
    displayName: 'Vercel',
    description: 'Frontend deployment and hosting',
    category: 'infrastructure',
    connectorType: 'api_key',
    baseUrl: 'https://api.vercel.com',
    docsUrl: 'https://vercel.com/docs/rest-api',
    requiredCredentials: ['VERCEL_TOKEN'],
    rateLimitPerMinute: 100,
    features: ['deployments', 'domains', 'env-vars', 'analytics'],
    isBuiltIn: true,
  },

  // ============================================================================
  // BUSINESS
  // ============================================================================
  {
    id: 'hubspot',
    platform: 'hubspot',
    displayName: 'HubSpot',
    description: 'CRM, marketing, and sales automation',
    category: 'business',
    connectorType: 'oauth',
    baseUrl: 'https://api.hubapi.com',
    docsUrl: 'https://developers.hubspot.com/docs/api',
    requiredCredentials: ['HUBSPOT_ACCESS_TOKEN'],
    rateLimitPerMinute: 100,
    features: ['contacts', 'deals', 'marketing', 'analytics'],
    isBuiltIn: true,
  },
  {
    id: 'stripe',
    platform: 'stripe',
    displayName: 'Stripe',
    description: 'Payment processing and billing',
    category: 'business',
    connectorType: 'api_key',
    baseUrl: 'https://api.stripe.com/v1',
    docsUrl: 'https://stripe.com/docs/api',
    requiredCredentials: ['STRIPE_SECRET_KEY'],
    optionalCredentials: ['STRIPE_WEBHOOK_SECRET'],
    rateLimitPerMinute: 100,
    features: ['payments', 'subscriptions', 'invoices', 'customers'],
    isBuiltIn: true,
  },
];

// Get connectors by category
export function getConnectorsByCategory(category: ConnectorConfig['category']): ConnectorConfig[] {
  return PLATFORM_CONNECTORS.filter(c => c.category === category);
}

// Get connector by platform ID
export function getConnectorById(id: string): ConnectorConfig | undefined {
  return PLATFORM_CONNECTORS.find(c => c.id === id);
}

// Get all categories with counts
export function getConnectorCategories(): { category: string; count: number; connectors: ConnectorConfig[] }[] {
  const categories = ['ai', 'ecommerce', 'automation', 'productivity', 'infrastructure', 'business'] as const;
  return categories.map(category => ({
    category,
    count: PLATFORM_CONNECTORS.filter(c => c.category === category).length,
    connectors: PLATFORM_CONNECTORS.filter(c => c.category === category),
  }));
}
