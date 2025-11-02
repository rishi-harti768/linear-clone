import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  type AddReactionInput,
  type UpdateCommentInput,
  addReactionSchema,
  updateCommentSchema,
} from '../schemas/comment.schema';

type AuthVariables = { userId: string; userEmail: string };
const comments = new Hono<{ Variables: AuthVariables }>();
comments.use('*', authMiddleware);

// PATCH /api/comments/:id - Update comment
comments.patch('/:id', async (c) => {
  try {
    const commentId = c.req.param('id');
    const _userId = c.get('userId');
    const validated: UpdateCommentInput = updateCommentSchema.parse(await c.req.json());
    return c.json({
      data: {
        comment: { id: commentId, ...validated, edited: true, updatedAt: new Date().toISOString() },
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
          },
          422
        );
      }
      if (error.message.includes('not found')) {
        return c.json({ error: { code: 'NOT_FOUND', message: 'Comment not found' } }, 404);
      }
      if (error.message.includes('forbidden')) {
        return c.json(
          { error: { code: 'FORBIDDEN', message: 'You can only edit your own comments' } },
          403
        );
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update comment' } },
      500
    );
  }
});

// DELETE /api/comments/:id - Delete comment
comments.delete('/:id', async (c) => {
  try {
    const _commentId = c.req.param('id');
    const _userId = c.get('userId');
    return c.json({ data: { message: 'Comment deleted successfully' } });
  } catch (error) {
    console.error('Delete comment error:', error);
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return c.json({ error: { code: 'NOT_FOUND', message: 'Comment not found' } }, 404);
      }
      if (error.message.includes('forbidden')) {
        return c.json(
          { error: { code: 'FORBIDDEN', message: 'You can only delete your own comments' } },
          403
        );
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete comment' } },
      500
    );
  }
});

// POST /api/comments/:id/reactions - Add reaction
comments.post('/:id/reactions', async (c) => {
  try {
    const commentId = c.req.param('id');
    const userId = c.get('userId');
    const validated: AddReactionInput = addReactionSchema.parse(await c.req.json());
    return c.json(
      {
        data: {
          reaction: {
            id: 'placeholder',
            commentId,
            userId,
            ...validated,
            createdAt: new Date().toISOString(),
          },
        },
      },
      201
    );
  } catch (error) {
    console.error('Add reaction error:', error);
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
          },
          422
        );
      }
      if (error.message.includes('not found')) {
        return c.json({ error: { code: 'NOT_FOUND', message: 'Comment not found' } }, 404);
      }
      if (error.message.includes('already exists')) {
        return c.json(
          { error: { code: 'CONFLICT', message: 'You have already reacted with this emoji' } },
          409
        );
      }
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add reaction' } },
      500
    );
  }
});

// DELETE /api/comments/:id/reactions/:emoji - Remove reaction
comments.delete('/:id/reactions/:emoji', async (c) => {
  try {
    const _commentId = c.req.param('id');
    const _emoji = c.req.param('emoji');
    const _userId = c.get('userId');
    return c.json({ data: { message: 'Reaction removed successfully' } });
  } catch (error) {
    console.error('Remove reaction error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Reaction not found' } }, 404);
    }
    return c.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to remove reaction' } },
      500
    );
  }
});

export default comments;
