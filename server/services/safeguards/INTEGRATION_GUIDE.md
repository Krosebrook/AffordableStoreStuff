# Integration Guide - AI Quality Safeguards

This guide shows how to integrate the AI Quality Safeguards into your existing FlashFusion application.

## Quick Start

### 1. Import the Services

```typescript
// Import all safeguard services
import {
  validateAllSafeguards,
  validateAndPrepareForPublishing,
  canPublishProduct,
  screenForTrademarks,
  moderateContent,
  checkBrandVoiceConsistency,
  getSafeguardHistory,
  getSafeguardStats,
} from './services/safeguards';
```

### 2. Add to Product Creation Flow

When creating or editing a product with AI, validate the content:

```typescript
// In your AI product generation route
app.post('/api/ai/product-concepts/:id/generate', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { prompt, brandVoiceId } = req.body;

  // Generate AI content
  const aiContent = await generateProductContent(prompt, brandVoiceId);

  // Validate with safeguards
  const validation = await validateAllSafeguards(
    id,
    {
      title: aiContent.generatedTitle,
      description: aiContent.generatedDescription,
      tags: aiContent.generatedTags,
      categories: [req.body.marketplace]
    },
    {
      brandVoiceId,
      strictMode: false
    }
  );

  // Store validation results
  await db.update(productConcepts)
    .set({
      qualityScore: validation.overallScore,
      status: validation.canPublish ? 'ready' : 'draft'
    })
    .where(eq(productConcepts.id, id));

  res.json({
    content: aiContent,
    validation: {
      canPublish: validation.canPublish,
      score: validation.overallScore,
      warnings: validation.warnings,
      recommendation: validation.recommendation
    }
  });
});
```

### 3. Add to Publishing Queue

Before publishing to marketplaces, validate the product:

```typescript
// In your publishing route
app.post('/api/publishing/queue', requireAuth, async (req, res) => {
  const { productId, platform } = req.body;

  // Get product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Validate and prepare for publishing
  const result = await validateAndPrepareForPublishing(
    productId,
    {
      title: product.name,
      description: product.description || '',
      tags: product.tags || [],
      categories: product.categoryId ? [product.categoryId] : []
    },
    {
      brandVoiceId: req.user?.defaultBrandVoiceId,
      strictMode: false
    }
  );

  if (!result.success) {
    return res.status(400).json({
      message: result.message,
      blockers: result.validationResult.blockers,
      warnings: result.validationResult.warnings,
      score: result.validationResult.overallScore
    });
  }

  // Add to publishing queue
  const [queueItem] = await db
    .insert(publishingQueue)
    .values({
      productId,
      platform,
      status: 'pending',
      safeguardsPassed: true,
      trademarkCleared: result.validationResult.results.trademark?.decision !== 'fail',
      qualityScore: result.validationResult.overallScore,
      priority: 5
    })
    .returning();

  res.json({
    message: 'Added to publishing queue',
    queueItem,
    validation: result.validationResult
  });
});
```

### 4. Add Safeguard Dashboard

Create an endpoint to view safeguard history and statistics:

```typescript
// Get safeguard history for a product
app.get('/api/products/:id/safeguards/history', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { safeguardName, limit } = req.query;

  const history = await getSafeguardHistory(id, {
    safeguardName: safeguardName as string,
    limit: limit ? parseInt(limit as string) : undefined
  });

  res.json(history);
});

// Get safeguard statistics
app.get('/api/products/:id/safeguards/stats', requireAuth, async (req, res) => {
  const { id } = req.params;

  const stats = await getSafeguardStats(id);

  res.json(stats);
});

// Check if product can be published
app.get('/api/products/:id/safeguards/can-publish', requireAuth, async (req, res) => {
  const { id } = req.params;

  const check = await canPublishProduct(id);

  res.json(check);
});
```

### 5. Add to Brand Voice Management

Validate content against brand voice when creating content:

```typescript
// Check brand voice consistency
app.post('/api/brand-voice/:id/check-consistency', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, tags } = req.body;

  const result = await checkBrandVoiceConsistency(
    { title, description, tags },
    id
  );

  res.json({
    score: result.score,
    matches: result.matches,
    mismatches: result.mismatches,
    recommendation: result.score >= 0.7
      ? 'Content matches brand voice well'
      : 'Content may need adjustment to match brand voice'
  });
});
```

### 6. Add Pre-Publish Checks to Frontend

In your React components:

```typescript
// ProductPublishDialog.tsx
function ProductPublishDialog({ productId, onClose }) {
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const response = await fetch(`/api/products/${productId}/safeguards/can-publish`);
      const data = await response.json();
      setValidation(data);
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    if (!validation?.canPublish) {
      toast.error('Please resolve validation issues first');
      return;
    }

    // Proceed with publishing
    await publishProduct(productId);
  };

  return (
    <Dialog>
      <DialogTitle>Publish Product</DialogTitle>
      <DialogContent>
        {!validation && (
          <Button onClick={handleValidate} disabled={validating}>
            {validating ? 'Validating...' : 'Check Safeguards'}
          </Button>
        )}

        {validation && (
          <div>
            <h3>Validation Results</h3>
            <p>Status: {validation.reason}</p>

            {validation.lastValidation && (
              <div>
                <p>Score: {(validation.lastValidation.score * 100).toFixed(1)}%</p>
                <p>Checked: {new Date(validation.lastValidation.assessedAt).toLocaleString()}</p>
              </div>
            )}

            {validation.canPublish ? (
              <Button onClick={handlePublish}>Publish Now</Button>
            ) : (
              <Alert severity="error">
                Cannot publish: {validation.reason}
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### 7. Add Automated Safeguard Checks

Set up automated checks in your workflow:

```typescript
// In your scheduled tasks or workflow execution
import { validateAllSafeguards } from './services/safeguards';

async function processPublishingQueue() {
  // Get pending items
  const queueItems = await db
    .select()
    .from(publishingQueue)
    .where(eq(publishingQueue.status, 'pending'))
    .where(eq(publishingQueue.safeguardsPassed, false));

  for (const item of queueItems) {
    // Get product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    if (!product) continue;

    // Validate with safeguards
    const validation = await validateAllSafeguards(
      item.productId,
      {
        title: product.name,
        description: product.description || '',
        tags: product.tags || [],
        categories: product.categoryId ? [product.categoryId] : []
      }
    );

    // Update queue item
    await db
      .update(publishingQueue)
      .set({
        safeguardsPassed: validation.canPublish,
        qualityScore: validation.overallScore,
        status: validation.canPublish ? 'pending' : 'rejected',
        errorMessage: validation.canPublish ? null : validation.blockers.join('; ')
      })
      .where(eq(publishingQueue.id, item.id));

    // If passed, proceed with publishing
    if (validation.canPublish) {
      await publishToMarketplace(item.productId, item.platform);
    }
  }
}
```

## Environment Setup

Add these environment variables to your `.env` file:

```bash
# USPTO API Key (required for trademark screening)
USPTO_API_KEY=your_uspto_api_key_here

# Optional: Adjust thresholds
TRADEMARK_THRESHOLD=0.7
MODERATION_THRESHOLD=0.7
OVERALL_THRESHOLD=0.75

# Optional: Rate limiting
MAX_PUBLISH_ATTEMPTS_PER_HOUR=10
MAX_FAILED_ATTEMPTS_BEFORE_BLOCK=3
```

## Database Migrations

The safeguard services use the existing `safeguard_audit_log` table. No new migrations are needed, but ensure the table exists:

```sql
-- Already in your schema
CREATE TABLE safeguard_audit_log (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR,
  safeguard_name TEXT NOT NULL,
  decision TEXT NOT NULL, -- 'pass', 'fail', 'warn', 'skip'
  reason TEXT,
  score REAL,
  threshold REAL,
  execution_time_ms INTEGER,
  metadata JSONB,
  assessed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_safeguard_audit_log_product_id ON safeguard_audit_log(product_id);
CREATE INDEX idx_safeguard_audit_log_safeguard_name ON safeguard_audit_log(safeguard_name);
CREATE INDEX idx_safeguard_audit_log_decision ON safeguard_audit_log(decision);
```

## Testing

Create tests for the safeguard services:

```typescript
// __tests__/safeguards.test.ts
import { describe, it, expect } from 'vitest';
import { moderateContent, screenForTrademarks, validateAllSafeguards } from '../services/safeguards';

describe('Content Moderation', () => {
  it('should pass valid content', async () => {
    const result = await moderateContent('test-123', {
      title: 'High Quality Product',
      description: 'This is a well-written description with proper grammar and good length.',
      tags: ['quality', 'test']
    });

    expect(result.isPassed).toBe(true);
    expect(result.score).toBeGreaterThan(0.7);
  });

  it('should fail prohibited content', async () => {
    const result = await moderateContent('test-123', {
      title: 'Test Product',
      description: 'This product contains prohibited drug content.',
      tags: []
    });

    expect(result.isPassed).toBe(false);
    expect(result.violations.some(v => v.type === 'prohibited_content')).toBe(true);
  });
});

describe('Trademark Screening', () => {
  it('should detect obvious trademark conflicts', async () => {
    const result = await screenForTrademarks(
      'test-123',
      'Nike Athletic Shoes',
      'Premium Nike-brand running shoes'
    );

    expect(result.decision).toBe('fail');
    expect(result.matches.length).toBeGreaterThan(0);
  });
});
```

## Monitoring & Alerts

Set up monitoring for safeguard performance:

```typescript
// Monitor safeguard failures
async function monitorSafeguards() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const failures = await db
    .select()
    .from(safeguardAuditLog)
    .where(eq(safeguardAuditLog.decision, 'fail'))
    .where(gte(safeguardAuditLog.assessedAt, oneDayAgo));

  if (failures.length > 100) {
    // Alert: High failure rate
    await sendAlert({
      type: 'high_safeguard_failure_rate',
      count: failures.length,
      period: '24h'
    });
  }

  // Check for specific issues
  const trademarkIssues = failures.filter(
    f => f.safeguardName === 'trademark_screening'
  );

  if (trademarkIssues.length > 50) {
    await sendAlert({
      type: 'high_trademark_conflicts',
      count: trademarkIssues.length
    });
  }
}
```

## Performance Optimization

For high-volume scenarios:

```typescript
// Cache trademark screening results
import { redisClient } from './cache';

async function screenForTrademarksWithCache(
  productId: string,
  productName: string,
  description?: string
) {
  const cacheKey = `trademark:${productName.toLowerCase().trim()}`;

  // Check cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log('Using cached trademark result');
    return JSON.parse(cached);
  }

  // Perform screening
  const result = await screenForTrademarks(productId, productName, description);

  // Cache for 7 days
  await redisClient.setex(cacheKey, 7 * 24 * 60 * 60, JSON.stringify(result));

  return result;
}
```

## Troubleshooting

### Common Issues

1. **USPTO API Errors**
   - Check API key is valid
   - Verify rate limits haven't been exceeded
   - Check network connectivity

2. **Low Quality Scores**
   - Review content length requirements
   - Check for grammar issues
   - Ensure proper keyword usage

3. **Brand Voice Mismatches**
   - Verify brand voice profile is configured correctly
   - Check that content matches tone and style guidelines
   - Update brand voice examples if needed

4. **Rate Limiting**
   - Reduce publishing frequency
   - Wait for rate limit window to reset
   - Consider upgrading API limits

## Support & Documentation

- Full API documentation: `server/services/safeguards/README.md`
- Service source code: `server/services/`
- Schema definitions: `shared/schema.ts`

For questions or issues, check the audit logs in `safeguard_audit_log` table for detailed error information.
