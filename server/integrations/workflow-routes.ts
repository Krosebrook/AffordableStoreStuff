/**
 * Workflow Automation API Routes
 * REST API endpoints for workflow management and execution
 *
 * Endpoints:
 * - GET /api/workflows/templates - List all workflow templates
 * - GET /api/workflows/templates/:id - Get specific template
 * - POST /api/workflows/execute - Execute a workflow from template
 * - GET /api/workflows/executions - List workflow executions
 * - GET /api/workflows/executions/:id - Get execution status
 * - POST /api/workflows/executions/:id/cancel - Cancel running execution
 * - GET /api/workflows/stats - Get workflow statistics
 * - POST /api/workflows/triggers - Register a workflow trigger
 * - DELETE /api/workflows/triggers/:id - Remove a trigger
 * - POST /api/workflows/events - Emit an event to trigger workflows
 */

import { Router, Request, Response } from 'express';
import { getWorkflowService } from '../services/workflow-service';
import { getWorkflowExecutionEngine } from './n8n-connector';
import { createLogger, trackError, recordMetric } from '../lib/observability';

const router = Router();
const logger = createLogger('WorkflowRoutes');

/**
 * List all workflow templates
 * GET /api/workflows/templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { category, tags, search } = req.query;

    const workflowService = getWorkflowService();
    const templates = workflowService.getTemplates({
      category: category as string,
      tags: tags ? (tags as string).split(',') : undefined,
      search: search as string,
    });

    recordMetric('workflow.templates.list', templates.length, {
      category: category as string || 'all',
    });

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error: any) {
    logger.error('Failed to list templates', error);
    trackError(error, { operation: 'listTemplates' });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list templates',
    });
  }
});

/**
 * Get specific workflow template
 * GET /api/workflows/templates/:id
 */
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workflowService = getWorkflowService();
    const template = workflowService.getTemplate(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: `Template ${id} not found`,
      });
    }

    recordMetric('workflow.template.view', 1, { templateId: id });

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    logger.error('Failed to get template', error, { templateId: req.params.id });
    trackError(error, { operation: 'getTemplate', templateId: req.params.id });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get template',
    });
  }
});

/**
 * Execute a workflow from template
 * POST /api/workflows/execute
 * Body: { templateId, inputData, triggerType? }
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { templateId, inputData, triggerType = 'manual' } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'templateId is required',
      });
    }

    const workflowService = getWorkflowService();
    const executionId = await workflowService.executeFromTemplate(
      templateId,
      inputData,
      triggerType
    );

    logger.info('Workflow executed', { templateId, executionId });

    res.json({
      success: true,
      data: {
        executionId,
        message: 'Workflow execution started',
      },
    });
  } catch (error: any) {
    logger.error('Failed to execute workflow', error, {
      templateId: req.body.templateId,
    });
    trackError(error, { operation: 'executeWorkflow', templateId: req.body.templateId });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute workflow',
    });
  }
});

/**
 * List workflow executions
 * GET /api/workflows/executions
 * Query params: workflowId?, status?, limit?
 */
router.get('/executions', async (req: Request, res: Response) => {
  try {
    const { workflowId, status, limit } = req.query;

    const executionEngine = getWorkflowExecutionEngine();
    if (!executionEngine) {
      return res.status(503).json({
        success: false,
        error: 'Workflow execution engine not available',
      });
    }

    const executions = await executionEngine.listExecutions({
      workflowId: workflowId as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    recordMetric('workflow.executions.list', executions.length, {
      workflowId: workflowId as string || 'all',
    });

    res.json({
      success: true,
      data: executions,
      count: executions.length,
    });
  } catch (error: any) {
    logger.error('Failed to list executions', error);
    trackError(error, { operation: 'listExecutions' });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list executions',
    });
  }
});

/**
 * Get execution status and logs
 * GET /api/workflows/executions/:id
 */
router.get('/executions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workflowService = getWorkflowService();
    const executionData = await workflowService.getExecutionLogs(id);

    recordMetric('workflow.execution.view', 1, { executionId: id });

    res.json({
      success: true,
      data: executionData,
    });
  } catch (error: any) {
    logger.error('Failed to get execution', error, { executionId: req.params.id });
    trackError(error, { operation: 'getExecution', executionId: req.params.id });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get execution',
    });
  }
});

/**
 * Cancel a running execution
 * POST /api/workflows/executions/:id/cancel
 */
router.post('/executions/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const executionEngine = getWorkflowExecutionEngine();
    if (!executionEngine) {
      return res.status(503).json({
        success: false,
        error: 'Workflow execution engine not available',
      });
    }

    await executionEngine.cancelExecution(id);

    logger.info('Execution cancelled', { executionId: id });
    recordMetric('workflow.execution.cancelled', 1, { executionId: id });

    res.json({
      success: true,
      message: 'Execution cancelled successfully',
    });
  } catch (error: any) {
    logger.error('Failed to cancel execution', error, { executionId: req.params.id });
    trackError(error, { operation: 'cancelExecution', executionId: req.params.id });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel execution',
    });
  }
});

/**
 * Get workflow statistics
 * GET /api/workflows/stats
 * Query params: workflowId?
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.query;

    const workflowService = getWorkflowService();
    const stats = await workflowService.getWorkflowStats(workflowId as string);

    recordMetric('workflow.stats.view', 1, { workflowId: workflowId as string || 'all' });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Failed to get workflow stats', error);
    trackError(error, { operation: 'getWorkflowStats' });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get workflow stats',
    });
  }
});

/**
 * Register a workflow trigger
 * POST /api/workflows/triggers
 * Body: { workflowId, type, config, enabled? }
 */
router.post('/triggers', async (req: Request, res: Response) => {
  try {
    const { workflowId, type, config, enabled = true } = req.body;

    if (!workflowId || !type || !config) {
      return res.status(400).json({
        success: false,
        error: 'workflowId, type, and config are required',
      });
    }

    const trigger = {
      id: `trigger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      workflowId,
      type,
      config,
      enabled,
    };

    const workflowService = getWorkflowService();
    workflowService.registerTrigger(trigger);

    logger.info('Trigger registered', { triggerId: trigger.id, type });
    recordMetric('workflow.trigger.registered', 1, { type });

    res.json({
      success: true,
      data: trigger,
      message: 'Trigger registered successfully',
    });
  } catch (error: any) {
    logger.error('Failed to register trigger', error);
    trackError(error, { operation: 'registerTrigger' });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register trigger',
    });
  }
});

/**
 * Disable a trigger
 * DELETE /api/workflows/triggers/:id
 */
router.delete('/triggers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workflowService = getWorkflowService();
    workflowService.disableTrigger(id);

    logger.info('Trigger disabled', { triggerId: id });
    recordMetric('workflow.trigger.disabled', 1, { triggerId: id });

    res.json({
      success: true,
      message: 'Trigger disabled successfully',
    });
  } catch (error: any) {
    logger.error('Failed to disable trigger', error, { triggerId: req.params.id });
    trackError(error, { operation: 'disableTrigger', triggerId: req.params.id });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to disable trigger',
    });
  }
});

/**
 * Emit an event to trigger workflows
 * POST /api/workflows/events
 * Body: { eventType, data }
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'eventType is required',
      });
    }

    const workflowService = getWorkflowService();
    await workflowService.emitEvent(eventType, data);

    logger.info('Event emitted', { eventType });
    recordMetric('workflow.event.emitted', 1, { eventType });

    res.json({
      success: true,
      message: 'Event emitted successfully',
    });
  } catch (error: any) {
    logger.error('Failed to emit event', error, { eventType: req.body.eventType });
    trackError(error, { operation: 'emitEvent', eventType: req.body.eventType });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to emit event',
    });
  }
});

/**
 * Health check endpoint
 * GET /api/workflows/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const executionEngine = getWorkflowExecutionEngine();
    const workflowService = getWorkflowService();

    const health = {
      status: 'healthy',
      executionEngineAvailable: !!executionEngine,
      templateCount: workflowService.getTemplates().length,
      circuitBreakerStats: executionEngine?.getCircuitBreakerStats(),
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error: any) {
    logger.error('Health check failed', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
    });
  }
});

export default router;
