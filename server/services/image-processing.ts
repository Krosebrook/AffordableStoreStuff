/**
 * Image Processing Service for Multi-Platform Publishing
 * Handles image resizing, formatting, validation, and optimization for POD platforms
 * This service complements image-processing-service.ts with publishing-specific functionality
 */

import {
  imageProcessingService,
  type PlatformType,
  type PrintArea,
  type DesignPlacement,
  type ImageValidation,
  type ProcessingOptions,
} from "./image-processing-service";

export interface ImageFormat {
  format: "png" | "jpg" | "jpeg" | "svg" | "webp";
  quality?: number;
  compression?: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  background?: string;
}

export interface ProcessedImage {
  url: string;
  format: string;
  width: number;
  height: number;
  size: number;
  checksum?: string;
}

export interface BatchProcessResult {
  platform: string;
  success: boolean;
  processedImage?: ProcessedImage;
  error?: string;
  validation?: ImageValidation;
}

export interface DesignPlacementCalc {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

export class ImageProcessingService {
  /**
   * Resize image for specific platform requirements
   */
  async resizeForPlatform(
    imageUrl: string,
    platform: PlatformType,
    options?: Partial<ResizeOptions>
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const requirements = imageProcessingService.getPlatformRequirements(platform);

      const resizeOptions: ResizeOptions = {
        width: options?.width || requirements.minWidth,
        height: options?.height || requirements.minHeight,
        maintainAspectRatio: options?.maintainAspectRatio ?? true,
        fit: options?.fit || "inside",
        background: options?.background || "transparent",
      };

      console.log(
        `[ImageProcessing] Resizing image for ${platform}: ${resizeOptions.width}x${resizeOptions.height}`
      );

      // Use the existing service's processImage method
      const result = await imageProcessingService.processImage(imageUrl, platform, {
        resize: {
          width: resizeOptions.width!,
          height: resizeOptions.height!,
          fit: resizeOptions.fit,
        },
      });

      return {
        success: result.success,
        url: result.outputUrl,
        error: result.error,
      };
    } catch (error) {
      console.error("[ImageProcessing] Resize error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Convert image to specific format
   */
  async convertFormat(
    imageUrl: string,
    targetFormat: ImageFormat
  ): Promise<{ success: boolean; url?: string; error?: string; metadata?: any }> {
    try {
      console.log(`[ImageProcessing] Converting image to ${targetFormat.format}`);

      // For SVG, we can't convert using typical image processing
      if (targetFormat.format === "svg") {
        return {
          success: false,
          error: "SVG conversion requires specialized tools",
        };
      }

      // NOTE: Actual conversion would use sharp or similar library
      // For now, return the original URL as placeholder
      return {
        success: true,
        url: imageUrl,
        metadata: {
          format: targetFormat.format,
          quality: targetFormat.quality || 95,
          compression: targetFormat.compression || 85,
        },
      };
    } catch (error) {
      console.error("[ImageProcessing] Format conversion error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate print area for POD product
   */
  validatePrintArea(
    printArea: PrintArea,
    platform: PlatformType
  ): ImageValidation {
    return imageProcessingService.validatePrintArea(printArea, platform);
  }

  /**
   * Calculate design placement within print area
   */
  calculatePlacement(
    designWidth: number,
    designHeight: number,
    printArea: PrintArea,
    placement: DesignPlacement
  ): DesignPlacementCalc {
    const scale = placement.scale || 1.0;
    const rotation = placement.rotation || 0;

    let x = 0;
    let y = 0;

    // Calculate position based on placement type
    switch (placement.position) {
      case "center":
        x = (printArea.width - designWidth * scale) / 2;
        y = (printArea.height - designHeight * scale) / 2;
        break;

      case "top-left":
        x = 0;
        y = 0;
        break;

      case "top-right":
        x = printArea.width - designWidth * scale;
        y = 0;
        break;

      case "bottom-left":
        x = 0;
        y = printArea.height - designHeight * scale;
        break;

      case "bottom-right":
        x = printArea.width - designWidth * scale;
        y = printArea.height - designHeight * scale;
        break;

      case "custom":
        x = placement.offsetX || 0;
        y = placement.offsetY || 0;
        break;
    }

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(designWidth * scale),
      height: Math.round(designHeight * scale),
      scale,
      rotation,
    };
  }

  /**
   * Verify design fits within print area
   */
  verifyDesignFit(
    designWidth: number,
    designHeight: number,
    printArea: PrintArea,
    placement: DesignPlacement
  ): ImageValidation {
    return imageProcessingService.verifyDesignPlacement(
      designWidth,
      designHeight,
      printArea,
      placement
    );
  }

  /**
   * Process image for multiple platforms in batch
   */
  async batchProcess(
    imageUrl: string,
    platforms: PlatformType[],
    imageMetadata: { width: number; height: number; format: string; size: number }
  ): Promise<BatchProcessResult[]> {
    const results: BatchProcessResult[] = [];

    for (const platform of platforms) {
      try {
        // Validate image for platform
        const validation = await imageProcessingService.validateImage(
          imageUrl,
          platform,
          imageMetadata
        );

        let processedUrl = imageUrl;
        let processSuccess = true;
        let processError: string | undefined;

        // If validation passes, process the image
        if (validation.isValid) {
          const processResult = await imageProcessingService.processImage(
            imageUrl,
            platform
          );
          processSuccess = processResult.success;
          processedUrl = processResult.outputUrl || imageUrl;
          processError = processResult.error;
        } else {
          processSuccess = false;
          processError = validation.errors.join(", ");
        }

        results.push({
          platform,
          success: processSuccess,
          processedImage: processSuccess
            ? {
                url: processedUrl,
                format: imageMetadata.format,
                width: imageMetadata.width,
                height: imageMetadata.height,
                size: imageMetadata.size,
              }
            : undefined,
          error: processError,
          validation,
        });
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(
      `[ImageProcessing] Batch processed for ${platforms.length} platforms: ` +
        `${results.filter((r) => r.success).length} succeeded, ` +
        `${results.filter((r) => !r.success).length} failed`
    );

    return results;
  }

  /**
   * Optimize image for web delivery (thumbnails, previews)
   */
  async optimizeForWeb(
    imageUrl: string,
    maxWidth = 1200,
    quality = 85
  ): Promise<{ success: boolean; url?: string; error?: string; savings?: number }> {
    try {
      const result = await imageProcessingService.optimizeForWeb(imageUrl, maxWidth);

      // Calculate compression savings (if metadata available)
      const savings = result.success ? 0 : undefined; // Would calculate actual savings

      return {
        success: result.success,
        url: result.outputUrl,
        error: result.error,
        savings,
      };
    } catch (error) {
      console.error("[ImageProcessing] Web optimization error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate mockup with design placement
   */
  async generateMockup(
    baseImageUrl: string,
    designUrl: string,
    printArea: PrintArea,
    placement: DesignPlacement
  ): Promise<{ success: boolean; mockupUrl?: string; error?: string }> {
    try {
      return await imageProcessingService.generateMockup(
        baseImageUrl,
        designUrl,
        printArea,
        placement
      );
    } catch (error) {
      console.error("[ImageProcessing] Mockup generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Extract image metadata (would use sharp or similar in production)
   */
  async extractMetadata(
    imageUrl: string
  ): Promise<{
    success: boolean;
    metadata?: {
      width: number;
      height: number;
      format: string;
      size: number;
      dpi?: number;
      colorSpace?: string;
    };
    error?: string;
  }> {
    try {
      console.log(`[ImageProcessing] Extracting metadata from ${imageUrl}`);

      // NOTE: In production, this would use sharp or similar library to read actual metadata
      // For now, return placeholder data
      return {
        success: true,
        metadata: {
          width: 2400,
          height: 2400,
          format: "png",
          size: 1024000, // 1MB
          dpi: 300,
          colorSpace: "RGB",
        },
      };
    } catch (error) {
      console.error("[ImageProcessing] Metadata extraction error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate multiple formats support
   */
  validateFormats(
    currentFormat: string,
    supportedFormats: string[]
  ): { isSupported: boolean; needsConversion: boolean; recommendedFormat?: string } {
    const normalized = currentFormat.toLowerCase().replace(".", "");
    const isSupported = supportedFormats.some(
      (fmt) => fmt.toLowerCase() === normalized
    );

    if (isSupported) {
      return { isSupported: true, needsConversion: false };
    }

    // Recommend PNG as default if conversion needed
    const recommendedFormat = supportedFormats.includes("png")
      ? "png"
      : supportedFormats[0];

    return {
      isSupported: false,
      needsConversion: true,
      recommendedFormat,
    };
  }

  /**
   * Calculate optimal dimensions for platform
   */
  calculateOptimalDimensions(
    platform: PlatformType,
    aspectRatio?: number
  ): { width: number; height: number } {
    const requirements = imageProcessingService.getPlatformRequirements(platform);

    if (aspectRatio) {
      // Calculate dimensions maintaining aspect ratio
      const width = requirements.minWidth;
      const height = Math.round(width / aspectRatio);

      return {
        width: Math.min(width, requirements.maxWidth),
        height: Math.min(height, requirements.maxHeight),
      };
    }

    // Use minimum requirements as default
    return {
      width: requirements.minWidth,
      height: requirements.minHeight,
    };
  }

  /**
   * Get platform requirements
   */
  getPlatformRequirements(platform: PlatformType) {
    return imageProcessingService.getPlatformRequirements(platform);
  }

  /**
   * Check if image meets platform requirements
   */
  async meetsRequirements(
    imageUrl: string,
    platform: PlatformType,
    metadata?: { width: number; height: number; format: string; size: number }
  ): Promise<{ meets: boolean; issues: string[]; warnings: string[] }> {
    if (!metadata) {
      return {
        meets: false,
        issues: ["Metadata required for validation"],
        warnings: [],
      };
    }

    const validation = await imageProcessingService.validateImage(
      imageUrl,
      platform,
      metadata
    );

    return {
      meets: validation.isValid,
      issues: validation.errors,
      warnings: validation.warnings,
    };
  }

  /**
   * Prepare image for publishing (resize, format, optimize)
   */
  async prepareForPublishing(
    imageUrl: string,
    platform: PlatformType,
    metadata: { width: number; height: number; format: string; size: number }
  ): Promise<{
    success: boolean;
    processedUrl?: string;
    metadata?: any;
    error?: string;
  }> {
    try {
      // Validate first
      const validation = await this.meetsRequirements(imageUrl, platform, metadata);

      if (!validation.meets) {
        console.log(
          `[ImageProcessing] Image needs processing for ${platform}: ${validation.issues.join(", ")}`
        );
      }

      // Process image for platform
      const result = await imageProcessingService.processImage(imageUrl, platform);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        processedUrl: result.outputUrl,
        metadata: result.metadata,
      };
    } catch (error) {
      console.error("[ImageProcessing] Preparation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      ...imageProcessingService.getStats(),
      supportedFormats: ["png", "jpg", "jpeg", "svg", "webp"],
      maxFileSize: "20MB",
      dpiRecommended: 300,
    };
  }
}

// Singleton instance
export const imageProcessor = new ImageProcessingService();

// Re-export types and existing service for convenience
export {
  imageProcessingService,
  type PlatformType,
  type PrintArea,
  type DesignPlacement,
  type ImageValidation,
  type ProcessingOptions,
};
