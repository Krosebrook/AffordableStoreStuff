/**
 * Observability Module
 * Provides structured logging, error tracking, metrics, and retry logic
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  requestId?: string;
  duration?: number;
}

interface MetricEntry {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

class Logger {
  private service: string;
  private requestId?: string;

  constructor(service: string, requestId?: string) {
    this.service = service;
    this.requestId = requestId;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
  }

  private formatEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      requestId: this.requestId,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: (error as any).code,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}]`;
    const reqId = entry.requestId ? ` [${entry.requestId}]` : '';
    const dur = entry.duration ? ` (${entry.duration}ms)` : '';
    
    const base = `${prefix}${reqId}${dur} ${entry.message}`;
    
    if (entry.level === 'error') {
      console.error(base, entry.context || '', entry.error?.stack || '');
    } else if (entry.level === 'warn') {
      console.warn(base, entry.context || '');
    } else if (entry.level === 'debug') {
      console.debug(base, entry.context || '');
    } else {
      console.log(base, entry.context ? JSON.stringify(entry.context) : '');
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatEntry('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.output(this.formatEntry('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatEntry('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.output(this.formatEntry('error', message, context, error));
    }
  }

  child(requestId: string): Logger {
    return new Logger(this.service, requestId);
  }

  timed<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const start = Date.now();
    return fn()
      .then((result) => {
        const duration = Date.now() - start;
        this.info(`${operation} completed`, { ...context, duration });
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - start;
        this.error(`${operation} failed`, error, { ...context, duration });
        throw error;
      });
  }
}

export function createLogger(service: string, requestId?: string): Logger {
  return new Logger(service, requestId);
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, delayMs: number) => void;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error) => {
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
    if (error.status === 429 || error.status >= 500) return true;
    if (error.message?.includes('rate limit')) return true;
    return false;
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt === opts.maxAttempts) {
        throw error;
      }

      const shouldRetry = opts.shouldRetry?.(error, attempt) ?? true;
      if (!shouldRetry) {
        throw error;
      }

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100,
        opts.maxDelayMs
      );

      opts.onRetry?.(error, attempt, delay);
      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private options: CircuitBreakerOptions;
  private logger: Logger;
  private name: string;

  constructor(name: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.name = name;
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      timeout: options.timeout ?? 30000,
    };
    this.logger = createLogger(`CircuitBreaker:${name}`);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureTime || 0) > this.options.timeout) {
        this.transitionTo('half-open');
      } else {
        recordMetric('circuit_breaker.rejected', 1, { name: this.name, state: 'open' });
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.logger.info(`Circuit breaker state: ${oldState} -> ${newState}`);
    recordMetric('circuit_breaker.transition', 1, { 
      name: this.name, 
      from: oldState, 
      to: newState 
    });
  }

  private onSuccess(): void {
    recordMetric('circuit_breaker.success', 1, { name: this.name, state: this.state });
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.transitionTo('closed');
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    
    recordMetric('circuit_breaker.failure', 1, { 
      name: this.name, 
      state: this.state,
      failureCount: String(this.failureCount)
    });

    if (this.failureCount >= this.options.failureThreshold && this.state === 'closed') {
      this.transitionTo('open');
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): { state: CircuitState; failureCount: number; successCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }

  reset(): void {
    const oldState = this.state;
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    if (oldState !== 'closed') {
      this.logger.info(`Circuit breaker manually reset from ${oldState}`);
      recordMetric('circuit_breaker.reset', 1, { name: this.name, from: oldState });
    }
  }
}

const metrics: MetricEntry[] = [];
const MAX_METRICS = 1000;

export function recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
  metrics.push({
    name,
    value,
    tags,
    timestamp: Date.now(),
  });

  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
}

export function getMetrics(name?: string, since?: number): MetricEntry[] {
  let filtered = metrics;
  
  if (name) {
    filtered = filtered.filter((m) => m.name === name);
  }
  
  if (since) {
    filtered = filtered.filter((m) => m.timestamp >= since);
  }
  
  return filtered;
}

export function clearMetrics(): void {
  metrics.length = 0;
}

const errors: Array<{ error: Error; context: Record<string, any>; timestamp: number }> = [];
const MAX_ERRORS = 100;

export function trackError(error: Error, context: Record<string, any> = {}): void {
  errors.push({
    error,
    context,
    timestamp: Date.now(),
  });

  if (errors.length > MAX_ERRORS) {
    errors.shift();
  }
}

export function getRecentErrors(limit = 20): Array<{ error: Error; context: Record<string, any>; timestamp: number }> {
  return errors.slice(-limit);
}

export class GracefulDegradation<T> {
  private fallbackValue: T;
  private logger: Logger;

  constructor(serviceName: string, fallback: T) {
    this.fallbackValue = fallback;
    this.logger = createLogger(`GracefulDegradation:${serviceName}`);
  }

  getFallback(): T {
    return this.fallbackValue;
  }

  async execute(fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      this.logger.warn('Degrading to fallback value', { ...context, error: error.message });
      trackError(error, { ...context, fallbackUsed: true });
      recordMetric('graceful_degradation.fallback', 1, context || {});
      return this.fallbackValue;
    }
  }
}
