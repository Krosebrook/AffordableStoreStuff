import { db } from "../db";
import { safeguardAuditLog, brandVoiceProfiles, type BrandVoiceProfile } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Content moderation result
 */
export interface ModerationResult {
  isPassed: boolean;
  decision: 'pass' | 'fail' | 'warn' | 'skip';
  reason: string;
  score: number;
  violations: ContentViolation[];
  qualityMetrics: QualityMetrics;
}

/**
 * Content violation details
 */
export interface ContentViolation {
  type: ViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context?: string;
}

/**
 * Types of content violations
 */
export type ViolationType =
  | 'prohibited_content'
  | 'misleading_claim'
  | 'poor_quality'
  | 'profanity'
  | 'spam'
  | 'copyright_concern'
  | 'medical_claim'
  | 'financial_claim'
  | 'brand_voice_mismatch'
  | 'readability_issue'
  | 'length_violation';

/**
 * Quality metrics for content
 */
export interface QualityMetrics {
  readabilityScore: number;        // 0-100, based on Flesch reading ease
  engagementPotential: number;     // 0-1, predicted engagement
  brandVoiceConsistency: number;   // 0-1, match with brand voice
  sentimentScore: number;          // -1 to 1, sentiment analysis
  keywordDensity: number;          // 0-1, optimal keyword usage
  lengthScore: number;             // 0-1, appropriate length
  grammarScore: number;            // 0-1, grammar quality
}

/**
 * Brand voice consistency result
 */
export interface BrandVoiceConsistencyResult {
  score: number;
  matches: BrandVoiceMatch[];
  mismatches: BrandVoiceMismatch[];
}

export interface BrandVoiceMatch {
  aspect: string;
  confidence: number;
}

export interface BrandVoiceMismatch {
  aspect: string;
  expected: string;
  actual: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Content moderation options
 */
export interface ModerationOptions {
  checkPolicies?: boolean;
  checkQuality?: boolean;
  checkBrandVoice?: boolean;
  brandVoiceId?: string;
  strictMode?: boolean;
  customThreshold?: number;
}

/**
 * Moderate content for policy compliance and quality
 */
export async function moderateContent(
  productId: string,
  content: {
    title: string;
    description: string;
    tags?: string[];
  },
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const startTime = Date.now();
  const threshold = options.customThreshold || 0.7;

  const violations: ContentViolation[] = [];

  try {
    // 1. Policy compliance check
    if (options.checkPolicies !== false) {
      const policyViolations = await checkPolicyCompliance(content);
      violations.push(...policyViolations);
    }

    // 2. Quality scoring
    const qualityMetrics = await calculateQualityScore(content);

    // 3. Brand voice consistency check
    let brandVoiceScore = 1.0;
    if (options.checkBrandVoice && options.brandVoiceId) {
      const brandVoiceResult = await checkBrandVoiceConsistency(
        content,
        options.brandVoiceId
      );
      brandVoiceScore = brandVoiceResult.score;

      // Add brand voice violations
      brandVoiceResult.mismatches.forEach(mismatch => {
        if (mismatch.severity !== 'low') {
          violations.push({
            type: 'brand_voice_mismatch',
            severity: mismatch.severity,
            message: `Brand voice mismatch in ${mismatch.aspect}: Expected ${mismatch.expected}, got ${mismatch.actual}`,
            context: mismatch.aspect,
          });
        }
      });
    }

    // 4. Calculate overall score
    const overallScore = calculateOverallScore(qualityMetrics, brandVoiceScore);

    // 5. Determine decision
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const highViolations = violations.filter(v => v.severity === 'high');

    let decision: 'pass' | 'fail' | 'warn' = 'pass';
    let reason = 'Content passed moderation';
    let isPassed = true;

    if (criticalViolations.length > 0) {
      decision = 'fail';
      reason = `Critical violations found: ${criticalViolations.map(v => v.message).join('; ')}`;
      isPassed = false;
    } else if (highViolations.length > 0 || overallScore < threshold) {
      decision = options.strictMode ? 'fail' : 'warn';
      reason = `Quality concerns detected. Score: ${(overallScore * 100).toFixed(1)}%`;
      isPassed = !options.strictMode;
    } else if (violations.length > 0) {
      decision = 'warn';
      reason = `Minor issues found: ${violations.length} violation(s)`;
    }

    // 6. Log to audit
    await db.insert(safeguardAuditLog).values({
      productId,
      safeguardName: 'content_moderation',
      decision,
      reason,
      score: overallScore,
      threshold,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        violations: violations.map(v => ({
          type: v.type,
          severity: v.severity,
          message: v.message,
        })),
        qualityMetrics,
        brandVoiceScore,
      },
    });

    return {
      isPassed,
      decision,
      reason,
      score: overallScore,
      violations,
      qualityMetrics,
    };
  } catch (error) {
    console.error('Content moderation error:', error);

    await db.insert(safeguardAuditLog).values({
      productId,
      safeguardName: 'content_moderation',
      decision: 'skip',
      reason: `Moderation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      score: 0,
      threshold,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        error: String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      },
    });

    return {
      isPassed: false,
      decision: 'skip',
      reason: 'Content moderation service unavailable',
      score: 0,
      violations: [],
      qualityMetrics: getDefaultQualityMetrics(),
    };
  }
}

/**
 * Check content against policy rules
 */
async function checkPolicyCompliance(content: {
  title: string;
  description: string;
  tags?: string[];
}): Promise<ContentViolation[]> {
  const violations: ContentViolation[] = [];
  const combinedText = `${content.title} ${content.description}`.toLowerCase();

  // Prohibited content patterns
  const prohibitedPatterns = [
    // Explicit content
    { pattern: /\b(porn|xxx|adult|explicit)\b/i, type: 'prohibited_content' as const, severity: 'critical' as const, message: 'Explicit adult content detected' },

    // Violence
    { pattern: /\b(weapon|gun|explosive|bomb)\b/i, type: 'prohibited_content' as const, severity: 'high' as const, message: 'Violent content detected' },

    // Drugs
    { pattern: /\b(drug|narcotic|cocaine|heroin)\b/i, type: 'prohibited_content' as const, severity: 'critical' as const, message: 'Drug-related content detected' },

    // Hate speech
    { pattern: /\b(hate|racist|discrimination)\b/i, type: 'prohibited_content' as const, severity: 'critical' as const, message: 'Hate speech detected' },

    // Medical claims
    { pattern: /\b(cure|treat|diagnose|prevent disease|fda approved)\b/i, type: 'medical_claim' as const, severity: 'high' as const, message: 'Unverified medical claims detected' },

    // Financial claims
    { pattern: /\b(get rich|guaranteed profit|financial freedom|make money fast)\b/i, type: 'financial_claim' as const, severity: 'high' as const, message: 'Suspicious financial claims detected' },

    // Misleading claims
    { pattern: /\b(miracle|revolutionary|instant results|100% guarantee)\b/i, type: 'misleading_claim' as const, severity: 'medium' as const, message: 'Potentially misleading claims detected' },

    // Profanity (basic check)
    { pattern: /\b(damn|hell|crap|shit|fuck|bitch)\b/i, type: 'profanity' as const, severity: 'medium' as const, message: 'Profanity detected' },
  ];

  // Check each pattern
  for (const rule of prohibitedPatterns) {
    if (rule.pattern.test(combinedText)) {
      violations.push({
        type: rule.type,
        severity: rule.severity,
        message: rule.message,
        context: extractContext(combinedText, rule.pattern),
      });
    }
  }

  // Check for spam indicators
  const spamIndicators = checkSpamIndicators(content);
  violations.push(...spamIndicators);

  // Check content length
  if (content.title.length < 10) {
    violations.push({
      type: 'length_violation',
      severity: 'medium',
      message: 'Title is too short (minimum 10 characters)',
    });
  }

  if (content.title.length > 200) {
    violations.push({
      type: 'length_violation',
      severity: 'medium',
      message: 'Title is too long (maximum 200 characters)',
    });
  }

  if (content.description.length < 50) {
    violations.push({
      type: 'length_violation',
      severity: 'low',
      message: 'Description is too short for optimal quality',
    });
  }

  return violations;
}

/**
 * Check for spam indicators
 */
function checkSpamIndicators(content: {
  title: string;
  description: string;
  tags?: string[];
}): ContentViolation[] {
  const violations: ContentViolation[] = [];

  // Excessive caps
  const capsRatio = (content.title.match(/[A-Z]/g) || []).length / content.title.length;
  if (capsRatio > 0.5 && content.title.length > 10) {
    violations.push({
      type: 'spam',
      severity: 'medium',
      message: 'Excessive use of capital letters',
    });
  }

  // Excessive punctuation
  const punctuationRatio = (content.title.match(/[!?]/g) || []).length / content.title.length;
  if (punctuationRatio > 0.2) {
    violations.push({
      type: 'spam',
      severity: 'medium',
      message: 'Excessive use of punctuation',
    });
  }

  // Repeated words
  const words = content.description.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    if (word.length > 3) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  for (const [word, count] of wordCounts) {
    if (count > 10) {
      violations.push({
        type: 'spam',
        severity: 'low',
        message: `Word "${word}" repeated ${count} times`,
        context: word,
      });
    }
  }

  return violations;
}

/**
 * Calculate quality score for content
 */
async function calculateQualityScore(content: {
  title: string;
  description: string;
  tags?: string[];
}): Promise<QualityMetrics> {
  const readabilityScore = calculateReadability(content.description);
  const engagementPotential = calculateEngagementPotential(content);
  const sentimentScore = calculateSentiment(content.description);
  const keywordDensity = calculateKeywordDensity(content);
  const lengthScore = calculateLengthScore(content);
  const grammarScore = calculateGrammarScore(content.description);

  return {
    readabilityScore,
    engagementPotential,
    brandVoiceConsistency: 1.0, // Calculated separately if brand voice is provided
    sentimentScore,
    keywordDensity,
    lengthScore,
    grammarScore,
  };
}

/**
 * Calculate readability score using Flesch Reading Ease
 */
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  // Normalize to 0-100 (higher is better)
  return Math.max(0, Math.min(100, score));
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;

  // Adjust for silent e
  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2) count++;

  return Math.max(1, count);
}

/**
 * Calculate engagement potential
 */
function calculateEngagementPotential(content: {
  title: string;
  description: string;
  tags?: string[];
}): number {
  let score = 0.5; // Base score

  // Title engagement factors
  const titleWords = content.title.split(/\s+/);
  if (titleWords.length >= 5 && titleWords.length <= 15) score += 0.1;

  // Power words in title
  const powerWords = ['amazing', 'exclusive', 'limited', 'premium', 'best', 'top', 'ultimate', 'essential', 'perfect', 'new'];
  const hasPowerWords = powerWords.some(word => content.title.toLowerCase().includes(word));
  if (hasPowerWords) score += 0.1;

  // Description engagement
  const descWords = content.description.split(/\s+/);
  if (descWords.length >= 50 && descWords.length <= 300) score += 0.1;

  // Question in description
  if (content.description.includes('?')) score += 0.05;

  // Call to action
  const ctaPatterns = /\b(buy|get|order|shop|discover|explore|learn|find)\b/i;
  if (ctaPatterns.test(content.description)) score += 0.1;

  // Tag usage
  if (content.tags && content.tags.length >= 3 && content.tags.length <= 10) {
    score += 0.15;
  }

  return Math.min(1.0, score);
}

/**
 * Calculate sentiment score
 */
function calculateSentiment(text: string): number {
  const lowerText = text.toLowerCase();

  // Positive words
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'love', 'best', 'wonderful', 'fantastic', 'quality', 'premium', 'beautiful'];
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;

  // Negative words
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'worst', 'hate', 'cheap', 'defective', 'broken', 'disappointing'];
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

  // Calculate sentiment (-1 to 1)
  const totalWords = text.split(/\s+/).length;
  const sentimentScore = (positiveCount - negativeCount) / Math.max(1, totalWords / 10);

  return Math.max(-1, Math.min(1, sentimentScore));
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(content: {
  title: string;
  description: string;
  tags?: string[];
}): number {
  const titleWords = new Set(
    content.title
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const descWords = content.description.toLowerCase().split(/\s+/);
  let keywordCount = 0;

  for (const word of descWords) {
    if (titleWords.has(word)) keywordCount++;
  }

  const density = keywordCount / Math.max(1, descWords.length);

  // Optimal density is 2-5%
  if (density >= 0.02 && density <= 0.05) return 1.0;
  if (density < 0.02) return density / 0.02;
  return Math.max(0, 1 - (density - 0.05) / 0.05);
}

/**
 * Calculate length score
 */
function calculateLengthScore(content: {
  title: string;
  description: string;
}): number {
  let score = 0;

  // Title length (optimal: 10-70 chars)
  const titleLen = content.title.length;
  if (titleLen >= 10 && titleLen <= 70) {
    score += 0.5;
  } else if (titleLen < 10) {
    score += (titleLen / 10) * 0.5;
  } else {
    score += Math.max(0, 0.5 - (titleLen - 70) / 200);
  }

  // Description length (optimal: 150-500 chars)
  const descLen = content.description.length;
  if (descLen >= 150 && descLen <= 500) {
    score += 0.5;
  } else if (descLen < 150) {
    score += (descLen / 150) * 0.5;
  } else {
    score += Math.max(0, 0.5 - (descLen - 500) / 1000);
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate grammar score (basic check)
 */
function calculateGrammarScore(text: string): number {
  let score = 1.0;

  // Check for common issues
  const issues = [];

  // Repeated spaces
  if (/\s{2,}/.test(text)) {
    issues.push('repeated_spaces');
    score -= 0.1;
  }

  // Missing punctuation at end
  if (text.length > 0 && !/[.!?]$/.test(text.trim())) {
    issues.push('missing_punctuation');
    score -= 0.1;
  }

  // Repeated punctuation
  if (/[.!?,]{2,}/.test(text)) {
    issues.push('repeated_punctuation');
    score -= 0.1;
  }

  // Sentence starting with lowercase
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 0 && /^[a-z]/.test(trimmed)) {
      issues.push('lowercase_sentence');
      score -= 0.05;
      break;
    }
  }

  return Math.max(0, score);
}

/**
 * Check brand voice consistency
 */
export async function checkBrandVoiceConsistency(
  content: {
    title: string;
    description: string;
    tags?: string[];
  },
  brandVoiceId: string
): Promise<BrandVoiceConsistencyResult> {
  try {
    const [brandVoice] = await db
      .select()
      .from(brandVoiceProfiles)
      .where(eq(brandVoiceProfiles.id, brandVoiceId));

    if (!brandVoice) {
      return {
        score: 1.0,
        matches: [],
        mismatches: [],
      };
    }

    const matches: BrandVoiceMatch[] = [];
    const mismatches: BrandVoiceMismatch[] = [];
    let totalScore = 0;
    let checksPerformed = 0;

    // Check tone
    if (brandVoice.tone) {
      const toneScore = checkTone(content, brandVoice.tone);
      checksPerformed++;
      totalScore += toneScore;

      if (toneScore >= 0.7) {
        matches.push({ aspect: 'tone', confidence: toneScore });
      } else {
        mismatches.push({
          aspect: 'tone',
          expected: brandVoice.tone,
          actual: 'inconsistent',
          severity: toneScore < 0.4 ? 'high' : 'medium',
        });
      }
    }

    // Check writing style
    if (brandVoice.writingStyle) {
      const styleScore = checkWritingStyle(content, brandVoice.writingStyle);
      checksPerformed++;
      totalScore += styleScore;

      if (styleScore >= 0.7) {
        matches.push({ aspect: 'writing_style', confidence: styleScore });
      } else {
        mismatches.push({
          aspect: 'writing_style',
          expected: brandVoice.writingStyle,
          actual: 'inconsistent',
          severity: styleScore < 0.4 ? 'high' : 'medium',
        });
      }
    }

    // Check vocabulary level
    if (brandVoice.vocabularyLevel) {
      const vocabScore = checkVocabularyLevel(content, brandVoice.vocabularyLevel);
      checksPerformed++;
      totalScore += vocabScore;

      if (vocabScore >= 0.7) {
        matches.push({ aspect: 'vocabulary', confidence: vocabScore });
      } else {
        mismatches.push({
          aspect: 'vocabulary',
          expected: brandVoice.vocabularyLevel,
          actual: 'inconsistent',
          severity: 'low',
        });
      }
    }

    // Check avoided words
    if (brandVoice.avoidWords && brandVoice.avoidWords.length > 0) {
      const avoidedWordsCheck = checkAvoidedWords(content, brandVoice.avoidWords);
      checksPerformed++;
      totalScore += avoidedWordsCheck.score;

      if (avoidedWordsCheck.violations.length > 0) {
        mismatches.push({
          aspect: 'avoided_words',
          expected: 'none',
          actual: avoidedWordsCheck.violations.join(', '),
          severity: 'medium',
        });
      } else {
        matches.push({ aspect: 'avoided_words', confidence: 1.0 });
      }
    }

    // Check preferred phrases
    if (brandVoice.preferredPhrases && brandVoice.preferredPhrases.length > 0) {
      const phraseScore = checkPreferredPhrases(content, brandVoice.preferredPhrases);
      checksPerformed++;
      totalScore += phraseScore;

      if (phraseScore >= 0.5) {
        matches.push({ aspect: 'preferred_phrases', confidence: phraseScore });
      }
    }

    const finalScore = checksPerformed > 0 ? totalScore / checksPerformed : 1.0;

    return {
      score: finalScore,
      matches,
      mismatches,
    };
  } catch (error) {
    console.error('Brand voice consistency check error:', error);
    return {
      score: 1.0,
      matches: [],
      mismatches: [],
    };
  }
}

/**
 * Check tone consistency
 */
function checkTone(content: { title: string; description: string }, expectedTone: string): number {
  const text = `${content.title} ${content.description}`.toLowerCase();

  const toneIndicators: Record<string, string[]> = {
    professional: ['expertise', 'quality', 'reliable', 'trusted', 'professional', 'industry', 'standards'],
    casual: ['hey', 'cool', 'awesome', 'fun', 'easy', 'simple', 'just', 'really'],
    playful: ['fun', 'exciting', 'adventure', 'explore', 'discover', 'enjoy', 'love', 'yay'],
    authoritative: ['proven', 'research', 'expert', 'leading', 'advanced', 'certified', 'authority'],
    friendly: ['welcome', 'happy', 'enjoy', 'together', 'help', 'support', 'care', 'glad'],
  };

  const indicators = toneIndicators[expectedTone.toLowerCase()] || [];
  const matchCount = indicators.filter(indicator => text.includes(indicator)).length;

  return Math.min(1.0, matchCount / Math.max(1, indicators.length * 0.3));
}

/**
 * Check writing style consistency
 */
function checkWritingStyle(content: { title: string; description: string }, expectedStyle: string): number {
  const text = content.description;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, sentences.length);

  const styleMetrics: Record<string, { minLength: number; maxLength: number }> = {
    formal: { minLength: 15, maxLength: 30 },
    conversational: { minLength: 8, maxLength: 20 },
    technical: { minLength: 12, maxLength: 25 },
    creative: { minLength: 5, maxLength: 25 },
  };

  const metrics = styleMetrics[expectedStyle.toLowerCase()];
  if (!metrics) return 0.8;

  if (avgSentenceLength >= metrics.minLength && avgSentenceLength <= metrics.maxLength) {
    return 1.0;
  }

  const deviation = Math.abs(avgSentenceLength - (metrics.minLength + metrics.maxLength) / 2);
  return Math.max(0, 1 - deviation / 10);
}

/**
 * Check vocabulary level
 */
function checkVocabularyLevel(content: { title: string; description: string }, expectedLevel: string): number {
  const words = content.description.split(/\s+/);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(1, words.length);

  const levelMetrics: Record<string, { minLength: number; maxLength: number }> = {
    simple: { minLength: 3, maxLength: 5 },
    intermediate: { minLength: 4, maxLength: 7 },
    advanced: { minLength: 5, maxLength: 8 },
    technical: { minLength: 6, maxLength: 10 },
  };

  const metrics = levelMetrics[expectedLevel.toLowerCase()];
  if (!metrics) return 0.8;

  if (avgWordLength >= metrics.minLength && avgWordLength <= metrics.maxLength) {
    return 1.0;
  }

  const deviation = Math.abs(avgWordLength - (metrics.minLength + metrics.maxLength) / 2);
  return Math.max(0, 1 - deviation / 3);
}

/**
 * Check for avoided words
 */
function checkAvoidedWords(content: { title: string; description: string }, avoidWords: string[]): {
  score: number;
  violations: string[];
} {
  const text = `${content.title} ${content.description}`.toLowerCase();
  const violations: string[] = [];

  for (const word of avoidWords) {
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
    if (regex.test(text)) {
      violations.push(word);
    }
  }

  const score = violations.length === 0 ? 1.0 : Math.max(0, 1 - violations.length * 0.2);
  return { score, violations };
}

/**
 * Check for preferred phrases
 */
function checkPreferredPhrases(content: { title: string; description: string }, preferredPhrases: string[]): number {
  const text = `${content.title} ${content.description}`.toLowerCase();
  let matchCount = 0;

  for (const phrase of preferredPhrases) {
    if (text.includes(phrase.toLowerCase())) {
      matchCount++;
    }
  }

  return Math.min(1.0, matchCount / Math.max(1, preferredPhrases.length * 0.3));
}

/**
 * Calculate overall content score
 */
function calculateOverallScore(qualityMetrics: QualityMetrics, brandVoiceScore: number): number {
  const weights = {
    readability: 0.15,
    engagement: 0.20,
    brandVoice: 0.20,
    sentiment: 0.10,
    keywords: 0.10,
    length: 0.15,
    grammar: 0.10,
  };

  const score =
    (qualityMetrics.readabilityScore / 100) * weights.readability +
    qualityMetrics.engagementPotential * weights.engagement +
    brandVoiceScore * weights.brandVoice +
    ((qualityMetrics.sentimentScore + 1) / 2) * weights.sentiment +
    qualityMetrics.keywordDensity * weights.keywords +
    qualityMetrics.lengthScore * weights.length +
    qualityMetrics.grammarScore * weights.grammar;

  return Math.max(0, Math.min(1, score));
}

/**
 * Get moderation history for a product
 */
export async function getModerationHistory(productId: string) {
  const history = await db
    .select()
    .from(safeguardAuditLog)
    .where(eq(safeguardAuditLog.productId, productId))
    .where(eq(safeguardAuditLog.safeguardName, 'content_moderation'))
    .orderBy(desc(safeguardAuditLog.assessedAt));

  return history;
}

/**
 * Extract context around a matched pattern
 */
function extractContext(text: string, pattern: RegExp, contextLength = 50): string {
  const match = text.match(pattern);
  if (!match || match.index === undefined) return '';

  const start = Math.max(0, match.index - contextLength);
  const end = Math.min(text.length, match.index + match[0].length + contextLength);

  return '...' + text.substring(start, end) + '...';
}

/**
 * Get default quality metrics
 */
function getDefaultQualityMetrics(): QualityMetrics {
  return {
    readabilityScore: 0,
    engagementPotential: 0,
    brandVoiceConsistency: 0,
    sentimentScore: 0,
    keywordDensity: 0,
    lengthScore: 0,
    grammarScore: 0,
  };
}
