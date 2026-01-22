/**
 * TeePublic Platform Connector
 * 
 * NOTE: TeePublic has limited API. Uses browser automation for uploads.
 * Similar to Redbubble but with different product catalog and pricing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TeePublicCredentials {
  email: string;
  password: string;
}

export interface TeePublicDesign {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  primaryColor: string; // Hex color for product preview
  secondaryColor?: string;
}

export type TeePublicProductType = 
  | 't-shirt' | 'hoodie' | 'tank-top' | 'long-sleeve' | 'pullover'
  | 'mug' | 'notebook' | 'sticker' | 'phone-case' | 'tote-bag'
  | 'poster' | 'tapestry' | 'throw-pillow' | 'throw-blanket'
  | 'pin' | 'magnet' | 'mask';

// TeePublic royalty structure (they set prices, you get fixed royalty)
const TEEPUBLIC_ROYALTIES: Record<TeePublicProductType, { salePrice: number; royalty: number }> = {
  't-shirt': { salePrice: 20.00, royalty: 4.00 },
  'hoodie': { salePrice: 39.00, royalty: 6.00 },
  'tank-top': { salePrice: 20.00, royalty: 3.00 },
  'long-sleeve': { salePrice: 25.00, royalty: 4.00 },
  'pullover': { salePrice: 44.00, royalty: 6.00 },
  'mug': { salePrice: 14.00, royalty: 2.50 },
  'notebook': { salePrice: 14.00, royalty: 2.00 },
  'sticker': { salePrice: 2.50, royalty: 0.50 },
  'phone-case': { salePrice: 19.00, royalty: 3.00 },
  'tote-bag': { salePrice: 16.00, royalty: 3.00 },
  'poster': { salePrice: 13.00, royalty: 2.00 },
  'tapestry': { salePrice: 29.00, royalty: 4.00 },
  'throw-pillow': { salePrice: 24.00, royalty: 3.00 },
  'throw-blanket': { salePrice: 44.00, royalty: 5.00 },
  'pin': { salePrice: 9.00, royalty: 1.50 },
  'magnet': { salePrice: 7.00, royalty: 1.00 },
  'mask': { salePrice: 12.00, royalty: 2.00 },
};

export class TeePublicConnector {
  private supabase: SupabaseClient;
  private credentials: TeePublicCredentials;
  
  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    credentials: TeePublicCredentials;
  }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.credentials = config.credentials;
  }
  
  /**
   * Get royalty info for product types
   */
  getRoyaltyInfo(productType: TeePublicProductType): { salePrice: number; royalty: number } {
    return TEEPUBLIC_ROYALTIES[productType];
  }
  
  /**
   * Calculate potential earnings for a design
   */
  calculatePotentialEarnings(
    estimatedMonthlySales: Record<TeePublicProductType, number>
  ): { totalRevenue: number; totalRoyalty: number; breakdown: Record<string, number> } {
    let totalRevenue = 0;
    let totalRoyalty = 0;
    const breakdown: Record<string, number> = {};
    
    for (const [product, sales] of Object.entries(estimatedMonthlySales)) {
      const info = TEEPUBLIC_ROYALTIES[product as TeePublicProductType];
      if (info) {
        const revenue = info.salePrice * sales;
        const royalty = info.royalty * sales;
        totalRevenue += revenue;
        totalRoyalty += royalty;
        breakdown[product] = royalty;
      }
    }
    
    return { totalRevenue, totalRoyalty, breakdown };
  }
  
  /**
   * Get design upload specifications
   */
  getDesignSpecs(): {
    minWidth: number;
    minHeight: number;
    maxFileSize: string;
    formats: string[];
    colorMode: string;
  } {
    return {
      minWidth: 2400,
      minHeight: 2400,
      maxFileSize: '25MB',
      formats: ['PNG'],
      colorMode: 'sRGB',
    };
  }
  
  /**
   * Validate design before upload
   */
  validateDesign(design: TeePublicDesign): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (design.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (design.title.length > 50) {
      errors.push('Title must be 50 characters or less');
    }
    if (design.tags.length < 5) {
      errors.push('At least 5 tags required');
    }
    if (design.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Get recommended products based on design style
   */
  static getRecommendedProducts(designStyle: 'text' | 'illustration' | 'photo' | 'pattern'): TeePublicProductType[] {
    const recommendations: Record<string, TeePublicProductType[]> = {
      'text': ['t-shirt', 'mug', 'sticker', 'notebook', 'tote-bag'],
      'illustration': ['t-shirt', 'hoodie', 'poster', 'sticker', 'phone-case', 'throw-pillow'],
      'photo': ['poster', 'tapestry', 'throw-blanket', 'phone-case'],
      'pattern': ['throw-pillow', 'throw-blanket', 'tapestry', 'tote-bag', 'phone-case'],
    };
    
    return recommendations[designStyle] || recommendations['illustration'];
  }
}


/**
 * Society6 Platform Connector
 * 
 * NOTE: Society6 has no public API. Uses browser automation.
 * Higher-end marketplace focused on artists and home decor.
 */

export interface Society6Credentials {
  email: string;
  password: string;
  artistName: string;
}

export interface Society6Artwork {
  title: string;
  description: string;
  tags: string[];
  category: Society6Category;
  imageUrl: string;
  products: Society6ProductType[];
  pricingTier: 'standard' | 'premium';
}

export type Society6Category = 
  | 'abstract' | 'animals' | 'architecture' | 'botanical' | 'fashion'
  | 'geometric' | 'illustration' | 'landscape' | 'minimalism' | 'nature'
  | 'pattern' | 'photography' | 'pop-art' | 'portrait' | 'typography';

export type Society6ProductType =
  | 'art-print' | 'canvas-print' | 'framed-print' | 'metal-print'
  | 'poster' | 'acrylic-block' | 'wood-wall-art'
  | 't-shirt' | 'tank-top' | 'hoodie' | 'all-over-print'
  | 'throw-pillow' | 'floor-pillow' | 'throw-blanket' | 'duvet-cover'
  | 'shower-curtain' | 'bath-mat' | 'rug'
  | 'mug' | 'travel-mug' | 'water-bottle' | 'coaster'
  | 'tote-bag' | 'weekender-bag' | 'backpack' | 'zipper-pouch'
  | 'phone-case' | 'laptop-sleeve' | 'tablet-case'
  | 'notebook' | 'spiral-notebook' | 'hardcover-journal'
  | 'clock' | 'desk-mat' | 'sticker' | 'magnet'
  | 'comforter' | 'tapestry' | 'credenza' | 'side-table';

// Society6 base margins (artist sets markup on top)
const SOCIETY6_BASE_MARGINS: Record<string, number> = {
  'prints': 10,       // $10 base for wall art
  'apparel': 8,       // $8 base for clothing
  'home': 12,         // $12 base for home decor
  'accessories': 6,   // $6 base for bags, cases
  'stationery': 5,    // $5 base for notebooks
  'furniture': 25,    // $25 base for furniture items
};

const PRODUCT_CATEGORY_MAP: Record<Society6ProductType, keyof typeof SOCIETY6_BASE_MARGINS> = {
  'art-print': 'prints', 'canvas-print': 'prints', 'framed-print': 'prints',
  'metal-print': 'prints', 'poster': 'prints', 'acrylic-block': 'prints',
  'wood-wall-art': 'prints',
  't-shirt': 'apparel', 'tank-top': 'apparel', 'hoodie': 'apparel',
  'all-over-print': 'apparel',
  'throw-pillow': 'home', 'floor-pillow': 'home', 'throw-blanket': 'home',
  'duvet-cover': 'home', 'shower-curtain': 'home', 'bath-mat': 'home',
  'rug': 'home', 'comforter': 'home', 'tapestry': 'home',
  'mug': 'home', 'travel-mug': 'home', 'water-bottle': 'home', 'coaster': 'home',
  'tote-bag': 'accessories', 'weekender-bag': 'accessories', 'backpack': 'accessories',
  'zipper-pouch': 'accessories', 'phone-case': 'accessories', 'laptop-sleeve': 'accessories',
  'tablet-case': 'accessories',
  'notebook': 'stationery', 'spiral-notebook': 'stationery', 'hardcover-journal': 'stationery',
  'clock': 'home', 'desk-mat': 'accessories', 'sticker': 'accessories', 'magnet': 'accessories',
  'credenza': 'furniture', 'side-table': 'furniture',
};

export class Society6Connector {
  private supabase: SupabaseClient;
  private credentials: Society6Credentials;
  
  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    credentials: Society6Credentials;
  }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.credentials = config.credentials;
  }
  
  /**
   * Get base margin for a product type
   */
  getBaseMargin(productType: Society6ProductType): number {
    const category = PRODUCT_CATEGORY_MAP[productType];
    return SOCIETY6_BASE_MARGINS[category] || 10;
  }
  
  /**
   * Calculate artist earnings
   */
  calculateEarnings(
    productType: Society6ProductType,
    artistMarkup: number = 10
  ): { baseMargin: number; artistEarnings: number; totalMargin: number } {
    const baseMargin = this.getBaseMargin(productType);
    const artistEarnings = artistMarkup;
    const totalMargin = baseMargin + artistMarkup;
    
    return { baseMargin, artistEarnings, totalMargin };
  }
  
  /**
   * Get design upload specifications
   */
  getDesignSpecs(): {
    minWidth: number;
    minHeight: number;
    maxFileSize: string;
    formats: string[];
    colorMode: string;
    dpi: number;
  } {
    return {
      minWidth: 6500,
      minHeight: 6500,
      maxFileSize: '150MB',
      formats: ['PNG', 'JPG'],
      colorMode: 'sRGB',
      dpi: 300,
    };
  }
  
  /**
   * Get products recommended for a category
   */
  getProductsForCategory(category: Society6Category): Society6ProductType[] {
    const recommendations: Record<Society6Category, Society6ProductType[]> = {
      'abstract': ['art-print', 'canvas-print', 'throw-pillow', 'rug', 'duvet-cover', 'tapestry'],
      'animals': ['art-print', 'throw-pillow', 'throw-blanket', 'mug', 'tote-bag', 'phone-case'],
      'architecture': ['art-print', 'poster', 'canvas-print', 'framed-print'],
      'botanical': ['art-print', 'throw-pillow', 'shower-curtain', 'duvet-cover', 'notebook'],
      'fashion': ['tote-bag', 'phone-case', 't-shirt', 'zipper-pouch', 'backpack'],
      'geometric': ['throw-pillow', 'rug', 'throw-blanket', 'clock', 'art-print'],
      'illustration': ['art-print', 't-shirt', 'sticker', 'mug', 'tote-bag', 'notebook'],
      'landscape': ['art-print', 'canvas-print', 'framed-print', 'metal-print', 'tapestry'],
      'minimalism': ['art-print', 'poster', 'notebook', 'mug', 'clock'],
      'nature': ['art-print', 'throw-blanket', 'shower-curtain', 'bath-mat', 'tapestry'],
      'pattern': ['duvet-cover', 'throw-pillow', 'rug', 'shower-curtain', 'leggings'],
      'photography': ['art-print', 'canvas-print', 'framed-print', 'metal-print', 'poster'],
      'pop-art': ['art-print', 'poster', 't-shirt', 'mug', 'phone-case'],
      'portrait': ['art-print', 'canvas-print', 'framed-print', 'poster'],
      'typography': ['art-print', 'poster', 't-shirt', 'mug', 'notebook', 'tote-bag'],
    };
    
    return recommendations[category] || recommendations['illustration'];
  }
  
  /**
   * Validate artwork before upload
   */
  validateArtwork(artwork: Society6Artwork): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (artwork.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (artwork.title.length > 100) {
      errors.push('Title must be 100 characters or less');
    }
    if (artwork.tags.length < 5) {
      errors.push('At least 5 tags required');
    }
    if (artwork.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
    if (artwork.description.length < 20) {
      errors.push('Description should be at least 20 characters');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Get best-selling categories on Society6
   */
  static getBestSellingCategories(): Society6Category[] {
    return [
      'botanical',
      'abstract',
      'minimalism',
      'illustration',
      'pattern',
      'typography',
    ];
  }
}

export { TeePublicConnector, Society6Connector };
