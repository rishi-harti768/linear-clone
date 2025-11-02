import { z } from 'zod';

/**
 * Validation schemas for search operations
 */

/**
 * Global search schema
 */
export const globalSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Query must not exceed 200 characters'),
  type: z.enum(['issues', 'projects', 'users', 'all']).default('all'),
  limit: z.number().int().min(1).max(50).default(20),
});

/**
 * Issue search schema
 */
export const issueSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Query must not exceed 200 characters'),
  teamId: z.string().uuid('Invalid team ID').optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

/**
 * Inferred TypeScript types
 */
export type GlobalSearchInput = z.infer<typeof globalSearchSchema>;
export type IssueSearchInput = z.infer<typeof issueSearchSchema>;
