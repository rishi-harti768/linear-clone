import { z } from 'zod';

/**
 * Validation schemas for issue operations
 */

/**
 * Issue status enum
 */
export const issueStatusEnum = z.enum(['backlog', 'todo', 'in_progress', 'done', 'cancelled']);

/**
 * Issue priority enum
 */
export const issuePriorityEnum = z.enum(['none', 'low', 'medium', 'high', 'urgent']);

/**
 * Create issue schema
 */
export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .trim(),
  description: z.string().max(10000, 'Description must not exceed 10000 characters').optional(),
  status: issueStatusEnum.default('backlog'),
  priority: issuePriorityEnum.default('none'),
  assigneeId: z.string().uuid('Invalid assignee ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  cycleId: z.string().uuid('Invalid cycle ID').optional(),
  parentId: z.string().uuid('Invalid parent issue ID').optional(),
  dueDate: z.string().datetime('Invalid date format').optional(),
  estimate: z.number().int().min(0).max(100).optional(),
  labelIds: z.array(z.string().uuid('Invalid label ID')).optional(),
});

/**
 * Update issue schema
 */
export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .trim()
    .optional(),
  description: z.string().max(10000, 'Description must not exceed 10000 characters').optional(),
  status: issueStatusEnum.optional(),
  priority: issuePriorityEnum.optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').nullable().optional(),
  projectId: z.string().uuid('Invalid project ID').nullable().optional(),
  cycleId: z.string().uuid('Invalid cycle ID').nullable().optional(),
  parentId: z.string().uuid('Invalid parent issue ID').nullable().optional(),
  dueDate: z.string().datetime('Invalid date format').nullable().optional(),
  estimate: z.number().int().min(0).max(100).nullable().optional(),
  sortOrder: z.number().optional(),
});

/**
 * Issue filter schema (for list endpoint)
 */
export const issueFilterSchema = z.object({
  status: z.union([issueStatusEnum, z.array(issueStatusEnum)]).optional(),
  priority: z.union([issuePriorityEnum, z.array(issuePriorityEnum)]).optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  cycleId: z.string().uuid('Invalid cycle ID').optional(),
  archived: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

/**
 * Create comment schema
 */
export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment body is required')
    .max(5000, 'Comment body must not exceed 5000 characters')
    .trim(),
  parentId: z.string().uuid('Invalid parent comment ID').optional(),
});

/**
 * Inferred TypeScript types
 */
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueFilterInput = z.infer<typeof issueFilterSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
