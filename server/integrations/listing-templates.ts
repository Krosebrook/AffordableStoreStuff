/**
 * Listing Template System
 *
 * Provides reusable templates for marketplace listings with:
 * - Platform-specific formatting
 * - Variable substitution
 * - AI content generation integration
 * - Template versioning and management
 * - Brand voice consistency
 *
 * Supported platforms: Etsy, Amazon, Shopify, eBay, Instagram
 */

import { createLogger, recordMetric, trackError } from '../lib/observability';
import { aiService } from './ai-service';
import type { AIProvider } from './ai-service';

const logger = createLogger('ListingTemplates');

export interface ListingTemplate {
  id: string;
  name: string;
  platform: 'etsy' | 'amazon' | 'shopify' | 'ebay' | 'instagram' | 'universal';
  category?: string;
  version: number;

  // Template sections
  titleTemplate: string;
  descriptionTemplate: string;
  bulletPointsTemplate?: string[];
  tagTemplate?: string[];

  // SEO optimization
  seoTitleTemplate?: string;
  seoDescriptionTemplate?: string;
  keywordsTemplate?: string[];

  // Platform-specific
  platformSpecificFields?: Record<string, string>;

  // Variable placeholders
  variables: TemplateVariable[];

  // Constraints
  constraints: TemplateConstraints;

  // Metadata
  brandVoiceId?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'array' | 'boolean' | 'date';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface TemplateConstraints {
  titleMaxLength?: number;
  titleMinLength?: number;
  descriptionMaxLength?: number;
  descriptionMinLength?: number;
  maxTags?: number;
  maxBulletPoints?: number;
  tagMaxLength?: number;
  requiredFields?: string[];
}

export interface TemplateData {
  productName: string;
  productDescription?: string;
  price?: number;
  category?: string;
  materials?: string[];
  dimensions?: string;
  color?: string;
  size?: string;
  brand?: string;
  targetAudience?: string;
  benefits?: string[];
  features?: string[];
  useCases?: string[];
  careInstructions?: string;
  customFields?: Record<string, any>;
}

export interface GeneratedListing {
  title: string;
  description: string;
  bulletPoints?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  platformSpecificData?: Record<string, any>;
  metadata: {
    templateId: string;
    templateVersion: number;
    generatedAt: Date;
    aiGenerated: boolean;
    aiProvider?: string;
  };
}

class ListingTemplateService {
  private templates: Map<string, ListingTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Load default templates for common platforms
   */
  private loadDefaultTemplates(): void {
    // Etsy Handmade Template
    this.registerTemplate({
      id: 'etsy-handmade-default',
      name: 'Etsy Handmade Default',
      platform: 'etsy',
      category: 'handmade',
      version: 1,
      titleTemplate: '{{productName}} | {{primaryFeature}} | Handmade {{category}}',
      descriptionTemplate: `✨ {{productName}} ✨

{{productDescription}}

🎨 ABOUT THIS ITEM:
{{#each features}}
• {{this}}
{{/each}}

📏 DETAILS:
{{#if dimensions}}• Dimensions: {{dimensions}}{{/if}}
{{#if materials}}• Materials: {{materials}}{{/if}}
{{#if color}}• Color: {{color}}{{/if}}
{{#if size}}• Size: {{size}}{{/if}}

💝 PERFECT FOR:
{{#each useCases}}
• {{this}}
{{/each}}

{{#if careInstructions}}
🧼 CARE INSTRUCTIONS:
{{careInstructions}}
{{/if}}

✋ HANDMADE WITH LOVE
Each piece is carefully handcrafted with attention to detail and quality.

{{#if customization}}
🎁 CUSTOMIZATION AVAILABLE
{{customization}}
{{/if}}

Thank you for supporting handmade! ❤️`,
      bulletPointsTemplate: [],
      tagTemplate: [
        '{{category}}',
        'handmade',
        '{{material}}',
        '{{color}}',
        'unique',
        'artisan',
        'gift',
        '{{targetAudience}}',
      ],
      variables: [
        {
          name: 'productName',
          type: 'string',
          description: 'Product name',
          required: true,
        },
        {
          name: 'primaryFeature',
          type: 'string',
          description: 'Main feature or benefit',
          required: true,
        },
        {
          name: 'category',
          type: 'string',
          description: 'Product category',
          required: true,
        },
        {
          name: 'materials',
          type: 'array',
          description: 'Materials used',
          required: false,
        },
      ],
      constraints: {
        titleMaxLength: 140,
        titleMinLength: 20,
        descriptionMaxLength: 5000,
        descriptionMinLength: 100,
        maxTags: 13,
        tagMaxLength: 20,
      },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Amazon Handmade Template
    this.registerTemplate({
      id: 'amazon-handmade-default',
      name: 'Amazon Handmade Default',
      platform: 'amazon',
      category: 'handmade',
      version: 1,
      titleTemplate: '{{brand}} - {{productName}} - {{primaryFeature}}',
      descriptionTemplate: `{{productDescription}}

KEY FEATURES:
{{#each features}}
• {{this}}
{{/each}}

PRODUCT DETAILS:
{{#if materials}}Materials: {{materials}}{{/if}}
{{#if dimensions}}Dimensions: {{dimensions}}{{/if}}
{{#if color}}Color: {{color}}{{/if}}

ABOUT THE MAKER:
Each item is lovingly handcrafted by skilled artisans who take pride in their work.

{{#if careInstructions}}
CARE INSTRUCTIONS:
{{careInstructions}}
{{/if}}`,
      bulletPointsTemplate: [
        '{{primaryFeature}}',
        '{{secondaryFeature}}',
        'Handmade with high-quality {{material}}',
        'Perfect for {{useCase}}',
        '{{dimension}} - {{careNote}}',
      ],
      tagTemplate: [],
      variables: [
        {
          name: 'brand',
          type: 'string',
          description: 'Brand name',
          required: true,
        },
        {
          name: 'productName',
          type: 'string',
          description: 'Product name',
          required: true,
        },
      ],
      constraints: {
        titleMaxLength: 200,
        descriptionMaxLength: 2000,
        maxBulletPoints: 5,
      },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Amazon KDP (Book) Template
    this.registerTemplate({
      id: 'amazon-kdp-default',
      name: 'Amazon KDP Default',
      platform: 'amazon',
      category: 'book',
      version: 1,
      titleTemplate: '{{bookTitle}}: {{subtitle}}',
      descriptionTemplate: `{{bookDescription}}

ABOUT THIS BOOK:
{{#each features}}
• {{this}}
{{/each}}

WHAT READERS WILL DISCOVER:
{{#each benefits}}
• {{this}}
{{/each}}

PERFECT FOR:
{{#each targetAudience}}
• {{this}}
{{/each}}

{{#if authorBio}}
ABOUT THE AUTHOR:
{{authorBio}}
{{/if}}

Get your copy today and {{callToAction}}!`,
      bulletPointsTemplate: [
        '{{genre}} book with {{pageCount}} pages of engaging content',
        '{{primaryBenefit}}',
        '{{secondaryBenefit}}',
        'Perfect for {{targetReader}}',
        'Available in {{formats}}',
      ],
      tagTemplate: [],
      variables: [
        {
          name: 'bookTitle',
          type: 'string',
          description: 'Book title',
          required: true,
        },
        {
          name: 'author',
          type: 'string',
          description: 'Author name',
          required: true,
        },
      ],
      constraints: {
        titleMaxLength: 200,
        descriptionMaxLength: 4000,
        maxBulletPoints: 5,
      },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Universal Template (platform-agnostic)
    this.registerTemplate({
      id: 'universal-default',
      name: 'Universal Default',
      platform: 'universal',
      version: 1,
      titleTemplate: '{{productName}} - {{tagline}}',
      descriptionTemplate: `{{productDescription}}

FEATURES:
{{#each features}}
• {{this}}
{{/each}}

SPECIFICATIONS:
{{#if dimensions}}Size: {{dimensions}}{{/if}}
{{#if materials}}Materials: {{materials}}{{/if}}
{{#if color}}Color: {{color}}{{/if}}

{{#if benefits}}
BENEFITS:
{{#each benefits}}
• {{this}}
{{/each}}
{{/if}}`,
      variables: [
        {
          name: 'productName',
          type: 'string',
          description: 'Product name',
          required: true,
        },
      ],
      constraints: {},
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info('Default templates loaded', { count: this.templates.size });
  }

  /**
   * Register a new template
   */
  registerTemplate(template: ListingTemplate): void {
    this.templates.set(template.id, template);
    logger.info('Template registered', { id: template.id, platform: template.platform });
    recordMetric('template.registered', 1, { platform: template.platform });
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ListingTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get templates by platform
   */
  getTemplatesByPlatform(platform: string): ListingTemplate[] {
    return Array.from(this.templates.values()).filter(
      t => t.platform === platform || t.platform === 'universal'
    );
  }

  /**
   * Get default template for platform
   */
  getDefaultTemplate(platform: string, category?: string): ListingTemplate | null {
    const templates = Array.from(this.templates.values()).filter(
      t => t.platform === platform && t.isDefault
    );

    if (category) {
      const match = templates.find(t => t.category === category);
      if (match) return match;
    }

    return templates[0] || this.templates.get('universal-default') || null;
  }

  // ============================================================================
  // TEMPLATE RENDERING
  // ============================================================================

  /**
   * Render template with provided data
   */
  renderTemplate(templateId: string, data: TemplateData): GeneratedListing {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    logger.info('Rendering template', { templateId, platform: template.platform });

    try {
      // Validate required variables
      this.validateTemplateData(template, data);

      // Render each section
      const title = this.renderSection(template.titleTemplate, data, template.constraints.titleMaxLength);
      const description = this.renderSection(template.descriptionTemplate, data, template.constraints.descriptionMaxLength);

      let bulletPoints: string[] | undefined;
      if (template.bulletPointsTemplate && template.bulletPointsTemplate.length > 0) {
        bulletPoints = template.bulletPointsTemplate
          .map(bp => this.renderSection(bp, data))
          .filter(bp => bp.trim().length > 0)
          .slice(0, template.constraints.maxBulletPoints);
      }

      let tags: string[] | undefined;
      if (template.tagTemplate && template.tagTemplate.length > 0) {
        tags = template.tagTemplate
          .map(tag => this.renderSection(tag, data, template.constraints.tagMaxLength))
          .map(tag => tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim())
          .filter(tag => tag.length > 0)
          .slice(0, template.constraints.maxTags);
      }

      const listing: GeneratedListing = {
        title: this.enforceConstraint(title, template.constraints.titleMaxLength),
        description: this.enforceConstraint(description, template.constraints.descriptionMaxLength),
        bulletPoints,
        tags,
        metadata: {
          templateId: template.id,
          templateVersion: template.version,
          generatedAt: new Date(),
          aiGenerated: false,
        },
      };

      logger.info('Template rendered successfully', { templateId, titleLength: listing.title.length });
      recordMetric('template.rendered', 1, { templateId, platform: template.platform });

      return listing;
    } catch (error: any) {
      logger.error('Template rendering failed', error, { templateId });
      trackError(error, { operation: 'renderTemplate', templateId });
      throw error;
    }
  }

  /**
   * Render template with AI enhancement
   */
  async renderTemplateWithAI(
    templateId: string,
    data: TemplateData,
    options?: {
      aiProvider?: AIProvider;
      enhanceTitle?: boolean;
      enhanceDescription?: boolean;
      generateTags?: boolean;
      brandVoice?: string;
    }
  ): Promise<GeneratedListing> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    logger.info('Rendering template with AI', { templateId, aiProvider: options?.aiProvider });

    try {
      // First render the base template
      const baseListing = this.renderTemplate(templateId, data);

      // AI enhancement options
      const aiProvider = options?.aiProvider || 'openai';
      const enhancedListing = { ...baseListing };

      // Enhance title if requested
      if (options?.enhanceTitle) {
        enhancedListing.title = await this.enhanceTitleWithAI(
          baseListing.title,
          data,
          template,
          aiProvider,
          options.brandVoice
        );
      }

      // Enhance description if requested
      if (options?.enhanceDescription) {
        enhancedListing.description = await this.enhanceDescriptionWithAI(
          baseListing.description,
          data,
          template,
          aiProvider,
          options.brandVoice
        );
      }

      // Generate tags with AI if requested
      if (options?.generateTags) {
        enhancedListing.tags = await this.generateTagsWithAI(
          data,
          template,
          aiProvider
        );
      }

      enhancedListing.metadata.aiGenerated = true;
      enhancedListing.metadata.aiProvider = aiProvider;

      logger.info('Template rendered with AI successfully', { templateId });
      recordMetric('template.rendered_ai', 1, { templateId, aiProvider });

      return enhancedListing;
    } catch (error: any) {
      logger.error('AI-enhanced template rendering failed', error, { templateId });
      trackError(error, { operation: 'renderTemplateWithAI', templateId });

      // Fallback to non-AI rendering
      logger.warn('Falling back to non-AI template rendering');
      return this.renderTemplate(templateId, data);
    }
  }

  // ============================================================================
  // AI ENHANCEMENT
  // ============================================================================

  /**
   * Enhance title with AI
   */
  private async enhanceTitleWithAI(
    baseTitle: string,
    data: TemplateData,
    template: ListingTemplate,
    aiProvider: AIProvider,
    brandVoice?: string
  ): Promise<string> {
    const maxLength = template.constraints.titleMaxLength || 140;
    const platform = template.platform;

    const prompt = `Improve this ${platform} product title while keeping it under ${maxLength} characters.

Current title: ${baseTitle}

Product details:
${JSON.stringify(data, null, 2)}

${brandVoice ? `Brand voice: ${brandVoice}` : ''}

Guidelines:
- Front-load important keywords
- Make it compelling and searchable
- Stay under ${maxLength} characters
- Match the ${platform} platform style
${brandVoice ? `- Match the brand voice: ${brandVoice}` : ''}

Return only the improved title, no explanation.`;

    try {
      const result = await aiService.generateText({
        provider: aiProvider,
        prompt,
        model: aiProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
        maxTokens: 100,
        temperature: 0.7,
      });

      const enhancedTitle = result.text.trim().replace(/^["']|["']$/g, '');
      return this.enforceConstraint(enhancedTitle, maxLength);
    } catch (error: any) {
      logger.warn('AI title enhancement failed, using base title', { error: error.message });
      return baseTitle;
    }
  }

  /**
   * Enhance description with AI
   */
  private async enhanceDescriptionWithAI(
    baseDescription: string,
    data: TemplateData,
    template: ListingTemplate,
    aiProvider: AIProvider,
    brandVoice?: string
  ): Promise<string> {
    const maxLength = template.constraints.descriptionMaxLength || 5000;
    const platform = template.platform;

    const prompt = `Improve this ${platform} product description.

Current description:
${baseDescription}

Product details:
${JSON.stringify(data, null, 2)}

${brandVoice ? `Brand voice: ${brandVoice}` : ''}

Guidelines:
- Make it more engaging and persuasive
- Highlight benefits over features
- Use natural, conversational language
- Include relevant keywords naturally
- Stay under ${maxLength} characters
- Format for readability
${brandVoice ? `- Match the brand voice: ${brandVoice}` : ''}

Return only the improved description.`;

    try {
      const result = await aiService.generateText({
        provider: aiProvider,
        prompt,
        model: aiProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
        maxTokens: 1500,
        temperature: 0.7,
      });

      const enhancedDescription = result.text.trim();
      return this.enforceConstraint(enhancedDescription, maxLength);
    } catch (error: any) {
      logger.warn('AI description enhancement failed, using base description', { error: error.message });
      return baseDescription;
    }
  }

  /**
   * Generate tags with AI
   */
  private async generateTagsWithAI(
    data: TemplateData,
    template: ListingTemplate,
    aiProvider: AIProvider
  ): Promise<string[]> {
    const maxTags = template.constraints.maxTags || 13;
    const maxTagLength = template.constraints.tagMaxLength || 20;
    const platform = template.platform;

    const prompt = `Generate ${maxTags} optimized search tags for this ${platform} product.

Product details:
${JSON.stringify(data, null, 2)}

Guidelines:
- Maximum ${maxTags} tags
- Each tag maximum ${maxTagLength} characters
- Include long-tail keywords
- Mix broad and specific terms
- Focus on searchability
- Platform: ${platform}

Return as a JSON array of strings: ["tag1", "tag2", ...]`;

    try {
      const result = await aiService.generateText({
        provider: aiProvider,
        prompt,
        model: aiProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
        maxTokens: 300,
        temperature: 0.7,
      });

      const jsonMatch = result.text.match(/\[.*\]/s);
      if (jsonMatch) {
        const tags = JSON.parse(jsonMatch[0]) as string[];
        return tags
          .map(tag => tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim())
          .filter(tag => tag.length > 0 && tag.length <= maxTagLength)
          .slice(0, maxTags);
      }

      return [];
    } catch (error: any) {
      logger.warn('AI tag generation failed', { error: error.message });
      return [];
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Render a template section with variable substitution
   */
  private renderSection(
    templateString: string,
    data: TemplateData,
    maxLength?: number
  ): string {
    let rendered = templateString;

    // Simple variable substitution {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = (data as any)[varName] || (data.customFields as any)?.[varName];
      if (value === undefined || value === null) return '';

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      return String(value);
    });

    // Handle conditionals {{#if variable}}...{{/if}}
    rendered = rendered.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
      const value = (data as any)[varName] || (data.customFields as any)?.[varName];
      return value ? content : '';
    });

    // Handle loops {{#each array}}...{{/each}}
    rendered = rendered.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, varName, content) => {
      const array = (data as any)[varName] || (data.customFields as any)?.[varName];
      if (!Array.isArray(array) || array.length === 0) return '';

      return array.map(item => content.replace(/\{\{this\}\}/g, String(item))).join('\n');
    });

    // Clean up extra whitespace and newlines
    rendered = rendered
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return maxLength ? this.enforceConstraint(rendered, maxLength) : rendered;
  }

  /**
   * Validate template data against template requirements
   */
  private validateTemplateData(template: ListingTemplate, data: TemplateData): void {
    const errors: string[] = [];

    for (const variable of template.variables) {
      if (variable.required) {
        const value = (data as any)[variable.name];
        if (value === undefined || value === null || value === '') {
          errors.push(`Required variable missing: ${variable.name}`);
        }
      }

      // Type validation
      const value = (data as any)[variable.name];
      if (value !== undefined && value !== null) {
        if (variable.type === 'number' && typeof value !== 'number') {
          errors.push(`Variable ${variable.name} must be a number`);
        }
        if (variable.type === 'array' && !Array.isArray(value)) {
          errors.push(`Variable ${variable.name} must be an array`);
        }
      }

      // Validation rules
      if (variable.validation && value !== undefined && value !== null) {
        const { min, max, pattern, options } = variable.validation;

        if (min !== undefined && typeof value === 'number' && value < min) {
          errors.push(`Variable ${variable.name} must be at least ${min}`);
        }

        if (max !== undefined && typeof value === 'number' && value > max) {
          errors.push(`Variable ${variable.name} must be at most ${max}`);
        }

        if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
          errors.push(`Variable ${variable.name} does not match required pattern`);
        }

        if (options && !options.includes(String(value))) {
          errors.push(`Variable ${variable.name} must be one of: ${options.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Template validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Enforce length constraint on text
   */
  private enforceConstraint(text: string, maxLength?: number): string {
    if (!maxLength || text.length <= maxLength) {
      return text;
    }

    // Try to cut at a word boundary
    const trimmed = text.slice(0, maxLength);
    const lastSpace = trimmed.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      return trimmed.slice(0, lastSpace).trim() + '...';
    }

    return trimmed.trim() + '...';
  }

  /**
   * List all available templates
   */
  listTemplates(platform?: string): ListingTemplate[] {
    let templates = Array.from(this.templates.values());

    if (platform) {
      templates = templates.filter(t => t.platform === platform || t.platform === 'universal');
    }

    return templates;
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      logger.info('Template deleted', { id });
      recordMetric('template.deleted', 1, {});
    }
    return deleted;
  }
}

export const listingTemplates = new ListingTemplateService();
