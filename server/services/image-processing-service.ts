/**
 * Image Processing Service for POD Platforms
 * Handles image resizing, formatting, optimization, and validation
 */

export type PlatformType = 'printify' | 'printful' | 'etsy' | 'shopify' | 'amazon' | 'redbubble' | 'teespring';

export interface ImageRequirements {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatio?: number;
  maxFileSizeKB: number;
  supportedFormats: string[];
  dpi: number;
  colorMode: 'RGB' | 'CMYK';
}

export interface PrintArea {
  width: number;
  height: number;
  x: number;
  y: number;
  unit: 'px' | 'in' | 'cm';
  dpi?: number;
}

export interface ProcessingOptions {
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  resize?: {
    width: number;
    height: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  optimize?: boolean;
  compression?: number;
}

export interface ImageValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    dpi?: number;
  };
}

export interface DesignPlacement {
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  scale?: number;
}

// Platform-specific image requirements
const PLATFORM_REQUIREMENTS: Record<PlatformType, ImageRequirements> = {
  printify: {
    minWidth: 2400,
    minHeight: 2400,
    maxWidth: 10000,
    maxHeight: 10000,
    maxFileSizeKB: 10240, // 10MB
    supportedFormats: ['png', 'jpg', 'jpeg'],
    dpi: 300,
    colorMode: 'RGB',
  },
  printful: {
    minWidth: 1800,
    minHeight: 2400,
    maxWidth: 12000,
    maxHeight: 12000,
    maxFileSizeKB: 20480, // 20MB
    supportedFormats: ['png', 'jpg', 'jpeg', 'pdf'],
    dpi: 300,
    colorMode: 'RGB',
  },
  etsy: {
    minWidth: 2000,
    minHeight: 2000,
    maxWidth: 8000,
    maxHeight: 8000,
    maxFileSizeKB: 10240, // 10MB
    supportedFormats: ['png', 'jpg', 'jpeg', 'gif'],
    dpi: 300,
    colorMode: 'RGB',
  },
  shopify: {
    minWidth: 2048,
    minHeight: 2048,
    maxWidth: 5760,
    maxHeight: 5760,
    maxFileSizeKB: 20480, // 20MB
    supportedFormats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    dpi: 72,
    colorMode: 'RGB',
  },
  amazon: {
    minWidth: 2560,
    minHeight: 2560,
    maxWidth: 10000,
    maxHeight: 10000,
    maxFileSizeKB: 10240, // 10MB
    supportedFormats: ['png', 'jpg', 'jpeg'],
    dpi: 300,
    colorMode: 'RGB',
  },
  redbubble: {
    minWidth: 2400,
    minHeight: 2400,
    maxWidth: 7632,
    maxHeight: 6480,
    maxFileSizeKB: 51200, // 50MB
    supportedFormats: ['png', 'jpg', 'jpeg'],
    dpi: 300,
    colorMode: 'RGB',
  },
  teespring: {
    minWidth: 2400,
    minHeight: 3200,
    maxWidth: 4800,
    maxHeight: 6400,
    maxFileSizeKB: 25600, // 25MB
    supportedFormats: ['png', 'jpg', 'jpeg'],
    dpi: 300,
    colorMode: 'RGB',
  },
};

export class ImageProcessingService {
  /**
   * Get platform-specific image requirements
   */
  getPlatformRequirements(platform: PlatformType): ImageRequirements {
    return PLATFORM_REQUIREMENTS[platform];
  }

  /**
   * Validate image against platform requirements
   * Note: Actual image metadata extraction would require a library like 'sharp'
   */
  async validateImage(
    imageUrl: string,
    platform: PlatformType,
    metadata?: { width: number; height: number; format: string; size: number }
  ): Promise<ImageValidation> {
    const requirements = this.getPlatformRequirements(platform);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!metadata) {
      errors.push('Image metadata is required for validation');
      return { isValid: false, errors, warnings };
    }

    // Validate dimensions
    if (metadata.width < requirements.minWidth || metadata.height < requirements.minHeight) {
      errors.push(
        `Image dimensions too small. Minimum: ${requirements.minWidth}x${requirements.minHeight}px, ` +
        `Actual: ${metadata.width}x${metadata.height}px`
      );
    }

    if (metadata.width > requirements.maxWidth || metadata.height > requirements.maxHeight) {
      errors.push(
        `Image dimensions too large. Maximum: ${requirements.maxWidth}x${requirements.maxHeight}px, ` +
        `Actual: ${metadata.width}x${metadata.height}px`
      );
    }

    // Validate file size
    const fileSizeKB = metadata.size / 1024;
    if (fileSizeKB > requirements.maxFileSizeKB) {
      errors.push(
        `File size too large. Maximum: ${requirements.maxFileSizeKB}KB, Actual: ${Math.round(fileSizeKB)}KB`
      );
    }

    // Validate format
    const format = metadata.format.toLowerCase().replace('.', '');
    if (!requirements.supportedFormats.includes(format)) {
      errors.push(
        `Unsupported format: ${format}. Supported formats: ${requirements.supportedFormats.join(', ')}`
      );
    }

    // Warnings for optimal specs
    if (metadata.width < requirements.minWidth * 1.2 || metadata.height < requirements.minHeight * 1.2) {
      warnings.push('Image resolution is at minimum. Higher resolution recommended for best quality.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validate print area dimensions
   */
  validatePrintArea(printArea: PrintArea, platform: PlatformType): ImageValidation {
    const requirements = this.getPlatformRequirements(platform);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Convert to pixels if needed
    let widthPx = printArea.width;
    let heightPx = printArea.height;

    if (printArea.unit === 'in') {
      const dpi = printArea.dpi || requirements.dpi;
      widthPx = printArea.width * dpi;
      heightPx = printArea.height * dpi;
    } else if (printArea.unit === 'cm') {
      const dpi = printArea.dpi || requirements.dpi;
      widthPx = (printArea.width / 2.54) * dpi;
      heightPx = (printArea.height / 2.54) * dpi;
    }

    if (widthPx < requirements.minWidth || heightPx < requirements.minHeight) {
      errors.push(
        `Print area too small for ${platform}. Minimum: ${requirements.minWidth}x${requirements.minHeight}px at ${requirements.dpi}DPI`
      );
    }

    if (widthPx > requirements.maxWidth || heightPx > requirements.maxHeight) {
      warnings.push(
        `Print area exceeds maximum recommended size for ${platform}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width: Math.round(widthPx),
        height: Math.round(heightPx),
        format: 'print-area',
        size: 0,
      },
    };
  }

  /**
   * Verify design placement within print area
   */
  verifyDesignPlacement(
    designWidth: number,
    designHeight: number,
    printArea: PrintArea,
    placement: DesignPlacement
  ): ImageValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    const scale = placement.scale || 1.0;
    const scaledWidth = designWidth * scale;
    const scaledHeight = designHeight * scale;

    // Check if design fits within print area
    if (scaledWidth > printArea.width) {
      errors.push(
        `Design width (${Math.round(scaledWidth)}${printArea.unit}) exceeds print area width (${printArea.width}${printArea.unit})`
      );
    }

    if (scaledHeight > printArea.height) {
      errors.push(
        `Design height (${Math.round(scaledHeight)}${printArea.unit}) exceeds print area height (${printArea.height}${printArea.unit})`
      );
    }

    // Check positioning with offsets
    if (placement.position === 'custom') {
      const offsetX = placement.offsetX || 0;
      const offsetY = placement.offsetY || 0;

      if (offsetX + scaledWidth > printArea.width) {
        errors.push('Design exceeds print area bounds (horizontal)');
      }

      if (offsetY + scaledHeight > printArea.height) {
        errors.push('Design exceeds print area bounds (vertical)');
      }

      if (offsetX < 0 || offsetY < 0) {
        errors.push('Design offset cannot be negative');
      }
    }

    // Warning for very small designs
    const areaRatio = (scaledWidth * scaledHeight) / (printArea.width * printArea.height);
    if (areaRatio < 0.1) {
      warnings.push('Design uses less than 10% of available print area. Consider scaling up.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width: Math.round(scaledWidth),
        height: Math.round(scaledHeight),
        format: 'placement',
        size: 0,
      },
    };
  }

  /**
   * Generate processing options for a specific platform
   */
  generateProcessingOptions(platform: PlatformType): ProcessingOptions {
    const requirements = this.getPlatformRequirements(platform);

    return {
      format: requirements.supportedFormats.includes('png') ? 'png' : 'jpeg',
      quality: 95,
      resize: {
        width: requirements.minWidth,
        height: requirements.minHeight,
        fit: 'inside',
      },
      optimize: true,
      compression: 85,
    };
  }

  /**
   * Process image for specific platform
   * Note: This is a placeholder. Actual implementation would require 'sharp' library
   */
  async processImage(
    inputUrl: string,
    platform: PlatformType,
    options?: Partial<ProcessingOptions>
  ): Promise<{
    success: boolean;
    outputUrl?: string;
    error?: string;
    metadata?: {
      originalSize: number;
      processedSize: number;
      compression: number;
    };
  }> {
    try {
      const defaultOptions = this.generateProcessingOptions(platform);
      const finalOptions = { ...defaultOptions, ...options };

      // NOTE: Actual image processing would happen here using 'sharp' or similar library
      // Example with sharp (not installed):
      // const sharp = require('sharp');
      // const processed = await sharp(inputBuffer)
      //   .resize(finalOptions.resize?.width, finalOptions.resize?.height, { fit: finalOptions.resize?.fit })
      //   .toFormat(finalOptions.format || 'png', { quality: finalOptions.quality })
      //   .toBuffer();

      console.log(`[ImageProcessing] Processing image for ${platform}:`, finalOptions);

      // For now, return success with the original URL
      // In production, this would upload the processed image and return the new URL
      return {
        success: true,
        outputUrl: inputUrl, // Would be the new processed image URL
        metadata: {
          originalSize: 0,
          processedSize: 0,
          compression: finalOptions.compression || 0,
        },
      };
    } catch (error) {
      console.error('[ImageProcessing] Error processing image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Optimize image for web delivery
   */
  async optimizeForWeb(
    inputUrl: string,
    maxWidth: number = 1200
  ): Promise<{ success: boolean; outputUrl?: string; error?: string }> {
    try {
      // NOTE: Actual optimization would use 'sharp' or similar
      console.log(`[ImageProcessing] Optimizing image for web: ${inputUrl}, max width: ${maxWidth}px`);

      return {
        success: true,
        outputUrl: inputUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate image mockup with design placement
   */
  async generateMockup(
    baseImageUrl: string,
    designUrl: string,
    printArea: PrintArea,
    placement: DesignPlacement
  ): Promise<{ success: boolean; mockupUrl?: string; error?: string }> {
    try {
      // Validate placement first
      const validation = this.verifyDesignPlacement(
        printArea.width,
        printArea.height,
        printArea,
        placement
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // NOTE: Actual mockup generation would composite the images
      console.log(`[ImageProcessing] Generating mockup with design at ${placement.position}`);

      return {
        success: true,
        mockupUrl: baseImageUrl, // Would be the composited mockup URL
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch validate images for multiple platforms
   */
  async batchValidate(
    imageUrl: string,
    platforms: PlatformType[],
    metadata: { width: number; height: number; format: string; size: number }
  ): Promise<Record<PlatformType, ImageValidation>> {
    const results: Partial<Record<PlatformType, ImageValidation>> = {};

    for (const platform of platforms) {
      results[platform] = await this.validateImage(imageUrl, platform, metadata);
    }

    return results as Record<PlatformType, ImageValidation>;
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      supportedPlatforms: Object.keys(PLATFORM_REQUIREMENTS),
      platformCount: Object.keys(PLATFORM_REQUIREMENTS).length,
    };
  }
}

// Singleton instance
export const imageProcessingService = new ImageProcessingService();
