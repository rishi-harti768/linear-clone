import { z } from 'zod';

/**
 * Validation schemas for team operations
 */

/**
 * Create team schema
 */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name must not exceed 100 characters')
    .trim(),
  identifier: z
    .string()
    .min(2, 'Identifier must be at least 2 characters')
    .max(4, 'Identifier must not exceed 4 characters')
    .regex(/^[A-Z]+$/, 'Identifier must contain only uppercase letters')
    .trim(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  icon: z.string().max(10, 'Icon must not exceed 10 characters').optional(),
});

/**
 * Update team schema
 */
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name must not exceed 100 characters')
    .trim()
    .optional(),
  identifier: z
    .string()
    .min(2, 'Identifier must be at least 2 characters')
    .max(4, 'Identifier must not exceed 4 characters')
    .regex(/^[A-Z]+$/, 'Identifier must contain only uppercase letters')
    .trim()
    .optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  icon: z.string().max(10, 'Icon must not exceed 10 characters').optional(),
});

/**
 * Add team member schema
 */
export const addTeamMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * Inferred TypeScript types
 */
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
