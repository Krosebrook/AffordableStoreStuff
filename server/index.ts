import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool } from "./db";
import { startScheduler, stopScheduler } from "./services/scheduling-service";

// Validate required environment variables
const requiredEnvVars = ['SESSION_SECRET', 'DATABASE_URL'];

// Add ALLOWED_ORIGINS to required vars in production
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('ALLOWED_ORIGINS');
}

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these in your .env file or environment configuration.');
  process.exit(1);
}

// Validate SESSION_SECRET strength in production
if (process.env.NODE_ENV === 'production') {
  const sessionSecret = process.env.SESSION_SECRET || '';
  if (sessionSecret.length < 32) {
    console.error('❌ SESSION_SECRET must be at least 32 characters in production');
    console.error('Generate a secure secret with: openssl rand -base64 32');
    process.exit(1);
  }
  if (sessionSecret.includes('dev') || sessionSecret.includes('change')) {
    console.error('❌ SESSION_SECRET appears to be a default/dev value');
    console.error('Please use a unique secret for production');
    process.exit(1);
  }
}

const app = express();
const httpServer = createServer(app);

// HTTPS redirect in production (when behind proxy like Replit)
if (process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY !== 'false') {
  app.enable('trust proxy');
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Security middleware - helmet for security headers
// Note: CSP is disabled here because it's configured in client/index.html meta tag
// This allows for different CSP policies between dev and production builds
app.use(helmet({
  contentSecurityPolicy: false, // Configured in HTML <meta> tag (client/index.html)
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : (process.env.NODE_ENV === 'production' 
      ? [] // Empty in production - MUST set ALLOWED_ORIGINS
      : ['http://localhost:5000', 'http://localhost:3000']);

// Validate CORS configuration in production
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.error('❌ ALLOWED_ORIGINS must be set in production');
  console.error('Example: ALLOWED_ORIGINS="https://yourdomain.com"');
  process.exit(1);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost and replit origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('replit')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins (exact match or wildcard)
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Use exact match to prevent subdomain attacks
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression({
  level: 6, // Balance between speed and compression ratio
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' // Skip health check
});

// More strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(cookieParser());

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!, // Required, validated at startup
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    },
  })
);

app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '10mb' }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Only log response bodies in development, and exclude sensitive data
      if (process.env.NODE_ENV !== 'production' && capturedJsonResponse) {
        // Don't log passwords, tokens, or other sensitive fields
        // Note: This is a shallow sanitization. For deep objects, consider a recursive approach.
        const safeResponse = { ...capturedJsonResponse };
        const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'sessionId', 'email'];
        sensitiveFields.forEach(field => {
          if (field in safeResponse) {
            safeResponse[field] = '[REDACTED]';
          }
        });
        logLine += ` :: ${JSON.stringify(safeResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Health check endpoint (before routes to avoid auth)
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Health check available at: http://localhost:${port}/api/health`);
      startScheduler();
    },
  );

  // Graceful shutdown handling
  const shutdownTimeout = parseInt(process.env.SHUTDOWN_TIMEOUT_MS || '10000', 10);
  
  const shutdown = async (signal: string) => {
    log(`${signal} received, shutting down gracefully...`);
    
    httpServer.close(async () => {
      log('HTTP server closed');

      stopScheduler();

      try {
        await pool.end();
        log('Database connections closed');
      } catch (err) {
        console.error('Error closing database connections:', err);
      }
      
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error(`Forced shutdown after ${shutdownTimeout}ms timeout`);
      process.exit(1);
    }, shutdownTimeout);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})();
