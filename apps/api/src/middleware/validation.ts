import type { Context, Next } from 'hono';
import type { ZodSchema, z } from 'zod';

/**
 * Validation Middleware
 * Request validation using Zod schemas
 * Following type safety principles from copilot-instructions.md
 */

/**
 * Validation error response
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Format Zod errors into user-friendly format
 */
function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Validate request body against Zod schema
 * Returns middleware function that validates and attaches parsed data to context
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    try {
      // Parse request body
      const body = await c.req.json();

      // Validate against schema
      const result = schema.safeParse(body);

      if (!result.success) {
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed',
              details: formatZodErrors(result.error),
            },
          },
          422
        );
      }

      // Attach validated data to context
      c.set('validatedBody', result.data);

      await next();
    } catch (error) {
      console.error('[Validation] Body parsing error:', error);
      return c.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
        },
        400
      );
    }
  };
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    try {
      // Get all query parameters
      const query = c.req.query();

      // Validate against schema
      const result = schema.safeParse(query);

      if (!result.success) {
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Query parameter validation failed',
              details: formatZodErrors(result.error),
            },
          },
          422
        );
      }

      // Attach validated data to context
      c.set('validatedQuery', result.data);

      await next();
    } catch (error) {
      console.error('[Validation] Query parsing error:', error);
      return c.json(
        {
          error: {
            code: 'INVALID_QUERY',
            message: 'Invalid query parameters',
          },
        },
        400
      );
    }
  };
}

/**
 * Validate route parameters against Zod schema
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    try {
      // Get all route parameters
      const params = c.req.param();

      // Validate against schema
      const result = schema.safeParse(params);

      if (!result.success) {
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Route parameter validation failed',
              details: formatZodErrors(result.error),
            },
          },
          422
        );
      }

      // Attach validated data to context
      c.set('validatedParams', result.data);

      await next();
    } catch (error) {
      console.error('[Validation] Params parsing error:', error);
      return c.json(
        {
          error: {
            code: 'INVALID_PARAMS',
            message: 'Invalid route parameters',
          },
        },
        400
      );
    }
  };
}

/**
 * Get validated body from context
 * Helper function for route handlers
 */
export function getValidatedBody<T>(c: Context): T {
  const data = c.get('validatedBody');
  if (!data) {
    throw new Error('No validated body found. Did you forget to use validateBody middleware?');
  }
  return data as T;
}

/**
 * Get validated query from context
 */
export function getValidatedQuery<T>(c: Context): T {
  const data = c.get('validatedQuery');
  if (!data) {
    throw new Error('No validated query found. Did you forget to use validateQuery middleware?');
  }
  return data as T;
}

/**
 * Get validated params from context
 */
export function getValidatedParams<T>(c: Context): T {
  const data = c.get('validatedParams');
  if (!data) {
    throw new Error('No validated params found. Did you forget to use validateParams middleware?');
  }
  return data as T;
}

/**
 * Combined validation - body, query, and params
 * Useful when you need to validate multiple sources
 */
export function validate<
  TBody extends ZodSchema,
  TQuery extends ZodSchema,
  TParams extends ZodSchema,
>(options: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}) {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    try {
      // Validate body if schema provided
      if (options.body) {
        const body = await c.req.json();
        const bodyResult = options.body.safeParse(body);
        if (!bodyResult.success) {
          return c.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Request body validation failed',
                details: formatZodErrors(bodyResult.error),
              },
            },
            422
          );
        }
        c.set('validatedBody', bodyResult.data);
      }

      // Validate query if schema provided
      if (options.query) {
        const query = c.req.query();
        const queryResult = options.query.safeParse(query);
        if (!queryResult.success) {
          return c.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Query parameter validation failed',
                details: formatZodErrors(queryResult.error),
              },
            },
            422
          );
        }
        c.set('validatedQuery', queryResult.data);
      }

      // Validate params if schema provided
      if (options.params) {
        const params = c.req.param();
        const paramsResult = options.params.safeParse(params);
        if (!paramsResult.success) {
          return c.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Route parameter validation failed',
                details: formatZodErrors(paramsResult.error),
              },
            },
            422
          );
        }
        c.set('validatedParams', paramsResult.data);
      }

      await next();
    } catch (error) {
      console.error('[Validation] Combined validation error:', error);
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
          },
        },
        400
      );
    }
  };
}
