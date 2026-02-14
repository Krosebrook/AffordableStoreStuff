/**
 * Pre-built Workflow Templates
 * Ready-to-use workflow templates for common automation scenarios
 *
 * Categories:
 * - Publishing: Product publishing workflows
 * - Sync: Inventory and data synchronization
 * - Marketing: AI content generation and campaigns
 * - Analytics: Data collection and reporting
 * - Custom: User-defined workflows
 */

import { WorkflowTemplate } from './workflow-service';

/**
 * Product → Printify → Etsy Workflow
 * Complete pipeline from product creation to Etsy listing
 */
export const PRODUCT_TO_PRINTIFY_TO_ETSY: WorkflowTemplate = {
  id: 'product-to-printify-to-etsy',
  name: 'Product → Printify → Etsy',
  description:
    'Create product in Printify, generate mockups, and publish to Etsy automatically. Perfect for print-on-demand businesses.',
  category: 'publishing',
  tags: ['printify', 'etsy', 'publishing', 'print-on-demand', 'automation'],
  requiredInputs: ['productTitle', 'productDescription', 'price', 'designUrl'],
  optionalInputs: ['tags', 'category', 'quantity', 'shippingProfile'],
  triggerType: 'manual',
  version: '1.0.0',
  icon: 'shopping-cart',
  color: '#FF6B35',
  author: 'FlashFusion',
  popularity: 0,
  nodes: [
    {
      id: 'trigger',
      type: 'n8n-nodes-base.manualTrigger',
      name: 'Manual Trigger',
      position: [250, 300],
      parameters: {},
    },
    {
      id: 'validate-inputs',
      type: 'n8n-nodes-base.code',
      name: 'Validate Inputs',
      position: [400, 300],
      parameters: {
        code: `
          const required = ['productTitle', 'productDescription', 'price', 'designUrl'];
          const missing = required.filter(key => !items[0].json[key]);

          if (missing.length > 0) {
            throw new Error(\`Missing required fields: \${missing.join(', ')}\`);
          }

          // Validate price is a number
          if (isNaN(parseFloat(items[0].json.price))) {
            throw new Error('Price must be a valid number');
          }

          return items;
        `,
      },
    },
    {
      id: 'upload-design',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Upload Design to Printify',
      position: [550, 300],
      parameters: {
        url: '={{$env.PRINTIFY_API_URL}}/uploads/images.json',
        method: 'POST',
        authentication: 'headerAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'Authorization',
              value: 'Bearer {{$env.PRINTIFY_API_KEY}}',
            },
          ],
        },
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'file_name', value: '={{$json.productTitle}}.png' },
            { name: 'url', value: '={{$json.designUrl}}' },
          ],
        },
      },
    },
    {
      id: 'create-printify-product',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Create Printify Product',
      position: [700, 300],
      parameters: {
        url: '={{$env.PRINTIFY_API_URL}}/shops/{{$env.PRINTIFY_SHOP_ID}}/products.json',
        method: 'POST',
        authentication: 'headerAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'Authorization',
              value: 'Bearer {{$env.PRINTIFY_API_KEY}}',
            },
          ],
        },
        sendBody: true,
        body: JSON.stringify({
          title: '={{$json.productTitle}}',
          description: '={{$json.productDescription}}',
          blueprintId: 3,
          printProviderId: 99,
          variants: [
            {
              id: 1,
              price: '={{Math.round($json.price * 100)}}',
              isEnabled: true,
            },
          ],
          images: [
            {
              src: '={{$node["Upload Design to Printify"].json.preview_url}}',
              position: 'front',
              isDefault: true,
            },
          ],
        }),
      },
    },
    {
      id: 'publish-printify',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Publish Printify Product',
      position: [850, 300],
      parameters: {
        url:
          '={{$env.PRINTIFY_API_URL}}/shops/{{$env.PRINTIFY_SHOP_ID}}/products/{{$json.id}}/publish.json',
        method: 'POST',
        authentication: 'headerAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'Authorization',
              value: 'Bearer {{$env.PRINTIFY_API_KEY}}',
            },
          ],
        },
        sendBody: true,
        body: JSON.stringify({
          title: true,
          description: true,
          images: true,
          variants: true,
          tags: true,
        }),
      },
    },
    {
      id: 'create-etsy-listing',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Create Etsy Listing',
      position: [1000, 300],
      parameters: {
        url: '={{$env.ETSY_API_URL}}/v3/application/shops/{{$env.ETSY_SHOP_ID}}/listings',
        method: 'POST',
        authentication: 'oAuth2',
        sendBody: true,
        body: JSON.stringify({
          title: '={{$json.productTitle}}',
          description: '={{$json.productDescription}}',
          price: '={{$json.price}}',
          quantity: '={{$json.quantity || 999}}',
          taxonomy_id: 1234,
          who_made: 'i_did',
          when_made: 'made_to_order',
          is_supply: false,
          tags: '={{$json.tags ? $json.tags.split(",") : []}}',
        }),
      },
    },
    {
      id: 'log-success',
      type: 'n8n-nodes-base.code',
      name: 'Log Success',
      position: [1150, 300],
      parameters: {
        code: `
          console.log('Product published successfully:', {
            printifyId: items[0].json.printifyId,
            etsyId: items[0].json.id,
            title: items[0].json.title
          });
          return items;
        `,
      },
    },
  ],
  connections: {
    trigger: {
      main: [[{ node: 'validate-inputs', type: 'main', index: 0 }]],
    },
    'validate-inputs': {
      main: [[{ node: 'upload-design', type: 'main', index: 0 }]],
    },
    'upload-design': {
      main: [[{ node: 'create-printify-product', type: 'main', index: 0 }]],
    },
    'create-printify-product': {
      main: [[{ node: 'publish-printify', type: 'main', index: 0 }]],
    },
    'publish-printify': {
      main: [[{ node: 'create-etsy-listing', type: 'main', index: 0 }]],
    },
    'create-etsy-listing': {
      main: [[{ node: 'log-success', type: 'main', index: 0 }]],
    },
  },
  settings: {
    executionOrder: 'v1',
  },
};

/**
 * Scheduled Inventory Sync Workflow
 * Sync inventory between platforms every hour
 */
export const SCHEDULED_INVENTORY_SYNC: WorkflowTemplate = {
  id: 'scheduled-inventory-sync',
  name: 'Scheduled Inventory Sync',
  description:
    'Automatically sync inventory between Printify, Etsy, and local database every hour. Prevents overselling and keeps stock levels accurate.',
  category: 'sync',
  tags: ['inventory', 'sync', 'scheduled', 'automation', 'stock'],
  requiredInputs: [],
  triggerType: 'scheduled',
  schedule: '0 * * * *', // Every hour
  version: '1.0.0',
  icon: 'refresh-cw',
  color: '#4ECDC4',
  author: 'FlashFusion',
  popularity: 0,
  nodes: [
    {
      id: 'schedule',
      type: 'n8n-nodes-base.scheduleTrigger',
      name: 'Every Hour',
      position: [250, 300],
      parameters: {
        rule: {
          interval: [{ field: 'hours', hoursInterval: 1 }],
        },
      },
    },
    {
      id: 'fetch-printify',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Fetch Printify Products',
      position: [450, 250],
      parameters: {
        url: '={{$env.PRINTIFY_API_URL}}/shops/{{$env.PRINTIFY_SHOP_ID}}/products.json',
        method: 'GET',
        authentication: 'headerAuth',
      },
    },
    {
      id: 'fetch-etsy',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Fetch Etsy Listings',
      position: [450, 350],
      parameters: {
        url: '={{$env.ETSY_API_URL}}/v3/application/shops/{{$env.ETSY_SHOP_ID}}/listings/active',
        method: 'GET',
        authentication: 'oAuth2',
      },
    },
    {
      id: 'merge-data',
      type: 'n8n-nodes-base.merge',
      name: 'Merge Platform Data',
      position: [650, 300],
      parameters: {
        mode: 'mergeByKey',
        propertyName1: 'id',
        propertyName2: 'id',
      },
    },
    {
      id: 'sync-database',
      type: 'n8n-nodes-base.postgres',
      name: 'Update Local Database',
      position: [850, 300],
      parameters: {
        operation: 'executeQuery',
        query: `
          INSERT INTO products (id, name, stock, metadata, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (id) DO UPDATE SET
            stock = EXCLUDED.stock,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        `,
      },
    },
  ],
  connections: {
    schedule: {
      main: [
        [
          { node: 'fetch-printify', type: 'main', index: 0 },
          { node: 'fetch-etsy', type: 'main', index: 0 },
        ],
      ],
    },
    'fetch-printify': {
      main: [[{ node: 'merge-data', type: 'main', index: 0 }]],
    },
    'fetch-etsy': {
      main: [[{ node: 'merge-data', type: 'main', index: 1 }]],
    },
    'merge-data': {
      main: [[{ node: 'sync-database', type: 'main', index: 0 }]],
    },
  },
  settings: {},
};

/**
 * AI Content Generation Pipeline
 * Generate product content using AI
 */
export const AI_CONTENT_GENERATION: WorkflowTemplate = {
  id: 'ai-content-generation',
  name: 'AI Content Generation Pipeline',
  description:
    'Generate compelling product titles, descriptions, SEO content, and images using AI. Optimized for marketplace success.',
  category: 'marketing',
  tags: ['ai', 'content', 'generation', 'marketing', 'seo', 'images'],
  requiredInputs: ['productConcept', 'targetAudience'],
  optionalInputs: ['brandVoice', 'stylePreference', 'keywords'],
  triggerType: 'manual',
  version: '1.0.0',
  icon: 'brain',
  color: '#9C27B0',
  author: 'FlashFusion',
  popularity: 0,
  nodes: [
    {
      id: 'trigger',
      type: 'n8n-nodes-base.manualTrigger',
      name: 'Manual Trigger',
      position: [250, 300],
    },
    {
      id: 'generate-title',
      type: 'n8n-nodes-base.openAi',
      name: 'Generate Title',
      position: [450, 200],
      parameters: {
        resource: 'text',
        operation: 'completion',
        model: 'gpt-4',
        prompt: `Create a compelling product title for:
Concept: {{$json.productConcept}}
Target Audience: {{$json.targetAudience}}
Brand Voice: {{$json.brandVoice || "professional and friendly"}}

Requirements:
- Max 140 characters
- Include key benefits
- SEO optimized
- Clear and descriptive

Return only the title, nothing else.`,
        maxTokens: 50,
      },
    },
    {
      id: 'generate-description',
      type: 'n8n-nodes-base.openAi',
      name: 'Generate Description',
      position: [450, 300],
      parameters: {
        resource: 'text',
        operation: 'completion',
        model: 'gpt-4',
        prompt: `Create a compelling product description for:
Concept: {{$json.productConcept}}
Target Audience: {{$json.targetAudience}}
Brand Voice: {{$json.brandVoice || "professional and friendly"}}

Requirements:
- 150-300 words
- Highlight key features and benefits
- Include emotional appeal
- SEO optimized
- Call to action at the end

Format in paragraphs for easy reading.`,
        maxTokens: 500,
      },
    },
    {
      id: 'generate-tags',
      type: 'n8n-nodes-base.openAi',
      name: 'Generate SEO Tags',
      position: [450, 400],
      parameters: {
        resource: 'text',
        operation: 'completion',
        model: 'gpt-4',
        prompt: `Generate 10 SEO-optimized tags for:
Concept: {{$json.productConcept}}
Target Audience: {{$json.targetAudience}}
Keywords: {{$json.keywords || "auto-generate based on concept"}}

Requirements:
- Mix of broad and specific tags
- Include trending keywords
- Relevant to target audience
- No more than 20 characters per tag

Return as comma-separated list.`,
        maxTokens: 100,
      },
    },
    {
      id: 'generate-image',
      type: 'n8n-nodes-base.openAi',
      name: 'Generate Product Image',
      position: [650, 300],
      parameters: {
        resource: 'image',
        operation: 'create',
        prompt: `Professional product photography of {{$json.productConcept}}
Style: {{$json.stylePreference || "clean studio lighting, white background"}}
Quality: High-resolution, commercial grade
Mood: Professional, appealing to {{$json.targetAudience}}`,
        size: '1024x1024',
        quality: 'hd',
      },
    },
    {
      id: 'combine-data',
      type: 'n8n-nodes-base.code',
      name: 'Combine All Content',
      position: [850, 300],
      parameters: {
        code: `
          const title = items.find(i => i.json.title)?.json.title || '';
          const description = items.find(i => i.json.description)?.json.description || '';
          const tags = items.find(i => i.json.tags)?.json.tags || '';
          const imageUrl = items.find(i => i.json.imageUrl)?.json.imageUrl || '';

          return [{
            json: {
              productConcept: items[0].json.productConcept,
              generatedTitle: title,
              generatedDescription: description,
              generatedTags: tags.split(',').map(t => t.trim()),
              generatedImageUrl: imageUrl,
              createdAt: new Date().toISOString()
            }
          }];
        `,
      },
    },
    {
      id: 'save-to-library',
      type: 'n8n-nodes-base.postgres',
      name: 'Save to Content Library',
      position: [1000, 300],
      parameters: {
        operation: 'insert',
        table: 'ai_content_library',
        columns:
          'content_type,title,content,tags,media_url,prompt,ai_provider,generation_cost',
      },
    },
  ],
  connections: {
    trigger: {
      main: [
        [
          { node: 'generate-title', type: 'main', index: 0 },
          { node: 'generate-description', type: 'main', index: 0 },
          { node: 'generate-tags', type: 'main', index: 0 },
        ],
      ],
    },
    'generate-title': {
      main: [[{ node: 'generate-image', type: 'main', index: 0 }]],
    },
    'generate-description': {
      main: [[{ node: 'generate-image', type: 'main', index: 0 }]],
    },
    'generate-tags': {
      main: [[{ node: 'generate-image', type: 'main', index: 0 }]],
    },
    'generate-image': {
      main: [[{ node: 'combine-data', type: 'main', index: 0 }]],
    },
    'combine-data': {
      main: [[{ node: 'save-to-library', type: 'main', index: 0 }]],
    },
  },
  settings: {},
};

/**
 * Order Fulfillment Automation
 * Automatically process orders from Etsy through Printify
 */
export const ORDER_FULFILLMENT_AUTOMATION: WorkflowTemplate = {
  id: 'order-fulfillment-automation',
  name: 'Order Fulfillment Automation',
  description:
    'Automatically process orders from Etsy through Printify with customer notifications. Hands-free fulfillment.',
  category: 'publishing',
  tags: ['order', 'fulfillment', 'automation', 'etsy', 'printify', 'customer-service'],
  requiredInputs: ['orderId'],
  triggerType: 'webhook',
  version: '1.0.0',
  icon: 'package',
  color: '#00BCD4',
  author: 'FlashFusion',
  popularity: 0,
  nodes: [
    {
      id: 'webhook',
      type: 'n8n-nodes-base.webhook',
      name: 'Order Created Webhook',
      position: [250, 300],
      parameters: {
        path: 'order-created',
        method: 'POST',
        responseMode: 'lastNode',
      },
    },
    {
      id: 'fetch-order',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Fetch Order Details',
      position: [450, 300],
      parameters: {
        url:
          '={{$env.ETSY_API_URL}}/v3/application/shops/{{$env.ETSY_SHOP_ID}}/receipts/{{$json.orderId}}',
        method: 'GET',
        authentication: 'oAuth2',
      },
    },
    {
      id: 'create-printify-order',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Create Printify Order',
      position: [650, 300],
      parameters: {
        url: '={{$env.PRINTIFY_API_URL}}/shops/{{$env.PRINTIFY_SHOP_ID}}/orders.json',
        method: 'POST',
        authentication: 'headerAuth',
        sendBody: true,
        body: JSON.stringify({
          external_id: '={{$json.receipt_id}}',
          line_items: '={{$json.transactions}}',
          shipping_method: 1,
          send_shipping_notification: true,
          address: {
            first_name: '={{$json.name}}',
            last_name: '={{$json.name}}',
            email: '={{$json.buyer_email}}',
            phone: '',
            country: '={{$json.country_iso}}',
            region: '={{$json.state}}',
            address1: '={{$json.first_line}}',
            address2: '={{$json.second_line || ""}}',
            city: '={{$json.city}}',
            zip: '={{$json.zip}}',
          },
        }),
      },
    },
    {
      id: 'update-order-status',
      type: 'n8n-nodes-base.postgres',
      name: 'Update Order Status',
      position: [850, 300],
      parameters: {
        operation: 'executeQuery',
        query: `
          UPDATE orders
          SET status = 'processing',
              payment_status = 'paid',
              notes = 'Order sent to Printify',
              updated_at = NOW()
          WHERE id = $1
        `,
      },
    },
    {
      id: 'send-confirmation',
      type: 'n8n-nodes-base.emailSend',
      name: 'Send Customer Confirmation',
      position: [1050, 300],
      parameters: {
        fromEmail: '={{$env.NOTIFICATION_EMAIL}}',
        toEmail: '={{$json.buyer_email}}',
        subject: 'Order Confirmation - {{$json.receipt_id}}',
        text: 'Dear {{$json.name}},\n\nThank you for your order! We\'re excited to let you know that your order has been received and is being processed.\n\nOrder Details:\nOrder #: {{$json.receipt_id}}\nItems: {{$json.transactions.length}}\nTotal: ${{$json.grandtotal}}\n\nYour order will be printed and shipped within 3-5 business days. You\'ll receive a tracking number once it ships.\n\nIf you have any questions, please don\'t hesitate to reach out.\n\nBest regards,\nThe Team',
      },
    },
  ],
  connections: {
    webhook: {
      main: [[{ node: 'fetch-order', type: 'main', index: 0 }]],
    },
    'fetch-order': {
      main: [[{ node: 'create-printify-order', type: 'main', index: 0 }]],
    },
    'create-printify-order': {
      main: [[{ node: 'update-order-status', type: 'main', index: 0 }]],
    },
    'update-order-status': {
      main: [[{ node: 'send-confirmation', type: 'main', index: 0 }]],
    },
  },
  settings: {},
};

/**
 * Bulk Product Publisher
 * Publish multiple products to multiple platforms
 */
export const BULK_PRODUCT_PUBLISHER: WorkflowTemplate = {
  id: 'bulk-product-publisher',
  name: 'Bulk Product Publisher',
  description:
    'Publish multiple products to Printify, Etsy, and other platforms in one workflow. Includes validation and error handling.',
  category: 'publishing',
  tags: ['bulk', 'publishing', 'automation', 'multi-platform'],
  requiredInputs: ['products'],
  optionalInputs: ['platforms', 'validateFirst'],
  triggerType: 'manual',
  version: '1.0.0',
  icon: 'layers',
  color: '#E91E63',
  author: 'FlashFusion',
  popularity: 0,
  nodes: [
    {
      id: 'trigger',
      type: 'n8n-nodes-base.manualTrigger',
      name: 'Manual Trigger',
      position: [250, 300],
    },
    {
      id: 'split-products',
      type: 'n8n-nodes-base.splitInBatches',
      name: 'Process in Batches',
      position: [450, 300],
      parameters: {
        batchSize: 5,
        options: {},
      },
    },
    {
      id: 'validate-product',
      type: 'n8n-nodes-base.code',
      name: 'Validate Product',
      position: [650, 300],
      parameters: {
        code: `
          const product = items[0].json;
          const errors = [];

          if (!product.title || product.title.length < 3) {
            errors.push('Title must be at least 3 characters');
          }

          if (!product.description || product.description.length < 50) {
            errors.push('Description must be at least 50 characters');
          }

          if (!product.price || product.price < 0) {
            errors.push('Price must be a positive number');
          }

          if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
          }

          return items;
        `,
      },
    },
    {
      id: 'publish-to-platforms',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Publish to Selected Platforms',
      position: [850, 300],
      parameters: {
        url: '={{$env.API_URL}}/api/publish-product',
        method: 'POST',
        sendBody: true,
        body: '={{JSON.stringify($json)}}',
      },
    },
    {
      id: 'log-results',
      type: 'n8n-nodes-base.postgres',
      name: 'Log Publishing Results',
      position: [1050, 300],
      parameters: {
        operation: 'insert',
        table: 'publishing_queue',
        columns: 'product_id,platform,status,external_id,published_at',
      },
    },
  ],
  connections: {
    trigger: {
      main: [[{ node: 'split-products', type: 'main', index: 0 }]],
    },
    'split-products': {
      main: [[{ node: 'validate-product', type: 'main', index: 0 }]],
    },
    'validate-product': {
      main: [[{ node: 'publish-to-platforms', type: 'main', index: 0 }]],
    },
    'publish-to-platforms': {
      main: [[{ node: 'log-results', type: 'main', index: 0 }]],
    },
    'log-results': {
      main: [[{ node: 'split-products', type: 'main', index: 0 }]],
    },
  },
  settings: {
    executionOrder: 'v1',
  },
};

/**
 * All available workflow templates
 */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  PRODUCT_TO_PRINTIFY_TO_ETSY,
  SCHEDULED_INVENTORY_SYNC,
  AI_CONTENT_GENERATION,
  ORDER_FULFILLMENT_AUTOMATION,
  BULK_PRODUCT_PUBLISHER,
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.tags.includes(tag));
}

/**
 * Search templates
 */
export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(
    t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
