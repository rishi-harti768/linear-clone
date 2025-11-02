import { z } from 'zod';

/**
 * Validation schemas for cycle operations
 */

/**
 * Create cycle schema
 */
export const createCycleSchema = z.object({
  name: z
    .string()
    .min(1, 'Cycle name is required')
    .max(100, 'Cycle name must not exceed 100 characters')
    .trim(),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
});

/**
 * Update cycle schema
 */
export const updateCycleSchema = z.object({
  name: z
    .string()
    .min(1, 'Cycle name is required')
    .max(100, 'Cycle name must not exceed 100 characters')
    .trim()
    .optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
});

/**
 * Inferred TypeScript types
 */
export type CreateCycleInput = z.infer<typeof createCycleSchema>;
export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;
