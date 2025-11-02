import { z } from 'zod';

/**
 * Validation schemas for label operations
 */

/**
 * Create label schema
 */
export const createLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must not exceed 50 characters')
    .trim(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
});

/**
 * Update label schema
 */
export const updateLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must not exceed 50 characters')
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color')
    .optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
});

/**
 * Inferred TypeScript types
 */
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
