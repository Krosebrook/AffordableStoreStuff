/**
 * AI Quality Safeguards - Phase 2.3
 *
 * This module provides comprehensive safeguards for AI-generated content:
 * - Trademark screening (USPTO & EUIPO)
 * - Content moderation and policy compliance
 * - Quality scoring and brand voice consistency
 * - Validation orchestration and audit logging
 */

export * from '../trademark-screening';
export * from '../content-moderation';
export * from '../safeguard-validator';

// Re-export commonly used types for convenience
export type {
  TrademarkSearchResult,
  TrademarkMatch,
  TrademarkScreeningOptions,
} from '../trademark-screening';

export type {
  ModerationResult,
  ContentViolation,
  ViolationType,
  QualityMetrics,
  BrandVoiceConsistencyResult,
  ModerationOptions,
} from '../content-moderation';

export type {
  SafeguardValidationResult,
  SafeguardValidationOptions,
} from '../safeguard-validator';
