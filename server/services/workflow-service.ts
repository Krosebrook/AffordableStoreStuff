/**
 * Workflow Service
 * Comprehensive workflow management with templates, triggers, and execution
 *
 * Features:
 * - Workflow template library with pre-built templates
 * - Trigger system (scheduled, webhook, event-based)
 * - Execution logging and debugging
 * - Retry mechanisms with exponential backoff
 * - Circuit breaker for fault tolerance
 */

import { createLogger, withRetry, CircuitBreaker, recordMetric, trackError } from '../lib/observability';
import { db } from '../db';
import { workflowExecutions } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getWorkflowExecutionEngine, getN8nConnector } from '../integrations/n8n-connector';
import cron from 'node-cron';

const logger = createLogger('WorkflowService');

/**
 * Workflow template definition
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'publishing' | 'sync' | 'marketing' | 'analytics' | 'custom';
  tags: string[];
  // n8n workflow definition
  nodes: any[];
  connections: any;
  settings?: any;
  // Configuration
  requiredInputs: string[];
  optionalInputs?: string[];
  triggerType: 'manual' | 'scheduled' | 'webhook' | 'event';
  schedule?: string; // cron expression if scheduled
  // Metadata
  icon?: string;
  color?: string;
  author?: string;
  version: string;
  popularity?: number;
}

/**
 * Workflow trigger configuration
 */
export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  type: 'scheduled' | 'webhook' | 'event';
  config: ScheduledTriggerConfig | WebhookTriggerConfig | EventTriggerConfig;
  enabled: boolean;
}

export interface ScheduledTriggerConfig {
  cron: string; // Cron expression
  timezone?: string;
  maxRetries?: number;
}

export interface WebhookTriggerConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  secret?: string;
  validateSignature?: boolean;
}

export interface EventTriggerConfig {
  eventType: string; // e.g., 'product.created', 'order.completed'
  filters?: Record<string, any>;
}

/**
 * Workflow execution context
 */
export interface WorkflowExecutionContext {
  executionId: string;
  workflowId: string;
  triggerType: 'scheduled' | 'manual' | 'webhook' | 'event';
  inputData: any;
  startTime: Date;
  metadata?: Record<string, any>;
}

/**
 * Workflow Service
 */
export class WorkflowService {
  private templates: Map<string, WorkflowTemplate> = new Map();
  private triggers: Map<string, WorkflowTrigger> = new Map();
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private eventHandlers: Map<string, Set<string>> = new Map(); // eventType -> Set<workflowId>
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker('workflow-service', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    this.initializeBuiltInTemplates();
  }

  /**
   * Initialize built-in workflow templates
   */
  private initializeBuiltInTemplates(): void {
    const builtInTemplates: WorkflowTemplate[] = [
      {
        id: 'product-to-printify-to-etsy',
        name: 'Product → Printify → Etsy',
        description: 'Create product in Printify, generate mockups, and publish to Etsy',
        category: 'publishing',
        tags: ['printify', 'etsy', 'publishing', 'print-on-demand'],
        requiredInputs: ['productTitle', 'productDescription', 'price', 'designUrl'],
        optionalInputs: ['tags', 'category'],
        triggerType: 'manual',
        version: '1.0.0',
        icon: 'shopping-cart',
        color: '#FF6B35',
        nodes: [
          {
            id: 'trigger',
            type: 'n8n-nodes-base.manualTrigger',
            name: 'Manual Trigger',
            position: [250, 300],
          },
          {
            id: 'printify-create',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Create Printify Product',
            position: [450, 300],
            parameters: {
              url: '={{$env.PRINTIFY_API_URL}}/shops/{{$env.PRINTIFY_SHOP_ID}}/products.json',
              method: 'POST',
              authentication: 'headerAuth',
              headerParameters: {
                parameters: [
                  { name: 'Authorization', value: 'Bearer {{$env.PRINTIFY_API_KEY}}' },
                ],
              },
              body: {
                title: '={{$json.productTitle}}',
                description: '={{$json.productDescription}}',
                blueprintId: 3, // T-shirt
                printProviderId: 99,
                variants: [
                  { id: 1, price: '={{$json.price}}', isEnabled: true },
                ],
                images: [
                  { src: '={{$json.designUrl}}', position: 'front' },
                ],
              },
            },
          },
          {
            id: 'etsy-publish',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Publish to Etsy',
            position: [650, 300],
            parameters: {
              url: '={{$env.ETSY_API_URL}}/shops/{{$env.ETSY_SHOP_ID}}/listings',
              method: 'POST',
              authentication: 'oAuth2',
              body: {
                title: '={{$json.productTitle}}',
                description: '={{$json.productDescription}}',
                price: '={{$json.price}}',
                quantity: 999,
                taxonomy_id: 1234,
                who_made: 'i_did',
                when_made: 'made_to_order',
                tags: '={{$json.tags}}',
              },
            },
          },
        ],
        connections: {
          trigger: { main: [[{ node: 'printify-create', type: 'main', index: 0 }]] },
          'printify-create': { main: [[{ node: 'etsy-publish', type: 'main', index: 0 }]] },
        },
        settings: {
          executionOrder: 'v1',
        },
      },
      {
        id: 'scheduled-inventory-sync',
        name: 'Scheduled Inventory Sync',
        description: 'Sync inventory between Printify, Etsy, and local database every hour',
        category: 'sync',
        tags: ['inventory', 'sync', 'scheduled', 'automation'],
        requiredInputs: [],
        triggerType: 'scheduled',
        schedule: '0 * * * *', // Every hour
        version: '1.0.0',
        icon: 'refresh-cw',
        color: '#4ECDC4',
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
            id: 'printify-fetch',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Fetch Printify Products',
            position: [450, 300],
          },
          {
            id: 'etsy-fetch',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Fetch Etsy Listings',
            position: [450, 450],
          },
          {
            id: 'sync-database',
            type: 'n8n-nodes-base.postgres',
            name: 'Update Local Database',
            position: [650, 375],
          },
        ],
        connections: {
          schedule: {
            main: [
              [
                { node: 'printify-fetch', type: 'main', index: 0 },
                { node: 'etsy-fetch', type: 'main', index: 0 },
              ],
            ],
          },
          'printify-fetch': { main: [[{ node: 'sync-database', type: 'main', index: 0 }]] },
          'etsy-fetch': { main: [[{ node: 'sync-database', type: 'main', index: 0 }]] },
        },
        settings: {},
      },
      {
        id: 'product-created-webhook',
        name: 'Product Created → Publish',
        description: 'Automatically publish product to all connected platforms when created',
        category: 'publishing',
        tags: ['webhook', 'publishing', 'automation'],
        requiredInputs: ['productId'],
        triggerType: 'webhook',
        version: '1.0.0',
        icon: 'zap',
        color: '#FFC107',
        nodes: [
          {
            id: 'webhook',
            type: 'n8n-nodes-base.webhook',
            name: 'Product Created Webhook',
            position: [250, 300],
            parameters: {
              path: 'product-created',
              method: 'POST',
            },
          },
          {
            id: 'fetch-product',
            type: 'n8n-nodes-base.postgres',
            name: 'Fetch Product Data',
            position: [450, 300],
          },
          {
            id: 'publish-printify',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Publish to Printify',
            position: [650, 250],
          },
          {
            id: 'publish-etsy',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Publish to Etsy',
            position: [650, 350],
          },
        ],
        connections: {
          webhook: { main: [[{ node: 'fetch-product', type: 'main', index: 0 }]] },
          'fetch-product': {
            main: [
              [
                { node: 'publish-printify', type: 'main', index: 0 },
                { node: 'publish-etsy', type: 'main', index: 0 },
              ],
            ],
          },
        },
        settings: {},
      },
      {
        id: 'ai-content-generation',
        name: 'AI Content Generation Pipeline',
        description: 'Generate product titles, descriptions, and images using AI',
        category: 'marketing',
        tags: ['ai', 'content', 'generation', 'marketing'],
        requiredInputs: ['productConcept', 'targetAudience'],
        optionalInputs: ['brandVoice', 'stylePreference'],
        triggerType: 'manual',
        version: '1.0.0',
        icon: 'brain',
        color: '#9C27B0',
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
            position: [450, 250],
          },
          {
            id: 'generate-description',
            type: 'n8n-nodes-base.openAi',
            name: 'Generate Description',
            position: [450, 350],
          },
          {
            id: 'generate-image',
            type: 'n8n-nodes-base.openAi',
            name: 'Generate Product Image',
            position: [650, 300],
          },
          {
            id: 'save-to-library',
            type: 'n8n-nodes-base.postgres',
            name: 'Save to Content Library',
            position: [850, 300],
          },
        ],
        connections: {
          trigger: {
            main: [
              [
                { node: 'generate-title', type: 'main', index: 0 },
                { node: 'generate-description', type: 'main', index: 0 },
              ],
            ],
          },
          'generate-title': { main: [[{ node: 'generate-image', type: 'main', index: 0 }]] },
          'generate-description': { main: [[{ node: 'generate-image', type: 'main', index: 0 }]] },
          'generate-image': { main: [[{ node: 'save-to-library', type: 'main', index: 0 }]] },
        },
        settings: {},
      },
      {
        id: 'order-fulfillment-automation',
        name: 'Order Fulfillment Automation',
        description: 'Automatically process orders from Etsy through Printify',
        category: 'publishing',
        tags: ['order', 'fulfillment', 'automation', 'etsy', 'printify'],
        requiredInputs: ['orderId'],
        triggerType: 'webhook',
        version: '1.0.0',
        icon: 'package',
        color: '#00BCD4',
        nodes: [
          {
            id: 'webhook',
            type: 'n8n-nodes-base.webhook',
            name: 'Order Created Webhook',
            position: [250, 300],
          },
          {
            id: 'fetch-order',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Fetch Order Details',
            position: [450, 300],
          },
          {
            id: 'create-printify-order',
            type: 'n8n-nodes-base.httpRequest',
            name: 'Create Printify Order',
            position: [650, 300],
          },
          {
            id: 'send-confirmation',
            type: 'n8n-nodes-base.emailSend',
            name: 'Send Customer Confirmation',
            position: [850, 300],
          },
        ],
        connections: {
          webhook: { main: [[{ node: 'fetch-order', type: 'main', index: 0 }]] },
          'fetch-order': { main: [[{ node: 'create-printify-order', type: 'main', index: 0 }]] },
          'create-printify-order': { main: [[{ node: 'send-confirmation', type: 'main', index: 0 }]] },
        },
        settings: {},
      },
    ];

    builtInTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    logger.info('Initialized workflow templates', { count: this.templates.size });
  }

  /**
   * Get all workflow templates
   */
  getTemplates(filters?: {
    category?: string;
    tags?: string[];
    search?: string;
  }): WorkflowTemplate[] {
    let templates = Array.from(this.templates.values());

    if (filters?.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      templates = templates.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by popularity
    return templates.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  /**
   * Get a specific template
   */
  getTemplate(templateId: string): WorkflowTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Register a custom workflow template
   */
  registerTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
    logger.info('Registered workflow template', { templateId: template.id, name: template.name });
    recordMetric('workflow.template.registered', 1, { templateId: template.id });
  }

  /**
   * Execute a workflow from a template
   */
  async executeFromTemplate(
    templateId: string,
    inputData: any,
    triggerType: 'scheduled' | 'manual' | 'webhook' | 'event' = 'manual'
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate required inputs
    const missingInputs = template.requiredInputs.filter(
      input => !(input in inputData)
    );

    if (missingInputs.length > 0) {
      throw new Error(`Missing required inputs: ${missingInputs.join(', ')}`);
    }

    const executionEngine = getWorkflowExecutionEngine();
    if (!executionEngine) {
      throw new Error('Workflow execution engine not available');
    }

    logger.info('Executing workflow from template', {
      templateId,
      templateName: template.name,
      triggerType,
    });

    try {
      // In a real implementation, we'd need to create/update the workflow in n8n first
      // For now, we'll use the template ID as the workflow ID
      const executionId = await executionEngine.executeWorkflow(
        templateId,
        template.name,
        triggerType,
        inputData
      );

      // Update template popularity
      if (template.popularity !== undefined) {
        template.popularity++;
      } else {
        template.popularity = 1;
      }

      recordMetric('workflow.template.executed', 1, {
        templateId,
        triggerType,
      });

      return executionId;
    } catch (error: any) {
      logger.error('Failed to execute workflow from template', error, {
        templateId,
        triggerType,
      });
      trackError(error, { operation: 'executeFromTemplate', templateId });
      throw error;
    }
  }

  /**
   * Register a trigger for a workflow
   */
  registerTrigger(trigger: WorkflowTrigger): void {
    this.triggers.set(trigger.id, trigger);

    if (!trigger.enabled) {
      logger.info('Trigger registered but disabled', { triggerId: trigger.id });
      return;
    }

    switch (trigger.type) {
      case 'scheduled':
        this.registerScheduledTrigger(trigger);
        break;
      case 'webhook':
        this.registerWebhookTrigger(trigger);
        break;
      case 'event':
        this.registerEventTrigger(trigger);
        break;
    }

    logger.info('Trigger registered', {
      triggerId: trigger.id,
      type: trigger.type,
      workflowId: trigger.workflowId,
    });

    recordMetric('workflow.trigger.registered', 1, { type: trigger.type });
  }

  /**
   * Register a scheduled trigger using cron
   */
  private registerScheduledTrigger(trigger: WorkflowTrigger): void {
    const config = trigger.config as ScheduledTriggerConfig;

    try {
      const job = cron.schedule(
        config.cron,
        async () => {
          logger.info('Scheduled trigger fired', {
            triggerId: trigger.id,
            workflowId: trigger.workflowId,
          });

          try {
            await this.executeTrigger(trigger);
          } catch (error: any) {
            logger.error('Scheduled trigger execution failed', error, {
              triggerId: trigger.id,
            });
          }
        },
        {
          timezone: config.timezone || 'UTC',
        }
      );

      this.scheduledJobs.set(trigger.id, job);
      logger.info('Scheduled trigger job created', {
        triggerId: trigger.id,
        cron: config.cron,
      });
    } catch (error: any) {
      logger.error('Failed to create scheduled trigger', error, {
        triggerId: trigger.id,
        cron: config.cron,
      });
      throw error;
    }
  }

  /**
   * Register a webhook trigger
   */
  private registerWebhookTrigger(trigger: WorkflowTrigger): void {
    // Webhook triggers are registered in the router
    // This is just for tracking
    logger.info('Webhook trigger registered', {
      triggerId: trigger.id,
      workflowId: trigger.workflowId,
    });
  }

  /**
   * Register an event-based trigger
   */
  private registerEventTrigger(trigger: WorkflowTrigger): void {
    const config = trigger.config as EventTriggerConfig;

    if (!this.eventHandlers.has(config.eventType)) {
      this.eventHandlers.set(config.eventType, new Set());
    }

    this.eventHandlers.get(config.eventType)!.add(trigger.workflowId);

    logger.info('Event trigger registered', {
      triggerId: trigger.id,
      eventType: config.eventType,
    });
  }

  /**
   * Execute a trigger
   */
  private async executeTrigger(trigger: WorkflowTrigger, inputData?: any): Promise<void> {
    const executionEngine = getWorkflowExecutionEngine();
    if (!executionEngine) {
      throw new Error('Workflow execution engine not available');
    }

    const config = trigger.config as ScheduledTriggerConfig;
    const maxRetries = config.maxRetries || 3;

    await withRetry(
      () =>
        executionEngine.executeWorkflow(
          trigger.workflowId,
          `Triggered workflow ${trigger.workflowId}`,
          trigger.type,
          inputData
        ),
      {
        maxAttempts: maxRetries,
        baseDelayMs: 5000,
        maxDelayMs: 30000,
        onRetry: (error, attempt, delayMs) => {
          logger.warn('Retrying trigger execution', {
            triggerId: trigger.id,
            attempt,
            delayMs,
            error: error.message,
          });
        },
      }
    );
  }

  /**
   * Emit an event that may trigger workflows
   */
  async emitEvent(eventType: string, data: any): Promise<void> {
    const workflowIds = this.eventHandlers.get(eventType);
    if (!workflowIds || workflowIds.size === 0) {
      logger.debug('No workflows registered for event', { eventType });
      return;
    }

    logger.info('Event emitted, triggering workflows', {
      eventType,
      workflowCount: workflowIds.size,
    });

    recordMetric('workflow.event.emitted', 1, { eventType });

    // Execute all workflows for this event
    const promises = Array.from(workflowIds).map(async workflowId => {
      const trigger = Array.from(this.triggers.values()).find(
        t => t.workflowId === workflowId && t.type === 'event'
      );

      if (!trigger) {
        logger.warn('Trigger not found for workflow', { workflowId, eventType });
        return;
      }

      const config = trigger.config as EventTriggerConfig;

      // Apply filters if configured
      if (config.filters) {
        const matches = Object.entries(config.filters).every(
          ([key, value]) => data[key] === value
        );

        if (!matches) {
          logger.debug('Event filtered out for workflow', { workflowId, eventType });
          return;
        }
      }

      try {
        await this.executeTrigger(trigger, data);
      } catch (error: any) {
        logger.error('Event trigger execution failed', error, {
          workflowId,
          eventType,
        });
        trackError(error, { operation: 'emitEvent', workflowId, eventType });
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get execution logs for debugging
   */
  async getExecutionLogs(executionId: string): Promise<any> {
    const executionEngine = getWorkflowExecutionEngine();
    if (!executionEngine) {
      throw new Error('Workflow execution engine not available');
    }

    const execution = await executionEngine.getExecutionStatus(executionId);

    // In a real implementation, we'd also fetch detailed logs from n8n
    return {
      execution,
      logs: [
        {
          timestamp: execution.startedAt,
          level: 'info',
          message: 'Workflow execution started',
        },
        ...(execution.endedAt
          ? [
              {
                timestamp: execution.endedAt,
                level: execution.status === 'completed' ? 'info' : 'error',
                message: `Workflow execution ${execution.status}`,
              },
            ]
          : []),
      ],
    };
  }

  /**
   * Disable a trigger
   */
  disableTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    trigger.enabled = false;

    // Stop scheduled job if it exists
    if (trigger.type === 'scheduled') {
      const job = this.scheduledJobs.get(triggerId);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(triggerId);
      }
    }

    // Remove event handler
    if (trigger.type === 'event') {
      const config = trigger.config as EventTriggerConfig;
      const handlers = this.eventHandlers.get(config.eventType);
      if (handlers) {
        handlers.delete(trigger.workflowId);
      }
    }

    logger.info('Trigger disabled', { triggerId });
    recordMetric('workflow.trigger.disabled', 1, { type: trigger.type });
  }

  /**
   * Enable a trigger
   */
  enableTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    trigger.enabled = true;

    // Re-register the trigger
    switch (trigger.type) {
      case 'scheduled':
        this.registerScheduledTrigger(trigger);
        break;
      case 'event':
        this.registerEventTrigger(trigger);
        break;
    }

    logger.info('Trigger enabled', { triggerId });
    recordMetric('workflow.trigger.enabled', 1, { type: trigger.type });
  }

  /**
   * Get all triggers
   */
  getTriggers(filters?: { workflowId?: string; type?: string }): WorkflowTrigger[] {
    let triggers = Array.from(this.triggers.values());

    if (filters?.workflowId) {
      triggers = triggers.filter(t => t.workflowId === filters.workflowId);
    }

    if (filters?.type) {
      triggers = triggers.filter(t => t.type === filters.type);
    }

    return triggers;
  }

  /**
   * Clean up old executions
   */
  async cleanupOldExecutions(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const result = await db
        .delete(workflowExecutions)
        .where(
          and(
            gte(workflowExecutions.startedAt, cutoffDate),
            sql`${workflowExecutions.status} IN ('completed', 'failed', 'cancelled')`
          )
        );

      const deletedCount = result.rowCount || 0;

      logger.info('Cleaned up old workflow executions', {
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      });

      recordMetric('workflow.cleanup', deletedCount, {
        daysToKeep: String(daysToKeep),
      });

      return deletedCount;
    } catch (error: any) {
      logger.error('Failed to clean up old executions', error);
      trackError(error, { operation: 'cleanupOldExecutions' });
      throw error;
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(workflowId?: string): Promise<any> {
    try {
      let query = db.select().from(workflowExecutions);

      if (workflowId) {
        query = query.where(eq(workflowExecutions.workflowId, workflowId)) as any;
      }

      const executions = await query;

      const stats = {
        total: executions.length,
        completed: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        running: executions.filter(e => e.status === 'running').length,
        cancelled: executions.filter(e => e.status === 'cancelled').length,
        avgDuration: 0,
        totalRetries: executions.reduce((sum, e) => sum + (e.retryCount || 0), 0),
      };

      const completedExecutions = executions.filter(
        e => e.status === 'completed' && e.durationMs
      );

      if (completedExecutions.length > 0) {
        stats.avgDuration =
          completedExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0) /
          completedExecutions.length;
      }

      return stats;
    } catch (error: any) {
      logger.error('Failed to get workflow stats', error, { workflowId });
      trackError(error, { operation: 'getWorkflowStats', workflowId });
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllScheduledJobs(): void {
    this.scheduledJobs.forEach((job, triggerId) => {
      job.stop();
      logger.debug('Stopped scheduled job', { triggerId });
    });

    this.scheduledJobs.clear();
    logger.info('Stopped all scheduled jobs');
  }
}

/**
 * Singleton instance
 */
let workflowServiceInstance: WorkflowService | null = null;

export function getWorkflowService(): WorkflowService {
  if (!workflowServiceInstance) {
    workflowServiceInstance = new WorkflowService();
  }
  return workflowServiceInstance;
}

export function setWorkflowService(service: WorkflowService | null): void {
  if (workflowServiceInstance) {
    workflowServiceInstance.stopAllScheduledJobs();
  }
  workflowServiceInstance = service;
}
