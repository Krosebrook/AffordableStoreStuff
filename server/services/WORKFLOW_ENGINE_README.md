# Workflow Automation Engine Documentation

## Overview

The Workflow Automation Engine provides a comprehensive solution for automating business processes across multiple platforms. Built for Phase 1.4 of the roadmap, it integrates with n8n for workflow execution and provides a rich template library, trigger system, and execution monitoring.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Service Layer                    │
├─────────────────────────────────────────────────────────────┤
│  • Template Library                                          │
│  • Trigger Management (Scheduled, Webhook, Event)            │
│  • Execution Logging & Debugging                             │
│  • Retry Mechanisms with Exponential Backoff                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  n8n Connector & Execution Engine            │
├─────────────────────────────────────────────────────────────┤
│  • n8n Webhook Integration                                   │
│  • Workflow Execution using workflowExecutions table         │
│  • Circuit Breaker for Failed Workflows                      │
│  • Database Persistence                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         n8n Platform                         │
├─────────────────────────────────────────────────────────────┤
│  • Workflow Nodes & Connections                              │
│  • Built-in Integrations                                     │
│  • Execution Environment                                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Template Library
Pre-built workflow templates for common automation scenarios:
- **Product → Printify → Etsy**: Complete publishing pipeline
- **Scheduled Inventory Sync**: Hourly inventory synchronization
- **AI Content Generation**: Automated content creation
- **Order Fulfillment**: Automatic order processing
- **Bulk Product Publisher**: Multi-platform publishing

### 2. Trigger System
Three types of workflow triggers:
- **Scheduled**: Cron-based execution (e.g., hourly, daily)
- **Webhook**: HTTP endpoint triggers
- **Event**: Application event-based triggers

### 3. Execution Management
- Real-time execution status tracking
- Detailed logging and debugging
- Automatic retries with exponential backoff
- Circuit breaker for fault tolerance

### 4. Resilience Features
- **Circuit Breaker**: Prevents cascade failures
- **Retry Logic**: Automatic retry with backoff
- **Error Tracking**: Comprehensive error logging
- **Metrics**: Performance and success rate tracking

## Installation & Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# n8n Configuration
N8N_URL=https://your-n8n-instance.com
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_SECRET=your_webhook_secret

# Platform Credentials
PRINTIFY_API_KEY=your_printify_key
PRINTIFY_SHOP_ID=your_shop_id
ETSY_API_KEY=your_etsy_key
ETSY_SHOP_ID=your_shop_id
```

### 2. Database Schema

The `workflowExecutions` table is already defined in `shared/schema.ts`:

```typescript
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: text("workflow_id").notNull(),
  workflowName: text("workflow_name"),
  status: text("status").default("running").notNull(),
  triggerType: text("trigger_type"),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationMs: integer("duration_ms"),
});
```

### 3. Initialize Services

```typescript
import { getWorkflowService } from './services/workflow-service';
import { getN8nConnector, setN8nConnector } from './integrations/n8n-connector';

// Initialize n8n connector
const connector = getN8nConnector();
if (connector) {
  console.log('n8n connector initialized');
} else {
  console.warn('n8n not configured - workflow automation disabled');
}

// Get workflow service (auto-initializes)
const workflowService = getWorkflowService();
console.log('Workflow service ready with', workflowService.getTemplates().length, 'templates');
```

## Usage Examples

### Example 1: Execute a Workflow Template

```typescript
import { getWorkflowService } from './services/workflow-service';

const workflowService = getWorkflowService();

// Execute Product → Printify → Etsy workflow
const executionId = await workflowService.executeFromTemplate(
  'product-to-printify-to-etsy',
  {
    productTitle: 'Awesome T-Shirt Design',
    productDescription: 'A beautifully designed t-shirt for creative minds.',
    price: 29.99,
    designUrl: 'https://example.com/design.png',
    tags: 'tshirt,creative,design,art',
    category: 'apparel',
  }
);

console.log('Workflow started:', executionId);

// Check execution status
const execution = await workflowService.getExecutionLogs(executionId);
console.log('Status:', execution.execution.status);
```

### Example 2: Register a Scheduled Trigger

```typescript
import { getWorkflowService } from './services/workflow-service';

const workflowService = getWorkflowService();

// Schedule inventory sync every hour
workflowService.registerTrigger({
  id: 'hourly-inventory-sync',
  workflowId: 'scheduled-inventory-sync',
  type: 'scheduled',
  config: {
    cron: '0 * * * *', // Every hour at minute 0
    timezone: 'America/New_York',
    maxRetries: 3,
  },
  enabled: true,
});

console.log('Scheduled trigger registered');
```

### Example 3: Register a Webhook Trigger

```typescript
import { getWorkflowService } from './services/workflow-service';
import express from 'express';

const app = express();
const workflowService = getWorkflowService();

// Register webhook trigger
workflowService.registerTrigger({
  id: 'product-created-webhook',
  workflowId: 'product-created-webhook',
  type: 'webhook',
  config: {
    path: '/webhooks/product-created',
    method: 'POST',
    secret: 'your-webhook-secret',
    validateSignature: true,
  },
  enabled: true,
});

// Handle webhook in Express
app.post('/webhooks/product-created', async (req, res) => {
  try {
    await workflowService.emitEvent('product.created', req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Example 4: Register an Event Trigger

```typescript
import { getWorkflowService } from './services/workflow-service';

const workflowService = getWorkflowService();

// Trigger workflow when order is completed
workflowService.registerTrigger({
  id: 'order-completed-trigger',
  workflowId: 'order-fulfillment-automation',
  type: 'event',
  config: {
    eventType: 'order.completed',
    filters: {
      status: 'paid',
      platform: 'etsy',
    },
  },
  enabled: true,
});

// Emit event in your application code
async function processOrder(order) {
  // ... process order logic ...

  // Emit event to trigger workflows
  await workflowService.emitEvent('order.completed', {
    orderId: order.id,
    status: 'paid',
    platform: 'etsy',
    customerEmail: order.customerEmail,
  });
}
```

### Example 5: Custom Workflow Template

```typescript
import { getWorkflowService } from './services/workflow-service';
import type { WorkflowTemplate } from './services/workflow-service';

const customTemplate: WorkflowTemplate = {
  id: 'custom-notification-flow',
  name: 'Custom Notification Flow',
  description: 'Send notifications to multiple channels',
  category: 'custom',
  tags: ['notification', 'email', 'slack'],
  requiredInputs: ['message', 'recipients'],
  optionalInputs: ['channels'],
  triggerType: 'manual',
  version: '1.0.0',
  icon: 'bell',
  color: '#FFA500',
  nodes: [
    // Define your custom nodes here
  ],
  connections: {
    // Define connections
  },
  settings: {},
};

const workflowService = getWorkflowService();
workflowService.registerTemplate(customTemplate);

console.log('Custom template registered');
```

### Example 6: Monitor Workflow Execution

```typescript
import { getWorkflowService, getWorkflowExecutionEngine } from './services/workflow-service';

const workflowService = getWorkflowService();
const executionEngine = getWorkflowExecutionEngine();

// Execute workflow
const executionId = await workflowService.executeFromTemplate(
  'product-to-printify-to-etsy',
  inputData
);

// Poll for completion (or use webhooks)
const pollInterval = setInterval(async () => {
  const execution = await executionEngine.getExecutionStatus(executionId);

  console.log('Status:', execution.status);

  if (execution.status === 'completed') {
    console.log('Workflow completed!');
    console.log('Duration:', execution.durationMs, 'ms');
    console.log('Output:', execution.outputData);
    clearInterval(pollInterval);
  } else if (execution.status === 'failed') {
    console.error('Workflow failed:', execution.errorMessage);
    clearInterval(pollInterval);
  }
}, 5000); // Check every 5 seconds
```

### Example 7: Get Workflow Statistics

```typescript
import { getWorkflowService } from './services/workflow-service';

const workflowService = getWorkflowService();

// Get stats for all workflows
const allStats = await workflowService.getWorkflowStats();
console.log('Total executions:', allStats.total);
console.log('Success rate:', (allStats.completed / allStats.total * 100).toFixed(2), '%');
console.log('Average duration:', allStats.avgDuration.toFixed(0), 'ms');

// Get stats for specific workflow
const workflowStats = await workflowService.getWorkflowStats('product-to-printify-to-etsy');
console.log('Workflow stats:', workflowStats);
```

## API Endpoints

### List Templates
```bash
GET /api/workflows/templates
Query params: ?category=publishing&tags=automation&search=product
```

### Execute Workflow
```bash
POST /api/workflows/execute
Body: {
  "templateId": "product-to-printify-to-etsy",
  "inputData": {
    "productTitle": "Awesome Product",
    "price": 29.99,
    ...
  },
  "triggerType": "manual"
}
```

### Get Execution Status
```bash
GET /api/workflows/executions/:executionId
```

### List Executions
```bash
GET /api/workflows/executions
Query params: ?workflowId=xxx&status=completed&limit=50
```

### Cancel Execution
```bash
POST /api/workflows/executions/:executionId/cancel
```

### Get Statistics
```bash
GET /api/workflows/stats
Query params: ?workflowId=xxx
```

### Register Trigger
```bash
POST /api/workflows/triggers
Body: {
  "workflowId": "scheduled-inventory-sync",
  "type": "scheduled",
  "config": {
    "cron": "0 * * * *"
  }
}
```

### Health Check
```bash
GET /api/workflows/health
```

## Best Practices

### 1. Error Handling
Always handle errors gracefully:

```typescript
try {
  const executionId = await workflowService.executeFromTemplate(
    templateId,
    inputData
  );
} catch (error) {
  if (error.message.includes('Missing required inputs')) {
    // Handle validation error
  } else if (error.message.includes('Circuit breaker is open')) {
    // Service temporarily unavailable
  } else {
    // Other errors
  }
}
```

### 2. Input Validation
Validate inputs before execution:

```typescript
const template = workflowService.getTemplate(templateId);

// Check required inputs
const missingInputs = template.requiredInputs.filter(
  input => !(input in inputData)
);

if (missingInputs.length > 0) {
  throw new Error(`Missing required inputs: ${missingInputs.join(', ')}`);
}
```

### 3. Monitoring & Alerting
Monitor execution metrics:

```typescript
// Set up periodic monitoring
setInterval(async () => {
  const stats = await workflowService.getWorkflowStats();

  const failureRate = stats.failed / stats.total;
  if (failureRate > 0.1) { // More than 10% failures
    console.error('High failure rate detected:', failureRate);
    // Send alert
  }
}, 60000); // Every minute
```

### 4. Cleanup
Clean up old executions periodically:

```typescript
import { getWorkflowService } from './services/workflow-service';

// Clean up executions older than 30 days
const workflowService = getWorkflowService();
const deletedCount = await workflowService.cleanupOldExecutions(30);
console.log('Cleaned up', deletedCount, 'old executions');
```

## Troubleshooting

### Issue: "Workflow execution engine not available"
**Solution**: Check that n8n is properly configured with `N8N_URL` and `N8N_API_KEY` environment variables.

### Issue: "Circuit breaker is open"
**Solution**: The circuit breaker has detected multiple failures. Wait for the timeout period or reset manually:

```typescript
const executionEngine = getWorkflowExecutionEngine();
executionEngine.resetCircuitBreaker();
```

### Issue: Workflow executions timing out
**Solution**: Increase the circuit breaker timeout:

```typescript
// In n8n-connector.ts
this.circuitBreaker = new CircuitBreaker('workflow-execution', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 300000, // 5 minutes
});
```

### Issue: Missing n8n execution data
**Solution**: Ensure n8n API is accessible and credentials are correct. Test connection:

```typescript
const connector = getN8nConnector();
const result = await connector.testConnection();
console.log('Connection test:', result);
```

## Performance Considerations

1. **Batch Processing**: Use the bulk publisher template for multiple products
2. **Rate Limiting**: n8n connector includes built-in rate limiting
3. **Caching**: Consider caching workflow templates
4. **Database Indexes**: Ensure indexes on `workflowExecutions` table
5. **Cleanup**: Regularly clean up old executions to prevent database bloat

## Security

1. **API Keys**: Store credentials securely in environment variables
2. **Webhook Secrets**: Use webhook signature validation
3. **Input Sanitization**: Validate and sanitize all workflow inputs
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Audit Logging**: All executions are logged in the database

## Future Enhancements

- [ ] Visual workflow builder UI
- [ ] Workflow versioning
- [ ] A/B testing for workflows
- [ ] Conditional branching in templates
- [ ] Workflow marketplace
- [ ] Real-time execution monitoring
- [ ] Workflow cost tracking
- [ ] Approval workflows
- [ ] SLA monitoring
- [ ] Multi-tenancy support

## Support

For issues or questions:
- Check the logs: `server/logs/workflow-service.log`
- Review execution history: `GET /api/workflows/executions`
- Check circuit breaker status: `GET /api/workflows/health`
- Contact: support@flashfusion.com

## License

Internal use only - FlashFusion Platform
