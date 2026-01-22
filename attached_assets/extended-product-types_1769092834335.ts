/**
 * Extended Product Types v2.0
 * 40+ POD and Digital product types with full specifications
 */

export interface ProductTypeSpec {
  id: string;
  name: string;
  category: 'pod' | 'digital';
  subcategory: string;
  
  // Design specifications
  designSpecs: {
    width: number;
    height: number;
    dpi: number;
    format: string[];
    safeArea?: { top: number; right: number; bottom: number; left: number };
    bleed?: number;
  };
  
  // Pricing
  pricing: {
    baseCost: number;      // Production cost
    recommendedPrice: number;
    premiumPrice: number;
    marginPercent: number;
  };
  
  // Platform availability
  platforms: {
    printify?: { blueprintId: number; providerId: number };
    printful?: { productId: number };
    gooten?: { productId: string };
    gelato?: { productUid: string };
    amazon?: { category: string };
    gumroad?: { type: string };
  };
  
  // SEO and marketing
  defaultTags: string[];
  targetAudience: string[];
  bestNiches: string[];
  seasonalPeak?: number[]; // Months 1-12
  
  // Fulfillment
  avgProductionDays: number;
  shippingWeight: string;
  fragile: boolean;
}

export const EXTENDED_PRODUCT_TYPES: Record<string, ProductTypeSpec> = {
  // ═══════════════════════════════════════════════════════════════
  // APPAREL - Core (10 products)
  // ═══════════════════════════════════════════════════════════════
  'pod_tshirt': {
    id: 'pod_tshirt',
    name: 'T-Shirt',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 5400,
      dpi: 300,
      format: ['png', 'jpg'],
      safeArea: { top: 200, right: 200, bottom: 200, left: 200 },
    },
    pricing: {
      baseCost: 8.50,
      recommendedPrice: 24.99,
      premiumPrice: 29.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 6, providerId: 99 },
      printful: { productId: 71 },
    },
    defaultTags: ['tshirt', 't-shirt', 'unisex', 'gift', 'casual', 'cotton', 'graphic tee'],
    targetAudience: ['adults', 'teens', 'all genders'],
    bestNiches: ['humor', 'occupations', 'hobbies', 'pets', 'lifestyle'],
    avgProductionDays: 3,
    shippingWeight: '6oz',
    fragile: false,
  },

  'pod_hoodie': {
    id: 'pod_hoodie',
    name: 'Hoodie',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 4800,
      dpi: 300,
      format: ['png', 'jpg'],
      safeArea: { top: 200, right: 200, bottom: 200, left: 200 },
    },
    pricing: {
      baseCost: 22.00,
      recommendedPrice: 44.99,
      premiumPrice: 54.99,
      marginPercent: 50,
    },
    platforms: {
      printify: { blueprintId: 77, providerId: 99 },
      printful: { productId: 146 },
    },
    defaultTags: ['hoodie', 'sweatshirt', 'pullover', 'cozy', 'warm', 'gift', 'unisex'],
    targetAudience: ['adults', 'teens'],
    bestNiches: ['gaming', 'sports', 'lifestyle', 'occupation', 'seasonal'],
    seasonalPeak: [10, 11, 12, 1, 2],
    avgProductionDays: 4,
    shippingWeight: '16oz',
    fragile: false,
  },

  'pod_sweatshirt': {
    id: 'pod_sweatshirt',
    name: 'Crewneck Sweatshirt',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 4500,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 18.00,
      recommendedPrice: 39.99,
      premiumPrice: 49.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 316, providerId: 99 },
      printful: { productId: 380 },
    },
    defaultTags: ['sweatshirt', 'crewneck', 'cozy', 'warm', 'casual', 'unisex'],
    targetAudience: ['adults', 'teens'],
    bestNiches: ['seasonal', 'lifestyle', 'sports', 'college'],
    seasonalPeak: [9, 10, 11, 12, 1, 2],
    avgProductionDays: 4,
    shippingWeight: '14oz',
    fragile: false,
  },

  'pod_tank': {
    id: 'pod_tank',
    name: 'Tank Top',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 5400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 7.50,
      recommendedPrice: 22.99,
      premiumPrice: 27.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 35, providerId: 99 },
      printful: { productId: 164 },
    },
    defaultTags: ['tank top', 'sleeveless', 'summer', 'workout', 'gym', 'casual'],
    targetAudience: ['adults', 'fitness enthusiasts'],
    bestNiches: ['fitness', 'summer', 'beach', 'yoga', 'lifestyle'],
    seasonalPeak: [5, 6, 7, 8],
    avgProductionDays: 3,
    shippingWeight: '4oz',
    fragile: false,
  },

  'pod_longsleeve': {
    id: 'pod_longsleeve',
    name: 'Long Sleeve T-Shirt',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 5400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 12.00,
      recommendedPrice: 29.99,
      premiumPrice: 34.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 45, providerId: 99 },
      printful: { productId: 288 },
    },
    defaultTags: ['long sleeve', 'shirt', 'casual', 'layering', 'unisex'],
    targetAudience: ['adults', 'teens'],
    bestNiches: ['seasonal', 'occupation', 'lifestyle', 'sports'],
    seasonalPeak: [9, 10, 11, 12, 1, 2, 3],
    avgProductionDays: 3,
    shippingWeight: '8oz',
    fragile: false,
  },

  'pod_vneck': {
    id: 'pod_vneck',
    name: 'V-Neck T-Shirt',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 5400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 9.00,
      recommendedPrice: 25.99,
      premiumPrice: 29.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 15, providerId: 99 },
    },
    defaultTags: ['v-neck', 't-shirt', 'fitted', 'casual', 'women', 'slim fit'],
    targetAudience: ['women', 'men'],
    bestNiches: ['lifestyle', 'occupation', 'fashion'],
    avgProductionDays: 3,
    shippingWeight: '6oz',
    fragile: false,
  },

  'pod_polo': {
    id: 'pod_polo',
    name: 'Polo Shirt',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 4500,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 15.00,
      recommendedPrice: 34.99,
      premiumPrice: 44.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 420, providerId: 99 },
    },
    defaultTags: ['polo', 'golf shirt', 'business casual', 'professional', 'collar'],
    targetAudience: ['adults', 'professionals'],
    bestNiches: ['golf', 'occupation', 'corporate', 'dad'],
    avgProductionDays: 5,
    shippingWeight: '8oz',
    fragile: false,
  },

  'pod_onesie': {
    id: 'pod_onesie',
    name: 'Baby Onesie',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 2400,
      height: 2400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 6.50,
      recommendedPrice: 18.99,
      premiumPrice: 22.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 1042, providerId: 99 },
      printful: { productId: 19 },
    },
    defaultTags: ['baby onesie', 'infant', 'bodysuit', 'baby shower', 'newborn', 'gift'],
    targetAudience: ['new parents', 'gift-givers'],
    bestNiches: ['baby', 'pregnancy', 'family', 'funny', 'cute'],
    avgProductionDays: 3,
    shippingWeight: '4oz',
    fragile: false,
  },

  'pod_leggings': {
    id: 'pod_leggings',
    name: 'Leggings',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 5400,
      height: 6300,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 18.00,
      recommendedPrice: 44.99,
      premiumPrice: 54.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 429, providerId: 99 },
      printful: { productId: 189 },
    },
    defaultTags: ['leggings', 'yoga pants', 'workout', 'fitness', 'athleisure', 'women'],
    targetAudience: ['women', 'fitness enthusiasts'],
    bestNiches: ['yoga', 'fitness', 'patterns', 'artistic'],
    avgProductionDays: 5,
    shippingWeight: '6oz',
    fragile: false,
  },

  'pod_shorts': {
    id: 'pod_shorts',
    name: 'Athletic Shorts',
    category: 'pod',
    subcategory: 'apparel',
    designSpecs: {
      width: 4500,
      height: 4500,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 14.00,
      recommendedPrice: 32.99,
      premiumPrice: 39.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 587, providerId: 99 },
    },
    defaultTags: ['shorts', 'athletic', 'workout', 'gym', 'summer', 'casual'],
    targetAudience: ['adults', 'athletes'],
    bestNiches: ['fitness', 'sports', 'summer', 'gaming'],
    seasonalPeak: [5, 6, 7, 8],
    avgProductionDays: 5,
    shippingWeight: '6oz',
    fragile: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // DRINKWARE (8 products)
  // ═══════════════════════════════════════════════════════════════
  'pod_mug': {
    id: 'pod_mug',
    name: 'Ceramic Mug (11oz)',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 3000,
      height: 1200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 5.50,
      recommendedPrice: 16.99,
      premiumPrice: 19.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 68, providerId: 99 },
      printful: { productId: 19 },
    },
    defaultTags: ['mug', 'coffee mug', 'tea cup', '11oz', 'ceramic', 'gift', 'dishwasher safe'],
    targetAudience: ['adults', 'office workers', 'gift-givers'],
    bestNiches: ['coffee', 'occupation', 'humor', 'quotes', 'pets'],
    avgProductionDays: 3,
    shippingWeight: '12oz',
    fragile: true,
  },

  'pod_mug_15oz': {
    id: 'pod_mug_15oz',
    name: 'Ceramic Mug (15oz)',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 3200,
      height: 1400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 6.50,
      recommendedPrice: 18.99,
      premiumPrice: 22.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 69, providerId: 99 },
    },
    defaultTags: ['mug', 'coffee mug', '15oz', 'large mug', 'ceramic', 'gift'],
    targetAudience: ['adults', 'coffee lovers'],
    bestNiches: ['coffee', 'occupation', 'humor', 'dad', 'mom'],
    avgProductionDays: 3,
    shippingWeight: '16oz',
    fragile: true,
  },

  'pod_tumbler': {
    id: 'pod_tumbler',
    name: 'Stainless Steel Tumbler (20oz)',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 2700,
      height: 1500,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 12.00,
      recommendedPrice: 29.99,
      premiumPrice: 34.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 631, providerId: 99 },
    },
    defaultTags: ['tumbler', 'travel cup', 'insulated', 'stainless steel', 'hot cold', 'gift'],
    targetAudience: ['adults', 'commuters', 'travelers'],
    bestNiches: ['mom', 'nurse', 'teacher', 'occupation', 'sports'],
    avgProductionDays: 5,
    shippingWeight: '12oz',
    fragile: false,
  },

  'pod_water_bottle': {
    id: 'pod_water_bottle',
    name: 'Water Bottle',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 2400,
      height: 3600,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 10.00,
      recommendedPrice: 26.99,
      premiumPrice: 32.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 594, providerId: 99 },
    },
    defaultTags: ['water bottle', 'reusable', 'hydration', 'gym', 'fitness', 'eco'],
    targetAudience: ['fitness enthusiasts', 'eco-conscious'],
    bestNiches: ['fitness', 'eco', 'sports', 'hiking', 'yoga'],
    avgProductionDays: 5,
    shippingWeight: '10oz',
    fragile: false,
  },

  'pod_pint_glass': {
    id: 'pod_pint_glass',
    name: 'Pint Glass (16oz)',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 2400,
      height: 1800,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 6.00,
      recommendedPrice: 18.99,
      premiumPrice: 22.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 559, providerId: 99 },
    },
    defaultTags: ['pint glass', 'beer glass', 'bar', 'pub', 'drinking', 'gift'],
    targetAudience: ['adults', 'beer enthusiasts'],
    bestNiches: ['beer', 'dad', 'groomsmen', 'sports', 'man-cave'],
    avgProductionDays: 4,
    shippingWeight: '14oz',
    fragile: true,
  },

  'pod_wine_glass': {
    id: 'pod_wine_glass',
    name: 'Stemless Wine Glass',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 2400,
      height: 1800,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 6.00,
      recommendedPrice: 18.99,
      premiumPrice: 22.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 558, providerId: 99 },
    },
    defaultTags: ['wine glass', 'stemless', 'wine lover', 'gift', 'bridesmaid'],
    targetAudience: ['adults', 'wine lovers'],
    bestNiches: ['wine', 'mom', 'bridesmaid', 'bachelorette', 'funny'],
    avgProductionDays: 4,
    shippingWeight: '12oz',
    fragile: true,
  },

  'pod_shot_glass': {
    id: 'pod_shot_glass',
    name: 'Shot Glass',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 1200,
      height: 1200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 3.50,
      recommendedPrice: 12.99,
      premiumPrice: 14.99,
      marginPercent: 70,
    },
    platforms: {
      printify: { blueprintId: 557, providerId: 99 },
    },
    defaultTags: ['shot glass', 'party', 'bar', 'drinking', 'bachelor', 'gift'],
    targetAudience: ['adults', 'party hosts'],
    bestNiches: ['bachelor', 'bachelorette', 'birthday', 'humor', 'travel'],
    avgProductionDays: 4,
    shippingWeight: '4oz',
    fragile: true,
  },

  'pod_can_cooler': {
    id: 'pod_can_cooler',
    name: 'Can Cooler / Koozie',
    category: 'pod',
    subcategory: 'drinkware',
    designSpecs: {
      width: 2000,
      height: 1200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 4.00,
      recommendedPrice: 12.99,
      premiumPrice: 15.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 612, providerId: 99 },
    },
    defaultTags: ['can cooler', 'koozie', 'beer holder', 'party', 'bbq', 'tailgate'],
    targetAudience: ['adults', 'party hosts'],
    bestNiches: ['bbq', 'sports', 'summer', 'wedding', 'bachelor'],
    seasonalPeak: [5, 6, 7, 8, 9],
    avgProductionDays: 3,
    shippingWeight: '2oz',
    fragile: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // HOME DECOR (12 products)
  // ═══════════════════════════════════════════════════════════════
  'pod_poster': {
    id: 'pod_poster',
    name: 'Poster Print',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 4500,
      height: 6000,
      dpi: 300,
      format: ['png', 'jpg'],
      bleed: 150,
    },
    pricing: {
      baseCost: 4.00,
      recommendedPrice: 18.99,
      premiumPrice: 24.99,
      marginPercent: 75,
    },
    platforms: {
      printify: { blueprintId: 381, providerId: 99 },
      printful: { productId: 1 },
    },
    defaultTags: ['poster', 'wall art', 'print', 'home decor', 'artwork', 'room decor'],
    targetAudience: ['adults', 'home decorators'],
    bestNiches: ['minimalist', 'astrology', 'music', 'gaming', 'quotes'],
    avgProductionDays: 3,
    shippingWeight: '4oz',
    fragile: false,
  },

  'pod_canvas': {
    id: 'pod_canvas',
    name: 'Canvas Print',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 6000,
      height: 4500,
      dpi: 300,
      format: ['png', 'jpg'],
      bleed: 300,
    },
    pricing: {
      baseCost: 18.00,
      recommendedPrice: 49.99,
      premiumPrice: 69.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 361, providerId: 99 },
      printful: { productId: 3 },
    },
    defaultTags: ['canvas', 'wall art', 'home decor', 'gallery wrap', 'artwork', 'gift'],
    targetAudience: ['adults', 'home decorators', 'gift-givers'],
    bestNiches: ['pets', 'family', 'memorial', 'religious', 'quotes'],
    avgProductionDays: 5,
    shippingWeight: '2lb',
    fragile: true,
  },

  'pod_blanket': {
    id: 'pod_blanket',
    name: 'Fleece Blanket',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 6000,
      height: 7200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 22.00,
      recommendedPrice: 54.99,
      premiumPrice: 69.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 576, providerId: 99 },
      printful: { productId: 295 },
    },
    defaultTags: ['blanket', 'fleece', 'throw blanket', 'cozy', 'gift', 'home decor'],
    targetAudience: ['adults', 'families', 'gift-givers'],
    bestNiches: ['pets', 'grandparent', 'memorial', 'christmas', 'sports'],
    seasonalPeak: [10, 11, 12, 1, 2],
    avgProductionDays: 5,
    shippingWeight: '2lb',
    fragile: false,
  },

  'pod_pillow': {
    id: 'pod_pillow',
    name: 'Throw Pillow',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 4500,
      height: 4500,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 14.00,
      recommendedPrice: 34.99,
      premiumPrice: 44.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 88, providerId: 99 },
      printful: { productId: 83 },
    },
    defaultTags: ['pillow', 'throw pillow', 'home decor', 'couch', 'bedroom', 'gift'],
    targetAudience: ['adults', 'home decorators'],
    bestNiches: ['pets', 'quotes', 'patterns', 'holiday', 'mom'],
    avgProductionDays: 5,
    shippingWeight: '1lb',
    fragile: false,
  },

  'pod_doormat': {
    id: 'pod_doormat',
    name: 'Doormat',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 4500,
      height: 2700,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 12.00,
      recommendedPrice: 34.99,
      premiumPrice: 44.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 608, providerId: 99 },
    },
    defaultTags: ['doormat', 'welcome mat', 'front door', 'home decor', 'housewarming', 'gift'],
    targetAudience: ['homeowners', 'gift-givers'],
    bestNiches: ['pets', 'family', 'holiday', 'humor', 'welcome'],
    avgProductionDays: 5,
    shippingWeight: '2lb',
    fragile: false,
  },

  'pod_flag': {
    id: 'pod_flag',
    name: 'Garden/House Flag',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 3600,
      height: 5400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 8.00,
      recommendedPrice: 24.99,
      premiumPrice: 29.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 621, providerId: 99 },
    },
    defaultTags: ['flag', 'garden flag', 'house flag', 'outdoor', 'yard decor', 'seasonal'],
    targetAudience: ['homeowners', 'gardeners'],
    bestNiches: ['patriotic', 'seasonal', 'holiday', 'pets', 'sports'],
    avgProductionDays: 4,
    shippingWeight: '6oz',
    fragile: false,
  },

  'pod_ornament': {
    id: 'pod_ornament',
    name: 'Christmas Ornament',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 2400,
      height: 2400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 6.00,
      recommendedPrice: 18.99,
      premiumPrice: 24.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 646, providerId: 99 },
    },
    defaultTags: ['ornament', 'christmas', 'holiday', 'tree decoration', 'gift', 'personalized'],
    targetAudience: ['families', 'gift-givers'],
    bestNiches: ['christmas', 'family', 'pets', 'memorial', 'first'],
    seasonalPeak: [10, 11, 12],
    avgProductionDays: 4,
    shippingWeight: '4oz',
    fragile: true,
  },

  'pod_coaster': {
    id: 'pod_coaster',
    name: 'Coaster Set',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 1200,
      height: 1200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 8.00,
      recommendedPrice: 22.99,
      premiumPrice: 28.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 618, providerId: 99 },
    },
    defaultTags: ['coaster', 'drink coaster', 'home decor', 'bar', 'housewarming', 'gift'],
    targetAudience: ['adults', 'home decorators'],
    bestNiches: ['beer', 'wine', 'quotes', 'patterns', 'wedding'],
    avgProductionDays: 4,
    shippingWeight: '8oz',
    fragile: false,
  },

  'pod_towel': {
    id: 'pod_towel',
    name: 'Kitchen/Hand Towel',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 2400,
      height: 3600,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 7.00,
      recommendedPrice: 19.99,
      premiumPrice: 24.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 624, providerId: 99 },
    },
    defaultTags: ['towel', 'kitchen towel', 'dish towel', 'home decor', 'gift', 'housewarming'],
    targetAudience: ['home cooks', 'gift-givers'],
    bestNiches: ['cooking', 'baking', 'quotes', 'holiday', 'mom'],
    avgProductionDays: 4,
    shippingWeight: '4oz',
    fragile: false,
  },

  'pod_apron': {
    id: 'pod_apron',
    name: 'Apron',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 3000,
      height: 3600,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 12.00,
      recommendedPrice: 29.99,
      premiumPrice: 36.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 461, providerId: 99 },
    },
    defaultTags: ['apron', 'kitchen', 'cooking', 'baking', 'chef', 'bbq', 'gift'],
    targetAudience: ['home cooks', 'bbq enthusiasts'],
    bestNiches: ['bbq', 'baking', 'chef', 'dad', 'mom', 'funny'],
    avgProductionDays: 4,
    shippingWeight: '6oz',
    fragile: false,
  },

  'pod_cutting_board': {
    id: 'pod_cutting_board',
    name: 'Cutting Board',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 3600,
      height: 2400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 15.00,
      recommendedPrice: 39.99,
      premiumPrice: 49.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 627, providerId: 99 },
    },
    defaultTags: ['cutting board', 'kitchen', 'cooking', 'cheese board', 'gift', 'personalized'],
    targetAudience: ['home cooks', 'gift-givers'],
    bestNiches: ['wedding', 'family', 'housewarming', 'cooking', 'personalized'],
    avgProductionDays: 5,
    shippingWeight: '2lb',
    fragile: false,
  },

  'pod_mousepad': {
    id: 'pod_mousepad',
    name: 'Mouse Pad',
    category: 'pod',
    subcategory: 'home_decor',
    designSpecs: {
      width: 2400,
      height: 2000,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 5.00,
      recommendedPrice: 15.99,
      premiumPrice: 19.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 312, providerId: 99 },
    },
    defaultTags: ['mousepad', 'mouse pad', 'desk', 'office', 'gaming', 'work from home'],
    targetAudience: ['office workers', 'gamers'],
    bestNiches: ['gaming', 'tech', 'quotes', 'patterns', 'pets'],
    avgProductionDays: 3,
    shippingWeight: '4oz',
    fragile: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // ACCESSORIES (8 products)
  // ═══════════════════════════════════════════════════════════════
  'pod_tote': {
    id: 'pod_tote',
    name: 'Tote Bag',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 4500,
      height: 4500,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 8.00,
      recommendedPrice: 24.99,
      premiumPrice: 29.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 536, providerId: 99 },
      printful: { productId: 84 },
    },
    defaultTags: ['tote bag', 'canvas bag', 'shopping bag', 'eco', 'reusable', 'gift'],
    targetAudience: ['women', 'eco-conscious'],
    bestNiches: ['teacher', 'books', 'quotes', 'eco', 'mom', 'beach'],
    avgProductionDays: 3,
    shippingWeight: '6oz',
    fragile: false,
  },

  'pod_sticker': {
    id: 'pod_sticker',
    name: 'Vinyl Sticker',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 1500,
      height: 1500,
      dpi: 300,
      format: ['png'],
    },
    pricing: {
      baseCost: 1.50,
      recommendedPrice: 4.99,
      premiumPrice: 6.99,
      marginPercent: 70,
    },
    platforms: {
      printify: { blueprintId: 541, providerId: 99 },
      printful: { productId: 358 },
    },
    defaultTags: ['sticker', 'vinyl sticker', 'laptop sticker', 'water bottle sticker', 'decal'],
    targetAudience: ['teens', 'young adults'],
    bestNiches: ['pets', 'hobbies', 'quotes', 'cute', 'activism'],
    avgProductionDays: 2,
    shippingWeight: '1oz',
    fragile: false,
  },

  'pod_hat': {
    id: 'pod_hat',
    name: 'Dad Hat / Baseball Cap',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 2400,
      height: 2400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 12.00,
      recommendedPrice: 29.99,
      premiumPrice: 34.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 505, providerId: 99 },
    },
    defaultTags: ['hat', 'cap', 'baseball cap', 'dad hat', 'embroidered', 'unisex'],
    targetAudience: ['adults', 'sports fans'],
    bestNiches: ['dad', 'sports', 'patriotic', 'humor', 'occupation'],
    avgProductionDays: 5,
    shippingWeight: '4oz',
    fragile: false,
  },

  'pod_socks': {
    id: 'pod_socks',
    name: 'Crew Socks',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 3000,
      height: 2400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 8.00,
      recommendedPrice: 19.99,
      premiumPrice: 24.99,
      marginPercent: 55,
    },
    platforms: {
      printify: { blueprintId: 623, providerId: 99 },
    },
    defaultTags: ['socks', 'crew socks', 'novelty socks', 'fun socks', 'gift', 'stocking stuffer'],
    targetAudience: ['adults', 'gift-givers'],
    bestNiches: ['pets', 'holiday', 'humor', 'patterns', 'stocking stuffer'],
    seasonalPeak: [11, 12],
    avgProductionDays: 5,
    shippingWeight: '4oz',
    fragile: false,
  },

  'pod_backpack': {
    id: 'pod_backpack',
    name: 'Backpack',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 4500,
      height: 5400,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 28.00,
      recommendedPrice: 59.99,
      premiumPrice: 74.99,
      marginPercent: 50,
    },
    platforms: {
      printify: { blueprintId: 550, providerId: 99 },
    },
    defaultTags: ['backpack', 'school bag', 'travel', 'laptop bag', 'rucksack'],
    targetAudience: ['students', 'travelers'],
    bestNiches: ['back to school', 'patterns', 'gaming', 'travel'],
    seasonalPeak: [7, 8, 9],
    avgProductionDays: 6,
    shippingWeight: '1.5lb',
    fragile: false,
  },

  'pod_phone_case': {
    id: 'pod_phone_case',
    name: 'Phone Case',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 1800,
      height: 3600,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 8.00,
      recommendedPrice: 24.99,
      premiumPrice: 29.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 289, providerId: 99 },
    },
    defaultTags: ['phone case', 'iphone case', 'samsung case', 'protective', 'slim'],
    targetAudience: ['smartphone users'],
    bestNiches: ['patterns', 'quotes', 'pets', 'minimalist', 'aesthetic'],
    avgProductionDays: 4,
    shippingWeight: '2oz',
    fragile: true,
  },

  'pod_jewelry': {
    id: 'pod_jewelry',
    name: 'Pendant Necklace',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 1200,
      height: 1200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 12.00,
      recommendedPrice: 34.99,
      premiumPrice: 44.99,
      marginPercent: 60,
    },
    platforms: {
      printify: { blueprintId: 652, providerId: 99 },
    },
    defaultTags: ['necklace', 'pendant', 'jewelry', 'gift', 'personalized', 'keepsake'],
    targetAudience: ['women', 'gift-givers'],
    bestNiches: ['memorial', 'mom', 'grandmother', 'faith', 'zodiac'],
    avgProductionDays: 5,
    shippingWeight: '2oz',
    fragile: true,
  },

  'pod_keychain': {
    id: 'pod_keychain',
    name: 'Keychain',
    category: 'pod',
    subcategory: 'accessories',
    designSpecs: {
      width: 1200,
      height: 1200,
      dpi: 300,
      format: ['png', 'jpg'],
    },
    pricing: {
      baseCost: 4.00,
      recommendedPrice: 12.99,
      premiumPrice: 15.99,
      marginPercent: 65,
    },
    platforms: {
      printify: { blueprintId: 619, providerId: 99 },
    },
    defaultTags: ['keychain', 'key ring', 'gift', 'stocking stuffer', 'personalized'],
    targetAudience: ['all ages', 'gift-givers'],
    bestNiches: ['pets', 'cute', 'humor', 'occupation', 'stocking stuffer'],
    avgProductionDays: 3,
    shippingWeight: '2oz',
    fragile: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // DIGITAL PRODUCTS (8 products)
  // ═══════════════════════════════════════════════════════════════
  'digital_printable': {
    id: 'digital_printable',
    name: 'Digital Wall Art Printable',
    category: 'digital',
    subcategory: 'printable',
    designSpecs: {
      width: 3000,
      height: 4000,
      dpi: 300,
      format: ['pdf', 'png', 'jpg'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 4.99,
      premiumPrice: 9.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
      amazon: { category: 'digital_printable' },
    },
    defaultTags: ['digital download', 'printable', 'wall art', 'instant download', 'home decor'],
    targetAudience: ['home decorators', 'DIY enthusiasts'],
    bestNiches: ['quotes', 'minimalist', 'nursery', 'affirmations', 'astrology'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_planner': {
    id: 'digital_planner',
    name: 'Digital Planner',
    category: 'digital',
    subcategory: 'planner',
    designSpecs: {
      width: 2048,
      height: 2732,
      dpi: 300,
      format: ['pdf'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 9.99,
      premiumPrice: 19.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
    },
    defaultTags: ['digital planner', 'goodnotes', 'notability', 'ipad planner', 'hyperlinked'],
    targetAudience: ['tablet users', 'planners'],
    bestNiches: ['productivity', 'fitness', 'budget', 'meal planning', 'student'],
    seasonalPeak: [1, 8, 9],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_invitation': {
    id: 'digital_invitation',
    name: 'Digital Invitation Template',
    category: 'digital',
    subcategory: 'template',
    designSpecs: {
      width: 2100,
      height: 2700,
      dpi: 300,
      format: ['pdf', 'png'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 7.99,
      premiumPrice: 14.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
    },
    defaultTags: ['invitation', 'digital invite', 'editable', 'canva template', 'party'],
    targetAudience: ['event planners', 'parents'],
    bestNiches: ['wedding', 'baby shower', 'birthday', 'graduation', 'holiday'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_social_template': {
    id: 'digital_social_template',
    name: 'Social Media Template Pack',
    category: 'digital',
    subcategory: 'template',
    designSpecs: {
      width: 1080,
      height: 1080,
      dpi: 72,
      format: ['png', 'psd', 'canva'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 12.99,
      premiumPrice: 24.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
    },
    defaultTags: ['instagram template', 'social media', 'canva', 'content creator', 'influencer'],
    targetAudience: ['small businesses', 'influencers', 'content creators'],
    bestNiches: ['business', 'realtor', 'coach', 'fitness', 'beauty'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_coloring': {
    id: 'digital_coloring',
    name: 'Coloring Pages (Digital)',
    category: 'digital',
    subcategory: 'printable',
    designSpecs: {
      width: 2550,
      height: 3300,
      dpi: 300,
      format: ['pdf', 'png'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 4.99,
      premiumPrice: 9.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
      amazon: { category: 'kdp_interior' },
    },
    defaultTags: ['coloring pages', 'adult coloring', 'kids coloring', 'printable', 'digital download'],
    targetAudience: ['parents', 'adults seeking relaxation'],
    bestNiches: ['mandala', 'animals', 'fantasy', 'kids', 'holiday'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_checklist': {
    id: 'digital_checklist',
    name: 'Printable Checklist/Tracker',
    category: 'digital',
    subcategory: 'printable',
    designSpecs: {
      width: 2550,
      height: 3300,
      dpi: 300,
      format: ['pdf'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 3.99,
      premiumPrice: 6.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
    },
    defaultTags: ['checklist', 'tracker', 'printable', 'planner insert', 'organization'],
    targetAudience: ['organizers', 'productivity enthusiasts'],
    bestNiches: ['cleaning', 'travel', 'moving', 'wedding', 'baby'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_resume': {
    id: 'digital_resume',
    name: 'Resume/CV Template',
    category: 'digital',
    subcategory: 'template',
    designSpecs: {
      width: 2550,
      height: 3300,
      dpi: 300,
      format: ['docx', 'pdf'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 9.99,
      premiumPrice: 19.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
    },
    defaultTags: ['resume', 'cv', 'template', 'job search', 'professional', 'editable'],
    targetAudience: ['job seekers', 'professionals'],
    bestNiches: ['professional', 'creative', 'minimal', 'modern', 'executive'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },

  'digital_ebook': {
    id: 'digital_ebook',
    name: 'eBook / Guide',
    category: 'digital',
    subcategory: 'ebook',
    designSpecs: {
      width: 1600,
      height: 2400,
      dpi: 150,
      format: ['pdf', 'epub'],
    },
    pricing: {
      baseCost: 0,
      recommendedPrice: 14.99,
      premiumPrice: 29.99,
      marginPercent: 95,
    },
    platforms: {
      gumroad: { type: 'digital' },
      amazon: { category: 'kdp_ebook' },
    },
    defaultTags: ['ebook', 'guide', 'digital book', 'how to', 'tutorial'],
    targetAudience: ['learners', 'professionals'],
    bestNiches: ['how-to', 'recipes', 'fitness', 'business', 'crafts'],
    avgProductionDays: 0,
    shippingWeight: '0',
    fragile: false,
  },
};

export default EXTENDED_PRODUCT_TYPES;
