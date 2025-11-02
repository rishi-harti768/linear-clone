/**
 * Middleware exports
 * Clean architecture: Cross-cutting concerns at middleware layer
 */

// Authentication
export { authMiddleware, optionalAuthMiddleware } from './auth';

// CORS
export {
  corsMiddleware,
  corsWebSocketMiddleware,
  strictCorsMiddleware,
  publicCorsMiddleware,
} from './cors';

// Error handling
export { errorHandler } from './error-handler';

// Validation
export {
  validateBody,
  validateQuery,
  validateParams,
  validate,
  getValidatedBody,
  getValidatedQuery,
  getValidatedParams,
} from './validation';

// Rate limiting
export {
  rateLimitMiddleware,
  authRateLimit,
  writeRateLimit,
  readRateLimit,
  getRateLimitStats,
  shutdownRateLimiters,
  apiRateLimiter,
  authRateLimiter,
  writeRateLimiter,
  readRateLimiter,
} from './rate-limit';
