import type { Context, Next } from 'hono';
import { cors as honoCors } from 'hono/cors';

/**
 * CORS Middleware
 * Configure Cross-Origin Resource Sharing for frontend access
 * Following security best practices from copilot-instructions.md
 */

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origin?: string | string[];
  credentials?: boolean;
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  maxAge?: number;
}

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Production: only allow specific origins
  if (process.env.NODE_ENV === 'production') {
    return [frontendUrl];
  }

  // Development: allow localhost variants
  return [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
}

/**
 * CORS middleware factory
 * Returns configured CORS middleware
 */
export function corsMiddleware(options?: CorsOptions) {
  const allowedOrigins = getAllowedOrigins();

  return honoCors({
    origin: options?.origin || allowedOrigins,
    credentials: options?.credentials !== false, // Default to true
    allowMethods: options?.allowMethods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: options?.allowHeaders || [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposeHeaders: options?.exposeHeaders || ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: options?.maxAge || 86400, // 24 hours
  });
}

/**
 * Custom CORS handler for WebSocket upgrade requests
 * WebSocket connections need special CORS handling
 */
export async function corsWebSocketMiddleware(c: Context, next: Next): Promise<void> {
  const origin = c.req.header('Origin');
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Max-Age', '86400');
    c.status(204);
    return;
  }

  await next();
}

/**
 * Strict CORS middleware - Only allow specific origin
 * Use for sensitive endpoints
 */
export function strictCorsMiddleware() {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return honoCors({
    origin: frontendUrl,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
}

/**
 * Public CORS middleware - Allow all origins
 * Use only for truly public endpoints (health check, status)
 */
export function publicCorsMiddleware() {
  return honoCors({
    origin: '*',
    credentials: false,
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  });
}
