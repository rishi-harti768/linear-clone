import { z } from 'zod';

/**
 * Validation schemas for project operations
 */

/**
 * Project status enum
 */
export const projectStatusEnum = z.enum(['planned', 'in_progress', 'completed', 'cancelled']);

/**
 * Create project schema
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must not exceed 100 characters')
    .trim(),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  status: projectStatusEnum.default('planned'),
  startDate: z.string().datetime('Invalid date format').optional(),
  targetDate: z.string().datetime('Invalid date format').optional(),
  leadId: z.string().uuid('Invalid lead ID').optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color')
    .optional(),
});

/**
 * Update project schema
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must not exceed 100 characters')
    .trim()
    .optional(),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  status: projectStatusEnum.optional(),
  startDate: z.string().datetime('Invalid date format').nullable().optional(),
  targetDate: z.string().datetime('Invalid date format').nullable().optional(),
  leadId: z.string().uuid('Invalid lead ID').nullable().optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color')
    .optional(),
});

/**
 * Inferred TypeScript types
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
