# AI Quality Safeguards - Phase 2.3

Comprehensive safeguard system for AI-generated content, providing trademark screening, content moderation, quality scoring, and validation orchestration.

## Features

### 1. Trademark Screening (`trademark-screening.ts`)

- **USPTO API Integration**: Search US trademark database
- **EUIPO API Integration**: Search European trademark database
- **Brand Name Detection**: Screen for well-known brands in content
- **Similarity Scoring**: Levenshtein distance algorithm for trademark matching
- **Automated Screening**: Pre-publish trademark conflict detection
- **Audit Logging**: Complete history of trademark checks

### 2. Content Moderation (`content-moderation.ts`)

- **Policy Compliance**: Check against prohibited content, medical claims, financial claims, etc.
- **Quality Scoring**: Multi-factor quality assessment
  - Readability (Flesch Reading Ease)
  - Engagement potential
  - Sentiment analysis
  - Keyword density
  - Length optimization
  - Grammar checking
- **Brand Voice Consistency**: Match content against brand voice profiles
  - Tone checking
  - Writing style validation
  - Vocabulary level matching
  - Avoided words detection
  - Preferred phrases usage
- **Spam Detection**: Excessive caps, punctuation, word repetition

### 3. Safeguard Validation (`safeguard-validator.ts`)

- **Orchestration**: Coordinate all safeguard checks
- **Rate Limiting**: Prevent abuse and excessive API calls
- **Overall Scoring**: Weighted scoring across all checks
- **Publishing Decisions**: Automated pass/fail/warn decisions
- **History & Statistics**: Comprehensive audit trail
- **Queue Integration**: Update publishing queue with results

## Usage

### Basic Trademark Screening

```typescript
import { screenForTrademarks } from './services/safeguards';

const result = await screenForTrademarks(
  'product-123',
  'Nike-style Athletic Shoes',
  'Premium running shoes with swoosh logo',
  ['footwear', 'sports']
);

if (result.decision === 'fail') {
  console.log('Trademark conflict:', result.reason);
  console.log('Matches:', result.matches);
}
```

### Content Moderation

```typescript
import { moderateContent } from './services/safeguards';

const result = await moderateContent(
  'product-123',
  {
    title: 'Premium Leather Wallet',
    description: 'Handcrafted leather wallet with RFID protection...',
    tags: ['wallet', 'leather', 'accessories']
  },
  {
    checkPolicies: true,
    checkQuality: true,
    checkBrandVoice: true,
    brandVoiceId: 'brand-voice-123',
    strictMode: false
  }
);

console.log('Quality Score:', result.score);
console.log('Violations:', result.violations);
console.log('Quality Metrics:', result.qualityMetrics);
```

### Brand Voice Consistency

```typescript
import { checkBrandVoiceConsistency } from './services/safeguards';

const result = await checkBrandVoiceConsistency(
  {
    title: 'Premium Leather Wallet',
    description: 'Handcrafted leather wallet...',
  },
  'brand-voice-123'
);

console.log('Brand Voice Score:', result.score);
console.log('Matches:', result.matches);
console.log('Mismatches:', result.mismatches);
```

### Complete Validation (Recommended)

```typescript
import { validateAllSafeguards } from './services/safeguards';

const result = await validateAllSafeguards(
  'product-123',
  {
    title: 'Premium Leather Wallet',
    description: 'Handcrafted leather wallet with RFID protection...',
    tags: ['wallet', 'leather', 'accessories'],
    categories: ['accessories', 'fashion']
  },
  {
    brandVoiceId: 'brand-voice-123',
    strictMode: false,
    requireManualReview: false
  }
);

if (result.canPublish) {
  console.log('✓ Ready to publish!');
  console.log('Overall Score:', result.overallScore);
} else {
  console.log('✗ Cannot publish');
  console.log('Blockers:', result.blockers);
  console.log('Warnings:', result.warnings);
}

console.log('Recommendation:', result.recommendation);
```

### Validate and Prepare for Publishing

```typescript
import { validateAndPrepareForPublishing } from './services/safeguards';

const result = await validateAndPrepareForPublishing(
  'product-123',
  {
    title: 'Premium Leather Wallet',
    description: 'Handcrafted leather wallet...',
    tags: ['wallet', 'leather'],
    categories: ['accessories']
  }
);

if (result.success) {
  // Proceed with publishing
  await publishToMarketplace(productId);
} else {
  // Show user the issues
  console.log(result.message);
  console.log('Blockers:', result.validationResult.blockers);
}
```

### Check Publishing Status

```typescript
import { canPublishProduct } from './services/safeguards';

const check = await canPublishProduct('product-123');

if (check.canPublish) {
  console.log('✓', check.reason);
} else {
  console.log('✗', check.reason);
  if (check.lastValidation) {
    console.log('Last checked:', check.lastValidation.assessedAt);
  }
}
```

### Get Safeguard History

```typescript
import { getSafeguardHistory, getSafeguardStats } from './services/safeguards';

// Get complete history
const history = await getSafeguardHistory('product-123');

// Get specific safeguard history
const trademarkHistory = await getSafeguardHistory('product-123', {
  safeguardName: 'trademark_screening',
  limit: 10
});

// Get statistics
const stats = await getSafeguardStats('product-123');
console.log('Total checks:', stats.totalChecks);
console.log('Pass rate:', (stats.passed / stats.totalChecks * 100).toFixed(1) + '%');
console.log('Average score:', (stats.averageScore * 100).toFixed(1) + '%');
```

### Batch Processing

```typescript
import { batchScreenTrademarks } from './services/safeguards';

const products = [
  { id: 'p1', name: 'Product A', description: '...' },
  { id: 'p2', name: 'Product B', description: '...' },
  { id: 'p3', name: 'Product C', description: '...' },
];

const results = await batchScreenTrademarks(products, {
  threshold: 0.7,
  skipOnError: true
});

for (const [productId, result] of results) {
  console.log(`${productId}: ${result.decision} (${result.score})`);
}
```

## Configuration

### Environment Variables

```bash
# USPTO API (Required for US trademark screening)
USPTO_API_KEY=your_uspto_api_key_here

# Optional: Configure thresholds
TRADEMARK_THRESHOLD=0.7
MODERATION_THRESHOLD=0.7
OVERALL_THRESHOLD=0.75
```

### Safeguard Rules

You can customize the safeguard rules in `safeguard-validator.ts`:

```typescript
export const SAFEGUARD_RULES = {
  // Minimum scores required to pass
  minTrademarkScore: 0.7,
  minModerationScore: 0.7,
  minOverallScore: 0.75,

  // Auto-fail conditions
  autoFailOnCriticalViolations: true,
  maxHighSeverityViolations: 2,

  // Rate limiting
  maxPublishAttemptsPerHour: 10,
  maxFailedAttemptsBeforeBlock: 3,

  // Required checks
  requireTrademarkCheck: true,
  requireModerationCheck: true,
};
```

## Audit Logging

All safeguard checks are automatically logged to the `safeguard_audit_log` table:

```sql
SELECT
  safeguard_name,
  decision,
  score,
  reason,
  execution_time_ms,
  assessed_at
FROM safeguard_audit_log
WHERE product_id = 'product-123'
ORDER BY assessed_at DESC;
```

### Decision Types

- **`pass`**: All checks passed, ready to publish
- **`warn`**: Passed with warnings, manual review recommended
- **`fail`**: Failed validation, cannot publish
- **`skip`**: Check was skipped or unavailable

### Metadata Structure

Each audit log entry includes detailed metadata:

```json
{
  "totalMatches": 3,
  "highRiskMatches": 0,
  "mediumRiskMatches": 1,
  "sources": ["USPTO", "EUIPO"],
  "searchTerm": "Product Name",
  "violations": [...],
  "qualityMetrics": {...},
  "scores": {
    "trademark": 0.85,
    "moderation": 0.92,
    "overall": 0.89
  }
}
```

## Error Handling

All services include comprehensive error handling:

- **API Failures**: Gracefully degrade when external APIs are unavailable
- **Rate Limiting**: Automatic backoff and retry logic
- **Validation Errors**: Clear error messages for invalid inputs
- **Audit Logging**: All errors are logged for debugging

```typescript
try {
  const result = await validateAllSafeguards(productId, content);
  // Handle result
} catch (error) {
  console.error('Validation error:', error);
  // Error is already logged to audit log
  // Show user-friendly message
}
```

## Integration with Publishing Queue

The safeguard system automatically updates the `publishing_queue` table:

```typescript
await updatePublishingQueueWithSafeguards(productId, validationResult);

// Queue is updated with:
// - safeguardsPassed: boolean
// - trademarkCleared: boolean
// - qualityScore: number
// - status: 'pending' | 'rejected'
// - errorMessage: string | null
```

## Best Practices

1. **Always validate before publishing**: Use `validateAllSafeguards()` or `validateAndPrepareForPublishing()`
2. **Check brand voice**: Include `brandVoiceId` when available for consistency
3. **Monitor audit logs**: Review failed validations to improve content
4. **Respect rate limits**: Use batch processing for multiple products
5. **Handle warnings**: Don't ignore warnings - they indicate potential issues
6. **Keep validations fresh**: Re-validate if content changes or validation expires (24h)

## API Integration Example

```typescript
// In your publishing route
app.post('/api/products/:id/publish', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { platform } = req.body;

  // Get product details
  const product = await getProduct(id);

  // Validate with safeguards
  const validation = await validateAndPrepareForPublishing(
    id,
    {
      title: product.name,
      description: product.description,
      tags: product.tags,
      categories: [product.categoryId]
    },
    {
      brandVoiceId: req.user.defaultBrandVoiceId,
      strictMode: false
    }
  );

  if (!validation.success) {
    return res.status(400).json({
      message: validation.message,
      blockers: validation.validationResult.blockers,
      warnings: validation.validationResult.warnings
    });
  }

  // Proceed with publishing
  await publishToMarketplace(id, platform);

  res.json({
    message: 'Published successfully',
    validationScore: validation.validationResult.overallScore
  });
});
```

## Testing

```typescript
// Mock data for testing
const mockProduct = {
  id: 'test-123',
  title: 'Test Product',
  description: 'A high-quality test product with excellent features.',
  tags: ['test', 'quality', 'premium'],
  categories: ['test-category']
};

// Test trademark screening
const trademarkResult = await screenForTrademarks(
  mockProduct.id,
  mockProduct.title,
  mockProduct.description
);
expect(trademarkResult.decision).toBe('pass');

// Test content moderation
const moderationResult = await moderateContent(
  mockProduct.id,
  mockProduct
);
expect(moderationResult.isPassed).toBe(true);
expect(moderationResult.score).toBeGreaterThan(0.7);

// Test complete validation
const validationResult = await validateAllSafeguards(
  mockProduct.id,
  mockProduct
);
expect(validationResult.canPublish).toBe(true);
```

## Performance

- **Trademark Screening**: ~1-3 seconds (parallel API calls)
- **Content Moderation**: ~100-500ms (local processing)
- **Complete Validation**: ~2-4 seconds (all checks)
- **Batch Processing**: 5 products per batch with 1s delay between batches

## Support

For issues or questions:
1. Check audit logs for detailed error information
2. Review the metadata in `safeguard_audit_log`
3. Ensure API keys are configured correctly
4. Check rate limits haven't been exceeded

## Future Enhancements

- [ ] AI-powered plagiarism detection
- [ ] Image content screening
- [ ] Multi-language support
- [ ] Custom violation rules engine
- [ ] Real-time monitoring dashboard
- [ ] A/B testing for quality thresholds
- [ ] Machine learning quality prediction
