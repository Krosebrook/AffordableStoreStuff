# Publishing Services Documentation

This directory contains services for managing multi-platform publishing operations.

## Overview

### Publishing Queue Service (`publishing-queue.ts`)

Manages the queue for publishing products to multiple platforms with automated retry logic, rate limiting, and status tracking.

#### Key Features

- **Queue Management**: Add products to publishing queue for one or multiple platforms
- **Automated Retry Logic**: Exponential backoff for failed publishing attempts (max 5 retries)
- **Rate Limiting**: Per-platform rate limits to avoid API throttling
- **Status Tracking**: Track publishing status (pending, processing, published, failed, rejected)
- **Priority Queuing**: Set priority levels (1-10) for queue processing order
- **Scheduled Publishing**: Schedule publications for future dates

#### Usage Example

```typescript
import { publishingQueueService } from './services/publishing-queue';

// Add single product to queue
const item = await publishingQueueService.addToQueue(
  'product-123',
  'printify',
  {
    priority: 8,
    scheduledFor: new Date('2024-12-25'),
    safeguardsPassed: true,
    trademarkCleared: true,
    qualityScore: 95
  }
);

// Add product to multiple platforms
const items = await publishingQueueService.addBatchToQueue(
  'product-123',
  ['printify', 'printful', 'etsy'],
  { priority: 7 }
);

// Get queue statistics
const stats = await publishingQueueService.getStats();

// Start automatic queue processing
publishingQueueService.startProcessing(30000); // Process every 30 seconds

// Process queue manually
const result = await publishingQueueService.processPendingItems();
```

#### Retry Configuration

- **Initial Delay**: 1 second
- **Maximum Delay**: 5 minutes
- **Backoff Multiplier**: 2x per retry
- **Maximum Retries**: 5 attempts

#### Platform Rate Limits (requests per minute)

- Printify: 60
- Printful: 120
- Etsy: 10
- Shopify: 40
- Amazon: 20
- Redbubble: 30
- Teespring: 20
- Default: 60

### Image Processing Service (`image-processing.ts`)

Handles image processing for POD platforms including resizing, format conversion, validation, and optimization.

#### Key Features

- **Platform-Specific Resizing**: Automatically resize images to meet platform requirements
- **Format Conversion**: Convert between PNG, JPG, WebP formats
- **Print Area Validation**: Validate design fits within print area
- **Design Placement Calculation**: Calculate exact placement coordinates
- **Batch Processing**: Process images for multiple platforms simultaneously
- **Quality Optimization**: Optimize images for web delivery

#### Usage Example

```typescript
import { imageProcessor } from './services/image-processing';

// Resize image for specific platform
const result = await imageProcessor.resizeForPlatform(
  'https://example.com/image.png',
  'printify',
  { width: 2400, height: 2400 }
);

// Convert image format
const converted = await imageProcessor.convertFormat(
  'https://example.com/image.png',
  { format: 'jpeg', quality: 90, compression: 85 }
);

// Validate print area
const validation = imageProcessor.validatePrintArea(
  { width: 12, height: 16, x: 0, y: 0, unit: 'in', dpi: 300 },
  'printify'
);

// Calculate design placement
const placement = imageProcessor.calculatePlacement(
  2400, 2400, // design dimensions
  { width: 12, height: 16, x: 0, y: 0, unit: 'in', dpi: 300 },
  { position: 'center', scale: 0.8 }
);

// Batch process for multiple platforms
const results = await imageProcessor.batchProcess(
  'https://example.com/design.png',
  ['printify', 'printful', 'etsy'],
  { width: 2400, height: 2400, format: 'png', size: 1024000 }
);

// Prepare image for publishing
const prepared = await imageProcessor.prepareForPublishing(
  'https://example.com/design.png',
  'printify',
  { width: 2400, height: 2400, format: 'png', size: 1024000 }
);
```

#### Supported Platforms

- Printify
- Printful
- Etsy
- Shopify
- Amazon
- Redbubble
- Teespring

Each platform has specific image requirements (dimensions, file size, DPI, formats).

## API Routes

### Publishing Queue Routes (`/api/publishing-queue`)

#### Get Queue Items
```
GET /api/publishing-queue?status=pending&limit=50
```

#### Get Queue Statistics
```
GET /api/publishing-queue/stats
```

#### Get Product Queue
```
GET /api/publishing-queue/product/:productId
```

#### Add to Queue
```
POST /api/publishing-queue
Body: {
  "productId": "product-123",
  "platform": "printify",
  "priority": 8,
  "scheduledFor": "2024-12-25T00:00:00Z",
  "safeguardsPassed": true,
  "trademarkCleared": true,
  "qualityScore": 95
}
```

#### Batch Add to Queue
```
POST /api/publishing-queue/batch
Body: {
  "productId": "product-123",
  "platforms": ["printify", "printful", "etsy"],
  "priority": 7
}
```

#### Update Status
```
PATCH /api/publishing-queue/:id/status
Body: {
  "status": "published",
  "externalId": "ext-123",
  "externalUrl": "https://platform.com/product/123"
}
```

#### Retry Failed Item
```
POST /api/publishing-queue/:id/retry
```

#### Cancel Item
```
DELETE /api/publishing-queue/:id
```

#### Trigger Queue Processing
```
POST /api/publishing-queue/process
```

#### Check Rate Limit
```
GET /api/publishing-queue/rate-limit/:platform?endpoint=default
```

## Database Schema

### Publishing Queue Table

```typescript
{
  id: string;                    // UUID
  productId: string;             // Reference to products table
  platform: string;              // Platform name (e.g., 'printify')
  status: string;                // 'pending' | 'processing' | 'published' | 'failed' | 'rejected'
  priority: number;              // 1-10 (higher = more urgent)
  safeguardsPassed: boolean;     // Passed safety checks
  trademarkCleared: boolean;     // Passed trademark screening
  qualityScore: number;          // 0-100 quality assessment
  externalId: string;            // ID on external platform
  externalUrl: string;           // URL on external platform
  errorMessage: string;          // Error details if failed
  retryCount: number;            // Number of retry attempts
  scheduledFor: Date;            // When to publish
  publishedAt: Date;             // When successfully published
  createdAt: Date;               // When added to queue
}
```

### API Rate Limits Table

```typescript
{
  id: string;                    // UUID
  platform: string;              // Platform name
  endpoint: string;              // API endpoint
  requestCount: number;          // Requests in current window
  limitPerMinute: number;        // Max requests per minute
  windowStart: Date;             // Window start time
  lastRequestAt: Date;           // Last request timestamp
}
```

## Error Handling

All services implement comprehensive error handling:

1. **Try-Catch Blocks**: Wrap all async operations
2. **Detailed Logging**: Log errors with context
3. **Graceful Failures**: Return error objects instead of throwing
4. **Retry Logic**: Automatic retry with exponential backoff
5. **Rate Limit Handling**: Respect platform rate limits

Example error response:
```typescript
{
  success: false,
  error: "Rate limit exceeded. Retry after 30000ms"
}
```

## Integration with Existing Services

These services complement existing services:

- **`image-processing-service.ts`**: Core image processing functionality
- **`scheduling-service.ts`**: Scheduled content publishing
- **Platform connectors**: Individual platform integration logic

## Starting the Queue Processor

The publishing queue can be started automatically on server startup or manually:

```typescript
// In server/index.ts
import { publishingQueueService } from './services/publishing-queue';

// Start processing with 30-second interval
publishingQueueService.startProcessing(30000);

// Stop processing on shutdown
process.on('SIGTERM', () => {
  publishingQueueService.stopProcessing();
});
```

## Testing

Example test cases:

```typescript
import { publishingQueueService } from './services/publishing-queue';
import { imageProcessor } from './services/image-processing';

// Test queue operations
describe('Publishing Queue', () => {
  it('should add item to queue', async () => {
    const item = await publishingQueueService.addToQueue('prod-1', 'printify');
    expect(item.status).toBe('pending');
  });

  it('should handle retry with backoff', async () => {
    const item = await publishingQueueService.addToQueue('prod-1', 'printify');
    await publishingQueueService.incrementRetry(item.id, 'Test error');
    // Verify retry count and next scheduled time
  });
});

// Test image processing
describe('Image Processing', () => {
  it('should resize for platform', async () => {
    const result = await imageProcessor.resizeForPlatform(
      'test-url',
      'printify'
    );
    expect(result.success).toBe(true);
  });

  it('should validate print area', () => {
    const validation = imageProcessor.validatePrintArea(
      { width: 12, height: 16, x: 0, y: 0, unit: 'in', dpi: 300 },
      'printify'
    );
    expect(validation.isValid).toBe(true);
  });
});
```

## Future Enhancements

1. **Webhook Support**: Receive platform status updates via webhooks
2. **Advanced Analytics**: Track publishing success rates per platform
3. **Image Caching**: Cache processed images to avoid re-processing
4. **Parallel Processing**: Process multiple items concurrently
5. **Platform Connectors**: Implement actual platform API integrations
6. **Real Image Processing**: Integrate Sharp library for actual image manipulation
7. **Notification System**: Send notifications when publishing completes/fails
8. **Dashboard**: Admin dashboard for queue monitoring

## Notes

- The queue processor uses exponential backoff to avoid overwhelming failed platforms
- Rate limits are tracked per platform to prevent API throttling
- All timestamps are stored in UTC
- Image processing currently returns placeholder results (needs Sharp integration)
- Platform-specific publishing logic needs to be implemented in `processItem` method
