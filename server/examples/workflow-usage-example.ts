/**
 * Workflow Automation Engine - Usage Examples
 * Demonstrates how to integrate and use the workflow automation engine
 *
 * This file contains practical examples for:
 * - Executing workflow templates
 * - Registering triggers
 * - Monitoring executions
 * - Handling events
 * - Custom workflows
 */

import { getWorkflowService } from '../services/workflow-service';
import { getWorkflowExecutionEngine, getN8nConnector } from '../integrations/n8n-connector';
import type { WorkflowTemplate } from '../services/workflow-service';

/**
 * Example 1: Basic Workflow Execution
 * Execute a pre-built template with input data
 */
export async function example1_BasicExecution() {
  console.log('\n=== Example 1: Basic Workflow Execution ===\n');

  const workflowService = getWorkflowService();

  try {
    // Execute Product → Printify → Etsy workflow
    const executionId = await workflowService.executeFromTemplate(
      'product-to-printify-to-etsy',
      {
        productTitle: 'Mountain Landscape T-Shirt',
        productDescription:
          'Beautiful mountain landscape design perfect for nature lovers. High-quality print on comfortable cotton.',
        price: 29.99,
        designUrl: 'https://example.com/designs/mountain-landscape.png',
        tags: 'tshirt,nature,mountain,landscape,outdoor',
        category: 'apparel',
        quantity: 999,
      }
    );

    console.log('✓ Workflow execution started');
    console.log('  Execution ID:', executionId);

    // Wait a moment and check status
    await new Promise(resolve => setTimeout(resolve, 2000));

    const execution = await workflowService.getExecutionLogs(executionId);
    console.log('  Status:', execution.execution.status);
    console.log('  Started:', execution.execution.startedAt);

    return executionId;
  } catch (error: any) {
    console.error('✗ Workflow execution failed:', error.message);
    throw error;
  }
}

/**
 * Example 2: Scheduled Workflow
 * Set up a workflow to run on a schedule
 */
export async function example2_ScheduledWorkflow() {
  console.log('\n=== Example 2: Scheduled Workflow ===\n');

  const workflowService = getWorkflowService();

  try {
    // Register a scheduled trigger for inventory sync
    workflowService.registerTrigger({
      id: 'daily-inventory-sync',
      workflowId: 'scheduled-inventory-sync',
      type: 'scheduled',
      config: {
        cron: '0 2 * * *', // Every day at 2 AM
        timezone: 'America/New_York',
        maxRetries: 3,
      },
      enabled: true,
    });

    console.log('✓ Scheduled trigger registered');
    console.log('  Schedule: Every day at 2 AM EST');
    console.log('  Workflow: Inventory Sync');
    console.log('  Max retries: 3');

    // List all triggers
    const triggers = workflowService.getTriggers({ type: 'scheduled' });
    console.log('\n  Active scheduled triggers:', triggers.length);
    triggers.forEach(t => {
      console.log(`    - ${t.id} (${t.enabled ? 'enabled' : 'disabled'})`);
    });
  } catch (error: any) {
    console.error('✗ Failed to register scheduled trigger:', error.message);
    throw error;
  }
}

/**
 * Example 3: Event-Driven Workflow
 * Trigger workflows based on application events
 */
export async function example3_EventDrivenWorkflow() {
  console.log('\n=== Example 3: Event-Driven Workflow ===\n');

  const workflowService = getWorkflowService();

  try {
    // Register event trigger for order completion
    workflowService.registerTrigger({
      id: 'order-completed-fulfillment',
      workflowId: 'order-fulfillment-automation',
      type: 'event',
      config: {
        eventType: 'order.completed',
        filters: {
          status: 'paid',
        },
      },
      enabled: true,
    });

    console.log('✓ Event trigger registered');
    console.log('  Event: order.completed');
    console.log('  Filters: status=paid');

    // Simulate an order completion event
    console.log('\n  Simulating order completion...');
    await workflowService.emitEvent('order.completed', {
      orderId: 'ORD-12345',
      status: 'paid',
      platform: 'etsy',
      customerEmail: 'customer@example.com',
      items: [
        { productId: 'PROD-001', quantity: 2, price: 29.99 },
      ],
      total: 59.98,
    });

    console.log('✓ Event emitted - workflow should execute');
  } catch (error: any) {
    console.error('✗ Event trigger failed:', error.message);
    throw error;
  }
}

/**
 * Example 4: Monitor Workflow Execution
 * Track workflow progress and handle results
 */
export async function example4_MonitorExecution(executionId: string) {
  console.log('\n=== Example 4: Monitor Workflow Execution ===\n');

  const workflowService = getWorkflowService();
  const executionEngine = getWorkflowExecutionEngine();

  if (!executionEngine) {
    throw new Error('Execution engine not available');
  }

  try {
    console.log('Monitoring execution:', executionId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 20; // 100 seconds max

    while (attempts < maxAttempts) {
      const execution = await executionEngine.getExecutionStatus(executionId);

      console.log(`  [${attempts + 1}] Status: ${execution.status}`);

      if (execution.status === 'completed') {
        console.log('\n✓ Workflow completed successfully!');
        console.log('  Duration:', execution.durationMs, 'ms');
        console.log('  Retry count:', execution.retryCount);
        if (execution.outputData) {
          console.log('  Output:', JSON.stringify(execution.outputData, null, 2));
        }
        return execution;
      } else if (execution.status === 'failed') {
        console.error('\n✗ Workflow failed!');
        console.error('  Error:', execution.errorMessage);
        console.error('  Duration:', execution.durationMs, 'ms');
        console.error('  Retry count:', execution.retryCount);
        throw new Error(execution.errorMessage || 'Workflow failed');
      } else if (execution.status === 'cancelled') {
        console.log('\n⚠ Workflow was cancelled');
        return execution;
      }

      // Still running, wait and retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    console.log('\n⚠ Monitoring timeout reached');
    throw new Error('Workflow monitoring timeout');
  } catch (error: any) {
    console.error('✗ Monitoring failed:', error.message);
    throw error;
  }
}

/**
 * Example 5: AI Content Generation Workflow
 * Generate product content using AI
 */
export async function example5_AIContentGeneration() {
  console.log('\n=== Example 5: AI Content Generation ===\n');

  const workflowService = getWorkflowService();

  try {
    // Execute AI content generation workflow
    const executionId = await workflowService.executeFromTemplate(
      'ai-content-generation',
      {
        productConcept: 'Eco-friendly bamboo water bottle with custom engravings',
        targetAudience: 'environmentally conscious millennials and gen-z',
        brandVoice: 'friendly, inspiring, eco-conscious',
        stylePreference: 'clean product photography with natural lighting',
        keywords: 'eco-friendly,sustainable,bamboo,reusable,custom',
      }
    );

    console.log('✓ AI content generation started');
    console.log('  Execution ID:', executionId);
    console.log('  This workflow will:');
    console.log('    1. Generate compelling product title');
    console.log('    2. Create detailed product description');
    console.log('    3. Generate SEO-optimized tags');
    console.log('    4. Create product image using AI');
    console.log('    5. Save to content library');

    return executionId;
  } catch (error: any) {
    console.error('✗ AI content generation failed:', error.message);
    throw error;
  }
}

/**
 * Example 6: Bulk Product Publishing
 * Publish multiple products at once
 */
export async function example6_BulkPublishing() {
  console.log('\n=== Example 6: Bulk Product Publishing ===\n');

  const workflowService = getWorkflowService();

  try {
    const products = [
      {
        title: 'Mountain Sunrise Mug',
        description: 'Start your day with a beautiful mountain sunrise view',
        price: 15.99,
        designUrl: 'https://example.com/designs/mountain-sunrise.png',
        tags: 'mug,coffee,mountain,sunrise',
      },
      {
        title: 'Ocean Waves Tote Bag',
        description: 'Carry the ocean with you wherever you go',
        price: 19.99,
        designUrl: 'https://example.com/designs/ocean-waves.png',
        tags: 'tote,bag,ocean,waves',
      },
      {
        title: 'Forest Path Poster',
        description: 'Bring nature into your home with this serene forest path',
        price: 24.99,
        designUrl: 'https://example.com/designs/forest-path.png',
        tags: 'poster,forest,nature,art',
      },
    ];

    // Execute bulk publisher workflow
    const executionId = await workflowService.executeFromTemplate(
      'bulk-product-publisher',
      {
        products,
        platforms: ['printify', 'etsy'],
        validateFirst: true,
      }
    );

    console.log('✓ Bulk publishing started');
    console.log('  Products:', products.length);
    console.log('  Platforms: Printify, Etsy');
    console.log('  Execution ID:', executionId);

    return executionId;
  } catch (error: any) {
    console.error('✗ Bulk publishing failed:', error.message);
    throw error;
  }
}

/**
 * Example 7: Get Workflow Statistics
 * Analyze workflow performance
 */
export async function example7_WorkflowStatistics() {
  console.log('\n=== Example 7: Workflow Statistics ===\n');

  const workflowService = getWorkflowService();

  try {
    // Get overall statistics
    const overallStats = await workflowService.getWorkflowStats();

    console.log('Overall Workflow Statistics:');
    console.log('  Total executions:', overallStats.total);
    console.log('  Completed:', overallStats.completed);
    console.log('  Failed:', overallStats.failed);
    console.log('  Running:', overallStats.running);
    console.log('  Cancelled:', overallStats.cancelled);
    console.log('  Success rate:', ((overallStats.completed / overallStats.total) * 100).toFixed(2), '%');
    console.log('  Average duration:', overallStats.avgDuration.toFixed(0), 'ms');
    console.log('  Total retries:', overallStats.totalRetries);

    // Get stats for specific workflow
    console.log('\nProduct Publishing Workflow:');
    const publishingStats = await workflowService.getWorkflowStats('product-to-printify-to-etsy');
    console.log('  Executions:', publishingStats.total);
    console.log('  Success rate:', ((publishingStats.completed / publishingStats.total) * 100).toFixed(2), '%');
    console.log('  Avg duration:', publishingStats.avgDuration.toFixed(0), 'ms');

    return { overallStats, publishingStats };
  } catch (error: any) {
    console.error('✗ Failed to get statistics:', error.message);
    throw error;
  }
}

/**
 * Example 8: Custom Workflow Template
 * Create and register a custom workflow
 */
export async function example8_CustomWorkflow() {
  console.log('\n=== Example 8: Custom Workflow Template ===\n');

  const workflowService = getWorkflowService();

  try {
    // Define custom template
    const customTemplate: WorkflowTemplate = {
      id: 'custom-social-media-post',
      name: 'Custom Social Media Post',
      description: 'Post product to Instagram, Facebook, and TikTok',
      category: 'marketing',
      tags: ['social', 'instagram', 'facebook', 'tiktok', 'custom'],
      requiredInputs: ['caption', 'imageUrl'],
      optionalInputs: ['hashtags', 'platforms'],
      triggerType: 'manual',
      version: '1.0.0',
      icon: 'share-2',
      color: '#E1306C',
      author: 'Custom User',
      popularity: 0,
      nodes: [
        {
          id: 'trigger',
          type: 'n8n-nodes-base.manualTrigger',
          name: 'Manual Trigger',
          position: [250, 300],
        },
        {
          id: 'instagram-post',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Post to Instagram',
          position: [450, 250],
        },
        {
          id: 'facebook-post',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Post to Facebook',
          position: [450, 350],
        },
        {
          id: 'tiktok-post',
          type: 'n8n-nodes-base.httpRequest',
          name: 'Post to TikTok',
          position: [450, 450],
        },
      ],
      connections: {
        trigger: {
          main: [
            [
              { node: 'instagram-post', type: 'main', index: 0 },
              { node: 'facebook-post', type: 'main', index: 0 },
              { node: 'tiktok-post', type: 'main', index: 0 },
            ],
          ],
        },
      },
      settings: {},
    };

    // Register custom template
    workflowService.registerTemplate(customTemplate);

    console.log('✓ Custom template registered');
    console.log('  Template ID:', customTemplate.id);
    console.log('  Name:', customTemplate.name);

    // Execute custom template
    const executionId = await workflowService.executeFromTemplate(
      customTemplate.id,
      {
        caption: 'Check out our new product! 🎉',
        imageUrl: 'https://example.com/product-image.jpg',
        hashtags: '#newproduct #exciting #shopping',
        platforms: ['instagram', 'facebook', 'tiktok'],
      }
    );

    console.log('✓ Custom workflow executed');
    console.log('  Execution ID:', executionId);

    return executionId;
  } catch (error: any) {
    console.error('✗ Custom workflow failed:', error.message);
    throw error;
  }
}

/**
 * Example 9: Error Handling and Recovery
 * Handle workflow failures gracefully
 */
export async function example9_ErrorHandling() {
  console.log('\n=== Example 9: Error Handling and Recovery ===\n');

  const workflowService = getWorkflowService();
  const executionEngine = getWorkflowExecutionEngine();

  if (!executionEngine) {
    throw new Error('Execution engine not available');
  }

  try {
    // Try to execute with invalid input (missing required field)
    console.log('Attempting to execute with invalid input...');

    try {
      await workflowService.executeFromTemplate('product-to-printify-to-etsy', {
        // Missing required 'productTitle'
        price: 29.99,
      });
    } catch (error: any) {
      console.log('✓ Validation error caught correctly:', error.message);
    }

    // Execute valid workflow
    const executionId = await workflowService.executeFromTemplate(
      'product-to-printify-to-etsy',
      {
        productTitle: 'Test Product',
        productDescription: 'Test description for error handling demo',
        price: 29.99,
        designUrl: 'https://example.com/design.png',
      }
    );

    console.log('\n✓ Workflow started with retry capability');
    console.log('  Execution ID:', executionId);

    // Simulate checking execution with retries
    const execution = await executionEngine.getExecutionStatus(executionId);
    console.log('  Status:', execution.status);
    console.log('  Retry count:', execution.retryCount);

    // Check circuit breaker stats
    const cbStats = executionEngine.getCircuitBreakerStats();
    console.log('\nCircuit Breaker Status:');
    console.log('  State:', cbStats.state);
    console.log('  Failure count:', cbStats.failureCount);
    console.log('  Success count:', cbStats.successCount);

    return executionId;
  } catch (error: any) {
    console.error('✗ Error handling demonstration failed:', error.message);
    throw error;
  }
}

/**
 * Example 10: Complete Integration Example
 * Full workflow from setup to execution to monitoring
 */
export async function example10_CompleteIntegration() {
  console.log('\n=== Example 10: Complete Integration Example ===\n');

  try {
    // 1. Check service health
    console.log('1. Checking service health...');
    const connector = getN8nConnector();
    if (!connector) {
      throw new Error('n8n connector not available - check configuration');
    }

    const connectionTest = await connector.testConnection();
    if (!connectionTest.success) {
      throw new Error('n8n connection failed: ' + connectionTest.error);
    }
    console.log('   ✓ n8n connected successfully');

    // 2. List available templates
    console.log('\n2. Loading workflow templates...');
    const workflowService = getWorkflowService();
    const templates = workflowService.getTemplates();
    console.log(`   ✓ ${templates.length} templates available`);

    // 3. Register event trigger
    console.log('\n3. Registering event trigger...');
    workflowService.registerTrigger({
      id: 'demo-product-created',
      workflowId: 'product-to-printify-to-etsy',
      type: 'event',
      config: {
        eventType: 'product.created',
      },
      enabled: true,
    });
    console.log('   ✓ Event trigger registered');

    // 4. Execute workflow
    console.log('\n4. Executing workflow...');
    const executionId = await workflowService.executeFromTemplate(
      'product-to-printify-to-etsy',
      {
        productTitle: 'Integration Demo Product',
        productDescription: 'Complete integration example product',
        price: 39.99,
        designUrl: 'https://example.com/demo-design.png',
        tags: 'demo,integration,test',
      }
    );
    console.log('   ✓ Workflow execution started:', executionId);

    // 5. Monitor execution
    console.log('\n5. Monitoring execution...');
    const executionEngine = getWorkflowExecutionEngine();
    if (executionEngine) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const execution = await executionEngine.getExecutionStatus(executionId);
      console.log('   Status:', execution.status);
    }

    // 6. Get statistics
    console.log('\n6. Fetching statistics...');
    const stats = await workflowService.getWorkflowStats();
    console.log('   Total executions:', stats.total);
    console.log('   Success rate:', ((stats.completed / stats.total) * 100).toFixed(2), '%');

    console.log('\n✓ Complete integration example finished successfully!');

    return { executionId, stats };
  } catch (error: any) {
    console.error('\n✗ Complete integration example failed:', error.message);
    throw error;
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Workflow Automation Engine - Usage Examples       ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    // Example 1: Basic execution
    const executionId1 = await example1_BasicExecution();

    // Example 2: Scheduled workflows
    await example2_ScheduledWorkflow();

    // Example 3: Event-driven workflows
    await example3_EventDrivenWorkflow();

    // Example 4: Monitor execution
    if (executionId1) {
      await example4_MonitorExecution(executionId1);
    }

    // Example 5: AI content generation
    await example5_AIContentGeneration();

    // Example 6: Bulk publishing
    await example6_BulkPublishing();

    // Example 7: Statistics
    await example7_WorkflowStatistics();

    // Example 8: Custom workflow
    await example8_CustomWorkflow();

    // Example 9: Error handling
    await example9_ErrorHandling();

    // Example 10: Complete integration
    await example10_CompleteIntegration();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║          All examples completed successfully!          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  } catch (error: any) {
    console.error('\n╔════════════════════════════════════════════════════════╗');
    console.error('║              Examples failed with error:               ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error(error);
  }
}

// Export for use in other files
export default {
  example1_BasicExecution,
  example2_ScheduledWorkflow,
  example3_EventDrivenWorkflow,
  example4_MonitorExecution,
  example5_AIContentGeneration,
  example6_BulkPublishing,
  example7_WorkflowStatistics,
  example8_CustomWorkflow,
  example9_ErrorHandling,
  example10_CompleteIntegration,
  runAllExamples,
};
