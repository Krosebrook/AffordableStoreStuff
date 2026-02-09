/**
 * n8n Connector
 * Provides integration with n8n workflow automation platform
 * Supports webhook endpoints, workflow triggering, and execution monitoring
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';
import { createLogger, withRetry, CircuitBreaker, recordMetric, trackError } from '../lib/observability';
import { db } from '../db';
import { workflowExecutions } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

const logger = createLogger('n8n-connector');

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
  webhookSecret?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  nodes: any[];
  connections: any;
  settings?: any;
  staticData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook' | 'cli';
  startedAt: string;
  stoppedAt?: string;
  status: 'running' | 'success' | 'error' | 'waiting' | 'canceled';
  data?: any;
  error?: string;
}

export interface N8nWebhookPayload {
  workflowId: string;
  executionId: string;
  data: any;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'running' | 'success' | 'error';
}

export interface TriggerWorkflowOptions {
  workflowId: string;
  data?: any;
  waitForExecution?: boolean;
}

export interface WebhookValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * n8n API Client with circuit breaker and retry logic
 */
export class N8nConnector {
  private client: AxiosInstance;
  private config: N8nConfig;
  private circuitBreaker: CircuitBreaker;

  constructor(config: N8nConfig) {
    this.config = config;

    // Initialize axios client
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Initialize circuit breaker
    this.circuitBreaker = new CircuitBreaker('n8n-api', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute timeout before trying again
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('n8n API request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('n8n API request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('n8n API response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: AxiosError) => {
        const status = error.response?.status;
        const message = error.response?.data || error.message;

        logger.error('n8n API error', error, {
          status,
          message,
          url: error.config?.url,
        });

        // Transform error for better handling
        if (status === 401) {
          throw new Error('n8n authentication failed - invalid API key');
        } else if (status === 404) {
          throw new Error('n8n resource not found');
        } else if (status === 429) {
          throw new Error('n8n rate limit exceeded');
        } else if (status && status >= 500) {
          throw new Error(`n8n server error: ${message}`);
        }

        throw error;
      }
    );
  }

  /**
   * Test connection to n8n
   */
  async testConnection(): Promise<{ success: boolean; version?: string; error?: string }> {
    try {
      // n8n doesn't have a dedicated health endpoint, so we try to list workflows
      const response = await this.circuitBreaker.execute(() =>
        withRetry(() => this.client.get('/workflows'), {
          maxAttempts: 2,
          baseDelayMs: 500,
        })
      );

      logger.info('n8n connection successful');

      return {
        success: true,
        version: response.headers['x-n8n-version'],
      };
    } catch (error: any) {
      logger.error('n8n connection test failed', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.circuitBreaker.execute(() =>
        withRetry(() => this.client.get('/workflows'))
      );

      return response.data.data || response.data;
    } catch (error: any) {
      logger.error('Failed to fetch workflows', error);
      throw new Error(`Failed to fetch workflows: ${error.message}`);
    }
  }

  /**
   * Get a specific workflow
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    try {
      const response = await this.circuitBreaker.execute(() =>
        withRetry(() => this.client.get(`/workflows/${workflowId}`))
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch workflow', error, { workflowId });
      throw new Error(`Failed to fetch workflow: ${error.message}`);
    }
  }

  /**
   * Trigger a workflow execution
   */
  async triggerWorkflow(options: TriggerWorkflowOptions): Promise<N8nExecution> {
    const { workflowId, data = {}, waitForExecution = false } = options;

    try {
      logger.info('Triggering workflow', { workflowId, waitForExecution });

      const endpoint = waitForExecution
        ? `/workflows/${workflowId}/execute`
        : `/workflows/${workflowId}/activate`;

      const response = await this.circuitBreaker.execute(() =>
        withRetry(
          () =>
            this.client.post(endpoint, {
              data,
              mode: 'manual',
            }),
          {
            maxAttempts: 3,
            baseDelayMs: 1000,
          }
        )
      );

      logger.info('Workflow triggered successfully', {
        workflowId,
        executionId: response.data.id,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to trigger workflow', error, { workflowId });
      throw new Error(`Failed to trigger workflow: ${error.message}`);
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecution(executionId: string): Promise<N8nExecution> {
    try {
      const response = await this.circuitBreaker.execute(() =>
        withRetry(() => this.client.get(`/executions/${executionId}`))
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch execution', error, { executionId });
      throw new Error(`Failed to fetch execution: ${error.message}`);
    }
  }

  /**
   * Get all executions for a workflow
   */
  async getWorkflowExecutions(workflowId: string, limit = 100): Promise<N8nExecution[]> {
    try {
      const response = await this.circuitBreaker.execute(() =>
        withRetry(() =>
          this.client.get('/executions', {
            params: {
              filter: JSON.stringify({ workflowId }),
              limit,
            },
          })
        )
      );

      return response.data.data || response.data;
    } catch (error: any) {
      logger.error('Failed to fetch workflow executions', error, { workflowId });
      throw new Error(`Failed to fetch workflow executions: ${error.message}`);
    }
  }

  /**
   * Delete/stop a running execution
   */
  async stopExecution(executionId: string): Promise<void> {
    try {
      await this.circuitBreaker.execute(() =>
        withRetry(() => this.client.post(`/executions/${executionId}/stop`))
      );

      logger.info('Execution stopped', { executionId });
    } catch (error: any) {
      logger.error('Failed to stop execution', error, { executionId });
      throw new Error(`Failed to stop execution: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): WebhookValidationResult {
    if (!secret && !this.config.webhookSecret) {
      // If no secret is configured, skip validation
      return { valid: true };
    }

    const webhookSecret = secret || this.config.webhookSecret!;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      const valid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!valid) {
        logger.warn('Invalid webhook signature');
      }

      return { valid };
    } catch (error: any) {
      logger.error('Webhook signature validation failed', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse and validate webhook payload
   */
  parseWebhookPayload(payload: any): N8nWebhookPayload {
    // Validate required fields
    if (!payload.workflowId) {
      throw new Error('Missing workflowId in webhook payload');
    }

    if (!payload.executionId) {
      throw new Error('Missing executionId in webhook payload');
    }

    return {
      workflowId: payload.workflowId,
      executionId: payload.executionId,
      data: payload.data || {},
      mode: payload.mode || 'webhook',
      startedAt: payload.startedAt || new Date().toISOString(),
      stoppedAt: payload.stoppedAt,
      status: payload.status || 'running',
    };
  }

  /**
   * Get circuit breaker stats
   */
  getCircuitBreakerStats() {
    return this.circuitBreaker.getStats();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.reset();
  }
}

/**
 * Create n8n connector instance from environment or config
 */
export function createN8nConnector(config?: Partial<N8nConfig>): N8nConnector | null {
  const baseUrl = config?.baseUrl || process.env.N8N_URL;
  const apiKey = config?.apiKey || process.env.N8N_API_KEY;
  const webhookSecret = config?.webhookSecret || process.env.N8N_WEBHOOK_SECRET;

  if (!baseUrl || !apiKey) {
    logger.warn('n8n configuration missing - N8N_URL and N8N_API_KEY required');
    return null;
  }

  // Ensure baseUrl ends with /api/v1
  let normalizedUrl = baseUrl.replace(/\/$/, '');
  if (!normalizedUrl.includes('/api/v1')) {
    normalizedUrl = `${normalizedUrl}/api/v1`;
  }

  return new N8nConnector({
    baseUrl: normalizedUrl,
    apiKey,
    webhookSecret,
  });
}

/**
 * Workflow Execution Engine
 * Manages workflow executions with database persistence and retry logic
 */
export class WorkflowExecutionEngine {
  private connector: N8nConnector;
  private circuitBreaker: CircuitBreaker;

  constructor(connector: N8nConnector) {
    this.connector = connector;
    this.circuitBreaker = new CircuitBreaker('workflow-execution', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 120000, // 2 minutes
    });
  }

  /**
   * Execute a workflow with full logging and retry support
   */
  async executeWorkflow(
    workflowId: string,
    workflowName: string,
    triggerType: 'scheduled' | 'manual' | 'webhook' | 'event',
    inputData?: any
  ): Promise<string> {
    const startTime = Date.now();

    // Create execution record
    const [execution] = await db.insert(workflowExecutions).values({
      workflowId,
      workflowName,
      status: 'running',
      triggerType,
      inputData,
      startedAt: new Date(),
    }).returning();

    logger.info('Starting workflow execution', {
      executionId: execution.id,
      workflowId,
      workflowName,
      triggerType,
    });

    try {
      // Execute workflow through circuit breaker
      const result = await this.circuitBreaker.execute(async () => {
        return await withRetry(
          () => this.connector.triggerWorkflow({
            workflowId,
            data: inputData,
            waitForExecution: true,
          }),
          {
            maxAttempts: 3,
            baseDelayMs: 2000,
            maxDelayMs: 10000,
            shouldRetry: (error, attempt) => {
              // Don't retry on auth errors or not found
              if (error.message?.includes('authentication') || error.message?.includes('not found')) {
                return false;
              }
              return attempt < 3;
            },
            onRetry: (error, attempt, delayMs) => {
              logger.warn('Retrying workflow execution', {
                executionId: execution.id,
                attempt,
                delayMs,
                error: error.message,
              });

              // Update retry count in database
              db.update(workflowExecutions)
                .set({ retryCount: attempt })
                .where(eq(workflowExecutions.id, execution.id))
                .execute();
            },
          }
        );
      });

      // Update execution as completed
      const durationMs = Date.now() - startTime;
      await db.update(workflowExecutions)
        .set({
          status: 'completed',
          outputData: result.data || result,
          endedAt: new Date(),
          durationMs,
        })
        .where(eq(workflowExecutions.id, execution.id));

      logger.info('Workflow execution completed', {
        executionId: execution.id,
        durationMs,
      });

      recordMetric('workflow.execution.success', 1, {
        workflowId,
        triggerType,
        durationMs: String(durationMs),
      });

      return execution.id;

    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      // Update execution as failed
      await db.update(workflowExecutions)
        .set({
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
          endedAt: new Date(),
          durationMs,
        })
        .where(eq(workflowExecutions.id, execution.id));

      logger.error('Workflow execution failed', error, {
        executionId: execution.id,
        workflowId,
        durationMs,
      });

      trackError(error, {
        operation: 'executeWorkflow',
        executionId: execution.id,
        workflowId,
        triggerType,
      });

      recordMetric('workflow.execution.failure', 1, {
        workflowId,
        triggerType,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Get execution status from database
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.id, executionId))
      .limit(1);

    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    return execution;
  }

  /**
   * List executions with filters
   */
  async listExecutions(filters?: {
    workflowId?: string;
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = db.select().from(workflowExecutions);

    if (filters?.workflowId) {
      query = query.where(eq(workflowExecutions.workflowId, filters.workflowId)) as any;
    }

    if (filters?.status) {
      query = query.where(eq(workflowExecutions.status, filters.status)) as any;
    }

    const executions = await query
      .orderBy(sql`${workflowExecutions.startedAt} DESC`)
      .limit(filters?.limit || 100);

    return executions;
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.id, executionId))
      .limit(1);

    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'running') {
      throw new Error(`Execution is not running (status: ${execution.status})`);
    }

    // Try to stop the execution in n8n
    try {
      // Note: executionId here is our DB ID, we need the n8n execution ID
      // In a real implementation, we'd store the n8n execution ID
      // For now, just mark as cancelled in our DB
      await db.update(workflowExecutions)
        .set({
          status: 'cancelled',
          endedAt: new Date(),
          durationMs: sql`EXTRACT(EPOCH FROM (NOW() - ${workflowExecutions.startedAt})) * 1000`,
        })
        .where(eq(workflowExecutions.id, executionId));

      logger.info('Execution cancelled', { executionId });
    } catch (error: any) {
      logger.error('Failed to cancel execution', error, { executionId });
      throw error;
    }
  }

  /**
   * Get circuit breaker stats
   */
  getCircuitBreakerStats() {
    return this.circuitBreaker.getStats();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.reset();
  }
}

/**
 * Singleton instance
 */
let n8nInstance: N8nConnector | null = null;
let executionEngineInstance: WorkflowExecutionEngine | null = null;

export function getN8nConnector(): N8nConnector | null {
  if (!n8nInstance) {
    n8nInstance = createN8nConnector();
  }
  return n8nInstance;
}

export function setN8nConnector(connector: N8nConnector | null): void {
  n8nInstance = connector;
  executionEngineInstance = connector ? new WorkflowExecutionEngine(connector) : null;
}

export function getWorkflowExecutionEngine(): WorkflowExecutionEngine | null {
  const connector = getN8nConnector();
  if (!connector) return null;

  if (!executionEngineInstance) {
    executionEngineInstance = new WorkflowExecutionEngine(connector);
  }
  return executionEngineInstance;
}
