import { z } from 'zod';

/**
 * Validation schemas for workspace operations
 */

/**
 * Create workspace schema
 */
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must not exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  icon: z.string().max(10, 'Icon must not exceed 10 characters').optional(),
});

/**
 * Update workspace schema
 */
export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must not exceed 100 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim()
    .optional(),
  icon: z.string().max(10, 'Icon must not exceed 10 characters').optional(),
});

/**
 * Add workspace member schema
 */
export const addWorkspaceMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['owner', 'admin', 'member', 'guest'], {
    errorMap: () => ({ message: 'Role must be one of: owner, admin, member, guest' }),
  }),
});

/**
 * Inferred TypeScript types
 */
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
