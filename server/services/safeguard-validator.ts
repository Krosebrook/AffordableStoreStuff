import { db } from "../db";
import { safeguardAuditLog, publishingQueue, type SafeguardAuditEntry } from "@shared/schema";
import { eq, and, desc, gte, count } from "drizzle-orm";
import { screenForTrademarks, type TrademarkSearchResult } from "./trademark-screening";
import { moderateContent, type ModerationResult } from "./content-moderation";

/**
 * Safeguard validation result
 */
export interface SafeguardValidationResult {
  canPublish: boolean;
  overallDecision: 'pass' | 'fail' | 'warn' | 'skip';
  overallScore: number;
  results: {
    trademark?: TrademarkSearchResult;
    moderation?: ModerationResult;
  };
  blockers: string[];
  warnings: string[];
  recommendation: string;
}

/**
 * Safeguard validation options
 */
export interface SafeguardValidationOptions {
  skipTrademarkCheck?: boolean;
  skipModerationCheck?: boolean;
  brandVoiceId?: string;
  strictMode?: boolean;
  requireManualReview?: boolean;
}

/**
 * Safeguard thresholds and rules
 */
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
} as const;

/**
 * Validate all safeguards for a product before publishing
 */
export async function validateAllSafeguards(
  productId: string,
  content: {
    title: string;
    description: string;
    tags?: string[];
    categories?: string[];
  },
  options: SafeguardValidationOptions = {}
): Promise<SafeguardValidationResult> {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const results: SafeguardValidationResult['results'] = {};

  try {
    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(productId);
    if (!rateLimitCheck.allowed) {
      blockers.push(rateLimitCheck.reason);
      return createBlockedResult(blockers, warnings, results);
    }

    // 1. Trademark screening
    let trademarkScore = 1.0;
    if (!options.skipTrademarkCheck && SAFEGUARD_RULES.requireTrademarkCheck) {
      const trademarkResult = await screenForTrademarks(
        productId,
        content.title,
        content.description,
        content.categories
      );
      results.trademark = trademarkResult;
      trademarkScore = trademarkResult.score;

      if (trademarkResult.decision === 'fail') {
        blockers.push(`Trademark check failed: ${trademarkResult.reason}`);
      } else if (trademarkResult.decision === 'warn') {
        warnings.push(`Trademark warning: ${trademarkResult.reason}`);
      }
    }

    // 2. Content moderation
    let moderationScore = 1.0;
    if (!options.skipModerationCheck && SAFEGUARD_RULES.requireModerationCheck) {
      const moderationResult = await moderateContent(
        productId,
        content,
        {
          checkPolicies: true,
          checkQuality: true,
          checkBrandVoice: !!options.brandVoiceId,
          brandVoiceId: options.brandVoiceId,
          strictMode: options.strictMode,
        }
      );
      results.moderation = moderationResult;
      moderationScore = moderationResult.score;

      // Check for critical violations
      const criticalViolations = moderationResult.violations.filter(
        v => v.severity === 'critical'
      );
      if (criticalViolations.length > 0 && SAFEGUARD_RULES.autoFailOnCriticalViolations) {
        blockers.push(`Critical content violations: ${criticalViolations.map(v => v.message).join('; ')}`);
      }

      // Check for high severity violations
      const highViolations = moderationResult.violations.filter(
        v => v.severity === 'high'
      );
      if (highViolations.length > SAFEGUARD_RULES.maxHighSeverityViolations) {
        blockers.push(`Too many high-severity violations (${highViolations.length})`);
      }

      // Add warnings for medium/low violations
      moderationResult.violations
        .filter(v => v.severity === 'medium' || v.severity === 'low')
        .forEach(v => warnings.push(v.message));
    }

    // Calculate overall score
    const overallScore = calculateOverallSafeguardScore(trademarkScore, moderationScore);

    // Determine decision
    const overallDecision = determineOverallDecision(
      blockers.length > 0,
      warnings.length > 0,
      overallScore,
      options.strictMode
    );

    // Check if manual review is required
    if (options.requireManualReview) {
      blockers.push('Manual review required before publishing');
    }

    const canPublish = blockers.length === 0 && overallDecision !== 'fail';

    // Generate recommendation
    const recommendation = generateRecommendation(
      canPublish,
      overallDecision,
      overallScore,
      blockers,
      warnings
    );

    // Log overall validation
    await logOverallValidation(productId, {
      canPublish,
      overallDecision,
      overallScore,
      blockers,
      warnings,
      trademarkScore,
      moderationScore,
    });

    return {
      canPublish,
      overallDecision,
      overallScore,
      results,
      blockers,
      warnings,
      recommendation,
    };
  } catch (error) {
    console.error('Safeguard validation error:', error);

    blockers.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return createBlockedResult(blockers, warnings, results);
  }
}

/**
 * Check rate limiting for publishing attempts
 */
async function checkRateLimit(productId: string): Promise<{ allowed: boolean; reason: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Count recent publishing attempts
  const [recentAttempts] = await db
    .select({ count: count() })
    .from(safeguardAuditLog)
    .where(
      and(
        eq(safeguardAuditLog.productId, productId),
        gte(safeguardAuditLog.assessedAt, oneHourAgo)
      )
    );

  const attemptCount = recentAttempts?.count || 0;

  if (attemptCount >= SAFEGUARD_RULES.maxPublishAttemptsPerHour) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${attemptCount} attempts in the last hour (max: ${SAFEGUARD_RULES.maxPublishAttemptsPerHour})`,
    };
  }

  // Count recent failures
  const recentFailures = await db
    .select()
    .from(safeguardAuditLog)
    .where(
      and(
        eq(safeguardAuditLog.productId, productId),
        eq(safeguardAuditLog.decision, 'fail'),
        gte(safeguardAuditLog.assessedAt, oneHourAgo)
      )
    );

  if (recentFailures.length >= SAFEGUARD_RULES.maxFailedAttemptsBeforeBlock) {
    return {
      allowed: false,
      reason: `Too many failed attempts: ${recentFailures.length} failures in the last hour (max: ${SAFEGUARD_RULES.maxFailedAttemptsBeforeBlock})`,
    };
  }

  return { allowed: true, reason: '' };
}

/**
 * Calculate overall safeguard score
 */
function calculateOverallSafeguardScore(trademarkScore: number, moderationScore: number): number {
  // Weighted average
  const weights = {
    trademark: 0.4,
    moderation: 0.6,
  };

  return trademarkScore * weights.trademark + moderationScore * weights.moderation;
}

/**
 * Determine overall decision based on results
 */
function determineOverallDecision(
  hasBlockers: boolean,
  hasWarnings: boolean,
  overallScore: number,
  strictMode?: boolean
): 'pass' | 'fail' | 'warn' | 'skip' {
  if (hasBlockers) return 'fail';

  if (overallScore < SAFEGUARD_RULES.minOverallScore) {
    return strictMode ? 'fail' : 'warn';
  }

  if (hasWarnings) return 'warn';

  return 'pass';
}

/**
 * Generate recommendation based on validation results
 */
function generateRecommendation(
  canPublish: boolean,
  decision: string,
  score: number,
  blockers: string[],
  warnings: string[]
): string {
  if (canPublish && decision === 'pass') {
    return 'Content is ready to publish. All safeguards passed.';
  }

  if (!canPublish && blockers.length > 0) {
    return `Cannot publish: ${blockers[0]}. Please address these issues before publishing.`;
  }

  if (decision === 'warn' && warnings.length > 0) {
    return `Content can be published but has warnings: ${warnings[0]}. Consider reviewing before publishing.`;
  }

  if (score < SAFEGUARD_RULES.minOverallScore) {
    return `Quality score is below threshold (${(score * 100).toFixed(1)}% < ${(SAFEGUARD_RULES.minOverallScore * 100).toFixed(1)}%). Consider improving content quality.`;
  }

  return 'Manual review recommended before publishing.';
}

/**
 * Log overall validation result
 */
async function logOverallValidation(
  productId: string,
  validation: {
    canPublish: boolean;
    overallDecision: string;
    overallScore: number;
    blockers: string[];
    warnings: string[];
    trademarkScore: number;
    moderationScore: number;
  }
) {
  await db.insert(safeguardAuditLog).values({
    productId,
    safeguardName: 'overall_validation',
    decision: validation.overallDecision,
    reason: validation.canPublish
      ? 'All safeguards passed'
      : `Blocked: ${validation.blockers.join('; ')}`,
    score: validation.overallScore,
    threshold: SAFEGUARD_RULES.minOverallScore,
    executionTimeMs: 0,
    metadata: {
      canPublish: validation.canPublish,
      blockers: validation.blockers,
      warnings: validation.warnings,
      scores: {
        trademark: validation.trademarkScore,
        moderation: validation.moderationScore,
        overall: validation.overallScore,
      },
    },
  });
}

/**
 * Create a blocked result
 */
function createBlockedResult(
  blockers: string[],
  warnings: string[],
  results: SafeguardValidationResult['results']
): SafeguardValidationResult {
  return {
    canPublish: false,
    overallDecision: 'fail',
    overallScore: 0,
    results,
    blockers,
    warnings,
    recommendation: blockers.length > 0
      ? `Cannot publish: ${blockers[0]}`
      : 'Validation failed',
  };
}

/**
 * Get safeguard audit history for a product
 */
export async function getSafeguardHistory(
  productId: string,
  options: {
    safeguardName?: string;
    limit?: number;
    since?: Date;
  } = {}
): Promise<SafeguardAuditEntry[]> {
  let query = db
    .select()
    .from(safeguardAuditLog)
    .where(eq(safeguardAuditLog.productId, productId));

  if (options.safeguardName) {
    query = query.where(eq(safeguardAuditLog.safeguardName, options.safeguardName));
  }

  if (options.since) {
    query = query.where(gte(safeguardAuditLog.assessedAt, options.since));
  }

  query = query.orderBy(desc(safeguardAuditLog.assessedAt));

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return await query;
}

/**
 * Get safeguard statistics for a product
 */
export async function getSafeguardStats(productId: string) {
  const history = await getSafeguardHistory(productId);

  const stats = {
    totalChecks: history.length,
    passed: history.filter(h => h.decision === 'pass').length,
    failed: history.filter(h => h.decision === 'fail').length,
    warned: history.filter(h => h.decision === 'warn').length,
    skipped: history.filter(h => h.decision === 'skip').length,
    averageScore: 0,
    lastChecked: history[0]?.assessedAt,
    checksByType: {} as Record<string, number>,
  };

  // Calculate average score
  const scoresWithValues = history.filter(h => h.score !== null);
  if (scoresWithValues.length > 0) {
    stats.averageScore =
      scoresWithValues.reduce((sum, h) => sum + (h.score || 0), 0) / scoresWithValues.length;
  }

  // Count by type
  history.forEach(h => {
    stats.checksByType[h.safeguardName] = (stats.checksByType[h.safeguardName] || 0) + 1;
  });

  return stats;
}

/**
 * Check if a product can be published based on safeguard history
 */
export async function canPublishProduct(productId: string): Promise<{
  canPublish: boolean;
  reason: string;
  lastValidation?: SafeguardAuditEntry;
}> {
  // Get the most recent overall validation
  const [lastValidation] = await db
    .select()
    .from(safeguardAuditLog)
    .where(
      and(
        eq(safeguardAuditLog.productId, productId),
        eq(safeguardAuditLog.safeguardName, 'overall_validation')
      )
    )
    .orderBy(desc(safeguardAuditLog.assessedAt))
    .limit(1);

  if (!lastValidation) {
    return {
      canPublish: false,
      reason: 'No validation found. Please run safeguard validation first.',
    };
  }

  // Check if validation is recent (within last 24 hours)
  const validationAge = Date.now() - new Date(lastValidation.assessedAt).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (validationAge > maxAge) {
    return {
      canPublish: false,
      reason: 'Validation expired. Please re-validate before publishing.',
      lastValidation,
    };
  }

  // Check decision
  if (lastValidation.decision === 'fail') {
    return {
      canPublish: false,
      reason: lastValidation.reason || 'Validation failed',
      lastValidation,
    };
  }

  if (lastValidation.decision === 'pass' || lastValidation.decision === 'warn') {
    return {
      canPublish: true,
      reason: lastValidation.decision === 'warn'
        ? 'Can publish with warnings'
        : 'Validation passed',
      lastValidation,
    };
  }

  return {
    canPublish: false,
    reason: 'Validation incomplete',
    lastValidation,
  };
}

/**
 * Update publishing queue with safeguard results
 */
export async function updatePublishingQueueWithSafeguards(
  productId: string,
  validationResult: SafeguardValidationResult
) {
  const trademarkCleared =
    !validationResult.results.trademark ||
    validationResult.results.trademark.decision === 'pass' ||
    validationResult.results.trademark.decision === 'warn';

  await db
    .update(publishingQueue)
    .set({
      safeguardsPassed: validationResult.canPublish,
      trademarkCleared,
      qualityScore: validationResult.overallScore,
      status: validationResult.canPublish ? 'pending' : 'rejected',
      errorMessage: validationResult.canPublish
        ? null
        : validationResult.blockers.join('; '),
    })
    .where(eq(publishingQueue.productId, productId));
}

/**
 * Validate and prepare product for publishing
 */
export async function validateAndPrepareForPublishing(
  productId: string,
  content: {
    title: string;
    description: string;
    tags?: string[];
    categories?: string[];
  },
  options: SafeguardValidationOptions = {}
): Promise<{
  success: boolean;
  validationResult: SafeguardValidationResult;
  message: string;
}> {
  // Run all validations
  const validationResult = await validateAllSafeguards(productId, content, options);

  // Update publishing queue
  await updatePublishingQueueWithSafeguards(productId, validationResult);

  return {
    success: validationResult.canPublish,
    validationResult,
    message: validationResult.recommendation,
  };
}
