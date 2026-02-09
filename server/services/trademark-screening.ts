import { db } from "../db";
import { safeguardAuditLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// USPTO API configuration
const USPTO_API_BASE = "https://developer.uspto.gov/ibd-api/v1";
const USPTO_API_KEY = process.env.USPTO_API_KEY;

// EUIPO API configuration
const EUIPO_API_BASE = "https://euipo.europa.eu/copla/trademark/data";

export interface TrademarkSearchResult {
  isCleared: boolean;
  matches: TrademarkMatch[];
  decision: 'pass' | 'fail' | 'warn' | 'skip';
  reason: string;
  score: number;
}

export interface TrademarkMatch {
  source: 'USPTO' | 'EUIPO';
  trademark: string;
  serialNumber: string;
  status: string;
  owner: string;
  similarity: number;
  registrationDate?: string;
  classes?: string[];
}

export interface TrademarkScreeningOptions {
  skipOnError?: boolean;
  threshold?: number;
  includeInactive?: boolean;
}

/**
 * Screen a product name and description for trademark conflicts
 */
export async function screenForTrademarks(
  productId: string,
  productName: string,
  description?: string,
  categories?: string[],
  options: TrademarkScreeningOptions = {}
): Promise<TrademarkSearchResult> {
  const startTime = Date.now();
  const threshold = options.threshold || 0.7;

  // Validate inputs
  if (!productName || productName.trim().length === 0) {
    return logAndReturnError(
      productId,
      'Invalid input: Product name is required',
      threshold,
      startTime
    );
  }

  if (productName.length > 500) {
    return logAndReturnError(
      productId,
      'Invalid input: Product name exceeds maximum length',
      threshold,
      startTime
    );
  }

  try {
    // Search both USPTO and EUIPO databases
    const [usptoResults, euipoResults] = await Promise.allSettled([
      searchUSPTO(productName, categories),
      searchEUIPO(productName, categories),
    ]);

    const matches: TrademarkMatch[] = [];

    // Combine results from both sources
    if (usptoResults.status === 'fulfilled') {
      matches.push(...usptoResults.value);
    } else {
      console.error('USPTO search failed:', usptoResults.reason);
    }

    if (euipoResults.status === 'fulfilled') {
      matches.push(...euipoResults.value);
    } else {
      console.error('EUIPO search failed:', euipoResults.reason);
    }

    // Additional screening on description for brand names
    if (description) {
      const descriptionMatches = await screenDescriptionForBrands(description);
      matches.push(...descriptionMatches);
    }

    // Calculate risk score and decision
    const result = assessTrademarkRisk(matches, productName, threshold);

    // Log the trademark screening to audit log
    await db.insert(safeguardAuditLog).values({
      productId,
      safeguardName: 'trademark_screening',
      decision: result.decision,
      reason: result.reason,
      score: result.score,
      threshold,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        totalMatches: matches.length,
        highRiskMatches: matches.filter(m => m.similarity > 0.8).length,
        mediumRiskMatches: matches.filter(m => m.similarity > 0.6 && m.similarity <= 0.8).length,
        sources: ['USPTO', 'EUIPO'],
        searchTerm: productName,
      },
    });

    return result;
  } catch (error) {
    console.error('Trademark screening error:', error);

    // Log the error
    await db.insert(safeguardAuditLog).values({
      productId,
      safeguardName: 'trademark_screening',
      decision: options.skipOnError ? 'skip' : 'warn',
      reason: `Screening failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      score: 0,
      threshold,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        error: String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      },
    });

    return {
      isCleared: false,
      matches: [],
      decision: options.skipOnError ? 'skip' : 'warn',
      reason: 'Trademark screening service unavailable - manual review recommended',
      score: 0.5,
    };
  }
}

/**
 * Search USPTO trademark database
 */
async function searchUSPTO(searchTerm: string, categories?: string[]): Promise<TrademarkMatch[]> {
  if (!USPTO_API_KEY) {
    console.warn('USPTO_API_KEY not configured, skipping USPTO search');
    return [];
  }

  try {
    // USPTO API search endpoint
    const params = new URLSearchParams({
      searchTerm,
      status: 'active',
      limit: '50',
    });

    const response = await fetch(`${USPTO_API_BASE}/trademark/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${USPTO_API_KEY}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.warn(`USPTO API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    return parseUSPTOResults(data, searchTerm);
  } catch (error) {
    console.error('USPTO search error:', error);
    return [];
  }
}

/**
 * Search EUIPO trademark database
 */
async function searchEUIPO(searchTerm: string, categories?: string[]): Promise<TrademarkMatch[]> {
  try {
    // EUIPO public search (simplified - actual API may require authentication)
    const params = new URLSearchParams({
      term: searchTerm,
      type: 'trademark',
      limit: '50',
    });

    const response = await fetch(`${EUIPO_API_BASE}/search?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.warn(`EUIPO API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    return parseEUIPOResults(data, searchTerm);
  } catch (error) {
    console.error('EUIPO search error:', error);
    return [];
  }
}

/**
 * Parse USPTO API results into standard format
 */
function parseUSPTOResults(data: any, searchTerm: string): TrademarkMatch[] {
  if (!data.trademarks || !Array.isArray(data.trademarks)) {
    return [];
  }

  return data.trademarks
    .filter((tm: any) => tm.status === 'Active' || tm.status === 'Registered')
    .map((tm: any) => ({
      source: 'USPTO' as const,
      trademark: tm.wordMark || tm.mark,
      serialNumber: tm.serialNumber,
      status: tm.status,
      owner: tm.owner || tm.ownerName || 'Unknown',
      similarity: calculateSimilarity(searchTerm, tm.wordMark || tm.mark),
      registrationDate: tm.registrationDate,
      classes: tm.internationalClasses || [],
    }))
    .filter((match: TrademarkMatch) => match.similarity > 0.5); // Only keep matches > 50% similar
}

/**
 * Parse EUIPO API results into standard format
 */
function parseEUIPOResults(data: any, searchTerm: string): TrademarkMatch[] {
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results
    .filter((tm: any) => tm.status === 'Registered' || tm.status === 'Active')
    .map((tm: any) => ({
      source: 'EUIPO' as const,
      trademark: tm.trademark || tm.name,
      serialNumber: tm.applicationNumber || tm.id,
      status: tm.status,
      owner: tm.applicant || tm.holder || 'Unknown',
      similarity: calculateSimilarity(searchTerm, tm.trademark || tm.name),
      registrationDate: tm.registrationDate,
      classes: tm.niceClasses || [],
    }))
    .filter((match: TrademarkMatch) => match.similarity > 0.5);
}

/**
 * Screen description text for known brand names
 */
async function screenDescriptionForBrands(description: string): Promise<TrademarkMatch[]> {
  // List of well-known brands to flag (this should be expanded or loaded from a database)
  const knownBrands = [
    'Apple', 'Microsoft', 'Google', 'Amazon', 'Facebook', 'Meta', 'Nike',
    'Adidas', 'Coca-Cola', 'Pepsi', 'Samsung', 'Sony', 'Disney', 'Netflix',
    'Tesla', 'BMW', 'Mercedes', 'Toyota', 'Honda', 'Ford', 'Gucci', 'Prada',
    'Louis Vuitton', 'Chanel', 'Rolex', 'Starbucks', 'McDonald\'s', 'Walmart',
    'Target', 'Best Buy', 'Home Depot', 'Lowe\'s', 'IKEA', 'H&M', 'Zara',
  ];

  const matches: TrademarkMatch[] = [];
  const lowerDesc = description.toLowerCase();

  for (const brand of knownBrands) {
    // Use word boundary matching to avoid false positives
    const regex = new RegExp(`\\b${brand.toLowerCase()}\\b`, 'i');
    if (regex.test(lowerDesc)) {
      matches.push({
        source: 'USPTO',
        trademark: brand,
        serialNumber: 'KNOWN_BRAND',
        status: 'Registered',
        owner: 'Well-known trademark',
        similarity: 1.0,
      });
    }
  }

  return matches;
}

/**
 * Calculate string similarity score (0-1)
 * Uses Levenshtein distance algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0;

  // Create a 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);

  // Convert distance to similarity (0-1)
  return 1 - distance / maxLen;
}

/**
 * Assess trademark risk based on matches
 */
function assessTrademarkRisk(
  matches: TrademarkMatch[],
  searchTerm: string,
  threshold: number
): TrademarkSearchResult {
  if (matches.length === 0) {
    return {
      isCleared: true,
      matches,
      decision: 'pass',
      reason: 'No trademark conflicts found',
      score: 1.0,
    };
  }

  // Find the highest similarity match
  const highestSimilarity = Math.max(...matches.map(m => m.similarity));
  const highRiskMatches = matches.filter(m => m.similarity > 0.8);
  const mediumRiskMatches = matches.filter(m => m.similarity > 0.6 && m.similarity <= 0.8);

  // Decision logic
  if (highestSimilarity > 0.9 || highRiskMatches.length > 0) {
    return {
      isCleared: false,
      matches,
      decision: 'fail',
      reason: `High-risk trademark conflict detected. ${highRiskMatches.length} match(es) with >80% similarity. Manual review required.`,
      score: 1 - highestSimilarity,
    };
  }

  if (highestSimilarity > threshold || mediumRiskMatches.length > 2) {
    return {
      isCleared: false,
      matches,
      decision: 'warn',
      reason: `Potential trademark conflicts found. ${mediumRiskMatches.length} match(es) with moderate similarity. Review recommended.`,
      score: 1 - highestSimilarity,
    };
  }

  if (matches.length > 0) {
    return {
      isCleared: true,
      matches,
      decision: 'warn',
      reason: `${matches.length} low-risk trademark match(es) found. Proceed with caution.`,
      score: 1 - highestSimilarity,
    };
  }

  return {
    isCleared: true,
    matches,
    decision: 'pass',
    reason: 'Trademark screening passed with low risk',
    score: 1 - highestSimilarity,
  };
}

/**
 * Get trademark screening history for a product
 */
export async function getTrademarkHistory(productId: string) {
  const history = await db
    .select()
    .from(safeguardAuditLog)
    .where(eq(safeguardAuditLog.productId, productId))
    .where(eq(safeguardAuditLog.safeguardName, 'trademark_screening'))
    .orderBy(desc(safeguardAuditLog.assessedAt));

  return history;
}

/**
 * Batch screen multiple products for trademarks
 */
export async function batchScreenTrademarks(
  products: Array<{ id: string; name: string; description?: string; categories?: string[] }>,
  options: TrademarkScreeningOptions = {}
): Promise<Map<string, TrademarkSearchResult>> {
  const results = new Map<string, TrademarkSearchResult>();

  // Process in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(p =>
        screenForTrademarks(p.id, p.name, p.description, p.categories, options)
      )
    );

    batch.forEach((product, idx) => {
      results.set(product.id, batchResults[idx]);
    });

    // Small delay between batches to respect API rate limits
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Helper function to log errors and return a result
 */
function logAndReturnError(
  productId: string,
  reason: string,
  threshold: number,
  startTime: number
): TrademarkSearchResult {
  db.insert(safeguardAuditLog).values({
    productId,
    safeguardName: 'trademark_screening',
    decision: 'skip',
    reason,
    score: 0,
    threshold,
    executionTimeMs: Date.now() - startTime,
    metadata: { validationError: true },
  }).catch(err => console.error('Failed to log audit entry:', err));

  return {
    isCleared: false,
    matches: [],
    decision: 'skip',
    reason,
    score: 0,
  };
}
