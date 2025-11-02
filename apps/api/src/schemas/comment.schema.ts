import { z } from 'zod';

/**
 * Validation schemas for comment operations
 */

/**
 * Update comment schema
 */
export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment body is required')
    .max(5000, 'Comment body must not exceed 5000 characters')
    .trim(),
});

/**
 * Add reaction schema
 */
export const addReactionSchema = z.object({
  emoji: z
    .string()
    .min(1, 'Emoji is required')
    .max(10, 'Emoji must not exceed 10 characters')
    .trim(),
});

/**
 * Inferred TypeScript types
 */
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;
